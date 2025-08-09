/* eslint-disable no-unused-vars */
import { t } from "i18next";
import React from "react";
import { Sun, Phone, Mail, MapPin, Leaf, BarChart2, ShoppingCart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-yellow-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* System Info */}
        <div>
          <div className="flex items-center mb-4">
            <Sun className="h-8 w-8 text-yellow-300 mr-2" />
            <h2 className="text-xl font-bold text-yellow-300">SunSmart</h2>
          </div>
          <p className="text-sm text-yellow-100">
            {t("Smart Sunflower Production & Marketing Integration System")}
          </p>
          <p className="text-sm text-yellow-100 mt-2">
            {t("Optimizing sunflower value chains through data-driven insights and market connectivity.")}
          </p>
        </div>

        {/* Production Links */}
        <div>
          <h2 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center">
            <Leaf className="h-5 w-5 mr-2" />
            {t("Production")}
          </h2>
          <ul className="text-sm space-y-2 text-yellow-100">
            <li><a href="/cultivation" className="hover:underline hover:text-yellow-50 flex items-center">
              <span className="mr-1">•</span> {t("Smart Cultivation")}
            </a></li>
            <li><a href="/irrigation" className="hover:underline hover:text-yellow-50 flex items-center">
              <span className="mr-1">•</span> {t("Precision Irrigation")}
            </a></li>
            <li><a href="/pest-management" className="hover:underline hover:text-yellow-50 flex items-center">
              <span className="mr-1">•</span> {t("Pest Management")}
            </a></li>
            <li><a href="/harvesting" className="hover:underline hover:text-yellow-50 flex items-center">
              <span className="mr-1">•</span> {t("Optimal Harvesting")}
            </a></li>
          </ul>
        </div>

        {/* Marketing Links */}
        <div>
          <h2 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            {t("Marketing")}
          </h2>
          <ul className="text-sm space-y-2 text-yellow-100">
            <li><a href="/market-prices" className="hover:underline hover:text-yellow-50 flex items-center">
              <span className="mr-1">•</span> {t("Market Prices")}
            </a></li>
            <li><a href="/buyers" className="hover:underline hover:text-yellow-50 flex items-center">
              <span className="mr-1">•</span> {t("Connect with Buyers")}
            </a></li>
            <li><a href="/logistics" className="hover:underline hover:text-yellow-50 flex items-center">
              <span className="mr-1">•</span> {t("Storage & Logistics")}
            </a></li>
            <li><a href="/value-addition" className="hover:underline hover:text-yellow-50 flex items-center">
              <span className="mr-1">•</span> {t("Value Addition")}
            </a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            {t("Contact")}
          </h2>
          <div className="text-sm space-y-2 text-yellow-100">
            <p className="flex items-start">
              <MapPin className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              {t("Sunflower Innovation Center, KG 563 Street, Kigali, Rwanda")}
            </p>
            <p className="flex items-center">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
              <a href="mailto:info@sunsmart.rw" className="hover:underline">info@sunsmart.rw</a>
            </p>
            <p className="flex items-center">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
              <a href="tel:+250788123456" className="hover:underline">+250 788 123 456</a>
            </p>
          </div>
          
          <h3 className="text-lg font-semibold text-yellow-300 mt-4 mb-2 flex items-center">
            <BarChart2 className="h-5 w-5 mr-2" />
            {t("Analytics")}
          </h3>
          <p className="text-sm text-yellow-100">
            {t("Access our sunflower market dashboard for real-time insights")}
          </p>
          <a href="/dashboard" className="inline-block mt-2 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-500 transition">
            {t("View Dashboard")}
          </a>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-yellow-700 mt-8 pt-6 text-center text-sm text-yellow-100">
        <div className="mb-2">
          <p>&copy; {new Date().getFullYear()} {t("SunSmart - Smart Sunflower Production & Marketing System")}</p>
        </div>
        <div className="flex justify-center space-x-4 text-xs">
          <a href="/privacy" className="hover:underline text-yellow-600">{t("Privacy Policy")}</a>
          <a href="/terms" className="hover:underline">{t("Terms of Service")}</a>
          <a href="/partners" className="hover:underline">{t("Our Partners")}</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;