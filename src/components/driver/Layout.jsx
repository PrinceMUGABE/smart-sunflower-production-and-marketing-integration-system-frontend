/* eslint-disable no-unused-vars */
import React from 'react';
import Header from './Header';
import { Outlet, Link } from 'react-router-dom';

function DriverLayout() {
  // Retrieve user data from local storage
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const userId = userData.id || ''; // Fallback to an empty string if no id is found

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Full-width Header */}
      <Header />

      {/* Navigation Bar */}
      <nav className="bg-white shadow-md p-4 flex flex-wrap justify-center md:justify-start gap-4">
        <Link
          to="/driver"
          className="px-4 py-2 text-sm text-gray-700 bg-indigo-100 rounded hover:bg-indigo-200 transition"
        >
          Home
        </Link>
        <Link
          to="/driver/expenses"
          className="px-4 py-2 text-sm text-gray-700 bg-indigo-100 rounded hover:bg-indigo-200 transition"
        >
          Expenses
        </Link>
        <Link
          to="/driver/reimbursements"
          className="px-4 py-2 text-sm text-gray-700 bg-indigo-100 rounded hover:bg-indigo-200 transition"
        >
          Notification
        </Link>
        <Link
          to={`/driver/profile/${userId}`} // Dynamic route based on user ID
          className="px-4 py-2 text-sm text-gray-700 bg-indigo-100 rounded hover:bg-indigo-200 transition"
        >
          Profile
        </Link>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-16 ml-8 overflow-auto">
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DriverLayout;
