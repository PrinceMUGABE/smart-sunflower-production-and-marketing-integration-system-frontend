/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
// Import FontAwesome icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

function ManageWorkers() {
  const [workerData, setworkerData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [workersPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const storedUserData = localStorage.getItem("userData");
  const accessToken = storedUserData ? JSON.parse(storedUserData).access_token : null;

  useEffect(() => {
    if (!accessToken) {
      alert("Unauthorized! Please log in again.");
      navigate("/login");
    }
  }, [accessToken, navigate]);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  const handleFetch = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/worker/workers/", axiosConfig);
      if (Array.isArray(res.data)) {
        setworkerData(res.data);
      } else {
        setworkerData([]);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    if (accessToken) {
      handleFetch();
    }
  }, [accessToken]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this worker?");
    if (confirmDelete) {
      try {
        const res = await axios.delete(
          `http://127.0.0.1:8000/worker/delete/${id}/`,
        
          axiosConfig
        );
        if (res.status === 204) {
          setworkerData((prevData) => prevData.filter((worker) => worker.id !== id));
        } else {
          alert("Worker status changed successfully");
          navigate("/admin/worker");
        }
      } catch (err) {
        alert("An error occurred while deleting the worker");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#worker-table" });
    doc.save("workers.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(workerData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "workers");
    XLSX.writeFile(workbook, "workers.xlsx");
  };

  const filteredData = workerData.filter(
    (worker) =>
      worker.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.created_by.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.created_at?.includes(searchQuery)
  );

  const indexOfLastworker = currentPage * workersPerPage;
  const indexOfFirstworker = indexOfLastworker - workersPerPage;
  const currentworkers = filteredData.slice(indexOfFirstworker, indexOfLastworker);
  const totalPages = Math.ceil(filteredData.length / workersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Community workers
      </h1>

      <div className="flex flex-col md:flex-row justify-between mb-4">
        <Link
          to="/admin/createWorker"
          className="px-4 py-2 bg-blue-500 text-white rounded mb-4 md:mb-0"
        >
          Create New worker
        </Link>

        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Download PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Download Excel
          </button>
        </div>

        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="px-4 py-2 bg-white text-black border rounded-full"
        />
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table
          id="worker-table"
          className="min-w-full text-sm text-left text-gray-500"
        >
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Firstname
              </th>
              <th scope="col" className="px-6 py-3">
                Lastname
              </th>
              <th scope="col" className="px-6 py-3">
                Phone
              </th>
              <th scope="col" className="px-6 py-3">
                Status
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
            {currentworkers.length > 0 ? (
              currentworkers.map((worker) => (
                <tr key={worker.id} className="bg-white border-b">
                    <td className="px-6 py-4 font-medium">{worker.first_name}</td>
                    <td className="px-6 py-4 font-medium">{worker.last_name}</td>
                  <td className="px-6 py-4 font-medium">{worker.created_by.phone}</td>
                  <td className="px-6 py-4 font-medium">{worker.status}</td>
                  {/* <td className="px-6 py-4">{worker.training.name}</td> */}
                  <td className="px-6 py-4">
                    {worker.created_at
                      ? new Date(worker.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 flex items-center space-x-2">
                    <Link to={`/admin/viewWorker/${worker.id}`}>
                      <FontAwesomeIcon icon={faEye} className="text-blue-500" />
                    </Link>
                    <Link to={`/admin/editWorker/${worker.id}`}>
                      <FontAwesomeIcon icon={faEdit} className="text-green-500" />
                    </Link>
                    <span onClick={() => handleDelete(worker.id)} className="cursor-pointer">
                      <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  No workers found
                </td>
              </tr>
            )}
          </tbody>
        </table>

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
      </div>
    </>
  );
}

export default ManageWorkers;
