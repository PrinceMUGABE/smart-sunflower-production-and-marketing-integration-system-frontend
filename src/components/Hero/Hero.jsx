/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import hero from "../../assets/pictures/drivering1.png";
import image2 from "../../assets/pictures/driving2.jpg";
import image3 from "../../assets/pictures/driving3.jpg";

const Hero = () => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeContentIndex, setActiveContentIndex] = useState(0);
  
  const images = [hero, image2, image3];
  
  const contentSlides = [
    {
      title: "Route Optimization with Real-Time Analysis",
      description: "Our Relocation Optimization and Prediction System analyzes historical and real-time traffic data to optimize routes for movers, reducing travel time and fuel costs while dynamically adjusting to road conditions."
    },
    {
      title: "Predictive Analytics for Smart Planning",
      description: "Leverage our advanced analytics to predict seasonal demand patterns and analyze customer behaviors, allowing for more efficient resource allocation and improved service delivery for your relocation needs."
    },
    {
      title: "Data-Driven Customer Experience",
      description: "Benefit from personalized service recommendations based on your preferences and needs. Our system continuously analyzes feedback to enhance your relocation experience and ensure maximum satisfaction."
    }
  ];

  useEffect(() => {
    const imageInterval = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    
    const contentInterval = setInterval(() => {
      setActiveContentIndex((prevIndex) => (prevIndex + 1) % contentSlides.length);
    }, 3000);
    
    return () => {
      clearInterval(imageInterval);
      clearInterval(contentInterval);
    };
  }, [images.length, contentSlides.length]);

  const handleGetQuote = () => {
    window.location.href = "/quote";
  };

  return (
    <div className="bg-white relative overflow-hidden pt-40">
      {/* Main content container */}
      <div className="relative z-20 flex flex-col md:flex-row">
        {/* Left side - Image slider */}
        <div className="w-full md:w-1/2 h-[400px] md:h-[500px] relative overflow-hidden">
          {images.map((img, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                activeImageIndex === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <img 
                src={img} 
                alt={`Slide ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        
        {/* Right side - Content slider */}
        <div className="w-full md:w-1/2 bg-gray-900 text-white p-4 flex flex-col justify-center relative z-20 min-h-[400px]">
          {contentSlides.map((slide, index) => (
            <div 
              key={index}
              className={`transition-opacity duration-1000 absolute inset-0 p-8 flex flex-col justify-center ${
                activeContentIndex === index ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                {slide.title}
              </h2>
              <p className="text-sm md:text-base mb-6">
                {slide.description}
              </p>
              <div className="flex gap-4">
                <button className="border border-white text-white py-2 px-4 rounded hover:bg-white hover:text-gray-900 transition">
                  VIEW DASHBOARD
                </button>
                <button 
                  onClick={handleGetQuote}
                  className="bg-white text-gray-900 py-2 px-4 rounded hover:bg-gray-200 transition"
                >
                  GET RELOCATION ESTIMATE
                </button>
              </div>
            </div>
          ))}
          
          {/* Dots navigation */}
          <div className="flex justify-center mt-auto gap-2 relative z-30">
            {contentSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveContentIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  activeContentIndex === index ? "bg-white" : "bg-gray-500"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom section with company information */}
      <div className="text-center py-8 px-4 max-w-4xl mx-auto pt-8">
        <h3 className="text-2xl font-bold text-red-700">
          RELOCATION OPTIMIZATION AND PREDICTION SYSTEM
        </h3>
        <p className="text-gray-700 mt-4">
          "Revolutionizing the relocation industry through intelligent data analytics and predictive algorithms that enhance operational efficiency and customer satisfaction"
        </p>
        <p className="text-gray-700 mt-2">
          "We provide <span className="text-red-700">data-driven relocation solutions</span> and <span className="text-red-700">resource optimization</span>."
        </p>
        <p className="text-red-700 font-semibold mt-4 flex items-center justify-center">
          <span className="text-4xl mr-2">"</span>
          Making informed decisions for efficient relocations nationwide
          <span className="text-4xl ml-2">"</span>
        </p>
      </div>
    </div>
  );
};

export default Hero;