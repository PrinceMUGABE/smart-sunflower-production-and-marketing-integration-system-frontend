/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

function AdminManageExamResults() {
  const [resultData, setresultData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(5);
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
      const res = await axios.get("http://127.0.0.1:8000/result/results/", axiosConfig);
      if (Array.isArray(res.data)) {
        setresultData(res.data);
      } else {
        setresultData([]);
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
    const confirmDelete = window.confirm("Do you want to delete this result?");
    if (confirmDelete) {
      try {
        const res = await axios.delete(
          `http://127.0.0.1:8000/result/delete/${id}/`,
          axiosConfig
        );
        if (res.status === 204) {
          setresultData((prevData) => prevData.filter((result) => result.id !== id));
        } else {
          alert("Failed to delete result");
        }
      } catch (err) {
        alert("An error occurred while deleting the result");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#result-table" });
    doc.save("results.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(resultData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "results");
    XLSX.writeFile(workbook, "results.xlsx");
  };

  const filteredData = resultData.filter(
    (result) =>
      result.created_by?.user?.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.created_by?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.created_by?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.exam?.training?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.created_at?.includes(searchQuery)
  );

  const indexOfLastresult = currentPage * resultsPerPage;
  const indexOfFirstresult = indexOfLastresult - resultsPerPage;
  const currentresults = filteredData.slice(indexOfFirstresult, indexOfLastresult);
  const totalPages = Math.ceil(filteredData.length / resultsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage results
      </h1>

      <div className="flex flex-col md:flex-row justify-between mb-4">
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
          id="result-table"
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
                Training Name
              </th>
              <th scope="col" className="px-6 py-3">
                Total Marks
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
  {currentresults.length > 0 ? (
    currentresults.map((result) => (
      <tr key={result.id} className="bg-white border-b">
        <td className="px-6 py-4 font-medium">{result.created_by?.first_name || "N/A"}</td>
        <td className="px-6 py-4">{result.created_by?.last_name || "N/A"}</td>
        <td className="px-6 py-4">{result.created_by?.user?.phone || "N/A"}</td>
        <td className="px-6 py-4">{result.exam?.training?.name || "N/A"}</td>
        <td className="px-6 py-4">{result.total_marks}</td>
        <td className="px-6 py-4">{result.status}</td>
        <td className="px-6 py-4">
          {result.created_at
            ? new Date(result.created_at).toLocaleDateString()
            : "N/A"}
        </td>
        <td className="px-6 py-4 flex items-center space-x-2">
          {/* <Link to={`/admin/viewresult/${result.id}`}>
            <FontAwesomeIcon icon={faEye} className="text-blue-500" />
          </Link>
          <Link to={`/admin/editresult/${result.id}`}>
            <FontAwesomeIcon icon={faEdit} className="text-green-500" />
          </Link> */}
          <span onClick={() => handleDelete(result.id)} className="cursor-pointer">
            <FontAwesomeIcon icon={faTrash} className="text-red-500" />
          </span>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="8" className="px-6 py-4 text-center">
        No results found
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

export default AdminManageExamResults;
