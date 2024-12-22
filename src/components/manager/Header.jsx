/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import navImage from "../../assets/pictures/branches.jpg"; // Nav background image

const ManagerHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  // Retrieve user data from local storage
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = userData.id || ""; // Fallback to an empty string if no id is found

  useEffect(() => {
    // Retrieve user data from localStorage
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.phone) {
      setPhone(userData.phone);
    }
    console.log("Retrieved user data:", userData);
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("userData");
    localStorage.removeItem("token");

    // Redirect to the login page
    navigate("/login");
  };

  return (
    <div
      className="relative flex flex-col justify-between items-center p-4 text-white"
      style={{
        backgroundImage: `url(${navImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "300px", // Adjust height to expand the header
      }}
    >
      {/* Overlay for better text visibility */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        style={{ zIndex: 0 }}
      ></div>

      <div className="relative z-10">
        <h1 className="text-xl font-bold animate-marquee text-center">
          WELCOME BACK TO VOLCANO EXPENSE PRO MANAGEMENT SYSTEM{" "}
          <span className="px-4 text-green-400">{phone}</span>
        </h1>
      </div>

      <div className="relative z-10 flex items-center space-x-5">
        <div className="relative">
          <div className="flex gap-2">
            {/* <div>
              <FaUserCircle
                className="w-8 h-8 rounded-full border-4 border-indigo-400 cursor-pointer"
                onClick={toggleDropdown}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <Link
                    to={`/admin/profile/${userId}`} // Dynamic route based on user ID
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-indigo-500 hover:text-white"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-indigo-500 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerHeader;
