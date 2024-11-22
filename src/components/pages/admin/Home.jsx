/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from "react-router-dom";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AdminHome() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [areaChartData, setAreaChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Retrieved Token:", token);

    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/users/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.users) {
          setUserData(res.data.users);
          console.log("Fetched Users Data:", res.data.users);
          processChartData(res.data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        handleAuthError(error);
      }
    };

    fetchUsers();
  }, []);

  const handleAuthError = (err) => {
    if (err.response && err.response.status === 401) {
      alert("Session expired. Please log in again.");
      navigate("/login");
    }
  };

  const processChartData = (data) => {
    const roles = ['admin', 'manager', 'driver'];
    const colors = {
      admin: 'rgba(75,192,192,0.2)',
      manager: 'rgba(255,99,132,0.2)',
      driver: 'rgba(54,162,235,0.2)'
    };
    const borderColors = {
      admin: 'rgba(75,192,192,1)',
      manager: 'rgba(255,99,132,1)',
      driver: 'rgba(54,162,235,1)'
    };

    // Process data for both charts
    const usersByRoleAndDate = data.reduce((acc, user) => {
      const role = user.role;
      const date = new Date(user.created_at).toLocaleDateString();
      if (!acc[role]) acc[role] = {};
      acc[role][date] = acc[role][date] ? acc[role][date] + 1 : 1;
      return acc;
    }, {});

    // Get unique dates and sort them
    const labels = [...new Set(data.map((user) => 
      new Date(user.created_at).toLocaleDateString()
    ))].sort();

    // Prepare area chart data
    const areaChartDatasets = roles.map((role) => ({
      label: role.charAt(0).toUpperCase() + role.slice(1),
      data: labels.map((date) => usersByRoleAndDate[role]?.[date] || 0),
      fill: true,
      backgroundColor: colors[role],
      borderColor: borderColors[role],
      tension: 0.4,
    }));

    // Prepare pie chart data
    const roleCounts = roles.reduce((acc, role) => {
      acc[role] = data.filter(user => user.role === role).length;
      return acc;
    }, {});

    const pieChartDataset = {
      labels: roles.map(role => role.charAt(0).toUpperCase() + role.slice(1)),
      datasets: [{
        data: roles.map(role => roleCounts[role]),
        backgroundColor: roles.map(role => colors[role]),
        borderColor: roles.map(role => borderColors[role]),
        borderWidth: 1,
      }],
    };

    setAreaChartData({ labels, datasets: areaChartDatasets });
    setPieChartData(pieChartDataset);
  };

  const areaChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          stepSize: 1,
          callback: value => (Number.isInteger(value) ? value : null)
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Users Over Time',
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'User Distribution by Role',
      },
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="mt-20 flex flex-col items-center">
      <div className="w-full flex flex-wrap justify-center gap-8">
        {/* Area Chart */}
        <div className="flex-1 min-w-[300px] md:max-w-[48%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Users Over Time</h2>
          {areaChartData.labels.length > 0 ? (
            <Line data={areaChartData} options={areaChartOptions} />
          ) : (
            <p className="text-gray-700 text-center">Loading user data...</p>
          )}
        </div>

        {/* Pie Chart with adjusted size */}
        <div className="flex-1 min-w-[200px] md:max-w-[30%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">User Distribution by Role</h2>
          {pieChartData.labels.length > 0 ? (
            <Pie data={pieChartData} options={pieChartOptions} />
          ) : (
            <p className="text-gray-700 text-center">Loading user data...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
