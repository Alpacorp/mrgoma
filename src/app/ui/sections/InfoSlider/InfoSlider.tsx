'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

const slides = [
  {
    id: 1,
    title: 'Lease Return Tires',
    testimonial:
      "We are very excited about all the work DiviWind has done. They give their best work every time and don't let us find a single fault in the work they do.",
    buttonText: 'Lease Return Tires',
    buttonLink: '/lease-return',
    backgroundImage: '/assets/images/back-slide.jpg',
  },
  {
    id: 2,
    title: 'Quality Service',
    testimonial:
      'The team at Mr. Goma Tires provided exceptional service. Their attention to detail and commitment to quality made our experience outstanding.',
    buttonText: 'Our Services',
    buttonLink: '/services',
    backgroundImage: '/assets/images/back-slide.jpg',
  },
  {
    id: 3,
    title: 'Best Tire Deals',
    testimonial:
      "Finding affordable tires has never been easier. Mr. Goma Tires offers the best prices in town with a guarantee that can't be beat.",
    buttonText: 'View Deals',
    buttonLink: '/deals',
    backgroundImage: '/assets/images/back-slide.jpg',
  },
];

const InfoSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentSlide) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 500); // Duración de la transición
    },
    [currentSlide, isTransitioning]
  );

  // Autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % slides.length;
      goToSlide(nextSlide);
    }, 5000); // Cambiar slide cada 5 segundos

    return () => clearInterval(interval);
  }, [currentSlide, goToSlide]);

  return (
    <div className="relative w-full overflow-hidden h-80 max-w-3xl mx-auto rounded-xl my-5 shadow-lg bg-black">
      {/* Contenedor de slides con imágenes de fondo individuales */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Imagen de fondo individual para cada slide */}
            <div className="absolute inset-0">
              <Image
                src={slide.backgroundImage || '/placeholder.svg'}
                alt=""
                fill
                className="object-cover brightness-75"
                priority={index === 0}
                sizes="100vw"
              />
            </div>

            {/* Contenido del slide */}
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="max-w-xl">
                  <h2 className="text-[#9dfb40] text-4xl md:text-5xl font-bold mb-4">
                    {slide.title}
                  </h2>

                  <p className="text-white text-lg md:text-xl mb-8">{slide.testimonial}</p>

                  <Link
                    href={slide.buttonLink}
                    className="inline-block text-white text-lg font-medium py-3 px-8 rounded-full border-2 border-[#9dfb40] hover:bg-[#9dfb40] hover:text-[#272727] transition-colors duration-300"
                  >
                    {slide.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controles de navegación (puntos) */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-12 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-[#9dfb40]' : 'bg-gray-600 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default InfoSlider;
