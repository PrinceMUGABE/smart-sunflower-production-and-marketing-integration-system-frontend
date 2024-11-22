// eslint-disable-next-line no-unused-vars
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="bg-gray-100 min-h-screen overflow-auto">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="fixed md:relative z-10">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 md:ml-56 ml-16 md:overflow-x-auto overflow-auto">
          <Header />

          {/* Main Section Scrollable */}
          <main className="p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
