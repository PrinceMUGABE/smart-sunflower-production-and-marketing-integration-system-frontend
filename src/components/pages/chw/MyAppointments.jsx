/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

function CommunityHealthWorker_ManageAppointments() {
  const [appointmentData, setAppointmentData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const accessToken = localStorage.getItem("token");

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

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/appointment/worker_appointments/", axiosConfig);
      console.log("Appointments fetched from API:", res.data);  // Log fetched data
      setAppointmentData(res.data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login");
      }
    }
  };
  

  useEffect(() => {
    if (accessToken) {
      fetchAppointments();
    }
  }, [accessToken]);

  const handleDelete = async (id) => {
    if (window.confirm("Do you want to delete this appointment?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/appointment/delete/${id}/`, axiosConfig);
        setAppointmentData(prevData => prevData.filter(appointment => appointment.id !== id));
      } catch (err) {
        alert("Failed to delete appointment.");
        console.error("Error deleting appointment:", err);
      }
    }
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#appointment-table" });
    doc.save("appointments.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(appointmentData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "appointments");
    XLSX.writeFile(workbook, "appointments.xlsx");
  };

  const filteredData = appointmentData.filter(
    appointment =>
      appointment.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.created_date?.includes(searchQuery)
  );

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredData.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(filteredData.length / appointmentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Your Appointments
      </h1>
      <div className="flex justify-between mb-4">
        {/* <div>
          <button onClick={handleDownloadPDF} className="px-4 py-2 bg-green-500 text-white rounded mr-2">
            Download PDF
          </button>
          <button onClick={handleDownloadExcel} className="px-4 py-2 bg-yellow-500 text-white rounded">
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
        <table id="appointment-table" className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Citizen Firstname</th>
              <th className="px-6 py-3">Citizen Phone</th>
              <th className="px-6 py-3">Citizen Address</th>
              <th className="px-6 py-3">Created Date</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.length > 0 ? (
              currentAppointments.map(appointment => (
                <tr key={appointment.id} className="bg-white border-b">
                  <th className="px-6 py-4 font-medium">{appointment.first_name}</th>
                  <td className="px-6 py-4">{appointment.created_by.phone}</td>
                  <td className="px-6 py-4">{appointment.address}</td>
                  <td className="px-6 py-4">
                    {new Date(appointment.created_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/chw/viewAppointmentDetails/${appointment.id}`}>
                      <FontAwesomeIcon icon={faEye} className="text-blue-500" />
                    </Link>
                    <span onClick={() => handleDelete(appointment.id)} className="px-2 text-red-500 cursor-pointer">
                      <FontAwesomeIcon icon={faTrash} />
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">No appointments found</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <nav className="inline-flex shadow-sm">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => paginate(i + 1)} className={`px-4 py-2 border ${currentPage === i + 1 ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

export default CommunityHealthWorker_ManageAppointments;
