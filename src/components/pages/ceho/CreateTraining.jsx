/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { LockClosedIcon, ArrowPathIcon } from "@heroicons/react/20/solid"; // Using ArrowPathIcon for spinner

const CreateTraining = () => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false); // Loading state for spinner
  const [errorMessage, setErrorMessage] = useState(""); // Error message to show on the page
  const [materials, setMaterials] = useState(null); // State to handle file upload
  const navigate = useNavigate();

 
  // create the training data
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); // Retrieve the token from local storage

    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return; // Stop the request if there's no token
    }

    setLoading(true); // Start loading when the form is submitted
    setErrorMessage(""); // Clear any previous error message

    // Create a FormData object to send data including files
    const formData = new FormData();
    formData.append("name", data.name);
    if (materials) {
      formData.append("materials", materials); // Attach file if it exists
    }

    axios
      .post(`http://127.0.0.1:8000/training/create/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Important for file uploads
        },
      })
      .then((res) => {
        alert("Data created successfully");
        navigate("/admin/training"); // Navigate back to the trainings list page
      })
      .catch((err) => {
        setErrorMessage(err.response?.data?.message || "Error updating training.");
      })
      .finally(() => {
        setLoading(false); // Stop loading after the request finishes
      });
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create New Training
        </h2>
      </div>

      {errorMessage && (
        <div className="text-red-600 text-center">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Name
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                value={data.name || ""} // Ensure 'data.name' is handled safely
                onChange={(e) => setData({ ...data, name: e.target.value })}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="materials"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Upload Materials
            </label>
            <div className="mt-2">
              <input
                id="materials"
                name="materials"
                type="file"
                onChange={(e) => setMaterials(e.target.files[0])} // Handle file upload
                accept=".pdf,.mp4,.avi,.mkv" // Accept only specific formats
                className="block w-full text-gray-900"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-purple-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {loading ? (
                  <ArrowPathIcon
                    className="h-5 w-5 text-white animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <LockClosedIcon
                    className="h-5 w-5 text-purple-400 group-hover:text-indigo-400"
                    aria-hidden="true"
                  />
                )}
              </span>
              {loading ? "Updating..." : "create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTraining;
