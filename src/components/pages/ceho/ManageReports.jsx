/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

function AdminManageReports() {
  const [reportData, setReportData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newReport, setNewReport] = useState({ activity: "", number: "" });
  const navigate = useNavigate();
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewedReport, setViewedReport] = useState(null);
  const [userData, setUserData] = useState(null);

  const storedUserData = localStorage.getItem("userData");
  const accessToken = storedUserData ? JSON.parse(storedUserData).access_token : null;

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

  useEffect(() => {
    if (accessToken) {
        fetchReports();
    }
  }, [accessToken]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#report-table" });
    doc.save("reports.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "reports");
    XLSX.writeFile(workbook, "reports.xlsx");
  };


  const fetchReports = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/report/reports/', axiosConfig);
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };
  
  useEffect(() => {
    if (accessToken) {
      fetchReports(); // Fetch reports when the component is mounted or when token changes
    }
  }, [accessToken]);
  
  

  const handleCreateReport = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/report/create/", newReport, axiosConfig);
      setShowCreateModal(false);
      fetchReports(); // Refresh the report list
  
    } catch (error) {
      console.error("Error creating report:", error);
    }
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setShowEditModal(true);
  };

  const handleUpdateReport = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/report/update/${selectedReport.id}/`, selectedReport, axiosConfig);
      setShowEditModal(false);
    //   handleFetch(); // Refresh the report list
    fetchReports()
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/report/delete/${id}/`, axiosConfig);
        // handleFetch(); // Refresh the report list
        fetchReports()
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
  };

  const handleView = async (report) => {
    try {
      const userRes = await axios.get(`http://127.0.0.1:8000/report/${report.id}/`, axiosConfig);
      setUserData(userRes.data);
      setViewedReport(report);
      setShowViewModal(true);
    } catch (error) {
      alert("Error fetching report details. Please try again.");
      console.error("Error fetching user data:", error);
    }
  };
  

  const filteredData = reportData.filter(
    (report) =>
      report.activity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.created_date?.includes(searchQuery)
  );

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredData.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredData.length / reportsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // Handle null or undefined dates
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Your Reports
      </h1>

      <div className="flex flex-col md:flex-row justify-between mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded mb-4 md:mb-0"
          onClick={() => setShowCreateModal(true)}
        >
          Create New Report
        </button>

        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="px-4 py-2 bg-white text-black border rounded-full"
        />
      </div>

      <div className="overflow-auto" style={{ maxHeight: "400px", maxWidth: "100%" }}>
        <table id="report-table" className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Number</th>
              <th scope="col" className="px-6 py-3">Created Date</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentReports.length > 0 ? (
              currentReports.map((report) => (
                <tr key={report.id} className="bg-white border-b">
                  <td className="px-6 py-4 font-medium">{report.activity || "N/A"}</td>
                  <td className="px-6 py-4">{report.number}</td>
                  <td className="px-6 py-4">
                    {report.created_date
                      ? new Date(report.created_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 flex items-center space-x-2">
                  <button onClick={() => handleView(report)}>
                      {" "}
                      {/* Eye icon for viewing report details */}
                      <FontAwesomeIcon icon={faEye} className="text-blue-500" />
                    </button>

                    {/* <button onClick={() => handleEdit(report)}>
                      <FontAwesomeIcon icon={faEdit} className="text-green-500" />
                    </button> */}
                    <button onClick={() => handleDelete(report.id)}>
                      <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  No reports found
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

      {showCreateModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-xl font-bold mb-4 text-black">Create Report</h2>
            <label className="block mb-2 text-gray-700">Activity:</label>
            <input
              type="text"
              value={newReport.activity}
              onChange={(e) => setNewReport({ ...newReport, activity: e.target.value })}
              className="border px-4 py-2 mb-4 text-gray-700"
            />
            <label className="block mb-2 text-gray-700">Number:</label>
            <input
              type="number"
              value={newReport.number}
              onChange={(e) => setNewReport({ ...newReport, number: e.target.value })}
              className="border px-4 py-2 mb-4 text-gray-700"
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleCreateReport}
            >
              Create
            </button>
            <button
              className="ml-2 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-xl font-bold mb-4 text-black">Edit Report</h2>
            <label className="block mb-2 text-gray-700">Activity:</label>
            <input
              type="text"
              value={selectedReport?.activity || ""}
              onChange={(e) => setSelectedReport({ ...selectedReport, activity: e.target.value })}
              className="border px-4 py-2 mb-4 text-gray-700"
            />
            <label className="block mb-2 text-gray-700">Number:</label>
            <input
              type="number"
              value={selectedReport?.number || ""}
              onChange={(e) => setSelectedReport({ ...selectedReport, number: e.target.value })}
              className="border px-4 py-2 mb-4 text-gray-700"
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleUpdateReport}
            >
              Update
            </button>
            <button
              className="ml-2 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showViewModal && viewedReport && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-xl font-bold mb-4">Report Details</h2>
            <p><strong>Activity:</strong> {viewedReport.activity || "N/A"}</p>
            <p><strong>Number:</strong> {viewedReport.number || "N/A"}</p>
            <p><strong>Created Date:</strong> {formatDate(viewedReport.created_date)}</p>

            {userData && (
              <>
                <p><strong>Created By:</strong> {userData.created_by.username}</p>
                <p><strong>Email:</strong> {userData.created_by.email}</p>
              </>
            )}

            <div className="flex justify-end mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}



{showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">
              Report Details
            </h2>
            <p className="text-gray-700">
              <strong>Activity:</strong> {viewedReport?.activity}
            </p>
            <p className="text-gray-700">
              <strong>Number:</strong> {viewedReport?.number}
            </p>
            <p className="text-gray-700">
              <strong>Created Date:</strong>{" "}
              <span className="text-red-700">
                {formatDate(viewedReport?.created_date)}{" "}
                {/* Format the report's created date */}
              </span>
            </p>

            {userData && (
              <>
                <h3 className="text-xl font-bold mt-4 text-blue-700">
                  User Information
                </h3>
                <p className="text-gray-700">
                  <strong>Name:</strong> {userData.created_by.phone}
                </p>
                <p className="text-gray-700">
                  <strong>Role:</strong> {userData.created_by.role}
                </p>
                <p className="text-gray-700">
                  <strong>Joined Date:</strong>{" "}
                  <span className="text-red-700">
                    {formatDate(userData.created_by.created_at)}{" "}
                    {/* Format the user's joined date */}
                  </span>
                </p>
              </>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


    </>
  );
}

export default AdminManageReports;
