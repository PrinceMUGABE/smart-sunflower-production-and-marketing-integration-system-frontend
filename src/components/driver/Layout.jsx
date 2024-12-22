/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import loginImage from "../../assets/pictures/logo.png";
import navImage from "../../assets/pictures/branches.jpg"; // Nav background image
import { Bell } from 'lucide-react';

function DriverLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsMenuOpen(false); // Close menu before logout
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/");
  };



  // Retrieve user data from local storage
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const userId = userData.id || ''; // Fallback to an empty string if no id is found

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const fetchAllData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        const [expensesRes, reimbursementsRes, policiesRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/expense/user/', { headers }).then(res => res.json()),
          fetch('http://127.0.0.1:8000/reimbursement/user/', { headers }).then(res => res.json()),
          fetch('http://127.0.0.1:8000/policy/policies/', { headers }).then(res => res.json()),
        ]);

        const today = new Date();
        
        const todayExpenses = expensesRes?.expenses?.filter(expense => 
          isSameDay(new Date(expense.created_at), today)
        ) || [];

        const todayReimbursements = reimbursementsRes?.filter(reimbursement => 
          isSameDay(new Date(reimbursement.created_at), today)
        ) || [];

        const todayPolicies = policiesRes?.filter(policy => 
          isSameDay(new Date(policy.created_at), today)
        ) || [];

        setNotifications({
          expenses: todayExpenses,
          reimbursements: todayReimbursements,
          policies: todayPolicies
        });

        setNotificationCount(todayExpenses.length + todayReimbursements.length + todayPolicies.length);

      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.status === 401) {
          handleLogout();
        }
      }
    };

    fetchAllData();

    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData?.phone) {
      setPhone(userData.phone);
    }
  }, []);


  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState({
    expenses: [],
    reimbursements: [],
    policies: []
  });
  const [notificationCount, setNotificationCount] = useState(0);
  

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  
  const handleLinkClick = (path) => {
    setIsMenuOpen(false);
    window.location.href = path;
  };

 

 
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <nav className="bg-white shadow-lg sticky top-0 z-50 p-4 flex justify-between items-center relative">
        <div className="flex items-center">
          <img
            src={loginImage}
            alt="Driver Logo"
            className="h-10 w-10 rounded-full"
          />
        </div>
        
        <button
          onClick={toggleMenu}
          className="md:hidden block text-gray-600 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        <div
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } md:flex md:flex-row md:items-center md:gap-4 md:static
          fixed left-0 top-[72px] h-full w-64 bg-green-700 shadow-lg
          flex flex-col transition-transform duration-300 ease-in-out
          md:w-auto md:shadow-none md:h-auto`}
        >
          <div className="flex flex-col w-full md:flex-row">
            <button
              onClick={() => handleLinkClick('/driver')}
              className="px-6 py-4 md:py-2 text-sm font-medium text-white hover:bg-blue-700 hover:text-gray-700 transition border-b md:border-b-0"
            >
              Home
            </button>
            <button
              onClick={() => handleLinkClick('/driver/expenses')}
              className="px-6 py-4 md:py-2 text-sm font-medium text-white hover:bg-blue-700 hover:text-gray-700 transition border-b md:border-b-0"
            >
              Expenses
            </button>
            <button
              onClick={() => handleLinkClick('/driver/reimbursements')}
              className="px-6 py-4 md:py-2 text-sm font-medium text-white hover:bg-blue-700 hover:text-gray-700 transition border-b md:border-b-0"
            >
              Reimbursement
            </button>
            <button
              onClick={() => handleLinkClick('/driver/policies')}
              className="px-6 py-4 md:py-2 text-sm font-medium text-white hover:bg-blue-700 hover:text-gray-700 transition border-b md:border-b-0"
            >
              Policy
            </button>
            <button
              onClick={() => handleLinkClick(`/driver/profile/${userId}`)}
              className="px-6 py-4 md:py-2 text-sm font-medium text-white hover:bg-blue-700 hover:text-gray-700 transition border-b md:border-b-0"
            >
              Profile
            </button>

            <button
              onClick={() => setShowNotifications(true)}
              className="px-6 py-4 md:py-2 text-sm font-medium text-white hover:bg-blue-700 hover:text-gray-700 transition relative"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="px-6 py-4 md:py-2 text-sm font-medium text-white hover:bg-blue-700 hover:text-gray-700 transition text-left"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Background image for larger screens */}
        <div
          className="absolute top-0 left-0 w-full md:h-[200px] h-[150px] bg-cover bg-center md:block hidden"
          style={{
            backgroundImage: `url(${navImage})`,
            backgroundAttachment: 'fixed',
            zIndex: -1,
          }}
        ></div>
      </nav>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-700">Today Notifications</h2>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-lg mb-2 text-blue-700">New Expenses ({notifications.expenses.length})</h3>
                {notifications.expenses.map((expense, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    {expense.category} - FRW{expense.amount}
                  </div>
                ))}
                {notifications.expenses.length === 0 && (
                  <p className="text-sm text-gray-500">No new expenses today</p>
                )}
              </div>

              {/* <div className="border-b pb-2">
                <h3 className="font-semibold text-lg mb-2 text-blue-700">New Reimbursements ({notifications.reimbursements.length})</h3>
                {notifications.reimbursements.map((reimbursement, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    Status: {reimbursement.is_paid} - FRW{reimbursement.expense.amount}
                  </div>
                ))}
                {notifications.reimbursements.length === 0 && (
                  <p className="text-sm text-gray-500">No new reimbursements today</p>
                )}
              </div> */}

              {/* <div>
                <h3 className="font-semibold text-lg mb-2">New Policies ({notifications.policies.length})</h3>
                {notifications.policies.map((policy, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    {policy.name}
                  </div>
                ))}
                {notifications.policies.length === 0 && (
                  <p className="text-sm text-gray-500">No new policies today</p>
                )}
              </div> */}
            </div>
          </div>
        </div>
      )}

<div className="flex-1 flex justify-center items-center p-6 mt-24">
        <main className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DriverLayout;
