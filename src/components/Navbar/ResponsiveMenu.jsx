// src/components/ResponsiveMenu.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MenuLinks } from "./Navbar";
import { useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";

const ResponsiveMenu = ({ showMenu, setShowMenu, handleLinkClick }) => {
  const { i18n} = useTranslation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const handleLoginClick = () => {
    navigate("/login");
    setShowMenu(false);
  };

  const handleMenuItemClick = (name, link) => {
    setShowMenu(false);
    handleLinkClick?.(name, link);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <>
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" onClick={() => setShowMenu(false)} />
      )}

      <div
        ref={menuRef}
        className={`${
          showMenu ? "left-0" : "-left-full"
        } fixed top-0 bottom-0 z-20 flex h-screen w-[75%] flex-col justify-between bg-green-700 text-white px-6 pb-6 pt-12 transition-all duration-300 md:hidden rounded-r-xl shadow-lg`}
      >
        <button
          className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          onClick={() => setShowMenu(false)}
        >
          <IoMdClose size={24} />
        </button>

        <nav className="mt-12">
          <ul className="space-y-6 text-lg">
            {MenuLinks.map(({ id, name, link }) => (
              <li key={id}>
                <a
                  href={link}
                  className="block py-2 px-2 rounded hover:text-green-100 hover:bg-green-800 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuItemClick(name, link);
                  }}
                >
                  (name)
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto">
          <label className="block text-white text-sm mb-2">Languages</label>
          <select
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="w-full bg-white text-black px-3 py-2 rounded"
            value={i18n.language}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="rw">Kinyarwanda</option>
          </select>

          <button
            onClick={handleLoginClick}
            className="w-full mt-4 bg-white text-green-700 font-semibold py-2 rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
          >
            Login
          </button>
        </div>
      </div>
    </>
  );
};

export default ResponsiveMenu;
