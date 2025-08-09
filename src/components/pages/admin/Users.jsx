/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
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
  faUsers,
  faChartPie,
  faUserPlus,
  faFilter,
  faCalendarAlt,
  faEnvelope,
  faPhone,
  faHistory,
  faUserShield,
  faUserTie,
  faUserCheck,
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

function Users() {
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState("");
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
    dateFrom: "",
    dateTo: "",
    sortField: "created_at",
    sortDirection: "desc",
  });
  const navigate = useNavigate();

  const COLORS = ['#FFD700', '#E3A018', '#B8860B', '#DAA520', '#F4A460'];
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
      const res = await axios.get("http://127.0.0.1:8000/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(Array.isArray(res.data.users) ? res.data.users : []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this user?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleFetch();
      setMessage("User deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data.message || "An error occurred");
      setMessageType("error");
    }
  };

  // Updated handleDownload object with professional report formatting
const handleDownload = {
  PDF: () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleString();

    try {
                doc.addImage(Logo, 'JPEG', 14, 10, 30, 20);
              } catch (error) {
                console.log('Logo could not be added to PDF:', error);
              }
          
    
    // Header section
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Smart Sunflower Production and Marketing Integration System', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('User Management Report', 105, 30, { align: 'center' });
    
    // Contact information
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Email: minagri@gov.rw', 20, 45);
    doc.text('Phone: +250 788 457 408', 20, 50);
    doc.text('Address: Kigali-Rwanda', 20, 55);
    
    // Generation info
    doc.text(`Generated: ${currentDate}`, 20, 70);
    doc.text(`Total Records: ${filteredSortedData.length}`, 20, 75);
    
    // Applied filters section
    doc.setFont(undefined, 'bold');
    doc.text('Applied Filters:', 20, 90);
    doc.setFont(undefined, 'normal');
    
    let filterY = 95;
    if (filters.role) {
      doc.text(`• Role: ${getRoleDisplayName(filters.role)}`, 25, filterY);
      filterY += 5;
    }
    if (filters.dateFrom) {
      doc.text(`• From Date: ${new Date(filters.dateFrom).toLocaleDateString()}`, 25, filterY);
      filterY += 5;
    }
    if (filters.dateTo) {
      doc.text(`• To Date: ${new Date(filters.dateTo).toLocaleDateString()}`, 25, filterY);
      filterY += 5;
    }
    if (!filters.role && !filters.dateFrom && !filters.dateTo) {
      doc.text('• No filters applied (All records)', 25, filterY);
      filterY += 5;
    }
    
    // Summary statistics
    doc.setFont(undefined, 'bold');
    doc.text('Summary Statistics:', 20, filterY + 10);
    
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Users', summaryMetrics.total.toString()],
      ['Unique Roles', Object.keys(userData.reduce((acc, user) => ({ ...acc, [user.role]: true }), {})).length.toString()],
      ['Admin Users', summaryMetrics.admins.toString()],
      ['Farmers', summaryMetrics.farmers.toString()],
      ['Minagri Officers', summaryMetrics.minagri_officers.toString()],
      ['New Users (30 days)', summaryMetrics.newUsersLast30Days.toString()]
    ];
    
    doc.autoTable({
      startY: filterY + 15,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [218, 165, 32], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 40 }
      }
    });
    
    // User data table
    const tableData = filteredSortedData.map((user, index) => [
      (index + 1).toString(),
      user.phone_number || 'N/A',
      user.email || 'N/A',
      getRoleDisplayName(user.role),
      new Date(user.created_at).toLocaleDateString()
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['#', 'Phone Number', 'Email', 'Role', 'Created Date']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [218, 165, 32], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 60 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 }
      }
    });
    
    doc.save(`user-management-report-${new Date().toISOString().split('T')[0]}.pdf`);
  },

  Excel: () => {
    const workbook = XLSX.utils.book_new();
    const currentDate = new Date().toLocaleString();
    
    // Create summary sheet
    const summaryData = [
      ['Smart Sunflower Production and Marketing Integration System'],
      ['User Management Report'],
      [''],
      ['Email:', 'minagri@gov.rw'],
      ['Phone:', '+250 788 457 408'],
      ['Address:', 'Kigali-Rwanda'],
      [''],
      ['Generated:', currentDate],
      ['Total Records:', filteredSortedData.length],
      [''],
      ['Applied Filters:'],
      ...(filters.role ? [['Role:', getRoleDisplayName(filters.role)]] : []),
      ...(filters.dateFrom ? [['From Date:', new Date(filters.dateFrom).toLocaleDateString()]] : []),
      ...(filters.dateTo ? [['To Date:', new Date(filters.dateTo).toLocaleDateString()]] : []),
      ...(!filters.role && !filters.dateFrom && !filters.dateTo ? [['No filters applied (All records)']] : []),
      [''],
      ['Summary Statistics:'],
      ['Metric', 'Value'],
      ['Total Users', summaryMetrics.total],
      ['Unique Roles', Object.keys(userData.reduce((acc, user) => ({ ...acc, [user.role]: true }), {})).length],
      ['Admin Users', summaryMetrics.admins],
      ['Farmers', summaryMetrics.farmers],
      ['Minagri Officers', summaryMetrics.minagri_officers],
      ['New Users (30 days)', summaryMetrics.newUsersLast30Days]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Create user data sheet
    const userData = [
      ['#', 'Phone Number', 'Email', 'Role', 'Created Date'],
      ...filteredSortedData.map((user, index) => [
        index + 1,
        user.phone_number || 'N/A',
        user.email || 'N/A',
        getRoleDisplayName(user.role),
        new Date(user.created_at).toLocaleDateString()
      ])
    ];
    
    const userSheet = XLSX.utils.aoa_to_sheet(userData);
    XLSX.utils.book_append_sheet(workbook, userSheet, 'Users');
    
    XLSX.writeFile(workbook, `user-management-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  CSV: () => {
    const currentDate = new Date().toLocaleString();
    
    // Create header information
    const headerInfo = [
      'Smart Sunflower Production and Marketing Integration System',
      'User Management Report',
      '',
      `Email: minagri@gov.rw`,
      `Phone: +250 788 457 408`,
      `Address: Kigali-Rwanda`,
      '',
      `Generated: ${currentDate}`,
      `Total Records: ${filteredSortedData.length}`,
      '',
      'Applied Filters:',
      ...(filters.role ? [`Role: ${getRoleDisplayName(filters.role)}`] : []),
      ...(filters.dateFrom ? [`From Date: ${new Date(filters.dateFrom).toLocaleDateString()}`] : []),
      ...(filters.dateTo ? [`To Date: ${new Date(filters.dateTo).toLocaleDateString()}`] : []),
      ...(!filters.role && !filters.dateFrom && !filters.dateTo ? ['No filters applied (All records)'] : []),
      '',
      'Summary Statistics:',
      'Metric,Value',
      `Total Users,${summaryMetrics.total}`,
      `Unique Roles,${Object.keys(userData.reduce((acc, user) => ({ ...acc, [user.role]: true }), {})).length}`,
      `Admin Users,${summaryMetrics.admins}`,
      `Farmers,${summaryMetrics.farmers}`,
      `Minagri Officers,${summaryMetrics.minagri_officers}`,
      `New Users (30 days),${summaryMetrics.newUsersLast30Days}`,
      '',
      'User Data:',
      '#,Phone Number,Email,Role,Created Date'
    ];
    
    // Add user data
    const userRows = filteredSortedData.map((user, index) => 
      `${index + 1},"${user.phone_number || 'N/A'}","${user.email || 'N/A'}","${getRoleDisplayName(user.role)}","${new Date(user.created_at).toLocaleDateString()}"`
    );
    
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [...headerInfo, ...userRows].join('\n');
    
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `user-management-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

  const getRoleDisplayName = (role) =>
    ({
      admin: "Admin",
      farmer: "Farmer",
      minagri_officer: "Minagri Officer",
      user: "User",
    }[role] || role);

  const getRoleBadgeClass = (role) => {
    const classes = {
      admin: "bg-yellow-600 text-white",
      farmer: "bg-yellow-700 text-white",
      user: "bg-yellow-800 text-white",
      minagri_officer: "bg-yellow-500 text-white"
    };
    return classes[role] || "bg-yellow-800 text-white";
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: faUserShield,
      farmer: faUserCheck,
      user: faUsers,
      minagri_officer: faUserTie,
    };
    return icons[role] || faUsers;
  };

  // Filter and sort data
  const filteredSortedData = useMemo(() => {
    return userData
      .filter((user) => {
        const matchesSearch = [
          user.phone_number,
          user.role,
          user.email,
          user.created_at,
        ].some((field) =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const matchesRole = !filters.role || user.role === filters.role;

        const createdDate = new Date(user.created_at);
        const matchesDateFrom =
          !filters.dateFrom || createdDate >= new Date(filters.dateFrom);
        const matchesDateTo =
          !filters.dateTo || createdDate <= new Date(filters.dateTo);

        return matchesSearch && matchesRole && matchesDateFrom && matchesDateTo;
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
  }, [userData, searchQuery, filters]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const roleCounts = userData.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const newUsersLast30Days = userData.filter((user) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(user.created_at) >= thirtyDaysAgo;
    }).length;

    return {
      total: userData.length,
      admins: roleCounts.admin || 0,
      farmers: roleCounts.farmer || 0,
      minagri_officers: roleCounts.minagri_officer || 0,
      newUsersLast30Days,
    };
  }, [userData]);

  const renderCharts = () => {
    if (!userData.length) return null;

    const roleData = Object.entries(
      userData.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {})
    ).map(([role, value]) => ({ name: getRoleDisplayName(role), value }));

    const userGrowthData = Object.entries(
      userData.reduce((acc, user) => {
        const date = new Date(user.created_at).toLocaleDateString();
        acc[date] = acc[date] || { total: 0, admin: 0, farmer: 0, minagri_officer: 0 };
        acc[date].total += 1;
        acc[date][user.role] += 1;
        return acc;
      }, {})
    )
      .map(([date, counts]) => ({
        date,
        total: counts.total,
        admin: counts.admin || 0,
        farmer: counts.farmer || 0,
        minagri_officer: counts.minagri_officer || 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
      <div className="w-full lg:w-1/3 space-y-6">
        <ErrorBoundary>
          <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-yellow-400 flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-2" />
              User Role Distribution
            </h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={roleData}
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
                  {roleData.map((_, index) => (
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
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              User Growth Trend
            </h3>
            <ResponsiveContainer>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
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
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#FFD700"
                  strokeWidth={2}
                  name="Total Users"
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="admin"
                  stroke="#E3A018"
                  strokeWidth={2}
                  name="Admins"
                />
                <Line
                  type="monotone"
                  dataKey="farmer"
                  stroke="#B8860B"
                  strokeWidth={2}
                  name="Farmers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  const currentUsers = filteredSortedData.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
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
          <div key={i} className="bg-yellow-900 rounded-lg shadow-lg p-5 h-24" />
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
              User Management Dashboard
            </h1>
            <p className="text-center text-yellow-200 text-sm max-w-2xl mx-auto">
              Comprehensive user management system for monitoring, analyzing,
              and administrating system users
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
              icon={faUsers}
              title="Total Users"
              value={summaryMetrics.total}
              bgColor="bg-yellow-900"
              textColor="text-yellow-300"
            />
            <SummaryCard
              icon={faUserShield}
              title="Admins"
              value={summaryMetrics.admins}
              bgColor="bg-yellow-900"
              textColor="text-yellow-300"
            />
            <SummaryCard
              icon={faUserCheck}
              title="Farmers"
              value={summaryMetrics.farmers}
              bgColor="bg-yellow-900"
              textColor="text-yellow-300"
            />
            <SummaryCard
              icon={faUserTie}
              title="Minagri Officers"
              value={summaryMetrics.minagri_officers}
              bgColor="bg-yellow-900"
              textColor="text-yellow-300"
            />
            <SummaryCard
              icon={faCalendarAlt}
              title="New Users (30 days)"
              value={summaryMetrics.newUsersLast30Days}
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
                      <FontAwesomeIcon icon={faUsers} className="mr-2" />
                      <span className="font-semibold">Filtered Users:</span>
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
                        placeholder="Search users..."
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
                              Role
                            </label>
                            <select
                              value={filters.role}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  role: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 bg-yellow-700 border border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
                            >
                              <option value="">All Roles</option>
                              <option value="admin">Admin</option>
                              <option value="farmer">Farmer</option>
                              <option value="minagri_officer">Minagri Officer</option>
                              <option value="user">User</option>
                            </select>
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
                                <option value="created_at">Date Created</option>
                                <option value="email">Email</option>
                                <option value="phone_number">Phone</option>
                                <option value="role">Role</option>
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
                                  role: "",
                                  dateFrom: "",
                                  dateTo: "",
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

                    <Link
                      to="/admin/createUser"
                      className="py-2 bg-green-600 px-4 rounded-lg text-white flex items-center justify-center hover:bg-green-700 transition duration-200 w-full sm:w-auto"
                    >
                      <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                      Add User
                    </Link>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filters.role || filters.dateFrom || filters.dateTo) && (
                  <div className="flex flex-wrap gap-2 mb-4 bg-yellow-800 p-3 rounded-lg border border-yellow-700">
                    <span className="text-yellow-400 text-sm">
                      Active Filters:
                    </span>
                    {filters.role && (
                      <span className="px-2 py-1 bg-yellow-700 text-yellow-200 text-xs rounded-full flex items-center">
                        Role: {getRoleDisplayName(filters.role)}
                        <button
                          className="ml-1 text-yellow-300 hover:text-yellow-100"
                          onClick={() => setFilters({ ...filters, role: "" })}
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.dateFrom && (
                      <span className="px-2 py-1 bg-yellow-700 text-yellow-200 text-xs rounded-full flex items-center">
                        From: {new Date(filters.dateFrom).toLocaleDateString()}
                        <button
                          className="ml-1 text-yellow-300 hover:text-yellow-100"
                          onClick={() =>
                            setFilters({ ...filters, dateFrom: "" })
                          }
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.dateTo && (
                      <span className="px-2 py-1 bg-yellow-700 text-yellow-200 text-xs rounded-full flex items-center">
                        To: {new Date(filters.dateTo).toLocaleDateString()}
                        <button
                          className="ml-1 text-yellow-300 hover:text-yellow-100"
                          onClick={() => setFilters({ ...filters, dateTo: "" })}
                        >
                          ×
                        </button>
                      </span>
                    )}
                    <button
                      className="px-2 py-1 text-xs text-yellow-300 hover:text-yellow-100 underline"
                      onClick={() =>
                        setFilters({
                          role: "",
                          dateFrom: "",
                          dateTo: "",
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
                    <table id="user-table" className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-gradient-to-r from-yellow-600 to-yellow-500 text-white">
                        <tr>
                          <th className="px-6 py-3 rounded-tl-lg">#</th>
                          <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faPhone} className="mr-2" />
                              Phone
                            </div>
                          </th>
                          <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="mr-2"
                              />
                              Email
                            </div>
                          </th>
                          <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faUsers} className="mr-2" />
                              Role
                            </div>
                          </th>
                          <th className="px-6 py-3">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="mr-2"
                              />
                              Created Date
                            </div>
                          </th>
                          <th className="px-6 py-3 rounded-tr-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.length === 0 ? (
                          <tr className="bg-yellow-900 border-b border-yellow-800 hover:bg-yellow-800 transition-colors duration-200">
                            <td
                              colSpan="6"
                              className="text-center py-8 text-yellow-400 bg-yellow-900"
                            >
                              <div className="flex flex-col items-center">
                                <FontAwesomeIcon
                                  icon={faUsers}
                                  className="text-4xl mb-3 text-yellow-600"
                                />
                                <p>No users found matching your criteria</p>
                                {(filters.role ||
                                  filters.dateFrom ||
                                  filters.dateTo ||
                                  searchQuery) && (
                                  <button
                                    onClick={() => {
                                      setFilters({
                                        role: "",
                                        dateFrom: "",
                                        dateTo: "",
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
                          currentUsers.map((user, index) => (
                            <tr
                              key={user.id}
                              className="bg-yellow-900 border-b border-yellow-800 hover:bg-yellow-800 transition duration-200"
                            >
                              <td className="px-6 py-4 text-yellow-200">
                                {(currentPage - 1) * usersPerPage + index + 1}
                              </td>
                              <td className="px-6 py-4 text-yellow-200">
                                {user.phone_number}
                              </td>
                              <td className="px-6 py-4 text-yellow-200">
                                {user.email}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(
                                    user.role
                                  )} flex items-center w-fit`}
                                >
                                  <FontAwesomeIcon
                                    icon={getRoleIcon(user.role)}
                                    className="mr-1"
                                  />
                                  {getRoleDisplayName(user.role)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-yellow-200">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-3">
                                  <Link
                                    to={`/admin/editUser/${user.id}`}
                                    className="text-blue-400 hover:text-blue-300 transition"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(user.id)}
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
                    {Array.from(
                      {
                        length: Math.min(
                          5,
                          Math.ceil(filteredSortedData.length / usersPerPage)
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
                        currentPage * usersPerPage >= filteredSortedData.length
                      }
                      className="px-3 py-2 border-r border-yellow-700 text-yellow-300 hover:bg-yellow-800 disabled:opacity-50"
                    >
                      Next
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.ceil(filteredSortedData.length / usersPerPage)
                        )
                      }
                      disabled={
                        currentPage * usersPerPage >= filteredSortedData.length
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

          <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800 mt-6">
            <h3 className="text-sm font-semibold mb-4 text-yellow-400 flex items-center">
              <FontAwesomeIcon icon={faHistory} className="mr-2" />
              Recent User Activity
            </h3>
            <div className="space-y-3">
              {userData.slice(0, 5).map((user, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 border-l-4 border-yellow-500 bg-yellow-800 rounded"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-yellow-700 text-yellow-300 rounded-full mr-3">
                    <FontAwesomeIcon icon={getRoleIcon(user.role)} />
                  </span>
                  <div>
                    <p className="text-yellow-200 text-sm">
                      {user.phone_number}
                    </p>
                    <p className="text-yellow-400 text-xs">
                      {getRoleDisplayName(user.role)} • {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Users;