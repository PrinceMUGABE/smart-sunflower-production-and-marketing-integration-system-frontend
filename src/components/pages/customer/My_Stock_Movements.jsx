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
  faArrowLeft,
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

function Farmer_StockMovementManagement() {
  const { stockId } = useParams();
  const [movements, setMovements] = useState([]);
  const [stockDetails, setStockDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filters, setFilters] = useState({
    movement_type: "",
    sortField: "movement_date",
    sortDirection: "desc",
  });
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    movement_type: "",
    quantity: "",
    to_district: "",
    to_sector: "",
    to_cell: "",
    to_village: "",
    notes: "",
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
    fetchStockDetails();
    fetchMovements();
  }, [navigate, stockId]);

  const fetchStockDetails = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/stock/${stockId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched stock details data: ", res.data);
      setStockDetails(res.data);
    } catch (err) {
      console.error("Error fetching stock details:", err);
      setMessage("Failed to fetch stock details");
      setMessageType("error");
    }
  };

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/stock/${stockId}/movements/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMovements(Array.isArray(res.data.movements) ? res.data.movements : []);
    } catch (err) {
      console.error("Error fetching movements:", err);
      setMessage("Failed to fetch movement data");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const openMovementModal = () => {
    setFormData({
      movement_type: "",
      quantity: "",
      to_district: "",
      to_sector: "",
      to_cell: "",
      to_village: "",
      notes: "",
    });
    setIsMovementModalOpen(true);
  };

  const closeModal = () => {
    setIsMovementModalOpen(false);
  };

  const handleSubmitMovement = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://127.0.0.1:8000/stock/movements/create/`,
        { ...formData, stock_id: stockId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast("Movement recorded successfully", "success");
      await fetchMovements();
      await fetchStockDetails();
      closeModal();
    } catch (err) {
        console.log("Error: ", err);
      showToast(err.response?.data.details || "An error occurred", "error");
    }
  };

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      doc.autoTable({ html: "#movement-table" });
      doc.save(`sunflower_movements_${stockId}.pdf`);
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(filteredSortedData),
        `Stock_Movements_${stockId}`
      );
      XLSX.writeFile(workbook, `sunflower_movements_${stockId}.xlsx`);
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
      link.setAttribute("download", `sunflower_movements_${stockId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  };

  const filteredSortedData = useMemo(() => {
    return movements
      .filter((movement) => {
        const matchesSearch = [
          movement.movement_type,
          movement.quantity?.toString(),
          movement.notes,
        ].some((field) =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const matchesMovementType =
          !filters.movement_type ||
          movement.movement_type === filters.movement_type;

        return matchesSearch && matchesMovementType;
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
  }, [movements, searchQuery, filters]);

  const showToast = (message, type) => {
    setMessage(message);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const SkeletonLoader = () => (
    <div className="animate-pulse">
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

  const currentItems = filteredSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getMovementColor = (type) => {
    switch (type) {
      case "in":
        return "bg-green-900 text-green-300";
      case "out":
        return "bg-red-900 text-red-300";
      case "transfer":
        return "bg-blue-900 text-blue-300";
      default:
        return "bg-yellow-900 text-yellow-300";
    }
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case "in":
        return faBoxOpen;
      case "out":
        return faBoxOpen;
      case "transfer":
        return faExchangeAlt;
      default:
        return faExchangeAlt;
    }
  };

  if (!stockDetails) return <div>Loading stock details...</div>;

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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-yellow-400 font-bold text-2xl mb-2">
                  Stock Movement Management
                </h1>
                <p className="text-yellow-200 text-sm">
                  Tracking all movements for stock #{stockId}
                </p>
              </div>
              <Link
                to="/farmer/stock"
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back to Stocks
              </Link>
            </div>
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

          {/* Stock Summary Card */}

          <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-800 p-4 rounded-lg border-l-4 border-yellow-500">
                <h3 className="text-yellow-400 text-sm font-semibold mb-1">
                  Original Quantity
                </h3>
                <p className="text-yellow-300 text-2xl font-bold">
                  {parseFloat(stockDetails.harvest?.quantity || 0).toFixed(2)}{" "}
                  kg
                </p>
                <p className="text-yellow-500 text-xs mt-1">
                  Harvested on{" "}
                  {stockDetails.harvest?.harvest_date
                    ? new Date(
                        stockDetails.harvest.harvest_date
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="bg-yellow-800 p-4 rounded-lg border-l-4 border-yellow-500">
                <h3 className="text-yellow-400 text-sm font-semibold mb-1">
                  Current Quantity
                </h3>
                <p className="text-yellow-300 text-2xl font-bold">
                  {parseFloat(
                    stockDetails.stock?.current_quantity || 0
                  ).toFixed(2)}{" "}
                  kg
                </p>
                <p className="text-yellow-500 text-xs mt-1">
                  Last updated{" "}
                  {stockDetails.stock?.last_updated
                    ? new Date(
                        stockDetails.stock.last_updated
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="bg-yellow-800 p-4 rounded-lg border-l-4 border-yellow-500">
                <h3 className="text-yellow-400 text-sm font-semibold mb-1">
                  Location
                </h3>
                <p className="text-yellow-300">
                  {stockDetails.harvest?.district || "N/A"},{" "}
                  {stockDetails.harvest?.sector || "N/A"}
                </p>
                <p className="text-yellow-500 text-xs mt-1">
                  {stockDetails.harvest?.cell || "N/A"},{" "}
                  {stockDetails.harvest?.village || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div className="flex items-center">
                <span className="text-yellow-400 flex items-center">
                  <FontAwesomeIcon icon={faHistory} className="mr-2" />
                  <span className="font-semibold">Movement History:</span>
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
                    placeholder="Search movements..."
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
                        Movement Filters
                      </h4>

                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">
                          Movement Type
                        </label>
                        <select
                          value={filters.movement_type}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              movement_type: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-yellow-700 border border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                        >
                          <option value="">All Types</option>
                          <option value="in">Stock In</option>
                          <option value="out">Stock Out</option>
                          <option value="transfer">Transfer</option>
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
                            <option value="movement_date">Date</option>
                            <option value="movement_type">Type</option>
                            <option value="quantity">Quantity</option>
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
                              movement_type: "",
                              sortField: "movement_date",
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
                    onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
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
                  onClick={openMovementModal}
                  className="py-2 bg-green-600 px-4 rounded-lg text-white flex items-center justify-center hover:bg-green-700 transition duration-200 w-full sm:w-auto"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Record Movement
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {filters.movement_type && (
              <div className="flex flex-wrap gap-2 mb-4 bg-yellow-800 p-3 rounded-lg border border-yellow-700">
                <span className="text-yellow-400 text-sm">Active Filters:</span>
                <span className="px-2 py-1 bg-yellow-700 text-yellow-200 text-xs rounded-full flex items-center">
                  Type: {filters.movement_type}
                  <button
                    className="ml-1 text-yellow-300 hover:text-yellow-100"
                    onClick={() =>
                      setFilters({ ...filters, movement_type: "" })
                    }
                  >
                    ×
                  </button>
                </span>
                <button
                  className="px-2 py-1 text-xs text-yellow-300 hover:text-yellow-100 underline"
                  onClick={() =>
                    setFilters({
                      movement_type: "",
                      sortField: "movement_date",
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
                <table id="movement-table" className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gradient-to-r from-yellow-600 to-yellow-500 text-white">
                    <tr>
                      <th className="px-6 py-3 rounded-tl-lg">#</th>
                      <th className="px-6 py-3">
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className="mr-2"
                          />
                          Date
                        </div>
                      </th>
                      <th className="px-6 py-3">
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={faExchangeAlt}
                            className="mr-2"
                          />
                          Type
                        </div>
                      </th>
                      <th className="px-6 py-3">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faBoxes} className="mr-2" />
                          Quantity (kg)
                        </div>
                      </th>
                      {/* <th className="px-6 py-3">
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="mr-2"
                          />
                          Destination
                        </div>
                      </th> */}
                      <th className="px-6 py-3 rounded-tr-lg">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faEdit} className="mr-2" />
                          Notes
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr className="bg-yellow-900 border-b border-yellow-800 hover:bg-yellow-800 transition-colors duration-200">
                        <td
                          colSpan="6"
                          className="text-center py-8 text-yellow-400 bg-yellow-900"
                        >
                          <div className="flex flex-col items-center">
                            <FontAwesomeIcon
                              icon={faHistory}
                              className="text-4xl mb-3 text-yellow-600"
                            />
                            <p>
                              No movement records found matching your criteria
                            </p>
                            {(filters.movement_type || searchQuery) && (
                              <button
                                onClick={() => {
                                  setFilters({
                                    movement_type: "",
                                    sortField: "movement_date",
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
                      currentItems.map((movement, index) => (
                        <tr
                          key={movement.id}
                          className="bg-yellow-900 border-b border-yellow-800 hover:bg-yellow-800 transition duration-200"
                        >
                          <td className="px-6 py-4 text-yellow-200">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-6 py-4 text-yellow-200">
                            {new Date(
                              movement.movement_date
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getMovementColor(
                                movement.movement_type
                              )}`}
                            >
                              {movement.movement_type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-yellow-300">
                            {parseFloat(movement.quantity || 0).toFixed(2)} kg
                          </td>
                          {/* <td className="px-6 py-4 text-yellow-200">
                            {movement.movement_type === "transfer" ? (
                              <div>
                                <span className="font-semibold">
                                  {movement.to_district}
                                </span>
                                <span className="text-xs text-yellow-400 block">
                                  {movement.to_sector}, {movement.to_cell}
                                </span>
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </td> */}
                          <td className="px-6 py-4 text-yellow-200">
                            {movement.notes || "-"}
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
      </div>
      <AddMovementModal
        isOpen={isMovementModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitMovement}
        formData={formData}
        handleInputChange={handleInputChange}
        stockId={stockId}
      />
    </ErrorBoundary>
  );
}

export default Farmer_StockMovementManagement;
