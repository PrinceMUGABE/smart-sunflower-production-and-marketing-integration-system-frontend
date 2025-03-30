/* eslint-disable no-unused-vars */
import React from "react";
import { BarChart2, LineChart, TrendingUp, Clock, Database } from "lucide-react";

const ClientSatisfaction = () => {
  const serviceFeatures = [
    {
      title: "Data-Driven Efficiency",
      icon: <div className="rounded-full bg-red-600 p-6 w-24 h-24 flex items-center justify-center">
        <BarChart2 color="white" size={36} strokeWidth={3} />
      </div>,
      description: "Our system analyzes historical and real-time traffic data to optimize routes for movers, reducing travel time by up to 30% and fuel costs by 25%. The dynamic routing automatically adjusts planned routes in response to road conditions, accidents, closures, and weather changes, ensuring maximum operational efficiency for every relocation."
    },
    {
      title: "Predictive Resource Planning",
      icon: <div className="rounded-full bg-red-600 p-6 w-24 h-24 flex items-center justify-center">
        <TrendingUp color="white" size={36} strokeWidth={3} />
      </div>,
      description: "ROPS uses advanced algorithms to predict seasonal demand patterns, helping your team allocate resources more efficiently. Our workforce management capabilities predict optimal staffing levels and vehicle requirements, ensuring you're neither overstaffed nor understaffed. The system's inventory management features track packing materials and predict when supplies need replenishment."
    },
    {
      title: "Cost Optimization",
      icon: <div className="rounded-full bg-red-600 p-6 w-24 h-24 flex items-center justify-center">
        <LineChart color="white" size={36} strokeWidth={3} />
      </div>,
      description: "Our comprehensive expense tracking provides insights into cost-saving opportunities across your operation. The profitability analysis evaluates different routes, types of moves, and services offered, helping you refine pricing strategies. By analyzing fuel efficiency and vehicle usage patterns, ROPS identifies concrete ways to reduce operational expenses while maintaining service quality."
    },
    {
      title: "Real-Time Analytics Dashboard",
      icon: <div className="rounded-full bg-red-600 p-6 w-24 h-24 flex items-center justify-center">
        <Database color="white" size={36} strokeWidth={3} />
      </div>,
      description: "Our interactive dashboards provide managers with visual reports on key metrics like average move time, resource utilization, and operational efficiency. The customizable reporting system generates tailored reports for different organizational levels—from strategic overviews for executives to detailed operational metrics for team leaders—enabling data-driven decision making at every level."
    }
  ];

  return (
    <section id="client-satisfaction" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-red-700 mb-3">
            Operational Excellence through Data Analytics
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto">
            Our Relocation Optimization and Prediction System processes over 10,000 data points daily to optimize routes, predict demand patterns, and allocate resources efficiently, resulting in 28% improved operational efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {serviceFeatures.map((feature, index) => (
            <div key={index} className="flex gap-6">
              <div className="flex-shrink-0 mt-2">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientSatisfaction;