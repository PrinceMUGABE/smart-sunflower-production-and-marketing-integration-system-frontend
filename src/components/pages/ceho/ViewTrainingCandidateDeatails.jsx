/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ArrowPathIcon } from "@heroicons/react/20/solid";

const AdminViewTrainingCandidateDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Training Candidate Information
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
            {/* User Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Candidate Information
              </h3>
              <div className="space-y-2">
                <div className="block">
                  <label className="block text-sm font-medium text-gray-700">
                    Firstname
                  </label>
                  <span className="text-gray-900">{data.first_name || "N/A"}</span>
                </div>
                <div className="block">
                  <label className="block text-sm font-medium text-gray-700">
                    Lastname
                  </label>
                  <span className="text-gray-900">{data.last_name || "N/A"}</span>
                </div>
                <div className="block">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <span className="text-gray-900">{data.user?.phone || "N/A"}</span>
                </div>
                <div className="block">
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <span className="text-gray-900">
                    {data.user?.role ? renderRole(data.user.role) : "N/A"}
                  </span>
                </div>
                <div className="block">
                  <label className="block text-sm font-medium text-gray-700">
                    Registerd on
                  </label>
                  <span className="text-red-600">
                    {data.user?.created_at
                      ? formatDateTime(data.user.created_at)
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Training Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Training Information
              </h3>
              <div className="space-y-2">
                <div className="block">
                  <label className="block text-sm font-medium text-gray-700">
                    Training Name
                  </label>
                  <span className="text-gray-900">{data.training?.name || "N/A"}</span>
                </div>
                <div className="block">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span className="text-gray-900">{data.status || "N/A"}</span>
                </div>
                {/* <div className="block">
                  <label className="block text-sm font-medium text-gray-700">
                    Materials
                  </label>
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
                      <span className="text-gray-500">No materials uploaded</span>
                    )}
                  </span>
                </div> */}
                <div className="block">
                  <label className="block text-sm font-medium text-gray-700">
                    Created At
                  </label>
                  <span className="text-red-600">
                    {data.created_at ? formatDateTime(data.created_at) : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewTrainingCandidateDetails;
