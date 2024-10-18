/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

function AdminManageExams() {
  const [examData, setExamData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [examsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
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
      const res = await axios.get("http://127.0.0.1:8000/exam/exams/", axiosConfig);
      setExamData(Array.isArray(res.data) ? res.data : []);
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
    const confirmDelete = window.confirm("Do you want to delete this exam?");
    if (confirmDelete) {
      try {
        const res = await axios.delete(`http://127.0.0.1:8000/exam/delete/${id}/`, axiosConfig);
        if (res.status === 204) {
          setExamData((prevData) => prevData.filter((exam) => exam.id !== id));
        } else {
          alert("Failed to delete exam");
        }
      } catch (err) {
        alert("An error occurred while deleting the exam");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#exam-table" });
    doc.save("exams.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(examData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "exams");
    XLSX.writeFile(workbook, "exams.xlsx");
  };

  const filteredData = examData.filter(
    (exam) =>
      exam.created_by.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.training.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.created_at?.includes(searchQuery)
  );

  const indexOfLastExam = currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  const currentExams = filteredData.slice(indexOfFirstExam, indexOfLastExam);
  const totalPages = Math.ceil(filteredData.length / examsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openEditModal = (exam) => {
    setSelectedExam(exam);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setSelectedExam(null);
  };

  const handleUpdateExam = async (updatedExam) => {
    try {
      const res = await axios.put(`http://127.0.0.1:8000/exam/update/${updatedExam.id}/`, updatedExam, axiosConfig);
      if (res.status === 200) {
        setExamData((prevData) => prevData.map((exam) => (exam.id === updatedExam.id ? updatedExam : exam)));
        closeEditModal();
      }
    } catch (err) {
      alert("An error occurred while updating the exam");
    }
  };

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">Manage Exams</h1>

      <div className="flex flex-col md:flex-row justify-between mb-4">
        <Link to="/admin/createExam" className="px-4 py-2 bg-blue-500 text-white rounded mb-4 md:mb-0">
          Create New Exam
        </Link>

        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <button onClick={handleDownloadPDF} className="px-4 py-2 bg-green-500 text-white rounded">
            Download PDF
          </button>
          <button onClick={handleDownloadExcel} className="px-4 py-2 bg-yellow-500 text-white rounded">
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
        <table id="exam-table" className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Training</th>
              <th scope="col" className="px-6 py-3">Created by</th>
              <th scope="col" className="px-6 py-3">Created Date</th>
              {/* <th scope="col" className="px-6 py-3">Total Marks</th> */}
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {currentExams.length > 0 ? (
              currentExams.map((exam) => (
                <tr key={exam.id} className="bg-white border-b">
                  <td className="px-6 py-4 font-medium">{exam.training.name}</td>
                  <td className="px-6 py-4">{exam.created_by.phone}</td>
                  <td className="px-6 py-4">
                    {exam.created_at ? new Date(exam.created_at).toLocaleDateString() : "N/A"}
                  </td>
                  {/* <td className="px-6 py-4">{exam.total_marks}</td> */}
                  <td className="px-6 py-4 flex items-center space-x-2">
                    <Link to={`/admin/viewExam/${exam.id}`}>
                      <FontAwesomeIcon icon={faEye} className="text-blue-500" />
                    </Link>
                    {/* <Link to={`/admin/editexam/${exam.id}`} onClick={() => openEditModal(exam)}>
                      <FontAwesomeIcon icon={faEdit} className="text-green-500" />
                    </Link> */}
                    <span onClick={() => handleDelete(exam.id)} className="cursor-pointer">
                      <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">No exams found</td> {/* Updated colspan */}
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

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-5">
            <h2 className="text-lg font-bold mb-4 text-black">Edit Exam</h2>
            {selectedExam && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const updatedExam = {
                  id: selectedExam.id,
                  training: selectedExam.training,
                  total_marks: e.target.total_marks.value,
                  // Include other fields as necessary
                };
                handleUpdateExam(updatedExam);
              }}>
                <div className="mb-4">
                  <label htmlFor="total_marks" className=" text-black block text-sm font-medium">Total Marks</label>
                  <input
                    type="number"
                    id="total_marks"
                    name="total_marks"
                    defaultValue={selectedExam.total_marks}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-black"
                    required
                  />
                </div>
                {/* Add more input fields as necessary */}
                <div className="flex justify-end">
                  <button type="button" onClick={closeEditModal} className="mr-2 bg-red-500 text-white rounded px-4 py-2">Cancel</button>
                  <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">Update</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AdminManageExams;
