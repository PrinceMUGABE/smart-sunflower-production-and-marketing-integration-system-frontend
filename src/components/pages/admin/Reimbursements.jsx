/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import {
  faEye,
  faEdit,
  faTrash,
  faDownload,
  faAdd,
  faCancel,
} from "@fortawesome/free-solid-svg-icons";

function AdminManage_Reimbursement() {
  const [reimbursementData, setreimbursementData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedreimbursement, setSelectedreimbursement] = useState(null); // For the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reimbursementsPerPage, setreimbursementsPerPage] = useState(5); // Default rows per page
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false); // Track download menu visibility
  const navigate = useNavigate();

  const storedUserData = localStorage.getItem("userData");
  const accessToken = storedUserData
    ? JSON.parse(storedUserData).access_token
    : null;

  const token = localStorage.getItem("token");
  console.log("Retrieved Token:", token);

  useEffect(() => {
    if (!accessToken) {
      alert("Unauthorized! Please log in again.");
      navigate("/login");
    }
  }, [accessToken, navigate]);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const handleFetch = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/reimbursement/reimbursements/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Directly check if the response is an array
      if (Array.isArray(res.data) && res.data.length > 0) {
        setreimbursementData(res.data); // Directly set the array
        setMessage(`${res.data.length} reimbursements retrieved successfully`);
        setMessageType("success");
      } else {
        console.warn("No reimbursements found in the response");
        setreimbursementData([]); // Set empty array if no data
        setMessage("No reimbursements found");
        setMessageType("warning");
      }
    } catch (err) {
      console.error("Error fetching reimbursements:", err.response || err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        "An error occurred while fetching reimbursements";

      setMessage(errorMessage);
      setMessageType("error");

      if (err.response?.status === 401) {
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
    const conf = window.confirm("Do you want to delete this reimbursement?");
    if (conf) {
      try {
        const res = await axios.delete(
          `http://127.0.0.1:8000/reimbursement/delete/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Refresh the reimbursement list after successful deletion
        await handleFetch();

        setMessage("Reimbursement deleted successfully.");
        setMessageType("success");

        // Reset current page if needed
        setCurrentPage(1);
      } catch (err) {
        console.error("Error deleting reimbursement", err);
        setMessage(
          err.response
            ? err.response.data.message || err.response.statusText
            : "An error occurred"
        );
        setMessageType("error");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#reimbursement-table" });
    doc.save("reimbursements.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reimbursementData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "reimbursements");
    XLSX.writeFile(workbook, "reimbursements.xlsx");
  };

  const handleDownloadCSV = () => {
    const csvData = reimbursementData.map((reimbursement) => ({
      Expense: reimbursement.expense?.category,
      Driver: reimbursement.expense?.user?.phone,
      Status: reimbursement.is_paid,
      Issued_date: reimbursement.expense?.date,
      Created_Date: reimbursement.created_at,
    }));
    const csvContent =
      "data:text/csv;charset=utf-8," +
      Object.keys(csvData[0]).join(",") +
      "\n" +
      csvData.map((row) => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reimbursements.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredData = reimbursementData?.filter(
    (reimbursement) =>
      reimbursement.expense?.category
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      reimbursement.expense?.user?.phone_number
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      reimbursement.is_paid
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      reimbursement.created_at?.includes(searchQuery)
  );

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      case "driver":
        return "Driver";
      default:
        return role;
    }
  };

  const indexOfLastreimbursement = currentPage * reimbursementsPerPage;
  const indexOfFirstreimbursement =
    indexOfLastreimbursement - reimbursementsPerPage;
  const currentreimbursements = filteredData.slice(
    indexOfFirstreimbursement,
    indexOfLastreimbursement
  );
  const totalPages = Math.ceil(filteredData.length / reimbursementsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewreimbursement = async (id) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/reimbursement/${id}/`,
        {
          headers: axiosConfig.headers,
        }
      );
      setSelectedreimbursement(res.data);
      setIsModalOpen(true); // Open modal
      console.log("Retrieved Data: ", res);
    } catch (err) {
      console.error(
        "Error fetching reimbursement details",
        err.response || err
      );
      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        "An error occurred while fetching reimbursement details";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedreimbursement(null);
  };

  const handleAcceptreimbursement = async (id) => {
    try {
      const res = await axios.put(
        `http://127.0.0.1:8000/reimbursement/paid/${id}/`,
        {}, // Send an empty body for the accept endpoint, adjust if needed
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("reimbursement Marked as Paid successfully.");
      setMessageType("success");
      await handleFetch(); // Refresh the data
      handleCloseModal();
    } catch (err) {
      console.error(
        "Error accepting reimbursement Payment",
        err.response || err
      );
      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        "An error occurred while accepting the reimbursement payment";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const handleRejectreimbursement = async (id) => {
    try {
      const res = await axios.put(
        `http://127.0.0.1:8000/reimbursement/reject/${id}/`,
        {}, // Send an empty body for the reject endpoint, adjust if needed
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("reimbursement rejected successfully.");
      setMessageType("success");
      await handleFetch(); // Refresh the data
      handleCloseModal();
    } catch (err) {
      console.error("Error rejecting reimbursement", err.response || err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        "An error occurred while rejecting the reimbursement";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  return (
    <>
      <h1 className="text-center text-green-700 font-bold text-xl capitalize mb-4">
        Manage reimbursements
      </h1>
      {/* {message && (
        <div
          className={`text-center py-2 px-4 mb-4 rounded ${
            messageType === "success" ? " text-green-500" : " text-red-500"
          }`}
        >
          {message}
        </div>
      )} */}
      <div className="flex justify-end mb-4">
        {/* <Link
          to="/admin/expenses"
          className=" py-2 text-black bg-blue-700 px-2 mr-4 rounded"
        >
          <FontAwesomeIcon icon={faAdd} className="mr-2 " />
        </Link> */}

        <div className="relative">
          <button
            onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
            className=" py-2  text-black bg-green-700 px-4 mr-2 rounded w-auto"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
          </button>
          {downloadMenuVisible && (
            <div className="absolute bg-white shadow-md rounded p-2 mt-2 z-10">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 text-blue-500"
              >
                PDF
              </button>
              <button
                onClick={handleDownloadExcel}
                className="px-4 py-2 text-blue-500"
              >
                Excel
              </button>
              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2 text-blue-500"
              >
                CSV
              </button>
            </div>
          )}
        </div>

        {/* <select
          onChange={(e) => setreimbursementsPerPage(Number(e.target.value))}
          value={reimbursementsPerPage}
          className=" py-2 border rounded-full"
        >
          {[5, 10, 30, 50, 100].map((option) => (
            <option className="text-black" key={option} value={option}>
              {option} rows
            </option>
          ))}
        </select> */}

        <div>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-4 py-2 bg-white text-black border rounded-full"
          />
        </div>
      </div>

      <div className="text-right mb-4">
        <p className="text-blue-700">
          Total reimbursements:{" "}
          <span className="font-bold text-black">{filteredData.length}</span>
        </p>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table
          id="reimbursement-table"
          className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead className="text-xs text-black uppercase bg-green-700 dark:bg-green-700 dark:text-black">
            <tr>
              <th scope="col" className="px-6 py-3">
                #
              </th>
              <th scope="col" className="px-6 py-3">
                Expense
              </th>
              <th scope="col" className="px-6 py-3">
                Driver
              </th>

              <th scope="col" className="px-6 py-3">
                Amount (FRW)
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>

              <th scope="col" className="px-6 py-3">
                Date
              </th>

              <th scope="col" className="px-6 py-3">
                Created Date
              </th>

              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentreimbursements.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No data found
                </td>
              </tr>
            ) : (
              currentreimbursements.map((reimbursement, index) => (
                <tr key={reimbursement.id} className="bg-white">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    {reimbursement.expense?.category}
                  </td>
                  <td className="px-6 py-4">
                    {reimbursement.expense?.user?.phone_number}
                  </td>
                  <td className="px-6 py-4">{reimbursement.expense?.amount}</td>
                  <td className="px-6 py-4">
                    {reimbursement.is_paid ? "Paid" : "Pending"}
                  </td>
                  <td className="px-6 py-4">{reimbursement.expense?.date}</td>
                  <td className="px-6 py-4">
                    {reimbursement.created_at
                      ? new Date(reimbursement.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleAcceptreimbursement(reimbursement.id)}
                      className="text-blue-700 hover:text-red-700 mr-2"
                    >
                      {/* <FontAwesomeIcon icon={faEye} /> */}
                      Paid?
                    </button>
                    {/* <Link
                      to={`/admin/editreimbursement/${reimbursement.id}`}
                      className="mr-2 text-blue-600 hover:text-blue-900"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Link> */}
                    <button
                      onClick={() => handleDelete(reimbursement.id)}
                      className="text-green-600 hover:text-gray-700"
                    >
                      {/* <FontAwesomeIcon icon={faTrash} /> */}
                      Del
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center mt-4">
        <p className="text-black font-bold px-2">Filter By:</p>
        <select
          onChange={(e) => setreimbursementsPerPage(Number(e.target.value))}
          value={reimbursementsPerPage}
          className=" border rounded-full mr-4"
        >
          {[5, 10, 30, 50, 100].map((option) => (
            <option className="text-black" key={option} value={option}>
              {option} rows
            </option>
          ))}
        </select>
        <div>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 bg-green-700 text-white rounded"
          >
            Prev
          </button>
          <span className="mx-2 text-lg">{currentPage}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 bg-blue-700 text-white rounded"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default AdminManage_Reimbursement;
