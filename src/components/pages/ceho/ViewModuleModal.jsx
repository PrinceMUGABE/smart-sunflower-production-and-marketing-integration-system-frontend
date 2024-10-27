/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";

function ViewModuleModal({ onClose, moduleId }) {
  const [moduleData, setModuleData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModuleData = async () => {
      const token = localStorage.getItem("token"); // Retrieve token from local storage

      if (!token) {
        setError("Authorization token is missing. Please log in again.");
        return;
      }

      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/training/module/${moduleId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setModuleData(res.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError("Unauthorized access. Please log in again.");
        } else {
          setError("Failed to load module data.");
        }
      }
    };
    fetchModuleData();
  }, [moduleId]);

  return (
    <div className="modal mt-6">
      <div className="modal-content">
        <h2 className="text-black font-semibold">Module Details</h2>
        {error ? (
          <p className="error text-red-700">{error}</p>
        ) : moduleData ? (
          <>
            <p className="text-black">
              <strong>Name:</strong>
              <span className="text-gray-700">{moduleData.name}</span>
            </p>
            <p className="text-black">
              <strong>Description:</strong>
              <span className="text-gray-700">{moduleData.description}</span>
            </p>
            <p className="text-black">
              <strong>Created At:</strong>
              <span className="text-red-700">
                {new Date(moduleData.created_at).toLocaleDateString()}
              </span>
            </p>
            <h3 className="text-black">Materials:</h3>
            {moduleData.materials && moduleData.materials.length > 0 ? (
              <ul className="text-red-700">
                {moduleData.materials.map((material, index) => (
                  <li key={index}>
                    <a
                      href={`http://127.0.0.1:8000${material.file}`} // Use absolute URL
                      target="_blank" // Open in a new tab
                      rel="noopener noreferrer" // Security for external links
                      className="text-blue-500 hover:underline"
                    >
                      View material {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-red-700">No materials available.</p>
            )}
          </>
        ) : (
          <p>Loading...</p>
        )}
        <div className="modal-actions">
          <button
            onClick={onClose}
            className="button-secondary bg-red-700 w-auto px-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewModuleModal;
