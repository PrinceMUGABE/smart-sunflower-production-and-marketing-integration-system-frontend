/* eslint-disable no-unused-vars */
import React from "react";
import { FaYoutube, FaLinkedin, FaArrowUp, FaPhone, FaBriefcase, FaAward, FaRoute, FaChartLine, FaTruck } from "react-icons/fa";
import { MdEmail, MdLocationOn, MdDashboard, MdAnalytics } from "react-icons/md";
import { BiData } from "react-icons/bi";
import logoImg from "../../assets/pictures/logo.png"; // Import logo directly

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Logo and Info */}
          <div className="mb-6 md:mb-0">
            <div className="flex flex-col items-start">
              <div className="mb-2">
                <img 
                  src={logoImg} 
                  alt="ROPS - Relocation Optimization and Prediction System" 
                  className="h-16"
                />
                <p className="text-sm mt-1">Smart relocation, simplified</p>
              </div>
              <p className="text-sm my-2">A MOBILITAS Group company</p>
              
              <div className="flex items-center mt-4">
                <div className="mr-2">
                  <FaPhone className="text-white h-5 w-5" />
                </div>
                <a href="#contact" className="hover:text-blue-300">Contact us</a>
              </div>
              
              <div className="flex items-center mt-4">
                <div className="mr-2">
                  <FaBriefcase className="text-white h-5 w-5" />
                </div>
                <a href="#careers" className="hover:text-blue-300">Careers</a>
              </div>
              
              <a href="#dashboard" className="bg-red-600 text-white px-4 py-2 rounded mt-4 inline-block font-bold">
                ACCESS DASHBOARD
              </a>
              
              {/* Social Media */}
              <div className="flex space-x-4 mt-6">
                <a href="#" className="text-white hover:text-gray-300">
                  <FaYoutube size={24} />
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  <FaLinkedin size={24} />
                </a>
              </div>
            </div>
          </div>
          
          {/* ROPS Features Column */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-4">ROPS Features</h3>
            <ul className="space-y-2">
              <li>
                <a href="#routing" className="hover:text-red-600 text-sm flex items-center">
                  <FaRoute className="mr-2 h-4 w-4" />
                  Route Optimization
                </a>
              </li>
              <li>
                <a href="#predictive" className="hover:text-red-600 text-sm flex items-center">
                  <FaChartLine className="mr-2 h-4 w-4" />
                  Predictive Analytics
                </a>
              </li>
              <li>
                <a href="#resource" className="hover:text-red-600 text-sm flex items-center">
                  <FaTruck className="mr-2 h-4 w-4" />
                  Resource Allocation
                </a>
              </li>
              <li>
                <a href="#customer" className="hover:text-red-600 text-sm flex items-center">
                  <MdEmail className="mr-2 h-4 w-4" />
                  Customer Experience
                </a>
              </li>
              <li>
                <a href="#cost" className="hover:text-red-600 text-sm flex items-center">
                  <BiData className="mr-2 h-4 w-4" />
                  Cost Analysis
                </a>
              </li>
              <li>
                <a href="#reports" className="hover:text-red-600 text-sm flex items-center">
                  <MdDashboard className="mr-2 h-4 w-4" />
                  Reports & Dashboards
                </a>
              </li>
            </ul>
          </div>
          
          {/* Rwanda Districts Column */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-4">Rwanda Coverage</h3>
            <ul className="space-y-2">
              <li><a href="#kigali" className="hover:text-red-600 text-sm">Kigali City</a></li>
              <li><a href="#gasabo" className="hover:text-red-600 text-sm">Gasabo</a></li>
              <li><a href="#kicukiro" className="hover:text-red-600 text-sm">Kicukiro</a></li>
              <li><a href="#nyarugenge" className="hover:text-red-600 text-sm">Nyarugenge</a></li>
              <li><a href="#huye" className="hover:text-red-600 text-sm">Huye</a></li>
              <li><a href="#rubavu" className="hover:text-red-600 text-sm">Rubavu</a></li>
              <li><a href="#musanze" className="hover:text-red-600 text-sm">Musanze</a></li>
              <li><a href="#all-districts" className="hover:text-red-600 text-sm">All Districts</a></li>
            </ul>
          </div>
          
          {/* System Updates Column */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-4">Latest Updates</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-red-600 text-sm">ROPS now includes real-time weather impact analysis for better route planning</a></li>
              <li><a href="#" className="hover:text-red-600 text-sm">New customer satisfaction metrics integrated into the dashboard</a></li>
              <li><a href="#" className="hover:text-red-600 text-sm">Resource allocation algorithm improved with AI-driven predictions</a></li>
            </ul>
            
            {/* Certification Logo */}
            <div className="mt-6 flex items-center">
              <FaAward className="text-white h-16 w-16" />
              <span className="ml-2 text-sm">ISO 27001 Certified for Data Security</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright Section */}
      <div className="container mx-auto px-4 mt-8 pt-4 border-t border-gray-700 flex justify-between items-center">
        <div>
          <p className="text-sm">Copyright ROPS ©{new Date().getFullYear()}</p>
        </div>
        <div className="flex items-center">
          <a href="#" className="text-sm mr-4 hover:text-blue-300">Terms of use</a>
          <span className="mx-2">/</span>
          <a href="#" className="text-sm hover:text-blue-300">Privacy policy</a>
          <span className="mx-2">/</span>
          <a href="#" className="text-sm hover:text-blue-300">Data security</a>
        </div>
        <div>
          <a 
            href="#top" 
            className="bg-red-600 rounded-full p-2 flex items-center justify-center" 
            aria-label="Back to top"
          >
            <FaArrowUp />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;