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
  faLeaf,
  faChartPie,
  faPlus,
  faEye,
  faWater,
  faSeedling,
  faTemperatureHigh,
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

import mapData from "../customer/mapData.json";
import img from "../../../assets/pictures/sunflower2.jpg";
import { useTranslation } from "react-i18next";

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
        <div className="p-4 text-yellow-100 bg-yellow-900 rounded-lg">
          <h3 className="font-semibold">{this.props.t('error.something_went_wrong')}</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {this.props.t('buttons.refresh_page')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rwandanCrops = [
  "Maize",
  "Rice",
  "Sorghum",
  "Wheat",
  "Millet",
  "Cassava",
  "Sweet Potatoes",
  "Irish Potatoes",
  "Yams",
  "Taro",
  "Beans",
  "Soybeans",
  "Groundnuts",
  "Peas",
  "Green Grams",
  "Coffee",
  "Tea",
  "Pyrethrum",
  "Sugarcane",
  "Cotton",
  "Banana",
  "Avocado",
  "Mango",
  "Pineapple",
  "Passion Fruit",
  "Tree Tomato",
  "Tomatoes",
  "Cabbage",
  "Carrots",
  "Onions",
  "Green Peppers",
  "Eggplant",
  "Sunflower",
  "Palm Oil",
  "Macadamia",
  "Ginger",
  "Chili Peppers",
  "Vanilla",
];

function Farmer_Manage_predictions() {
  const [predictions, setPredictions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [predictionsPerPage, setPredictionsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [detailsPrediction, setDetailsPrediction] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State for form inputs
  const [allDistricts, setAllDistricts] = useState([]);
  const [allSectors, setAllSectors] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  // Filter states
  const [filterSeason, setFilterSeason] = useState("all");
  const [filterCrop, setFilterCrop] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Sort the crops alphabetically for better usability
  const sortedCrops = [...rwandanCrops].sort((a, b) => a.localeCompare(b));
  const [selectedCrop, setSelectedCrop] = useState(
    currentPrediction?.crop || ""
  );

  const RWANDA_SEASONS = [
    { value: "long_rainy", label: t('seasons.season_a') },
    { value: "short_rainy", label: t('seasons.season_b') },
    { value: "long_dry", label: t('seasons.season_c') },
    { value: "short_dry", label: t('seasons.other_season') },
  ];

  const COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD166",
    "#F9F871",
    "#6A0572",
    "#AB83A1",
  ];
  const BASE_URL = "http://127.0.0.1:8000/weather/";
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
    try {
      const res = await axios.get(`${BASE_URL}user/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched Data: ", res.data);
      setPredictions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching predictions:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmations.delete_prediction'))) return;
    try {
      await axios.delete(`${BASE_URL}delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleFetch();
      setMessage(t('messages.prediction_deleted'));
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data.message || t('messages.error_occurred'));
      setMessageType("error");
    }
  };

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      doc.autoTable({ html: "#prediction-table" });
      doc.save("crop_predictions.pdf");
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(predictions),
        t('export.crop_predictions')
      );
      XLSX.writeFile(workbook, "crop_predictions.xlsx");
    },
    CSV: () => {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        Object.keys(predictions[0]).join(",") +
        "\n" +
        predictions.map((row) => Object.values(row).join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "crop_predictions.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  };

  const openModal = (prediction = null) => {
    setIsModalOpen(true);
    setCurrentPrediction(prediction);
  };

  const openViewDetailsModal = (prediction) => {
    setDetailsPrediction(prediction);
    setViewDetailsModalOpen(true);
  };

  const handleAddUpdatePrediction = async (e) => {
    e.preventDefault();

    try {
      // Basic fields always present
      const predictionData = {
        crop: "sunflower",
        district: e.target.district.value,
        sector: e.target.sector.value,
        season: e.target.season.value,
      };

      // Add optional fields only if they exist in the form
      // For edit mode with additional fields
      if (currentPrediction) {
        if (e.target.soil_type)
          predictionData.soil_type = e.target.soil_type.value;
        if (e.target.nitrogen_kg_per_ha)
          predictionData.nitrogen_kg_per_ha =
            parseFloat(e.target.nitrogen_kg_per_ha.value) || 0;
        if (e.target.phosphorus_kg_per_ha)
          predictionData.phosphorus_kg_per_ha =
            parseFloat(e.target.phosphorus_kg_per_ha.value) || 0;
        if (e.target.potassium_kg_per_ha)
          predictionData.potassium_kg_per_ha =
            parseFloat(e.target.potassium_kg_per_ha.value) || 0;
        if (e.target.expected_yield_tons_per_ha)
          predictionData.expected_yield_tons_per_ha =
            parseFloat(e.target.expected_yield_tons_per_ha.value) || 0;
        if (e.target.water_requirement_mm)
          predictionData.water_requirement_mm =
            parseFloat(e.target.water_requirement_mm.value) || 0;
        if (e.target.optimal_ph)
          predictionData.optimal_ph =
            parseFloat(e.target.optimal_ph.value) || 6.5;
        if (e.target.row_spacing_cm)
          predictionData.row_spacing_cm =
            parseFloat(e.target.row_spacing_cm.value) || 0;
        if (e.target.plant_spacing_cm)
          predictionData.plant_spacing_cm =
            parseFloat(e.target.plant_spacing_cm.value) || 0;
        if (e.target.planting_depth_cm)
          predictionData.planting_depth_cm =
            parseFloat(e.target.planting_depth_cm.value) || 0;
        if (e.target.altitude)
          predictionData.altitude = e.target.altitude.value;
      }

      console.log("Sending prediction data:", predictionData);

      if (currentPrediction) {
        // Update existing prediction
        await axios.put(
          `${BASE_URL}update/${currentPrediction.id}/`,
          predictionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setMessage(t('messages.prediction_updated'));
      } else {
        // Create new prediction
        await axios.post(`${BASE_URL}create/`, predictionData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setMessage(t('messages.prediction_created'));
      }

      handleFetch();
      setIsModalOpen(false);
      setCurrentPrediction(null);
      setMessageType("success");
    } catch (err) {
      console.error("Error submitting form:", err);
      setMessage(err.response?.data.error || t('messages.error_occurred'));
      setMessageType("error");
    }
  };

  const renderSummaryCards = () => {
    if (!predictions.length) return null;

    // Calculate summary statistics
    const totalPredictions = predictions.length;

    // Count unique crops
    const uniqueCrops = [...new Set(predictions.map((p) => p.crop))].length;

    // Count unique districts
    const uniqueDistricts = [...new Set(predictions.map((p) => p.district))]
      .length;

    // Calculate average expected yield
    const averageYield =
      predictions.reduce(
        (sum, p) => sum + Number(p.expected_yield_tons_per_ha || 0),
        0
      ) / totalPredictions;

    // Count by season
    const seasonCounts = predictions.reduce((acc, p) => {
      acc[p.season] = (acc[p.season] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Predictions Card */}
        <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 p-6 rounded-lg shadow-lg border border-gray-700 flex items-center">
          <div className="p-3 rounded-full bg-blue-900 bg-opacity-30 mr-4">
            <FontAwesomeIcon icon={faLeaf} className="text-blue-400 text-xl" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">{t('dashboard.total_predictions')}</p>
            <h3 className="text-2xl font-bold text-white">
              {totalPredictions}
            </h3>
          </div>
        </div>

        {/* Season Distribution Card */}
        <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">{t('dashboard.season_distribution')}</p>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              {Object.entries(seasonCounts).map(([season, count], index) => (
                <div key={season} className="flex items-center mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-xs text-gray-300 ml-2">
                    {season.replace("_", " ")}: {count}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-16 w-16 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background: `conic-gradient(${Object.entries(seasonCounts)
                      .map(([season, count], index) => {
                        const startPercent =
                          (Object.entries(seasonCounts)
                            .slice(0, index)
                            .reduce((sum, [_, c]) => sum + c, 0) /
                            totalPredictions) *
                          100;

                        const endPercent =
                          startPercent + (count / totalPredictions) * 100;

                        return `${
                          COLORS[index % COLORS.length]
                        } ${startPercent}% ${endPercent}%`;
                      })
                      .join(", ")})`,
                  }}
                ></div>
                <div className="absolute inset-2 rounded-full bg-yellow-900"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Average Yield Card */}
        <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 p-6 rounded-lg shadow-lg border border-gray-700 flex items-center">
          <div className="p-3 rounded-full bg-green-900 bg-opacity-30 mr-4">
            <FontAwesomeIcon
              icon={faChartPie}
              className="text-yellow-400 text-xl"
            />
          </div>
          <div>
            <p className="text-gray-400 text-sm">{t('dashboard.avg_expected_yield')}</p>
            <h3 className="text-2xl font-bold text-white">
              {averageYield.toFixed(2)} {t('units.tons_per_ha')}
            </h3>
          </div>
        </div>
      </div>
    );
  };

  const renderAdvancedFilters = () => {
    // Get unique crops from predictions
    const uniqueCrops = [...new Set(predictions.map((p) => p.crop))];

    // Get unique districts from predictions
    const uniqueDistricts = [...new Set(predictions.map((p) => p.district))];

    // Get unique sectors from predictions
    const uniqueSectors = [...new Set(predictions.map((p) => p.sector))];

    return (
      <div className="bg-yellow-900 p-4 rounded-lg shadow-lg border border-gray-700 mb-6">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <h3 className="text-gray-200 font-medium">{t('filters.advanced_filters')}</h3>
          <button className="text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform ${
                isFilterExpanded ? "transform rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {isFilterExpanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm">{t('labels.season')}</label>
              <select
                value={filterSeason}
                onChange={(e) => setFilterSeason(e.target.value)}
                className="w-full p-2 bg-yellow-800 border border-gray-700 rounded text-gray-300 text-sm"
              >
                <option value="all">{t('filters.all_seasons')}</option>
                <option value="long_rainy">{t('seasons.long_rainy')}</option>
                <option value="short_rainy">{t('seasons.short_rainy')}</option>
                <option value="long_dry">{t('seasons.long_dry')}</option>
                <option value="short_dry">{t('seasons.short_dry')}</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm">{t('labels.crop')}</label>
              <select
                value={filterCrop}
                onChange={(e) => setFilterCrop(e.target.value)}
                className="w-full p-2 bg-yellow-800 border border-gray-700 rounded text-gray-300 text-sm"
              >
                <option value="">{t('filters.all_crops')}</option>
                {uniqueCrops.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm">
                {t('labels.district')}
              </label>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="w-full p-2 bg-yellow-800 border border-gray-700 rounded text-gray-300 text-sm"
              >
                <option value="">{t('filters.all_districts')}</option>
                {uniqueDistricts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm">{t('labels.sector')}</label>
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="w-full p-2 bg-yellow-800 border border-gray-700 rounded text-gray-300 text-sm"
              >
                <option value="">{t('filters.all_sectors')}</option>
                {uniqueSectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterSeason("all");
                  setFilterCrop("");
                  setFilterDistrict("");
                  setFilterSector("");
                }}
                className="px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-600 text-sm"
              >
                {t('buttons.reset_filters')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRecentActivity = () => {
    // Get 5 most recent predictions (sort by creation date)
    const recentPredictions = [...predictions]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    if (!recentPredictions.length) return null;

    return (
      <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-yellow-400 flex items-center">
          <FontAwesomeIcon icon={faLeaf} className="mr-2" />
          {t('dashboard.recent_predictions')}
        </h3>
        <div className="space-y-4">
          {recentPredictions.map((prediction) => {
            return (
              <div key={prediction.id} className="flex">
                <div className="mr-4 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="w-0.5 h-full bg-yellow-700"></div>
                </div>
                <div className="flex-1 bg-yellow-800 p-3 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-200">
                        {prediction.crop} {t('dashboard.prediction')}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {prediction.sector}, {prediction.district} | {t('labels.season')}:{" "}
                        {prediction.season.replace("_", " ")}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-900 text-yellow-200">
                      {new Date(prediction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-300">
                    <span className="text-yellow-400">{t('labels.expected_yield')}:</span>{" "}
                    {prediction.expected_yield_tons_per_ha} {t('units.tons_per_ha')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCharts = () => {
    if (!predictions.length) return null;

    // Prepare data for yield by crop chart
    const yieldByCrop = predictions.reduce((acc, prediction) => {
      const crop = prediction.crop;
      if (!acc[crop]) {
        acc[crop] = {
          name: crop,
          yield: prediction.expected_yield_tons_per_ha,
          count: 1,
        };
      } else {
        acc[crop].yield += prediction.expected_yield_tons_per_ha;
        acc[crop].count += 1;
      }
      return acc;
    }, {});

    // Calculate average yield by crop
    const yieldByCropData = Object.values(yieldByCrop).map((item) => ({
      name: item.name,
      yield: item.yield / item.count,
    }));

    // Prepare data for water requirements by crop
    const waterByCrop = predictions.reduce((acc, prediction) => {
      const crop = prediction.crop;
      if (!acc[crop]) {
        acc[crop] = {
          name: crop,
          water: prediction.water_requirement_mm,
          count: 1,
        };
      } else {
        acc[crop].water += prediction.water_requirement_mm;
        acc[crop].count += 1;
      }
      return acc;
    }, {});

    // Calculate average water requirement by crop
    const waterByCropData = Object.values(waterByCrop).map((item) => ({
      name: item.name,
      water: item.water / item.count,
    }));

    // Count predictions by soil type
    const soilTypeData = Object.entries(
      predictions.reduce((acc, prediction) => {
        acc[prediction.soil_type] = (acc[prediction.soil_type] || 0) + 1;
        return acc;
      }, {})
    ).map(([type, value]) => ({ name: type, value }));

    return (
      <div className="w-full lg:w-1/3 space-y-6">
        <ErrorBoundary t={t}>
          <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-yellow-400 flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-2" />
              {t('charts.soil_type_distribution')}
            </h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={soilTypeData}
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
                  {soilTypeData.map((_, index) => (
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
                
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  // Filter predictions based on search and advanced filters
  const filteredData = predictions.filter((prediction) => {
    // Text search filter
    const matchesSearch = [
      prediction.crop,
      prediction.season,
      prediction.district,
      prediction.sector,
      prediction.soil_type,
      prediction.created_by?.phone_number,
      prediction.created_by?.email,
    ].some(
      (field) =>
        field &&
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Season filter
    const matchesSeason =
      filterSeason === "all" || prediction.season === filterSeason;

    // Crop filter
    const matchesCrop = !filterCrop || prediction.crop === filterCrop;

    // District filter
    const matchesDistrict =
      !filterDistrict || prediction.district === filterDistrict;

    // Sector filter
    const matchesSector = !filterSector || prediction.sector === filterSector;

    return (
      matchesSearch &&
      matchesSeason &&
      matchesCrop &&
      matchesDistrict &&
      matchesSector
    );
  });

  const currentPredictions = filteredData.slice(
    (currentPage - 1) * predictionsPerPage,
    currentPage * predictionsPerPage
  );

  const renderDetailsModal = () => {
    if (!detailsPrediction) return null;

    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          viewDetailsModalOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={() => setViewDetailsModalOpen(false)}
        ></div>
        <div className="bg-yellow-900 rounded-lg shadow-xl p-6 z-50 w-full max-w-4xl border border-gray-800 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-yellow-500">
              {t('modals.prediction_details')}
            </h2>
            <button
              onClick={() => setViewDetailsModalOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-yellow-400 mb-3">
                  {t('sections.basic_information')}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.crop')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.crop}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.season')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.season.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.district')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.district}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.sector')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.sector}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.soil_type')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.soil_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.expected_yield')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.expected_yield_tons_per_ha} {t('units.tons_per_ha')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-blue-400 mb-3">
                  {t('sections.nutrient_requirements')}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.nitrogen')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.nitrogen_kg_per_ha} {t('units.kg_per_ha')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.phosphorus')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.phosphorus_kg_per_ha} {t('units.kg_per_ha')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.potassium')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.potassium_kg_per_ha} {t('units.kg_per_ha')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.optimal_ph')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.optimal_ph}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-yellow-500 mb-3">
                  <FontAwesomeIcon icon={faWater} className="mr-2" />
                  {t('sections.water_requirements')}
                </h3>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('labels.water_requirement')}:</span>
                  <span className="text-white font-medium">
                    {detailsPrediction.water_requirement_mm} {t('units.mm')}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-purple-400 mb-3">
                  {t('sections.planting_information')}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.row_spacing')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.row_spacing_cm} {t('units.cm')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.plant_spacing')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.plant_spacing_cm} {t('units.cm')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.planting_depth')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.planting_depth_cm} {t('units.cm')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-orange-400 mb-3">
                  {t('sections.seasonal_recommendations')}
                </h3>
                {detailsPrediction.seasonal_recommendations &&
                detailsPrediction.seasonal_recommendations.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {detailsPrediction.seasonal_recommendations.map(
                      (rec, idx) => (
                        <li key={idx}>{rec}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-400">
                    {t('messages.no_seasonal_recommendations')}
                  </p>
                )}
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-pink-400 mb-3">
                  {t('sections.intercropping_recommendations')}
                </h3>
                {detailsPrediction.intercropping_recommendation &&
                detailsPrediction.intercropping_recommendation.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {detailsPrediction.intercropping_recommendation.map(
                      (crop, idx) => (
                        <li key={idx}>{crop}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-400">
                    {t('messages.no_intercropping_recommendations')}
                  </p>
                )}
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-teal-400 mb-3">
                  {t('sections.additional_information')}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.altitude')}:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.altitude || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('labels.created_at')}:</span>
                    <span className="text-white font-medium">
                      {new Date(detailsPrediction.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the data table
  const renderDataTable = () => {
    return (
      <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 lg:mb-0">
            {t('table.crop_predictions')}
          </h3>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={t('placeholders.search_predictions')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-10 bg-yellow-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-3 text-gray-400"
              />
            </div>

            <div className="relative inline-block">
              {/* <button
                onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                className="flex items-center px-4 py-2 bg-yellow-800 border border-gray-700 rounded-lg text-gray-200 hover:bg-yellow-700 transition"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                {t('buttons.export')}
              </button> */}
              {downloadMenuVisible && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-yellow-800 ring-1 ring-gray-700 z-10">
                  <div className="py-1">
                    {Object.entries(handleDownload).map(([format, handler]) => (
                      <button
                        key={format}
                        onClick={() => {
                          handler();
                          setDownloadMenuVisible(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-yellow-700 w-full text-left"
                      >
                        {t('export.export_as')} {format}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => openModal()}
              className="flex items-center px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 transition"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              {t('buttons.add_prediction')}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 mb-4 rounded-lg ${
              messageType === "success"
                ? "bg-green-800 text-yellow-100"
                : "bg-red-800 text-red-100"
            }`}
          >
            {message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table
            id="prediction-table"
            className="w-full table-auto border-collapse"
          >
            <thead>
              <tr className="bg-yellow-800 text-gray-200">
                <th className="px-4 py-3 text-left">{t('table.headers.crop')}</th>
                <th className="px-4 py-3 text-left">{t('table.headers.season')}</th>
                <th className="px-4 py-3 text-left">{t('table.headers.district')}</th>
                <th className="px-4 py-3 text-left">{t('table.headers.sector')}</th>
                <th className="px-4 py-3 text-left">{t('table.headers.soil_type')}</th>
                <th className="px-4 py-3 text-left">{t('table.headers.altitude')}</th>
                <th className="px-4 py-3 text-left">{t('table.headers.expected_yield')}</th>
                <th className="px-4 py-3 text-center">{t('table.headers.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {currentPredictions.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-3 text-center text-gray-400 border-t border-gray-700"
                  >
                    {t('messages.no_predictions_found')}
                  </td>
                </tr>
              ) : (
                currentPredictions.map((prediction) => (
                  <tr
                    key={prediction.id}
                    className="border-t border-gray-700 hover:bg-yellow-800"
                  >
                    <td className="px-4 py-3 text-gray-300">
                      {prediction.crop}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {prediction.season.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {prediction.district}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {prediction.sector}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {prediction.soil_type}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {prediction.altitude}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {prediction.expected_yield_tons_per_ha} {t('units.tons_per_ha')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openViewDetailsModal(prediction)}
                          className="text-blue-400 hover:text-blue-300 transition"
                          title={t('tooltips.view_details')}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          onClick={() => handleDelete(prediction.id)}
                          className="text-red-400 hover:text-red-300 transition"
                          title={t('tooltips.delete')}
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

        {/* Pagination */}
        {filteredData.length > predictionsPerPage && (
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">{t('pagination.show')}</span>
              <select
                value={predictionsPerPage}
                onChange={(e) => {
                  setPredictionsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-yellow-800 border border-gray-700 rounded p-1 text-gray-300"
              >
                {[5, 10, 25, 50].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <span className="text-gray-400 ml-2">{t('pagination.per_page')}</span>
            </div>

            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-yellow-800 text-gray-600"
                    : "bg-yellow-800 text-gray-300 hover:bg-yellow-700"
                }`}
              >
                &laquo;
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-yellow-800 text-gray-600"
                    : "bg-yellow-800 text-gray-300 hover:bg-yellow-700"
                }`}
              >
                &lsaquo;
              </button>

              {/* Page Numbers */}
              {[
                ...Array(Math.ceil(filteredData.length / predictionsPerPage)),
              ].map((_, i) => {
                const pageNum = i + 1;
                // Show current page, 2 pages before and after
                if (
                  pageNum === 1 ||
                  pageNum ===
                    Math.ceil(filteredData.length / predictionsPerPage) ||
                  (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageNum
                          ? "bg-green-600 text-white"
                          : "bg-yellow-800 text-gray-300 hover:bg-yellow-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 3 ||
                  pageNum === currentPage + 3
                ) {
                  return (
                    <span key={i} className="px-3 py-1 text-gray-600">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={
                  currentPage ===
                  Math.ceil(filteredData.length / predictionsPerPage)
                }
                className={`px-3 py-1 rounded ${
                  currentPage ===
                  Math.ceil(filteredData.length / predictionsPerPage)
                    ? "bg-yellow-800 text-gray-600"
                    : "bg-yellow-800 text-gray-300 hover:bg-yellow-700"
                }`}
              >
                &rsaquo;
              </button>
              <button
                onClick={() =>
                  setCurrentPage(
                    Math.ceil(filteredData.length / predictionsPerPage)
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredData.length / predictionsPerPage)
                }
                className={`px-3 py-1 rounded ${
                  currentPage ===
                  Math.ceil(filteredData.length / predictionsPerPage)
                    ? "bg-yellow-800 text-gray-600"
                    : "bg-yellow-800 text-gray-300 hover:bg-yellow-700"
                }`}
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render crop distribution map
  const renderCropDistributionMap = () => {
    // Count crops by district
    const cropsByDistrict = {};
    predictions.forEach((prediction) => {
      if (!cropsByDistrict[prediction.district]) {
        cropsByDistrict[prediction.district] = {};
      }
      if (!cropsByDistrict[prediction.district][prediction.crop]) {
        cropsByDistrict[prediction.district][prediction.crop] = 1;
      } else {
        cropsByDistrict[prediction.district][prediction.crop]++;
      }
    });

    // Find dominant crop by district
    const dominantCropByDistrict = {};
    Object.keys(cropsByDistrict).forEach((district) => {
      let maxCount = 0;
      let dominantCrop = "";
      Object.keys(cropsByDistrict[district]).forEach((crop) => {
        if (cropsByDistrict[district][crop] > maxCount) {
          maxCount = cropsByDistrict[district][crop];
          dominantCrop = crop;
        }
      });
      dominantCropByDistrict[district] = {
        crop: dominantCrop,
        count: maxCount,
      };
    });

    // Get unique crops for legend
    const uniqueCrops = [...new Set(predictions.map((p) => p.crop))];

    return (
      <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-gray-700 w-full lg:w-2/3">
        <h3 className="text-lg font-semibold mb-4 text-yellow-400 flex items-center">
          <FontAwesomeIcon icon={faLeaf} className="mr-2" />
          {t('charts.crop_distribution_by_district')}
        </h3>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-3/4 h-96 relative">
            <div className="w-full h-full bg-yellow-800 rounded-lg border border-gray-700 p-4">
              <div className="text-center text-gray-400 italic">
                {t('placeholders.map_placeholder')}
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  {t('charts.district_highlights')}:
                </h4>
                <ul className="space-y-2">
                  {Object.entries(dominantCropByDistrict).map(
                    ([district, data]) => (
                      <li key={district} className="flex justify-between">
                        <span className="text-gray-400">{district}:</span>
                        <span className="text-yellow-400">
                          {data.crop} ({data.count} {t('dashboard.predictions').toLowerCase()})
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/4 pl-0 md:pl-4 mt-4 md:mt-0">
            <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700 h-full">
              <h4 className="text-sm font-medium text-gray-300 mb-3">{t('charts.legend')}</h4>
              <div className="space-y-2">
                {uniqueCrops.map((crop, index) => (
                  <div key={crop} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-gray-300 text-sm">{crop}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (mapData && mapData.provinces && mapData.provinces.length > 0) {
      // Get districts from ALL provinces instead of just the first one
      const allDistrictsFromMap = [];

      // Loop through all provinces to collect districts
      mapData.provinces.forEach((province) => {
        if (province.coordinates && province.coordinates.districts) {
          const districtsInProvince = province.coordinates.districts.map(
            (district) => district.name
          );
          console.log("Districts: ", districtsInProvince);
          allDistrictsFromMap.push(...districtsInProvince);
        }
      });

      // Set all unique districts (in case there are duplicates)
      setAllDistricts([...new Set(allDistrictsFromMap)]);

      // Handle edit mode - find the district in any province
      if (currentPrediction?.district) {
        setSelectedDistrict(currentPrediction.district);

        // Search for the district across all provinces
        let foundSectors = [];
        for (const province of mapData.provinces) {
          if (province.coordinates && province.coordinates.districts) {
            const districtData = province.coordinates.districts.find(
              (d) => d.name === currentPrediction.district
            );

            if (districtData && districtData.sectors) {
              foundSectors = districtData.sectors.map((sector) => sector.name);
              console.log("Found sectors: ", foundSectors);
              break; // Found the district, no need to continue searching
            }
          }
        }
        console.log("Sectors in district: ", foundSectors);

        setAllSectors(foundSectors);
        setSelectedSector(currentPrediction.sector);
      }
    }
  }, [currentPrediction, isModalOpen, mapData]);

  // District change handler also moved outside
  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setSelectedDistrict(district);

    const districtData = mapData.provinces[0].coordinates.districts.find(
      (d) => d.name === district
    );

    console.log("Selected district:", district);

    if (districtData) {
      const sectorsInDistrict = districtData.sectors.map(
        (sector) => sector.name
      );
      setAllSectors(sectorsInDistrict);
      setSelectedSector("");
      console.log("Sectors in district:", sectorsInDistrict);
    } else {
      setAllSectors([]);
    }
  };

  const renderPredictionModal = () => {
    // Define whether we're in edit mode or create mode
    const isEditMode = !!currentPrediction;

    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          isModalOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={() => setIsModalOpen(false)}
        ></div>
        <div className="bg-yellow-900 rounded-lg shadow-xl p-6 z-50 w-full max-w-4xl border border-gray-800 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-yellow-500">
              {isEditMode ? t('modals.edit_prediction') : t('modals.add_prediction')}
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleAddUpdatePrediction}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-medium text-yellow-400 mb-3">
                    {t('sections.basic_information')}
                  </h3>

                  {/* Crop Selection */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">
                      {t('labels.crop')} *
                    </label>
                    <select
                      name="crop"
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      required
                      className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">{t('placeholders.select_crop')}</option>
                      {sortedCrops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Season Selection */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">
                      {t('labels.season')} *
                    </label>
                    <select
                      name="season"
                      defaultValue={currentPrediction?.season || ""}
                      required
                      className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">{t('placeholders.select_season')}</option>
                      {RWANDA_SEASONS.map((season) => (
                        <option key={season.value} value={season.value}>
                          {season.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Selection */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">
                      {t('labels.district')} *
                    </label>
                    <select
                      name="district"
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      required
                      className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">{t('placeholders.select_district')}</option>
                      {allDistricts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sector Selection */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">
                      {t('labels.sector')} *
                    </label>
                    <select
                      name="sector"
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      required
                      disabled={!selectedDistrict}
                      className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <option value="">{t('placeholders.select_sector')}</option>
                      {allSectors.map((sector) => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Soil and Environmental Information */}
                {isEditMode && (
                  <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-blue-400 mb-3">
                      {t('sections.soil_environmental_info')}
                    </h3>

                    {/* Soil Type */}
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        {t('labels.soil_type')}
                      </label>
                      <select
                        name="soil_type"
                        defaultValue={currentPrediction?.soil_type || ""}
                        className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">{t('placeholders.select_soil_type')}</option>
                        <option value="clay">Clay</option>
                        <option value="loam">Loam</option>
                        <option value="sandy">Sandy</option>
                        <option value="silt">Silt</option>
                        <option value="peat">Peat</option>
                        <option value="chalk">Chalk</option>
                      </select>
                    </div>

                    {/* Optimal pH */}
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        {t('labels.optimal_ph')}
                      </label>
                      <input
                        type="number"
                        name="optimal_ph"
                        step="0.1"
                        min="0"
                        max="14"
                        defaultValue={currentPrediction?.optimal_ph || 6.5}
                        className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={t('placeholders.enter_ph')}
                      />
                    </div>

                    {/* Altitude */}
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        {t('labels.altitude')}
                      </label>
                      <input
                        type="text"
                        name="altitude"
                        defaultValue={currentPrediction?.altitude || ""}
                        className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={t('placeholders.enter_altitude')}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Information Section (Edit Mode Only) */}
              {isEditMode && (
                <div className="space-y-4">
                  {/* Nutrient Requirements */}
                  <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-green-400 mb-3">
                      {t('sections.nutrient_requirements')}
                    </h3>

                    {/* Nitrogen */}
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        {t('labels.nitrogen')} ({t('units.kg_per_ha')})
                      </label>
                      <input
                        type="number"
                        name="nitrogen_kg_per_ha"
                        step="0.1"
                        min="0"
                        defaultValue={currentPrediction?.nitrogen_kg_per_ha || 0}
                        className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={t('placeholders.enter_nitrogen')}
                      />
                    </div>

                    {/* Phosphorus */}
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        {t('labels.phosphorus')} ({t('units.kg_per_ha')})
                      </label>
                      <input
                        type="number"
                        name="phosphorus_kg_per_ha"
                        step="0.1"
                        min="0"
                        defaultValue={currentPrediction?.phosphorus_kg_per_ha || 0}
                        className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={t('placeholders.enter_phosphorus')}
                      />
                    </div>

                    {/* Potassium */}
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        {t('labels.potassium')} ({t('units.kg_per_ha')})
                      </label>
                      <input
                        type="number"
                        name="potassium_kg_per_ha"
                        step="0.1"
                        min="0"
                        defaultValue={currentPrediction?.potassium_kg_per_ha || 0}
                        className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={t('placeholders.enter_potassium')}
                      />
                    </div>
                  </div>

                  {/* Yield and Water Requirements */}
                  <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-purple-400 mb-3">
                      {t('sections.yield_water_requirements')}
                    </h3>

                    {/* Expected Yield */}
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        {t('labels.expected_yield')} ({t('units.tons_per_ha')})
                      </label>
                      <input
                        type="number"
                        name="expected_yield_tons_per_ha"
                        step="0.1"
                        min="0"
                        defaultValue={currentPrediction?.expected_yield_tons_per_ha || 0}
                        className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={t('placeholders.enter_expected_yield')}
                      />
                    </div>

                    {/* Water Requirement */}
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        {t('labels.water_requirement')} ({t('units.mm')})
                      </label>
                      <input
                        type="number"
                        name="water_requirement_mm"
                        step="1"
                        min="0"
                        defaultValue={currentPrediction?.water_requirement_mm || 0}
                        className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={t('placeholders.enter_water_requirement')}
                      />
                    </div>
                  </div>

                  {/* Planting Information */}
                  <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-orange-400 mb-3">
                      {t('sections.planting_information')}
                    </h3>

                    {/* Row Spacing */}
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        {t('labels.row_spacing')} ({t('units.cm')})
                      </label>
                      <input
                        type="number"
                        name="row_spacing_cm"
                        step="1"
                        min="0"
                        defaultValue={currentPrediction?.row_spacing_cm || 0}
                        className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={t('placeholders.enter_row_spacing')}
                      />
                    </div>

                    {/* Plant Spacing */}
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        {t('labels.plant_spacing')} ({t('units.cm')})
                      </label>
                      <input
                        type="number"
                        name="plant_spacing_cm"
                        step="1"
                        min="0"
                        defaultValue={currentPrediction?.plant_spacing_cm || 0}
                        className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={t('placeholders.enter_plant_spacing')}
                      />
                    </div>

                    {/* Planting Depth */}
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        {t('labels.planting_depth')} ({t('units.cm')})
                      </label>
                      <input
                        type="number"
                        name="planting_depth_cm"
                        step="0.1"
                        min="0"
                        defaultValue={currentPrediction?.planting_depth_cm || 0}
                        className="w-full p-3 bg-yellow-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={t('placeholders.enter_planting_depth')}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                {t('buttons.cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
              >
                <FontAwesomeIcon 
                  icon={isEditMode ? faEdit : faPlus} 
                  className="mr-2" 
                />
                {isEditMode ? t('buttons.update_prediction') : t('buttons.create_prediction')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-yellow-800 to-yellow-900 p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('titles.crop_prediction_management')}
            </h1>
            <p className="text-gray-300">
              {t('descriptions.manage_view_predictions')}
            </p>
          </div>
          <div className="hidden lg:block">
            <img
              src={img}
              alt="Sunflower"
              className="w-16 h-16 rounded-full object-cover border-4 border-yellow-500"
            />
          </div>
        </div>

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Advanced Filters */}
        {renderAdvancedFilters()}

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Charts Section */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Data Table */}
            {renderDataTable()}

            {/* Crop Distribution Map */}
            {/* {renderCropDistributionMap()} */}
          </div>

          {/* Sidebar - Charts and Recent Activity */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* Recent Activity */}
            {renderRecentActivity()}
          </div>
        </div>

        {/* Modals */}
        {renderPredictionModal()}
        {renderDetailsModal()}
      </div>
    </div>
  );
}

export default Farmer_Manage_predictions;