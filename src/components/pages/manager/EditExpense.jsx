/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { LockClosedIcon, ArrowPathIcon } from "@heroicons/react/20/solid"; // Spinner

const ManagerEditExpense = () => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [receipt, setReceipt] = useState(null); // For receipt file
  const [video, setVideo] = useState(null); // For video file
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Fetch the existing expense data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. User is not authenticated.");
      setErrorMessage("No token found. Please login first.");
      return;
    }

    setLoading(true);
    axios
      .get(`http://127.0.0.1:8000/expense/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        setErrorMessage(err.response?.data?.message || "Error fetching expense data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Submit the updated data
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }

    const formData = new FormData();
    formData.append("amount", data.amount);
    formData.append("category", data.category);
    formData.append("date", data.date);
    formData.append("status", "approved"); // Set status to approved
    if (receipt) formData.append("receipt", receipt);
    if (video) formData.append("video", video);

    setLoading(true);
    axios
      .put(`http://127.0.0.1:8000/expense/update/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        alert("Expense updated successfully.");
        navigate("/manager/expenses"); // Redirect to the expense list
      })
      .catch((err) => {
        setErrorMessage(err.response?.data?.message || "Error updating expense.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-green-900">
          Update Expense
        </h2>
      </div>

      {errorMessage && (
        <div className="text-red-600 text-center">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">
              Amount
            </label>
            <div className="mt-2">
              <input
                id="amount"
                name="amount"
                type="number"
                value={data.amount || ""}
                onChange={(e) => setData({ ...data, amount: e.target.value })}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={data.category || ""}
              onChange={(e) => setData({ ...data, category: e.target.value })}
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
            >
              <option value="" disabled>
                Choose Category
              </option>
              <option value="toll">Toll</option>
              <option value="fuel">Fuel</option>
              <option value="parking">Parking</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">
              Date
            </label>
            <div className="mt-2">
              <input
                id="date"
                name="date"
                type="date"
                value={data.date || ""}
                onChange={(e) => setData({ ...data, date: e.target.value })}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Receipt */}
          <div>
            <label htmlFor="receipt" className="block text-sm font-medium leading-6 text-gray-900">
              Receipt (Optional)
            </label>
            <div className="mt-2">
              <input
                id="receipt"
                name="receipt"
                type="file"
                accept="image/*"
                onChange={(e) => setReceipt(e.target.files[0])}
                className="block w-full text-gray-900"
              />
            </div>
          </div>

          {/* Video
          <div>
            <label htmlFor="video" className="block text-sm font-medium leading-6 text-gray-900">
              Video (Optional)
            </label>
            <div className="mt-2">
              <input
                id="video"
                name="video"
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files[0])}
                className="block w-full text-gray-900"
              />
            </div>
          </div> */}

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {loading ? (
                  <ArrowPathIcon className="h-5 w-5 text-white animate-spin" aria-hidden="true" />
                ) : (
                  <LockClosedIcon
                    className="h-5 w-5 text-purple-400 group-hover:text-indigo-400"
                    aria-hidden="true"
                  />
                )}
              </span>
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerEditExpense;
