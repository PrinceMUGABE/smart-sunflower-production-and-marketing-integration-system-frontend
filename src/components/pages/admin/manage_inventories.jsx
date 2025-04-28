/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faDownload,
  faSearch,
  faTable,
  faChartPie,
  faFileUpload,
  faFilter,
  faCalendarAlt,
  faColumns,
  faDatabase,
  faHistory,
  faFileExcel,
  faFileCsv,
  faEye,
  faSortAmountDown,
  faSortAmountUp,
  faCheckCircle,
  faExclamationCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-green-100 bg-green-900 rounded-lg">
          <h3 className="font-semibold">Something went wrong</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Summary Card Component
const SummaryCard = ({ icon, title, value, bgColor, textColor }) => (
  <div
    className={`${bgColor} rounded-lg shadow-xl p-5 border-l-4 border-teal-400 flex items-center justify-between transition-all duration-300 hover:translate-y-[-3px]`}
  >
    <div>
      <p className="text-slate-300 text-xs uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className={`text-2xl font-mono font-bold ${textColor}`}>{value}</p>
    </div>
    <div className={`${textColor} bg-opacity-10 p-4 rounded-full`}>
      <FontAwesomeIcon icon={icon} size="lg" />
    </div>
  </div>
);

function Datasets() {
  const [datasetsData, setDatasetsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [datasetsPerPage, setDatasetsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filters, setFilters] = useState({
    sizeMin: "",
    sizeMax: "",
    dateFrom: "",
    dateTo: "",
    sortField: "last_modified",
    sortDirection: "desc",
  });
  const navigate = useNavigate();

  const COLORS = ['#2A7B9B', '#22C1C3', '#57C785'];
  const token = localStorage.getItem("token");

  // Add these classes to headings
  const headingClasses = "font-sans font-medium tracking-tight";
  // For data values
  const dataValueClass = "font-mono text-lg";

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const accessToken = storedUserData
      ? JSON.parse(storedUserData).access_token
      : null;
    if (!accessToken) {
      navigate("/login");
      return;
    }
    handleFetch();
  }, [navigate]);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/dataset/datasets/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDatasetsData(Array.isArray(res.data.datasets) ? res.data.datasets : []);
    } catch (err) {
      console.error("Error fetching datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (datasetName) => {
    if (!window.confirm(`Do you want to delete the dataset "${datasetName}"?`)) return;
    try {
      // Note: This API endpoint isn't provided in the code sample, so this is just a placeholder
      await axios.delete(`http://127.0.0.1:8000/dataset/datasets/${datasetName}/delete/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      await handleFetch();
      setMessage("Dataset deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data.message || "An error occurred");
      setMessageType("error");
    }
  };

  const handleUploadFile = async (event, datasetName) => {
    event.preventDefault();
    const fileInput = event.target.querySelector('input[type="file"]');
    if (!fileInput.files.length) {
      setMessage("No file selected");
      setMessageType("error");
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
      await axios.post(`http://127.0.0.1:8000/dataset/datasets/${datasetName}/update/`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      
      setMessage("Dataset updated successfully");
      setMessageType("success");
      handleFetch();
      setSelectedDataset(null);
    } catch (err) {
      setMessage(err.response?.data.error || "Failed to update dataset");
      setMessageType("error");
    }
  };

  const handlePreview = async (datasetName) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/dataset/datasets/${datasetName}/preview/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { rows: 5 }
      });
      
      setPreviewData(res.data);
      setSelectedDataset(datasetName);
    } catch (err) {
      setMessage("Failed to load dataset preview");
      setMessageType("error");
    }
  };

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text("Datasets Summary", 14, 15);
      
      // Create table data
      const tableColumn = ["Name", "Columns", "Size", "Modified Date"];
      const tableRows = filteredSortedData.map(dataset => [
        dataset.name,
        dataset.columns.length.toString(),
        dataset.size_human,
        new Date(dataset.last_modified * 1000).toLocaleDateString()
      ]);
      
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        styles: { fontSize: 10 },
        columnStyles: { 0: { cellWidth: 70 } }
      });
      
      doc.save("datasets_summary.pdf");
    },
    Excel: () => {
      // Format data for Excel
      const excelData = filteredSortedData.map(dataset => ({
        'Dataset Name': dataset.name,
        'Number of Columns': dataset.columns.length,
        'Size': dataset.size_human,
        'Last Modified': new Date(dataset.last_modified * 1000).toLocaleDateString()
      }));
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(excelData),
        "Datasets"
      );
      XLSX.writeFile(workbook, "datasets_summary.xlsx");
    },
    CSV: () => {
      // Format data for CSV
      const csvData = filteredSortedData.map(dataset => ({
        'Dataset Name': dataset.name,
        'Number of Columns': dataset.columns.length,
        'Size': dataset.size_human,
        'Last Modified': new Date(dataset.last_modified * 1000).toLocaleDateString()
      }));
      
      const headers = Object.keys(csvData[0]).join(",");
      const rows = csvData.map(row => Object.values(row).join(",")).join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
      
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "datasets_summary.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  };

  // Filter and sort data
  const filteredSortedData = useMemo(() => {
    return datasetsData
      .filter((dataset) => {
        const matchesSearch = [
          dataset.name,
          ...dataset.columns,
          dataset.size_human,
        ].some((field) =>
          String(field).toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Additional filters for dataset size (convert MB to bytes for comparison)
        const sizeBytes = dataset.size_bytes;
        const matchesSizeMin = !filters.sizeMin || sizeBytes >= parseFloat(filters.sizeMin) * 1024 * 1024;
        const matchesSizeMax = !filters.sizeMax || sizeBytes <= parseFloat(filters.sizeMax) * 1024 * 1024;

        // Date filters
        const modifiedDate = new Date(dataset.last_modified * 1000);
        const matchesDateFrom = !filters.dateFrom || modifiedDate >= new Date(filters.dateFrom);
        const matchesDateTo = !filters.dateTo || modifiedDate <= new Date(filters.dateTo);

        return matchesSearch && matchesSizeMin && matchesSizeMax && matchesDateFrom && matchesDateTo;
      })
      .sort((a, b) => {
        // Convert last_modified to Date objects if that's the sort field
        if (filters.sortField === 'last_modified') {
          const dateA = new Date(a[filters.sortField] * 1000);
          const dateB = new Date(b[filters.sortField] * 1000);
          
          if (filters.sortDirection === "asc") {
            return dateA - dateB;
          } else {
            return dateB - dateA;
          }
        }
        
        // For size_bytes
        if (filters.sortField === 'size_bytes') {
          if (filters.sortDirection === "asc") {
            return a[filters.sortField] - b[filters.sortField];
          } else {
            return b[filters.sortField] - a[filters.sortField];
          }
        }
        
        // For other fields (string comparison)
        const fieldA = a[filters.sortField];
        const fieldB = b[filters.sortField];

        if (filters.sortDirection === "asc") {
          return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
        } else {
          return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
        }
      });
  }, [datasetsData, searchQuery, filters]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalSize = datasetsData.reduce((total, dataset) => total + dataset.size_bytes, 0);
    const sizeInMB = totalSize / (1024 * 1024);
    
    // Calculate the datasets with the most columns
    const maxColumns = datasetsData.length > 0 
      ? Math.max(...datasetsData.map(dataset => dataset.columns.length))
      : 0;
    
    // Calculate the average number of columns across all datasets
    const avgColumns = datasetsData.length > 0
      ? datasetsData.reduce((total, dataset) => total + dataset.columns.length, 0) / datasetsData.length
      : 0;
    
    // Find datasets added/modified in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentDatasets = datasetsData.filter(dataset => 
      new Date(dataset.last_modified * 1000) >= thirtyDaysAgo
    ).length;
    
    return {
      total: datasetsData.length,
      totalSizeMB: sizeInMB.toFixed(2),
      maxColumns,
      avgColumns: Math.round(avgColumns),
      recentDatasets
    };
  }, [datasetsData]);

  const renderCharts = () => {
    if (!datasetsData.length) return null;

    // Prepare data for the dataset size chart
    const sizeData = datasetsData
      .sort((a, b) => b.size_bytes - a.size_bytes)
      .slice(0, 5)
      .map(dataset => ({
        name: dataset.name.length > 15 ? dataset.name.substring(0, 15) + '...' : dataset.name,
        size: parseFloat((dataset.size_bytes / (1024 * 1024)).toFixed(2))
      }));

    // Prepare data for the columns distribution chart
    const columnDistribution = {};
    datasetsData.forEach(dataset => {
      const columnCount = dataset.columns.length;
      const bracket = Math.floor(columnCount / 5) * 5; // Group in brackets of 5
      const bracketLabel = `${bracket}-${bracket + 4}`;
      columnDistribution[bracketLabel] = (columnDistribution[bracketLabel] || 0) + 1;
    });

    const columnData = Object.entries(columnDistribution).map(([range, count]) => ({
      name: range,
      value: count
    }));

    return (
      <div className="w-full lg:w-1/3 space-y-6">
        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-green-400 flex items-center">
              <FontAwesomeIcon icon={faDatabase} className="mr-2" />
              Top 5 Datasets by Size (MB)
            </h3>
            <ResponsiveContainer>
              <LineChart data={sizeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: "#CBD5E1" }}
                  stroke="#475569"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#CBD5E1" }}
                  stroke="#475569"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderColor: "#334155",
                    borderRadius: "0.5rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value) => [`${value} MB`, "Size"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="size" 
                  stroke="#0EA5E9" 
                  strokeWidth={2}
                  name="Size (MB)"
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-green-400 flex items-center">
              <FontAwesomeIcon icon={faColumns} className="mr-2" />
              Column Count Distribution
            </h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={columnData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={{
                    position: "outside",
                    offset: 10,
                    fill: "#e5e7eb",
                  }}
                >
                  {columnData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                  formatter={(value, name, props) => [`${value} datasets`, `${props.payload.name} columns`]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ color: "#e5e7eb" }}
                  formatter={(value) => `${value} columns`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  const currentDatasets = filteredSortedData.slice(
    (currentPage - 1) * datasetsPerPage,
    currentPage * datasetsPerPage
  );

  const containerClasses = "transition-all duration-300 ease-in-out";

  const showToast = (message, type) => {
    setMessage(message);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000); // Auto-dismiss after 5 seconds
  };

  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800 rounded-lg shadow-lg p-5 h-24" />
        ))}
      </div>
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
        <div className="h-8 bg-slate-700 rounded mb-6 w-3/4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="mb-6 p-6 bg-slate-800 rounded-lg shadow-xl border-b-4 border-teal-500">
            <h1 className="text-center text-teal-400 font-bold text-2xl mb-2">
              Dataset Management Dashboard
            </h1>
            <p className="text-center text-slate-400 text-sm max-w-2xl mx-auto">
              Comprehensive dataset management system for browsing, previewing, and managing CSV datasets
            </p>
          </div>

          {message && (
            <div
              className={`fixed top-5 right-5 py-3 px-4 rounded-lg shadow-xl border-l-4 z-50 transition-all duration-300 transform translate-x-0 ${
                messageType === "success"
                  ? "bg-teal-800 text-teal-100 border-teal-500"
                  : "bg-amber-800 text-amber-100 border-amber-500"
              }`}
            >
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={
                    messageType === "success"
                      ? faCheckCircle
                      : faExclamationCircle
                  }
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">
                    {messageType === "success" ? "Success" : "Notice"}
                  </p>
                  <p className="text-sm opacity-90">{message}</p>
                </div>
                <button
                  onClick={() => setMessage("")}
                  className="ml-4 text-slate-300 hover:text-white"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
          )}

          <div className={`${containerClasses} animate-fadeIn`}>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <SummaryCard
                icon={faTable}
                title="Total Datasets"
                value={summaryMetrics.total}
                bgColor="bg-gray-900"
                textColor="text-blue-400"
              />
              <SummaryCard
                icon={faDatabase}
                title="Total Size"
                value={`${summaryMetrics.totalSizeMB} MB`}
                bgColor="bg-gray-900"
                textColor="text-green-400"
              />
              <SummaryCard
                icon={faColumns}
                title="Avg. Columns"
                value={summaryMetrics.avgColumns}
                bgColor="bg-gray-900"
                textColor="text-green-400"
              />
              <SummaryCard
                icon={faCalendarAlt}
                title="New Datasets (30 days)"
                value={summaryMetrics.recentDatasets}
                bgColor="bg-gray-900"
                textColor="text-yellow-400"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/3">
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-green-400 flex items-center">
                      <FontAwesomeIcon icon={faTable} className="mr-2" />
                      <span className="font-semibold">Filtered Datasets:</span>
                      <span className="ml-2 px-3 py-1 bg-green-600 text-white rounded-full">
                        {filteredSortedData.length}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="text-gray-400"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Search datasets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setFilterMenuVisible(!filterMenuVisible)}
                        className="py-2 bg-indigo-600 px-4 rounded-lg text-white flex items-center justify-center hover:bg-indigo-700 transition duration-200 w-full sm:w-auto"
                      >
                        <FontAwesomeIcon icon={faFilter} className="mr-2" />
                        Filters
                      </button>
                      {filterMenuVisible && (
                        <div className="absolute right-0 mt-2 bg-gray-800 text-gray-200 shadow-lg rounded-lg p-4 z-10 border border-gray-700 w-64">
                          <h4 className="font-semibold mb-3 pb-2 border-b border-gray-700">
                            Advanced Filters
                          </h4>

                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">
                              Size (Min MB)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={filters.sizeMin}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  sizeMin: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">
                              Size (Max MB)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={filters.sizeMax}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  sizeMax: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">
                              From Date
                            </label>
                            <input
                              type="date"
                              value={filters.dateFrom}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  dateFrom: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">
                              To Date
                            </label>
                            <input
                              type="date"
                              value={filters.dateTo}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  dateTo: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">
                              Sort By
                            </label>
                            <div className="flex gap-2">
                              <select
                                value={filters.sortField}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    sortField: e.target.value,
                                  })
                                }
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                              >
                                <option value="last_modified">Last Modified</option>
                                <option value="name">Name</option>
                                <option value="size_bytes">Size</option>
                              </select>
                              <button
                                onClick={() =>
                                  setFilters({
                                    ...filters,
                                    sortDirection:
                                      filters.sortDirection === "asc"
                                        ? "desc"
                                        : "asc",
                                  })
                                }
                                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600"
                                title={
                                  filters.sortDirection === "asc"
                                    ? "Ascending"
                                    : "Descending"
                                }
                              >
                                <FontAwesomeIcon
                                  icon={
                                    filters.sortDirection === "asc"
                                      ? faSortAmountUp
                                      : faSortAmountDown
                                  }
                                />
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between mt-4">
                            <button
                              onClick={() => {
                                setFilters({
                                  sizeMin: "",
                                  sizeMax: "",
                                  dateFrom: "",
                                  dateTo: "",
                                  sortField: "last_modified",
                                  sortDirection: "desc",
                                });
                                setFilterMenuVisible(false);
                              }}
                              className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
                            >
                              Reset
                            </button>
                            <button
                              onClick={() => setFilterMenuVisible(false)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                        className="py-2 bg-green-600 px-4 rounded-lg text-white flex items-center justify-center hover:bg-green-700 transition duration-200 w-full sm:w-auto"
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Export
                      </button>
                      {downloadMenuVisible && (
                        <div className="absolute right-0 mt-2 bg-gray-800 text-gray-200 shadow-lg rounded-lg p-4 z-10 border border-gray-700 w-48">
                          <h4 className="font-semibold mb-3 pb-2 border-b border-gray-700">
                            Export Options
                          </h4>
                          <ul className="space-y-2">
                            <li>
                              <button
                                onClick={() => {
                                  handleDownload.PDF();
                                  setDownloadMenuVisible(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-md transition duration-200 flex items-center"
                              >
                                <FontAwesomeIcon
                                  icon={faDownload}
                                  className="mr-2 text-red-400"
                                />
                                PDF
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => {
                                  handleDownload.Excel();
                                  setDownloadMenuVisible(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-md transition duration-200 flex items-center"
                              >
                                <FontAwesomeIcon
                                  icon={faFileExcel}
                                  className="mr-2 text-green-400"
                                />
                                Excel
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => {
                                  handleDownload.CSV();
                                  setDownloadMenuVisible(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-md transition duration-200 flex items-center"
                              >
                                <FontAwesomeIcon
                                  icon={faFileCsv}
                                  className="mr-2 text-blue-400"
                                />
                                CSV
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {loading ? (
                  <SkeletonLoader />
                ) : (
                  <>
                    {filteredSortedData.length === 0 ? (
                      <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="text-slate-400 mb-2">
                          <FontAwesomeIcon icon={faDatabase} size="3x" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-300 mb-2">No datasets found</h3>
                        <p className="text-slate-400">Try adjusting your search criteria</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-800 text-left">
                              <th className="p-4 font-semibold text-green-400 border-b border-gray-700">Dataset Name</th>
                              <th className="p-4 font-semibold text-green-400 border-b border-gray-700">Columns</th>
                              <th className="p-4 font-semibold text-green-400 border-b border-gray-700">Size</th>
                              <th className="p-4 font-semibold text-green-400 border-b border-gray-700">Last Modified</th>
                              <th className="p-4 font-semibold text-green-400 border-b border-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentDatasets.map((dataset, index) => (
                              <tr 
                                key={index}
                                className="border-b border-gray-700 hover:bg-gray-800 transition-all duration-150"
                              >
                                <td className="p-4 font-mono text-gray-200">{dataset.name}</td>
                                <td className="p-4 text-gray-300">
                                  <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                                    {dataset.columns.length} columns
                                  </span>
                                  <div className="mt-1 text-xs text-gray-400 truncate max-w-xs">
                                    {dataset.columns.slice(0, 3).join(", ")}
                                    {dataset.columns.length > 3 && "..."}
                                  </div>
                                </td>
                                <td className="p-4 text-gray-300 font-mono">{dataset.size_human}</td>
                                <td className="p-4 text-gray-300">
                                  {new Date(dataset.last_modified * 1000).toLocaleString()}
                                </td>
                                <td className="p-4">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handlePreview(dataset.name)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition duration-150"
                                      title="Preview Dataset"
                                    >
                                      <FontAwesomeIcon icon={faEye} />
                                    </button>
                                    <button
                                      onClick={() => setSelectedDataset(dataset.name)}
                                      className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded transition duration-150"
                                      title="Upload New Version"
                                    >
                                      <FontAwesomeIcon icon={faFileUpload} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(dataset.name)}
                                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition duration-150"
                                      title="Delete Dataset"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {/* Pagination Controls */}
                {filteredSortedData.length > 0 && (
                  <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-400">
                      Showing {(currentPage - 1) * datasetsPerPage + 1} to{" "}
                      {Math.min(currentPage * datasetsPerPage, filteredSortedData.length)}{" "}
                      of {filteredSortedData.length} datasets
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={datasetsPerPage}
                        onChange={(e) => {
                          setDatasetsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="bg-gray-800 border border-gray-700 text-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="25">25 per page</option>
                        <option value="50">50 per page</option>
                      </select>
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${
                          currentPage === 1
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        Previous
                      </button>
                      {Array.from(
                        { length: Math.ceil(filteredSortedData.length / datasetsPerPage) },
                        (_, i) => {
                          // Show limited page numbers with ellipsis
                          if (
                            i === 0 ||
                            i === Math.ceil(filteredSortedData.length / datasetsPerPage) - 1 ||
                            (i >= currentPage - 2 && i <= currentPage + 0)
                          ) {
                            return (
                              <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded ${
                                  currentPage === i + 1
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                }`}
                              >
                                {i + 1}
                              </button>
                            );
                          }
                          if (
                            i === currentPage - 3 ||
                            i === currentPage + 1
                          ) {
                            return (
                              <span
                                key={i}
                                className="w-8 h-8 flex items-center justify-center text-gray-500"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        }
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(
                              Math.ceil(filteredSortedData.length / datasetsPerPage),
                              currentPage + 1
                            )
                          )
                        }
                        disabled={
                          currentPage ===
                          Math.ceil(filteredSortedData.length / datasetsPerPage)
                        }
                        className={`px-3 py-1 rounded ${
                          currentPage ===
                          Math.ceil(filteredSortedData.length / datasetsPerPage)
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Charts Section */}
            {renderCharts()}
          </div>

          {/* Preview Modal */}
          {previewData && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700">
                <div className="flex justify-between items-center border-b border-gray-700 p-4">
                  <h3 className="text-xl font-semibold text-teal-400 flex items-center">
                    <FontAwesomeIcon icon={faTable} className="mr-2" />
                    {selectedDataset}
                  </h3>
                  <button
                    onClick={() => {
                      setPreviewData(null);
                      setSelectedDataset(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <p className="text-xs uppercase text-gray-400 mb-1">Total Rows</p>
                      <p className="text-2xl font-mono text-green-400">{previewData.total_rows}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <p className="text-xs uppercase text-gray-400 mb-1">Total Columns</p>
                      <p className="text-2xl font-mono text-blue-400">{previewData.columns.length}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <p className="text-xs uppercase text-gray-400 mb-1">Preview Rows</p>
                      <p className="text-2xl font-mono text-amber-400">{previewData.preview.length}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faColumns} className="mr-2" />
                      Column Names
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {previewData.columns.map((column, index) => (
                        <span
                          key={index}
                          className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {column}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faTable} className="mr-2" />
                      Data Preview
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-800">
                            {previewData.columns.map((column, index) => (
                              <th
                                key={index}
                                className="p-3 text-left font-semibold text-teal-400 border-b border-gray-700"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.preview.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className="border-b border-gray-700 hover:bg-gray-800"
                            >
                              {previewData.columns.map((column, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="p-3 font-mono text-sm text-gray-300"
                                >
                                  {row[column] !== null && row[column] !== undefined
                                    ? String(row[column])
                                    : <span className="text-gray-500">null</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Modal */}
          {selectedDataset && !previewData && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-gray-700">
                <div className="flex justify-between items-center border-b border-gray-700 p-4">
                  <h3 className="text-xl font-semibold text-amber-400 flex items-center">
                    <FontAwesomeIcon icon={faFileUpload} className="mr-2" />
                    Update Dataset
                  </h3>
                  <button
                    onClick={() => setSelectedDataset(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </button>
                </div>
                
                <div className="p-6">
                  <form onSubmit={(e) => handleUploadFile(e, selectedDataset)}>
                    <div className="mb-6">
                      <p className="text-gray-300 mb-2">
                        You are about to update <span className="font-semibold text-amber-400">{selectedDataset}</span>
                      </p>
                      <p className="text-gray-400 text-sm mb-4">
                        The new file must have the exact same column structure as the existing dataset.
                      </p>
                      
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                        <FontAwesomeIcon icon={faFileUpload} className="text-gray-500 text-3xl mb-3" />
                        <p className="mb-2 text-gray-400">Choose a CSV file to upload</p>
                        <input
                          type="file"
                          accept=".csv"
                          className="block w-full text-sm text-gray-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-green-600 file:text-white
                            hover:file:bg-green-700"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setSelectedDataset(null)}
                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center"
                      >
                        <FontAwesomeIcon icon={faFileUpload} className="mr-2" />
                        Upload
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Datasets;
