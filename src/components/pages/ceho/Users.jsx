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

function Users() {
  const [userData, setUserData] = useState([]); // Initialize as an empty array
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate(); // To redirect user if unauthorized

  // Get the access token from localStorage
  const storedUserData = localStorage.getItem("userData");
  const accessToken = storedUserData
    ? JSON.parse(storedUserData).access_token
    : null; // Make sure to use `access_token` from your stored user data

  // Redirect to login if no token found
  useEffect(() => {
    if (!accessToken) {
      alert("Unauthorized! Please log in again.");
      navigate("/login"); // Redirect to login page if no token
    }
  }, [accessToken, navigate]);

  // Axios config with Authorization header
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json", // Ensure the content type is set
    },
  };

  // Fetch users with the stored token
  const handleFetch = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/users/", axiosConfig);
      console.log("API Response:", res.data); // Log the whole response

      // Directly set user data from the response
      if (Array.isArray(res.data) && res.data.length > 0) {
        console.log("Fetched Users:", res.data); // Log users to the console
        setUserData(res.data); // Set the fetched users in state
      } else {
        console.log("No users found in response");
        setUserData([]); // Set user data to an empty array if no users found
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login"); // Redirect to login page if 401 (Unauthorized)
      }
    }
  };

  useEffect(() => {
    if (accessToken) {
      handleFetch();
    }
  }, [accessToken]);

  const handleDelete = async (id) => {
    // Confirmation dialog before deletion
    const conf = window.confirm("Do you want to delete this user?");
    if (conf) {
      try {
        // Make the DELETE request to the API
        const res = await axios.delete(
          `http://127.0.0.1:8000/delete/${id}/`, // Adjusted URL to match the backend
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Ensure authorization header is included
              "Content-Type": "application/json", // Optional, but good practice to specify
            },
          }
        );

        // Check if the response status is 204 (No Content)
        if (res.status === 204) {
          console.log("User deleted successfully");
          // Update state to remove the deleted user from the list
          setUserData((prevUserData) =>
            prevUserData.filter((user) => user.id !== id)
          );
        } else {
          alert("Failed to delete user");
        }
      } catch (err) {
        // Handle error response from the server
        console.error("Error deleting user", err);
        if (err.response) {
          alert(
            `Error: ${err.response.data.message || err.response.statusText}`
          );
        } else {
          alert("An error occurred while deleting the user");
        }
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

  const filteredData = userData?.filter(
    (user) =>
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.created_at?.includes(searchQuery)
  );

  // Function to map roles to their display names
  const getRoleDisplayName = (role) => {
    switch (role) {
      case "citizen":
        return "Citizen";
      case "chw":
        return "Community Health Worker";
      case "ceho":
        return "Community Environment Officer";
      default:
        return role; // Return the original role if no mapping found
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredData.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredData.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Users
      </h1>
      <div className="flex justify-between mb-4">
        {/* <Link
          to="/admin/createUser"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create New User
        </Link> */}

        <div>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-green-500 text-white rounded mr-2"
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
          id="user-table"
          className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Phone
              </th>
              <th scope="col" className="px-6 py-3">
                Role
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
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="odd:bg-white odd:dark:bg-white even:bg-gray-50 even:dark:bg-white border-b dark:border-gray-700"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium whitespace-nowrap"
                  >
                    {user.phone}
                  </th>
                  <td className="px-6 py-4">{getRoleDisplayName(user.role)}</td>{" "}
                  {/* Use the mapping function here */}
                  <td className="px-6 py-4">
                    {/* Format the created_at date */}
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                  <Link
                      to={`/admin/editUser/${user.id}`}
                      className="px-4 py-2"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-2 text-green-500" />
                    </Link>
                    <span
                      onClick={() => handleDelete(user.id)}
                      className="px-2 py-2 text-red-500 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <nav
            className="relative z-0 inline-flex shadow-sm rounded-md -space-x-px"
            aria-label="Pagination"
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === i + 1
                    ? "text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
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

export default Users;
