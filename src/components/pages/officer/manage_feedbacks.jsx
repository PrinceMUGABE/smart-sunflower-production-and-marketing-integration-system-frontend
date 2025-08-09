/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
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
  faComment,
  faChartPie,
  faPlus,
  faStar,
  faEye,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faCalendarAlt,
  faUser,
  faMapMarkerAlt,
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
  BarChart,
  Bar,
} from "recharts";
import Logog from "../../../assets/pictures/sunflower2.jpg";

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

function Officer_Manage_Feedbacks() {
  const [feedbackData, setFeedbackData] = useState([]);
  const [relocations, setRelocations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbacksPerPage, setFeedbacksPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentToView, setCommentToView] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const navigate = useNavigate();

  // New states for enhanced filtering and sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filterConfig, setFilterConfig] = useState({
    rating: [],
    dateRange: { start: "", end: "" },
    relocation: "",
  });
  const [activeFilters, setActiveFilters] = useState(0);
  const [summaryStats, setSummaryStats] = useState({
    averageRating: 0,
    totalFeedbacks: 0,
    highestRated: null,
    lowestRated: null,
  });

  const COLORS = ["#FF6B6B", "#4ECDC4", "#FFD166", "#F9F871", "#A58FE3"];
  const BASE_URL = "http://127.0.0.1:8000/feedback/";
  const RELOCATIONS_URL = "http://127.0.0.1:8000/weather/predictions/";
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
    fetchRelocations();
  }, [navigate]);

  useEffect(() => {
    if (feedbackData.length > 0) {
      calculateSummaryStats();
    }
  }, [feedbackData]);

  const calculateSummaryStats = () => {
    const totalRating = feedbackData.reduce(
      (sum, feedback) => sum + feedback.rating,
      0
    );
    const average = totalRating / feedbackData.length;

    // Find highest and lowest rated feedback
    let highest = feedbackData[0];
    let lowest = feedbackData[0];

    feedbackData.forEach((feedback) => {
      if (feedback.rating > highest.rating) highest = feedback;
      if (feedback.rating < lowest.rating) lowest = feedback;
    });

    setSummaryStats({
      averageRating: average.toFixed(1),
      totalFeedbacks: feedbackData.length,
      highestRated: highest,
      lowestRated: lowest,
    });
  };

  const handleFetch = async () => {
    try {
      const res = await axios.get(`${BASE_URL}my-feedbacks/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbackData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  };

  const fetchRelocations = async () => {
    try {
      const res = await axios.get(RELOCATIONS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRelocations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching relocations:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this feedback?")) return;
    try {
      await axios.delete(`${BASE_URL}delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleFetch();
      setMessage("Feedback deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data.message || "An error occurred");
      setMessageType("error");
    }
  };

  // Replace the existing handleDownload object with this updated version

const handleDownload = {
  PDF: () => {
    const doc = new jsPDF();
    
    // Add logo (you'll need to convert the image to base64 or use a URL)
    // For now, I'll add a placeholder for the logo
    try {
      // Add logo at top left
      doc.addImage(Logog, 'JPEG', 20, 15, 30, 30);
    } catch (e) {
      console.log('Logo could not be added to PDF');
    }
    
    // Add header text
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Sunflower Production and Marketing Integration', 60, 25);
    
    // Add generation info
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Generated: ${currentDate}`, 60, 35);
    doc.text(`Total Records: ${filteredData.length}`, 60, 42);
    doc.text(`Period: ${new Date().getFullYear()}/Current`, 60, 49);
    
    // Calculate totals
    const totalRating = filteredData.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = filteredData.length > 0 ? (totalRating / filteredData.length).toFixed(2) : 0;
    
    doc.text(`Total Rating: ${totalRating}`, 60, 56);
    doc.text(`Average Rating: ${averageRating}`, 60, 63);
    
    // Add section title
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('FEEDBACK RECORDS', 20, 80);
    
    // Prepare table data from filtered results
    const tableData = filteredData.map((feedback, index) => [
      index + 1, // #
      feedback.relocation ? `${feedback.relocation.district}` : 'N/A', // District
      feedback.relocation ? feedback.relocation.sector : 'N/A', // Sector  
      `${feedback.rating}/5`, // Rating
      feedback.relocation ? feedback.relocation.season : 'N/A', // Season
      new Date(feedback.created_at).toLocaleDateString(), // Created At
    ]);
    
    // Add table
    doc.autoTable({
      startY: 90,
      head: [['#', 'District', 'Sector', 'Rating', 'Season', 'Created At']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Add footer with page info
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Showing Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text(`Status: ${filteredData.length} records found`, 150, doc.internal.pageSize.height - 10);
    }
    
    doc.save('feedback_records.pdf');
  },

  Excel: () => {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare header data for Excel
    const headerData = [
      ['Sunflower Production and Marketing Integration'],
      [''],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [`Total Records: ${filteredData.length}`],
      [`Period: ${new Date().getFullYear()}/Current`],
      [`Total Rating: ${filteredData.reduce((sum, feedback) => sum + feedback.rating, 0)}`],
      [`Average Rating: ${filteredData.length > 0 ? (filteredData.reduce((sum, feedback) => sum + feedback.rating, 0) / filteredData.length).toFixed(2) : 0}`],
      [''],
      ['FEEDBACK RECORDS'],
      [''],
      ['#', 'District', 'Sector', 'Rating (out of 5)', 'Season', 'Comment', 'User', 'Created At']
    ];
    
    // Prepare feedback data
    const feedbackData = filteredData.map((feedback, index) => [
      index + 1,
      feedback.relocation ? feedback.relocation.district : 'N/A',
      feedback.relocation ? feedback.relocation.sector : 'N/A',
      `${feedback.rating}/5`,
      feedback.relocation ? feedback.relocation.season : 'N/A',
      feedback.comment,
      feedback.created_by ? feedback.created_by.phone_number : 'N/A',
      new Date(feedback.created_at).toLocaleDateString()
    ]);
    
    // Add footer data
    const footerData = [
      [''],
      [`Showing Page 1 of 1`],
      [`Status: ${filteredData.length} records found`]
    ];
    
    // Combine all data
    const allData = [...headerData, ...feedbackData, ...footerData];
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(allData);
    
    // Style the header
    const headerStyle = {
      font: { bold: true, size: 14 },
      alignment: { horizontal: 'center' }
    };
    
    // Apply styles to specific cells
    if (worksheet['A1']) {
      worksheet['A1'].s = headerStyle;
    }
    
    // Set column widths
    const columnWidths = [
      { wch: 5 },   // #
      { wch: 15 },  // District
      { wch: 15 },  // Sector
      { wch: 12 },  // Rating
      { wch: 12 },  // Season
      { wch: 30 },  // Comment
      { wch: 15 },  // User
      { wch: 12 }   // Created At
    ];
    worksheet['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback Records');
    
    // Save file
    XLSX.writeFile(workbook, 'feedback_records.xlsx');
  },

  CSV: () => {
    // Prepare CSV header with metadata
    const csvHeader = [
      'Sunflower Production and Marketing Integration',
      '',
      `Generated: ${new Date().toLocaleDateString()}`,
      `Total Records: ${filteredData.length}`,
      `Period: ${new Date().getFullYear()}/Current`,
      `Total Rating: ${filteredData.reduce((sum, feedback) => sum + feedback.rating, 0)}`,
      `Average Rating: ${filteredData.length > 0 ? (filteredData.reduce((sum, feedback) => sum + feedback.rating, 0) / filteredData.length).toFixed(2) : 0}`,
      '',
      'FEEDBACK RECORDS',
      '',
      '#,District,Sector,Rating,Season,Comment,User,Created At'
    ];
    
    // Prepare feedback data
    const csvData = filteredData.map((feedback, index) => [
      index + 1,
      feedback.relocation ? feedback.relocation.district : 'N/A',
      feedback.relocation ? feedback.relocation.sector : 'N/A',
      `${feedback.rating}/5`,
      feedback.relocation ? feedback.relocation.season : 'N/A',
      `"${feedback.comment.replace(/"/g, '""')}"`, // Escape quotes in comments
      feedback.created_by ? feedback.created_by.phone_number : 'N/A',
      new Date(feedback.created_at).toLocaleDateString()
    ].join(','));
    
    // Add footer
    const csvFooter = [
      '',
      `Showing Page 1 of 1`,
      `Status: ${filteredData.length} records found`
    ];
    
    // Combine all CSV content
    const csvContent = [
      ...csvHeader,
      ...csvData,
      ...csvFooter
    ].join('\n');
    
    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'feedback_records.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

  const handleAddUpdateFeedback = async (e) => {
    e.preventDefault();
    try {
      const feedbackData = {
        rating: parseInt(e.target.rating.value),
        comment: e.target.comment.value,
        relocation: e.target.relocation.value,
      };

      if (currentFeedback) {
        // Update existing feedback
        await axios.put(
          `${BASE_URL}update/${currentFeedback.id}/`,
          feedbackData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setMessage("Feedback updated successfully");
      } else {
        // Create new feedback
        await axios.post(`${BASE_URL}create/`, feedbackData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setMessage("Feedback created successfully");
      }

      handleFetch();
      setIsModalOpen(false);
      setCurrentFeedback(null);
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data.error || "An error occurred");
      setMessageType("error");
    }
  };

  const openModal = (feedback = null) => {
    setCurrentFeedback(feedback);
    setIsModalOpen(true);
  };

  const openCommentModal = (comment) => {
    setCommentToView(comment);
    setIsCommentModalOpen(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={i < rating ? "text-yellow-400" : "text-gray-500"}
        />
      );
    }
    return <div className="flex space-x-1">{stars}</div>;
  };

  // Sorting functions
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (column) => {
    if (sortConfig.key !== column) {
      return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-500" />;
    }
    return sortConfig.direction === "ascending" ? (
      <FontAwesomeIcon icon={faSortUp} className="ml-1 text-green-400" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="ml-1 text-green-400" />
    );
  };

  // Filtering functions
  const handleFilterChange = (field, value) => {
    setFilterConfig((prev) => {
      const newConfig = { ...prev };

      if (field === "rating") {
        // Toggle rating in the array
        if (newConfig.rating.includes(value)) {
          newConfig.rating = newConfig.rating.filter((r) => r !== value);
        } else {
          newConfig.rating = [...newConfig.rating, value];
        }
      } else if (field === "dateRange") {
        newConfig.dateRange = { ...newConfig.dateRange, ...value };
      } else {
        newConfig[field] = value;
      }

      // Calculate active filters
      let activeCount = 0;
      if (newConfig.rating.length > 0) activeCount++;
      if (newConfig.dateRange.start || newConfig.dateRange.end) activeCount++;
      if (newConfig.relocation) activeCount++;

      setActiveFilters(activeCount);
      return newConfig;
    });
  };

  const resetFilters = () => {
    setFilterConfig({
      rating: [],
      dateRange: { start: "", end: "" },
      relocation: "",
    });
    setActiveFilters(0);
  };

  // Apply filters and sorting
  const applyFiltersAndSort = (data) => {
    // First apply search filter
    let filteredData = data.filter((feedback) =>
      [
        feedback.comment,
        feedback.rating?.toString(),
        feedback.created_by?.phone_number,
        feedback.created_by?.email,
      ].some((field) =>
        field?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    // Apply specific filters
    if (filterConfig.rating.length > 0) {
      filteredData = filteredData.filter((feedback) =>
        filterConfig.rating.includes(feedback.rating)
      );
    }

    if (filterConfig.dateRange.start) {
      const startDate = new Date(filterConfig.dateRange.start);
      filteredData = filteredData.filter(
        (feedback) => new Date(feedback.created_at) >= startDate
      );
    }

    if (filterConfig.dateRange.end) {
      const endDate = new Date(filterConfig.dateRange.end);
      endDate.setHours(23, 59, 59);
      filteredData = filteredData.filter(
        (feedback) => new Date(feedback.created_at) <= endDate
      );
    }

    if (filterConfig.relocation) {
      filteredData = filteredData.filter(
        (feedback) =>
          feedback.relocation &&
          feedback.relocation.id === parseInt(filterConfig.relocation)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        let aValue, bValue;

        // Handle nested properties
        if (sortConfig.key === "user") {
          aValue = a.created_by ? a.created_by.phone_number : "";
          bValue = b.created_by ? b.created_by.phone_number : "";
        } else if (sortConfig.key === "relocation") {
          aValue = a.relocation ? a.relocation.start_point : "";
          bValue = b.relocation ? b.relocation.start_point : "";
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (sortConfig.direction === "ascending") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filteredData;
  };

  const filteredData = applyFiltersAndSort(feedbackData);
  const totalPages = Math.ceil(filteredData.length / feedbacksPerPage);

  const currentFeedbacks = filteredData.slice(
    (currentPage - 1) * feedbacksPerPage,
    currentPage * feedbacksPerPage
  );

  const renderCharts = () => {
    if (!feedbackData.length) return null;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      name: `${rating} Star${rating > 1 ? "s" : ""}`,
      value: feedbackData.filter((feedback) => feedback.rating === rating)
        .length,
    }));

    // Average rating by date (month)
    const ratingsByDate = feedbackData.reduce((acc, feedback) => {
      const date = new Date(feedback.created_at);
      const month = date.toLocaleString("default", { month: "short" });

      if (!acc[month]) {
        acc[month] = { total: 0, count: 0 };
      }

      acc[month].total += feedback.rating;
      acc[month].count += 1;

      return acc;
    }, {});

    const ratingTrendData = Object.entries(ratingsByDate).map(
      ([month, data]) => ({
        name: month,
        rating: data.total / data.count,
      })
    );

    // Relocation ratings
    const relocationRatings = {};
    feedbackData.forEach((feedback) => {
      if (feedback.relocation) {
        const relocationName = `${feedback.relocation.season}`;
        if (!relocationRatings[relocationName]) {
          relocationRatings[relocationName] = { total: 0, count: 0 };
        }
        relocationRatings[relocationName].total += feedback.rating;
        relocationRatings[relocationName].count += 1;
      }
    });

    const relocationData = Object.entries(relocationRatings)
      .map(([name, data]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        fullName: name,
        rating: (data.total / data.count).toFixed(1),
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 relocations

    return (
      <div className="w-full lg:w-1/3 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-yellow-900 p-4 rounded-lg shadow-lg border border-yelloq-800">
            <h3 className="text-xs uppercase font-semibold text-yellow-500 mb-1">
              Average Rating
            </h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-yellow-400">
                {summaryStats.averageRating}
              </span>
              <div className="ml-2">
                {renderStars(Math.round(summaryStats.averageRating))}
              </div>
            </div>
          </div>

          <div className="bg-yellow-900 p-4 rounded-lg shadow-lg border border-yellow-800">
            <h3 className="text-xs uppercase font-semibold text-yellow-500 mb-1">
              Total Feedbacks
            </h3>
            <span className="text-2xl font-bold text-yellow-400">
              {summaryStats.totalFeedbacks}
            </span>
          </div>
        </div>


        <ErrorBoundary>
          <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-green-400 flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-2" />
              Average Rating Trend
            </h3>
            <ResponsiveContainer>
              <LineChart data={ratingTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  padding={{ left: 20, right: 20 }}
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                  padding={{ top: 20, bottom: 20 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#FF6B6B"
                  name="Average Rating"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

      </div>
    );
  };

  const renderFilterPanel = () => {
    return (
      <div
        className={`bg-yellow-800 p-4 rounded-lg shadow-lg border border-yellow-700 mb-4 ${
          isFilterPanelOpen ? "block" : "hidden"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Rating filters */}
          <div>
            <h4 className="text-gray-300 font-semibold mb-2 flex items-center">
              <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-400" />
              Rating
            </h4>
            <div className="flex flex-wrap gap-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFilterChange("rating", rating)}
                  className={`px-3 py-1 rounded-full flex items-center ${
                    filterConfig.rating.includes(rating)
                      ? "bg-yellow-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {rating}{" "}
                  <FontAwesomeIcon
                    icon={faStar}
                    className="ml-1 text-yellow-400"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <h4 className="text-gray-300 font-semibold mb-2 flex items-center">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="mr-2 text-blue-400"
              />
              Date Range
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">From</label>
                <input
                  type="date"
                  value={filterConfig.dateRange.start}
                  onChange={(e) =>
                    handleFilterChange("dateRange", { start: e.target.value })
                  }
                  className="w-full p-2 bg-yellow-700 border border-yellow-600 rounded text-yellow-300 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">To</label>
                <input
                  type="date"
                  value={filterConfig.dateRange.end}
                  onChange={(e) =>
                    handleFilterChange("dateRange", { end: e.target.value })
                  }
                  className="w-full p-2 bg-yellow-700 border border-yellow-600 rounded text-yellow-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Relocation filter */}
          <div>
            <h4 className="text-gray-300 font-semibold mb-2 flex items-center">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="mr-2 text-yellow-400"
              />
              Relocation Route
            </h4>
            <select
              value={filterConfig.relocation}
              onChange={(e) => handleFilterChange("relocation", e.target.value)}
              className="w-full p-2 bg-yellow-700 border border-yellow-600 rounded text-yellow-300"
            >
              <option value="">All Seasons</option>
              {relocations.map((relocation) => (
                <option key={relocation.id} value={relocation.id}>
                  {relocation.season}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-yellow-700 text-gray-300 rounded hover:bg-yellow-600 transition w-full"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderModal = () => {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          isModalOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black opacity-50 ${
            isModalOpen ? "block" : "hidden"
          }`}
          onClick={() => setIsModalOpen(false)}
        ></div>
        <div className="bg-yellow-900 rounded-lg shadow-xl p-6 z-50 w-96 border border-yellow-800">
          <h2 className="text-xl font-bold mb-4 text-yellow-500">
            {currentFeedback ? "Update Feedback" : "Add New Feedback"}
          </h2>
          <form onSubmit={handleAddUpdateFeedback}>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Rating (1-5)</label>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="text-2xl text-yellow-400">
                      ✨
                    </div>
                  ))}
                </div>
                <select
                  name="rating"
                  defaultValue={currentFeedback?.rating || 5}
                  required
                  className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-300"
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Prediction</label>
                <select
                  name="relocation"
                  defaultValue={currentFeedback?.relocation?.id || ""}
                  required
                  className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-300"
                >
                  {relocations.map((relocation) => (
                    <option key={relocation.id} value={relocation.id}>
                      {relocation.sector}-{relocation.altitude} to {relocation.soil_type}-{relocation.season}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Comment</label>
                <textarea
                  name="comment"
                  defaultValue={currentFeedback?.comment || ""}
                  required
                  rows={4}
                  className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-300"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                {currentFeedback ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderCommentModal = () => {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          isCommentModalOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`fixed inset-0 bg-yellow-400 opacity-50 ${
            isCommentModalOpen ? "block" : "hidden"
          }`}
          onClick={() => setIsCommentModalOpen(false)}
        ></div>
        <div className="bg-yello-900 rounded-lg shadow-xl p-6 z-50 w-full max-w-lg border border-yellow-800">
          <h2 className="text-xl font-bold mb-4 text-yellow-500 flex items-center">
            <FontAwesomeIcon icon={faComment} className="mr-2" />
            Feedback Comment
          </h2>
          <div className="bg-yellow-800 p-4 rounded-lg border border-yellow-700 max-h-96 overflow-y-auto">
            <p className="text-gray-300 whitespace-pre-wrap">{commentToView}</p>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setIsCommentModalOpen(false)}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container bg-yellow-800 px-4 py-8 mx-auto">
      {message && (
        <div
          className={`p-4 mb-4 rounded-lg ${
            messageType === "success"
              ? "bg-green-800 text-green-100"
              : "bg-green-800 text-green-100"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h1 className="text-2xl font-bold text-yellow-400">
              Manage Feedbacks
            </h1>

            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <button
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className="flex items-center px-4 py-2 bg-yellow-700 rounded-lg hover:bg-yellow-700 transition"
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Filters
                  {activeFilters > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                      {activeFilters}
                    </span>
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search feedbacks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 bg-yellow-800 rounded-lg pr-10 border border-yellow-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute right-3 top-3 text-gray-400"
                  />
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                  className="flex items-center px-4 py-2 bg-yellow-800 rounded-lg hover:bg-yellow-700 transition"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Export
                </button>
                {downloadMenuVisible && (
                  <div className="absolute right-0 mt-2 w-48 bg-yellow-800 rounded-md shadow-lg z-10 border border-yellow-700">
                    <div className="py-1">
                      {Object.entries(handleDownload).map(
                        ([format, handler]) => (
                          <button
                            key={format}
                            onClick={() => {
                              handler();
                              setDownloadMenuVisible(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-yellow-700"
                          >
                            Export as {format}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => openModal()}
                className="flex items-center px-4 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Feedback
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {renderFilterPanel()}

          <div className="bg-yellow-900 rounded-lg shadow-lg border border-yellow-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table id="feedback-table" className="w-full text-left">
                <thead className="bg-yellow-800 text-yellow-400 text-xs uppercase">
                  <tr>
                    <th
                      className="p-4 cursor-pointer"
                      onClick={() => requestSort("rating")}
                    >
                      Rating {getSortIcon("rating")}
                    </th>
                    <th
                      className="p-4 cursor-pointer"
                      onClick={() => requestSort("comment")}
                    >
                      Comment {getSortIcon("comment")}
                    </th>
                    {/* <th
                      className="p-4 cursor-pointer"
                      onClick={() => requestSort("user")}
                    >
                      User {getSortIcon("user")}
                    </th> */}
                    <th
                      className="p-4 cursor-pointer"
                      onClick={() => requestSort("relocation")}
                    >
                      Relocation {getSortIcon("relocation")}
                    </th>
                    <th
                      className="p-4 cursor-pointer"
                      onClick={() => requestSort("created_at")}
                    >
                      Date {getSortIcon("created_at")}
                    </th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {currentFeedbacks.length > 0 ? (
                    currentFeedbacks.map((feedback) => (
                      <tr
                        key={feedback.id}
                        className="border-t border-yellow-800 hover:bg-yellow-800 transition"
                      >
                        <td className="p-4">{renderStars(feedback.rating)}</td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="max-w-xs truncate">
                              {feedback.comment.substring(0, 50)}
                              {feedback.comment.length > 50 ? "..." : ""}
                            </div>
                            {feedback.comment.length > 50 && (
                              <button
                                onClick={() =>
                                  openCommentModal(feedback.comment)
                                }
                                className="ml-2 text-yellow-400 hover:text-yellow-300"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                            )}
                          </div>
                        </td>
                        {/* <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {feedback.created_by?.phone_number || "N/A"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {feedback.created_by?.email || ""}
                            </span>
                          </div>
                        </td> */}
                        <td className="p-4">
                          {feedback.relocation ? (
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {feedback.relocation.district},{feedback.relocation.sector}
                                <p className="text-yellow-800">with</p>
                              </span>
                              <span className="font-medium">
                                {feedback.relocation.altitude},{feedback.relocation.soil_type}
                              </span>
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="p-4">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openModal(feedback)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              onClick={() => handleDelete(feedback.id)}
                              className="text-green-400 hover:text-green-300"
                              title="Delete"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-400">
                        No feedbacks found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-yellow-800 py-3 px-4 border-t border-yellow-700 flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 mb-2 md:mb-0">
                Showing{" "}
                <span className="font-medium text-white">
                  {filteredData.length > 0
                    ? (currentPage - 1) * feedbacksPerPage + 1
                    : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium text-white">
                  {Math.min(
                    currentPage * feedbacksPerPage,
                    filteredData.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-white">
                  {filteredData.length}
                </span>{" "}
                entries
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={feedbacksPerPage}
                  onChange={(e) => {
                    setFeedbacksPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-yellow-700 border border-yellow-600 text-yellow-300 px-3 py-1 rounded mr-2"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>

                <nav>
                  <ul className="flex space-x-1">
                    <li>
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${
                          currentPage === 1
                            ? "bg-yellow-700 text-yellow-500 cursor-not-allowed"
                            : "bg-yellow-700 text-yellow-300 hover:bg-yellow-600"
                        }`}
                      >
                        Prev
                      </button>
                    </li>

                    {[...Array(Math.min(5, totalPages)).keys()].map(
                      (_, index) => {
                        // Show 5 pages max, centered around current page
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = index + 1;
                        } else {
                          const startPage = Math.max(1, currentPage - 2);
                          pageNum = startPage + index;
                          if (pageNum > totalPages) return null;
                        }

                        return (
                          <li key={pageNum}>
                            <button
                              onClick={() => paginate(pageNum)}
                              className={`px-3 py-1 rounded ${
                                currentPage === pageNum
                                  ? "bg-yellow-600 text-white"
                                  : "bg-yellow-700 text-gray-300 hover:bg-yellow-600"
                              }`}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      }
                    )}

                    <li>
                      <button
                        onClick={() =>
                          paginate(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded ${
                          currentPage === totalPages
                            ? "bg-yellow-700 text-yellow-500 cursor-not-allowed"
                            : "bg-yellow-700 text-gray-300 hover:bg-yellow-600"
                        }`}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {renderCharts()}
      </div>

      {/* Modals */}
      {renderModal()}
      {renderCommentModal()}
    </div>
  );
}



export default Officer_Manage_Feedbacks;
