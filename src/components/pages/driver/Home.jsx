/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaFileInvoiceDollar, FaFileAlt } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function DriverHome() {
  const navigate = useNavigate();
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalReimbursements, setTotalReimbursements] = useState(0);
  const [totalPolicies, setTotalPolicies] = useState(0);
  const [expenseChartData, setExpenseChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [reimbursementChartData, setReimbursementChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [comparisonChartData, setComparisonChartData] = useState({
    labels: ['Expenses', 'Reimbursements', 'Policies'],
    datasets: [],
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Retrieved Token:', token);
  
    const fetchAllData = async () => {
      try {
        const [expensesRes, reimbursementsRes, policiesRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/expense/user/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://127.0.0.1:8000/reimbursement/user/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://127.0.0.1:8000/policy/policies/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
  
        // Process Expenses
        if (expensesRes.data && expensesRes.data.expenses) {
          console.log('Fetched Expenses Data:', expensesRes.data.expenses);
          setTotalExpenses(expensesRes.data.expenses.length);
          processExpenseChartData(expensesRes.data.expenses);
        }
  
        // Process Reimbursements
        if (reimbursementsRes.data) {
          console.log('Fetched Reimbursements Data:', reimbursementsRes.data);
          setTotalReimbursements(reimbursementsRes.data.length);
          processReimbursementChartData(reimbursementsRes.data);
        }
  
        // Process Policies
        if (policiesRes.data) {
          console.log('Fetched Policies Data:', policiesRes.data);
          setTotalPolicies(policiesRes.data.length);
        }
  
        // Update Comparison Chart Data
        const policyCount = policiesRes.data ? policiesRes.data.length : 0;
        processComparisonChartData(expensesRes.data.expenses.length, reimbursementsRes.data.length, policyCount);
      } catch (error) {
        console.error('Error fetching data:', error);
        handleAuthError(error);
      }
    };
  
    fetchAllData();
  }, []);
  
  const handleAuthError = (err) => {
    if (err.response && err.response.status === 401) {
      alert('Session expired. Please log in again.');
      navigate('/login');
    }
  };

  const processExpenseChartData = (data) => {
    const statuses = ['pending', 'approved', 'rejected'];
    const colors = {
      pending: 'rgba(255,165,0,0.2)',
      approved: 'rgba(75,192,192,0.2)',
      rejected: 'rgba(255,99,132,0.2)',
    };
    const borderColors = {
      pending: 'rgba(255,165,0,1)',
      approved: 'rgba(75,192,192,1)',
      rejected: 'rgba(255,99,132,1)',
    };

    const expensesByStatusAndDate = data.reduce((acc, expense) => {
      const status = expense.status;
      const date = new Date(expense.created_at).toLocaleDateString();
      if (!acc[status]) acc[status] = {};
      acc[status][date] = acc[status][date] ? acc[status][date] + 1 : 1;
      return acc;
    }, {});

    const labels = [...new Set(data.map((expense) => new Date(expense.created_at).toLocaleDateString()))].sort();

    const datasets = statuses.map((status) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      data: labels.map((date) => expensesByStatusAndDate[status]?.[date] || 0),
      fill: true,
      backgroundColor: colors[status],
      borderColor: borderColors[status],
      tension: 0.4,
    }));

    setExpenseChartData({ labels, datasets });
  };

  const processReimbursementChartData = (data) => {
    const statuses = ['Paid', 'Unpaid'];
    const colors = {
      Paid: 'rgba(54,162,235,0.2)',
      Unpaid: 'rgba(255,99,132,0.2)',
    };
    const borderColors = {
      Paid: 'rgba(54,162,235,1)',
      Unpaid: 'rgba(255,99,132,1)',
    };

    const reimbursementsByStatusAndDate = data.reduce((acc, reimbursement) => {
      const status = reimbursement.is_paid ? 'Paid' : 'Unpaid';
      const date = new Date(reimbursement.created_at).toLocaleDateString();
      if (!acc[status]) acc[status] = {};
      acc[status][date] = acc[status][date] ? acc[status][date] + 1 : 1;
      return acc;
    }, {});

    const labels = [...new Set(data.map((reimbursement) => new Date(reimbursement.created_at).toLocaleDateString()))].sort();

    const datasets = statuses.map((status) => ({
      label: status,
      data: labels.map((date) => reimbursementsByStatusAndDate[status]?.[date] || 0),
      fill: true,
      backgroundColor: colors[status],
      borderColor: borderColors[status],
      tension: 0.4,
    }));

    setReimbursementChartData({
      labels: labels.map(String),
      datasets: datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data.map(Number),
      })),
    });
  };

  const processComparisonChartData = (expenseCount, reimbursementCount, policyCount) => {
    setComparisonChartData({
      labels: ['Expenses', 'Reimbursements', 'Policies'],
      datasets: [
        {
          data: [expenseCount, reimbursementCount, policyCount],
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
          borderWidth: 1,
        },
      ],
    });
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      title: {
        display: true,
      },
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="mt-20 flex flex-col items-center w-full max-w-[1600px] mx-auto px-4">
      {/* Cards Container */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Total Expenses Card */}
        <div className="p-4 bg-blue-100 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <FaWallet className="text-blue-600 text-4xl mb-2" />
          <h3 className="text-xl font-semibold text-blue-800">Total Expenses</h3>
          <p className="text-2xl font-bold text-blue-900">{totalExpenses}</p>
        </div>

        {/* Total Reimbursements Card */}
        <div className="p-4 bg-green-100 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <FaFileInvoiceDollar className="text-green-600 text-4xl mb-2" />
          <h3 className="text-xl font-semibold text-green-800">Total Reimbursements</h3>
          <p className="text-2xl font-bold text-green-900">{totalReimbursements}</p>
        </div>

        {/* Total Policies Card */}
        <div className="p-4 bg-purple-100 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <FaFileAlt className="text-purple-600 text-4xl mb-2" />
          <h3 className="text-xl font-semibold text-purple-800">Total Policies</h3>
          <p className="text-2xl font-bold text-purple-900">{totalPolicies}</p>
        </div>
      </div>

      {/* Charts Container */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Expenses Over Time by Status Area Chart */}
        <div className="w-full bg-white rounded shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Expenses Over Time by Status</h2>
          <div className="h-[400px]">
            <Line 
              data={expenseChartData} 
              options={{ 
                ...chartOptions, 
                plugins: { 
                  ...chartOptions.plugins, 
                  title: { text: 'Expenses Over Time by Status' } 
                } 
              }} 
            />
          </div>
        </div>

        {/* Reimbursements Over Time by Payment Status Bar Chart */}
        <div className="w-full bg-white rounded shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Reimbursements Over Time by Payment Status</h2>
          <div className="h-[400px]">
            <Bar 
              data={reimbursementChartData} 
              options={{ 
                ...chartOptions, 
                plugins: { 
                  ...chartOptions.plugins, 
                  title: { text: 'Reimbursements Over Time by Payment Status' } 
                } 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Pie Chart Container */}
      <div className="w-full max-w-2xl mx-auto bg-white rounded shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4 text-center text-black">Comparison of Expenses, Reimbursements, and Policies</h2>
        <div className="h-[300px]">
          <Pie 
            data={comparisonChartData} 
            options={{ 
              ...chartOptions,
              plugins: { 
                ...chartOptions.plugins,
                legend: { position: 'bottom' } 
              } 
            }} 
          />
        </div>
      </div>
    </div>
  );
}

export default DriverHome;