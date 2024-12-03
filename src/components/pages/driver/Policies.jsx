/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faDownload, faAdd } from "@fortawesome/free-solid-svg-icons";

function DriverPolicies() {
  const [policyData, setPolicyData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [policiesPerPage, setPoliciesPerPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("Unauthorized! Please log in again.");
      navigate("/login");
    } else {
      handleFetch(); // Fetch data once authenticated
    }
  }, [token, navigate]);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const handleFetch = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/policy/policies/", axiosConfig);
      console.log("API Response:", res.data); // Debugging the response
      setPolicyData(res.data); // Update state with the response data
    } catch (err) {
      console.error("Error fetching policies:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Do you want to delete this policy?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/policy/delete/${id}/`, axiosConfig);
        setMessage("Policy deleted successfully.");
        setMessageType("success");
        handleFetch(); // Refresh policies after deletion
        setCurrentPage(1); // Reset to first page if necessary
      } catch (err) {
        console.error("Error deleting policy:", err);
        setMessage(
          err.response?.data.message || err.response?.statusText || "An error occurred"
        );
        setMessageType("error");
      }
    }
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);


  const filteredData = policyData.filter((policy) =>
    policy.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastPolicy = currentPage * policiesPerPage;
  const indexOfFirstPolicy = indexOfLastPolicy - policiesPerPage;
  const currentPolicies = filteredData.slice(indexOfFirstPolicy, indexOfLastPolicy);
  const totalPages = Math.ceil(filteredData.length / policiesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Policies
      </h1>
      {message && (
        <div className={`text-center py-2 px-4 mb-4 rounded ${messageType === "success" ? "text-green-500" : "text-red-500"}`}>
          {message}
        </div>
      )}
      <div className="flex justify-end mb-4">
        {/* <Link to="/admin/createPolicy" className="py-2 text-black bg-blue-700 px-4 rounded">
          <FontAwesomeIcon icon={faAdd} className="mr-2" /> Add Policy
        </Link> */}
        <div className="relative ml-4">
         

        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="px-4 py-2 bg-white text-black border rounded-full ml-4"
        />
      </div>

      <div className="">
        {currentPolicies.length === 0 ? (
          <p className="text-center col-span-full py-4">No data found</p>
        ) : (
          currentPolicies.map((policy, index) => (
            <div key={policy.id} className="p-4 bg-white shadow rounded-lg ">
              <h2 className="font-bold text-lg mb-2">Policy #{index + 1}</h2>
              <p className="text-gray-700 mb-4 w-full">{policy.description}</p>
              <p className="text-sm text-gray-500">Created by: {policy.created_by?.phone_number || "N/A"}</p>
              <p className="text-sm text-gray-500">Date: {policy.created_date ? new Date(policy.created_date).toLocaleDateString() : "N/A"}</p>
              <div className="mt-4 flex justify-between">
                {/* <Link to={`/admin/editPolicy/${policy.id}`} className="text-blue-600 hover:text-blue-900">
                  <FontAwesomeIcon icon={faEdit} />
                </Link>
                <button onClick={() => handleDelete(policy.id)} className="text-red-600 hover:text-red-900">
                  <FontAwesomeIcon icon={faTrash} />
                </button> */}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-black">Total Policies: {filteredData.length}</p>
        <div>
          <button
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
            className="px-4 py-2 bg-blue-700 text-white rounded"
          >
            Prev
          </button>
          <span className="mx-2 text-lg">{currentPage}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => paginate(currentPage + 1)}
            className="px-4 py-2 bg-blue-700 text-white rounded"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default DriverPolicies;
