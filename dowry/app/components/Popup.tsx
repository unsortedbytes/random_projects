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
  }, [handleClose]);

  return (
    <div
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyPress}
      tabIndex={-1}
    >
      {/* Premium Modal Container */}
      <div
        className={`relative glassmorphism rounded-4xl p-8 md:p-12 max-w-lg mx-4 text-center premium-shadow border-2 border-white/20 dark:border-gray-700/30 transform transition-all duration-500 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'
        }`}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-500/10 rounded-4xl"></div>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 z-10 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
          aria-label="Close popup"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-4xl">
          <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-8 right-12 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-8 left-8 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-4 right-6 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="relative z-10">
          {/* Hero Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg glow-shadow animate-pulse-gentle">
              <span className="text-4xl">🎭</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-display font-black text-gradient mb-4 animate-bounce-gentle">
            Reality Check!
          </h2>
          
          <div className="flex items-center justify-center mb-6">
            <span className="text-6xl animate-bounce" style={{ animationDelay: '0.1s' }}>😂</span>
            <span className="text-6xl animate-bounce mx-2" style={{ animationDelay: '0.2s' }}>😄</span>
            <span className="text-6xl animate-bounce" style={{ animationDelay: '0.3s' }}>🤣</span>
          </div>

          {/* Image section */}
          {currentImage && (
            <div className="mb-8">
              <div className="relative w-56 h-56 mx-auto mb-4 group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-3xl animate-pulse opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <Image
                  src={currentImage}
                  alt="Funny reaction"
                  fill
                  className="object-cover rounded-3xl border-4 border-white/50 dark:border-gray-700/50 shadow-xl relative z-10 transform group-hover:scale-105 transition-transform duration-300"
                  onError={handleImageError}
                  priority
                />
              </div>
            </div>
          )}

          {/* Message */}
          <div className="mb-8">
            <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
              {message}
            </p>
          </div>
          
          {/* Awareness Message */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-400/20 dark:to-blue-400/20 border border-green-500/30 dark:border-green-400/40 rounded-3xl p-6 mb-8">
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">💎</span>
              </div>
              <h4 className="text-lg font-bold text-green-700 dark:text-green-400">Remember Your Worth</h4>
            </div>
            <p className="text-green-700 dark:text-green-300 leading-relaxed font-medium">
              Your value isn&apos;t measured in money! The dowry system is outdated and harmful. You are precious just as you are! ✨
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleClose}
              className="group relative w-full btn-premium py-4 px-8 rounded-3xl text-lg font-bold text-white overflow-hidden transform transition-all duration-500 hover:scale-[1.02] bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 shadow-lg hover:shadow-2xl"
            >
              <div className="relative z-10 flex items-center justify-center">
                <span className="mr-3 text-2xl group-hover:animate-bounce">👍</span>
                <span>Got it! I&apos;m Valuable!</span>
                <span className="ml-3 text-2xl group-hover:animate-bounce">✨</span>
              </div>
              
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
            </button>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Press ESC or click outside to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
