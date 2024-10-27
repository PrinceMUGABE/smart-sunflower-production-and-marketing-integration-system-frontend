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

function ManageServices() {
  const [serviceData, setserviceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage] = useState(5);
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
      const res = await axios.get("http://127.0.0.1:8000/service/services/", axiosConfig);
      if (Array.isArray(res.data)) {
        setserviceData(res.data);
      } else {
        setserviceData([]);
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
    const confirmDelete = window.confirm("Do you want to delete this service?");
    if (confirmDelete) {
      try {
        const res = await axios.delete(
          `http://127.0.0.1:8000/service/delete/${id}/`,
          axiosConfig
        );
        if (res.status === 204) {
          setserviceData((prevData) => prevData.filter((service) => service.id !== id));
        } else {
          alert("Failed to delete service");
        }
      } catch (err) {
        alert("An error occurred while deleting the service");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#service-table" });
    doc.save("services.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(serviceData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "services");
    XLSX.writeFile(workbook, "services.xlsx");
  };

  const filteredData = serviceData.filter(
    (service) =>
      service.created_by.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.created_at?.includes(searchQuery)
  );

  const indexOfLastservice = currentPage * servicesPerPage;
  const indexOfFirstservice = indexOfLastservice - servicesPerPage;
  const currentservices = filteredData.slice(indexOfFirstservice, indexOfLastservice);
  const totalPages = Math.ceil(filteredData.length / servicesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage services
      </h1>

      <div className="flex flex-col md:flex-row justify-between mb-4">
        <Link
          to="/admin/createService"
          className="px-4 py-2 bg-blue-500 text-white rounded mb-4 md:mb-0"
        >
          Create New service
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
          id="service-table"
          className="min-w-full text-sm text-left text-gray-500"
        >
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Created by
              </th>
              <th scope="col" className="px-6 py-3">
                Name of service
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
            {currentservices.length > 0 ? (
              currentservices.map((service) => (
                <tr key={service.id} className="bg-white border-b">
                  <td className="px-6 py-4 font-medium">{service.created_by.phone}</td>
                  <td className="px-6 py-4">{service.name}</td>
                  <td className="px-6 py-4">
                    {service.created_at
                      ? new Date(service.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 flex items-center space-x-2">
                    <Link to={`/admin/viewService/${service.id}`}>
                      <FontAwesomeIcon icon={faEye} className="text-blue-500" />
                    </Link>
                    <Link to={`/admin/editService/${service.id}`}>
                      <FontAwesomeIcon icon={faEdit} className="text-green-500" />
                    </Link>
                    <span onClick={() => handleDelete(service.id)} className="cursor-pointer">
                      <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  No services found
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

export default ManageServices;
