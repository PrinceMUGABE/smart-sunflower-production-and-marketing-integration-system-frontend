/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import hero from "../../assets/pictures/sunflowers1.png";
import image2 from "../../assets/pictures/sunflower2.jpg";
import image3 from "../../assets/pictures/sunflower3.png";
import image4 from "../../assets/pictures/sunflower4.jpg";
import image5 from "../../assets/pictures/sunflower5.png";
import image6 from "../../assets/pictures/sunflower6.jpeg";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const { t } = useTranslation();

  const slides = [
    {
      image: hero,
      titleKey: "hero.slide1.title",
      descriptionKey: "hero.slide1.description",
      defaultTitle: "Smart Sunflower Production Monitoring",
      defaultDescription: "Track your sunflower farms in real-time with advanced monitoring systems, soil analysis, and growth stage tracking for optimal yield management",
      buttonKey: "hero.slide1.button",
      defaultButton: "VIEW FARM DASHBOARD",
      buttonLink: "/dashboard"
    },
    {
      image: image2,
      titleKey: "hero.slide2.title",
      descriptionKey: "hero.slide2.description",
      defaultTitle: "Market Intelligence & Price Forecasting",
      defaultDescription: "Access real-time sunflower market prices, demand forecasts, and connect directly with buyers for the best selling opportunities",
      buttonKey: "hero.slide2.button",
      defaultButton: "EXPLORE MARKETS",
      buttonLink: "/marketplace"
    },
    {
      image: image3,
      titleKey: "hero.slide3.title",
      descriptionKey: "hero.slide3.description",
      defaultTitle: "Integrated Supply Chain Management",
      defaultDescription: "Streamline your sunflower production from seed to market with automated scheduling, quality control, and logistics coordination",
      buttonKey: "hero.slide3.button",
      defaultButton: "MANAGE SUPPLY CHAIN",
      buttonLink: "/supply-chain"
    },
    {
      image: image4,
      titleKey: "hero.slide4.title",
      descriptionKey: "hero.slide4.description",
      defaultTitle: "AI-Powered Crop Analytics",
      defaultDescription: "Leverage machine learning for disease detection, yield prediction, and optimal harvesting timing for maximum sunflower oil content",
      buttonKey: "hero.slide4.button",
      defaultButton: "VIEW ANALYTICS",
      buttonLink: "/analytics"
    }
  ];

  // Modified services cards to use content from slides
  const services = [
    {
      title: "Production Monitoring",
      description: "Real-time tracking of sunflower growth stages, soil moisture, and weather conditions with IoT sensors and satellite imagery",
      icon: "monitoring",
      linkText: "MONITOR FARMS",
      link: "/dashboard"
    },
    {
      title: "Market Integration",
      description: "Connect with buyers, access market prices, and manage contracts for sunflower seeds and oil products",
      icon: "market",
      linkText: "ACCESS MARKETS",
      link: "/marketplace"
    },
    {
      title: "Quality Management",
      description: "Ensure premium sunflower quality through automated testing, certification tracking, and compliance monitoring",
      icon: "quality",
      linkText: "QUALITY CONTROL",
      link: "/quality"
    }
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 8000); // Increased interval to accommodate slower transitions

    return () => clearInterval(slideInterval);
  }, [slides.length]);

  const getTranslatedContent = (key, defaultText) => {
    return t(key, { defaultValue: defaultText });
  };

  const handleButtonClick = (link) => {
    window.location.href = link;
  };

  const renderTextWithLineBreaks = (text) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  const getServiceIcon = (iconType) => {
    const iconClass = "h-5 w-5 text-white";
    
    switch(iconType) {
      case "monitoring":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "market":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case "quality":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
    }
  };

  return (
    <div className="relative">
      {/* Hero section with fullscreen background and overlay text */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Images with Overlay */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[3500ms] ease-in-out ${
              activeSlideIndex === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={getTranslatedContent(`hero.image${index + 1}.alt`, `Sunflower Farm Image ${index + 1}`)}
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute inset-0 bg-yellow-600 bg-opacity-20"></div>
          </div>
        ))}

        {/* Current Slide Content Overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center text-white px-6 max-w-4xl">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              {getTranslatedContent(slides[activeSlideIndex].titleKey, slides[activeSlideIndex].defaultTitle)}
            </h2>
            <p className="text-xl md:text-2xl mb-8 drop-shadow-lg leading-relaxed">
              {getTranslatedContent(slides[activeSlideIndex].descriptionKey, slides[activeSlideIndex].defaultDescription)}
            </p>
            <button
              onClick={() => handleButtonClick(slides[activeSlideIndex].buttonLink)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {getTranslatedContent(slides[activeSlideIndex].buttonKey, slides[activeSlideIndex].defaultButton)}
            </button>
          </div>
        </div>

        {/* Ministry and System Title - Updated for sunflower system */}
        <div className="container mx-auto relative z-10 h-full px-4 pt-20">
          <div className="grid grid-cols-12 gap-8">
            {/* Left side - Ministry Section */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3 text-white">
              <h2 className="text-4xl font-bold mb-2">
                {getTranslatedContent("hero.ministry.title", "MINAGRI")}
              </h2>
              <p className="text-sm">
                {getTranslatedContent("hero.ministry.subtitle", "Ministry of Agriculture and Animal Resources")}
              </p>
            </div>
            
            {/* Right side - System Title */}
            <div className="col-span-12 md:col-span-7 lg:col-span-6 md:col-start-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold">
                {getTranslatedContent("hero.system.title", "Smart Sunflower Production & Marketing Integration System")}
              </h1>
            </div>
          </div>

          {/* Slide Indicators - Adjusted position based on screenshot */}
          <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlideIndex(index)}
                className={`h-3 w-3 rounded-full transition-all duration-700 ease-in-out ${
                  activeSlideIndex === index 
                  ? "bg-yellow-400 scale-125" 
                  : "bg-white bg-opacity-50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* Service Cards - Updated for sunflower production */}
        <div className="absolute bottom-0 left-0 right-0 z-20 mb-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map((service, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start mb-2">
                    <div className="bg-yellow-500 p-2 rounded-lg">
                      {getServiceIcon(service.icon)}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {renderTextWithLineBreaks(service.description)}
                  </p>
                  {/* {service.linkText && (
                    <a 
                      href={service.link} 
                      className="text-yellow-600 hover:text-yellow-700 text-sm font-medium inline-flex items-center transition-colors duration-200"
                    >
                      {service.linkText}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )} */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;