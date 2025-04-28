/* eslint-disable no-unused-vars */
import { t } from "i18next";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ministry Info */}
        <div>
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">MINAGRI</h2>
          <p className="text-sm">
            {t("Ministry of Agriculture and Animal Resources, Republic of Rwanda.")}
          </p>
          <p className="text-sm mt-2">
            {t("Empowering farmers through data-driven insights and innovative solutions.")}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">Quick Links</h2>
          <ul className="text-sm space-y-1">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/about" className="hover:underline">About Us</a></li>
            <li><a href="/services" className="hover:underline">Services</a></li>
            <li><a href="/contact" className="hover:underline">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">Contact Us</h2>
          <p className="text-sm">KG 563 Street, Kigali, Rwanda</p>
          <p className="text-sm">Email: info@minagri.gov.rw</p>
          <p className="text-sm">Phone: +250 788 123 456</p>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-green-700 mt-6 pt-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} FARM OPERATIONS MANAGEMENT & ANALYTICS TOOL
        (FOMAT) - Rwanda. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
