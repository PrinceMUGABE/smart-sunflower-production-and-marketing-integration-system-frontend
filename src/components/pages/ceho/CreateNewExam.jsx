/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LockClosedIcon, ArrowPathIcon } from "@heroicons/react/20/solid";

const AdminCreateExam = () => {
  const [trainings, setTrainings] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }

    const fetchTrainings = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/training/trainings/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrainings(response.data);
      } catch (error) {
        setErrorMessage("Error fetching trainings. Please try again.");
      }
    };

    fetchTrainings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }
  
    setLoading(true);
    setErrorMessage("");
  
    try {
      await axios.post(
        "http://127.0.0.1:8000/exam/create/",
        { training: selectedTraining },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Exam created successfully");
      navigate("/admin/exams");
    } catch (error) {
      console.error("Error creating exam:", error);
      let message = "Error creating the exam. Please try again.";
      if (error.response && error.response.data && error.response.data.error) {
        message = error.response.data.error; // Show the error message from the backend
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create New Exam
        </h2>
      </div>

      {errorMessage && (
        <div className="text-red-600 text-center mt-4">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="training" className="block text-sm font-medium leading-6 text-gray-900">
              Select Training
            </label>
            <div className="mt-2">
              <select
                id="training"
                name="training"
                value={selectedTraining}
                onChange={(e) => setSelectedTraining(e.target.value)}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">Select Training</option>
                {trainings.map((training) => (
                  <option key={training.id} value={training.id}>
                    {training.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-purple-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={loading}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {loading ? (
                  <ArrowPathIcon className="h-5 w-5 text-white animate-spin" aria-hidden="true" />
                ) : (
                  <LockClosedIcon className="h-5 w-5 text-white group-hover:text-purple-400" aria-hidden="true" />
                )}
              </span>
              {loading ? "Submitting..." : "Create Exam"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateExam;
