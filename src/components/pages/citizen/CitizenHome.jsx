/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CitizenHome.css'; // Ensure your CSS is imported properly
import { Link, useNavigate } from 'react-router-dom';

function CitizenHome() {
  const [servicesData, setServicesData] = useState([]); // Change to servicesData
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 9; // Show 9 services per page (3x3 grid)
  const navigate = useNavigate(); // Use the navigate hook

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve the token from local storage or any other method you're using
        const token = localStorage.getItem('token'); // Adjust this if you're using a different storage method
  
        const servicesRes = await axios.get('http://127.0.0.1:8000/service/services/', {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the header
          },
        });
  
        if (servicesRes.data) {
          setServicesData(servicesRes.data);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // You might want to handle different error statuses here
        if (error.response && error.response.status === 401) {
          console.error('Unauthorized access - Redirecting to login');
          // Redirect to login or show an appropriate message
          // navigate('/login'); // Uncomment if you want to redirect
        }
      }
    };
    fetchData();
  }, []);
  

  // Pagination logic
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = servicesData.slice(indexOfFirstService, indexOfLastService);

  // Handling page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(servicesData.length / servicesPerPage);

  // Function to navigate to the apply form with the selected service id
  const handleEnrollClick = (serviceId) => {
    navigate(`/citizen/apply-service/${serviceId}`); // Pass the service ID in the URL
  };

  return (
    <div className="mt-20">
      <h2 className="text-lg font-semibold mb-4 text-center text-black">Available Services</h2>
      <p className='text-sm text-gray-400 text-center'>Choose a service and create an appointment with the community healthworkers to help you</p>

      {/* Display cards in a 3x3 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {currentServices.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-md font-semibold text-black mb-2">{service.name}</h3>
            <p className="text-sm text-gray-600">Assistant: {service.created_by?.phone || 'Unknown'}</p>
            <p className="text-sm text-gray-600 mb-20">Created on: {new Date(service.created_at).toLocaleDateString()}</p>
            <Link
              className="mt-32 bg-indigo-500 text-white rounded-md px-4 py-2 "
              to={"/citizen/createAppointment"}
            >
              Order appointmenr
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 mx-1 rounded-md ${page === currentPage ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CitizenHome;
