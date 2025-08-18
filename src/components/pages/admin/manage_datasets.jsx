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
import Logo from "../../../assets/pictures/minagri.jpg";

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
        <div className="p-4 text-yellow-100 bg-yellow-800 rounded-lg">
          <h3 className="font-semibold">Something went wrong</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
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
    className={`${bgColor} rounded-lg shadow-xl p-5 border-l-4 border-yellow-400 flex items-center justify-between transition-all duration-300 hover:translate-y-[-3px]`}
  >
    <div>
      <p className="text-yellow-200 text-xs uppercase tracking-wider mb-1">
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

  const COLORS = ["#FFD700", "#E3A018", "#B8860B", "#DAA520", "#F4A460"];
  const token = localStorage.getItem("token");

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
      setDatasetsData(
        Array.isArray(res.data.datasets) ? res.data.datasets : []
      );
    } catch (err) {
      console.error("Error fetching datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (datasetName) => {
    if (!window.confirm(`Do you want to delete the dataset "${datasetName}"?`))
      return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/dataset/datasets/${datasetName}/delete/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
    formData.append("file", fileInput.files[0]);

    try {
      await axios.post(
        `http://127.0.0.1:8000/dataset/datasets/${datasetName}/update/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Dataset updated successfully");
      setMessageType("success");
      handleFetch();
      setSelectedDataset(null);
    } catch (err) {
      setMessage(err.response?.data.error || "Failed to update dataset");
      setMessageType("error");
    }
  };

// Replace the handlePreview function with this updated version:
const handlePreview = async (datasetName) => {
  try {
    setLoading(true);
    const res = await axios.get(
      `http://127.0.0.1:8000/dataset/datasets/${datasetName}/preview/`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { rows: 5 },
      }
    );

    console.log("Preview response:", res.data);

    // Handle the response structure - your API returns { preview: [...] }
    if (res.data && res.data.preview && Array.isArray(res.data.preview)) {
      setPreviewData({
        data: res.data.preview, // Use the preview array directly
        rows_shown: res.data.preview.length,
        total_rows: res.data.total_rows || "Unknown",
      });
      setSelectedDataset(datasetName);
    } else {
      setMessage("No preview data available for this dataset");
      setMessageType("error");
    }
  } catch (err) {
    console.error("Preview error:", err);
    setMessage(err.response?.data?.error || "Failed to load dataset preview");
    setMessageType("error");
  } finally {
    setLoading(false);
  }
};

// Replace the Dataset Preview Modal JSX with this corrected version:
{selectedDataset && previewData && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-yellow-900 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-yellow-800">
      <div className="flex justify-between items-center p-6 border-b border-yellow-800">
        <div>
          <h3 className="text-xl font-semibold text-yellow-400">
            Dataset Preview: {selectedDataset}
          </h3>
          <p className="text-sm text-yellow-300 mt-1">
            Showing first {previewData.rows_shown || 0} rows of{" "}
            {previewData.total_rows || 0} total rows
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedDataset(null);
            setPreviewData(null);
          }}
          className="text-yellow-400 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
      </div>

      <div className="p-6 overflow-auto max-h-[70vh]">
        {previewData.data &&
        Array.isArray(previewData.data) &&
        previewData.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr className="bg-yellow-800 sticky top-0">
                  {Object.keys(previewData.data[0]).map((column, index) => (
                    <th
                      key={index}
                      className="p-3 text-left font-semibold text-yellow-400 border-b border-yellow-700 whitespace-nowrap min-w-[120px]"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.data.slice(0, 5).map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`border-b border-yellow-700 hover:bg-yellow-800 transition-colors ${
                      rowIndex % 2 === 0 ? "bg-yellow-900" : "bg-yellow-950"
                    }`}
                  >
                    {Object.entries(row).map(([key, value], colIndex) => (
                      <td
                        key={colIndex}
                        className="p-3 text-yellow-200 font-mono text-sm whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis"
                        title={String(value)} // Show full value on hover
                      >
                        {value !== null && value !== undefined
                          ? String(value)
                          : "N/A"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FontAwesomeIcon
              icon={faDatabase}
              className="text-yellow-400 text-4xl mb-4"
            />
            <h4 className="text-xl font-medium text-yellow-300 mb-2">
              No Preview Data Available
            </h4>
            <p className="text-yellow-400">
              This dataset might be empty or there was an error loading the
              preview.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-yellow-800 border-t border-yellow-700 flex justify-between items-center">
        <div className="text-yellow-300 text-sm">
          <FontAwesomeIcon icon={faEye} className="mr-2" />
          Dataset: <strong>{selectedDataset}</strong>
        </div>
        <button
          onClick={() => {
            setSelectedDataset(null);
            setPreviewData(null);
          }}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Close Preview
        </button>
      </div>
    </div>
  </div>
)}

  // Modified Dataset Preview Modal JSX (replace the existing modal section)
  {
    selectedDataset && previewData && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-yellow-900 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-yellow-800">
          <div className="flex justify-between items-center p-6 border-b border-yellow-800">
            <div>
              <h3 className="text-xl font-semibold text-yellow-400">
                Dataset Preview: {selectedDataset}
              </h3>
              <p className="text-sm text-yellow-300 mt-1">
                Showing first {previewData.rows_shown || 0} rows of{" "}
                {previewData.total_rows || 0} total rows
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDataset(null);
                setPreviewData(null);
              }}
              className="text-yellow-400 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>

          <div className="p-6 overflow-auto max-h-[70vh]">
            {previewData.data &&
            Array.isArray(previewData.data) &&
            previewData.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-max">
                  <thead>
                    <tr className="bg-yellow-800 sticky top-0">
                      {Object.keys(previewData.data[0]).map((column, index) => (
                        <th
                          key={index}
                          className="p-3 text-left font-semibold text-yellow-400 border-b border-yellow-700 whitespace-nowrap min-w-[120px]"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.data.slice(0, 5).map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={`border-b border-yellow-700 hover:bg-yellow-800 transition-colors ${
                          rowIndex % 2 === 0 ? "bg-yellow-900" : "bg-yellow-950"
                        }`}
                      >
                        {Object.entries(row).map(([key, value], colIndex) => (
                          <td
                            key={colIndex}
                            className="p-3 text-yellow-200 font-mono text-sm whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis"
                            title={String(value)} // Show full value on hover
                          >
                            {value !== null && value !== undefined
                              ? String(value)
                              : "N/A"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FontAwesomeIcon
                  icon={faDatabase}
                  className="text-yellow-400 text-4xl mb-4"
                />
                <h4 className="text-xl font-medium text-yellow-300 mb-2">
                  No Preview Data Available
                </h4>
                <p className="text-yellow-400">
                  This dataset might be empty or there was an error loading the
                  preview.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-yellow-800 border-t border-yellow-700 flex justify-between items-center">
            <div className="text-yellow-300 text-sm">
              <FontAwesomeIcon icon={faEye} className="mr-2" />
              Dataset: <strong>{selectedDataset}</strong>
            </div>
            <button
              onClick={() => {
                setSelectedDataset(null);
                setPreviewData(null);
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Replace the existing handleDownload object in your component with this updated version
  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();

      // Add logo/header section
      try {
        doc.addImage(Logo, "JPEG", 14, 10, 30, 20);
      } catch (error) {
        console.log("Logo could not be added to PDF:", error);
      }

      // Header section
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      // doc.text("DATASET MANAGEMENT SYSTEM", 14, 25);

      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      doc.text("Ministry of Agriculture and Animal Resources", 14, 35);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 42);
      doc.text(`Total Datasets: ${filteredSortedData.length}`, 14, 49);

      // Add a line separator
      doc.setLineWidth(0.5);
      doc.line(14, 55, 196, 55);

      // Table title
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("DATASETS SUMMARY", 14, 65);

      // Create table data matching the displayed table format
      const tableColumn = ["Dataset Name", "Columns", "Size", "Last Modified"];
      const tableRows = currentDatasets.map((dataset) => [
        dataset.name,
        `${dataset.columns.length} columns`,
        dataset.size_human,
        new Date(dataset.last_modified * 1000).toLocaleDateString(),
      ]);

      // Add the table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 75,
        styles: {
          fontSize: 10,
          cellPadding: 4,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [180, 134, 11], // Yellow-brown color matching your theme
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 40 },
        },
      });

      // Footer information
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(
        `Period: ${new Date().toLocaleDateString()} - Current`,
        14,
        finalY
      );
      doc.text(
        `Showing: Page ${currentPage} of ${Math.ceil(
          filteredSortedData.length / datasetsPerPage
        )}`,
        14,
        finalY + 7
      );
      doc.text(
        `Status: ${filteredSortedData.length} datasets found`,
        14,
        finalY + 14
      );

      doc.save(
        `datasets_summary_${new Date().toISOString().split("T")[0]}.pdf`
      );
    },

    Excel: () => {
      // Create workbook with professional formatting
      const workbook = XLSX.utils.book_new();

      // Header information
      const headerData = [
        ["DATASET MANAGEMENT SYSTEM"],
        ["Smart Sunflow Production and Marketing Production"],
        [`Generated: ${new Date().toLocaleDateString()}`],
        [`Total Datasets: ${filteredSortedData.length}`],
        [""], // Empty row
        ["DATASETS SUMMARY"],
        [""], // Empty row before table
      ];

      // Table data matching the displayed format
      const tableData = [
        ["Dataset Name", "Columns", "Size", "Last Modified"], // Headers
        ...currentDatasets.map((dataset) => [
          dataset.name,
          `${dataset.columns.length} columns`,
          dataset.size_human,
          new Date(dataset.last_modified * 1000).toLocaleDateString(),
        ]),
      ];

      // Combine header and table data
      const combinedData = [...headerData, ...tableData];

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(combinedData);

      // Set column widths
      worksheet["!cols"] = [
        { wch: 25 }, // Dataset Name
        { wch: 15 }, // Columns
        { wch: 12 }, // Size
        { wch: 18 }, // Last Modified
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Datasets Summary");

      // Save file
      XLSX.writeFile(
        workbook,
        `datasets_summary_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    },

    CSV: () => {
      // Create header section for CSV
      const headerLines = [
        "DATASET MANAGEMENT SYSTEM",
        "Ministry of Agriculture and Animal Resources",
        `Generated: ${new Date().toLocaleDateString()}`,
        `Total Datasets: ${filteredSortedData.length}`,
        "", // Empty line
        "DATASETS SUMMARY",
        "", // Empty line before data
      ];

      // Table headers
      const tableHeaders = "Dataset Name,Columns,Size,Last Modified";

      // Table data matching the displayed format
      const tableRows = currentDatasets
        .map(
          (dataset) =>
            `"${dataset.name}","${dataset.columns.length} columns","${
              dataset.size_human
            }","${new Date(dataset.last_modified * 1000).toLocaleDateString()}"`
        )
        .join("\n");

      // Footer information
      const footerLines = [
        "",
        `Period: ${new Date().toLocaleDateString()} - Current`,
        `Showing: Page ${currentPage} of ${Math.ceil(
          filteredSortedData.length / datasetsPerPage
        )}`,
        `Status: ${filteredSortedData.length} datasets found`,
      ];

      // Combine all content
      const csvContent = [
        ...headerLines,
        tableHeaders,
        tableRows,
        ...footerLines,
      ].join("\n");

      // Create and download file
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `datasets_summary_${new Date().toISOString().split("T")[0]}.csv`
      );
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
        const matchesSizeMin =
          !filters.sizeMin ||
          sizeBytes >= parseFloat(filters.sizeMin) * 1024 * 1024;
        const matchesSizeMax =
          !filters.sizeMax ||
          sizeBytes <= parseFloat(filters.sizeMax) * 1024 * 1024;

        // Date filters
        const modifiedDate = new Date(dataset.last_modified * 1000);
        const matchesDateFrom =
          !filters.dateFrom || modifiedDate >= new Date(filters.dateFrom);
        const matchesDateTo =
          !filters.dateTo || modifiedDate <= new Date(filters.dateTo);

        return (
          matchesSearch &&
          matchesSizeMin &&
          matchesSizeMax &&
          matchesDateFrom &&
          matchesDateTo
        );
      })
      .sort((a, b) => {
        // Convert last_modified to Date objects if that's the sort field
        if (filters.sortField === "last_modified") {
          const dateA = new Date(a[filters.sortField] * 1000);
          const dateB = new Date(b[filters.sortField] * 1000);

          if (filters.sortDirection === "asc") {
            return dateA - dateB;
          } else {
            return dateB - dateA;
          }
        }

        // For size_bytes
        if (filters.sortField === "size_bytes") {
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
    const totalSize = datasetsData.reduce(
      (total, dataset) => total + dataset.size_bytes,
      0
    );
    const sizeInMB = totalSize / (1024 * 1024);

    // Calculate the datasets with the most columns
    const maxColumns =
      datasetsData.length > 0
        ? Math.max(...datasetsData.map((dataset) => dataset.columns.length))
        : 0;

    // Calculate the average number of columns across all datasets
    const avgColumns =
      datasetsData.length > 0
        ? datasetsData.reduce(
            (total, dataset) => total + dataset.columns.length,
            0
          ) / datasetsData.length
        : 0;

    // Find datasets added/modified in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDatasets = datasetsData.filter(
      (dataset) => new Date(dataset.last_modified * 1000) >= thirtyDaysAgo
    ).length;

    return {
      total: datasetsData.length,
      totalSizeMB: sizeInMB.toFixed(2),
      maxColumns,
      avgColumns: Math.round(avgColumns),
      recentDatasets,
    };
  }, [datasetsData]);

  const renderCharts = () => {
    if (!datasetsData.length) return null;

    // Prepare data for the dataset size chart
    const sizeData = datasetsData
      .sort((a, b) => b.size_bytes - a.size_bytes)
      .slice(0, 5)
      .map((dataset) => ({
        name:
          dataset.name.length > 15
            ? dataset.name.substring(0, 15) + "..."
            : dataset.name,
        size: parseFloat((dataset.size_bytes / (1024 * 1024)).toFixed(2)),
      }));

    // Prepare data for the columns distribution chart
    const columnDistribution = {};
    datasetsData.forEach((dataset) => {
      const columnCount = dataset.columns.length;
      const bracket = Math.floor(columnCount / 5) * 5; // Group in brackets of 5
      const bracketLabel = `${bracket}-${bracket + 4}`;
      columnDistribution[bracketLabel] =
        (columnDistribution[bracketLabel] || 0) + 1;
    });

    const columnData = Object.entries(columnDistribution).map(
      ([range, count]) => ({
        name: range,
        value: count,
      })
    );

    return (
      <div className="w-full lg:w-1/3 space-y-6">
        <ErrorBoundary>
          <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-yellow-400 flex items-center">
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
                  stroke="#FFD700"
                  strokeWidth={2}
                  name="Size (MB)"
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-yellow-400 flex items-center">
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
                  formatter={(value, name, props) => [
                    `${value} datasets`,
                    `${props.payload.name} columns`,
                  ]}
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
          <div
            key={i}
            className="bg-yellow-900 rounded-lg shadow-lg p-5 h-24"
          />
        ))}
      </div>
      <div className="bg-yellow-900 p-6 rounded-lg shadow-lg mb-6">
        <div className="h-8 bg-yellow-800 rounded mb-6 w-3/4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-yellow-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="p-6 bg-gradient-to-b from-yellow-900 to-yellow-950 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="mb-6 p-6 bg-yellow-900 rounded-lg shadow-xl border-b-4 border-yellow-500">
            <h1 className="text-center text-yellow-400 font-bold text-2xl mb-2">
              Dataset Management Dashboard
            </h1>
            <p className="text-center text-yellow-200 text-sm max-w-2xl mx-auto">
              Comprehensive dataset management system for browsing, previewing,
              and managing CSV datasets
            </p>
          </div>

          {message && (
            <div
              className={`fixed top-5 right-5 py-3 px-4 rounded-lg shadow-xl border-l-4 z-50 transition-all duration-300 transform translate-x-0 ${
                messageType === "success"
                  ? "bg-green-800 text-green-100 border-green-500"
                  : "bg-red-800 text-red-100 border-red-500"
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
                    {messageType === "success" ? "Success" : "Error"}
                  </p>
                  <p className="text-sm opacity-90">{message}</p>
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

          <div className={`${containerClasses} animate-fadeIn`}>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <SummaryCard
                icon={faTable}
                title="Total Datasets"
                value={summaryMetrics.total}
                bgColor="bg-yellow-900"
                textColor="text-yellow-300"
              />
              <SummaryCard
                icon={faDatabase}
                title="Total Size"
                value={`${summaryMetrics.totalSizeMB} MB`}
                bgColor="bg-yellow-900"
                textColor="text-yellow-300"
              />
              <SummaryCard
                icon={faColumns}
                title="Avg. Columns"
                value={summaryMetrics.avgColumns}
                bgColor="bg-yellow-900"
                textColor="text-yellow-300"
              />
              <SummaryCard
                icon={faCalendarAlt}
                title="New Datasets (30 days)"
                value={summaryMetrics.recentDatasets}
                bgColor="bg-yellow-900"
                textColor="text-yellow-300"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/3">
              <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-yellow-400 flex items-center">
                      <FontAwesomeIcon icon={faTable} className="mr-2" />
                      <span className="font-semibold">Filtered Datasets:</span>
                      <span className="ml-2 px-3 py-1 bg-yellow-600 text-white rounded-full">
                        {filteredSortedData.length}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="text-yellow-400"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Search datasets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full text-yellow-200 bg-yellow-800 border border-yellow-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-yellow-500"
                      />
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setFilterMenuVisible(!filterMenuVisible)}
                        className="py-2 bg-yellow-600 px-4 rounded-lg text-white flex items-center justify-center hover:bg-yellow-700 transition duration-200 w-full sm:w-auto"
                      >
                        <FontAwesomeIcon icon={faFilter} className="mr-2" />
                        Filters
                      </button>
                      {filterMenuVisible && (
                        <div className="absolute right-0 mt-2 bg-yellow-800 text-yellow-200 shadow-lg rounded-lg p-4 z-10 border border-yellow-700 w-64">
                          <h4 className="font-semibold mb-3 pb-2 border-b border-yellow-700">
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
                              className="w-full px-3 py-2 bg-yellow-700 border border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
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
                              className="w-full px-3 py-2 bg-yellow-700 border border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
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
                              className="w-full px-3 py-2 bg-yellow-700 border border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
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
                              className="w-full px-3 py-2 bg-yellow-700 border border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
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
                                className="flex-1 px-3 py-2 bg-yellow-700 border border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                              >
                                <option value="last_modified">
                                  Last Modified
                                </option>
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
                                className="px-3 py-2 bg-yellow-700 border border-yellow-600 rounded-lg hover:bg-yellow-600 text-yellow-200"
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
                              className="px-3 py-1 bg-yellow-700 text-yellow-300 rounded hover:bg-yellow-600 text-sm"
                            >
                              Reset
                            </button>
                            <button
                              onClick={() => setFilterMenuVisible(false)}
                              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setDownloadMenuVisible(!downloadMenuVisible)
                        }
                        className="py-2 bg-yellow-600 px-4 rounded-lg text-white flex items-center justify-center hover:bg-yellow-700 transition duration-200 w-full sm:w-auto"
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Export
                      </button>
                      {downloadMenuVisible && (
                        <div className="absolute right-0 mt-2 bg-yellow-800 text-yellow-200 shadow-lg rounded-lg p-4 z-10 border border-yellow-700 w-48">
                          <h4 className="font-semibold mb-3 pb-2 border-b border-yellow-700">
                            Export Options
                          </h4>
                          <ul className="space-y-2">
                            <li>
                              <button
                                onClick={() => {
                                  handleDownload.PDF();
                                  setDownloadMenuVisible(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-yellow-700 rounded-md transition duration-200 flex items-center"
                              >
                                <FontAwesomeIcon
                                  icon={faDownload}
                                  className="mr-2 text-yellow-400"
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
                                className="w-full text-left px-3 py-2 hover:bg-yellow-700 rounded-md transition duration-200 flex items-center"
                              >
                                <FontAwesomeIcon
                                  icon={faFileExcel}
                                  className="mr-2 text-yellow-400"
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
                                className="w-full text-left px-3 py-2 hover:bg-yellow-700 rounded-md transition duration-200 flex items-center"
                              >
                                <FontAwesomeIcon
                                  icon={faFileCsv}
                                  className="mr-2 text-yellow-400"
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
                      <div className="text-center py-12 bg-yellow-800 rounded-lg border border-yellow-700">
                        <div className="text-yellow-400 mb-2">
                          <FontAwesomeIcon icon={faDatabase} size="3x" />
                        </div>
                        <h3 className="text-xl font-medium text-yellow-300 mb-2">
                          No datasets found
                        </h3>
                        <p className="text-yellow-400">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-yellow-800 text-left">
                              <th className="p-4 font-semibold text-yellow-400 border-b border-yellow-700">
                                Dataset Name
                              </th>
                              <th className="p-4 font-semibold text-yellow-400 border-b border-yellow-700">
                                Columns
                              </th>
                              <th className="p-4 font-semibold text-yellow-400 border-b border-yellow-700">
                                Size
                              </th>
                              <th className="p-4 font-semibold text-yellow-400 border-b border-yellow-700">
                                Last Modified
                              </th>
                              <th className="p-4 font-semibold text-yellow-400 border-b border-yellow-700">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentDatasets.map((dataset, index) => (
                              <tr
                                key={index}
                                className="border-b border-yellow-700 hover:bg-yellow-800 transition-all duration-150"
                              >
                                <td className="p-4 font-mono text-yellow-200">
                                  {dataset.name}
                                </td>
                                <td className="p-4 text-yellow-300">
                                  <span className="bg-yellow-700 text-yellow-300 px-2 py-1 rounded text-xs">
                                    {dataset.columns.length} columns
                                  </span>
                                  <div className="mt-1 text-xs text-yellow-400 truncate max-w-xs">
                                    {dataset.columns.slice(0, 3).join(", ")}
                                    {dataset.columns.length > 3 && "..."}
                                  </div>
                                </td>
                                <td className="p-4 text-yellow-300 font-mono">
                                  {dataset.size_human}
                                </td>
                                <td className="p-4 text-yellow-300">
                                  {new Date(
                                    dataset.last_modified * 1000
                                  ).toLocaleString()}
                                </td>
                                <td className="p-4">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() =>
                                        handlePreview(dataset.name)
                                      }
                                      disabled={loading}
                                      className={`p-2 rounded transition duration-150 ${
                                        loading
                                          ? "bg-gray-600 cursor-not-allowed text-gray-400"
                                          : "bg-blue-600 hover:bg-blue-700 text-white"
                                      }`}
                                      title="Preview Dataset"
                                    >
                                      <FontAwesomeIcon
                                        icon={loading ? faHistory : faEye}
                                        className={
                                          loading ? "animate-spin" : ""
                                        }
                                      />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setSelectedDataset(dataset.name)
                                      }
                                      className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded transition duration-150"
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
                    <div className="text-sm text-yellow-400">
                      Showing {(currentPage - 1) * datasetsPerPage + 1} to{" "}
                      {Math.min(
                        currentPage * datasetsPerPage,
                        filteredSortedData.length
                      )}{" "}
                      of {filteredSortedData.length} datasets
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={datasetsPerPage}
                        onChange={(e) => {
                          setDatasetsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="bg-yellow-800 border border-yellow-700 text-yellow-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="25">25 per page</option>
                        <option value="50">50 per page</option>
                      </select>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${
                          currentPage === 1
                            ? "bg-yellow-700 text-yellow-500 cursor-not-allowed"
                            : "bg-yellow-800 text-yellow-300 hover:bg-yellow-700"
                        }`}
                      >
                        Previous
                      </button>
                      {Array.from(
                        {
                          length: Math.ceil(
                            filteredSortedData.length / datasetsPerPage
                          ),
                        },
                        (_, i) => {
                          // Show limited page numbers with ellipsis
                          if (
                            i === 0 ||
                            i ===
                              Math.ceil(
                                filteredSortedData.length / datasetsPerPage
                              ) -
                                1 ||
                            (i >= currentPage - 2 && i <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded ${
                                  currentPage === i + 1
                                    ? "bg-yellow-600 text-white"
                                    : "bg-yellow-800 text-yellow-300 hover:bg-yellow-700"
                                }`}
                              >
                                {i + 1}
                              </button>
                            );
                          }
                          return null;
                        }
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(
                              Math.ceil(
                                filteredSortedData.length / datasetsPerPage
                              ),
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
                            ? "bg-yellow-700 text-yellow-500 cursor-not-allowed"
                            : "bg-yellow-800 text-yellow-300 hover:bg-yellow-700"
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

          {/* Dataset Preview Modal */}
          {selectedDataset && previewData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-yellow-900 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-yellow-800">
                <div className="flex justify-between items-center p-6 border-b border-yellow-800">
                  <h3 className="text-xl font-semibold text-yellow-400">
                    Dataset Preview: {selectedDataset}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedDataset(null);
                      setPreviewData(null);
                    }}
                    className="text-yellow-400 hover:text-white"
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </button>
                </div>
                <div className="p-6 overflow-auto max-h-[60vh]">
                  {previewData.data && previewData.data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-yellow-800">
                            {Object.keys(previewData.data[0]).map(
                              (column, index) => (
                                <th
                                  key={index}
                                  className="p-3 text-left font-semibold text-yellow-400 border-b border-yellow-700"
                                >
                                  {column}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.data.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className="border-b border-yellow-700 hover:bg-yellow-800"
                            >
                              {Object.values(row).map((value, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="p-3 text-yellow-200 font-mono text-sm"
                                >
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-yellow-400">
                      No preview data available
                    </div>
                  )}
                </div>
                <div className="p-6 bg-yellow-800 border-t border-yellow-700">
                  <p className="text-yellow-300 text-sm">
                    Showing first {previewData.rows_shown || 0} rows of{" "}
                    {previewData.total_rows || 0} total rows
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Modal */}
          {selectedDataset && !previewData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-yellow-900 rounded-lg shadow-2xl max-w-md w-full border border-yellow-800">
                <div className="flex justify-between items-center p-6 border-b border-yellow-800">
                  <h3 className="text-xl font-semibold text-yellow-400">
                    Upload New Version
                  </h3>
                  <button
                    onClick={() => setSelectedDataset(null)}
                    className="text-yellow-400 hover:text-white"
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </button>
                </div>
                <form onSubmit={(e) => handleUploadFile(e, selectedDataset)}>
                  <div className="p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-yellow-400 mb-2">
                        Dataset: {selectedDataset}
                      </label>
                      <div className="border-2 border-dashed border-yellow-700 rounded-lg p-6 text-center">
                        <FontAwesomeIcon
                          icon={faFileUpload}
                          className="text-yellow-400 text-3xl mb-4"
                        />
                        <p className="text-yellow-300 mb-2">
                          Choose a CSV file to upload
                        </p>
                        <input
                          type="file"
                          accept=".csv"
                          className="block w-full text-sm text-yellow-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 p-6 bg-yellow-800 border-t border-yellow-700">
                    <button
                      type="button"
                      onClick={() => setSelectedDataset(null)}
                      className="px-4 py-2 bg-yellow-700 text-yellow-300 rounded-lg hover:bg-yellow-600 transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-200"
                    >
                      Upload
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Datasets;
