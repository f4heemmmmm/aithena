"use client";
import { useEffect } from 'react';
import { Playfair_Display, Epilogue } from 'next/font/google';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';

// Initialize fonts
const playfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    display: 'swap',
});

const epilogue = Epilogue({
    subsets: ['latin'],
    weight: ['400'],
    display: 'swap',
});

// Carousel items with like counts
const carouselItems = [
    { id: 1, title: "The Evolution of Legal Tech", image: "/images/pic-1.jpg", likes: 0 },
    { id: 2, title: "Ethics in Modern Law Practice", image: "/images/pic-2.jpg", likes: 2 },
    { id: 3, title: "Future of Legal Automation", image: "/images/pic-3.jpg", likes: 0 },
    { id: 4, title: "Building Client-Centric Law Firms", image: "/images/pic-4.jpg", likes: 2 },
    { id: 5, title: "Navigating Regulatory Challenges", image: "/images/pic-5.jpg", likes: 2 },
];


export default function ThoughtPieces() {
    // Add custom styles for Swiper elements
    useEffect(() => {
        // Apply custom styles to pagination bullets
        const style = document.createElement('style');
        style.textContent = `
            .swiper-pagination-bullet {
                width: 10px;
                height: 10px;
                background: rgba(0, 0, 0, 0.2);
                opacity: 1;
                transition: all 0.3s ease;
            }
            .swiper-pagination-bullet-active {
                background: #3B82F6;
                width: 20px;
                border-radius: 5px;
            }
            .swiper-button-next, .swiper-button-prev {
                color: #3B82F6;
                background: rgba(255, 255, 255, 0.8);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .swiper-button-next:after, .swiper-button-prev:after {
                font-size: 18px;
                font-weight: bold;
            }
            .swiper-container {
                padding-bottom: 50px;
            }
            .swiper-pagination {
                bottom: 0px !important;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <section className="py-16 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 gap-4 flex flex-col">
                <h2 className={`${playfair.className} text-6xl font-thin mb-12 text-right`}>
                    Thought Pieces
                </h2>

                <div className="relative pb-16">
                    <Swiper
                        slidesPerView={1}
                        spaceBetween={20}
                        loop={true}
                        autoplay={{
                            delay: 6000,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                            el: '.swiper-custom-pagination',
                        }}
                        navigation={{
                            nextEl: '.swiper-custom-button-next',
                            prevEl: '.swiper-custom-button-prev',
                        }}
                        mousewheel={true}
                        modules={[Autoplay, Pagination, Navigation, Mousewheel]}
                        breakpoints={{
                            640: { slidesPerView: 2, spaceBetween: 20 },
                            768: { slidesPerView: 3, spaceBetween: 30 },
                            1024: { slidesPerView: 4, spaceBetween: 50 },
                        }}
                        className="mySwiper"
                    >
                        {carouselItems.map((item) => (
                            <SwiperSlide key={item.id}>
                                <div className="relative h-100 rounded-lg overflow-hidden shadow-lg group cursor-pointer transform transition-transform duration-300 hover:-translate-y-1">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                        width={400}
                                        height={300}
                                        brightness={0.8}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-80" />
                                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                                        <h3 className={`${epilogue.className} text-sm font-semibold text-white`}>
                                            {item.title}
                                        </h3>
                                        
                                        {/* Horizontal line */}
                                        <div className="w-full h-px bg-white/60 my-3"></div>
                                        
                                        {/* Heart icon and like count */}
                                        <div className="flex items-center">
                                            {item.likes > 0 ? (
                                                // Filled heart (pastel red)
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF9A9A" className="w-5 h-5 mr-1.5">
                                                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                                </svg>
                                            ) : (
                                                // Hollow heart
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-5 h-5 mr-1.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                                </svg>
                                            )}
                                            <span className={`${epilogue.className} text-sm text-white`}>
                                                {item.likes}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    
                    {/* Custom pagination element */}
                    <div className="swiper-custom-pagination flex justify-center items-center mt-8" />
                </div>
            </div>
        </section>
    );
}