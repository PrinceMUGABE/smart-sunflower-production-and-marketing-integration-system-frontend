/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

function CitizenResults() {
  const [resultData, setResultData] = useState([]);
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

  const axiosConfig = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  }), [accessToken]);

  const handleFetch = useCallback(async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/result/candidate/", axiosConfig);
      setResultData(Array.isArray(res.data) ? res.data : []); // Ensure that we set resultData correctly
      console.log("Fetched Results:", res.data); // Log fetched data
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login");
      }
      console.error("Error fetching results:", err); // Log any errors
    }
  }, [axiosConfig, navigate]);

  useEffect(() => {
    if (accessToken) {
      handleFetch();
    }
  }, [accessToken, handleFetch]);

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

  const filteredData = resultData.filter((result) =>
    (result.exam.training.name && result.exam.training.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (result.total_marks && result.total_marks.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
    (result.status && result.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (result.created_at && result.created_at.includes(searchQuery))
  );

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredData.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(filteredData.length / resultsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">Your Awards</h1>
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="px-4 py-2 bg-white text-black border rounded-full"
        />
        <div className="mt-2 md:mt-0">
          <button onClick={handleDownloadPDF} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
            Download PDF
          </button>
          <button onClick={handleDownloadExcel} className="bg-green-500 text-white px-4 py-2 rounded">
            Download Excel
          </button>
        </div>
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table id="result-table" className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Training</th>
              <th scope="col" className="px-6 py-3">Score</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentResults.length > 0 ? (
              currentResults.map((result) => (
                <tr key={result.id} className="bg-white border-b">
                  <td className="px-6 py-4 font-medium">{result.exam.training.name|| "N/A"}</td>
                  <td className="px-6 py-4">{result.total_marks}</td>
                  <td className="px-6 py-4">{result.status}</td>
                  <td className="px-6 py-4">
                    {result.created_at ? new Date(result.created_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/citizen/viewCertificate/${result.id}`} className="text-blue-600">View certificate</Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">No results found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="relative z-0 inline-flex shadow-sm rounded-md">
            {[...Array(totalPages)].map((_, i) => (
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
      )}
    </div>
  );
}

export default CitizenResults;
