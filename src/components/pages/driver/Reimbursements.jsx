/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faSearch,
  faCalendar,
  faMoneyBill,
  faUser,
  faFileInvoice
} from "@fortawesome/free-solid-svg-icons";

function Driver_Reimbursement() {
  const [reimbursementData, setReimbursementData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 6;

  const storedUserData = localStorage.getItem("userData");
  const accessToken = storedUserData ? JSON.parse(storedUserData).access_token : null;

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }
    handleFetch();
  }, [accessToken, navigate]);

  const handleFetch = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/reimbursement/user/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (Array.isArray(res.data) && res.data.length > 0) {
        setReimbursementData(res.data);
        setMessage(`${res.data.length} reimbursements retrieved`);
        setMessageType("success");
      } else {
        setReimbursementData([]);
        setMessage("No reimbursements found");
        setMessageType("warning");
      }
    } catch (err) {
      console.error("Error fetching reimbursements:", err);
      setMessage("Error fetching reimbursements");
      setMessageType("error");
    }
  };

  // Filter functions
  const filterData = () => {
    return reimbursementData.filter(item => {
      const matchesSearch = (
        item.expense?.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.expense?.user?.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.expense?.amount?.toString().includes(searchQuery)
      );

      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "paid" && item.is_paid) ||
        (filterStatus === "unpaid" && !item.is_paid);

      return matchesSearch && matchesStatus;
    });
  };

  // Download functions
  const formatDataForExport = (data) => {
    return data.map(item => ({
      'Expense Category': item.expense?.category,
      'Driver': item.expense?.user?.phone_number,
      'Amount (FRW)': item.expense?.amount,
      'Status': item.is_paid ? 'Paid' : 'Unpaid',
      'Date': item.expense?.date,
      'Created Date': new Date(item.created_at).toLocaleDateString()
    }));
  };

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF();
      const formattedData = formatDataForExport(filterData());
      
      // Add title
      doc.setFontSize(16);
      doc.text('Reimbursement Report', 14, 15);
      
      // Add metadata
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
      
      // Create table
      const headers = Object.keys(formattedData[0]);
      const data = formattedData.map(row => Object.values(row));
      
      doc.autoTable({
        head: [headers],
        body: data,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      
      doc.save('reimbursements.pdf');
      setMessage('PDF downloaded successfully');
      setMessageType('success');
    } catch (error) {
      setMessage('Error generating PDF');
      setMessageType('error');
    } finally {
      setIsDownloading(false);
      setDownloadMenuVisible(false);
    }
  };

  const downloadExcel = async () => {
    setIsDownloading(true);
    try {
      const formattedData = formatDataForExport(filterData());
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reimbursements");
      XLSX.writeFile(workbook, "reimbursements.xlsx");
      setMessage('Excel file downloaded successfully');
      setMessageType('success');
    } catch (error) {
      setMessage('Error generating Excel file');
      setMessageType('error');
    } finally {
      setIsDownloading(false);
      setDownloadMenuVisible(false);
    }
  };

  const downloadCSV = async () => {
    setIsDownloading(true);
    try {
      const formattedData = formatDataForExport(filterData());
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'reimbursements.csv';
      link.click();
      
      setMessage('CSV file downloaded successfully');
      setMessageType('success');
    } catch (error) {
      setMessage('Error generating CSV file');
      setMessageType('error');
    } finally {
      setIsDownloading(false);
      setDownloadMenuVisible(false);
    }
  };

  // Pagination
  const filteredData = filterData();
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Status counts
  const countByStatus = {
    all: reimbursementData.length,
    paid: reimbursementData.filter(item => item.is_paid).length,
    unpaid: reimbursementData.filter(item => !item.is_paid).length
  };

  return (
    <div className="p-4">
      <h1 className="text-center text-black font-bold text-xl mb-6">
        Reimbursement Management
      </h1>

      {message && (
        <div className={`text-center py-2 px-4 mb-4 rounded ${messageType === "success" ? "text-green-500" : "text-red-500"}`}>
          {message}
        </div>
      )}

      {/* Controls Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg ${filterStatus === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            All ({countByStatus.all})
          </button>
          <button
            onClick={() => setFilterStatus("paid")}
            className={`px-4 py-2 rounded-lg ${filterStatus === "paid" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Paid ({countByStatus.paid})
          </button>
          <button
            onClick={() => setFilterStatus("unpaid")}
            className={`px-4 py-2 rounded-lg ${filterStatus === "unpaid" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Unpaid ({countByStatus.unpaid})
          </button>
        </div>

        {/* Search and Download */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search reimbursements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-gray-700 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
              disabled={isDownloading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faDownload} />
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
            {downloadMenuVisible && (
              <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl z-10">
                <button
                  onClick={downloadPDF}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                >
                  Download as PDF
                </button>
                <button
                  onClick={downloadExcel}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                >
                  Download as Excel
                </button>
                <button
                  onClick={downloadCSV}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                >
                  Download as CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {currentData.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No reimbursements found
          </div>
        ) : (
          currentData.map((item, index) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <span className={`px-3 py-1 rounded-full text-sm ${item.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {item.is_paid ? 'Paid' : 'Pending'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faFileInvoice} className="text-gray-400" />
                  <span className="text-gray-700">{item.expense?.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                  <span className="text-gray-700">{item.expense?.user?.phone_number}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faMoneyBill} className="text-gray-400" />
                  <span className="text-gray-700">{item.expense?.amount} FRW</span>
                </div>

                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                  <span className="text-gray-700">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Driver_Reimbursement;
