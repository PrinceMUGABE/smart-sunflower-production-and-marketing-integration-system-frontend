/* eslint-disable react/display-name */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo, useCallback } from "react";
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

const RWANDA_SEASONS = [
  { value: "Season A", label: "Season A (September - January)" },
  { value: "Season B", label: "Season B (February - June)" },
  { value: "Season C", label: "Season C (July - August)" },
  { value: "Other", label: "Other Season" },
];


  const AddEditModal = React.memo(
    ({ isOpen, onClose, onSubmit, title, formData, handleInputChange }) => (
      <div
        className={`fixed inset-0 z-50 overflow-y-auto ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div
              className="absolute inset-0 bg-yellow-900 opacity-75"
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
                  {title} Harvest Record
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
                <div>
                  <label className="block text-sm font-medium text-yellow-200 mb-1">
                    Yield (kg)
                  </label>
                  <input
                    type="number"
                    name="harvest"
                    value={formData.harvest || ""}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-200 mb-1">
                    Season
                  </label>
                  <select
                    name="season"
                    value={formData.season || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                  >
                    <option value="">Select a season</option>
                    {RWANDA_SEASONS.map((season) => (
                      <option key={season.value} value={season.value}>
                        {season.label}
                      </option>
                    ))}
                  </select>
                  {formData.season === "Other" && (
                    <input
                      type="text"
                      name="customSeason"
                      value={formData.customSeason || ""}
                      onChange={handleInputChange}
                      placeholder="Enter season name"
                      required
                      className="w-full mt-2 px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                    />
                  )}
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
                    {title === "Add" ? "Add Record" : "Update Record"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  );

function Admin_Manage_SunflowerHarvests() {
  const [harvestData, setHarvestData] = useState([]);
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
    sector: "",
    season: "",
    sortField: "created_at",
    sortDirection: "desc",
  });
  const navigate = useNavigate();

  // Sunflower-themed colors
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
    fetchHarvests();
  }, [navigate]);

  const fetchHarvests = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/harvest/all/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHarvestData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching harvests:", err);
      setMessage("Failed to fetch harvest data");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this harvest record?"))
      return;
    try {
      await axios.delete(`http://127.0.0.1:8000/harvest/${id}/delete/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchHarvests();
      setMessage("Harvest record deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data.error || "An error occurred");
      setMessageType("error");
    }
  };

  // Replace the existing handleDownload object in your sunflower harvest component with this updated version
const handleDownload = {
  PDF: () => {
    const doc = new jsPDF();
    
    // Add logo/header section
    try {
                doc.addImage(Logo, 'JPEG', 14, 10, 30, 20);
              } catch (error) {
                console.log('Logo could not be added to PDF:', error);
              }
    
    // Header section
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    // doc.text("SUNFLOWER HARVEST MANAGEMENT", 14, 25);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text("Smart Sunflower Production and Marketing Integration", 14, 25);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 42);
    doc.text(`Total Records: ${filteredSortedData.length}`, 14, 49);
    
    // Add summary information
    doc.text(`Period: ${new Date().toLocaleDateString()} - Current`, 14, 56);
    doc.text(`Total Yield: ${summaryMetrics.totalYield} kg`, 14, 63);
    doc.text(`Average Yield: ${summaryMetrics.averageYield} kg`, 14, 70);
    
    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(14, 75, 196, 75);
    
    // Table title
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("HARVEST RECORDS", 14, 85);
    
    // Create table data matching the displayed table format
    const tableColumn = ["#", "District", "Sector", "Yield (kg)", "Season", "Created At"];
    const tableRows = currentItems.map((harvest, index) => [
      (currentPage - 1) * itemsPerPage + index + 1,
      harvest.district,
      harvest.sector,
      `${harvest.harvest?.toFixed(2) || "0.00"} kg`,
      harvest.season,
      new Date(harvest.created_at).toLocaleDateString()
    ]);
    
    // Add the table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 95,
      styles: { 
        fontSize: 10,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [180, 134, 11], // Yellow-brown color matching your theme
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: { 
        0: { cellWidth: 15 }, // #
        1: { cellWidth: 35 }, // District
        2: { cellWidth: 35 }, // Sector
        3: { cellWidth: 25 }, // Yield
        4: { cellWidth: 30 }, // Season
        5: { cellWidth: 35 }  // Created At
      }
    });
    
    // Footer information
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Showing: Page ${currentPage} of ${Math.ceil(filteredSortedData.length / itemsPerPage)}`, 14, finalY);
    doc.text(`Status: ${filteredSortedData.length} records found`, 14, finalY + 7);
    
    // Add filter information if any filters are active
    if (filters.district || filters.sector || filters.season) {
      doc.text("Active Filters:", 14, finalY + 20);
      let filterY = finalY + 27;
      if (filters.district) {
        doc.text(`- District: ${filters.district}`, 14, filterY);
        filterY += 7;
      }
      if (filters.sector) {
        doc.text(`- Sector: ${filters.sector}`, 14, filterY);
        filterY += 7;
      }
      if (filters.season) {
        doc.text(`- Season: ${filters.season}`, 14, filterY);
      }
    }
    
    doc.save(`sunflower_harvest_records_${new Date().toISOString().split('T')[0]}.pdf`);
  },

  Excel: () => {
    // Create workbook with professional formatting
    const workbook = XLSX.utils.book_new();
    
    // Header information
    const headerData = [
      ["SUNFLOWER HARVEST MANAGEMENT"],
      ["Ministry of Agriculture and Animal Resources"],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [`Total Records: ${filteredSortedData.length}`],
      [`Total Yield: ${summaryMetrics.totalYield} kg`],
      [`Average Yield: ${summaryMetrics.averageYield} kg`],
      [""], // Empty row
      ["HARVEST RECORDS"],
      [""] // Empty row before table
    ];
    
    // Table data matching the displayed format
    const tableData = [
      ["#", "District", "Sector", "Yield (kg)", "Season", "Created At"], // Headers
      ...currentItems.map((harvest, index) => [
        (currentPage - 1) * itemsPerPage + index + 1,
        harvest.district,
        harvest.sector,
        `${harvest.harvest?.toFixed(2) || "0.00"} kg`,
        harvest.season,
        new Date(harvest.created_at).toLocaleDateString()
      ])
    ];
    
    // Add filter information if any filters are active
    const filterData = [];
    if (filters.district || filters.sector || filters.season) {
      filterData.push([""], ["ACTIVE FILTERS:"]);
      if (filters.district) filterData.push([`District: ${filters.district}`]);
      if (filters.sector) filterData.push([`Sector: ${filters.sector}`]);
      if (filters.season) filterData.push([`Season: ${filters.season}`]);
    }
    
    // Combine all data
    const combinedData = [...headerData, ...tableData, ...filterData];
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(combinedData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },  // #
      { wch: 20 }, // District
      { wch: 20 }, // Sector
      { wch: 15 }, // Yield
      { wch: 25 }, // Season
      { wch: 18 }  // Created At
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Harvest Records");
    
    // Save file
    XLSX.writeFile(workbook, `sunflower_harvest_records_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  CSV: () => {
    // Create header section for CSV
    const headerLines = [
      "SUNFLOWER HARVEST MANAGEMENT",
      "Ministry of Agriculture and Animal Resources",
      `Generated: ${new Date().toLocaleDateString()}`,
      `Total Records: ${filteredSortedData.length}`,
      `Total Yield: ${summaryMetrics.totalYield} kg`,
      `Average Yield: ${summaryMetrics.averageYield} kg`,
      "", // Empty line
      "HARVEST RECORDS",
      "" // Empty line before data
    ];
    
    // Table headers
    const tableHeaders = "#,District,Sector,Yield (kg),Season,Created At";
    
    // Table data matching the displayed format
    const tableRows = currentItems.map((harvest, index) => 
      `${(currentPage - 1) * itemsPerPage + index + 1},"${harvest.district}","${harvest.sector}","${harvest.harvest?.toFixed(2) || "0.00"} kg","${harvest.season}","${new Date(harvest.created_at).toLocaleDateString()}"`
    ).join("\n");
    
    // Footer and filter information
    const footerLines = [
      "",
      `Showing: Page ${currentPage} of ${Math.ceil(filteredSortedData.length / itemsPerPage)}`,
      `Status: ${filteredSortedData.length} records found`
    ];
    
    // Add filter information if any filters are active
    if (filters.district || filters.sector || filters.season) {
      footerLines.push("", "ACTIVE FILTERS:");
      if (filters.district) footerLines.push(`District: ${filters.district}`);
      if (filters.sector) footerLines.push(`Sector: ${filters.sector}`);
      if (filters.season) footerLines.push(`Season: ${filters.season}`);
    }
    
    // Combine all content
    const csvContent = [
      ...headerLines,
      tableHeaders,
      tableRows,
      ...footerLines
    ].join("\n");
    
    // Create and download file
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sunflower_harvest_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

  // Filter and sort data
  const filteredSortedData = useMemo(() => {
    return harvestData
      .filter((harvest) => {
        const matchesSearch = [
          harvest.district,
          harvest.sector,
          harvest.season,
          harvest.harvest?.toString(),
        ].some((field) =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const matchesDistrict =
          !filters.district ||
          harvest.district
            .toLowerCase()
            .includes(filters.district.toLowerCase());
        const matchesSector =
          !filters.sector ||
          harvest.sector.toLowerCase().includes(filters.sector.toLowerCase());
        const matchesSeason =
          !filters.season ||
          harvest.season.toLowerCase().includes(filters.season.toLowerCase());

        return (
          matchesSearch && matchesDistrict && matchesSector && matchesSeason
        );
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
  }, [harvestData, searchQuery, filters]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const districtCounts = harvestData.reduce((acc, harvest) => {
      acc[harvest.district] = (acc[harvest.district] || 0) + 1;
      return acc;
    }, {});

    const seasonCounts = harvestData.reduce((acc, harvest) => {
      acc[harvest.season] = (acc[harvest.season] || 0) + 1;
      return acc;
    }, {});

    const totalYield = harvestData.reduce(
      (sum, harvest) => sum + (harvest.harvest || 0),
      0
    );
    const averageYield =
      harvestData.length > 0 ? totalYield / harvestData.length : 0;

    return {
      total: harvestData.length,
      districts: Object.keys(districtCounts).length,
      seasons: Object.keys(seasonCounts).length,
      totalYield: totalYield.toFixed(2),
      averageYield: averageYield.toFixed(2),
    };
  }, [harvestData]);

  const renderCharts = () => {
    if (!harvestData.length) return null;

    // Prepare data for district distribution chart
    const districtData = Object.entries(
      harvestData.reduce((acc, harvest) => {
        acc[harvest.district] = (acc[harvest.district] || 0) + 1;
        return acc;
      }, {})
    ).map(([district, count]) => ({ name: district, value: count }));

    // Prepare data for seasonal yield chart
    const seasonalYieldData = Object.entries(
      harvestData.reduce((acc, harvest) => {
        const season = harvest.season || "Unknown";
        acc[season] = (acc[season] || 0) + (harvest.harvest || 0);
        return acc;
      }, {})
    ).map(([season, yieldAmount]) => ({
      season,
      yield: parseFloat(yieldAmount.toFixed(2)),
    }));

    // Prepare data for yield trend over time
    const yieldTrendData = harvestData
      .map((harvest) => ({
        date: new Date(harvest.created_at).toLocaleDateString(),
        yield: harvest.harvest || 0,
        district: harvest.district,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
      <div className="w-full lg:w-1/3 space-y-6">
        <ErrorBoundary>
          <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800 h-72">
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
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-yellow-400 flex items-center">
              <FontAwesomeIcon icon={faSun} className="mr-2" />
              Seasonal Yield (kg)
            </h3>
            <ResponsiveContainer>
              <BarChart data={seasonalYieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="season"
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
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ color: "#CBD5E1" }}
                />
                <Bar
                  dataKey="yield"
                  fill="#FFD700"
                  name="Yield (kg)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
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
    district: "",
    sector: "",
    harvest: "",
    season: "",
    customSeason: "",
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const openAddModal = () => {
    setFormData({
      district: "",
      sector: "",
      harvest: "",
      season: "",
      customSeason: "",
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (harvest) => {
    setCurrentRecord(harvest);
    setFormData({
      district: harvest.district,
      sector: harvest.sector,
      harvest: harvest.harvest,
      season: harvest.season,
      customSeason: harvest.customSeason || "",
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
      const dataToSubmit = {
        ...formData,
        season:
          formData.season === "Other" ? formData.customSeason : formData.season,
      };

      if (isAddModalOpen) {
        await axios.post(
          "http://127.0.0.1:8000/harvest/create/",
          dataToSubmit,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showToast("Harvest record added successfully", "success");
      } else if (isEditModalOpen && currentRecord) {
        await axios.put(
          `http://127.0.0.1:8000/harvest/${currentRecord.id}/update/`,
          dataToSubmit,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast("Harvest record updated successfully", "success");
      }
      await fetchHarvests();
      closeModal();
    } catch (err) {
      showToast(err.response?.data.error || "An error occurred", "error");
    }
  };



  return (
    <ErrorBoundary>
      <div className="p-6 bg-gradient-to-b from-yellow-900 to-yellow-950 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="mb-6 p-6 bg-yellow-900 rounded-lg shadow-xl border-b-4 border-yellow-500">
            <h1 className="text-center text-yellow-400 font-bold text-2xl mb-2">
              Sunflower Harvest Management
            </h1>
            <p className="text-center text-yellow-200 text-sm max-w-2xl mx-auto">
              Comprehensive system for monitoring and analyzing sunflower
              harvest data across districts
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
              icon={faSeedling}
              title="Total Records"
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
              icon={faSun}
              title="Total Yield (kg)"
              value={summaryMetrics.totalYield}
              bgColor="bg-yellow-900"
              textColor="text-yellow-300"
            />
            <SummaryCard
              icon={faChartPie}
              title="Avg Yield (kg)"
              value={summaryMetrics.averageYield}
              bgColor="bg-yellow-900"
              textColor="text-yellow-300"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/3">
              <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-yellow-400 flex items-center">
                      <FontAwesomeIcon icon={faSeedling} className="mr-2" />
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
                              Sector
                            </label>
                            <input
                              type="text"
                              placeholder="Enter sector"
                              value={filters.sector}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  sector: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 bg-yellow-700 border border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">
                              Season
                            </label>
                            <input
                              type="text"
                              placeholder="Enter season"
                              value={filters.season}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  season: e.target.value,
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
                                <option value="created_at">Date Created</option>
                                <option value="district">District</option>
                                <option value="sector">Sector</option>
                                <option value="season">Season</option>
                                <option value="harvest">Yield</option>
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
                                  sector: "",
                                  season: "",
                                  sortField: "created_at",
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
                      Add Record
                    </button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filters.district || filters.sector || filters.season) && (
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
                    {filters.sector && (
                      <span className="px-2 py-1 bg-yellow-700 text-yellow-200 text-xs rounded-full flex items-center">
                        Sector: {filters.sector}
                        <button
                          className="ml-1 text-yellow-300 hover:text-yellow-100"
                          onClick={() => setFilters({ ...filters, sector: "" })}
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.season && (
                      <span className="px-2 py-1 bg-yellow-700 text-yellow-200 text-xs rounded-full flex items-center">
                        Season: {filters.season}
                        <button
                          className="ml-1 text-yellow-300 hover:text-yellow-100"
                          onClick={() => setFilters({ ...filters, season: "" })}
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
                          sector: "",
                          season: "",
                          sortField: "created_at",
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
                      id="harvest-table"
                      className="w-full text-sm text-left"
                    >
                      <thead className="text-xs uppercase bg-gradient-to-r from-yellow-600 to-yellow-500 text-white">
                        <tr>
                          <th className="px-6 py-3 rounded-tl-lg">#</th>
                          <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="mr-2"
                              />
                              District
                            </div>
                          </th>
                          <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="mr-2"
                              />
                              Sector
                            </div>
                          </th>
                          <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faSun} className="mr-2" />
                              Yield (kg)
                            </div>
                          </th>
                          <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="mr-2"
                              />
                              Season
                            </div>
                          </th>
                          <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="mr-2"
                              />
                              Created At
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
                                  icon={faSeedling}
                                  className="text-4xl mb-3 text-yellow-600"
                                />
                                <p>
                                  No harvest records found matching your
                                  criteria
                                </p>
                                {(filters.district ||
                                  filters.sector ||
                                  filters.season ||
                                  searchQuery) && (
                                  <button
                                    onClick={() => {
                                      setFilters({
                                        district: "",
                                        sector: "",
                                        season: "",
                                        sortField: "created_at",
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
                          currentItems.map((harvest, index) => (
                            <tr
                              key={harvest.id}
                              className="bg-yellow-900 border-b border-yellow-800 hover:bg-yellow-800 transition duration-200"
                            >
                              <td className="px-6 py-4 text-yellow-200">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td className="px-6 py-4 text-yellow-200">
                                {harvest.district}
                              </td>
                              <td className="px-6 py-4 text-yellow-200">
                                {harvest.sector}
                              </td>
                              <td className="px-6 py-4 font-bold text-yellow-300">
                                {harvest.harvest?.toFixed(2) || "0.00"} kg
                              </td>
                              <td className="px-6 py-4 text-yellow-200">
                                {harvest.season}
                              </td>
                              <td className="px-6 py-4 text-yellow-200">
                                {new Date(
                                  harvest.created_at
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => openEditModal(harvest)}
                                    className="text-blue-400 hover:text-blue-300 transition"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(harvest.id)}
                                    className="text-red-400 hover:text-red-300 transition"
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
            {renderCharts()}
          </div>

          {/* Recent Activity Section */}
          <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800 mt-6">
            <h3 className="text-sm font-semibold mb-4 text-yellow-400 flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
              Recent Harvest Activity
            </h3>
            <div className="space-y-3">
              {harvestData.slice(0, 5).map((harvest, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 border-l-4 border-yellow-500 bg-yellow-800 rounded"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-yellow-700 text-yellow-300 rounded-full mr-3">
                    <FontAwesomeIcon icon={faSun} />
                  </span>
                  <div>
                    <p className="text-yellow-200 text-sm">
                      {harvest.district} - {harvest.sector}
                    </p>
                    <p className="text-yellow-300 text-xs">
                      {harvest.harvest?.toFixed(2)} kg in {harvest.season}
                    </p>
                    <p className="text-yellow-400 text-xs">
                      Recorded on{" "}
                      {new Date(harvest.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AddEditModal
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

export default Admin_Manage_SunflowerHarvests;
