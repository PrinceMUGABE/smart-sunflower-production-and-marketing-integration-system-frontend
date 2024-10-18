/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import { ArrowPathIcon } from "@heroicons/react/20/solid";

const CommunityHealthWork_ViewTrainingDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // Initialize the useNavigate hook

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }

    setLoading(true);
    axios
      .get(`http://127.0.0.1:8000/trainingCandidate/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        setErrorMessage(
          err.response?.data?.message || "Error fetching training data."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const renderRole = (role) => {
    switch (role) {
      case "citizen":
        return "Citizen";
      case "ceho":
        return "Community Environment Chief Officer";
      case "chw":
        return "Community Health Worker";
      default:
        return "Unknown Role";
    }
  };

  // Function to format date and time in English format
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  };

  // Handle redirection to the exam page when the "Take Exam" button is clicked
  // Handle redirection to the exam page when the "Take Exam" button is clicked
const handleTakeExam = () => {
  if (data.training && data.training.id) {
    navigate(`/chw/takeExam/${data.training.id}`);
  } else {
    console.error("Training data is not available.");
  }
};


  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Name of Training:{" "}
          <span className="text-yellow-900 font-bold">
            {data.training?.name || "N/A"}
          </span>
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
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Training Information */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="block">
                  <label className="block text-sm font-medium text-gray-700">
                    Assistant
                  </label>
                  <span className="text-gray-900">
                    {data.training?.created_by?.phone || "N/A"}
                  </span>
                </div>
                <div className="block">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span className="text-gray-900">{data.status || "N/A"}</span>
                </div>
                <div className="block">
                  <span className="text-gray-900">
                    {data.training?.materials ? (
                      <a
                        href={`http://127.0.0.1:8000${data.training.materials}`}
                        className="text-indigo-600 hover:text-indigo-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Materials
                      </a>
                    ) : (
                      <span className="text-gray-500">
                        No materials uploaded
                      </span>
                    )}
                  </span>
                </div>
                <div className="block">
                  <label className="block text-sm font-medium text-gray-700">
                    Created At
                  </label>
                  <span className="text-red-600">
                    {data.created_at
                      ? formatDateTime(data.created_at)
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Take Exam Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleTakeExam}
              className="px-6 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition"
            >
              Take Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityHealthWork_ViewTrainingDetails;
