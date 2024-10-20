/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LockClosedIcon, ArrowPathIcon } from "@heroicons/react/20/solid"; // For icons

const CitizenCreateAppointment = () => {
  const [workers, setWorkers] = useState([]); // Single state for workers dropdown
  const [data, setData] = useState({
    first_name: "",
    last_name: "",
    worker: "",
    address: "",
    details: "",
  }); // Form data
  const [loading, setLoading] = useState(false); // Loading state
  const [errorMessage, setErrorMessage] = useState(""); // Error messages
  const [materials, setMaterials] = useState(null); // File upload (if needed)
  const navigate = useNavigate();

  // Fetch workers when component loads
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }

    const fetchWorkers = async () => {
      try {
        const workersResponse = await axios.get(
          "http://127.0.0.1:8000/worker/workers/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Workers data fetched successfully:", workersResponse.data);
        setWorkers(workersResponse.data); // Set workers for dropdown
      } catch (error) {
        console.error("Error fetching workers:", error.response?.data || error.message);
        setErrorMessage("Error fetching workers. Please try again.");
      }
    };

    fetchWorkers();
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }

    setLoading(true); // Start loading
    setErrorMessage(""); // Clear any previous errors

    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("worker", data.worker);
    formData.append("address", data.address);
    formData.append("details", data.details);

    if (materials) {
      formData.append("materials", materials);
    }

    axios
      .post(`http://127.0.0.1:8000/appointment/create/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        alert("Appointment created successfully");
        navigate("/citizen/appointments");
      })
      .catch((err) => {
        setErrorMessage(
          err.response?.data?.message || "Error creating appointment."
        );
      })
      .finally(() => {
        setLoading(false); // Stop loading
      });
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create New Appointment
        </h2>
      </div>

      {errorMessage && (
        <div className="text-red-600 text-center">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
   
          {/* Updated worker Dropdown */}
          <div>
            <label
              htmlFor="worker"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Select Worker (Phone)
            </label>
            <div className="mt-2">
              <select
                id="worker"
                name="worker"
                value={data.worker || ""}
                onChange={(e) => setData({ ...data, worker: e.target.value })}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="" className="text-gray-900 bg-white">
                  Select worker
                </option>
                {workers.map((worker) => (
                  <option
                    key={worker.id}
                    value={worker.id}
                    className="text-gray-700 bg-white"
                  >
                    {worker.created_by.phone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* First Name */}
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              First Name
            </label>
            <div className="mt-2">
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={data.first_name || ""}
                onChange={(e) =>
                  setData({ ...data, first_name: e.target.value })
                }
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Last Name
            </label>
            <div className="mt-2">
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={data.last_name || ""}
                onChange={(e) =>
                  setData({ ...data, last_name: e.target.value })
                }
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Address
            </label>
            <div className="mt-2">
              <input
                id="address"
                name="address"
                type="text"
                value={data.address || ""}
                onChange={(e) => setData({ ...data, address: e.target.value })}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Details */}
          <div>
            <label
              htmlFor="details"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Details
            </label>
            <div className="mt-2">
              <textarea
                id="details"
                name="details"
                value={data.details || ""}
                onChange={(e) => setData({ ...data, details: e.target.value })}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Submit Button */}
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
                    className="h-5 w-5 text-white group-hover:text-purple-400"
                    aria-hidden="true"
                  />
                )}
              </span>
              {loading ? "Submitting..." : "Create appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CitizenCreateAppointment;
