/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Cloud, BarChart2, Droplet, Calendar, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const FarmingServices = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 5;
  const { t } = useTranslation();

  const servicesData = [
    {
      name: t("services.weatherPrediction"),
      icon: <div className="rounded-full bg-green-700 p-6 w-24 h-24 flex items-center justify-center">
        <Cloud color="white" size={36} />
      </div>,
      ctaText: t("services.viewForecasts"),
      link: "#",
    },
    {
      name: t("services.cropYieldAnalytics"),
      icon: <div className="rounded-full bg-green-700 p-6 w-24 h-24 flex items-center justify-center">
        <BarChart2 color="white" size={36} />
      </div>,
      ctaText: t("services.viewPredictions"),
      link: "#",
    },
    {
      name: t("services.resourceAllocation"),
      icon: <div className="rounded-full bg-green-700 p-6 w-24 h-24 flex items-center justify-center">
        <Droplet color="white" size={36} />
      </div>,
      ctaText: t("services.manageResources"),
      link: "#",
    },
    {
      name: t("services.farmPlanning"),
      icon: <div className="rounded-full bg-green-700 p-6 w-24 h-24 flex items-center justify-center">
        <Calendar color="white" size={36} />
      </div>,
      ctaText: t("services.viewPlanner"),
      link: "#",
    },
    {
      name: t("services.riskManagement"),
      icon: <div className="rounded-full bg-green-700 p-6 w-24 h-24 flex items-center justify-center">
        <AlertTriangle color="white" size={36} />
      </div>,
      ctaText: t("services.viewAlerts"),
      link: "#",
    },
  ];

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = servicesData.slice(indexOfFirstService, indexOfLastService);

  return (
    <section id="services">
      <div className="bg-green-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="pb-8 text-center">
            <h1 className="text-3xl font-semibold mb-2">
              {t("services.title")}
            </h1>
            <p className="text-gray-300">
              {t("services.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {currentServices.map((service) => (
              <div
                key={service.name}
                className="flex flex-col items-center w-40 text-center"
              >
                <div className="mb-4 flex justify-center">
                  {service.icon}
                </div>
                <h3 className="text-lg font-medium mb-1">{service.name}</h3>
                <a 
                  href={service.link} 
                  className="text-sm text-gray-300 hover:text-white"
                >
                  {service.ctaText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FarmingServices;