/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Sun, TrendingUp, ShoppingCart, Truck, Shield, Droplet, Calendar, Factory, Users, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

const SunflowerServices = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 8;
  const { t } = useTranslation();

  const servicesData = [
    {
      name: t("services.cropMonitoring", { defaultValue: "Sunflower Crop Monitoring" }),
      icon: <div className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
        <Sun color="white" size={36} />
      </div>,
      ctaText: t("services.viewMonitoring", { defaultValue: "View Monitoring" }),
      link: "/monitoring",
    },
    {
      name: t("services.yieldPrediction", { defaultValue: "Yield Prediction Analytics" }),
      icon: <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
        <TrendingUp color="white" size={36} />
      </div>,
      ctaText: t("services.viewPredictions", { defaultValue: "View Predictions" }),
      link: "/analytics",
    },
    {
      name: t("services.marketIntegration", { defaultValue: "Market Integration" }),
      icon: <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
        <ShoppingCart color="white" size={36} />
      </div>,
      ctaText: t("services.accessMarket", { defaultValue: "Access Market" }),
      link: "/marketplace",
    },
    {
      name: t("services.supplyChain", { defaultValue: "Supply Chain Management" }),
      icon: <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
        <Truck color="white" size={36} />
      </div>,
      ctaText: t("services.manageSupply", { defaultValue: "Manage Supply Chain" }),
      link: "/supply-chain",
    },
    {
      name: t("services.qualityControl", { defaultValue: "Quality Control & Testing" }),
      icon: <div className="rounded-full bg-gradient-to-r from-red-500 to-rose-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
        <Shield color="white" size={36} />
      </div>,
      ctaText: t("services.viewQuality", { defaultValue: "View Quality Reports" }),
      link: "/quality",
    },
    {
      name: t("services.irrigationManagement", { defaultValue: "Smart Irrigation" }),
      icon: <div className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
        <Droplet color="white" size={36} />
      </div>,
      ctaText: t("services.manageIrrigation", { defaultValue: "Manage Irrigation" }),
      link: "/irrigation",
    },
    {
      name: t("services.harvestPlanning", { defaultValue: "Harvest Planning" }),
      icon: <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
        <Calendar color="white" size={36} />
      </div>,
      ctaText: t("services.viewPlanner", { defaultValue: "View Harvest Planner" }),
      link: "/harvest-planning",
    },
    {
      name: t("services.oilProcessing", { defaultValue: "Oil Processing Integration" }),
      icon: <div className="rounded-full bg-gradient-to-r from-stone-500 to-gray-600 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
        <Factory color="white" size={36} />
      </div>,
      ctaText: t("services.viewProcessing", { defaultValue: "View Processing" }),
      link: "/processing",
    },
    {
      name: t("services.farmerNetwork", { defaultValue: "Farmer Network" }),
      icon: <div className="rounded-full bg-gradient-to-r from-teal-500 to-green-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
        <Users color="white" size={36} />
      </div>,
      ctaText: t("services.joinNetwork", { defaultValue: "Join Network" }),
      link: "/network",
    },
    {
      name: t("services.certification", { defaultValue: "Certification & Compliance" }),
      icon: <div className="rounded-full bg-gradient-to-r from-violet-500 to-purple-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
        <Award color="white" size={36} />
      </div>,
      ctaText: t("services.viewCertification", { defaultValue: "View Certifications" }),
      link: "/certification",
    },
  ];

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = servicesData.slice(indexOfFirstService, indexOfLastService);

  const totalPages = Math.ceil(servicesData.length / servicesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <section id="services">
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 py-16">
        <div className="container mx-auto px-4">
          <div className="pb-12 text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">
              {t("services.title", { defaultValue: "Sunflower Production & Marketing Services" })}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("services.subtitle", { defaultValue: "Comprehensive digital solutions for modern sunflower farming, from seed to market, empowering farmers with smart technology and direct market access." })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {currentServices.map((service) => (
              <div
                key={service.name}
                className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="mb-6 flex justify-center">
                  {service.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 min-h-[3rem] flex items-center">
                  {service.name}
                </h3>
                <a 
                  href={service.link} 
                  className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 text-sm font-medium"
                >
                  {service.ctaText}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                } transition-colors duration-200`}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === index + 1
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-yellow-100'
                  } transition-colors duration-200 border border-gray-300`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                } transition-colors duration-200`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Additional Features Section */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="flex flex-col items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 mb-4">
                <Sun size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Farming</h3>
              <p className="text-sm opacity-90">AI-powered insights for optimal sunflower cultivation</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 mb-4">
                <ShoppingCart size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct Market Access</h3>
              <p className="text-sm opacity-90">Connect directly with buyers and processors</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 mb-4">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Maximize Profits</h3>
              <p className="text-sm opacity-90">Optimize yield and reduce costs with data-driven decisions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SunflowerServices;