/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { 
  FaUserCircle, 
  FaSignOutAlt, 
  FaComments,
  FaCar, 
  FaTruckMoving,
  FaGlobe
  
} from "react-icons/fa";
import { 
  LogOut, 
  User,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Database,
  LineChart,
  CloudSun,
  Settings,
  BarChart3,
  ChevronDown,
  Languages
} from "lucide-react";
import { MdDashboard } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/pictures/minagri.jpg";
import { MdInsights } from "react-icons/md";
import { useTranslation } from "react-i18next";

const Customer_Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [salesDropdownOpen, setSalesDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n, t } = useTranslation();

  // Retrieve user data from local storage
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = userData.id || "";
  const userName = userData.email || "User";

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.email) {
      setPhone(userData.email);
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleSalesDropdown = () => {
    setSalesDropdownOpen(!salesDropdownOpen);
  };

  const toggleLanguageDropdown = () => {
    setLanguageDropdownOpen(!languageDropdownOpen);
  };

  const handleLanguageChange = (language) => {
    console.log(`Changing language to: ${language}`);
    i18n.changeLanguage(language);
    setLanguageDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const Navbar_Links = [
    { id: 1, name: "Predictions", path: "/farmer/predictions", icon: <BarChart3 className="text-xl" /> },
    { id: 2, name: "Stock", path: "/farmer/stock", icon: <MdInsights className="text-xl" /> },
    { 
      id: 3, 
      name: "Sales", 
      icon: <MdInsights className="text-xl" />, 
      isDropdown: true,
      subItems: [
        { id: "4a", name: "My Sales", path: "/farmer/sales" },
        { id: "4b", name: "Other Sales", path: "/farmer/all-sales" }
      ]
    },
    { id: 4, name: "Feedbacks", path: "/farmer/feedbacks", icon: <FaComments className="text-xl" /> },
  ];

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" }
  ];

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if any sales dropdown item is active
  const isSalesActive = () => {
    return location.pathname === "/farmer/sales" || location.pathname === "/farmer/all-sales";
  };

  // Get current language info
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <nav className="bg-gradient-to-r from-yellow-900 to-yellow-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/farmer/predictions" className="flex items-center">
              <img src={Logo} alt="Logo" className="h-12 w-auto rounded-full mr-2" />
              <span className="text-white font-bold text-xl hidden sm:block">{t("SSPMI")}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between space-x-1">
            {Navbar_Links.map((link) => (
              link.isDropdown ? (
                <div key={link.id} className="relative">
                  <button
                    onClick={toggleSalesDropdown}
                    className={`text-white flex items-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                      isSalesActive()
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white font-medium"
                        : "hover:bg-yellow-700 hover:text-yellow-400"
                    }`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{t(link.name)}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {salesDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50">
                      {link.subItems.map((subItem) => (
                        <Link
                          key={subItem.id}
                          to={subItem.path}
                          className={`block px-4 py-3 text-sm hover:bg-yellow-100 ${
                            isActive(subItem.path)
                              ? "bg-yellow-50 text-yellow-700 font-medium"
                              : "text-yellow-700"
                          } ${subItem.id === "4a" ? "rounded-t-md" : ""} ${subItem.id === "4b" ? "rounded-b-md" : ""}`}
                          onClick={() => setSalesDropdownOpen(false)}
                        >
                          {t(subItem.name)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.id}
                  to={link.path}
                  className={`text-white flex items-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                    isActive(link.path)
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white font-medium"
                      : "hover:bg-yellow-700 hover:text-yellow-400"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{t(link.name)}</span>
                </Link>
              )
            ))}
          </div>

          {/* User Menu & Language Selector (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={toggleLanguageDropdown}
                className="flex items-center text-white space-x-2 rounded-md px-3 py-2 hover:bg-yellow-700 transition-colors"
              >
                <Languages className="h-5 w-5" />
                <span className="font-medium">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {languageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`block w-full text-left px-4 py-3 text-sm hover:bg-yellow-100 ${
                        i18n.language === language.code
                          ? "bg-yellow-50 text-yellow-700 font-medium"
                          : "text-gray-700"
                      } ${language.code === "en" ? "rounded-t-md" : ""} ${language.code === "rw" ? "rounded-b-md" : ""}`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                        {i18n.language === language.code && (
                          <span className="ml-auto text-yellow-600">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="flex items-center text-white space-x-2 rounded-md px-3 py-2 hover:bg-yellow-700 transition-colors"
              >
                <FaUserCircle className="text-xl" />
                <span className="font-medium">{userName}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <Link 
                    to={`/farmer/profile/${userId}`}
                    className="block px-4 py-3 text-sm text-yellow-700 hover:bg-yellow-100 rounded-t-md"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="flex items-center">
                      <FaUserCircle className="mr-2" />
                      {t("My Profile")}
                    </div>
                  </Link>
                  <div className="border-t border-yellow-100"></div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm text-yellow-600 hover:bg-yellow-100 rounded-b-md"
                  >
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("Logout")}
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-yellow-400 focus:outline-none p-2 rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-yellow-900 to-yellow-800 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-yellow-700">
          <div className="flex items-center">
            <img src={Logo} alt="Logo" className="h-10 w-auto mr-2" />
            <h2 className="text-white text-lg font-semibold">{t("Smart Sunflower")}</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-yellow-400 focus:outline-none p-2 rounded-full hover:bg-yellow-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* User Info in Mobile Menu */}
        <div className="p-4 border-b border-yellow-700">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-700 rounded-full p-2">
              <FaUserCircle className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-white font-medium">{userName}</p>
              <p className="text-yellow-400 text-sm">{phone}</p>
            </div>
          </div>
        </div>

        {/* Language Selector in Mobile Menu */}
        <div className="p-4 border-b border-yellow-700">
          <div className="mb-2">
            <p className="text-white text-sm font-medium mb-2 flex items-center">
              <Languages className="h-4 w-4 mr-2" />
              Language / Langue / Ururimi
            </p>
            <div className="grid grid-cols-1 gap-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    handleLanguageChange(language.code);
                    setIsOpen(false);
                  }}
                  className={`flex items-center space-x-2 p-2 rounded-md transition-colors text-sm ${
                    i18n.language === language.code
                      ? "bg-yellow-600 text-white"
                      : "text-yellow-100 hover:bg-yellow-700"
                  }`}
                >
                  <span>{language.flag}</span>
                  <span>{language.name}</span>
                  {i18n.language === language.code && (
                    <span className="ml-auto">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col p-4">
          {Navbar_Links.map((link) => (
            link.isDropdown ? (
              <div key={link.id}>
                <button
                  onClick={() => setSalesDropdownOpen(!salesDropdownOpen)}
                  className={`text-white flex items-center justify-between w-full space-x-3 p-3 rounded-md transition-colors duration-200 mb-2 ${
                    isSalesActive()
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "hover:bg-yellow-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{link.icon}</span>
                    <span>{t(link.name)}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transform transition-transform ${salesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {salesDropdownOpen && (
                  <div className="ml-4 mb-2">
                    {link.subItems.map((subItem) => (
                      <Link
                        key={subItem.id}
                        to={subItem.path}
                        className={`text-white flex items-center space-x-3 p-2 pl-8 rounded-md transition-colors duration-200 mb-1 text-sm ${
                          isActive(subItem.path)
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "hover:bg-yellow-700"
                        }`}
                        onClick={() => {
                          setIsOpen(false);
                          setSalesDropdownOpen(false);
                        }}
                      >
                        <span>{t(subItem.name)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.id}
                to={link.path}
                className={`text-white flex items-center space-x-3 p-3 rounded-md transition-colors duration-200 mb-2 ${
                  isActive(link.path)
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "hover:bg-yellow-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{t(link.name)}</span>
              </Link>
            )
          ))}
          
          <div className="border-t border-yellow-700 my-4"></div>
          
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="text-white hover:text-yellow-400 flex items-center space-x-3 p-3 rounded-md hover:bg-yellow-700 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>{t("Logout")}</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Customer_Header;