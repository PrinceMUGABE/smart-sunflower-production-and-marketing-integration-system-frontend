/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

function CommunityHealthWorkManageReports() {
  const [reportData, setReportData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newReport, setNewReport] = useState({ activity: "", number: "" });
  const navigate = useNavigate();

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

  const handleFetch = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/report/user/", axiosConfig);
      if (Array.isArray(res.data)) {
        setReportData(res.data);
      } else {
        setReportData([]);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login");
      } else {
        console.error("Error fetching reports:", err);
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
    doc.autoTable({ html: "#report-table" });
    doc.save("reports.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "reports");
    XLSX.writeFile(workbook, "reports.xlsx");
  };

  const handleCreateReport = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/report/create/", newReport, axiosConfig);
      setShowCreateModal(false);
      handleFetch(); // Refresh the report list
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
      handleFetch(); // Refresh the report list
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/report/delete/${id}/`, axiosConfig);
        handleFetch(); // Refresh the report list
      } catch (error) {
        console.error("Error deleting report:", error);
      }
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
                    <button onClick={() => handleEdit(report)}>
                      <FontAwesomeIcon icon={faEdit} className="text-green-500" />
                    </button>
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
                currentPage === i + 1 ? "bg-indigo-600 text-white" : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      </div>

      {/* Modal for creating a report */}
      {showCreateModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-black">Create Report</h2>
            <input
              type="text"
              placeholder="Activity"
              value={newReport.activity}
              onChange={(e) => setNewReport({ ...newReport, activity: e.target.value })}
              className="text-gray-700"
            />
            <input
              type="number"
              placeholder="Number"
              value={newReport.number}
              onChange={(e) => setNewReport({ ...newReport, number: e.target.value })}
              className="text-gray-700"
            />
            <button className="text-white bg-blue-700 px-5" onClick={handleCreateReport}>Submit</button>
            <button className="text-black bg-red-700 px-3" onClick={() => setShowCreateModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Modal for editing a report */}
      {showEditModal && selectedReport && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-blue-700">Edit Report</h2>
            <input
              type="text"
              placeholder="Activity"
              value={selectedReport.activity}
              onChange={(e) => setSelectedReport({ ...selectedReport, activity: e.target.value })}
              className="text-gray-700"
            />
            <input
              type="number"
              placeholder="Number"
              value={selectedReport.number}
              onChange={(e) => setSelectedReport({ ...selectedReport, number: e.target.value })}
              className="text-gray-700"
            />
            <button className="text-white bg-blue-700 px-5" onClick={handleUpdateReport}>Update</button>
            <button className="text-white bg-red-700 px-5" onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

export default CommunityHealthWorkManageReports;
