/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Pie, Bar } from 'react-chartjs-2'; // Import Pie and Bar chart for new graphs
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

function AdminHome() {
  const navigate = useNavigate();
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
  const [trainingCandidateData, setTrainingCandidateData] = useState([]);
  const [workerData, setWorkerData] = useState([]);
  const [resultData, setResultData] = useState([]);
  const [reportData, setReportData] = useState([]);
  
  const [pieChartData, setPieChartData] = useState({});
  const [candidatesChartData, setCandidatesChartData] = useState({});
  const [reportsChartData, setReportsChartData] = useState({});
  const [workersAreaChartData, setWorkersAreaChartData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchTrainings = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/training/trainings/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          setTrainingsData(res.data);
          processTrainingsData(res.data);
        }
      } catch (error) {
        console.error('Error fetching trainings:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/users/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          setUserData(res.data);
          processUsersData(res.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchTrainingCandidates = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/trainingCandidate/candidates/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrainingCandidateData(res.data);
        processTrainingCandidates(res.data);
      } catch (err) {
        handleAuthError(err);
      }
    };

    const handleFetchWorkers = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/worker/workers/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkerData(res.data);
        processWorkersData(res.data);
      } catch (err) {
        handleAuthError(err);
      }
    };

    const handleFetchResults = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/result/results/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResultData(res.data);
        processResultsData(res.data);
      } catch (err) {
        handleAuthError(err);
      }
    };

    const fetchReports = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/report/reports/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReportData(res.data);
        processReportsData(res.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchTrainings();
    fetchUsers();
    fetchTrainingCandidates();
    handleFetchWorkers();
    handleFetchResults();
    fetchReports();
  }, []);

  const handleAuthError = (err) => {
    if (err.response && err.response.status === 401) {
      alert("Session expired. Please log in again.");
      navigate("/login");
    }
  };

  const processTrainingsData = (data) => {
    const trainingsByDate = data.reduce((acc, training) => {
      const date = new Date(training.created_at).toLocaleDateString();
      acc[date] = acc[date] ? acc[date] + 1 : 1;
      return acc;
    }, {});
    const labels = Object.keys(trainingsByDate).sort();
    const values = labels.map((date) => trainingsByDate[date]);
    setTrainingsChartData({
      labels,
      datasets: [{ label: 'Trainings Over Time', data: values, backgroundColor: 'rgba(75,192,192,1)', borderColor: 'rgba(75,192,192,1)' }],
    });
  };

  const processUsersData = (data) => {
    const roles = ['citizen', 'chw', 'ceho'];
    const usersByRoleAndDate = data.reduce((acc, user) => {
      const role = user.role;
      const date = new Date(user.created_at).toLocaleDateString();
      if (!acc[role]) acc[role] = {};
      acc[role][date] = acc[role][date] ? acc[role][date] + 1 : 1;
      return acc;
    }, {});
    const labels = [...new Set(data.map((user) => new Date(user.created_at).toLocaleDateString()))].sort();
    const datasets = roles.map((role) => ({
      label: role.charAt(0).toUpperCase() + role.slice(1),
      data: labels.map((date) => usersByRoleAndDate[role]?.[date] || 0),
      borderColor: role === 'citizen' ? 'rgba(75,192,192,1)' : role === 'chw' ? 'rgba(255,99,132,1)' : 'rgba(54,162,235,1)',
      backgroundColor: role === 'citizen' ? 'rgba(75,192,192,1)' : role === 'chw' ? 'rgba(255,99,132,1)' : 'rgba(54,162,235,1)',
    }));
    setUsersChartData({ labels, datasets });
  };

  const processResultsData = (data) => {
    const succeed = data.filter(result => result.status === 'succeed').length;
    const failed = data.filter(result => result.status === 'failed').length;
    setPieChartData({
      labels: ['Succeed', 'Failed'],
      datasets: [{ data: [succeed, failed], backgroundColor: ['rgba(75,192,192,1)', 'rgba(255,99,132,1)'] }],
    });
  };

  const processTrainingCandidates = (data) => {
    const candidatesByDate = data.reduce((acc, candidate) => {
      const date = new Date(candidate.created_at).toLocaleDateString();
      acc[date] = acc[date] ? acc[date] + 1 : 1;
      return acc;
    }, {});
    const labels = Object.keys(candidatesByDate).sort();
    const values = labels.map((date) => candidatesByDate[date]);
    setCandidatesChartData({
      labels,
      datasets: [{ label: 'Candidates Over Time', data: values, backgroundColor: 'rgba(75,192,192,1)', borderColor: 'rgba(75,192,192,1)' }],
    });
  };

  const processReportsData = (data) => {
    const currentMonth = new Date().getMonth();
    const reportsByDay = data.reduce((acc, report) => {
      const createdAt = new Date(report.created_date);
      if (createdAt.getMonth() === currentMonth) {
        const date = createdAt.toLocaleDateString();
        acc[date] = acc[date] ? acc[date] + 1 : 1;
      }
      return acc;
    }, {});
    const labels = Object.keys(reportsByDay).sort();
    const values = labels.map((date) => reportsByDay[date]);
    setReportsChartData({
      labels,
      datasets: [{ label: 'Reports in Current Month', data: values, backgroundColor: 'rgba(255,159,64,0.5)', borderColor: 'rgba(255,159,64,1)' }],
    });
  };

  const processWorkersData = (data) => {
    const currentMonth = new Date().getMonth();
    const workersByDate = data.reduce((acc, worker) => {
      const createdAt = new Date(worker.created_at);
      if (createdAt.getMonth() === currentMonth) {
        const date = createdAt.toLocaleDateString();
        acc[date] = acc[date] ? acc[date] + 1 : 1;
      }
      return acc;
    }, {});
    const labels = Object.keys(workersByDate).sort();
    const values = labels.map((date) => workersByDate[date]);
    setWorkersAreaChartData({
      labels,
      datasets: [{ label: 'Workers in Current Month', data: values, backgroundColor: 'rgba(54,162,235,0.5)', borderColor: 'rgba(54,162,235,1)', fill: true }],
    });
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, callback: value => (Number.isInteger(value) ? value : null) },
      },
    },
  };

  return (
    <div className="mt-20 flex flex-col items-center">
      <div className="w-full flex flex-wrap justify-center gap-8">
        {/* Trainings Chart */}
        <div className="flex-1 min-w-[300px] md:max-w-[48%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Trainings Over Time</h2>
          {trainingsChartData.labels.length >= 1 ? <Line data={trainingsChartData} options={chartOptions} /> : <p className="text-gray-700 text-center">Loading training data...</p>}
        </div>

        {/* Users Chart */}
        <div className="flex-1 min-w-[300px] md:max-w-[48%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Users by Role Over Time</h2>
          {usersChartData.labels.length >= 1 ? <Line data={usersChartData} options={chartOptions} /> : <p className="text-gray-700 text-center">Loading user data...</p>}
        </div>

        {/* Results Pie Chart */}
        <div className="flex-1 min-w-[300px] md:max-w-[48%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Results Status</h2>
          {pieChartData.labels ? <Pie data={pieChartData} /> : <p className="text-gray-700 text-center">Loading results data...</p>}
        </div>

        {/* Candidates Line Chart */}
        <div className="flex-1 min-w-[300px] md:max-w-[48%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Training Candidates Over Time</h2>
          {candidatesChartData.labels ? <Line data={candidatesChartData} options={chartOptions} /> : <p className="text-gray-700 text-center">Loading candidate data...</p>}
        </div>

        {/* Reports Histogram */}
        <div className="flex-1 min-w-[300px] md:max-w-[48%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Reports Created This Month</h2>
          {reportsChartData.labels ? <Bar data={reportsChartData} options={chartOptions} /> : <p className="text-gray-700 text-center">Loading report data...</p>}
        </div>

        {/* Workers Area Chart */}
        <div className="flex-1 min-w-[300px] md:max-w-[48%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Workers Over Time</h2>
          {workersAreaChartData.labels ? <Line data={workersAreaChartData} options={chartOptions} /> : <p className="text-gray-700 text-center">Loading worker data...</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
