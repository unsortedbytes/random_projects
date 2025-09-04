'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FormValues {
  salary: number;
  education: number;
  looks: number;
  family: number;
  skills: number;
  location: number;
}

// Your uploaded images
const funnyImages = [
  '/images/image.png',
  '/images/ok.png'
];

export function DowryCalculator() {
  const [formValues, setFormValues] = useState<FormValues>({
    salary: 0,
    education: 0,
    looks: 0,
    family: 0,
    skills: 0,
    location: 0
  });
  
  const [showImage, setShowImage] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleInputChange = (field: keyof FormValues, value: number) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetApp = () => {
    setFormValues({
      salary: 0,
      education: 0,
      looks: 0,
      family: 0,
      skills: 0,
      location: 0
    });
    setIsCalculating(false);
    setShowImage(false);
    setCurrentImage('');
  };

  const calculateDowry = () => {
    // Validate that all fields are filled
    if (Object.values(formValues).some(val => val === 0)) {
      alert('Please fill in all fields!');
      return;
    }

    setIsCalculating(true);

    // Show random image with slow scaleFromBack animation after brief delay
    setTimeout(() => {
      const randomImage = funnyImages[Math.floor(Math.random() * funnyImages.length)];
      setCurrentImage(randomImage);
      setIsCalculating(false);
      setShowImage(true);

      // Show for 10 seconds, then reset app
      setTimeout(() => {
        resetApp();
      }, 10000);
    }, 1500);
  };

  const handleTitleClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount + 1 === 5) {
      alert('🎉 You found the easter egg! Remember: You are valuable beyond measure! 💎');
      setClickCount(0);
    }
  };



  return (
    <div className="min-h-screen premium-gradient dark:bg-gradient-to-br dark:from-dark-950 dark:via-dark-900 dark:to-dark-800 py-12 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-400 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-400 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-accent-400 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 
            className="text-5xl md:text-6xl font-display font-black text-gradient mb-4 cursor-pointer hover:scale-105 transition-all duration-500"
            onClick={handleTitleClick}
          >
            Dowry Calculator
          </h1>
        </div>

        {/* Main Card */}
        <div className="glassmorphism rounded-4xl premium-shadow p-8 md:p-12 mb-12 animate-slide-up backdrop-blur-3xl border-2 border-white/20 dark:border-gray-700/30">

          {/* Form Fields */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Salary Field */}
              <div className="group">
                <label className="block font-bold text-gray-800 dark:text-gray-200 text-lg mb-3">
                  Monthly Salary (₹)
                </label>
                <div className="relative">
                  <select
                    className="w-full p-4 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-primary-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-200/50 dark:focus:ring-primary-400/30 transition-all duration-300 appearance-none cursor-pointer group-hover:shadow-lg"
                    onChange={(e) => handleInputChange('salary', parseInt(e.target.value) || 0)}
                    value={formValues.salary || ''}
                  >
                    <option value="" className="text-gray-500">Select salary range</option>
                    <option value="20000">Below ₹20,000</option>
                    <option value="50000">₹20,000 - ₹50,000</option>
                    <option value="100000">₹50,000 - ₹1,00,000</option>
                    <option value="200000">₹1,00,000 - ₹2,00,000</option>
                    <option value="500000">Above ₹2,00,000</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Education Field */}
              <div className="group">
                <label className="block font-bold text-gray-800 dark:text-gray-200 text-lg mb-3">
                  Education Level
                </label>
                <div className="relative">
                  <select
                    className="w-full p-4 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-secondary-400 focus:border-secondary-500 focus:outline-none focus:ring-4 focus:ring-secondary-200/50 dark:focus:ring-secondary-400/30 transition-all duration-300 appearance-none cursor-pointer group-hover:shadow-lg"
                    onChange={(e) => handleInputChange('education', parseInt(e.target.value) || 0)}
                    value={formValues.education || ''}
                  >
                    <option value="" className="text-gray-500">Select education</option>
                    <option value="10">High School</option>
                    <option value="15">Graduate</option>
                    <option value="25">Post Graduate</option>
                    <option value="35">Professional Degree (Engineer/Doctor)</option>
                    <option value="50">PhD/Research</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Looks Field */}
              <div className="group">
                <label className="block font-bold text-gray-800 dark:text-gray-200 text-lg mb-3">
                  Looks Rating
                </label>
                <div className="relative">
                  <select
                    className="w-full p-4 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-accent-400 focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-200/50 dark:focus:ring-accent-400/30 transition-all duration-300 appearance-none cursor-pointer group-hover:shadow-lg"
                    onChange={(e) => handleInputChange('looks', parseInt(e.target.value) || 0)}
                    value={formValues.looks || ''}
                  >
                    <option value="" className="text-gray-500">Rate yourself</option>
                    <option value="5">Average</option>
                    <option value="10">Good Looking</option>
                    <option value="20">Very Attractive</option>
                    <option value="30">Model Material</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Family Field */}
              <div className="group">
                <label className="block font-bold text-gray-800 dark:text-gray-200 text-lg mb-3">
                  Family Background
                </label>
                <div className="relative">
                  <select
                    className="w-full p-4 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-primary-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-200/50 dark:focus:ring-primary-400/30 transition-all duration-300 appearance-none cursor-pointer group-hover:shadow-lg"
                    onChange={(e) => handleInputChange('family', parseInt(e.target.value) || 0)}
                    value={formValues.family || ''}
                  >
                    <option value="" className="text-gray-500">Select family type</option>
                    <option value="5">Middle Class</option>
                    <option value="15">Upper Middle Class</option>
                    <option value="30">Business Family</option>
                    <option value="50">High Society</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Skills Field */}
              <div className="group">
                <label className="block font-bold text-gray-800 dark:text-gray-200 text-lg mb-3">
                  Special Skills
                </label>
                <div className="relative">
                  <select
                    className="w-full p-4 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-secondary-400 focus:border-secondary-500 focus:outline-none focus:ring-4 focus:ring-secondary-200/50 dark:focus:ring-secondary-400/30 transition-all duration-300 appearance-none cursor-pointer group-hover:shadow-lg"
                    onChange={(e) => handleInputChange('skills', parseInt(e.target.value) || 0)}
                    value={formValues.skills || ''}
                  >
                    <option value="" className="text-gray-500">Select skills</option>
                    <option value="5">Basic Cooking</option>
                    <option value="10">Good Cook + Singer</option>
                    <option value="15">Multi-talented</option>
                    <option value="25">Professional Artist/Musician</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Location Field */}
              <div className="group">
                <label className="block font-bold text-gray-800 dark:text-gray-200 text-lg mb-3">
                  Location
                </label>
                <div className="relative">
                  <select
                    className="w-full p-4 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-accent-400 focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-200/50 dark:focus:ring-accent-400/30 transition-all duration-300 appearance-none cursor-pointer group-hover:shadow-lg"
                    onChange={(e) => handleInputChange('location', parseInt(e.target.value) || 0)}
                    value={formValues.location || ''}
                  >
                    <option value="" className="text-gray-500">Select city type</option>
                    <option value="5">Small Town</option>
                    <option value="10">Tier 2 City</option>
                    <option value="20">Metro City</option>
                    <option value="30">Mumbai/Delhi/Bangalore</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Calculate Button */}
            <div className="mt-12">
              <button
                onClick={calculateDowry}
                disabled={isCalculating}
                className="group relative w-full btn-premium py-6 px-8 rounded-3xl text-xl font-bold text-white overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r from-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 hover:from-primary-600 hover:via-secondary-600 hover:to-accent-600"
              >
                <div className="relative z-10 flex items-center justify-center">
                  {isCalculating ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      <span>Calculating Your Worth...</span>
                    </>
                  ) : (
                    <span>Calculate Worth</span>
                  )}
                </div>
                
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Full Screen Image Overlay - Hides all screen elements */}
      {showImage && currentImage && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
          {/* Image container with slow premium animation */}
          <div 
            className="relative"
            style={{
              animation: 'scaleFromBack 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
            }}
          >
            <Image
              src={currentImage}
              alt="Funny reaction"
              width={600}
              height={600}
              className="rounded-3xl object-cover shadow-2xl"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
