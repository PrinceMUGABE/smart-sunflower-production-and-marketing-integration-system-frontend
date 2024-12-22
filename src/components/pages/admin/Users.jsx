/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEdit,
  faTrash,
  faDownload,
  faAdd,
} from "@fortawesome/free-solid-svg-icons";

function Users() {
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5); // Default rows per page
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
      const res = await axios.get("http://127.0.0.1:8000/users/", axiosConfig);
      if (Array.isArray(res.data.users) && res.data.users.length > 0) {
        setUserData(res.data.users);
      } else {
        setUserData([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    if (accessToken) {
      handleFetch();
    }
  }, [accessToken]);

  const handleDelete = async (id) => {
    const conf = window.confirm("Do you want to delete this user?");
    if (conf) {
      try {
        const res = await axios.delete(`http://127.0.0.1:8000/delete/${id}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        // Refresh the user list after successful deletion
        await handleFetch();

        setMessage("User deleted successfully.");
        setMessageType("success");

        // Reset current page if needed
        setCurrentPage(1);
      } catch (err) {
        console.error("Error deleting user", err);
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
    doc.autoTable({ html: "#user-table" });
    doc.save("users.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(userData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
  };

  const handleDownloadCSV = () => {
    const csvData = userData.map((user) => ({
      Phone: user.phone_number,
      Email: user.email,
      Role: user.role,
      Created_by: user.created_by__phone_number,
      Created_Date: user.created_at,
    }));
    const csvContent =
      "data:text/csv;charset=utf-8," +
      Object.keys(csvData[0]).join(",") +
      "\n" +
      csvData.map((row) => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredData = userData?.filter(
    (user) =>
      user.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.created_at?.includes(searchQuery)
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

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredData.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredData.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-center text-green-700 font-bold text-xl capitalize mb-4">
        Manage Users
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
          to="/admin/createUser"
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
          onChange={(e) => setUsersPerPage(Number(e.target.value))}
          value={usersPerPage}
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
          Total Users:{" "}
          <span className="font-bold text-black">{filteredData.length}</span>
        </p>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table
          id="user-table"
          className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead className="text-xs text-black uppercase bg-green-700 dark:bg-green-700 dark:text-black">
            <tr>
              <th scope="col" className="px-6 py-3">
                #
              </th>
              <th scope="col" className="px-6 py-3">
                Phone
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Created by
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
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No data found
                </td>
              </tr>
            ) : (
              currentUsers.map((user, index) => (
                <tr key={user.id} className="bg-white">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{user.phone_number}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{getRoleDisplayName(user.role)}</td>
                  <td className="px-6 py-4">{user.created_by__phone_number}</td>
                  <td className="px-6 py-4">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/editUser/${user.id}`}
                      className="mr-2 text-blue-600 hover:text-blue-900"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Link>
                    <button
                      onClick={() => handleDelete(user.id)}
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
          onChange={(e) => setUsersPerPage(Number(e.target.value))}
          value={usersPerPage}
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

export default Users;
