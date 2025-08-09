/* eslint-disable no-unused-vars */
import React from 'react';
import { Outlet } from 'react-router-dom';
import Customer_Header from './Header';

function Customer_Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-yellow-800">
      <Customer_Header />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

export default Customer_Layout;