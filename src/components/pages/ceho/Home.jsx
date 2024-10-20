/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2'; // Import Line chart from react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function AdminHome() {
  const [trainingsData, setTrainingsData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [trainingsChartData, setTrainingsChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [usersChartData, setUsersChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // Fetch both trainings and users in parallel with token authorization
    const fetchTrainings = async () => {
      const token = localStorage.getItem('token'); // Retrieve the token

      try {
        const res = await axios.get('http://127.0.0.1:8000/training/trainings/', {
          headers: {
            Authorization: `Bearer ${token}`,  // Include the token in the Authorization header
          },
        });

        if (res.data) {
          setTrainingsData(res.data);
          processTrainingsData(res.data); // Process training data for chart
        }
      } catch (error) {
        console.error('Error fetching trainings:', error);
      }
    };

    const fetchUsers = async () => {
      const token = localStorage.getItem('token'); // Retrieve the token

      try {
        const res = await axios.get('http://127.0.0.1:8000/users/', {
          headers: {
            Authorization: `Bearer ${token}`,  // Include the token in the Authorization header
          },
        });

        if (res.data) {
          setUserData(res.data);
          processUsersData(res.data); // Process user data for chart
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchTrainings();
    fetchUsers();
  }, []);

  // Process training data for chart
  const processTrainingsData = (data) => {
    if (!data || data.length === 0) return; // Return early if no data

    const trainingsByDate = data.reduce((acc, training) => {
      const date = new Date(training.created_at).toLocaleDateString();
      acc[date] = acc[date] ? acc[date] + 1 : 1;
      return acc;
    }, {});

    const labels = Object.keys(trainingsByDate).sort(); // Get sorted dates
    const values = labels.map((date) => trainingsByDate[date]);

    setTrainingsChartData({
      labels,
      datasets: [
        {
          label: 'Trainings Over Time',
          data: values,
          fill: false,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: 'rgba(75,192,192,1)',
        },
      ],
    });
  };

  // Process user data for chart
  const processUsersData = (data) => {
    if (!data || data.length === 0) return; // Return early if no data

    const roles = ['citizen', 'chw', 'ceho'];

    // Group users by role and date
    const usersByRoleAndDate = data.reduce((acc, user) => {
      const role = user.role;
      const date = new Date(user.created_at).toLocaleDateString();

      if (!acc[role]) {
        acc[role] = {};
      }
      acc[role][date] = acc[role][date] ? acc[role][date] + 1 : 1;
      return acc;
    }, {});

    const labels = [...new Set(data.map((user) => new Date(user.created_at).toLocaleDateString()))].sort();

    const datasets = roles.map((role) => ({
      label: role.charAt(0).toUpperCase() + role.slice(1),
      data: labels.map((date) => usersByRoleAndDate[role]?.[date] || 0),
      fill: false,
      borderColor: role === 'citizen' ? 'rgba(75,192,192,1)' : role === 'chw' ? 'rgba(255,99,132,1)' : 'rgba(54,162,235,1)',
      backgroundColor: role === 'citizen' ? 'rgba(75,192,192,1)' : role === 'chw' ? 'rgba(255,99,132,1)' : 'rgba(54,162,235,1)',
    }));

    setUsersChartData({
      labels,
      datasets,
    });
  };

  // Options to ensure Y-axis starts from 0 and displays only whole numbers
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true, // Ensure Y-axis starts from 0
        ticks: {
          stepSize: 1, // Ensure step size is 1 (no decimals)
          callback: function (value) {
            if (Number.isInteger(value)) {
              return value; // Only show whole numbers
            }
          },
        },
      },
    },
  };

  return (
    <div className="mt-20 flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-4 text-center text-black">Trainings Over Time</h2>
      <div className="flex justify-center p-4 w-full md:w-1/2">
        {trainingsChartData?.labels?.length >= 1 ? (
          <Line data={trainingsChartData} options={chartOptions} />
        ) : (
          <p className="text-gray-700">Loading training data...</p>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-4 text-center text-black">Users by Role Over Time</h2>
      <div className="flex justify-center p-4 w-full md:w-1/2">
        {usersChartData?.labels?.length >= 1 ? (
          <Line data={usersChartData} options={chartOptions} />
        ) : (
          <p className="text-gray-700">Loading user data...</p>
        )}
      </div>
    </div>
  );
}

export default AdminHome;
