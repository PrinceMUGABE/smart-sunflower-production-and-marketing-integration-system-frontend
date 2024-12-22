/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { useNavigate } from "react-router-dom";

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

function ManagerHome() {
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
  const [expenseChartData, setExpenseChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [reimbursementChartData, setReimbursementChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [recentReimbursements, setRecentReimbursements] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Retrieved Token:", token);

    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/manager/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.users) {
          setUserData(res.data.users);
          console.log("Fetched Users Data:", res.data.users);
          processUserChartData(res.data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        handleAuthError(error);
      }
    };

    const fetchExpenses = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/expense/manager/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.expenses) {
          console.log("Fetched Expenses Data:", res.data.expenses);
          processExpenseChartData(res.data.expenses);
          setRecentExpenses(res.data.expenses.slice(0, 5)); // Fetch 5 recent expenses
        }
      } catch (error) {
        console.error('Error fetching Expenses:', error);
        handleAuthError(error);
      }
    };

    const fetchReimbursements = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/reimbursement/manager/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data) {
          console.log("Fetched Reimbursements Data:", res.data);
          processReimbursementChartData(res.data);
          setRecentReimbursements(res.data.slice(0, 5)); // Fetch 5 recent reimbursements
        }
      } catch (error) {
        console.error('Error fetching Reimbursements:', error);
        handleAuthError(error);
      }
    };

    fetchUsers();
    fetchExpenses();
    fetchReimbursements();
  }, []);

  const handleAuthError = (err) => {
    if (err.response && err.response.status === 401) {
      alert("Session expired. Please log in again.");
      navigate("/login");
    }
  };

  const processUserChartData = (data) => {
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

    const usersByRoleAndDate = data.reduce((acc, user) => {
      const role = user.role;
      const date = new Date(user.created_at).toLocaleDateString();
      if (!acc[role]) acc[role] = {};
      acc[role][date] = acc[role][date] ? acc[role][date] + 1 : 1;
      return acc;
    }, {});

    const labels = [...new Set(data.map((user) =>
      new Date(user.created_at).toLocaleDateString()
    ))].sort();

    const areaChartDatasets = roles.map((role) => ({
      label: role.charAt(0).toUpperCase() + role.slice(1),
      data: labels.map((date) => usersByRoleAndDate[role]?.[date] || 0),
      fill: true,
      backgroundColor: colors[role],
      borderColor: borderColors[role],
      tension: 0.4,
    }));

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

    const labels = [...new Set(data.map((expense) =>
      new Date(expense.created_at).toLocaleDateString()
    ))].sort();

    const datasets = statuses.map((status) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      data: labels.map((date) => expensesByStatusAndDate[status]?.[date] || 0),
      fill: false,
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

    const labels = [...new Set(data.map((reimbursement) =>
      new Date(reimbursement.created_at).toLocaleDateString()
    ))].sort();

    const datasets = statuses.map((status) => ({
      label: status,
      data: labels.map((date) => reimbursementsByStatusAndDate[status]?.[date] || 0),
      fill: false,
      backgroundColor: colors[status],
      borderColor: borderColors[status],
      tension: 0.4,
    }));

    setReimbursementChartData({
      labels: labels.map(String),
      datasets: datasets.map(dataset => ({
        ...dataset,
        data: dataset.data.map(Number),
      })),
    });
  };

  const chartOptions = {
    responsive: true,
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
    },
  };

  return (
    <div className="mt-20 flex flex-col items-center">
      <div className="w-full flex flex-wrap justify-start gap-8">
        <div className="flex-1 min-w-[300px] md:max-w-[48%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Users Over Time</h2>
          <Line data={areaChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Users Over Time' } } }} />
        </div>

        <div className="flex-1 min-w-[200px] md:max-w-[30%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">User Distribution by Role</h2>
          <Pie data={pieChartData} options={chartOptions} />
        </div>

        <div className="flex-1 min-w-[300px] md:max-w-[48%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Expenses Over Time by Status</h2>
          <Line data={expenseChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Expenses Over Time by Status' } } }} />
        </div>

        <div className="flex-1 min-w-[300px] md:max-w-[48%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Reimbursements Over Time by Payment Status</h2>
          <Bar data={reimbursementChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Reimbursements Over Time by Payment Status' } } }} />
        </div>
      </div>

      <div className="w-full flex flex-wrap justify-start gap-8 mt-8">
        {/* Recent Expenses and Reimbursements */}
        <div className="flex-1 min-w-[300px] md:max-w-[48%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Recent Expenses</h2>
          <ul className="list-none">
          {recentExpenses.map((expense, index) => (
            <li key={index} className="mb-4 p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
              <div className="font-semibold text-gray-700">
                  
                  <span className="text-black">
                    {(expense.user.phone_number)}
                  </span>
                </div>
                <div className="font-semibold text-gray-700">
                  {/* <span>Amount: </span> */}
                  <span className="text-black">
                    {(expense.amount)}
                  </span>
                </div>
                <div className={`font-semibold ${expense.status === 'pending' ? 'text-orange-600' : expense.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                  {/* <span>Status: </span> */}
                  <span>{expense.status}</span>
                </div>
                <div className="text-green-700">
                  {/* <span>Date: </span> */}
                  <span>{new Date(expense.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        </div>

        <div className="flex-1 min-w-[300px] md:max-w-[48%] p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-black">Recent Reimbursements</h2>
          <ul>
  {recentReimbursements.map((reimbursement, index) => (
    <li key={index} className="mb-4 p-4 border-b border-gray-200 flex justify-between items-center">
      <div className="font-semibold text-gray-700">
        <span> {reimbursement.expense.user.phone_number}</span>
      </div>
      {/* Amount */}
      <div className="font-semibold text-gray-700">
        <span>{reimbursement.expense.amount}</span>
      </div>

      {/* Status */}
      <div className={`font-semibold ${reimbursement.is_paid ? 'text-green-600' : 'text-red-600'}`}>
        <span>{reimbursement.is_paid ? 'Paid' : 'Unpaid'}</span>
      </div>

      {/* Date */}
      <div className="text-green-700">
        <span>{new Date(reimbursement.created_at).toLocaleDateString()}</span>
      </div>
    </li>
  ))}
</ul>

        </div>
      </div>
    </div>
  );
}



export default ManagerHome;
