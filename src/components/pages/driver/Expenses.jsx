/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  Download, 
  Plus, 
  X 
} from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

function DriverExpenses() {
  const [expenseData, setexpenseData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expensesPerPage, setexpensesPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDownloading, setIsDownloading] = useState(false);

  const storedUserData = localStorage.getItem("userData");
  const accessToken = storedUserData
    ? JSON.parse(storedUserData).access_token
    : null;

  useEffect(() => {
    if (!accessToken) {
      setMessage("Unauthorized! Please log in again.");
      setMessageType("error");
      return;
    }
    handleFetch();
  }, [accessToken]);

  const handleFetch = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/expense/user/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.expenses && Array.isArray(data.expenses)) {
        setexpenseData(data.expenses);
      } else {
        console.warn("No expenses found in the response");
        setexpenseData([]);
        setMessage("No expenses found");
        setMessageType("warning");
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setMessage("Error fetching expenses");
      setMessageType("error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Do you want to delete this expense?")) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/expense/delete/${id}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          await handleFetch();
          setMessage("Expense deleted successfully.");
          setMessageType("success");
          setCurrentPage(1);
        }
      } catch (err) {
        console.error("Error deleting expense", err);
        setMessage("Error deleting expense");
        setMessageType("error");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Helper function to format data for export
  const formatExpenseData = (expenses) => {
    return expenses.map((expense, index) => ({
      'No.': index + 1,
      'vendor': expense.vendor,
      'Category': expense.category,
      'Amount (FRW)': expense.amount,
      'Status': expense.status,
      'Created Date': new Date(expense.created_at).toLocaleDateString(),
    }));
  };

  // Function to download as PDF
  const downloadPDF = async (expenses) => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Expenses Report', 14, 15);
      
      // Add metadata
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
      doc.text(`Total Expenses: ${expenses.length}`, 14, 30);
      
      // Create table
      const formattedData = formatExpenseData(expenses);
      const headers = Object.keys(formattedData[0]);
      const data = formattedData.map(row => Object.values(row));
      
      doc.autoTable({
        head: [headers],
        body: data,
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      doc.save('expenses.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage('Error generating PDF');
      setMessageType('error');
    }
  };

  // Function to download as Excel
  const downloadExcel = async (expenses) => {
    try {
      const formattedData = formatExpenseData(expenses);
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      
      // Set column widths
      const colWidths = [
        { wch: 5 },  // No.
        { wch: 15 }, // Category
        { wch: 12 }, // Amount
        { wch: 10 }, // Status
        { wch: 15 }, // Created Date
      ];
      worksheet['!cols'] = colWidths;
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
      
      // Generate Excel file
      XLSX.writeFile(workbook, 'expenses.xlsx');
    } catch (error) {
      console.error('Error generating Excel:', error);
      setMessage('Error generating Excel file');
      setMessageType('error');
    }
  };

  // Function to download as CSV
  const downloadCSV = (expenses) => {
    try {
      const formattedData = formatExpenseData(expenses);
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'expenses.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error generating CSV:', error);
      setMessage('Error generating CSV file');
      setMessageType('error');
    }
  };

  const downloadData = async (format) => {
    setIsDownloading(true);
    try {
      switch (format.toLowerCase()) {
        case 'pdf':
          await downloadPDF(filteredData);
          break;
        case 'excel':
          await downloadExcel(filteredData);
          break;
        case 'csv':
          downloadCSV(filteredData);
          break;
        default:
          throw new Error('Unsupported format');
      }
      setMessage(`Successfully downloaded expenses as ${format}`);
      setMessageType('success');
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      setMessage(`Error downloading ${format}`);
      setMessageType('error');
    } finally {
      setIsDownloading(false);
      setDownloadMenuVisible(false);
    }
  };

  const filteredData = expenseData?.filter((expense) => {
    if (filterStatus === "all") return true;
    return expense.status.toLowerCase() === filterStatus;
  }).filter(
    (expense) =>
      expense.user?.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.amount?.toString().includes(searchQuery) ||
      expense.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.created_at?.includes(searchQuery) ||
      expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  const indexOfLastExpense = currentPage * expensesPerPage;
  const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
  const currentExpenses = filteredData.slice(indexOfFirstExpense, indexOfLastExpense);
  const totalPages = Math.ceil(filteredData.length / expensesPerPage);

  const countByStatus = (status) => 
    expenseData.filter((expense) => expense.status.toLowerCase() === status).length;

  return (
    <div className="p-4">
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Past Expenses
      </h1>
      
      {message && (
        <div className={`text-center py-2 px-4 mb-4 rounded ${
          messageType === "success" ? "text-green-500" : "text-red-500"
        }`}>
          {message}
        </div>
      )}

      {/* Responsive Filter Buttons */}
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 md:justify-between mb-4">
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
          <button
            onClick={() => setFilterStatus("all")}
            className="py-2 px-4 bg-gray-500 text-white rounded text-sm"
          >
            All Expenses ({expenseData.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className="py-2 px-4 bg-gray-500 text-white rounded text-sm"
          >
            Pending ({countByStatus("pending")})
          </button>
          <button
            onClick={() => setFilterStatus("approved")}
            className="py-2 px-4 bg-gray-500 text-white rounded text-sm"
          >
            approved ({countByStatus("approved")})
          </button>
          <button
            onClick={() => setFilterStatus("rejected")}
            className="py-2 px-4 bg-gray-500 text-white rounded text-sm"
          >
            Rejected ({countByStatus("rejected")})
          </button>
        </div>

        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
          <button
            onClick={() => window.location.href = '/driver/createExpense'}
            className="py-2 px-4 bg-green-700 text-black rounded text-center"
          >
            Create new
            {/* <Plus className="inline" size={20} /> */}
          </button>

          <div className="relative">
            <button
              onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
              disabled={isDownloading}
              className="w-full md:w-auto py-2 px-4 bg-red-700 text-white rounded hover:bg-red-800 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <Download className="mr-2" size={20} />
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
            {downloadMenuVisible && (
              <div className="absolute right-0 bg-white shadow-md rounded p-2 mt-2 z-10">
                <button 
                  onClick={() => downloadData('PDF')} 
                  className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                >
                  PDF
                </button>
                <button 
                  onClick={() => downloadData('Excel')} 
                  className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                >
                  Excel
                </button>
                <button 
                  onClick={() => downloadData('CSV')} 
                  className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                >
                  CSV
                </button>
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Search expense"
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-4 py-2 bg-white text-black border rounded-full"
          />
        </div>
      </div>

      {/* Expenses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentExpenses.length === 0 ? (
          <div className="col-span-full text-center py-4">
            No data found
          </div>
        ) : (
          currentExpenses.map((expense, index) => (
            <div key={expense.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">#{index + 1}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                  expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {expense.status}
                </span>
              </div>
              
              <div className="space-y-2">
              <p className="text-gray-700"><span className="font-semibold text-gray-700">Vendor:</span> {expense.vendor}</p>
                <p className="text-gray-700"><span className="font-semibold text-gray-700">Category:</span> {expense.category}</p>
                <p className="text-gray-700"><span className="font-semibold text-gray-700">Amount:</span> {expense.amount} FRW</p>
                <p className="text-gray-700"><span className="font-semibold text-gray-700">Date:</span> {
                  expense.created_at ? new Date(expense.created_at).toLocaleDateString() : "N/A"
                }</p>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setSelectedExpense(expense)}
                  className="text-black hover:text-gray-700"
                >
                  <Eye size={20} />
                </button>
                <button
                  onClick={() => window.location.href = `/driver/editExpense/${expense.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Pencil size={20} />
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4">
        <div className="mb-2 md:mb-0">
          <span className="text-black font-bold px-2">Filter By:</span>
          <select
            onChange={(e) => setexpensesPerPage(Number(e.target.value))}
            value={expensesPerPage}
            className="border rounded-full"
          >
            {[5, 10, 30, 50, 100].map((option) => (
              <option key={option} value={option} className="text-black">
                {option} rows
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 bg-blue-700 text-white rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="mx-2">{currentPage}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 bg-blue-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-blue-700">
                Expense Details
              </h2>
              <button
                onClick={() => setSelectedExpense(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
            <p className="text-black">
                <strong>Vendor:</strong> {selectedExpense.vendor}
              </p>
              <p className="text-black">
                <strong>Category:</strong> {selectedExpense.category}
              </p>
              <p className="text-black">
                <strong>Amount:</strong> {selectedExpense.amount} FRW
              </p>
              <p className="text-black">
                <strong>Status:</strong> {selectedExpense.status}
              </p>
              <p className="text-black">
                <strong>Created Date:</strong>{" "}
                {selectedExpense.created_at
                  ? new Date(selectedExpense.created_at).toLocaleDateString()
                  : "N/A"}
              </p>

              {selectedExpense.receipt && (
                <div className="mt-4">
                  <h3 className="text-black font-bold">Receipt:</h3>
                  <img
                    src={`http://127.0.0.1:8000${selectedExpense.receipt}`}
                    alt="Receipt"
                    className="w-full h-auto border border-gray-300 rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverExpenses;