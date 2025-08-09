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
        <div className="p-4 text-yellow-100 bg-yellow-900 rounded-lg">
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

const RWANDA_SEASONS = [
  { value: "long_rainy", label: "Season A (September - January)" },
  { value: "short_rainy", label: "Season B (February - June)" },
  { value: "long_dry", label: "Season C (July - August)" },
  { value: "short_dry", label: "Other Season" },
];

function Officer_Manage_predictions() {
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

  const rwandanCrops = ["Sunflower"];
  const [isLoading, setIsLoading] = useState(false);

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
      const res = await axios.get(`${BASE_URL}predictions/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched Data: ", res.data);
      setPredictions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching predictions:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this prediction?")) return;
    try {
      await axios.delete(`${BASE_URL}delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleFetch();
      setMessage("Prediction deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data.message || "An error occurred");
      setMessageType("error");
    }
  };

  // Replace the existing handleDownload object with this modified version
const handleDownload = {
  PDF: () => {
    try {
      const doc = new jsPDF();

      try {
            doc.addImage(Logo, 'JPEG', 14, 10, 30, 20);
          } catch (error) {
            console.log('Logo could not be added to PDF:', error);
          }
      
      // Company Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Smart Sunflower Production and Marketing Integration System', 20, 25);
      
      doc.setFontSize(16);
      doc.setTextColor(60, 60, 60);
      doc.text('Crop Prediction Management Report', 20, 35);
      
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
      doc.text(`Total Records: ${filteredData.length}`, 20, 75);
      
      // Filters Applied
      let yPosition = 85;
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text('Applied Filters:', 20, yPosition);
      yPosition += 5;
      
      if (filterSeason !== 'all') {
        const seasonLabel = RWANDA_SEASONS.find(s => s.value === filterSeason)?.label || filterSeason;
        doc.text(`• Season: ${seasonLabel}`, 25, yPosition);
        yPosition += 5;
      }
      if (filterCrop) {
        doc.text(`• Crop: ${filterCrop}`, 25, yPosition);
        yPosition += 5;
      }
      if (filterDistrict) {
        doc.text(`• District: ${filterDistrict}`, 25, yPosition);
        yPosition += 5;
      }
      if (filterSector) {
        doc.text(`• Sector: ${filterSector}`, 25, yPosition);
        yPosition += 5;
      }
      if (searchQuery) {
        doc.text(`• Search: "${searchQuery}"`, 25, yPosition);
        yPosition += 5;
      }
      if (filterSeason === 'all' && !filterCrop && !filterDistrict && !filterSector && !searchQuery) {
        doc.text('• No filters applied (All records)', 25, yPosition);
        yPosition += 5;
      }
      
      // Summary Statistics
      yPosition += 10;
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('Summary Statistics:', 20, yPosition);
      yPosition += 10;
      
      // Calculate summary stats for filtered data
      const totalPredictions = filteredData.length;
      const uniqueCrops = [...new Set(filteredData.map(p => p.crop))].length;
      const uniqueDistricts = [...new Set(filteredData.map(p => p.district))].length;
      const uniqueSectors = [...new Set(filteredData.map(p => p.sector))].length;
      const averageYield = totalPredictions > 0 
        ? (filteredData.reduce((sum, p) => sum + Number(p.expected_yield_tons_per_ha || 0), 0) / totalPredictions).toFixed(2)
        : '0.00';
      const averageWaterReq = totalPredictions > 0
        ? (filteredData.reduce((sum, p) => sum + Number(p.water_requirement_mm || 0), 0) / totalPredictions).toFixed(2)
        : '0.00';
      
      const summaryData = [
        ['Total Predictions', totalPredictions.toString()],
        ['Unique Crops', uniqueCrops.toString()],
        ['Unique Districts', uniqueDistricts.toString()],
        ['Unique Sectors', uniqueSectors.toString()],
        ['Average Expected Yield', `${averageYield} tons/ha`],
        ['Average Water Requirement', `${averageWaterReq} mm`]
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
          0: { cellWidth: 80 },
          1: { cellWidth: 60 }
        }
      });
      
      // Predictions Data Table
      const finalY = doc.lastAutoTable.finalY || yPosition + 40;
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('Prediction Details:', 20, finalY + 15);
      
      // Prepare table data
      const tableData = filteredData.map((prediction, index) => {
        const seasonLabel = RWANDA_SEASONS.find(s => s.value === prediction.season)?.label || 
                           prediction.season.replace('_', ' ');
        
        return [
          (index + 1).toString(),
          prediction.crop || 'N/A',
          seasonLabel,
          prediction.district || 'N/A',
          prediction.sector || 'N/A',
          prediction.soil_type || 'N/A',
          `${Number(prediction.expected_yield_tons_per_ha || 0).toFixed(2)}`,
          `${Number(prediction.water_requirement_mm || 0).toFixed(0)}`,
          `${Number(prediction.nitrogen_kg_per_ha || 0).toFixed(1)}`,
          `${Number(prediction.phosphorus_kg_per_ha || 0).toFixed(1)}`,
          `${Number(prediction.potassium_kg_per_ha || 0).toFixed(1)}`,
          new Date(prediction.created_at).toLocaleDateString()
        ];
      });
      
      doc.autoTable({
        startY: finalY + 25,
        head: [['#', 'Crop', 'Season', 'District', 'Sector', 'Soil Type', 'Yield (t/ha)', 'Water (mm)', 'N (kg/ha)', 'P (kg/ha)', 'K (kg/ha)', 'Created']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [234, 179, 8], 
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 7,
          textColor: [40, 40, 40]
        },
        alternateRowStyles: { fillColor: [252, 248, 227] },
        margin: { left: 10, right: 10 },
        columnStyles: {
          0: { cellWidth: 12 },  // #
          1: { cellWidth: 16 },  // Crop
          2: { cellWidth: 20 },  // Season
          3: { cellWidth: 18 },  // District
          4: { cellWidth: 16 },  // Sector
          5: { cellWidth: 16 },  // Soil Type
          6: { cellWidth: 16 },  // Yield
          7: { cellWidth: 14 },  // Water
          8: { cellWidth: 12 },  // N
          9: { cellWidth: 12 },  // P
          10: { cellWidth: 12 }, // K
          11: { cellWidth: 16 }  // Created
        },
        styles: {
          cellPadding: 1.5,
          fontSize: 7,
          overflow: 'linebreak'
        }
      });
      
      // Season Distribution Analysis (if there's space)
      const lastTableY = doc.lastAutoTable.finalY || finalY + 200;
      if (lastTableY < 220) { // If there's space on the page
        const seasonDistribution = filteredData.reduce((acc, prediction) => {
          const seasonLabel = RWANDA_SEASONS.find(s => s.value === prediction.season)?.label || 
                             prediction.season.replace('_', ' ');
          acc[seasonLabel] = (acc[seasonLabel] || 0) + 1;
          return acc;
        }, {});
        
        if (Object.keys(seasonDistribution).length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(40, 40, 40);
          doc.text('Season Distribution:', 20, lastTableY + 15);
          
          const seasonData = Object.entries(seasonDistribution).map(([season, count]) => [
            season,
            count.toString(),
            `${((count / filteredData.length) * 100).toFixed(1)}%`
          ]);
          
          doc.autoTable({
            startY: lastTableY + 25,
            head: [['Season', 'Count', 'Percentage']],
            body: seasonData,
            theme: 'grid',
            headStyles: { fillColor: [234, 179, 8], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [252, 248, 227] },
            margin: { left: 20, right: 20 },
            tableWidth: 'auto',
            columnStyles: {
              0: { cellWidth: 60 },
              1: { cellWidth: 30 },
              2: { cellWidth: 30 }
            }
          });
        }
      }
      
      // Crop Distribution Analysis (on new page if needed)
      if (doc.lastAutoTable.finalY > 240 || lastTableY >= 220) {
        doc.addPage();
        yPosition = 20;
      } else {
        yPosition = doc.lastAutoTable.finalY + 20;
      }
      
      const cropDistribution = filteredData.reduce((acc, prediction) => {
        const crop = prediction.crop || 'Unknown';
        if (!acc[crop]) {
          acc[crop] = {
            count: 0,
            totalYield: 0,
            totalWater: 0
          };
        }
        acc[crop].count += 1;
        acc[crop].totalYield += Number(prediction.expected_yield_tons_per_ha || 0);
        acc[crop].totalWater += Number(prediction.water_requirement_mm || 0);
        return acc;
      }, {});
      
      if (Object.keys(cropDistribution).length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text('Crop Analysis Summary:', 20, yPosition);
        
        const cropData = Object.entries(cropDistribution).map(([crop, data]) => [
          crop,
          data.count.toString(),
          `${(data.totalYield / data.count).toFixed(2)}`,
          `${(data.totalWater / data.count).toFixed(0)}`
        ]);
        
        doc.autoTable({
          startY: yPosition + 10,
          head: [['Crop', 'Count', 'Avg Yield (t/ha)', 'Avg Water (mm)']],
          body: cropData,
          theme: 'grid',
          headStyles: { fillColor: [234, 179, 8], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [252, 248, 227] },
          margin: { left: 20, right: 20 },
          tableWidth: 'auto',
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 30 },
            2: { cellWidth: 40 },
            3: { cellWidth: 40 }
          }
        });
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, 20, pageHeight - 10);
        doc.text(`© ${new Date().getFullYear()} Smart Sunflower Production and Marketing Integration System`, doc.internal.pageSize.width - 80, pageHeight - 10);
      }
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `Crop_Predictions_Report_${timestamp}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      setMessage(`PDF report "${filename}" downloaded successfully!`);
      setMessageType("success");
      setDownloadMenuVisible(false);
      
      // Clear message after 5 seconds
      setTimeout(() => setMessage(""), 5000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage("Failed to generate PDF report. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 5000);
    }
  },
  Excel: () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Prepare data for Excel export
      const excelData = filteredData.map((prediction, index) => {
        const seasonLabel = RWANDA_SEASONS.find(s => s.value === prediction.season)?.label || 
                           prediction.season.replace('_', ' ');
        
        return {
          'Serial No.': index + 1,
          'Crop': prediction.crop || 'N/A',
          'Season': seasonLabel,
          'District': prediction.district || 'N/A',
          'Sector': prediction.sector || 'N/A',
          'Soil Type': prediction.soil_type || 'N/A',
          'Expected Yield (tons/ha)': Number(prediction.expected_yield_tons_per_ha || 0).toFixed(2),
          'Water Requirement (mm)': Number(prediction.water_requirement_mm || 0).toFixed(0),
          'Nitrogen (kg/ha)': Number(prediction.nitrogen_kg_per_ha || 0).toFixed(1),
          'Phosphorus (kg/ha)': Number(prediction.phosphorus_kg_per_ha || 0).toFixed(1),
          'Potassium (kg/ha)': Number(prediction.potassium_kg_per_ha || 0).toFixed(1),
          'Optimal pH': Number(prediction.optimal_ph || 0).toFixed(1),
          'Row Spacing (cm)': Number(prediction.row_spacing_cm || 0).toFixed(1),
          'Plant Spacing (cm)': Number(prediction.plant_spacing_cm || 0).toFixed(1),
          'Planting Depth (cm)': Number(prediction.planting_depth_cm || 0).toFixed(1),
          'Altitude': prediction.altitude || 'N/A',
          'Created By': prediction.created_by?.email || 'N/A',
          'Created At': new Date(prediction.created_at).toLocaleString(),
          'Updated At': new Date(prediction.updated_at).toLocaleString()
        };
      });
      
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(excelData), "Predictions_Data");
      
      // Add summary sheet
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Predictions', filteredData.length],
        ['Unique Crops', [...new Set(filteredData.map(p => p.crop))].length],
        ['Unique Districts', [...new Set(filteredData.map(p => p.district))].length],
        ['Unique Sectors', [...new Set(filteredData.map(p => p.sector))].length],
        ['Average Expected Yield (tons/ha)', filteredData.length > 0 ? 
          (filteredData.reduce((sum, p) => sum + Number(p.expected_yield_tons_per_ha || 0), 0) / filteredData.length).toFixed(2) : '0.00'],
        ['Average Water Requirement (mm)', filteredData.length > 0 ?
          (filteredData.reduce((sum, p) => sum + Number(p.water_requirement_mm || 0), 0) / filteredData.length).toFixed(2) : '0.00']
      ];
      
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryData), "Summary");
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      XLSX.writeFile(workbook, `Crop_Predictions_Report_${timestamp}.xlsx`);
      
      setMessage("Excel report downloaded successfully!");
      setMessageType("success");
      setDownloadMenuVisible(false);
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error('Error generating Excel:', error);
      setMessage("Failed to generate Excel report. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 5000);
    }
  },
  CSV: () => {
    try {
      const csvData = filteredData.map((prediction, index) => {
        const seasonLabel = RWANDA_SEASONS.find(s => s.value === prediction.season)?.label || 
                           prediction.season.replace('_', ' ');
        
        return {
          'Serial_No': index + 1,
          'Crop': prediction.crop || 'N/A',
          'Season': seasonLabel,
          'District': prediction.district || 'N/A',
          'Sector': prediction.sector || 'N/A',
          'Soil_Type': prediction.soil_type || 'N/A',
          'Expected_Yield_tons_per_ha': Number(prediction.expected_yield_tons_per_ha || 0).toFixed(2),
          'Water_Requirement_mm': Number(prediction.water_requirement_mm || 0).toFixed(0),
          'Nitrogen_kg_per_ha': Number(prediction.nitrogen_kg_per_ha || 0).toFixed(1),
          'Phosphorus_kg_per_ha': Number(prediction.phosphorus_kg_per_ha || 0).toFixed(1),
          'Potassium_kg_per_ha': Number(prediction.potassium_kg_per_ha || 0).toFixed(1),
          'Optimal_pH': Number(prediction.optimal_ph || 0).toFixed(1),
          'Altitude': prediction.altitude || 'N/A',
          'Created_At': new Date(prediction.created_at).toLocaleDateString()
        };
      });
      
      const headers = Object.keys(csvData[0]).join(",");
      const csvContent = "data:text/csv;charset=utf-8," + 
        headers + "\n" +
        csvData.map(row => Object.values(row).join(",")).join("\n");
      
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.setAttribute("download", `Crop_Predictions_Report_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setMessage("CSV report downloaded successfully!");
      setMessageType("success");
      setDownloadMenuVisible(false);
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error('Error generating CSV:', error);
      setMessage("Failed to generate CSV report. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 5000);
    }
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
    setIsLoading(true);

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
        setMessage("Prediction updated successfully");
      } else {
        // Create new prediction
        await axios.post(`${BASE_URL}create/`, predictionData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setMessage("Prediction created successfully");
      }

      handleFetch();
      setIsModalOpen(false);
      setCurrentPrediction(null);
      setMessageType("success");
    } catch (err) {
      console.error("Error submitting form:", err);
      setMessage(err.response?.data.error || "An error occurred");
      setMessageType("error");
    } finally {
      setIsLoading(false); // End loading regardless of success/error
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
        <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-700 flex items-center">
          <div className="p-3 rounded-full bg-yellow-800 bg-opacity-30 mr-4">
            <FontAwesomeIcon
              icon={faLeaf}
              className="text-yellow-400 text-xl"
            />
          </div>
          <div>
            <p className="text-yellow-300 text-sm">Total Predictions</p>
            <h3 className="text-2xl font-bold text-white">
              {totalPredictions}
            </h3>
          </div>
        </div>

        {/* Unique Crops Card */}
        <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-700 flex items-center">
          <div className="p-3 rounded-full bg-yellow-800 bg-opacity-30 mr-4">
            <FontAwesomeIcon
              icon={faSeedling}
              className="text-yellow-400 text-xl"
            />
          </div>
          <div>
            <p className="text-yellow-300 text-sm">Unique Crops</p>
            <h3 className="text-2xl font-bold text-white">{uniqueCrops}</h3>
          </div>
        </div>

        {/* Season Distribution Card */}
        <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-700">
          <p className="text-yellow-300 text-sm mb-2">Season Distribution</p>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              {Object.entries(seasonCounts).map(([season, count], index) => (
                <div key={season} className="flex items-center mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-xs text-yellow-200 ml-2">
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
        <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-700 flex items-center">
          <div className="p-3 rounded-full bg-yellow-800 bg-opacity-30 mr-4">
            <FontAwesomeIcon
              icon={faChartPie}
              className="text-yellow-400 text-xl"
            />
          </div>
          <div>
            <p className="text-yellow-300 text-sm">Avg. Expected Yield</p>
            <h3 className="text-2xl font-bold text-white">
              {averageYield.toFixed(2)} t/ha
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
      <div className="bg-yellow-900 p-4 rounded-lg shadow-lg border border-yellow-700 mb-6">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <h3 className="text-yellow-200 font-medium">Advanced Filters</h3>
          <button className="text-yellow-400">
            {/* ... existing icon ... */}
          </button>
        </div>

        {isFilterExpanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-yellow-300 mb-2 text-sm">
                Season
              </label>
              <select
                value={filterSeason}
                onChange={(e) => setFilterSeason(e.target.value)}
                className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-200 text-sm"
              >
                {/* ... existing options ... */}
              </select>
            </div>

            {/* ... other filter controls with similar color updates ... */}

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
                Reset Filters
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
      <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-700 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-yellow-400 flex items-center">
          <FontAwesomeIcon icon={faLeaf} className="mr-2" />
          Recent Predictions
        </h3>
        <div className="space-y-4">
          {recentPredictions.map((prediction) => {
            return (
              <div key={prediction.id} className="flex">
                <div className="mr-4 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-0.5 h-full bg-yellow-700"></div>
                </div>
                <div className="flex-1 bg-yellow-800 p-3 rounded-lg border border-yellow-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-yellow-200">
                        {prediction.crop} Prediction
                      </h4>
                      <p className="text-sm text-yellow-300">
                        {prediction.sector}, {prediction.district} | Season:{" "}
                        {prediction.season.replace("_", " ")}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-700 text-yellow-200">
                      {new Date(prediction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-yellow-200">
                    <span className="text-yellow-400">Expected yield:</span>{" "}
                    {prediction.expected_yield_tons_per_ha} tons/ha
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
        <ErrorBoundary>
          <div className="bg-yellow-800 p-6 rounded-lg shadow-lg border border-gray-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-green-400 flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-2" />
              Soil Type Distribution
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
          <div className="bg-yellow-800 p-6 rounded-lg shadow-lg border border-gray-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-green-400 flex items-center">
              <FontAwesomeIcon icon={faSeedling} className="mr-2" />
              Expected Yield by Crop
            </h3>
            <ResponsiveContainer>
              <BarChart data={yieldByCropData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                  label={{
                    value: "tons/ha",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#e5e7eb",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                />
                <Bar dataKey="yield" fill="#4ECDC4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-yellow-800 p-6 rounded-lg shadow-lg border border-gray-800 h-72 mt-6">
            <h3 className="text-sm font-semibold mb-4 text-green-400 flex items-center">
              <FontAwesomeIcon icon={faWater} className="mr-2" />
              Water Requirements by Crop
            </h3>
            <ResponsiveContainer>
              <BarChart data={waterByCropData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                  label={{
                    value: "mm",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#e5e7eb",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                />
                <Bar dataKey="water" fill="#FF6B6B" />
              </BarChart>
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
          className="fixed inset-0 bg-yellow-800 opacity-50"
          onClick={() => setViewDetailsModalOpen(false)}
        ></div>
        <div className="bg-yellow-800 rounded-lg shadow-xl p-6 z-50 w-full max-w-4xl border border-gray-800 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-green-500">
              Prediction Details
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
                <h3 className="text-lg font-medium text-green-400 mb-3">
                  Basic Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-gray-300 mb-2">Crop</label>
                    <div className="w-full p-2 bg-yellow-800 border border-gray-600 rounded text-gray-200">
                      Sunflower
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Season:</span>
                    <span className="text-white font-medium">
                      {RWANDA_SEASONS.find(
                        (s) => s.value === detailsPrediction.season
                      )?.label || detailsPrediction.season.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">District:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.district}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sector:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.sector}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Soil Type:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.soil_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expected Yield:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.expected_yield_tons_per_ha} tons/ha
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-blue-400 mb-3">
                  Nutrient Requirements
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nitrogen:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.nitrogen_kg_per_ha} kg/ha
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phosphorus:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.phosphorus_kg_per_ha} kg/ha
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Potassium:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.potassium_kg_per_ha} kg/ha
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Optimal pH:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.optimal_ph}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-yellow-500 mb-3">
                  <FontAwesomeIcon icon={faWater} className="mr-2" />
                  Water Requirements
                </h3>
                <div className="flex justify-between">
                  <span className="text-gray-400">Water Requirement:</span>
                  <span className="text-white font-medium">
                    {detailsPrediction.water_requirement_mm} mm
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-purple-400 mb-3">
                  Planting Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Row Spacing:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.row_spacing_cm} cm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plant Spacing:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.plant_spacing_cm} cm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Planting Depth:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.planting_depth_cm} cm
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-orange-400 mb-3">
                  Seasonal Recommendations
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
                    No seasonal recommendations available
                  </p>
                )}
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-pink-400 mb-3">
                  Intercropping Recommendations
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
                    No intercropping recommendations available
                  </p>
                )}
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-teal-400 mb-3">
                  Additional Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Altitude:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.altitude || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created By:</span>
                    <span className="text-white font-medium">
                      {detailsPrediction.created_by?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created At:</span>
                    <span className="text-white font-medium">
                      {new Date(detailsPrediction.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Updated At:</span>
                    <span className="text-white font-medium">
                      {new Date(detailsPrediction.updated_at).toLocaleString()}
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
      <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-700">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-green-400 mb-4 lg:mb-0">
            Crop Predictions
          </h3>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search predictions..."
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
              <button
                onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                className="flex items-center px-4 py-2 bg-yellow-800 border border-gray-700 rounded-lg text-gray-200 hover:bg-yellow-800 transition"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Export
              </button>
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
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-yellow-800 w-full text-left"
                      >
                        Export as {format}
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
              Add Prediction
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 mb-4 rounded-lg ${
              messageType === "success"
                ? "bg-green-800 text-green-100"
                : "bg-red-800 text-red-100"
            }`}
          >
            {message}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg shadow-md border border-yellow-700">
          <table id="prediction-table" className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gradient-to-r from-yellow-600 to-yellow-500 text-white">
              <tr className="bg-yellow-800 text-gray-200">
                <th className="px-4 py-3 text-left">Crop</th>
                <th className="px-4 py-3 text-left">Season</th>
                <th className="px-4 py-3 text-left">District</th>
                <th className="px-4 py-3 text-left">Sector</th>
                <th className="px-4 py-3 text-left">Soil Type</th>
                <th className="px-4 py-3 text-left">Altitude</th>
                <th className="px-4 py-3 text-left">Expected Yield</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPredictions.length === 0 ? (
                <tr className="bg-yellow-900 border-b border-yellow-800 hover:bg-yellow-800 transition-colors duration-200">
                  <td colSpan="7" className="text-center py-8 text-yellow-400">
                    No predictions found
                  </td>
                </tr>
              ) : (
                currentPredictions.map((prediction) => (
                  <tr
                    key={prediction.id}
                    className="bg-yellow-900 border-b border-yellow-800 hover:bg-yellow-800 transition duration-200"
                  >
                    <td className="px-6 py-4 text-yellow-200">
                      {prediction.crop}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {RWANDA_SEASONS.find((s) => s.value === prediction.season)
                        ?.label || prediction.season.replace("_", " ")}
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
                      {prediction.expected_yield_tons_per_ha} t/ha
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openViewDetailsModal(prediction)}
                          className="text-blue-400 hover:text-blue-300 transition"
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          onClick={() => openModal(prediction)}
                          className="text-yellow-400 hover:text-yellow-300 transition"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDelete(prediction.id)}
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

        {/* Pagination */}
        {filteredData.length > predictionsPerPage && (
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Show</span>
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
              <span className="text-gray-400 ml-2">per page</span>
            </div>

            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-yellow-800 text-gray-600"
                    : "bg-yellow-800 text-gray-300 hover:bg-yellow-800"
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
                    : "bg-yellow-800 text-gray-300 hover:bg-yellow-800"
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
                          : "bg-yellow-800 text-gray-300 hover:bg-yellow-800"
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
                    : "bg-yellow-800 text-gray-300 hover:bg-yellow-800"
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
                    : "bg-yellow-800 text-gray-300 hover:bg-yellow-800"
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
      <div className="bg-yellow-800 p-6 rounded-lg shadow-lg border border-gray-700 w-full lg:w-2/3">
        <h3 className="text-lg font-semibold mb-4 text-green-400 flex items-center">
          <FontAwesomeIcon icon={faLeaf} className="mr-2" />
          Crop Distribution by District
        </h3>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-3/4 h-96 relative">
            {/* This is a placeholder for the map. In a real implementation, you would
                 use a mapping library like Leaflet or Google Maps to render a real map */}
            <div className="w-full h-full bg-yellow-800 rounded-lg border border-gray-700 p-4">
              <div className="text-center text-gray-400 italic">
                Map placeholder - Rwanda districts would be displayed here with
                color coding for dominant crops in each district
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  District Highlights:
                </h4>
                <ul className="space-y-2">
                  {Object.entries(dominantCropByDistrict).map(
                    ([district, data]) => (
                      <li key={district} className="flex justify-between">
                        <span className="text-gray-400">{district}:</span>
                        <span className="text-green-400">
                          {data.crop} ({data.count} predictions)
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
              <h4 className="text-sm font-medium text-gray-300 mb-3">Legend</h4>
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
          className="fixed inset-0 from-yellow-900 to-yellow-950 opacity-50"
          onClick={() => setIsModalOpen(false)}
        ></div>
        <div className="bg-yellow-900 rounded-lg shadow-xl p-6 z-50 w-full max-w-4xl border border-white max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-yellow-500">
              {isEditMode ? "Update Prediction" : "Add New Prediction"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Required fields section */}
              <div className="col-span-2 bg-yellow-800 p-4 rounded-lg border border-white mb-4">
                <h3 className="text-lg font-medium text-yellow-400 mb-4">
                  {isEditMode ? "Basic Information" : "Required Information"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="season"
                      className="block text-gray-300 mb-2"
                    >
                      Season <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="season"
                      name="season"
                      defaultValue={currentPrediction?.season || "long_rainy"}
                      className="w-full p-2 bg-yellow-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {RWANDA_SEASONS.map((season) => (
                        <option key={season.value} value={season.value}>
                          {season.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="district"
                      className="block text-gray-300 mb-2"
                    >
                      District <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="district"
                      name="district"
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      required
                      className="w-full p-2 bg-yellow-700 border border-white rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select District</option>
                      {allDistricts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="sector"
                      className="block text-gray-300 mb-2"
                    >
                      Sector <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="sector"
                      name="sector"
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      required
                      disabled={!selectedDistrict}
                      className="w-full p-2 bg-yellow-700 border border-whiterounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Sector</option>
                      {allSectors.map((sector) => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Only show additional fields when editing */}
              {isEditMode && (
                <>
                  {/* Season and soil section */}
                  <div className="col-span-2 bg-yellow-800 p-4 rounded-lg border border-white mb-4">
                    <h3 className="text-lg font-medium text-blue-400 mb-4">
                      Soil Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <div>
                        <label
                          htmlFor="soil_type"
                          className="block text-gray-300 mb-2"
                        >
                          Soil Type
                        </label>
                        <input
                          type="text"
                          id="soil_type"
                          name="soil_type"
                          defaultValue={currentPrediction?.soil_type || ""}
                          className="w-full p-2 bg-yellow-700 border border-white rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="e.g. ferralsol"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nutrient requirements section */}
                  <div className="col-span-2 bg-yellow-800 p-4 rounded-lg border border-whiite mb-4">
                    <h3 className="text-lg font-medium text-purple-400 mb-4">
                      Nutrient Requirements
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label
                          htmlFor="nitrogen_kg_per_ha"
                          className="block text-gray-300 mb-2"
                        >
                          Nitrogen (kg/ha)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          id="nitrogen_kg_per_ha"
                          name="nitrogen_kg_per_ha"
                          defaultValue={
                            currentPrediction?.nitrogen_kg_per_ha || "0"
                          }
                          className="w-full p-2 bg-yellow-700 border border-white rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phosphorus_kg_per_ha"
                          className="block text-gray-300 mb-2"
                        >
                          Phosphorus (kg/ha)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          id="phosphorus_kg_per_ha"
                          name="phosphorus_kg_per_ha"
                          defaultValue={
                            currentPrediction?.phosphorus_kg_per_ha || "0"
                          }
                          className="w-full p-2 bg-yellow-700 border border-white rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="potassium_kg_per_ha"
                          className="block text-gray-300 mb-2"
                        >
                          Potassium (kg/ha)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          id="potassium_kg_per_ha"
                          name="potassium_kg_per_ha"
                          defaultValue={
                            currentPrediction?.potassium_kg_per_ha || "0"
                          }
                          className="w-full p-2 bg-yellow-700 border border-whiterounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="optimal_ph"
                          className="block text-gray-300 mb-2"
                        >
                          Optimal pH
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="14"
                          id="optimal_ph"
                          name="optimal_ph"
                          defaultValue={currentPrediction?.optimal_ph || "6.5"}
                          className="w-full p-2 bg-yellow-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Planting details section */}
                  <div className="col-span-2 bg-yellow-800 p-4 rounded-lg border border-gray-700 mb-4">
                    <h3 className="text-lg font-medium text-yellow-400 mb-4">
                      Planting Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label
                          htmlFor="row_spacing_cm"
                          className="block text-gray-300 mb-2"
                        >
                          Row Spacing (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          id="row_spacing_cm"
                          name="row_spacing_cm"
                          defaultValue={
                            currentPrediction?.row_spacing_cm || "0"
                          }
                          className="w-full p-2 bg-yellow-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="plant_spacing_cm"
                          className="block text-gray-300 mb-2"
                        >
                          Plant Spacing (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          id="plant_spacing_cm"
                          name="plant_spacing_cm"
                          defaultValue={
                            currentPrediction?.plant_spacing_cm || "0"
                          }
                          className="w-full p-2 bg-yellow-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="planting_depth_cm"
                          className="block text-gray-300 mb-2"
                        >
                          Planting Depth (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          id="planting_depth_cm"
                          name="planting_depth_cm"
                          defaultValue={
                            currentPrediction?.planting_depth_cm || "0"
                          }
                          className="w-full p-2 bg-yellow-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="expected_yield_tons_per_ha"
                          className="block text-gray-300 mb-2"
                        >
                          Expected Yield (t/ha)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          id="expected_yield_tons_per_ha"
                          name="expected_yield_tons_per_ha"
                          defaultValue={
                            currentPrediction?.expected_yield_tons_per_ha || "0"
                          }
                          className="w-full p-2 bg-yellow-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Water requirements section */}
                  <div className="col-span-2 bg-yellow-800 p-4 rounded-lg border border-gray-700 mb-4">
                    <h3 className="text-lg font-medium text-teal-400 mb-4">
                      Water Requirements
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="water_requirement_mm"
                          className="block text-gray-300 mb-2"
                        >
                          Water Requirement (mm)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          id="water_requirement_mm"
                          name="water_requirement_mm"
                          defaultValue={
                            currentPrediction?.water_requirement_mm || "0"
                          }
                          className="w-full p-2 bg-yellow-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="altitude"
                          className="block text-gray-300 mb-2"
                        >
                          Altitude
                        </label>
                        <input
                          type="text"
                          id="altitude"
                          name="altitude"
                          defaultValue={currentPrediction?.altitude || "N/A"}
                          className="w-full p-2 bg-yellow-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Button section */}
              <div className="col-span-2 flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-yellow-800 hover:bg-yellow-600 text-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={isEditMode ? faEdit : faPlus}
                        className="mr-2"
                      />
                      {isEditMode ? "Update Prediction" : "Create Prediction"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-b from-yellow-900 to-yellow-950 min-h-screen">
      <div className="mb-6 p-6 bg-yellow-900 rounded-lg shadow-xl border-b-4 border-yellow-500">
        <h1 className="text-center text-yellow-400 font-bold text-2xl mb-2">
          Crop Prediction Management
        </h1>
        <p className="text-center text-yellow-200 text-sm max-w-2xl mx-auto">
          Manage and analyze crop recommendations and predictions
        </p>
      </div>

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Left side - Recent Activity */}
        {renderRecentActivity()}

        {/* Right side - Charts */}
        {renderCharts()}
      </div>

      {/* Crop Distribution Map */}
      <div className="mb-6">{renderCropDistributionMap()}</div>

      {/* Advanced Filters */}
      {renderAdvancedFilters()}

      {/* Data Table */}
      {renderDataTable()}

      {/* Add/Edit Modal */}
      {/* {isModalOpen && renderPredictionModal()} */}

      {/* View Details Modal */}
      {viewDetailsModalOpen && renderDetailsModal()}

      {/* Add Prediction Modal */}
      {isModalOpen && renderPredictionModal()}
    </div>
  );
}

export default Officer_Manage_predictions;
