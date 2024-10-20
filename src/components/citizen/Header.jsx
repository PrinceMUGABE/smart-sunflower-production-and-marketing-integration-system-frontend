/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (userData) {
      setUsername(userData.username);
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md w-full">
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
        {/* Adding spacing and distinct colors to buttons */}
        {/* <Link
          to="/citizen"
          className="px-4 py-2 bg-blue-500 text-white rounded w-full md:w-auto text-center"
        >
          Dashboard
        </Link>
        <Link
          to="/citizen/appointments"
          className="px-4 py-2 bg-green-500 text-white rounded w-full md:w-auto text-center"
        >
          My Appointments
        </Link>
        <Link
          to="/citizen/trainings"
          className="px-4 py-2 bg-purple-500 text-white rounded w-full md:w-auto text-center"
        >
          My Trainings
        </Link>
        <Link
          to="/citizen/certificates"
          className="px-4 py-2 bg-red-500 text-white rounded w-full md:w-auto text-center"
        >
          My Certificates
        </Link> */}
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
