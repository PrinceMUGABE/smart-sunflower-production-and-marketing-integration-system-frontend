/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";

function Citizen_ManageAppointments() {
  const [appointmentData, setAppointmentData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const accessToken = localStorage.getItem("token");

  // Redirect to login if the user is not authenticated
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

  // Fetch appointment data
  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/appointment/user_appointments/", axiosConfig);
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

  // Fetch appointments on component mount
  useEffect(() => {
    if (accessToken) {
      fetchAppointments();
    }
  }, [accessToken]);

  // Handle appointment deletion
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

  // Handle search input change
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  // Generate PDF report
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#appointment-table" });
    doc.save("appointments.pdf");
  };

  // Generate Excel report
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(appointmentData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "appointments");
    XLSX.writeFile(workbook, "appointments.xlsx");
  };

  // Filter appointments based on search query
  const filteredData = appointmentData.filter(
    appointment =>
      appointment.appointed_to.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.appointed_to.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(appointment.created_date).toLocaleDateString().includes(searchQuery)
  );

  // Pagination logic
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

      {/* Button and search input */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <Link to="/citizen/createAppointment" className="px-4 py-2 bg-blue-500 text-white rounded mb-4 md:mb-0">
          Create New Appointment
        </Link>

        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="px-4 py-2 bg-white text-black border rounded-full"
        />
      </div>

      {/* Responsive table with horizontal scrolling */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table
          id="appointment-table"
          className="w-full min-w-[640px] text-sm text-left text-gray-500" // Set a minimum width
        >
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Worker Firstname</th>
              <th className="px-6 py-3">Worker Lastname</th>
              <th className="px-6 py-3">Worker Phone</th>
              <th className="px-6 py-3">Worker Address</th>
              <th className="px-6 py-3">Details</th>
              <th className="px-6 py-3">Created Date</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.length > 0 ? (
              currentAppointments.map(appointment => (
                <tr key={appointment.id} className="bg-white border-b">
                  <td className="px-6 py-4 font-medium">{appointment.appointed_to.first_name}</td>
                  <td className="px-6 py-4 font-medium">{appointment.appointed_to.last_name}</td>
                  <td className="px-6 py-4">{appointment.appointed_to.created_by.phone}</td>
                  <td className="px-6 py-4">{appointment.appointed_to.address}</td>
                  <td className="px-6 py-4">{appointment.details}</td>
                  <td className="px-6 py-4">
                    {new Date(appointment.created_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/citizen/editAppointment/${appointment.id}`}>
                      <FontAwesomeIcon icon={faEdit} className="px-2 text-green-500" />
                    </Link>
                    <span onClick={() => handleDelete(appointment.id)} className="px-2 text-red-500 cursor-pointer">
                      <FontAwesomeIcon icon={faTrash} />
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center">No appointments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <nav className="inline-flex shadow-sm">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => paginate(i + 1)} className={`px-4 py-2 border ${currentPage === i + 1 ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {i + 1}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

export default Citizen_ManageAppointments;
