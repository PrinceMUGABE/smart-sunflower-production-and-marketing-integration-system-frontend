/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ArrowPathIcon } from "@heroicons/react/20/solid"; // Using ArrowPathIcon for spinner

const AdminViewTraining = () => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false); // Loading state for spinner
  const [errorMessage, setErrorMessage] = useState(""); // Error message to show on the page

  // Fetch the training data by ID
  useEffect(() => {
    const token = localStorage.getItem("token"); // Retrieve the token from local storage

    if (!token) {
      console.error("No token found. User is not authenticated.");
      setErrorMessage("No token found. Please login first.");
      return; // Stop the request if there's no token
    }

    setLoading(true); // Start loading before making the request
    axios
      .get(`http://127.0.0.1:8000/training/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      })
      .then((res) => {
        if (res.data) {
          setData(res.data); // Set the fetched training data
        }
      })
      .catch((err) => {
        setErrorMessage(err.response?.data?.message || "Error fetching training data.");
      })
      .finally(() => {
        setLoading(false); // Stop loading after the request finishes
      });
  }, [id]);

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Training Information
        </h2>
      </div>

      {loading && (
        <div className="flex justify-center">
          <ArrowPathIcon className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      )}

      {errorMessage && (
        <div className="text-red-600 text-center">
          <p>{errorMessage}</p>
        </div>
      )}

      {!loading && !errorMessage && (
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Created By:
              </label>
              <div className="mt-2 text-gray-700">
                {data.created_by?.phone || "N/A"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Training Name:
              </label>
              <div className="mt-2 text-gray-700">
                {data.name || "N/A"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Uploaded Materials:
              </label>
              <div className="mt-2">
                {data.materials ? (
                  <a
                  href={`http://127.0.0.1:8000${data.materials}`} // Point to Django's media route
                  className="text-indigo-600 hover:text-indigo-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Materials
                </a>
                
                ) : (
                  <span className="text-gray-500">No materials uploaded</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Created At:
              </label>
              <div className="mt-2 text-gray-700">
                {data.created_at ? new Date(data.created_at).toLocaleString() : "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewTraining;
