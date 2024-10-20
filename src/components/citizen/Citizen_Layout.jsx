/* eslint-disable no-unused-vars */
import React from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import { Link } from "react-router-dom";

function Citizen_Layout() {
  return (
    <div className='bg-gray-100 min-h-screen'>
      <Header /> {/* Keep the Header outside for full width */}
      <div className='flex mb-5 overflow-x-auto'> {/* Allow horizontal scrolling */}
        {/* Main content */}
        <div className='flex-1 ml-4 md:ml-56'>
          <main className='p-4'>
            {/* Links for navigation */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 mb-20">
              <Link
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
              </Link>
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Citizen_Layout;
