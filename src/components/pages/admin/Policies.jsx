/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faAdd, faEye } from "@fortawesome/free-solid-svg-icons";

function AdminManagePolicies() {
  const [policyData, setPolicyData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [policiesPerPage, setPoliciesPerPage] = useState(6); // Display 6 policies per page
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null); // For modal data
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setPolicyData(res.data);
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

  const handleViewMore = async (id) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/policy/${id}/`, axiosConfig);
      setSelectedPolicy(res.data); // Set the full policy data
      setIsModalOpen(true); // Open the modal
    } catch (err) {
      console.error("Error fetching policy by ID:", err);
      setMessage("Error fetching policy details.");
      setMessageType("error");
    }
  };

  const handleCloseModal = () => {
    setSelectedPolicy(null);
    setIsModalOpen(false);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const truncateDescription = (description) => {
    const words = description.split(" ");
    return words.length > 20 ? words.slice(0, 20).join(" ") + "..." : description;
  };

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
      <h1 className="text-center text-green-700 font-bold text-xl capitalize mb-4">
        Manage Policies
      </h1>
      {message && (
        <div className={`text-center py-2 px-4 mb-4 rounded ${messageType === "success" ? "text-green-500" : "text-red-500"}`}>
          {message}
        </div>
      )}
      <div className="flex justify-end mb-4">
        <Link to="/admin/createPolicy" className="py-2 text-black bg-green-700 px-4 rounded">
          <FontAwesomeIcon icon={faAdd} className="mr-2" /> Add Policy
        </Link>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="px-4 py-2 bg-white text-black border rounded-full ml-4"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {currentPolicies.length === 0 ? (
          <p className="text-center col-span-full py-4">No data found</p>
        ) : (
          currentPolicies.map((policy) => (
            <div key={policy.id} className="p-4 bg-white shadow rounded-lg">
              <h2 className="font-bold text-lg mb-2">
                Policy: <span className="text-green-700 ml-2">{policy.name}</span>
              </h2>
              <p className="text-gray-700 mb-4 w-full">{truncateDescription(policy.description)}</p>
              <p className="text-sm text-gray-500">Created by: {policy.created_by?.phone_number || "N/A"}</p>
              <p className="text-sm text-gray-500">Date: {policy.created_date ? new Date(policy.created_date).toLocaleDateString() : "N/A"}</p>
              <div className="mt-4 flex justify-between">
                <Link to={`/admin/editPolicy/${policy.id}`} className="text-blue-600 hover:text-blue-900">
                  <FontAwesomeIcon icon={faEdit} />
                </Link>
                <button onClick={() => handleViewMore(policy.id)} className="text-green-600 hover:text-green-900">
                  <FontAwesomeIcon icon={faEye} className="mr-1" /> View More
                </button>
                <button onClick={() => handleDelete(policy.id)} className="text-green-600 hover:text-black">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end items-end mt-4">
        {/* <p className="text-black">Total Policies: {filteredData.length}</p> */}
        <div>
          <button
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
            className="px-4 py-2 bg-green-700 text-white rounded"
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

      {isModalOpen && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow-xl max-w-lg w-full max-h-screen overflow-y-auto p-8 relative">
            <h2 className="text-xl font-bold mb-4 text-center text-blue-700">{selectedPolicy.name}</h2>
            <p className="text-gray-700 mb-4">{selectedPolicy.description}</p>
            <p className="text-sm text-gray-500">
              Created by: {selectedPolicy.created_by?.phone_number || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              Date: {selectedPolicy.created_date ? new Date(selectedPolicy.created_date).toLocaleDateString() : "N/A"}
            </p>
            <button
              onClick={handleCloseModal}
              className="mt-4 px-4 py-2 bg-gree-700 text-white bg-green-700 rounded absolute top-4 right-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminManagePolicies;
