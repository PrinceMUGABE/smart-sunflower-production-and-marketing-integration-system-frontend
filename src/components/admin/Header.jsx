/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [phone, setPhone] = useState(""); // State for phone number

  useEffect(() => {
    // Retrieve user data from sessionStorage (or localStorage if that's where it's stored)
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (userData) {
      setPhone(userData.phone); // Update phone number state
    }
    console.log("Retrieved user data: ", userData); // Optional: For debugging
  }, []); // Empty dependency array ensures this runs once when the component mounts

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <div>
        <h1 className="text-xs text-gray-500">Welcome Back Admin{phone}!</h1>
      </div>
      <div className="flex items-center space-x-5">
        <div className="relative">
          <div className="flex gap-2">
            <div>
              <FaUserCircle
                className="w-8 h-8 rounded-full border-4 border-indigo-400 cursor-pointer"
                onClick={toggleDropdown}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <Link
                    to="/"
                    className="block px-4 py-2 text-gray-800 hover:bg-indigo-500 hover:text-white"
                  >
                    Logout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
