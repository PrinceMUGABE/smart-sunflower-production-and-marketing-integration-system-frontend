/* eslint-disable no-unused-vars */
import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import MapComponent from "./MapComponent"; // Import the MapComponent you created

const FooterLinks = [
  {
    title: "Home",
    link: "/#home",
  },
  {
    title: "About",
    link: "/#about",
  },
  {
    title: "Services",
    link: "/#service",
  },
  {
    title: "Contact",
    link: "/#contact",
  },
];

const Footer = () => {
  return (
    <div className="bg-green-950 text-white">
      <section className="container py-8">
        <div className="flex flex-wrap justify-between items-start gap-8 py-5">
          {/* Company Details */}
          <div className="flex-1 min-w-[250px] py-8 px-4">
            <h1 className="sm:text-3xl text-xl font-bold sm:text-left text-justify mb-3 flex items-center gap-3">
              Volcano Expense Pro
            </h1>
            <p className="mt-4 text-gray-400">
              <strong>Phone:</strong> +250 788 457 408
            </p>
            <p className="mt-2 text-gray-400">
              <strong>Email:</strong> info@volcanoexpensepro.com
            </p>
            <p className="mt-2 text-gray-400">
              <strong>Location:</strong> Kigali, Rwanda
            </p>
            
          </div>

          {/* Links */}
          <div className="flex-1 min-w-[250px] py-8 px-4">
            <h1 className="sm:text-xl text-xl font-bold sm:text-left text-justify mb-3">
              Social Media
            </h1>
            {/* Social Handle */}
            <div className="flex items-center gap-4 mt-6">
              <a href="#">
                <FaInstagram className="text-2xl text-red-600 hover:text-gray-600 duration-300" />
              </a>
              <a href="#">
                <FaFacebook className="text-2xl text-blue-700 hover:text-green-700 duration-300" />
              </a>
              <a href="#">
                <FaLinkedin className="text-2xl text-blue-700 hover:text-primary duration-300" />
              </a>
            </div>
          </div>

          {/* Map Section */}
          <div className="flex-1 min-w-[250px] py-8 px-4">
            <h1 className="text-xl font-bold mb-4">Our Location in Rwanda</h1>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <MapComponent />
            </div>
          </div>
        </div>
      </section>

      {/* Copyright Section */}
      <div className="bg-green-800 py-4 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Volcano Expense Pro. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
