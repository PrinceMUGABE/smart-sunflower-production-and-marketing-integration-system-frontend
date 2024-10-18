/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import { FaBars } from 'react-icons/fa'; // Importing the hamburger icon
import axios from 'axios'; // Importing axios to fetch data

function Communit_Health_Work_Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trainings, setTrainings] = useState([]); // State to store fetched trainings

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };



  return (
    <div className='bg-gray-100 min-h-screen'>
      <div className='flex'>
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Main Content */}
        <div 
          className={`flex-1 ml-16 md:ml-56 transition-all duration-300 overflow-x-auto overflow-y-auto ${sidebarOpen ? 'ml-56' : 'ml-0'}`} 
          style={{ minWidth: '320px' }}  // Ensure a minimum width for scrolling on small screens
        >
          {/* Header */}
          <Header />

          {/* Hamburger Menu for small screens */}
          <button className="md:hidden p-4" onClick={toggleSidebar}>
            <FaBars className="h-6 w-6 text-gray-600" />
          </button>

          {/* Main Content Section */}
          <main className='p-4'>
            <Outlet />

          </main>
        </div>
      </div>
    </div>
  );
}

export default Communit_Health_Work_Layout;
