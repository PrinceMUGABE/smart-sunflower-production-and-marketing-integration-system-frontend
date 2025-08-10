/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faPlus,
  faInfoCircle,
  faTimes,
  faBox,
  faMoneyBillWave,
  faUser,
  faCalendarAlt,
  faFileExport,
  faChartBar,
  faChartPie,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import img from "../../../assets/pictures/sunflower2.jpg";
import Logo from "../../../assets/pictures/minagri.jpg";

// Register Chart.js components
Chart.register(...registerables);

const Farmer_Manage_Sales = () => {
  const [sales, setSales] = useState([]);
  const [harvestStocks, setHarvestStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    harvest_stock: "",
    quantity_sold: "",
    unit_price: "",
    delivery_days: 7,
    notes: "",
  });
  const [filters, setFilters] = useState({
    sell_status: "",
    payment_status: "",
    searchQuery: "",

  });
  const [activeChart, setActiveChart] = useState("bar");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSales();
    fetchHarvestStocks();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/sales/all/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Retrieved sales: ", response.data);
      setSales(response.data.sells || []);
    } catch (err) {
      setError("Failed to fetch sales data");
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHarvestStocks = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/stock/stocks/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHarvestStocks(response.data.stocks || []);
    } catch (err) {
      console.error("Error fetching harvest stocks:", err);
    }
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/sales/create/",
        formData,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      showMessage("Sale posted successfully", "success");
      setIsCreateModalOpen(false);
      fetchSales();
      setFormData({
        harvest_stock: "",
        quantity_sold: "",
        unit_price: "",
        delivery_days: 7,
        notes: "",
      });
    } catch (err) {
      showMessage(
        err.response?.data?.errors?.non_field_errors || "Failed to create sale",
        "error"
      );
      console.error("Error creating sale:", err);
    }
  };

  const cancelSale = async (saleId) => {
    if (window.confirm("Are you sure you want to cancel this sale?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/sales/delete/${saleId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showMessage("Sale cancelled successfully", "success");
        fetchSales();
      } catch (err) {
        showMessage(
          err.response?.data?.error || "Failed to cancel sale",
          "error"
        );
        console.error("Error cancelling sale:", err);
      }
    }
  };

  const completeSale = async (saleId) => {
    if (
      window.confirm(
        "Mark this sale as completed? This will record the stock movement."
      )
    ) {
      try {
        await axios.post(
          `http://127.0.0.1:8000/sales/complete/${saleId}/`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showMessage("Sale completed successfully", "success");
        fetchSales();
      } catch (err) {
        showMessage(
          err.response?.data?.error || "Failed to complete sale",
          "error"
        );
        console.error("Error completing sale:", err);
      }
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch = [
        sale.id?.toString(),
        sale.quantity_sold?.toString(),
        sale.unit_price?.toString(),
        sale.total_amount?.toString(),
        sale.buyer?.phone_number || "",
        sale.harvest_grade || "",
        sale.harvest_location || "",
        sale.farmer_phone || "",
      ].some((field) =>
        field?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );

      const matchesStatus =
        !filters.sell_status || sale.sell_status === filters.sell_status;
      const matchesPayment =
        !filters.payment_status ||
        sale.payment_status === filters.payment_status;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [sales, filters]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce(
      (sum, sale) => sum + parseFloat(sale.total_amount || 0),
      0
    );
    const totalQuantity = filteredSales.reduce(
      (sum, sale) => sum + parseFloat(sale.quantity_sold || 0),
      0
    );
    const avgPrice = totalSales > 0 ? totalRevenue / totalQuantity : 0;

    return {
      totalSales,
      totalRevenue,
      totalQuantity,
      avgPrice,
    };
  }, [filteredSales]);

  // Prepare chart data
  const chartData = {
    bar: {
      labels: filteredSales.map((sale) => `Sale #${sale.id}`),
      datasets: [
        {
          label: "Revenue (RWF)",
          data: filteredSales.map((sale) => sale.total_amount),
          backgroundColor: "rgba(234, 179, 8, 0.7)",
          borderColor: "rgba(234, 179, 8, 1)",
          borderWidth: 1,
        },
        {
          label: "Quantity (kg)",
          data: filteredSales.map((sale) => sale.quantity_sold),
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
        },
      ],
    },
    pie: {
      labels: ["Posted", "Purchased", "Completed", "Cancelled"],
      datasets: [
        {
          data: [
            filteredSales.filter((s) => s.sell_status === "posted").length,
            filteredSales.filter((s) => s.sell_status === "purchased").length,
            filteredSales.filter((s) => s.sell_status === "completed").length,
            filteredSales.filter((s) => s.sell_status === "cancelled").length,
          ],
          backgroundColor: [
            "rgba(59, 130, 246, 0.7)",
            "rgba(139, 92, 246, 0.7)",
            "rgba(16, 185, 129, 0.7)",
            "rgba(239, 68, 68, 0.7)",
          ],
          borderColor: [
            "rgba(59, 130, 246, 1)",
            "rgba(139, 92, 246, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(239, 68, 68, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    line: {
      labels: filteredSales.map((sale) => new Date(sale.created_at).toLocaleDateString()),
      datasets: [
        {
          label: "Daily Revenue (RWF)",
          data: filteredSales.map((sale) => sale.total_amount),
          backgroundColor: "rgba(234, 179, 8, 0.2)",
          borderColor: "rgba(234, 179, 8, 1)",
          borderWidth: 2,
          tension: 0.4,
        },
      ],
    },
  };

  // Export filtered data
  const exportData = () => {
  try {
    const doc = new jsPDF();
    
    // Company Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Smart Sunflower Production and Marketing Integration', 20, 25);
    
    doc.setFontSize(16);
    doc.setTextColor(60, 60, 60);
    doc.text('Sales Report', 20, 35);
    
    // Contact Information
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Email: minagri@gov.rw', 20, 45);
    doc.text('Phone: +250 788 457 408', 20, 50);
    doc.text('Address: Kigali-Rwanda', 20, 55);
    
    // Report Details
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 70);
    doc.text(`Total Records: ${filteredSales.length}`, 20, 75);
    
    // Filters Applied
    let yPosition = 85;
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text('Applied Filters:', 20, yPosition);
    yPosition += 5;
    
    if (filters.sell_status) {
      doc.text(`• Status: ${filters.sell_status.toUpperCase()}`, 25, yPosition);
      yPosition += 5;
    }
    if (filters.payment_status) {
      doc.text(`• Payment: ${filters.payment_status.toUpperCase()}`, 25, yPosition);
      yPosition += 5;
    }
    if (filters.searchQuery) {
      doc.text(`• Search: "${filters.searchQuery}"`, 25, yPosition);
      yPosition += 5;
    }
    if (!filters.sell_status && !filters.payment_status && !filters.searchQuery) {
      doc.text('• No filters applied (All records)', 25, yPosition);
      yPosition += 5;
    }
    
    // Summary Statistics
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Summary Statistics:', 20, yPosition);
    yPosition += 10;
    
    const summaryData = [
      ['Total Sales', filteredSales.length.toString()],
      ['Total Revenue', `${summaryStats.totalRevenue.toLocaleString()} RWF`],
      ['Total Quantity', `${summaryStats.totalQuantity.toFixed(2)} kg`],
      ['Average Price', `${summaryStats.avgPrice.toFixed(2)} RWF/kg`]
    ];
    
    doc.autoTable({
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [234, 179, 8], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [252, 248, 227] },
      margin: { left: 20, right: 20 },
      tableWidth: 'auto',
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 80 }
      }
    });
    
    // Sales Data Table
    const finalY = doc.lastAutoTable.finalY || yPosition + 40;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Sales Details:', 20, finalY + 15);
    
    // Prepare table data
    const tableData = filteredSales.map(sale => [
      `#${sale.id}`,
      new Date(sale.created_at).toLocaleDateString(),
      `${sale.harvest_grade} (${sale.harvest_location})`,
      sale.farmer_phone || 'N/A',
      parseFloat(sale.quantity_sold).toFixed(2),
      parseFloat(sale.unit_price).toFixed(2),
      parseFloat(sale.total_amount).toFixed(2),
      sale.sell_status.toUpperCase(),
      sale.payment_status.toUpperCase()
    ]);
    
    doc.autoTable({
      startY: finalY + 25,
      head: [['ID', 'Date', 'Stock', 'Owner', 'Qty (kg)', 'Price (RWF)', 'Total (RWF)', 'Status', 'Payment']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [234, 179, 8], 
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: { 
        fontSize: 8,
        textColor: [40, 40, 40]
      },
      alternateRowStyles: { fillColor: [252, 248, 227] },
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 15 }, // ID
        1: { cellWidth: 20 }, // Date
        2: { cellWidth: 25 }, // Stock
        3: { cellWidth: 20 }, // Owner
        4: { cellWidth: 18 }, // Quantity
        5: { cellWidth: 18 }, // Price
        6: { cellWidth: 20 }, // Total
        7: { cellWidth: 18 }, // Status
        8: { cellWidth: 18 }  // Payment
      },
      styles: {
        cellPadding: 2,
        fontSize: 8,
        overflow: 'linebreak'
      }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, 20, pageHeight - 10);
      doc.text(`© ${new Date().getFullYear()} Smart Sunflower Production and Marketing Integration`, doc.internal.pageSize.width - 80, pageHeight - 10);
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `Sales_Report_${timestamp}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
    showMessage(`PDF report "${filename}" downloaded successfully!`, "success");
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    showMessage("Failed to generate PDF report. Please try again.", "error");
  }
};

  const SaleStatusBadge = ({ status }) => {
    const statusMap = {
      posted: { color: "bg-blue-600", text: "Posted", icon: faBox },
      purchased: { color: "bg-purple-600", text: "Purchased", icon: faUser },
      completed: {
        color: "bg-green-600",
        text: "Completed",
        icon: faCheckCircle,
      },
      cancelled: {
        color: "bg-red-600",
        text: "Cancelled",
        icon: faTimesCircle,
      },
    };
    const statusInfo = statusMap[status] || statusMap.posted;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs flex items-center ${statusInfo.color} text-white`}
      >
        <FontAwesomeIcon icon={statusInfo.icon} className="mr-1" />
        {statusInfo.text}
      </span>
    );
  };

  const PaymentStatusBadge = ({ status }) => {
    const statusMap = {
      unpaid: { color: "bg-red-600", text: "Unpaid", icon: faTimesCircle },
      partial: { color: "bg-yellow-600", text: "Partial", icon: faSpinner },
      paid: { color: "bg-green-600", text: "Paid", icon: faCheckCircle },
    };
    const statusInfo = statusMap[status] || statusMap.unpaid;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs flex items-center ${statusInfo.color} text-white`}
      >
        <FontAwesomeIcon icon={statusInfo.icon} className="mr-1" />
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 p-6 bg-yellow-900 rounded-lg shadow-lg border-b-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400 mb-2">
                Recent Sales
              </h1>
              <p className="text-yellow-200">
                From here you can see all sales different farmers have done such that you can be able to set price for your own harvest sales
              </p>
            </div>
            {/* <div className="flex space-x-3">
              <button
                onClick={exportData}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
              >
                <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                Export
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                New Sale
              </button>
            </div> */}
          </div>
        </div>

        {/* Message Notification */}
        {message && (
          <div
            className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 ${
              messageType === "success" ? "bg-green-800" : "bg-red-800"
            } text-white`}
          >
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={messageType === "success" ? faCheckCircle : faTimesCircle}
                className="mr-3"
              />
              <div>
                <p className="font-semibold">
                  {messageType === "success" ? "Success" : "Error"}
                </p>
                <p className="text-sm">{message}</p>
              </div>
              <button
                onClick={() => setMessage("")}
                className="ml-4 text-yellow-300 hover:text-white"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-800 p-4 rounded-lg shadow">
            <div className="text-yellow-300 text-sm font-medium">Total Sales</div>
            <div className="text-2xl font-bold text-yellow-100">
              {summaryStats.totalSales}
            </div>
            <div className="text-yellow-400 text-xs">All time</div>
          </div>
          <div className="bg-green-800 p-4 rounded-lg shadow">
            <div className="text-green-300 text-sm font-medium">Total Revenue</div>
            <div className="text-2xl font-bold text-green-100">
              {summaryStats.totalRevenue.toLocaleString()} RWF
            </div>
            <div className="text-green-400 text-xs">All time</div>
          </div>
          <div className="bg-blue-800 p-4 rounded-lg shadow">
            <div className="text-blue-300 text-sm font-medium">Total Quantity</div>
            <div className="text-2xl font-bold text-blue-100">
              {summaryStats.totalQuantity.toFixed(2)} kg
            </div>
            <div className="text-blue-400 text-xs">All time</div>
          </div>
          <div className="bg-purple-800 p-4 rounded-lg shadow">
            <div className="text-purple-300 text-sm font-medium">Avg. Price</div>
            <div className="text-2xl font-bold text-purple-100">
              {summaryStats.avgPrice.toFixed(2)} RWF/kg
            </div>
            <div className="text-purple-400 text-xs">Weighted average</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-6 bg-yellow-900 rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-yellow-300">Sales Analytics</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveChart("bar")}
                className={`p-2 rounded ${activeChart === "bar" ? "bg-yellow-600 text-white" : "bg-yellow-800 text-yellow-300"}`}
                title="Bar Chart"
              >
                <FontAwesomeIcon icon={faChartBar} />
              </button>
              <button
                onClick={() => setActiveChart("pie")}
                className={`p-2 rounded ${activeChart === "pie" ? "bg-yellow-600 text-white" : "bg-yellow-800 text-yellow-300"}`}
                title="Pie Chart"
              >
                <FontAwesomeIcon icon={faChartPie} />
              </button>
              <button
                onClick={() => setActiveChart("line")}
                className={`p-2 rounded ${activeChart === "line" ? "bg-yellow-600 text-white" : "bg-yellow-800 text-yellow-300"}`}
                title="Line Chart"
              >
                <FontAwesomeIcon icon={faChartLine} />
              </button>
            </div>
          </div>
          
          <div className="h-64">
            {activeChart === "bar" && (
              <Bar
                data={chartData.bar}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: '#eab308',
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: '#eab308',
                      },
                      grid: {
                        color: 'rgba(234, 179, 8, 0.1)',
                      },
                    },
                    x: {
                      ticks: {
                        color: '#eab308',
                      },
                      grid: {
                        color: 'rgba(234, 179, 8, 0.1)',
                      },
                    },
                  },
                }}
              />
            )}
            {activeChart === "pie" && (
              <Pie
                data={chartData.pie}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: '#eab308',
                      },
                    },
                  },
                }}
              />
            )}
            {activeChart === "line" && (
              <Line
                data={chartData.line}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: '#eab308',
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: '#eab308',
                      },
                      grid: {
                        color: 'rgba(234, 179, 8, 0.1)',
                      },
                    },
                    x: {
                      ticks: {
                        color: '#eab308',
                      },
                      grid: {
                        color: 'rgba(234, 179, 8, 0.1)',
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-yellow-900 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-yellow-400" />
              </div>
              <input
                type="text"
                placeholder="Search sales..."
                className="pl-10 w-full py-2 bg-yellow-800 border border-yellow-700 rounded-lg text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters({ ...filters, searchQuery: e.target.value })
                }
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-lg text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={filters.sell_status}
                onChange={(e) =>
                  setFilters({ ...filters, sell_status: e.target.value })
                }
              >
                <option value="">All Statuses</option>
                <option value="posted">Posted</option>
                <option value="purchased">Purchased</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                className="px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-lg text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={filters.payment_status}
                onChange={(e) =>
                  setFilters({ ...filters, payment_status: e.target.value })
                }
              >
                <option value="">All Payments</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-yellow-900 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-4xl text-yellow-400"
              />
              <p className="mt-4 text-yellow-200">Loading sales data...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">
              <FontAwesomeIcon icon={faTimesCircle} className="text-4xl mb-4" />
              <p>{error}</p>
              <button
                onClick={fetchSales}
                className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="p-8 text-center text-yellow-400">
              <FontAwesomeIcon
                icon={faMoneyBillWave}
                className="text-4xl mb-4"
              />
              <p>No sales found matching your criteria</p>
              {(filters.sell_status ||
                filters.payment_status ||
                filters.searchQuery) && (
                <button
                  onClick={() =>
                    setFilters({
                      sell_status: "",
                      payment_status: "",
                      searchQuery: "",
                    })
                  }
                  className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-yellow-700">
                <thead className="bg-yellow-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Sale ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Quantity (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Price (RWF)
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Date
                    </th>

                  </tr>
                </thead>
                <tbody className="bg-yellow-900 divide-y divide-yellow-800">
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-yellow-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-yellow-200">
                        #{sale.id}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-yellow-200">
                        {sale.farmer_phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-yellow-300">
                          <div className="font-medium">
                            {sale.harvest_grade}
                          </div>
                          <div className="text-xs text-yellow-400">
                            {sale.harvest_location}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-yellow-200 font-medium">
                        {parseFloat(sale.quantity_sold).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-yellow-200">
                        {parseFloat(sale.unit_price).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-yellow-200 text-sm">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Sale Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-yellow-900 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-yellow-300">
                    Create New Sale
                  </h2>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <form onSubmit={handleCreateSale}>
                  <div className="mb-4">
                    <label className="block text-yellow-200 mb-2">
                      Harvest Stock
                    </label>
                    <select
                      name="harvest_stock"
                      value={formData.harvest_stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          harvest_stock: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-200"
                      required
                    >
                      <option value="">Select Harvest Stock</option>
                      {harvestStocks.map((stock) => (
                        <option key={stock.id} value={stock.id}>
                          Stock #{stock.id} - {stock.current_quantity} kg
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-yellow-200 mb-2">
                        Quantity (kg)
                      </label>
                      <input
                        type="number"
                        name="quantity_sold"
                        min="0.01"
                        step="0.01"
                        value={formData.quantity_sold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity_sold: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-yellow-200 mb-2">
                        Unit Price (RWF)
                      </label>
                      <input
                        type="number"
                        name="unit_price"
                        min="0.01"
                        step="0.01"
                        value={formData.unit_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            unit_price: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-yellow-200 mb-2">
                      Delivery Days
                    </label>
                    <input
                      type="number"
                      name="delivery_days"
                      min="1"
                      value={formData.delivery_days}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          delivery_days: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-200"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-yellow-200 mb-2">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-200"
                      rows="3"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                      Post Sale
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Farmer_Manage_Sales;