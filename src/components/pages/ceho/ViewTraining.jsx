/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import CreateModuleModal from "./CreateModuleModal";
import EditModuleModal from "./EditModuleModal";
import ViewModuleModal from "./ViewModuleModal";

function AdminViewTraining() {
  const { id } = useParams();
  const [moduleData, setModuleData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [modulesPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(null);
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
      const res = await axios.get(`http://127.0.0.1:8000/training/modules/${id}/`, axiosConfig);
      if (Array.isArray(res.data)) {
        setModuleData(res.data);
      } else {
        setModuleData([]);
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

  const handleDelete = async (moduleId) => {
    const confirmDelete = window.confirm("Do you want to delete this module?");
    if (confirmDelete) {
      try {
        const res = await axios.delete(`http://127.0.0.1:8000/training/module/delete/${moduleId}/`, axiosConfig);
        if (res.status === 204) {
          setModuleData((prevData) => prevData.filter((module) => module.id !== moduleId));
        } else {
          alert("Failed to delete module");
        }
      } catch (err) {
        alert("An error occurred while deleting the module");
      }
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#module-table" });
    doc.save("modules.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(moduleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "modules");
    XLSX.writeFile(workbook, "modules.xlsx");
  };

  const filteredData = moduleData.filter((module) =>
    module.name?.toLowerCase().includes(searchQuery.toLowerCase()) || module.created_at?.includes(searchQuery)
  );

  const indexOfLastModule = currentPage * modulesPerPage;
  const indexOfFirstModule = indexOfLastModule - modulesPerPage;
  const currentModules = filteredData.slice(indexOfFirstModule, indexOfLastModule);
  const totalPages = Math.ceil(filteredData.length / modulesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Training Modules
      </h1>

      <div className="flex flex-col md:flex-row justify-between mb-4">
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-blue-500 text-white rounded mb-4 md:mb-0">
          Create New Module
        </button>

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
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 bg-white text-black border rounded-full"
        />
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table id="module-table" className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Module Name</th>
              <th scope="col" className="px-6 py-3">Created Date</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentModules.length > 0 ? (
              currentModules.map((module) => (
                <tr key={module.id} className="bg-white border-b">
                  <td className="px-6 py-4 font-medium">{module.name}</td>
                  <td className="px-6 py-4">{module.created_at ? new Date(module.created_at).toLocaleDateString() : "N/A"}</td>
                  <td className="px-6 py-4 flex items-center space-x-2">
                    <span onClick={() => setShowViewModal(module.id)} className="cursor-pointer">
                      <FontAwesomeIcon icon={faEye} className="text-blue-500" />
                    </span>
                    <span onClick={() => setShowEditModal(module.id)} className="cursor-pointer">
                      <FontAwesomeIcon icon={faEdit} className="text-green-500" />
                    </span>
                    <span onClick={() => handleDelete(module.id)} className="cursor-pointer">
                      <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  No modules found
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
                  currentPage === i + 1 ? "bg-indigo-600 text-white" : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Create, Edit, and View Modals */}
      <br />    <br /> <br />
      {showCreateModal && <CreateModuleModal onClose={() => setShowCreateModal(false)} onSave={handleFetch} trainingId={id} />}
      {showEditModal && <EditModuleModal onClose={() => setShowEditModal(null)} onSave={handleFetch} moduleId={showEditModal} />}
      {showViewModal && <ViewModuleModal onClose={() => setShowViewModal(null)} moduleId={showViewModal} />}
    </>
  );
}

export default AdminViewTraining;
