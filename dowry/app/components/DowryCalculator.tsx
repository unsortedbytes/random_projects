'use client';

import { useState, useEffect } from 'react';
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
  '/images/1000101700.jpg',
  '/images/gali.png', 
  '/images/new_snake_kd.jpg',
  '/images/snake_ayush.png',
  '/images/th.jpg'
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

  const calculateDowry = () => {
    // Validate that all fields are filled
    if (Object.values(formValues).some(val => val === 0)) {
      alert('Please fill in all fields!');
      return;
    }

    setIsCalculating(true);

    // Show random image with scale animation after a brief delay
    setTimeout(() => {
      const randomImage = funnyImages[Math.floor(Math.random() * funnyImages.length)];
      setCurrentImage(randomImage);
      setIsCalculating(false);
      setShowImage(true);
      
      // Hide image after 3 seconds
      setTimeout(() => {
        setShowImage(false);
      }, 3000);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8">
          <h1 
            className="text-4xl font-bold text-gray-700 text-center mb-4 cursor-pointer hover:scale-105 transition-transform"
            onClick={handleTitleClick}
          >
            🎭 Dowry Calculator
          </h1>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded">
            <p className="text-red-700 text-sm italic text-center">
              *This is purely satirical and for entertainment purposes only. We strongly oppose the dowry system.*
            </p>
          </div>

          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700 text-lg">
                  Monthly Salary (₹):
                </label>
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-base bg-white hover:border-purple-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                  onChange={(e) => handleInputChange('salary', parseInt(e.target.value) || 0)}
                  value={formValues.salary || ''}
                >
                  <option value="">Select salary range</option>
                  <option value="20000">Below ₹20,000</option>
                  <option value="50000">₹20,000 - ₹50,000</option>
                  <option value="100000">₹50,000 - ₹1,00,000</option>
                  <option value="200000">₹1,00,000 - ₹2,00,000</option>
                  <option value="500000">Above ₹2,00,000</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-gray-700 text-lg">
                  Education Level:
                </label>
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-base bg-white hover:border-purple-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                  onChange={(e) => handleInputChange('education', parseInt(e.target.value) || 0)}
                  value={formValues.education || ''}
                >
                  <option value="">Select education</option>
                  <option value="10">High School</option>
                  <option value="15">Graduate</option>
                  <option value="25">Post Graduate</option>
                  <option value="35">Professional Degree (Engineer/Doctor)</option>
                  <option value="50">PhD/Research</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-gray-700 text-lg">
                  Looks Rating:
                </label>
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-base bg-white hover:border-purple-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                  onChange={(e) => handleInputChange('looks', parseInt(e.target.value) || 0)}
                  value={formValues.looks || ''}
                >
                  <option value="">Rate yourself</option>
                  <option value="5">Average</option>
                  <option value="10">Good Looking</option>
                  <option value="20">Very Attractive</option>
                  <option value="30">Model Material</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-gray-700 text-lg">
                  Family Background:
                </label>
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-base bg-white hover:border-purple-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                  onChange={(e) => handleInputChange('family', parseInt(e.target.value) || 0)}
                  value={formValues.family || ''}
                >
                  <option value="">Select family type</option>
                  <option value="5">Middle Class</option>
                  <option value="15">Upper Middle Class</option>
                  <option value="30">Business Family</option>
                  <option value="50">High Society</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-gray-700 text-lg">
                  Special Skills:
                </label>
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-base bg-white hover:border-purple-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                  onChange={(e) => handleInputChange('skills', parseInt(e.target.value) || 0)}
                  value={formValues.skills || ''}
                >
                  <option value="">Select skills</option>
                  <option value="5">Basic Cooking</option>
                  <option value="10">Good Cook + Singer</option>
                  <option value="15">Multi-talented</option>
                  <option value="25">Professional Artist/Musician</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-gray-700 text-lg">
                  Location:
                </label>
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-base bg-white hover:border-purple-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                  onChange={(e) => handleInputChange('location', parseInt(e.target.value) || 0)}
                  value={formValues.location || ''}
                >
                  <option value="">Select city type</option>
                  <option value="5">Small Town</option>
                  <option value="10">Tier 2 City</option>
                  <option value="20">Metro City</option>
                  <option value="30">Mumbai/Delhi/Bangalore</option>
                </select>
              </div>
            </div>

            <button
              onClick={calculateDowry}
              disabled={isCalculating}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold py-4 px-8 rounded-full text-xl hover:from-pink-600 hover:to-red-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isCalculating ? (
                <span className="flex items-center justify-center">
                  Calculating... 
                  <div className="ml-3 animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </span>
              ) : (
                'Calculate My Worth! 💰'
              )}
            </button>

          </div>
        </div>

        <footer className="text-center text-white/80 text-sm">
          <p>Made with ❤️ for awareness | This calculator is meant to highlight the absurdity of the dowry system</p>
        </footer>
      </div>

      {/* Image Animation Display */}
      {showImage && currentImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div 
            className="animate-bounce"
            style={{
              animation: 'scaleUp 0.6s ease-out forwards'
            }}
          >
            <Image
              src={currentImage}
              alt="Funny reaction"
              width={400}
              height={400}
              className="rounded-2xl shadow-2xl object-cover"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
