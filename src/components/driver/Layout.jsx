/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import loginImage from "../../assets/pictures/logo.png";
import navImage from "../../assets/pictures/branches.jpg"; // Nav background image

function DriverLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsMenuOpen(false); // Close menu before logout
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/");
  };

  // New function to handle link clicks
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Retrieve user data from local storage
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const userId = userData.id || ''; // Fallback to an empty string if no id is found

  useEffect(() => {
    // Retrieve user data from localStorage
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.phone) {
      setPhone(userData.phone);
    }
    console.log("Retrieved user data:", userData);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 p-4 flex justify-between items-center relative">
        {/* Logo (Circular) */}
        <div className="flex items-center">
          <img
            src={loginImage}
            alt="Driver Logo"
            className="h-10 w-10 rounded-full"
          />
        </div>
        
        {/* Hamburger Icon */}
        <button
          onClick={toggleMenu}
          className="md:hidden block text-gray-600 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Links - Horizontal on desktop, Vertical on mobile */}
        <div
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } md:flex md:flex-row md:items-center md:gap-4 md:static
          fixed left-0 top-[72px] h-full w-64 bg-green-700 shadow-lg
          flex flex-col transition-transform duration-300 ease-in-out
          md:w-auto md:shadow-none md:h-auto`}
        >

          <div className="flex flex-col w-full md:flex-row">
            <Link
              to="/driver"
              onClick={handleLinkClick}
              className="px-6 py-4 md:py-2 text-sm font-medium text-white hover:bg-blue-700 hover:text-gray-700 transition border-b md:border-b-0"
            >
              Home
            </Link>
            <Link
              to="/driver/expenses"
              onClick={handleLinkClick}
              className="px-6 py-4 md:py-2 text-sm font-medium text-white hover:bg-blue-700 hover:text-gray-700 transition border-b md:border-b-0"
            >
              Expenses
            </Link>
            <Link
              to="/driver/reimbursements"
              onClick={handleLinkClick}
              className="px-6 py-4 md:py-2 text-sm font-medium text-white hover:bg-blue-700 hover:text-gray-700 transition border-b md:border-b-0"
            >
              Notification
            </Link>
            <Link
              to={`/driver/policies`}
              onClick={handleLinkClick}
              className="px-6 py-4 md:py-2 text-sm font-medium text-white hover:bg-blue-700 hover:text-gray-700 transition border-b md:border-b-0"
            >
              Policy
            </Link>
            <Link
              to={`/driver/profile/${userId}`}
              onClick={handleLinkClick}
              className="px-6 py-4 md:py-2 text-sm font-medium text-white hover:bg-blue-700 hover:text-gray-700 transition border-b md:border-b-0"
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="px-6 py-4 md:py-2 text-sm font-medium text-white hover:bg-blue-700 hover:text-gray-700 transition text-left"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Background image for larger screens */}
        <div
          className="absolute top-0 left-0 w-full md:h-[200px] h-[150px] bg-cover bg-center md:block hidden"
          style={{
            backgroundImage: `url(${navImage})`,
            backgroundAttachment: 'fixed',
            zIndex: -1, // Ensure it stays behind the navbar content
          }}
        ></div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex justify-center items-center p-6">
        <main className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DriverLayout;
