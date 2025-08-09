/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { 
  FaUserCircle, 
  FaSignOutAlt, 
  FaComments,
  FaCar, 
  FaTruckMoving,
  FaCashRegister,
  
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/pictures/minagri.jpg";
import { MdInsights } from "react-icons/md";

function Sidebar() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve user data from local storage
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = userData.id || "";

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Enhanced sidebar links with more appropriate icons
  const Sidebar_Links = [
    { id: 1, name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { id: 2, name: "Users", path: "/admin/users", icon: <Users size={20} /> },
    { id: 3, name: "Harvest", path: "/admin/harvest", icon: <Users size={20} /> },
    { id: 4, name: "Datasets", path: "/admin/datasets", icon: <Database size={20} /> },
    { id: 5, name: "Predictions", path: "/admin/predictions", icon: <BarChart3 size={20} /> },
    { id: 6, name: "Stock", path: "/admin/stock", icon: <MdInsights className="text-xl" /> },
    { id: 7, name: "Sales", path: "/admin/sales", icon: <FaCashRegister className="text-xl" /> },
    { id: 8, name: "Feedbacks", path: "/admin/feedbacks", icon: <FaComments className="text-xl" /> },
    { id: 9, name: "Profile", path: `/admin/profile/${userId}`, icon: <User size={20} /> },
  ];

  // Check if the current path matches the link path
  const isActiveLink = (path) => {
    return location.pathname === path || 
           (path !== "/admin" && location.pathname.startsWith(path));
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-yellow-800 p-2 rounded-md shadow-lg hover:bg-yellow-700 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col w-64 fixed left-0 top-0 h-screen bg-gradient-to-b from-yellow-900 to-yellow-800 shadow-xl z-40">
        {/* Logo and Title Section */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-yellow-700">
          <div className="bg-white p-1 rounded-md">
            <img src={Logo} alt="Logo" className="h-8 w-auto" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">SSPMI</h2>
            <p className="text-yellow-400 text-xs">Admin Panel</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col space-y-1 p-4 flex-grow overflow-y-auto">
          {Sidebar_Links.map((link) => (
            <Link
              key={link.id}
              to={link.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                isActiveLink(link.path)
                  ? "bg-green-600/20 text-white font-medium shadow-sm border-l-4 border-green-500"
                  : "text-yellow-300 hover:text-white hover:bg-yellow-700/30 border-l-4 border-transparent"
              }`}
            >
              <span className={`${isActiveLink(link.path) ? "text-green-400" : "text-yellow-400"}`}>
                {link.icon}
              </span>
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
        
        {/* Logout Section */}
        <div className="px-4 mt-auto mb-6">
          <div className="border-t border-yellow-700 pt-4 mt-4">
            <button
              onClick={handleLogout}
              className="text-yellow-300 hover:text-white flex items-center space-x-3 p-3 rounded-lg hover:bg-red-500/10 transition-all duration-200 w-full text-left group"
            >
              <LogOut size={20} className="text-yellow-400 group-hover:text-red-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-yellow-900 to-yellow-800 transform transition-all duration-300 ease-in-out z-50 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } md:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b border-yellow-700">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-md">
              <img src={Logo} alt="Logo" className="h-8 w-auto" />
            </div>
            <div>
              <h2 className="text-white font-bold">AgriTech</h2>
              <p className="text-yellow-400 text-xs">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="text-yellow-300 hover:text-white focus:outline-none hover:bg-yellow-700/50 p-1 rounded-full"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex flex-col h-[calc(100%-76px)]">
          <div className="flex flex-col space-y-1 p-4 flex-grow overflow-y-auto">
            {Sidebar_Links.map((link) => (
              <Link
                key={link.id}
                to={link.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isActiveLink(link.path)
                    ? "bg-green-600/20 text-white font-medium shadow-sm border-l-4 border-green-500"
                    : "text-yellow-300 hover:text-white hover:bg-yellow-700/30 border-l-4 border-transparent"
                }`}
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <span className={`${isActiveLink(link.path) ? "text-green-400" : "text-yellow-400"}`}>
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
          
          <div className="p-4 mt-auto">
            <div className="border-t border-yellow-700 pt-4 mt-4">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileSidebarOpen(false);
                }}
                className="text-yellow-300 hover:text-white flex items-center space-x-3 p-3 rounded-lg hover:bg-red-500/10 transition-all duration-200 w-full text-left group"
              >
                <LogOut size={20} className="text-yellow-400 group-hover:text-red-400" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-yellow-800 bg-opacity-50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}

export default Sidebar;