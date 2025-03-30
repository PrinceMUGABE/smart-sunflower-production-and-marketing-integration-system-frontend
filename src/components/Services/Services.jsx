/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Truck, BarChart2, Clock, Database, Map } from "lucide-react";

const servicesData = [
  {
    name: "Route Optimization",
    icon: <div className="rounded-full bg-red-600 p-6 w-24 h-24 flex items-center justify-center">
      <Map color="white" size={36} />
    </div>,
    ctaText: "View Routes",
    link: "#",
  },
  {
    name: "Predictive Analytics",
    icon: <div className="rounded-full bg-red-600 p-6 w-24 h-24 flex items-center justify-center">
      <BarChart2 color="white" size={36} />
    </div>,
    ctaText: "View Forecasts",
    link: "#",
  },
  {
    name: "Resource Allocation",
    icon: <div className="rounded-full bg-red-600 p-6 w-24 h-24 flex items-center justify-center">
      <Truck color="white" size={36} />
    </div>,
    ctaText: "Manage Resources",
    link: "#",
  },
  {
    name: "Customer Analytics",
    icon: <div className="rounded-full bg-red-600 p-6 w-24 h-24 flex items-center justify-center">
      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="white" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </div>,
    ctaText: "View Insights",
    link: "#",
  },
  {
    name: "Real-Time Tracking",
    icon: <div className="rounded-full bg-red-600 p-6 w-24 h-24 flex items-center justify-center">
      <Clock color="white" size={36} />
    </div>,
    ctaText: "Monitor Fleet",
    link: "#",
  },
];

const RemovalsServices = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 5;

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = servicesData.slice(indexOfFirstService, indexOfLastService);

  return (
    <section id="services">
      <div className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="pb-8 text-center">
            <h1 className="text-3xl font-semibold mb-2">
              Data-Driven Relocation Optimization
            </h1>
            <p className="text-gray-300">
              ROPS offers intelligent analytics and predictive solutions for efficient relocations.
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

export default RemovalsServices;