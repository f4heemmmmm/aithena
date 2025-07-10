"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Inter, DM_Sans } from "next/font/google";
import React, { useState, useEffect, useRef } from "react";

const inter = Inter({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

interface AboutPageProps {}

const AboutPage: React.FC<AboutPageProps> = () => {
    // Video control states
    const [volume, setVolume] = useState<number>(1);
    const [duration, setDuration] = useState<number>(0);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [bufferedTime, setBufferedTime] = useState<number>(0);
    const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
    const [showControls, setShowControls] = useState<boolean>(false);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
    const [isVideoInView, setIsVideoInView] = useState<boolean>(false);
    const [isVideoFocused, setIsVideoFocused] = useState<boolean>(false);

    // useRef()
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const videoContainerRef = useRef<HTMLDivElement | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Intersection observer during lazy loading of video
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries: IntersectionObserverEntry[]) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    setIsVideoInView(true);
                    setTimeout(() => {
                        setVideoLoaded(true);
                    }, 300);
                }
            },
            {
                threshold: 0.1,
                rootMargin: "50px",
            }
        );

        if (videoContainerRef.current) {
            observer.observe(videoContainerRef.current);
        }

        return () => {
            if (videoContainerRef.current) {
                observer.unobserve(videoContainerRef.current);
            }
        }
    }, []);

    // Keyboard event listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (!isVideoFocused || !videoRef.current) {
                return;
            }

            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    skipTime(-10);
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    skipTime(10);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    adjustVolume(0.1);
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    adjustVolume(-0.1);
                    break;
                case "KeyM":
                    e.preventDefault();
                    toggleMute();
                    break;
                case "KeyF":
                    e.preventDefault();
                    toggleFullScreen();
                    break;
                case "Digit0":
                case "Digit1":
                case "Digit2":
                case "Digit3":
                case "Digit4":
                case "Digit5":
                case "Digit6":
                case "Digit7":
                case "Digit8":
                case "Digit9":
                e.preventDefault();
                const percentage = parseInt(e.code.slice(-1)) / 10;
                seekToPercentage(percentage);
                break;
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isVideoFocused]);

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = (): void => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        if (videoLoaded && videoRef.current) {
            videoRef.current.load();
        }
    }, [videoLoaded]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) {
            return;
        };
    
        const updateTime = (): void => setCurrentTime(video.currentTime);
        const updateDuration = (): void => setDuration(video.duration);
        const updateBuffered = (): void => {
            if (video.buffered.length > 0) {
                setBufferedTime(video.buffered.end(video.buffered.length - 1));
            }
        };
        
        const handlePlay = (): void => setIsPlaying(true);
        const handlePause = (): void => setIsPlaying(false);
        const handleEnded = (): void => setIsPlaying(false);
        const handleVolumeChange = (): void => {
            setVolume(video.volume);
            setIsMuted(video.muted);
        };
    
        video.addEventListener("timeupdate", updateTime);
        video.addEventListener("loadedmetadata", updateDuration);
        video.addEventListener("progress", updateBuffered);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("ended", handleEnded);
        video.addEventListener("volumechange", handleVolumeChange);
    
        return () => {
            video.removeEventListener("timeupdate", updateTime);
            video.removeEventListener("loadedmetadata", updateDuration);
            video.removeEventListener("progress", updateBuffered);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("ended", handleEnded);
            video.removeEventListener("volumechange", handleVolumeChange);
        };
    }, [videoLoaded]);

    useEffect(() => {
        if (showControls) {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            controlsTimeoutRef.current = setTimeout(() => {
                if (isPlaying) {
                    setShowControls(false);
                }
            }, 3000);
        }
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [showControls, isPlaying]);

    const togglePlayPause = (): void => {
        const video = videoRef.current;
        if (!video) {
            return;
        }
        if (isPlaying) {
            video.pause();
        } else {
            video.play().catch((error: Error) => {
                console.error("Error playing video:", error);
            });
        }
    };

    const skipTime = (seconds: number): void => {
        const video = videoRef.current;
        if (!video) {
            return;
        }
        const newTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
        video.currentTime = newTime;
        setCurrentTime(newTime);
        showControlsTemporarily();
    };

    const adjustVolume = (delta: number): void => {
        const video = videoRef.current;
        if (!video) {
            return;
        }
        const newVolume = Math.max(0, Math.min(1, volume + delta));
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        showControlsTemporarily();
    };

    const seekToPercentage = (percentage: number): void => {
        const video = videoRef.current;
        if (!video) {
            return;
        }
        const newTime = duration * percentage;
        video.currentTime = newTime;
        setCurrentTime(newTime);
        showControlsTemporarily();
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const video = videoRef.current;
        if (!video) {
            return;
        }
        const newTime = parseFloat(e.target.value);
        video.currentTime = newTime;
        setCurrentTime(newTime);
    };
    
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const video = videoRef.current;
        if (!video) {
            return;
        }
        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = (): void => {
        const video = videoRef.current;
        if (!video) {
            return;
        }
        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    const toggleFullScreen = (): void => {
        if (!videoContainerRef.current) {
            return;
        }
        if (!document.fullscreenElement) {
            videoContainerRef.current.requestFullscreen().catch((error: Error) => {
                console.error("Error entering fullscreen:", error);
            });
        } else {
            document.exitFullscreen().catch((error: Error) => {
                console.error("Error exiting fullscreen:", error);
            });
        };
    };

    const showControlsTemporarily = (): void => {
        setShowControls(true);
    };

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleMouseEnter = (): void => {
        setShowControls(true);
    };

    const handleMouseLeave = (): void => {
        if (!isPlaying) {
            setShowControls(false);
        }
    };

    const handleMouseMove = (): void => {
        setShowControls(true);
    };

    const handleVideoClick = (e: React.MouseEvent): void => {
        if ((e.target as HTMLElement).closest(".video-controls")) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        togglePlayPause();
    };

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        const target = e.target as HTMLElement;
        if (target.closest(".video-controls") || target.tagName === "BUTTON" || target.tagName === "INPUT") {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        togglePlayPause();
    };
    
    const handleVideoFocus = (): void => {
        setIsVideoFocused(true);
    };
    
    const handleVideoBlur = (): void => {
        setIsVideoFocused(false);
    };
    
    const handleVideoReload = (): void => {
        setVideoLoaded(false);
        setIsVideoInView(false);
        setTimeout(() => {
            setIsVideoInView(true);
            setTimeout(() => {
                setVideoLoaded(true);
            }, 300);
        }, 100);
    };

    const handleVideoLoadStart = (): void => {
        console.log("Video loading started");
    };
    
    const handleVideoCanPlay = (): void => {
        console.log("Video can start playing");
      };
    
    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>): void => {
        console.error("Video error:", e);
    };
    
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (!videoRef.current) {
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = duration * percentage;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    return (
        <div className = "min-h-screen bg-white">
            
            <section className = "relative py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
                <div className = "absolute inset-0 opacity-10">
                    <div className = "absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.3) 2px, transparent 0)`}} />
                </div>

                <div className = "relative z-10 max-w-4xl mx-auto text-center text-white px-6">
                    <h1 className = {`${dmSans.className} text-5xl lg:text-6xl font-bold mb-6 tracking-tight`}>
                        About Us
                    </h1>
                    <div className = "w-24 h-1 bg-blue-400 mx-auto mb-8" />
                    <p className = {`${inter.className} text-xl lg:text-2xl max-w-6xl mx-auto leading-relaxed text-gray-200`}>
                        "From two friends with a simple question - 'Where has the time gone?' - to a 
                        company with a mission. This is our story."
                    </p>
                </div>

                <div className = "absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />
                <div className = "absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-xl" />
            </section>

            <section className = "py-20 lg:py-24 px-6 bg-gray-50">
                <div className = "max-w-4xl mx-auto">
                    <h2 className = {`${dmSans.className} text-4xl lg:text-5xl font-semibold text-gray-900 mb-8`}>
                        How it all began...
                    </h2>
                    <div className = "space-y-6 text-xl lg:text-2xl text-gray-700 leading-relaxed">
                        <p className = {inter.className}>
                            It started with two friends - one from law, the other from tech — asking where all the time had gone. 
                            That conversation sparked something bigger: a shared mission to make legal work <br /><em> more intuitive, </em> 
                            <br /> <em> more efficient, </em><br /> <em> more human. </em>
                        </p>
                        <p className = {`${dmSans.className} font-semibold text-xl lg:text-2xl text-gray-900`}>
                            From 2, we grew to 4, then 6, then 8.
                        </p>
                        <p className = {inter.className}>
                            Now we're a team, a company, and a movement built on that same mission.
                        </p>
                    </div>
                </div>
            </section>

            <section className = "py-20 lg:py-24 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className = "max-w-7xl mx-auto">
                    <div className = "grid md:grid-cols-2 gap-20 lg:gap-32">
                        {/* VISION */}
                        <div className = "relative">
                            <div className = "absolute -top-20 -left-12 text-blue-200 opacity-60 pointer-events-none">
                                <svg className = "w-24 h-24 lg:w-32 lg:h-32" fill = "currentColor" viewBox = "0 0 24 24">
                                    <path d = "M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                                </svg>
                            </div>
                        
                            <div className = "relative z-10">
                                <h2 className = {`${dmSans.className} text-5xl lg:text-6xl font-bold text-gray-900 mb-8`}>
                                    Our Vision
                                </h2>
                                <div className = "flex flex-col gap-5">
                                    <p className = {`${inter.className} text-lg lg:text-xl text-gray-700 leading-relaxed`}>
                                        To give time back to those who need it most.
                                    </p>
                                    <p className = {`${inter.className} text-lg lg:text-xl text-gray-700 leading-relaxed`}>
                                        We envision a future where legal professionals no longer lose hours to manual, repetitive research.
                                    </p>
                                    <p className = {`${inter.className} text-lg lg:text-xl text-gray-700 leading-relaxed`}>
                                        Instead, they are empowered by smart, intuitive tools - designed to surface the right insights, fast.
                                    </p>
                                    <p className = {`${inter.className} text-lg lg:text-xl text-gray-700 leading-relaxed`}>
                                        A future where lawyers can focus on what truly matters: strategy, impact, and human connection.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* MISSION */}
                        <div className = "relative">
                            <div className = "absolute -top-16 -left-16 text-indigo-200 opacity-60 pointer-events-none">
                                <svg className = "w-24 h-24 lg:w-32 lg:h-32" fill = "currentColor" viewBox = "0 0 24 24">
                                    <path d = "M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.57-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-4v-10h10z" />
                                </svg>
                            </div>
                            
                            <div className = "relative z-10">
                                <h2 className = {`${dmSans.className} text-5xl lg:text-6xl font-bold text-gray-900 mb-8`}>
                                    Our Mission
                                </h2>
                                <p className = {`${inter.className} text-lg lg:text-xl text-gray-700 mb-8`}>
                                    We're on a mission to:
                                </p>
                                
                                <div className = "space-y-6 mb-8">
                                    {[
                                        "Bridge the worlds of law and technology with precision and empathy",
                                        "Reimagine legal research through intelligent search, contextual relevance, and user-first design",
                                        "Empower lawyers and legal teams to work faster, think deeper, and act with confidence",
                                        "Build a product that reflects real needs, informed by real people - from interns to partners"
                                    ].map((item, index) => (
                                        <div key = {index} className = {`${inter.className} flex items-start group`}>
                                            <div className = "flex-shrink-0 mr-6 mt-1">
                                                <svg className = "w-6 h-6 text-indigo-600 group-hover:text-indigo-700 transition-colors duration-300" fill = "currentColor" viewBox = "0 0 24 24">
                                                    <path d = "M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" />
                                                </svg>
                                            </div>
                                            <div className = "flex-1">
                                                <p className = "text-xl text-gray-700 leading-relaxed">
                                                    {item}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className = "pt-10 border-t border-gray-100">
                                    <div className = "text-left">
                                        <p className = {`${inter.className} text-lg lg:text-xl text-gray-700 leading-relaxed max-w-3xl font-semibold mx-auto mb-3`}>
                                            And underneath it all,
                                        </p>
                                        <p className = {`${inter.className} text-lg lg:text-xl text-gray-700 italic leading-relaxed max-w-3xl mx-auto`}>
                                            <em> To turn back the clock on lost time - and return it to those who carry the weight of detail, deadlines, and decisions. </em>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className = "py-20 lg:py-24 px-6 bg-white">
                <div className = "max-w-6xl mx-auto text-center">
                    <h2 className = {`${dmSans.className} text-4xl lg:text-5xl font-semibold text-gray-900 mb-8`}>
                        Meet the Founders
                    </h2>
                    
                    <blockquote className = {`${inter.className} text-xl lg:text-2xl text-gray-700 italic mb-12 max-w-6xl mx-auto leading-relaxed`}>
                        "We didn't start this to disrupt. We started it because we wanted time back - for ourselves, and for the people we admire in the legal world."
                    </blockquote>
                
                    <div className = "flex flex-wrap justify-center gap-2 text-lg lg:text-xl text-gray-700 mb-8">
                        <span className = {inter.className}> Aaron Tan </span>
                        <span className = "text-gray-700 font-light"> | </span>
                        <span className = {inter.className}> Darrius Cheong </span>
                        <span className = "text-gray-700 font-light"> | </span>
                        <span className = {inter.className}> Hariharan </span>
                        <span className = "text-gray-700 font-light"> | </span>
                        <span className = {inter.className}> Issac Lee </span>
                        <span className = "text-gray-700 font-light"> | </span>
                        <span className = {inter.className}> Jensen Soo </span>
                        <span className = "text-gray-700 font-light"> | </span>
                        <span className = {inter.className}> Stephanie Goh </span>
                    </div>
                
                    <p className = {`${inter.className} text-lg lg:text-xl text-gray-600 leading-relaxed`}>
                        A peek into the people, purpose, and problem behind what we do.
                    </p>
                </div>
            </section>

            <section className = "pb-12 lg:pb-20 px-6 bg-white">
                <div className = "max-w-5xl mx-auto text-center">
                    <div 
                        ref = {videoContainerRef}
                        className = {`relative w-full aspect-video bg-gray-200 rounded-2xl overflow-hidden shadow-2xl ${
                            isFullScreen ? "fixed inset-0 z-50 rounded-none" : ""
                        }`}
                        onMouseEnter = {handleMouseEnter}
                        onMouseLeave = {handleMouseLeave}
                        onMouseMove = {handleMouseMove}
                        tabIndex = {0}
                        onFocus = {handleVideoFocus}
                        onBlur = {handleVideoBlur}
                        role = "application"
                        aria-label = "Video player"
                    >
                        {!isVideoInView ? (
                            <div className = "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
                                <div className = "text-center">
                                    <div className = "w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                        <svg className = "w-8 h-8 text-white ml-1" fill = "currentColor" viewBox = "0 0 20 20">
                                            <path d = "M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                    </div>
                                    <p className = {`${inter.className} text-gray-600`}> Loading video... </p>
                                </div>
                            </div>
                        ) : !videoLoaded ? (
                            <div className = "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                <div className = "text-center">
                                    <div className = "w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className = {`${inter.className} text-blue-600 font-medium`}> Preparing video... </p>
                                </div>
                            </div>
                        ) : (
                            <div 
                                className = "relative w-full h-full cursor-pointer"
                                onClick = {handleContainerClick}
                            >
                            <video 
                                ref = {videoRef}
                                className = "w-full h-full object-contain bg-black pointer-events-none"
                                preload = "metadata"
                                onLoadStart = {handleVideoLoadStart}
                                onCanPlay = {handleVideoCanPlay}
                                onError = {handleVideoError}
                                tabIndex = {-1}
                                aria-label = "Video content"
                            >
                                <source src = "/about-aithena.mp4" type = "video/mp4" />
                                <track 
                                    kind = "captions" 
                                    src = "/videos/captions.vtt" 
                                    srcLang = "en" 
                                    label = "English captions"
                                    default 
                                />
                                Your browser does not support the video tag.
                            </video>
                        
                            <div className = {`absolute inset-0 transition-opacity duration-300 ${
                                showControls || !isPlaying ? "opacity-100" : "opacity-0"
                            }`}>

                                {!isPlaying && (
                                <div className = "absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className = "w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group pointer-events-auto">
                                        <svg className = "w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" fill = "currentColor" viewBox = "0 0 20 20">
                                            <path d = "M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                    </div>
                                </div>
                                )}

                                <div className = "absolute inset-0 flex items-center justify-between px-16 pointer-events-none">
                                    <div className = "text-white opacity-0 transition-opacity duration-200" id = "skip-back">
                                        <svg className = "w-12 h-12" fill = "currentColor" viewBox = "0 0 24 24">
                                            <path d = "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1.5-8.5L14 8l-3.5 3.5L14 15l-3.5-3.5z" />
                                        </svg>
                                    </div>
                                    <div className = "text-white opacity-0 transition-opacity duration-200" id = "skip-forward">
                                        <svg className = "w-12 h-12" fill = "currentColor" viewBox = "0 0 24 24">
                                            <path d = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1.5-8.5L14 8l-3.5 3.5L14 15l-3.5-3.5z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className = "absolute bottom-0 left-0 right-0 p-4 video-controls pointer-events-auto" onClick = {(e) => e.stopPropagation()}>
                                    <div className = "mb-4 relative">
                                        <div 
                                            className = "relative w-full h-2 bg-white/30 rounded-lg cursor-pointer"
                                            onClick = {handleProgressClick}
                                            role = "slider"
                                            aria-label = "Video progress"
                                            tabIndex = {0}
                                        >
                                            <div 
                                                className = "absolute top-0 left-0 h-full bg-white/50 rounded-lg"
                                                style = {{ width: `${(bufferedTime / duration) * 100}%` }}
                                            />
                                            <div 
                                                className = "absolute top-0 left-0 h-full bg-blue-500 rounded-lg"
                                                style={{ width: `${(currentTime / duration) * 100}%` }}
                                            />
                                            <div 
                                                className = "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                                                style = {{ left: `${(currentTime / duration) * 100}%`, transform: "translateX(-50%) translateY(-50%)" }}
                                            />
                                        </div>

                                        <input
                                            type = "range"
                                            min = "0"
                                            max = {duration || 0}
                                            value = {currentTime}
                                            onChange = {handleSeek}
                                            className = "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            aria-label = "Video progress slider"
                                        />
                                    </div>

                                    <div className = "flex items-center justify-between text-white">
                                        <div className = "flex items-center space-x-4">
                                            <button
                                                type = "button"
                                                onClick = {togglePlayPause}
                                                className = "hover:scale-110 transition-transform"
                                                aria-label = {isPlaying ? "Pause video" : "Play video"}
                                            >
                                                {isPlaying ? (
                                                    <svg className = "w-6 h-6" fill = "currentColor" viewBox = "0 0 20 20">
                                                        <path fillRule = "evenodd" d = "M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule = "evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className = "w-6 h-6" fill = "currentColor" viewBox = "0 0 20 20">
                                                        <path fillRule = "evenodd" d = "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule = "evenodd" />
                                                    </svg>
                                                )}
                                            </button>

                                            <button
                                                type = "button"
                                                onClick = {() => skipTime(-10)}
                                                className = "hover:scale-110 transition-transform"
                                                aria-label = "Skip back 10 seconds"
                                            >
                                                <ArrowLeft className = "w-3 h-3" />
                                                <span className = "sr-only"> -10 </span>
                                            </button>

                                            <button
                                                type = "button"
                                                onClick = {() => skipTime(10)}
                                                className = "hover:scale-110 transition-transform"
                                                aria-label = "Skip forward 10 seconds"
                                            >
                                                <ArrowRight className = "w-3 h-3" />
                                                <span className = "sr-only"> +10 </span>
                                            </button>

                                            <div className = "flex items-center space-x-2">
                                                <button
                                                    type = "button"
                                                    onClick = {toggleMute}
                                                    className = "hover:scale-110 transition-transform"
                                                    aria-label = {isMuted ? "Unmute" : "Mute"}
                                                >
                                                    {isMuted || volume === 0 ? (
                                                        <svg className = "w-5 h-5" fill = "currentColor" viewBox = "0 0 20 20">
                                                            <path fillRule = "evenodd" d = "M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : volume > 0.5 ? (
                                                        <svg className = "w-5 h-5" fill = "currentColor" viewBox = "0 0 20 20">
                                                            <path fillRule = "evenodd" d = "M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className = "w-5 h-5" fill = "currentColor" viewBox = "0 0 20 20">
                                                            <path fillRule = "evenodd" d = "M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <input
                                                    type = "range"
                                                    min = "0"
                                                    max = "1"
                                                    step = "0.1"
                                                    value = {isMuted ? 0 : volume}
                                                    onChange = {handleVolumeChange}
                                                    className = "w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer volume-slider"
                                                    aria-label = "Volume control"
                                                />
                                            </div>

                                            <span className = {`${inter.className} text-sm font-mono`}>
                                                {formatTime(currentTime)} / {formatTime(duration)}
                                            </span>
                                        </div>

                                        <div className = "flex items-center space-x-4">
                                            <button
                                                type = "button"
                                                onClick = {toggleFullScreen}
                                                className = "hover:scale-110 transition-transform"
                                                aria-label = {isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                                            >
                                                {isFullScreen ? (
                                                    <svg className = "w-5 h-5" fill = "none" stroke="currentColor" viewBox = "0 0 24 24">
                                                        <path strokeLinecap = "round" strokeLinejoin = "round" strokeWidth = {2} d = "M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                ) : (
                                                    <svg className = "w-5 h-5" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24">
                                                        <path strokeLinecap = "round" strokeLinejoin = "round" strokeWidth = {2} d = "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                    </svg>
                                                )}
                                            </button>

                                            <button 
                                                type = "button"
                                                onClick = {handleVideoReload}
                                                className = "hover:scale-110 transition-transform"
                                                title = "Reload video"
                                                aria-label = "Reload video"
                                            >
                                                <svg className = "w-5 h-5" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24">
                                                    <path strokeLinecap = "round" strokeLinejoin = "round" strokeWidth = {2} d = "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isVideoFocused && (
                        <div className = "absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white text-xs opacity-0 hover:opacity-100 transition-opacity">
                            <div className = "space-y-1">
                                <div> Space: Play/Pause </div>
                                <div> ←/→: Skip 10s </div>
                                <div> ↑/↓: Volume </div>
                                <div> M: Mute </div>
                                <div> F: Fullscreen </div>
                                <div> 0-9: Jump to % </div>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;