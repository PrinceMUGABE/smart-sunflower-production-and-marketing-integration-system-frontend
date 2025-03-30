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
  faEdit, faTrash, faDownload, faSearch, faUsers, faChartPie, 
  faUserPlus, faFilter, faCalendarAlt, faEnvelope, faPhone,
  faUserShield, faUserTie, faUserCheck, faSortAmountDown, faSortAmountUp
} from "@fortawesome/free-solid-svg-icons";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

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
        <div className="p-4 text-red-100 bg-red-900 rounded-lg">
          <h3 className="font-semibold">Something went wrong</h3>
          <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
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
  <div className={`${bgColor} rounded-lg shadow-lg p-4 border border-gray-700 flex items-center justify-between`}>
    <div>
      <p className="text-gray-300 text-xs mb-1">{title}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
    <div className={`${textColor} bg-opacity-20 p-3 rounded-full`}>
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

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    dateFrom: '',
    dateTo: '',
    sortField: 'created_at',
    sortDirection: 'desc'
  });
  const navigate = useNavigate();
  
  const COLORS = ['#FF6B6B', '#4ECDC4', '#FFD166', '#F9F871'];
  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const accessToken = storedUserData ? JSON.parse(storedUserData).access_token : null;
    if (!accessToken) {
      navigate("/login");
      return;
    }
    handleFetch();
  }, [navigate]);

  const handleFetch = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/users/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(Array.isArray(res.data.users) ? res.data.users : []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this user?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
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

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      doc.autoTable({ html: '#user-table' });
      doc.save('users.pdf');
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(filteredSortedData), "Users");
      XLSX.writeFile(workbook, "users.xlsx");
    },
    CSV: () => {
      const csvContent = "data:text/csv;charset=utf-8," + 
        Object.keys(filteredSortedData[0]).join(",") + "\n" +
        filteredSortedData.map(row => Object.values(row).join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "users.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const getRoleDisplayName = role => ({
    admin: "Admin",
    customer: "Customer",
    driver: "Driver",
    user: "User"
  }[role] || role);

  const getRoleBadgeClass = role => {
    const classes = {
      admin: "bg-red-600 text-white",
      customer: "bg-blue-600 text-white",
      driver: "bg-yellow-500 text-gray-900",
      user: "bg-gray-500 text-white"
    };
    return classes[role] || "bg-gray-500 text-white";
  };

  const getRoleIcon = role => {
    const icons = {
      admin: faUserShield,
      customer: faUserCheck,
      driver: faUserTie,
      user: faUsers
    };
    return icons[role] || faUsers;
  };

  // Filter and sort data
  const filteredSortedData = useMemo(() => {
    return userData
      .filter(user => {
        const matchesSearch = [user.phone_number, user.role, user.email, user.created_at]
          .some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesRole = !filters.role || user.role === filters.role;
        
        const createdDate = new Date(user.created_at);
        const matchesDateFrom = !filters.dateFrom || createdDate >= new Date(filters.dateFrom);
        const matchesDateTo = !filters.dateTo || createdDate <= new Date(filters.dateTo);
        
        return matchesSearch && matchesRole && matchesDateFrom && matchesDateTo;
      })
      .sort((a, b) => {
        const fieldA = a[filters.sortField];
        const fieldB = b[filters.sortField];
        
        if (filters.sortDirection === 'asc') {
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
    
    const newUsersLast30Days = userData.filter(user => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(user.created_at) >= thirtyDaysAgo;
    }).length;
    
    return {
      total: userData.length,
      admins: roleCounts.admin || 0,
      customers: roleCounts.customer || 0,
      drivers: roleCounts.driver || 0,
      newUsersLast30Days
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
        acc[date] = acc[date] || { total: 0, admin: 0, driver: 0, customer: 0 };
        acc[date].total += 1;
        acc[date][user.role] += 1;
        return acc;
      }, {})
    ).map(([date, counts]) => ({ date, total: counts.total, admin: counts.admin || 0, driver: counts.driver || 0, customer: counts.customer || 0 }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
      <div className="w-full lg:w-1/3 space-y-6">
        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-red-400 flex items-center">
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
                    position: 'outside',
                    offset: 10,
                    fill: '#e5e7eb'
                  }}
                >
                  {roleData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-red-400 flex items-center">
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              User Growth Trend
            </h3>
            <ResponsiveContainer>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  padding={{ left: 20, right: 20 }}
                  tick={{ fontSize: 12, fill: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#e5e7eb' }}
                  padding={{ top: 20, bottom: 20 }}
                />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#e5e7eb' }} />
                <Line type="monotone" dataKey="total" stroke="#FF6B6B" name="Total Users" />
                <Line type="monotone" dataKey="admin" stroke="#4ECDC4" name="Admins" />
                <Line type="monotone" dataKey="driver" stroke="#FFD166" name="Drivers" />
                <Line type="monotone" dataKey="customer" stroke="#F9F871" name="Customers" />
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

  return (
    <ErrorBoundary>
      <div className="p-4 bg-gray-800 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 p-4 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
            <h1 className="text-center text-red-500 font-bold text-xl mb-2">
              Manage Users
            </h1>
            <p className="text-center text-gray-400 text-sm">
              View, edit and manage user accounts from a central dashboard
            </p>
          </div>

          {message && (
            <div className={`text-center py-3 px-4 mb-6 rounded-lg shadow-md ${
              messageType === "success" ? "bg-green-900 text-green-100" : "bg-red-900 text-red-100"
            }`}>
              {message}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard 
              icon={faUsers} 
              title="Total Users" 
              value={summaryMetrics.total} 
              bgColor="bg-gray-900" 
              textColor="text-blue-400" 
            />
            <SummaryCard 
              icon={faUserShield} 
              title="Admins" 
              value={summaryMetrics.admins} 
              bgColor="bg-gray-900" 
              textColor="text-red-400" 
            />
            <SummaryCard 
              icon={faUserCheck} 
              title="Customers" 
              value={summaryMetrics.customers} 
              bgColor="bg-gray-900" 
              textColor="text-green-400" 
            />
            <SummaryCard 
              icon={faCalendarAlt} 
              title="New Users (30 days)" 
              value={summaryMetrics.newUsersLast30Days} 
              bgColor="bg-gray-900" 
              textColor="text-yellow-400" 
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/3">
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-red-400 flex items-center">
                      <FontAwesomeIcon icon={faUsers} className="mr-2" />
                      <span className="font-semibold">Filtered Users:</span> 
                      <span className="ml-2 px-3 py-1 bg-red-600 text-white rounded-full">{filteredSortedData.length}</span>
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
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
                          <h4 className="font-semibold mb-3 pb-2 border-b border-gray-700">Advanced Filters</h4>
                          
                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <select
                              value={filters.role}
                              onChange={e => setFilters({...filters, role: e.target.value})}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            >
                              <option value="">All Roles</option>
                              <option value="admin">Admin</option>
                              <option value="customer">Customer</option>
                              <option value="driver">Driver</option>
                            </select>
                          </div>
                          
                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">From Date</label>
                            <input
                              type="date"
                              value={filters.dateFrom}
                              onChange={e => setFilters({...filters, dateFrom: e.target.value})}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">To Date</label>
                            <input
                              type="date"
                              value={filters.dateTo}
                              onChange={e => setFilters({...filters, dateTo: e.target.value})}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">Sort By</label>
                            <div className="flex gap-2">
                              <select
                                value={filters.sortField}
                                onChange={e => setFilters({...filters, sortField: e.target.value})}
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                              >
                                <option value="created_at">Date Created</option>
                                <option value="email">Email</option>
                                <option value="phone_number">Phone</option>
                                <option value="role">Role</option>
                              </select>
                              <button
                                onClick={() => setFilters({
                                  ...filters, 
                                  sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc'
                                })}
                                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600"
                                title={filters.sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                              >
                                <FontAwesomeIcon icon={filters.sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex justify-between mt-4">
                            <button
                              onClick={() => {
                                setFilters({
                                  role: '',
                                  dateFrom: '',
                                  dateTo: '',
                                  sortField: 'created_at',
                                  sortDirection: 'desc'
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
                        className="py-2 bg-red-600 px-4 rounded-lg text-white flex items-center justify-center hover:bg-red-700 transition duration-200 w-full sm:w-auto"
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Export
                      </button>
                      {downloadMenuVisible && (
                        <div className="absolute right-0 mt-2 bg-gray-800 text-gray-200 shadow-lg rounded-lg p-2 z-10 border border-gray-700 w-32">
                          {Object.keys(handleDownload).map(format => (
                            <button
                              key={format}
                              onClick={() => {
                                handleDownload[format]();
                                setDownloadMenuVisible(false);
                              }}
                              className="block w-full px-4 py-2 text-left hover:bg-gray-700 rounded transition"
                            >
                              {format}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Link to="/admin/createUser" className="py-2 bg-blue-600 px-4 rounded-lg text-white flex items-center justify-center hover:bg-blue-700 transition duration-200 w-full sm:w-auto">
                      <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                      Add User
                    </Link>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filters.role || filters.dateFrom || filters.dateTo) && (
                  <div className="flex flex-wrap gap-2 mb-4 bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <span className="text-gray-400 text-sm">Active Filters:</span>
                    {filters.role && (
                      <span className="px-2 py-1 bg-indigo-900 text-indigo-200 text-xs rounded-full flex items-center">
                        Role: {getRoleDisplayName(filters.role)}
                        <button 
                          className="ml-1 text-indigo-300 hover:text-indigo-100"
                          onClick={() => setFilters({...filters, role: ''})}>
                          ×
                        </button>
                      </span>
                    )}
                    {filters.dateFrom && (
                      <span className="px-2 py-1 bg-indigo-900 text-indigo-200 text-xs rounded-full flex items-center">
                        From: {new Date(filters.dateFrom).toLocaleDateString()}
                        <button 
                          className="ml-1 text-indigo-300 hover:text-indigo-100"
                          onClick={() => setFilters({...filters, dateFrom: ''})}>
                          ×
                        </button>
                      </span>
                    )}
                    {filters.dateTo && (
                      <span className="px-2 py-1 bg-indigo-900 text-indigo-200 text-xs rounded-full flex items-center">
                        To: {new Date(filters.dateTo).toLocaleDateString()}
                        <button 
                          className="ml-1 text-indigo-300 hover:text-indigo-100"
                          onClick={() => setFilters({...filters, dateTo: ''})}>
                          ×
                        </button>
                      </span>
                    )}
                    <button 
                      className="px-2 py-1 text-xs text-gray-300 hover:text-gray-100 underline"
                      onClick={() => setFilters({
                        role: '',
                        dateFrom: '',
                        dateTo: '',
                        sortField: 'created_at',
                        sortDirection: 'desc'
                      })}>
                      Clear All
                    </button>
                  </div>
                )}

                <div className="overflow-x-auto rounded-lg shadow-md border border-gray-700">
                  <table id="user-table" className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-red-600 text-white">
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
                            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
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
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                            Created Date
                          </div>
                        </th>
                        <th className="px-6 py-3 rounded-tr-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-gray-400 bg-gray-800">
                            <div className="flex flex-col items-center">
                              <FontAwesomeIcon icon={faUsers} className="text-4xl mb-3 text-gray-600" />
                              <p>No users found matching your criteria</p>
                              {(filters.role || filters.dateFrom || filters.dateTo || searchQuery) && (
                                <button 
                                  onClick={() => {
                                    setFilters({
                                      role: '',
                                      dateFrom: '',
                                      dateTo: '',
                                      sortField: 'created_at',
                                      sortDirection: 'desc'
                                    });
                                    setSearchQuery('');
                                  }}
                                  className="mt-2 text-indigo-400 hover:underline"
                                >
                                  Clear all filters
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentUsers.map((user, index) => (
                          <tr key={user.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700 transition duration-200">
                            <td className="px-6 py-4 text-gray-300">{(currentPage - 1) * usersPerPage + index + 1}</td>
                            <td className="px-6 py-4 text-gray-300">{user.phone_number}</td>
                            <td className="px-6 py-4 text-gray-300">{user.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)} flex items-center w-fit`}>
                                <FontAwesomeIcon icon={getRoleIcon(user.role)} className="mr-1" />
                                {getRoleDisplayName(user.role)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-3">
                                <Link to={`/admin/editUser/${user.id}`} className="text-blue-400 hover:text-blue-300 transition">
                                  <FontAwesomeIcon icon={faEdit} />
                                </Link>
                                <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-300 transition">
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

                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-300">Rows per page:</span>
                    <select
                      value={usersPerPage}
                      onChange={e => setUsersPerPage(Number(e.target.value))}
                      className="border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      {[5, 10, 30, 50, 100].map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 bg-red-600 text-white rounded-lg">
                      Page {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage * usersPerPage >= filteredData.length}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {renderCharts()}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Users;