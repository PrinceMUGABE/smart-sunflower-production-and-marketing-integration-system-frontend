/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const userData = JSON.parse(localStorage.getItem('userData')); // Retrieve user data from localStorage

    if (!userData || !userData.access_token) {
        // If no user data or access token is found, redirect to login
        return <Navigate to="/login" />;
    }

    const userRole = userData.role?.trim().toLowerCase(); // Get the user role and normalize it

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Check if the user's role is allowed
        return <Navigate to="/unauthorized" />;
    }

    return <Outlet />; // Render child routes if all checks pass
};

export default ProtectedRoute;
