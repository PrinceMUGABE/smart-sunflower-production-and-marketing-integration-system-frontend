/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css'; // Ensure your CSS is imported properly
import { useNavigate } from 'react-router-dom';

function CommunityHealthWorkHome() {
  const [trainingsData, setTrainingsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const trainingsPerPage = 9; // Show 9 trainings per page (3x3 grid)
  const navigate = useNavigate(); // Use the navigate hook

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trainingsRes = await axios.get('http://127.0.0.1:8000/training/trainings/');
        if (trainingsRes.data) {
          setTrainingsData(trainingsRes.data);
        }
      } catch (error) {
        console.error('Error fetching trainings:', error);
      }
    };
    fetchData();
  }, []);

  // Pagination logic
  const indexOfLastTraining = currentPage * trainingsPerPage;
  const indexOfFirstTraining = indexOfLastTraining - trainingsPerPage;
  const currentTrainings = trainingsData.slice(indexOfFirstTraining, indexOfLastTraining);

  // Handling page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(trainingsData.length / trainingsPerPage);
  // Function to navigate to the apply form with the selected training id
  const handleEnrollClick = (trainingId) => {
    navigate(`/chw/apply-training/${trainingId}`); // Pass the training ID in the URL
  };

  return (
    <div className="mt-20">
      <h2 className="text-lg font-semibold mb-4 text-center text-black">Trainings</h2>

      {/* Display cards in a 3x3 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {currentTrainings.map((training, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-md font-semibold text-black mb-2">{training.name}</h3>
            <p className="text-sm text-gray-600">Assistant: {training.created_by?.phone || 'Unknown'}</p>
            <p className="text-sm text-gray-600">Created on: {new Date(training.created_at).toLocaleDateString()}</p>
            <button
              className="mt-4 bg-indigo-500 text-white rounded-md px-4 py-2"
              onClick={() => handleEnrollClick(training.id)} // Pass training ID to the form
            >
              Enroll
            </button>
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

export default CommunityHealthWorkHome;
