/* eslint-disable no-unused-vars */
import React from "react";
import { BarChart2, LineChart, TrendingUp, Clock, Database } from "lucide-react";
import { useTranslation } from "react-i18next";

const ClientSatisfaction = () => {
  const { t } = useTranslation();

  const serviceFeatures = [
    {
      title: t("Predictive Farm Planning"),
      icon: (
        <div className="rounded-full bg-green-700 p-6 w-24 h-24 flex items-center justify-center">
          <BarChart2 color="white" size={36} strokeWidth={3} />
        </div>
      ),
      description: t("FOMAT uses machine learning to analyze historical weather and crop data, enabling accurate forecasting of planting schedules and environmental conditions, helping MINAGRI and farmers plan effectively.")
    },
    {
      title: t("Optimized Resource Allocation"),
      icon: (
        <div className="rounded-full bg-emerald-600 p-6 w-24 h-24 flex items-center justify-center">
          <TrendingUp color="white" size={36} strokeWidth={3} />
        </div>
      ),
      description: t("The system ensures efficient use of resources such as water, labor, and equipment by providing data-driven recommendations that minimize waste and boost productivity.")
    },
    {
      title: t("Automated Real-Time Reporting"),
      icon: (
        <div className="rounded-full bg-teal-700 p-6 w-24 h-24 flex items-center justify-center">
          <Database color="white" size={36} strokeWidth={3} />
        </div>
      ),
      description: t("FOMAT generates real-time reports for both farmers and policymakers, streamlining communication and enabling timely decisions to address dynamic farming challenges.")
    },
    {
      title: t("Dynamic Decision-Making Tools"),
      icon: (
        <div className="rounded-full bg-lime-600 p-6 w-24 h-24 flex items-center justify-center">
          <Clock color="white" size={36} strokeWidth={3} />
        </div>
      ),
      description: t("With intuitive dashboards and planning interfaces, users can adjust schedules and resource use based on real-time data, enhancing operational agility in Rwanda’s agriculture sector.")
    }
  ];

  return (
    <section id="client-satisfaction" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-green-800 mb-3">
            {t("Empowering Agriculture Through Data-Driven Innovation")}
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto">
            {t("The Farm Operations Management and Analytics Tool (FOMAT) equips Rwanda’s agricultural stakeholders with predictive analytics, automated reporting, and dynamic planning capabilities to boost productivity and sustainability.")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {serviceFeatures.map((feature, index) => (
            <div key={index} className="flex gap-6">
              <div className="flex-shrink-0 mt-2">{feature.icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientSatisfaction;
