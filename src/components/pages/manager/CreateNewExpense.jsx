/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Camera, Upload, Loader } from "lucide-react";

const ManagerCreateNewExpense = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const [formData, setFormData] = useState({
    video: null,
    receipt: null,
    category: "Choose Category",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoPreview, setVideoPreview] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  // Automatically start the camera when the component loads
  useEffect(() => {
    startCamera();
    return () => stopCamera(); // Clean up camera stream on unmount
  }, []);

  // Start the camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      streamRef.current = stream;
    } catch (err) {
      setErrors((prev) => ({ ...prev, video: "Failed to access camera." }));
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Start video recording
  const startRecording = () => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current);
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const videoURL = URL.createObjectURL(blob);
      setVideoPreview(videoURL);
      setFormData((prev) => ({ ...prev, video: blob }));
      stopCamera(); // Stop the camera once the recording ends
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  // Stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validFormats = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];
      if (validFormats.includes(file.type)) {
        setFormData((prev) => ({ ...prev, receipt: file }));
        setSelectedFileName(file.name);
        setErrors((prev) => ({ ...prev, receipt: "" }));
      } else {
        setErrors((prev) => ({
          ...prev,
          receipt: "Please upload a valid PDF or image file (PNG, JPEG, JPG).",
        }));
      }
    }
  };

  // Validate fields
  const validateFields = () => {
    const newErrors = {};

    if (formData.category === "Choose Category") {
      newErrors.category = "You must select a category.";
    }
    if (!formData.video) {
      newErrors.video = "You must record a video.";
    }
    if (!formData.receipt) {
      newErrors.receipt = "You must upload a receipt.";
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateFields();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("video", formData.video);
    formDataToSubmit.append("receipt", formData.receipt);
    formDataToSubmit.append("category", formData.category);

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://127.0.0.1:8000/expense/create/",
        formDataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setMessage("Expense saved successfully!");
        setTimeout(() => navigate("/manager/expenses"), 2000);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        form:
          error.response?.data?.error ||
          "An unexpected error occurred. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-5/6 max-w-4xl bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-bold">Create New Expense</h2>

        {errors.form && <p className="text-red-600 mt-4">{errors.form}</p>}
        {message && <p className="text-green-600 mt-4">{message}</p>}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {/* Video Recording Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Record Video
            </label>
            <div className="mt-2">
              {videoPreview ? (
                <video
                  src={videoPreview}
                  className="w-full h-48 bg-black rounded-lg"
                  controls
                />
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-48 bg-black rounded-lg"
                  autoPlay
                  muted
                />
              )}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`pointer px-4 py-2 ${
                    isRecording ? "bg-red-600" : "bg-blue-600"
                  } text-white rounded-md hover:opacity-90`}
                  disabled={!streamRef.current}
                >
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </button>
              </div>
              {errors.video && (
                <p className="text-red-500 mt-1">{errors.video}</p>
              )}
            </div>
          </div>

          {/* Receipt Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Receipt (PDF or Image)
            </label>
            <div className="mt-2">
              <label className="block cursor-pointer text-black">
                <Upload className="w-4 h-4 inline mr-2 text-black" />
                {selectedFileName || "Choose PDF or Image file"}
                <input
                  type="file"
                  className="text-black"
                  accept=".png,.jpeg,.jpg"
                  onChange={handleFileChange}
                />
              </label>
              {errors.receipt && (
                <p className="text-red-500 mt-1">{errors.receipt}</p>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
            >
              <option value="Choose Category" disabled>
                Choose Category
              </option>
              <option value="toll">Toll</option>
              <option value="fuel">Fuel</option>
              <option value="parking">Parking</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
            {errors.category && (
              <p className="text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? (
                <span className="flex justify-center items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" /> Saving...
                </span>
              ) : (
                "Save Expense"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerCreateNewExpense;
