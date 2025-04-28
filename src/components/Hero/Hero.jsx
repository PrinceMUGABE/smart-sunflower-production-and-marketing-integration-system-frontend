/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import hero from "../../assets/pictures/climate1.jpg";
import image2 from "../../assets/pictures/chills.jpg";
import image3 from "../../assets/pictures/Sorghum-1.jpg";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const { t } = useTranslation();

  const slides = [
    {
      image: hero,
      titleKey: "hero.slide1.title",
      descriptionKey: "hero.slide1.description",
      defaultTitle: "Real-Time Monitoring & Reports",
      defaultDescription: "Track farm performance instantly with dynamic dashboards and automated reporting tools, enabling quick decisions and effective agricultural policy",
      buttonKey: "hero.slide1.button",
      defaultButton: "VIEW DASHBOARD",
      buttonLink: "/dashboard"
    },
    {
      image: image2,
      titleKey: "hero.slide2.title",
      descriptionKey: "hero.slide2.description",
      defaultTitle: "Smart Planning with Predictive Analytics",
      defaultDescription: "FOMAT empowers farmers and MINAGRI with accurate weather and crop yield forecasts using machine learning",
      buttonKey: "hero.slide2.button",
      defaultButton: "GET FORECAST",
      buttonLink: "/forecast"
    },
    {
      image: image3,
      titleKey: "hero.slide3.title",
      descriptionKey: "hero.slide3.description",
      defaultTitle: "Optimized Resource Allocation",
      defaultDescription: "Our system provides real-time recommendations for optimal use of water, fertilizer,\nand labor",
      buttonKey: "hero.slide3.button",
      defaultButton: "LEARN MORE",
      buttonLink: "/resources"
    }
  ];

  // Modified services cards to use content from slides
  const services = [
    {
      title: slides[0].defaultTitle,
      description: slides[0].defaultDescription,
      icon: "tag",
      linkText: slides[0].defaultButton,
      link: slides[0].buttonLink
    },
    {
      title: slides[1].defaultTitle,
      description: slides[1].defaultDescription,
      icon: "tag",
      linkText: slides[1].defaultButton,
      link: slides[1].buttonLink
    },
    {
      title: slides[2].defaultTitle,
      description: slides[2].defaultDescription,
      icon: "tag",
      linkText: slides[2].defaultButton,
      link: slides[2].buttonLink
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
              alt={getTranslatedContent(`hero.image${index + 1}.alt`, `Agricultural Image ${index + 1}`)}
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute inset-0 bg-green-900 bg-opacity-20"></div>
          </div>
        ))}

        {/* MINAGRI and Tool Title - Based on actual screenshot */}
        <div className="container mx-auto relative z-10 h-full px-4 pt-20">
          <div className="grid grid-cols-12 gap-8">
            {/* Left side - MINAGRI Section */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3 text-white">
              <h2 className="text-4xl font-bold mb-2">
                {getTranslatedContent("hero.minagri.title", "MINAGRI")}
              </h2>
              <p className="text-sm">
                {getTranslatedContent("hero.minagri.subtitle", "Ministry of Agriculture and Animal Resources")}
              </p>
            </div>
            
            {/* Right side - Tool Title */}
            <div className="col-span-12 md:col-span-7 lg:col-span-6 md:col-start-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold">
                {getTranslatedContent("hero.tool.title", "Farm Operations Management and Analytics Tool")}
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
                  ? "bg-white scale-125" 
                  : "bg-white bg-opacity-50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* Service Cards - Updated to use content from slides */}
        <div className="absolute bottom-0 left-0 right-0 z-20 mb-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map((service, index) => (
                <div key={index} className="bg-white p-4 rounded">
                  <div className="flex items-start mb-2">
                    <div className="bg-blue-400 p-2 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {renderTextWithLineBreaks(service.description)}
                  </p>
                  {service.linkText && (
                    <a href={service.link} className="text-blue-500 text-sm block mt-3 font-medium">
                      {/* {service.linkText} */}
                    </a>
                  )}
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