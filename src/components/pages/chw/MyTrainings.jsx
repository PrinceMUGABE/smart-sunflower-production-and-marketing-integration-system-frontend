/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

function CommunityHealthWorkTrainings() {
  const [trainingData, setTrainingData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [trainingsPerPage] = useState(5);
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
      const res = await axios.get("http://127.0.0.1:8000/trainingCandidate/my_trainings/", axiosConfig);
      if (Array.isArray(res.data)) {
        setTrainingData(res.data);
      } else {
        setTrainingData([]);
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#training-table" });
    doc.save("trainings.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(trainingData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "trainings");
    XLSX.writeFile(workbook, "trainings.xlsx");
  };

  const filteredData = trainingData.filter(
    (training) =>
      training.user?.phone?.toLowerCase().includes(searchQuery.toLowerCase()) || // Check if user exists
      training.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.created_at?.includes(searchQuery)
  );

  const indexOfLastTraining = currentPage * trainingsPerPage;
  const indexOfFirstTraining = indexOfLastTraining - trainingsPerPage;
  const currentTrainings = filteredData.slice(indexOfFirstTraining, indexOfLastTraining);
  const totalPages = Math.ceil(filteredData.length / trainingsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Your Registered Trainings
      </h1>

      {/* Display total number of trainings */}
      <p className="text-center text-blue-700 font-bold mb-4">
        Number of Registered Trainings: <span className="text-orange-600 font-bold">{filteredData.length}</span>
      </p>

      <div className="flex flex-col md:flex-row justify-between mb-4">
      <Link
          to="/chw"
          className="px-4 py-2 bg-blue-500 text-white rounded mb-4 md:mb-0"
        >
          Enroll New Training
        </Link>
        {/* <div className="flex items-center space-x-2 mb-4 md:mb-0">
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
        </div> */}

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
          id="training-table"
          className="min-w-full text-sm text-left text-gray-500"
        >
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Created by
              </th>
              <th scope="col" className="px-6 py-3">
                Name of Training
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              {/* <th scope="col" className="px-6 py-3">
                Created Date
              </th> */}
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {currentTrainings.length > 0 ? (
              currentTrainings.map((training) => (
                <tr key={training.id} className="bg-white border-b">
                  <td className="px-6 py-4 font-medium">{training.user?.phone || "N/A"}</td> {/* Handle undefined user */}
                  <td className="px-6 py-4">{training.training.name}</td>
                  <td className="px-6 py-4">{training.status}</td>
                  {/* <td className="px-6 py-4">
                    {training.created_at
                      ? new Date(training.created_at).toLocaleDateString()
                      : "N/A"}
                  </td> */}
                  <td className="px-6 py-4 flex items-center space-x-2">
                    <Link to={`/chw/myTrainingDetails/${training.id}`}>
                      <FontAwesomeIcon icon={faEye} className="text-blue-500" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  No trainings found
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

export default CommunityHealthWorkTrainings;
