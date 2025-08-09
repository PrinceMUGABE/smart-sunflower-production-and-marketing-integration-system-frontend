/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { Sun, Leaf, ShoppingCart, BarChart2, User, Phone, Mail } from "lucide-react"; // Add Phone and Mail imports
import ResponsiveMenu from "./ResponsiveMenu";
import Logo from "../../assets/pictures/minagri.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const MenuLinks = [
  { id: 1, name: "home", link: "/", icon: <Sun className="h-5 w-5" /> },
  { id: 2, name: "production", link: "/production", icon: <Leaf className="h-5 w-5" /> },
  { id: 3, name: "marketing", link: "/marketing", icon: <ShoppingCart className="h-5 w-5" /> },
  { id: 4, name: "analytics", link: "/analytics", icon: <BarChart2 className="h-5 w-5" /> },
  { id: 5, name: "about", link: "/about" },
  { id: 6, name: "contact", link: "#contact" },
];

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setShowMenu((prev) => !prev);
  const handleLoginClick = () => navigate("/login");

  const handleLinkClick = (name, link) => {
    if (name === "contact") {
      setShowContact(true);
    } else if (link.startsWith("/#")) {
      const targetId = link.substring(2);
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const element = document.getElementById(targetId);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(link);
    }
  };

  const phoneNumbers = [
    { number: "+250796087267", display: "+250 796 087 267" },
    { number: "+250783251199", display: "+250 783 251 199" },
    { number: "+250725169154", display: "+250 725 196 154" },
  ];
  const emails = ["info@sunsmart.rw"];

  const getEmailLink = (email) => `mailto:${email}`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 w-full ${
          scrolled ? "bg-white shadow-md border-b border-yellow-100" : "bg-white bg-opacity-95"
        } transition-all duration-300`}
      >
        <div className="container mx-auto px-4 py-3 md:py-2">
          <div className="flex justify-between items-center">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
              className="flex items-center gap-3 bg-white p-1 rounded"
              aria-label="Home"
            >
              <img src={Logo} alt="SunSmart Logo" className="h-12 w-auto object-contain" />
              <span className="hidden md:block text-xl font-bold text-yellow-700">SunSmart</span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <ul className="flex items-center gap-6">
                {MenuLinks.map(({ id, name, link, icon }) => {
                  const isActive = location.pathname === link || 
                                 (location.pathname.startsWith(link) && link !== "/");
                  return (
                    <li key={id}>
                      <a
                        href={link}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(name, link);
                        }}
                        className={`flex items-center gap-1 text-lg font-medium transition-colors duration-300 ${
                          isActive
                            ? "text-yellow-700 border-b-2 border-yellow-600"
                            : "text-gray-800 hover:text-yellow-600 hover:border-b-2 hover:border-yellow-400"
                        }`}
                      >
                        {icon && <span className="mr-1">{icon}</span>}
                        {t(name)}
                      </a>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleLoginClick}
                  className="flex items-center gap-1 bg-yellow-600 text-white py-2 px-5 rounded hover:bg-yellow-700 transition-colors duration-300 font-medium shadow-sm"
                  aria-label="Login"
                >
                  <User className="h-5 w-5" />
                  {t("login")}
                </button>

                <select
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  value={i18n.language}
                  className="border border-gray-300 text-gray-700 rounded px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="en">ENG</option>
                  <option value="fr">FR</option>
                  <option value="rw">RW</option>
                </select>
              </div>
            </nav>

            <button
              onClick={toggleMenu}
              className="md:hidden flex items-center text-gray-800 hover:text-yellow-600 transition-colors"
              aria-label={showMenu ? "Close menu" : "Open menu"}
            >
              {showMenu ? <IoMdClose size={28} /> : <HiMenuAlt3 size={28} />}
            </button>
          </div>
        </div>

        <ResponsiveMenu
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          handleLinkClick={handleLinkClick}
        />
      </header>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-auto relative animate-fadeIn">
            <button
              onClick={() => setShowContact(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close contact dialog"
            >
              <IoMdClose size={24} />
            </button>

            <div className="p-8">
              <h2 className="text-yellow-700 font-bold text-3xl mb-6 text-center">{t("Contact SunSmart Team")}</h2>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-yellow-600" />
                    {t("Phone Numbers")}
                  </h3>
                  <ul className="space-y-3 text-lg text-gray-600">
                    {phoneNumbers.map((phone, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="mr-2 text-yellow-600">•</span>
                        <a href={`tel:${phone.number}`} className="text-yellow-700 hover:underline hover:text-yellow-800">
                          {phone.display}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-yellow-600" />
                    {t("Email Addresses")}
                  </h3>
                  <ul className="space-y-3 text-lg text-gray-600">
                    {emails.map((email, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="mr-2 text-yellow-600">•</span>
                        <a href={getEmailLink(email)} className="text-yellow-700 hover:underline hover:text-yellow-800">
                          {email}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;