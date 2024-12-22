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
import tripImage from "../../../assets/pictures/tripImage.png";

function ManagerExpenses() {
  const [expenseData, setexpenseData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExpense, setSelectedExpense] = useState(null); // For the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expensesPerPage, setexpensesPerPage] = useState(5); // Default rows per page
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
      const res = await axios.get("http://127.0.0.1:8000/expense/manager/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      // Log the entire response to console
      console.log("Full Expense Response:", res.data);

      // Check if expenses exist in the response
      if (res.data.expenses && Array.isArray(res.data.expenses)) {
        // Log individual expenses
        res.data.expenses.forEach((expense, index) => {
          console.log(`Expense ${index + 1}:`, expense);
        });

        setexpenseData(res.data.expenses);

        // Optional: Set a success message
        // setMessage(`${res.data.expenses.length} expenses retrieved successfully`);
        // setMessageType("success");
      } else {
        console.warn("No expenses found in the response");
        setexpenseData([]);
        setMessage("No expenses found");
        setMessageType("warning");
      }
    } catch (err) {
      console.error("Error fetching expenses:", err.response || err);

      // More detailed error handling
      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        "An error occurred while fetching expenses";

      setMessage(errorMessage);
      setMessageType("error");

      // Optional: Handle specific error scenarios
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
    const conf = window.confirm("Do you want to delete this expense?");
    if (conf) {
      try {
        const res = await axios.delete(
          `http://127.0.0.1:8000/expense/delete/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Refresh the expense list after successful deletion
        await handleFetch();

        setMessage("expense deleted successfully.");
        setMessageType("success");

        // Reset current page if needed
        setCurrentPage(1);
      } catch (err) {
        console.error("Error deleting expense", err);
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
    doc.autoTable({ html: "#expense-table" });
    doc.save("expenses.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(expenseData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "expenses");
    XLSX.writeFile(workbook, "expenses.xlsx");
  };

  const handleDownloadCSV = () => {
    const csvData = expenseData.map((expense) => ({
      Phone: expense.phone_number,
      Email: expense.email,
      Role: expense.role,
      Created_by: expense.created_by__phone_number,
      Created_Date: expense.created_at,
    }));
    const csvContent =
      "data:text/csv;charset=utf-8," +
      Object.keys(csvData[0]).join(",") +
      "\n" +
      csvData.map((row) => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredData = expenseData?.filter(
    (expense) =>
      expense.user?.phone_number
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.amount?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.created_at?.includes(searchQuery)
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

  const indexOfLastexpense = currentPage * expensesPerPage;
  const indexOfFirstexpense = indexOfLastexpense - expensesPerPage;
  const currentexpenses = filteredData.slice(
    indexOfFirstexpense,
    indexOfLastexpense
  );
  const totalPages = Math.ceil(filteredData.length / expensesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewExpense = async (id) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/expense/${id}/`, {
        headers: axiosConfig.headers,
      });
      setSelectedExpense(res.data);
      setIsModalOpen(true); // Open modal
      console.log("Retrieved Data: ", res);
    } catch (err) {
      console.error("Error fetching expense details", err.response || err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        "An error occurred while fetching expense details";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const handleAcceptExpense = async (id) => {
    try {
      const res = await axios.put(
        `http://127.0.0.1:8000/expense/accept/${id}/`,
        {}, // Send an empty body for the accept endpoint, adjust if needed
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("Expense accepted successfully.");
      setMessageType("success");
      await handleFetch(); // Refresh the data
      handleCloseModal();
    } catch (err) {
      console.error("Error accepting expense", err.response || err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        "An error occurred while accepting the expense";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const handleRejectExpense = async (id) => {
    try {
      const res = await axios.put(
        `http://127.0.0.1:8000/expense/reject/${id}/`,
        {}, // Send an empty body for the reject endpoint, adjust if needed
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("Expense rejected successfully.");
      setMessageType("success");
      await handleFetch(); // Refresh the data
      handleCloseModal();
    } catch (err) {
      console.error("Error rejecting expense", err.response || err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        "An error occurred while rejecting the expense";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  return (
    <>
      <h1 className="text-center text-green-700 font-bold text-xl capitalize mb-4">
        Manage expenses
      </h1>
      {message && (
        <div
          className={`text-center py-2 px-4 mb-4 rounded ${
            messageType === "success" ? " text-green-500" : " text-red-500"
          }`}
        >
          {message}
        </div>
      )}
      <div className="flex justify-end mb-4">
        <Link
          to="/manager/createExpense"
          className=" py-2 text-black bg-blue-700 px-2 mr-4 rounded"
        >
          <FontAwesomeIcon icon={faAdd} className="mr-2 " />
        </Link>

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
          onChange={(e) => setexpensesPerPage(Number(e.target.value))}
          value={expensesPerPage}
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
        {/* <p className="text-blue-700">
          Total expenses:{" "}
          <span className="font-bold text-black">{filteredData.length}</span>
        </p> */}
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table
          id="expense-table"
          className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead className="text-xs text-black uppercase bg-green-700 dark:bg-green-700 dark:text-black">
            <tr>
              <th scope="col" className="px-6 py-3">
                #
              </th>
              <th scope="col" className="px-6 py-3">
                Driver
              </th>

              <th scope="col" className="px-6 py-3">
                Category
              </th>
              <th scope="col" className="px-6 py-3">
                Amount (FRW)
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Reimbursement
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
            {currentexpenses.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No data found
                </td>
              </tr>
            ) : (
              currentexpenses.map((expense, index) => (
                <tr key={expense.id} className="bg-white">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{expense.user?.phone_number}</td>
                  <td className="px-6 py-4">{expense.category}</td>
                  <td className="px-6 py-4">{expense.amount}</td>
                  <td className="px-6 py-4">{expense.status}</td>
                  <td className="px-6 py-4">{expense.reimbursement_status}</td>
                  <td className="px-6 py-4">
                    {expense.created_at
                      ? new Date(expense.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewExpense(expense.id)}
                      className="text-black mr-2"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <Link
                      to={`/manager/editExpense/${expense.id}`}
                      className="mr-2 text-blue-600 hover:text-blue-900"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Link>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-green-600 hover:text-red-900"
                    >
                      <FontAwesomeIcon icon={faTrash} />
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
          onChange={(e) => setexpensesPerPage(Number(e.target.value))}
          value={expensesPerPage}
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

      {isModalOpen && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-1/2 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-center text-green-700">
              Expense Details
            </h2>
            <p className="text-black">
              <strong>Driver:</strong> {selectedExpense.user.phone_number}
            </p>
            <p className="text-black">
              <strong>Category:</strong> {selectedExpense.category}
            </p>
            <p className="text-black">
              <strong>Amount:</strong> {selectedExpense.amount}
            </p>
            <p className="text-black">
              <strong>Status:</strong> {selectedExpense.status}
            </p>
            <p className="text-black">
              <strong>Date:</strong> {selectedExpense.date}
            </p>
            <p className="text-black">
              <strong>Created Date:</strong>{" "}
              {selectedExpense.created_at
                ? new Date(selectedExpense.created_at).toLocaleDateString()
                : "N/A"}
            </p>

            {/* Video playback */}
            {selectedExpense.video_base64 ? (
              <div className="mt-4">
                <h3 className="text-black font-bold">Video Evidence:</h3>
                <video
                  controls
                  className="w-1/2 h-1/2 border border-gray-300 rounded"
                >
                  <source
                    src={`data:video/mp4;base64,${selectedExpense.video_base64}`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : selectedExpense.video ? (
              <div className="mt-4">
                <h3 className="text-black font-bold">Video Evidence:</h3>
                <video
                  controls
                  className="w-full h-auto border border-gray-300 rounded"
                >
                  <source src={selectedExpense.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <p className="text-black mt-4">
                No video available for this expense.
              </p>
            )}

            {/* Receipt display */}
            <div className="mt-4">
              <h3 className="text-black font-bold">Receipt:</h3>
              {selectedExpense.receipt ? (
                selectedExpense.receipt.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={`http://127.0.0.1:8000${selectedExpense.receipt}`}
                    title="Receipt PDF"
                    className="w-full h-auto border border-gray-300 rounded"
                  ></iframe>
                ) : (
                  <img
                    src={`http://127.0.0.1:8000${selectedExpense.receipt}`}
                    alt="Receipt"
                    className="w-full h-auto border border-gray-300 rounded"
                  />
                )
              ) : (
                <p className="text-black">
                  No receipt available for this expense.
                </p>
              )}
            </div>

            {/* Map Section */}
            <div className="flex-1 min-w-[250px] py-8 px-4">
              <h1 className="text-xl font-bold mb-4">Our Location in Rwanda</h1>
              <div className="overflow-hidden rounded-lg shadow-lg">
                {/* <MapComponent /> */}
                <img
                  src={tripImage}
                  alt="No image"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </div>
            </div>

            <button
              onClick={() => handleAcceptExpense(selectedExpense.id)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 mr-2 rounded"
            >
              Accept
            </button>

            <button
              onClick={() => handleRejectExpense(selectedExpense.id)}
              className="mt-4 bg-green-500 text-white px-4 py-2 mr-2 rounded"
            >
              Reject
            </button>

            <button
              onClick={handleCloseModal}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ManagerExpenses;
