/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { HiMenuAlt3, HiMenuAlt1 } from "react-icons/hi";
import ResponsiveMenu from "./ResponsiveMenu";
import Logo from "../../assets/pictures/logo.png";
import DarkMode from "./DarkMode";
import { Link, useNavigate } from "react-router-dom";

export const MenuLinks = [
  {
    id: 1,
    name: "Home",
    link: "/#home",
  },
  {
    id: 2,
    name: "About",
    link: "/#about",
  },
  // {
  //   id: 3,
  //   name: "Services",
  //   link: "/#services",
  // },
  {
    id: 4,
    name: "Contact",
    link: "/#contact",
  },
];

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Function to handle button click and navigate to the login page
  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div
      className="relative z-10 w-full dark:bg-white dark:text-white duration-300
    "
    >
      <div className="container py-3 md:py-2">
        <div className="flex justify-between items-center">
          {/* Logo section */}
          <a target="_blank" href="#home" className="flex items-center gap-3">
            <img src={Logo} alt="" className="w-20" /> <br /> <br />
            <br />
            <span className="text-2xl sm:text-3xl font-semibold">
              Volcano Expense Pro
            </span>
          </a>
          {/* Desktop view Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-8">
              {MenuLinks.map(({ id, name, link }) => (
                <li key={id} className="py-4">
                  <a
                    href={link}
                    className="text-lg font-medium  hover:text-primary py-2 hover:border-b-2 hover:border-primary transition-colors duration-500"
                  >
                    {name}
                  </a>
                </li>
              ))}
              {/* Button for Login */}
              <li>
                <button
                  onClick={handleLoginClick}
                  className="border-2 border-blue-500 text-blue-500 font-bold py-2 px-4 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Login
                </button>
              </li>
              <DarkMode />
            </ul>
          </nav>
          {/* Mobile view Drawer */}
          <div className="flex items-center gap-4 md:hidden ">
            <DarkMode />
            {/* Mobile Hamburger icon */}
            {showMenu ? (
              <HiMenuAlt1
                onClick={toggleMenu}
                className="cursor-pointer transition-all"
                size={30}
              />
            ) : (
              <HiMenuAlt3
                onClick={toggleMenu}
                className="cursor-pointer transition-all"
                size={30}
              />
            )}
          </div>
        </div>
      </div>
      <ResponsiveMenu showMenu={showMenu} />
    </div>
  );
};

export default Navbar;
