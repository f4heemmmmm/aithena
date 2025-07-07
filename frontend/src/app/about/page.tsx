'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Inter, DM_Sans } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
});

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

interface AboutPageProps {}

const AboutPage: React.FC<AboutPageProps> = () => {
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [isVideoInView, setIsVideoInView] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Intersection Observer for lazy loading
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
        rootMargin: '50px',
      }
    );

    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current);
    }

    return () => {
      if (videoContainerRef.current) {
        observer.unobserve(videoContainerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (videoLoaded && videoRef.current) {
      videoRef.current.load();
    }
  }, [videoLoaded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoLoaded]);

  useEffect(() => {
    if (showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  const togglePlayPause = (): void => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((error: Error) => {
        console.error('Error playing video:', error);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = (): void => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
    console.log('Video loading started');
  };

  const handleVideoCanPlay = (): void => {
    console.log('Video can start playing');
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>): void => {
    console.error('Video error:', e);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" 
               style={{
                 backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.3) 2px, transparent 0)`
               }} />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white px-6">
          <h1 className={`${dmSans.className} text-5xl lg:text-6xl font-bold mb-6 tracking-tight`}>
            About Us
          </h1>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-8"></div>
          <p className={`${inter.className} text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-200`}>
            "From two friends with a simple question—'where has the time gone?'—to a 
            company with a mission. This is our story."
          </p>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-xl" />
      </section>

      {/* How it all began Section */}
      <section className="py-20 lg:py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className={`${dmSans.className} text-4xl lg:text-5xl font-semibold text-gray-900 mb-8`}>
            How it all began
          </h2>
          <div className="space-y-6 text-lg lg:text-xl text-gray-700 leading-relaxed">
            <p className={inter.className}>
              It started with two friends—one from law, the other from tech—asking where all the time had gone. 
              That conversation sparked something bigger: a shared mission to make legal work more intuitive, 
              more efficient, and more human.
            </p>
            <p className={`${dmSans.className} font-semibold text-xl lg:text-2xl text-gray-900`}>
              From 2, we grew to 4, then 6, then 8.
            </p>
            <p className={inter.className}>
              Now we're a team, a company, and a movement built on that same mission.
            </p>
          </div>
        </div>
      </section>

      {/* Vision and Mission Section */}
      <section className="py-20 lg:py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Our Vision */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 lg:p-10 rounded-2xl">
              <h2 className={`${dmSans.className} text-3xl lg:text-4xl font-semibold text-gray-900 mb-6`}>
                Our Vision
              </h2>
              <p className={`${inter.className} text-lg lg:text-xl text-gray-700 leading-relaxed`}>
                To give time back to those who need it most. We envision a future where legal professionals 
                no longer lose hours to manual, repetitive research. Instead, they are empowered by smart, 
                intuitive tools—designed to surface the right insights, fast. A future where lawyers can 
                focus on what truly matters: strategy, impact, and human connection.
              </p>
            </div>

            {/* Our Mission */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-10 rounded-2xl">
              <h2 className={`${dmSans.className} text-3xl lg:text-4xl font-semibold text-gray-900 mb-6`}>
                Our Mission
              </h2>
              <p className={`${inter.className} text-lg lg:text-xl text-gray-700 mb-6`}>
                We're on a mission to:
              </p>
              <ul className="space-y-4 text-lg text-gray-700 mb-8">
                <li className={`${inter.className} flex items-start`}>
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4 flex-shrink-0" />
                  Bridge the worlds of law and technology with precision and empathy
                </li>
                <li className={`${inter.className} flex items-start`}>
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4 flex-shrink-0" />
                  Reimagine legal research through intelligent search, contextual relevance, and user-first design
                </li>
                <li className={`${inter.className} flex items-start`}>
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4 flex-shrink-0" />
                  Empower lawyers and legal teams to work faster, think deeper, and act with confidence
                </li>
                <li className={`${inter.className} flex items-start`}>
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4 flex-shrink-0" />
                  Build a product that reflects real needs, informed by real people—from interns to partners
                </li>
              </ul>
              
              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <p className={`${inter.className} text-lg text-gray-700 italic leading-relaxed`}>
                  <span className="font-semibold text-gray-900">And underneath it all:</span><br/>
                  To turn back the clock on lost time—and return it to those who carry the weight of detail, 
                  deadlines, and decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 lg:py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className={`${dmSans.className} text-4xl lg:text-5xl font-semibold text-gray-900 mb-6`}>
            See Our Story
          </h2>
          <p className={`${inter.className} text-xl text-gray-600 mb-12 max-w-2xl mx-auto`}>
            Watch our journey from a simple question to a mission-driven company
          </p>
          
          <div 
            ref={videoContainerRef}
            className="relative w-full aspect-video bg-gray-200 rounded-2xl overflow-hidden shadow-2xl"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            {!isVideoInView ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                    </svg>
                  </div>
                  <p className={`${inter.className} text-gray-600`}>Loading video...</p>
                </div>
              </div>
            ) : !videoLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className={`${inter.className} text-blue-600 font-medium`}>Preparing video...</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <video 
                  ref={videoRef}
                  className="w-full h-full object-contain bg-black"
                  preload="metadata"
                  onLoadStart={handleVideoLoadStart}
                  onCanPlay={handleVideoCanPlay}
                  onError={handleVideoError}
                  onClick={togglePlayPause}
                >
                  <source src="/about-aithena.mp4" type="video/mp4" />
                  <track 
                    kind="captions" 
                    src="/videos/captions.vtt" 
                    srcLang="en" 
                    label="English captions"
                    default 
                  />
                  Your browser does not support the video tag.
                </video>
                
                {/* Custom Video Controls */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                  {/* Play/Pause Button Overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 group"
                        onClick={togglePlayPause}
                        aria-label="Play video"
                      >
                        <svg className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Bottom Controls Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="mb-4">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={togglePlayPause}
                          className="hover:scale-110 transition-transform"
                          aria-label={isPlaying ? "Pause video" : "Play video"}
                        >
                          {isPlaying ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={toggleMute}
                            className="hover:scale-110 transition-transform"
                            aria-label={isMuted ? "Unmute" : "Mute"}
                          >
                            {isMuted || volume === 0 ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            ) : volume > 0.5 ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <span className={`${inter.className} text-sm font-mono`}>
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <button 
                        type="button"
                        onClick={handleVideoReload}
                        className="hover:scale-110 transition-transform"
                        title="Reload video"
                        aria-label="Reload video"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Meet the Founders Section */}
      <section className="py-20 lg:py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`${dmSans.className} text-4xl lg:text-5xl font-semibold text-gray-900 mb-8`}>
            Meet the Founders
          </h2>
          
          <blockquote className={`${inter.className} text-2xl lg:text-3xl text-gray-700 italic mb-12 max-w-4xl mx-auto leading-relaxed`}>
            "We didn't start this to disrupt. We started it because we wanted time back—for ourselves, 
            and for the people we admire in the legal world."
          </blockquote>
          
          <div className="flex flex-wrap justify-center gap-2 text-lg lg:text-xl text-gray-600 mb-8">
            <span className={inter.className}>Aaron Tan</span>
            <span className="text-gray-400">|</span>
            <span className={inter.className}>Darrius Cheong</span>
            <span className="text-gray-400">|</span>
            <span className={inter.className}>Hariharan</span>
            <span className="text-gray-400">|</span>
            <span className={inter.className}>Issac Lee</span>
            <span className="text-gray-400">|</span>
            <span className={inter.className}>Jensen Soo</span>
            <span className="text-gray-400">|</span>
            <span className={inter.className}>Stephanie Goh</span>
          </div>
          
          <p className={`${inter.className} text-lg lg:text-xl text-gray-600 leading-relaxed`}>
            A peek into the people, purpose, and problem behind what we do.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;