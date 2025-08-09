/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React from "react";
import { Sun, TrendingUp, ShoppingCart, Factory, Droplet, Award, BarChart2, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

const SunflowerFeatures = () => {
  const { t } = useTranslation();

  const serviceFeatures = [
    {
      title: t("smartCropMonitoring", { defaultValue: "Smart Sunflower Crop Monitoring" }),
      icon: (
        <div className="rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
          <Sun color="white" size={36} strokeWidth={3} />
        </div>
      ),
      description: t("smartCropMonitoringDesc", { defaultValue: "Advanced IoT sensors and satellite imagery monitor sunflower growth stages, soil moisture, temperature, and pest activity in real-time, providing farmers with precise data for optimal cultivation decisions." })
    },
    {
      title: t("yieldOptimization", { defaultValue: "AI-Powered Yield Optimization" }),
      icon: (
        <div className="rounded-full bg-gradient-to-br from-green-500 to-emerald-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
          <TrendingUp color="white" size={36} strokeWidth={3} />
        </div>
      ),
      description: t("yieldOptimizationDesc", { defaultValue: "Machine learning algorithms analyze weather patterns, soil conditions, and historical data to predict optimal planting times, fertilizer application, and harvesting schedules for maximum sunflower oil content and yield." })
    },
    {
      title: t("marketIntegration", { defaultValue: "Direct Market Integration" }),
      icon: (
        <div className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
          <ShoppingCart color="white" size={36} strokeWidth={3} />
        </div>
      ),
      description: t("marketIntegrationDesc", { defaultValue: "Seamless connection between sunflower farmers and buyers, oil processors, and exporters through digital marketplace, enabling transparent pricing, contract management, and direct sales without intermediaries." })
    },
    {
      title: t("processingIntegration", { defaultValue: "Processing Plant Integration" }),
      icon: (
        <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
          <Factory color="white" size={36} strokeWidth={3} />
        </div>
      ),
      description: t("processingIntegrationDesc", { defaultValue: "Direct integration with oil processing facilities for quality assessment, scheduling deliveries, tracking oil extraction rates, and managing contracts from farm gate to refined sunflower oil production." })
    },
    {
      title: t("smartIrrigation", { defaultValue: "Smart Irrigation Management" }),
      icon: (
        <div className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
          <Droplet color="white" size={36} strokeWidth={3} />
        </div>
      ),
      description: t("smartIrrigationDesc", { defaultValue: "Precision irrigation system that optimizes water usage based on sunflower growth stages, weather forecasts, and soil moisture levels, reducing water waste while maximizing crop health and productivity." })
    },
    {
      title: t("qualityAssurance", { defaultValue: "Quality Assurance & Certification" }),
      icon: (
        <div className="rounded-full bg-gradient-to-br from-red-500 to-rose-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
          <Award color="white" size={36} strokeWidth={3} />
        </div>
      ),
      description: t("qualityAssuranceDesc", { defaultValue: "Comprehensive quality control system that monitors oil content, moisture levels, and contamination throughout the production cycle, ensuring compliance with international standards and premium market access." })
    },
    {
      title: t("predictiveAnalytics", { defaultValue: "Predictive Analytics Dashboard" }),
      icon: (
        <div className="rounded-full bg-gradient-to-br from-violet-500 to-purple-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
          <BarChart2 color="white" size={36} strokeWidth={3} />
        </div>
      ),
      description: t("predictiveAnalyticsDesc", { defaultValue: "Advanced dashboard providing market price forecasts, weather predictions, disease risk assessments, and yield projections to help farmers make informed decisions and maximize profitability." })
    },
    {
      title: t("mobileAccessibility", { defaultValue: "Mobile-First Accessibility" }),
      icon: (
        <div className="rounded-full bg-gradient-to-br from-teal-500 to-green-500 p-6 w-24 h-24 flex items-center justify-center shadow-lg">
          <Smartphone color="white" size={36} strokeWidth={3} />
        </div>
      ),
      description: t("mobileAccessibilityDesc", { defaultValue: "User-friendly mobile application enabling farmers to access all system features, receive alerts, manage operations, and connect with markets from anywhere, supporting digital literacy and rural connectivity." })
    }
  ];

  return (
    <section id="sunflower-features" className="py-16 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            {t("featuresTitle", { defaultValue: "Revolutionary Sunflower Production Technology" })}
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {t("featuresSubtitle", { defaultValue: "The Smart Sunflower Production & Marketing Integration System transforms traditional farming with cutting-edge technology, connecting farmers directly to markets while optimizing every aspect of sunflower cultivation from seed to oil." })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {serviceFeatures.map((feature, index) => (
            <div key={index} className="flex gap-6 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="flex-shrink-0 mt-2">{feature.icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Benefits Section */}
        <div className="mt-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">System Benefits</h3>
            <p className="text-lg opacity-90">Transforming Rwanda's sunflower industry through innovation</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={24} />
              </div>
              <h4 className="text-lg font-semibold mb-2">Increase Productivity</h4>
              <p className="text-sm opacity-90">Up to 40% increase in sunflower yield through optimized farming practices</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={24} />
              </div>
              <h4 className="text-lg font-semibold mb-2">Better Market Access</h4>
              <p className="text-sm opacity-90">Direct connections to buyers and processors for better pricing</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award size={24} />
              </div>
              <h4 className="text-lg font-semibold mb-2">Quality Assurance</h4>
              <p className="text-sm opacity-90">Consistent quality standards meeting international export requirements</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Ready to Transform Your Sunflower Production?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of farmers already benefiting from our smart farming solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg">
              Get Started Today
            </button>
            <button className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SunflowerFeatures;