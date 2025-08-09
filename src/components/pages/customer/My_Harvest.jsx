/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-undef */
/* eslint-disable react/display-name */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faDownload,
  faSearch,
  faChartPie,
  faFilter,
  faCalendarAlt,
  faMapMarkerAlt,
  faSun,
  faSeedling,
  faSortAmountDown,
  faSortAmountUp,
  faCheckCircle,
  faExclamationCircle,
  faTimes,
  faPlus,
  faWarehouse,
  faExchangeAlt,
  faBoxOpen,
  faBoxes,
  faHistory,
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
import img from "../../../assets/pictures/sunflower2.jpg";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

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

const AddEditStockModal = React.memo(
  ({ isOpen, onClose, onSubmit, title, formData, handleInputChange }) => (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-gray-900 opacity-75"
            onClick={onClose}
          ></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-yellow-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-yellow-300">
                {title} Stock Record
              </h3>
              <button
                onClick={onClose}
                className="text-yellow-400 hover:text-yellow-300"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-yellow-200 mb-1">
                  Harvest Date
                </label>
                <input
                  type="date"
                  name="harvest_date"
                  value={formData.harvest_date || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-200 mb-1">
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity || ""}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-200 mb-1">
                  Quality Grade
                </label>
                <select
                  name="quality_grade"
                  value={formData.quality_grade || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                >
                  <option value="">Select grade</option>
                  <option value="grade_a">Grade A (Premium)</option>
                  <option value="grade_b">Grade B (Standard)</option>
                  <option value="grade_c">Grade C (Basic)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-200 mb-1">
                  Moisture Content (%)
                </label>
                <input
                  type="number"
                  name="moisture_content"
                  value={formData.moisture_content || ""}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-200 mb-1">
                  Oil Content (%)
                </label>
                <input
                  type="number"
                  name="oil_content"
                  value={formData.oil_content || ""}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-200 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-200 mb-1">
                    Sector
                  </label>
                  <input
                    type="text"
                    name="sector"
                    value={formData.sector || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-200 mb-1">
                    Cell
                  </label>
                  <input
                    type="text"
                    name="cell"
                    value={formData.cell || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-200 mb-1">
                    Village
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-yellow-700 text-yellow-200 rounded-md hover:bg-yellow-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  {title === "Add" ? "Add Stock" : "Update Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
);

const AddMovementModal = React.memo(
  ({ isOpen, onClose, onSubmit, formData, handleInputChange, stockId }) => (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-gray-900 opacity-75"
            onClick={onClose}
          ></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-yellow-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-yellow-300">
                Record Stock Movement
              </h3>
              <button
                onClick={onClose}
                className="text-yellow-400 hover:text-yellow-300"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-yellow-200 mb-1">
                  Movement Type
                </label>
                <select
                  name="movement_type"
                  value={formData.movement_type || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                >
                  <option value="">Select movement type</option>
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-200 mb-1">
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity || ""}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                />
              </div>
              {formData.movement_type === "transfer" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-200 mb-1">
                        To District
                      </label>
                      <input
                        type="text"
                        name="to_district"
                        value={formData.to_district || ""}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-yellow-200 mb-1">
                        To Sector
                      </label>
                      <input
                        type="text"
                        name="to_sector"
                        value={formData.to_sector || ""}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-200 mb-1">
                        To Cell
                      </label>
                      <input
                        type="text"
                        name="to_cell"
                        value={formData.to_cell || ""}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-yellow-200 mb-1">
                        To Village
                      </label>
                      <input
                        type="text"
                        name="to_village"
                        value={formData.to_village || ""}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                      />
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-yellow-200 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                  rows="3"
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-yellow-700 text-yellow-200 rounded-md hover:bg-yellow-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Record Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
);

function Farmer_Manage_Stocks() {
  const [stocks, setStocks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filters, setFilters] = useState({
    district: "",
    quality_grade: "",
    sortField: "harvest__harvest_date",
    sortDirection: "desc",
  });
  const navigate = useNavigate();

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
    fetchStocks();
  }, [navigate]);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/stock/my-stocks/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Retrived stocks data:", res.data);
      setStocks(Array.isArray(res.data.stocks) ? res.data.stocks : []);
    } catch (err) {
      console.error("Error fetching stocks:", err);
      setMessage("Failed to fetch stock data");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock record?"))
      return;
    try {
      await axios.delete(`http://127.0.0.1:8000/stock/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchStocks();
      setMessage("Stock record deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data.error || "An error occurred");
      setMessageType("error");
    }
  };

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      doc.autoTable({ html: "#stock-table" });
      doc.save("sunflower_stocks.pdf");
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(filteredSortedData),
        "Sunflower_Stocks"
      );
      XLSX.writeFile(workbook, "sunflower_stocks.xlsx");
    },
    CSV: () => {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        Object.keys(filteredSortedData[0]).join(",") +
        "\n" +
        filteredSortedData
          .map((row) => Object.values(row).join(","))
          .join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "sunflower_stocks.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  };

  const filteredSortedData = useMemo(() => {
    return stocks
      .filter((stock) => {
        const location = stock.location || {};
        const harvest = stock.harvest || {};

        const matchesSearch = [
          location.district,
          location.sector,
          stock.quality_grade,
          stock.current_quantity?.toString(),
        ].some((field) =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const matchesDistrict =
          !filters.district ||
          location.district
            ?.toLowerCase()
            .includes(filters.district.toLowerCase());
        const matchesQualityGrade =
          !filters.quality_grade ||
          stock.quality_grade === filters.quality_grade;

        return matchesSearch && matchesDistrict && matchesQualityGrade;
      })
      .sort((a, b) => {
        const fieldA = a[filters.sortField];
        const fieldB = b[filters.sortField];

        if (filters.sortDirection === "asc") {
          return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
        } else {
          return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
        }
      });
  }, [stocks, searchQuery, filters]);

  const summaryMetrics = useMemo(() => {
    const districtCounts = stocks.reduce((acc, stock) => {
      const district = stock.location?.district || "Unknown";
      acc[district] = (acc[district] || 0) + 1;
      return acc;
    }, {});

    const gradeCounts = stocks.reduce((acc, stock) => {
      const grade = stock.quality_grade || "Unknown";
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    const totalQuantity = stocks.reduce(
      (sum, stock) => sum + parseFloat(stock.current_quantity || 0),
      0
    );
    const originalQuantity = stocks.reduce(
      (sum, stock) => sum + parseFloat(stock.original_quantity || 0),
      0
    );

    const quantityTrendData = stocks
      .map((stock) => ({
        date: new Date(stock.last_updated).toLocaleDateString(),
        current: parseFloat(stock.current_quantity || 0),
        original: parseFloat(stock.original_quantity || 0),
        district: stock.location?.district,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const utilizationRate =
      originalQuantity > 0
        ? ((totalQuantity / originalQuantity) * 100).toFixed(2)
        : "0.00";

    return {
      total: stocks.length,
      districts: Object.keys(districtCounts).length,
      totalQuantity: totalQuantity.toFixed(2),
      originalQuantity: originalQuantity.toFixed(2),
      utilizationRate,
      grades: Object.keys(gradeCounts).length,
    };
  }, [stocks]);

  const renderCharts = () => {
    if (!stocks.length) return null;

    // Prepare data for district distribution chart
    const districtData = Object.entries(
      stocks.reduce((acc, stock) => {
        const district = stock.location?.district || "Unknown";
        acc[district] = (acc[district] || 0) + 1;
        return acc;
      }, {})
    ).map(([district, count]) => ({ name: district, value: count }));

    // Prepare data for quality grade distribution
    // const gradeData = Object.entries(
    //   stocks.reduce((acc, stock) => {
    //     const grade = stock.quality_grade || "Unknown";
    //     acc[grade] = (acc[grade] || 0) + 1;
    //     return acc;
    //   }, {})
    // ).map(([grade, count]) => ({
    //   grade,
    //   count,
    //   label: grade.replace("grade_", "Grade ").toUpperCase(),
    // }));

    // Prepare data for quantity trend over time
    const quantityTrendData = stocks
      .map((stock) => ({
        date: new Date(stock.last_updated).toLocaleDateString(),
        current: parseFloat(stock.current_quantity) || 0,
        original: parseFloat(stock.original_quantity) || 0,
        district: stock.location?.district,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
      <div className="w-full lg:w-1/3 space-y-6">
        {/* <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-yellow-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-yellow-400 flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-2" />
              District Distribution
            </h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={districtData}
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
                  {districtData.map((_, index) => (
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
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ color: "#e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary> */}

        {/* <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-yellow-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-yellow-400 flex items-center">
              <FontAwesomeIcon icon={faBoxes} className="mr-2" />
              Quality Grade Distribution
            </h3>
            <ResponsiveContainer>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="label"
                  padding={{ left: 20, right: 20 }}
                  tick={{ fontSize: 11, fill: "#CBD5E1" }}
                  stroke="#475569"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#CBD5E1" }}
                  padding={{ top: 20, bottom: 20 }}
                  stroke="#475569"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderColor: "#334155",
                    borderRadius: "0.5rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Number of Stocks"
                  fill="#FFD700"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary> */}
      </div>
    );
  };

  const currentItems = filteredSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const showToast = (message, type) => {
    setMessage(message);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({
    harvest_date: "",
    quantity: "",
    quality_grade: "",
    moisture_content: "",
    oil_content: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const openAddModal = () => {
    setFormData({
      harvest_date: "",
      quantity: "",
      quality_grade: "",
      moisture_content: "",
      oil_content: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (stock) => {
    setCurrentRecord(stock);
    setFormData({
      harvest_date: stock.harvest.harvest_date,
      quantity: stock.harvest.quantity,
      quality_grade: stock.harvest.quality_grade,
      moisture_content: stock.harvest.moisture_content,
      oil_content: stock.harvest.oil_content,
      district: stock.harvest.district,
      sector: stock.harvest.sector,
      cell: stock.harvest.cell,
      village: stock.harvest.village,
    });
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setCurrentRecord(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isAddModalOpen) {
        await axios.post("http://127.0.0.1:8000/stock/create/", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Stock record added successfully", "success");
      } else if (isEditModalOpen && currentRecord) {
        await axios.put(
          `http://127.0.0.1:8000/stock/update/${currentRecord.id}/`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast("Stock record updated successfully", "success");
      }
      await fetchStocks();
      closeModal();
    } catch (err) {
      showToast(err.response?.data.error || "An error occurred", "error");
    }
  };

  const getStatusColor = (current, original) => {
    const percentage = (current / original) * 100;
    if (percentage === 0) return "bg-red-900 text-red-300";
    if (percentage <= 20) return "bg-yellow-900 text-yellow-300";
    return "bg-green-900 text-green-300";
  };

  return (
    <ErrorBoundary>
      <div
        className="p-6 min-h-screen"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="mb-6 p-6 bg-yellow-900 rounded-lg shadow-xl border-b-4 border-yellow-500">
            <h1 className="text-center text-yellow-400 font-bold text-2xl mb-2">
              Sunflower Stock Management
            </h1>
            <p className="text-center text-yellow-200 text-sm max-w-2xl mx-auto">
              Comprehensive system for monitoring and analyzing sunflower stock
              data
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              icon={faWarehouse}
              title="Total Stocks"
              value={summaryMetrics.total}
              bgColor="bg-yellow-900"
              textColor="text-yellow-300"
            />
            <SummaryCard
              icon={faMapMarkerAlt}
              title="Districts"
              value={summaryMetrics.districts}
              bgColor="bg-yellow-900"
              textColor="text-yellow-300"
            />
            <SummaryCard
              icon={faBoxes}
              title="Current Quantity (kg)"
              value={summaryMetrics.totalQuantity}
              bgColor="bg-yellow-900"
              textColor="text-yellow-300"
            />
            <SummaryCard
              icon={faChartPie}
              title="Utilization Rate"
              value={`${summaryMetrics.utilizationRate}%`}
              bgColor="bg-yellow-900"
              textColor="text-yellow-300"
            />
          </div>

          <div className="">
            <div className="w-full">
              <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-yellow-400 flex items-center">
                      <FontAwesomeIcon icon={faWarehouse} className="mr-2" />
                      <span className="font-semibold">Filtered Records:</span>
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
                        placeholder="Search records..."
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
                              District
                            </label>
                            <input
                              type="text"
                              placeholder="Enter district"
                              value={filters.district}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  district: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 bg-yellow-700 border border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">
                              Quality Grade
                            </label>
                            <select
                              value={filters.quality_grade}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  quality_grade: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 bg-yellow-700 border border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                            >
                              <option value="">All Grades</option>
                              <option value="grade_a">Grade A</option>
                              <option value="grade_b">Grade B</option>
                              <option value="grade_c">Grade C</option>
                            </select>
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
                                <option value="harvest__harvest_date">
                                  Harvest Date
                                </option>
                                <option value="harvest__district">
                                  District
                                </option>
                                <option value="harvest__quality_grade">
                                  Quality Grade
                                </option>
                                <option value="current_quantity">
                                  Current Quantity
                                </option>
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
                                  district: "",
                                  quality_grade: "",
                                  sortField: "harvest__harvest_date",
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
                        <div className="absolute right-0 mt-2 bg-yellow-800 text-yellow-200 shadow-lg rounded-lg p-2 z-10 border border-yellow-700 w-32">
                          {Object.keys(handleDownload).map((format) => (
                            <button
                              key={format}
                              onClick={() => {
                                handleDownload[format]();
                                setDownloadMenuVisible(false);
                              }}
                              className="block w-full px-4 py-2 text-left hover:bg-yellow-700 rounded transition"
                            >
                              {format}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={openAddModal}
                      className="py-2 bg-green-600 px-4 rounded-lg text-white flex items-center justify-center hover:bg-green-700 transition duration-200 w-full sm:w-auto"
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      Add Stock
                    </button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filters.district || filters.quality_grade) && (
                  <div className="flex flex-wrap gap-2 mb-4 bg-yellow-800 p-3 rounded-lg border border-yellow-700">
                    <span className="text-yellow-400 text-sm">
                      Active Filters:
                    </span>
                    {filters.district && (
                      <span className="px-2 py-1 bg-yellow-700 text-yellow-200 text-xs rounded-full flex items-center">
                        District: {filters.district}
                        <button
                          className="ml-1 text-yellow-300 hover:text-yellow-100"
                          onClick={() =>
                            setFilters({ ...filters, district: "" })
                          }
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.quality_grade && (
                      <span className="px-2 py-1 bg-yellow-700 text-yellow-200 text-xs rounded-full flex items-center">
                        Grade:{" "}
                        {filters.quality_grade
                          .replace("grade_", "Grade ")
                          .toUpperCase()}
                        <button
                          className="ml-1 text-yellow-300 hover:text-yellow-100"
                          onClick={() =>
                            setFilters({ ...filters, quality_grade: "" })
                          }
                        >
                          ×
                        </button>
                      </span>
                    )}
                    <button
                      className="px-2 py-1 text-xs text-yellow-300 hover:text-yellow-100 underline"
                      onClick={() =>
                        setFilters({
                          district: "",
                          quality_grade: "",
                          sortField: "harvest__harvest_date",
                          sortDirection: "desc",
                        })
                      }
                    >
                      Clear All
                    </button>
                  </div>
                )}

                {loading ? (
                  <SkeletonLoader />
                ) : (
                  <div className="overflow-x-auto rounded-lg shadow-md border border-yellow-700">
                    <table
                      id="stock-table"
                      className="w-full text-sm text-left"
                    >
                      <thead className="text-xs uppercase bg-gradient-to-r from-yellow-600 to-yellow-500 text-white">
                        <tr>
                          <th className="px-6 py-3 rounded-tl-lg">#</th>
                          <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="mr-2"
                              />
                              Harvest Date
                            </div>
                          </th>
                          <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="mr-2"
                              />
                              Location
                            </div>
                          </th>
                          {/* <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faBoxes}
                                className="mr-2"
                              />
                              Quantity (kg)
                            </div>
                          </th> */}
                          <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faSeedling}
                                className="mr-2"
                              />
                              Quality
                            </div>
                          </th>
                          <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faExchangeAlt}
                                className="mr-2"
                              />
                              Status
                            </div>
                          </th>
                          <th className="px-6 py-3 rounded-tr-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length === 0 ? (
                          <tr className="bg-yellow-900 border-b border-yellow-800 hover:bg-yellow-800 transition-colors duration-200">
                            <td
                              colSpan="7"
                              className="text-center py-8 text-yellow-400 bg-yellow-900"
                            >
                              <div className="flex flex-col items-center">
                                <FontAwesomeIcon
                                  icon={faWarehouse}
                                  className="text-4xl mb-3 text-yellow-600"
                                />
                                <p>
                                  No stock records found matching your criteria
                                </p>
                                {(filters.district ||
                                  filters.quality_grade ||
                                  searchQuery) && (
                                  <button
                                    onClick={() => {
                                      setFilters({
                                        district: "",
                                        quality_grade: "",
                                        sortField: "harvest__harvest_date",
                                        sortDirection: "desc",
                                      });
                                      setSearchQuery("");
                                    }}
                                    className="mt-2 text-yellow-300 hover:underline"
                                  >
                                    Clear all filters
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ) : (
                          currentItems.map((stock, index) => (
                            <tr
                              key={stock.id}
                              className="bg-yellow-900 border-b border-yellow-800 hover:bg-yellow-800 transition duration-200"
                            >
                              <td className="px-6 py-4 text-yellow-200">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td className="px-6 py-4 text-yellow-200">
                                {new Date(
                                  stock.last_updated
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-yellow-200">
                                <div className="flex flex-col">
                                  <span className="font-semibold">
                                    {stock.location?.district || "N/A"}
                                  </span>
                                  <span className="text-xs text-yellow-400">
                                    {stock.location?.sector || "N/A"},{" "}
                                    {stock.location?.cell || "N/A"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-yellow-300">
                                    {parseFloat(
                                      stock.current_quantity || 0
                                    ).toFixed(2)}{" "}
                                    kg
                                  </span>
                                  <span className="text-xs text-yellow-400">
                                    Original:{" "}
                                    {parseFloat(
                                      stock.original_quantity || 0
                                    ).toFixed(2)}{" "}
                                    kg
                                  </span>
                                </div>
                              </td>
                              {/* <td className="px-6 py-4 text-yellow-200">
                                {stock.quality_grade
                                  ?.replace("grade_", "Grade ")
                                  .toUpperCase()}
                              </td> */}
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                    parseFloat(stock.current_quantity || 0),
                                    parseFloat(stock.original_quantity || 0)
                                  )}`}
                                >
                                  {parseFloat(stock.current_quantity || 0) === 0
                                    ? "Empty"
                                    : (parseFloat(stock.current_quantity || 0) /
                                        parseFloat(
                                          stock.original_quantity || 1
                                        )) *
                                        100 <=
                                      20
                                    ? "Low Stock"
                                    : "Available"}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex space-x-3">
                                  <Link
                                    to={`/farmer/stocks/${stock.id}/movements`}
                                    className="text-blue-400 hover:text-blue-300 transition"
                                    title="View Movements"
                                  >
                                    <FontAwesomeIcon icon={faHistory} />
                                  </Link>
                                  <button
                                    onClick={() => openEditModal(stock)}
                                    className="text-blue-400 hover:text-blue-300 transition"
                                    title="Edit"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(stock.id)}
                                    className="text-red-400 hover:text-red-300 transition"
                                    title="Delete"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-center mt-6">
                  <nav className="inline-flex rounded-md shadow-sm -space-x-px bg-yellow-900 border border-yellow-700">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-l-md border-r border-yellow-700 text-yellow-300 hover:bg-yellow-800 disabled:opacity-50"
                    >
                      First
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-2 border-r border-yellow-700 text-yellow-300 hover:bg-yellow-800 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {/* Page numbers */}
                    {Array.from(
                      {
                        length: Math.min(
                          5,
                          Math.ceil(filteredSortedData.length / itemsPerPage)
                        ),
                      },
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 border-r border-yellow-700 ${
                              currentPage === pageNum
                                ? "bg-yellow-600 text-white"
                                : "text-yellow-300 hover:bg-yellow-800"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={
                        currentPage * itemsPerPage >= filteredSortedData.length
                      }
                      className="px-3 py-2 border-r border-yellow-700 text-yellow-300 hover:bg-yellow-800 disabled:opacity-50"
                    >
                      Next
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.ceil(filteredSortedData.length / itemsPerPage)
                        )
                      }
                      disabled={
                        currentPage * itemsPerPage >= filteredSortedData.length
                      }
                      className="px-3 py-2 rounded-r-md text-yellow-300 hover:bg-yellow-800 disabled:opacity-50"
                    >
                      Last
                    </button>
                  </nav>
                </div>
              </div>
            </div>
            {/* {renderCharts()} */}
          </div>

          {/* Recent Activity Section */}
          <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800 mt-6">
            <h3 className="text-sm font-semibold mb-4 text-yellow-400 flex items-center">
              <FontAwesomeIcon icon={faHistory} className="mr-2" />
              Recent Stock Activity
            </h3>
            <div className="space-y-3">
              {stocks.slice(0, 5).map((stock, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 border-l-4 border-yellow-500 bg-yellow-800 rounded"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-yellow-700 text-yellow-300 rounded-full mr-3">
                    <FontAwesomeIcon icon={faExchangeAlt} />
                  </span>
                  <div>
                    <p className="text-yellow-200 text-sm">
                      {stock.location?.district} - {stock.location?.sector}
                    </p>
                    <p className="text-yellow-300 text-xs">
                      {parseFloat(stock.current_quantity || 0).toFixed(2)} kg
                      remaining (Original:{" "}
                      {parseFloat(stock.original_quantity || 0).toFixed(2)} kg)
                    </p>
                    <p className="text-yellow-400 text-xs">
                      Last updated on{" "}
                      {new Date(stock.last_updated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AddEditStockModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        title={isAddModalOpen ? "Add" : "Edit"}
        formData={formData}
        handleInputChange={handleInputChange}
      />
    </ErrorBoundary>
  );
}


export default Farmer_Manage_Stocks;
