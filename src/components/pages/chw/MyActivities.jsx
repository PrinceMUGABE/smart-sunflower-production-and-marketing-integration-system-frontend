/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

function CommunityHealthWorkManageActivities() {
  const [activityData, setactivityData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activitysPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedactivity, setSelectedactivity] = useState(null);
  const [newactivity, setNewactivity] = useState({ name: "" });

  const navigate = useNavigate();

  const storedUserData = localStorage.getItem("userData");
  const accessToken = storedUserData
    ? JSON.parse(storedUserData).access_token
    : null;

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    if (!accessToken) {
      alert("Unauthorized! Please log in again.");
      navigate("/login");
    }
  }, [accessToken, navigate]);

  const handleFetch = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/activity/user/",
        axiosConfig
      );
      if (Array.isArray(res.data)) {
        setactivityData(res.data);
      } else {
        setactivityData([]);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login");
      } else {
        console.error("Error fetching activitys:", err);
      }
    }
  };

  useEffect(() => {
    if (accessToken) {
      handleFetch();
    }
  }, [accessToken]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#activity-table" });
    doc.save("activitys.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(activityData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "activitys");
    XLSX.writeFile(workbook, "activitys.xlsx");
  };

  const handleCreateactivity = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/activity/create/",
        {
          name: newactivity.name, // Change 'activity' to 'name'
        },
        axiosConfig
      );
      setShowCreateModal(false);
      handleFetch(); // Refresh the activity list
    } catch (error) {
      console.error("Error creating activity:", error);
    }
  };

  const handleEdit = (activity) => {
    setSelectedactivity(activity);
    setShowEditModal(true);
  };

  const handleUpdateactivity = async () => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/activity/update/${selectedactivity.id}/`,
        selectedactivity,
        axiosConfig
      );
      setShowEditModal(false);
      handleFetch(); // Refresh the activity list
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await axios.delete(
          `http://127.0.0.1:8000/activity/delete/${id}/`,
          axiosConfig
        );
        handleFetch(); // Refresh the activity list
      } catch (error) {
        console.error("Error deleting activity:", error);
      }
    }
  };

  const filteredData = activityData.filter(
    (activity) =>
      activity.name?.toLowerCase().includes(searchQuery.toLowerCase()) || // Correct field is 'name'
      activity.created_at?.includes(searchQuery)
  );
  

  const indexOfLastactivity = currentPage * activitysPerPage;
  const indexOfFirstactivity = indexOfLastactivity - activitysPerPage;
  const currentactivitys = filteredData.slice(
    indexOfFirstactivity,
    indexOfLastactivity
  );
  const totalPages = Math.ceil(filteredData.length / activitysPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Your activitys
      </h1>

      <div className="flex flex-col md:flex-row justify-between mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded mb-4 md:mb-0"
          onClick={() => setShowCreateModal(true)}
        >
          Create New activity
        </button>

        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="px-4 py-2 bg-white text-black border rounded-full"
        />
      </div>

      <div
        className="overflow-auto"
        style={{ maxHeight: "400px", maxWidth: "100%" }}
      >
        <table
          id="activity-table"
          className="min-w-full text-sm text-left text-gray-500"
        >
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Created Date
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
  {currentactivitys.length > 0 ? (
    currentactivitys.map((activity) => (
      <tr key={activity.id} className="bg-white border-b">
        <td className="px-6 py-4 font-medium">
          {activity.name || "N/A"}  {/* Use activity.name */}
        </td>
        <td className="px-6 py-4">
          {activity.created_at
            ? new Date(activity.created_at).toLocaleDateString()
            : "N/A"}
        </td>
        <td className="px-6 py-4 flex items-center space-x-2">
          <button onClick={() => handleEdit(activity)}>
            <FontAwesomeIcon icon={faEdit} className="text-green-500" />
          </button>
          <button onClick={() => handleDelete(activity.id)}>
            <FontAwesomeIcon icon={faTrash} className="text-red-500" />
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="4" className="px-6 py-4 text-center">
        No activities found
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>

      <div className="flex justify-center mt-4">
        <nav className="relative z-0 inline-flex shadow-sm rounded-md">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`px-4 py-2 border text-sm font-medium ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      </div>

      {/* Modal for creating a activity */}
      {showCreateModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-black">Create activity</h2>
            <input
              type="text"
              placeholder="Activity"
              value={newactivity.name} // Change to name
              onChange={(e) =>
                setNewactivity({ ...newactivity, name: e.target.value })
              }
              className="text-gray-700"
            />

            <button
              className="text-white bg-blue-700 px-5"
              onClick={handleCreateactivity}
            >
              Submit
            </button>
            <button
              className="text-black bg-red-700 px-3"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal for editing a activity */}
      {showEditModal && selectedactivity && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-blue-700">Edit activity</h2>
            <input
              type="text"
              placeholder="Activity"
              value={selectedactivity.name} // Ensure this is correct
              onChange={(e) =>
                setSelectedactivity({
                  ...selectedactivity,
                  name: e.target.value,
                })
              }
              className="text-gray-700"
            />

            <button
              className="text-white bg-blue-700 px-5"
              onClick={handleUpdateactivity}
            >
              Update
            </button>
            <button
              className="text-white bg-red-700 px-5"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CommunityHealthWorkManageActivities;
