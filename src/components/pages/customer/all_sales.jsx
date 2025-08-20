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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      setError(t('sales.errors.fetchFailed'));
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
      showMessage(t('sales.messages.createSuccess'), "success");
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
        err.response?.data?.errors?.non_field_errors || t('sales.messages.createFailed'),
        "error"
      );
      console.error("Error creating sale:", err);
    }
  };

  const cancelSale = async (saleId) => {
    if (window.confirm(t('sales.confirmations.cancelSale'))) {
      try {
        await axios.delete(`http://127.0.0.1:8000/sales/delete/${saleId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showMessage(t('sales.messages.cancelSuccess'), "success");
        fetchSales();
      } catch (err) {
        showMessage(
          err.response?.data?.error || t('sales.messages.cancelFailed'),
          "error"
        );
        console.error("Error cancelling sale:", err);
      }
    }
  };

  const completeSale = async (saleId) => {
    if (
      window.confirm(t('sales.confirmations.completeSale'))
    ) {
      try {
        await axios.post(
          `http://127.0.0.1:8000/sales/complete/${saleId}/`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showMessage(t('sales.messages.completeSuccess'), "success");
        fetchSales();
      } catch (err) {
        showMessage(
          err.response?.data?.error || t('sales.messages.completeFailed'),
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
      labels: filteredSales.map((sale) => `${t('sales.chart.saleLabel')} #${sale.id}`),
      datasets: [
        {
          label: t('sales.chart.revenueLabel'),
          data: filteredSales.map((sale) => sale.total_amount),
          backgroundColor: "rgba(234, 179, 8, 0.7)",
          borderColor: "rgba(234, 179, 8, 1)",
          borderWidth: 1,
        },
        {
          label: t('sales.chart.quantityLabel'),
          data: filteredSales.map((sale) => sale.quantity_sold),
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
        },
      ],
    },
    pie: {
      labels: [
        t('sales.status.posted'),
        t('sales.status.purchased'),
        t('sales.status.completed'),
        t('sales.status.cancelled')
      ],
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
          label: t('sales.chart.dailyRevenueLabel'),
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
      doc.text(t('sales.export.companyName'), 20, 25);
      
      doc.setFontSize(16);
      doc.setTextColor(60, 60, 60);
      doc.text(t('sales.export.reportTitle'), 20, 35);
      
      // Contact Information
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(t('sales.export.email'), 20, 45);
      doc.text(t('sales.export.phone'), 20, 50);
      doc.text(t('sales.export.address'), 20, 55);
      
      // Report Details
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(`${t('sales.export.generated')}: ${new Date().toLocaleString()}`, 20, 70);
      doc.text(`${t('sales.export.totalRecords')}: ${filteredSales.length}`, 20, 75);
      
      // Filters Applied
      let yPosition = 85;
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(t('sales.export.filtersApplied'), 20, yPosition);
      yPosition += 5;
      
      if (filters.sell_status) {
        doc.text(`• ${t('sales.export.statusFilter')}: ${filters.sell_status.toUpperCase()}`, 25, yPosition);
        yPosition += 5;
      }
      if (filters.payment_status) {
        doc.text(`• ${t('sales.export.paymentFilter')}: ${filters.payment_status.toUpperCase()}`, 25, yPosition);
        yPosition += 5;
      }
      if (filters.searchQuery) {
        doc.text(`• ${t('sales.export.searchFilter')}: "${filters.searchQuery}"`, 25, yPosition);
        yPosition += 5;
      }
      if (!filters.sell_status && !filters.payment_status && !filters.searchQuery) {
        doc.text(`• ${t('sales.export.noFilters')}`, 25, yPosition);
        yPosition += 5;
      }
      
      // Summary Statistics
      yPosition += 10;
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(t('sales.export.summaryStats'), 20, yPosition);
      yPosition += 10;
      
      const summaryData = [
        [t('sales.export.totalSales'), filteredSales.length.toString()],
        [t('sales.export.totalRevenue'), `${summaryStats.totalRevenue.toLocaleString()} RWF`],
        [t('sales.export.totalQuantity'), `${summaryStats.totalQuantity.toFixed(2)} kg`],
        [t('sales.export.avgPrice'), `${summaryStats.avgPrice.toFixed(2)} RWF/kg`]
      ];
      
      doc.autoTable({
        startY: yPosition,
        head: [[t('sales.export.metric'), t('sales.export.value')]],
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
      doc.text(t('sales.export.salesDetails'), 20, finalY + 15);
      
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
        head: [[
          t('sales.table.id'),
          t('sales.table.date'),
          t('sales.table.stock'),
          t('sales.table.owner'),
          t('sales.table.quantity'),
          t('sales.table.price'),
          t('sales.table.total'),
          t('sales.table.status'),
          t('sales.table.payment')
        ]],
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
        doc.text(`${t('sales.export.page')} ${i} ${t('sales.export.of')} ${pageCount}`, 20, pageHeight - 10);
        doc.text(`© ${new Date().getFullYear()} ${t('sales.export.companyName')}`, doc.internal.pageSize.width - 80, pageHeight - 10);
      }
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `${t('sales.export.filename')}_${timestamp}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      showMessage(t('sales.export.success', { filename }), "success");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showMessage(t('sales.export.failed'), "error");
    }
  };

  const SaleStatusBadge = ({ status }) => {
    const statusMap = {
      posted: { color: "bg-blue-600", text: t('sales.status.posted'), icon: faBox },
      purchased: { color: "bg-purple-600", text: t('sales.status.purchased'), icon: faUser },
      completed: {
        color: "bg-green-600",
        text: t('sales.status.completed'),
        icon: faCheckCircle,
      },
      cancelled: {
        color: "bg-red-600",
        text: t('sales.status.cancelled'),
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
      unpaid: { color: "bg-red-600", text: t('sales.payment.unpaid'), icon: faTimesCircle },
      partial: { color: "bg-yellow-600", text: t('sales.payment.partial'), icon: faSpinner },
      paid: { color: "bg-green-600", text: t('sales.payment.paid'), icon: faCheckCircle },
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
                {t('sales.title')}
              </h1>
              <p className="text-yellow-200">
                {t('sales.subtitle')}
              </p>
            </div>
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
                  {messageType === "success" ? t('common.success') : t('common.error')}
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
            <div className="text-yellow-300 text-sm font-medium">{t('sales.summary.totalSales')}</div>
            <div className="text-2xl font-bold text-yellow-100">
              {summaryStats.totalSales}
            </div>
            <div className="text-yellow-400 text-xs">{t('sales.summary.allTime')}</div>
          </div>
          <div className="bg-green-800 p-4 rounded-lg shadow">
            <div className="text-green-300 text-sm font-medium">{t('sales.summary.totalRevenue')}</div>
            <div className="text-2xl font-bold text-green-100">
              {summaryStats.totalRevenue.toLocaleString()} RWF
            </div>
            <div className="text-green-400 text-xs">{t('sales.summary.allTime')}</div>
          </div>
          <div className="bg-blue-800 p-4 rounded-lg shadow">
            <div className="text-blue-300 text-sm font-medium">{t('sales.summary.totalQuantity')}</div>
            <div className="text-2xl font-bold text-blue-100">
              {summaryStats.totalQuantity.toFixed(2)} kg
            </div>
            <div className="text-blue-400 text-xs">{t('sales.summary.allTime')}</div>
          </div>
          <div className="bg-purple-800 p-4 rounded-lg shadow">
            <div className="text-purple-300 text-sm font-medium">{t('sales.summary.avgPrice')}</div>
            <div className="text-2xl font-bold text-purple-100">
              {summaryStats.avgPrice.toFixed(2)} RWF/kg
            </div>
            <div className="text-purple-400 text-xs">{t('sales.summary.weightedAverage')}</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-6 bg-yellow-900 rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-yellow-300">{t('sales.analytics.title')}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveChart("bar")}
                className={`p-2 rounded ${activeChart === "bar" ? "bg-yellow-600 text-white" : "bg-yellow-800 text-yellow-300"}`}
                title={t('sales.analytics.barChart')}
              >
                <FontAwesomeIcon icon={faChartBar} />
              </button>
              <button
                onClick={() => setActiveChart("pie")}
                className={`p-2 rounded ${activeChart === "pie" ? "bg-yellow-600 text-white" : "bg-yellow-800 text-yellow-300"}`}
                title={t('sales.analytics.pieChart')}
              >
                <FontAwesomeIcon icon={faChartPie} />
              </button>
              <button
                onClick={() => setActiveChart("line")}
                className={`p-2 rounded ${activeChart === "line" ? "bg-yellow-600 text-white" : "bg-yellow-800 text-yellow-300"}`}
                title={t('sales.analytics.lineChart')}
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
                placeholder={t('sales.filters.searchPlaceholder')}
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
                <option value="">{t('sales.filters.allStatuses')}</option>
                <option value="posted">{t('sales.status.posted')}</option>
                <option value="purchased">{t('sales.status.purchased')}</option>
                <option value="completed">{t('sales.status.completed')}</option>
                <option value="cancelled">{t('sales.status.cancelled')}</option>
              </select>

              <select
                className="px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-lg text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={filters.payment_status}
                onChange={(e) =>
                  setFilters({ ...filters, payment_status: e.target.value })
                }
              >
                <option value="">{t('sales.filters.allPayments')}</option>
                <option value="unpaid">{t('sales.payment.unpaid')}</option>
                <option value="partial">{t('sales.payment.partial')}</option>
                <option value="paid">{t('sales.payment.paid')}</option>
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
              <p className="mt-4 text-yellow-200">{t('sales.loading')}</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">
              <FontAwesomeIcon icon={faTimesCircle} className="text-4xl mb-4" />
              <p>{error}</p>
              <button
                onClick={fetchSales}
                className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
              >
                {t('common.retry')}
              </button>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="p-8 text-center text-yellow-400">
              <FontAwesomeIcon
                icon={faMoneyBillWave}
                className="text-4xl mb-4"
              />
              <p>{t('sales.noSalesFound')}</p>
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
                  {t('sales.clearFilters')}
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-yellow-700">
                <thead className="bg-yellow-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t('sales.table.saleId')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t('sales.table.owner')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t('sales.table.stock')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t('sales.table.quantity')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t('sales.table.price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t('sales.table.date')}
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
                    {t('sales.modal.createTitle')}
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
                      {t('sales.modal.harvestStock')}
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
                      <option value="">{t('sales.modal.selectHarvestStock')}</option>
                      {harvestStocks.map((stock) => (
                        <option key={stock.id} value={stock.id}>
                          {t('sales.modal.stockOption', { 
                            id: stock.id, 
                            quantity: stock.current_quantity 
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-yellow-200 mb-2">
                        {t('sales.modal.quantity')}
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
                        {t('sales.modal.unitPrice')}
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
                      {t('sales.modal.deliveryDays')}
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
                    <label className="block text-yellow-200 mb-2">
                      {t('sales.modal.notes')}
                    </label>
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
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                      {t('sales.modal.postSale')}
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