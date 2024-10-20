/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowPathIcon } from "@heroicons/react/20/solid";

const Citizen_ApplyNewTraining = () => {
  const token = localStorage.getItem("token");
  const [data, setData] = useState({
    first_name: "",
    last_name: "",
    user: "", // Assuming this is required; adjust based on your needs
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [trainingName, setTrainingName] = useState(""); // State for training name
  const navigate = useNavigate();
  const { trainingId } = useParams(); // Get training ID from URL

  // New: Function to check if trainingId is a valid number
  const isTrainingIdValid = (id) => {
    return id && !isNaN(id); // Ensures id exists and is a number
  };

  useEffect(() => {
    // Ensure the trainingId is valid
    if (!isTrainingIdValid(trainingId)) {
      setErrorMessage("Invalid training ID.");
    } else {
      setErrorMessage(""); // Clear error message if valid
      console.log("Training ID from URL:", trainingId);
      
      // Fetch training information based on trainingId
      axios
      .get(`http://127.0.0.1:8000/training/${trainingId}/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      })
        .then(response => {
          setTrainingName(response.data.name); // Adjust based on actual response structure
        })
        .catch(err => {
          setErrorMessage("Failed to fetch training information.");
        });
    }
  }, [trainingId]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }

    if (!isTrainingIdValid(trainingId)) {
      setErrorMessage("Invalid training ID.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("user", data.user); // Assuming this is required
    formData.append("training_id", trainingId); // Use the valid trainingId

    axios.post('http://127.0.0.1:8000/trainingCandidate/create/', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
    .then(() => {
      alert("Training Candidate created successfully");
      navigate("/citizen/trainings");
    })
    .catch((err) => {
      // Updated to display the actual error message from the response
      setErrorMessage(
        err.response?.data?.detail || "An unexpected error occurred."
      );
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Apply for Training
        </h2>
      </div>

      {errorMessage && (
        <div className="text-red-600 text-center">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
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
                value={data.first_name}
                onChange={(e) => setData({ ...data, first_name: e.target.value })}
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
                value={data.last_name}
                onChange={(e) => setData({ ...data, last_name: e.target.value })}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Training (display training name instead of ID) */}
          <div>
            <label
              htmlFor="training"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Selected Training
            </label>
            <div className="mt-2">
              <input
                id="training"
                name="training"
                type="text"
                value={trainingName} // Display the training name
                readOnly
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 bg-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default Citizen_ApplyNewTraining;
