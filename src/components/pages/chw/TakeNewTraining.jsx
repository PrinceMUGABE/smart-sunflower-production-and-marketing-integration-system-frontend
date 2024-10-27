/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import Webcam from "react-webcam"; // Import Webcam

const CommunityHealthWork_ApplyNewTraining = () => {
  const token = localStorage.getItem("token");
  const [data, setData] = useState({
    user: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [trainingName, setTrainingName] = useState(""); // State for training name
  const [imageSrc, setImageSrc] = useState(null); // State for captured image
  const [imageCaptured, setImageCaptured] = useState(false); // State to track if an image has been captured
  const navigate = useNavigate();
  const { trainingId } = useParams(); // Get training ID from URL
  const webcamRef = useRef(null); // Reference for the webcam

  // Function to check if trainingId is a valid number
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
  const handleSubmit = async (e) => {
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
    formData.append("user", data.user); // Assuming this is required
    formData.append("training_id", trainingId); // Use the valid trainingId

    // Submit the captured image as a base64 string
    if (imageSrc) {
      // Extract base64 string from the data URL
      const base64Image = imageSrc.split(',')[1]; // Gets the base64 string
      formData.append("image", base64Image); // Append the base64 string to FormData
    }

    // Log the submitted data for debugging
    console.log("Submitting data:", {
      user: data.user,
      training_id: trainingId,
      image: imageSrc ? imageSrc : null, // Log base64 image for debugging
    });

    // Make the API request
    axios.post('http://127.0.0.1:8000/trainingCandidate/create/', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // This header will be set automatically by axios when using FormData
      },
    })
    .then(() => {
      alert("Training Candidate created successfully");
      navigate("/chw/trainings");
    })
    .catch((err) => {
      console.error(err); // Log the error for debugging
      setErrorMessage(
        err.response?.data?.detail || "An unexpected error occurred."
      );
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // Capture image function
  const capture = () => {
    const capturedImageSrc = webcamRef.current.getScreenshot();
    setImageSrc(capturedImageSrc); // Set the captured image src
    setImageCaptured(true); // Update state to indicate that the image has been captured
  };

  // Retake image function
  const retakeImage = () => {
    setImageSrc(null); // Reset the image source
    setImageCaptured(false); // Reset the captured state
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

          {/* Webcam section */}
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Capture your image
            </label>
            {!imageCaptured ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  className="w-full max-w-xs rounded-md border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={capture}
                  className="mt-2 flex w-full justify-center rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Capture Image
                </button>
              </>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-gray-700">Captured Image:</p>
                <img src={imageSrc} alt="Captured" className="w-full max-w-xs rounded-md" />
                <button
                  type="button"
                  onClick={retakeImage}
                  className="mt-2 flex w-full justify-center rounded-md bg-red-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  Retake Picture
                </button>
              </div>
            )}
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
                "Confirm"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityHealthWork_ApplyNewTraining;
