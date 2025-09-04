'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PopupProps {
  message: string;
  onClose: () => void;
}

const funnyImages = [
  '/images/funny1.jpg',
  '/images/funny2.jpg',
  '/images/funny3.jpg',
  '/images/funny4.jpg',
  '/images/funny5.jpg',
  '/images/placeholder.svg' // Fallback placeholder
];

export function Popup({ message, onClose }: PopupProps) {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Select random image
    const randomImage = funnyImages[Math.floor(Math.random() * funnyImages.length)];
    setCurrentImage(randomImage);
    
    // Show popup with animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleImageError = () => {
    setImageError(true);
    // Fallback to placeholder if current image fails
    if (currentImage !== '/images/placeholder.svg') {
      setCurrentImage('/images/placeholder.svg');
    }
  };

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyPress}
      tabIndex={-1}
    >
      <div
        className={`bg-white rounded-2xl p-8 max-w-md mx-4 text-center relative shadow-2xl transform transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-6 text-gray-400 hover:text-red-500 text-3xl font-light transition-colors duration-200"
          aria-label="Close popup"
        >
          ×
        </button>

        {/* Image section */}
        <div className="mb-6">
          <div className="relative w-48 h-48 mx-auto mb-4">
            {currentImage && (
              <Image
                src={currentImage}
                alt="Funny reaction"
                fill
                className="object-cover rounded-xl border-3 border-gray-200"
                onError={handleImageError}
                priority
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Reality Check! 😄
          </h3>
          
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            {message}
          </p>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <p className="text-gray-700 text-base leading-relaxed">
              Remember: Your worth isn't measured in money! The dowry system is outdated and harmful. You are valuable just as you are! 💖
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Got it! 👍
          </button>
        </div>
      </div>
    </div>
  );
}
