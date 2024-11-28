// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout.jsx";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import VerifyPassword from "./components/auth/VerifyPassword.jsx";

import AdminHome from './components/pages/admin/Home.jsx'
import Users from './components/pages/admin/Users.jsx';
import CreateUser from './components/pages/admin/CreateNewUser.jsx'



// user

import EditUsers from "./components/pages/admin/EditUsers.jsx";
import ResetPassword from "./components/auth/ResetPassword.jsx";
import ChangePassword from "./components/auth/ChangePassword.jsx";
import Layout from "./components/admin/Layout.jsx";
import AdminManageExpenses from "./components/pages/admin/Expenses.jsx";
import AdminCreateNewExpense from "./components/pages/admin/CreateNewExpense.jsx";
import AdminEditExpense from "./components/pages/admin/EditExpense.jsx";
import AdminManage_Reimbursement from "./components/pages/admin/Reimbursements.jsx";





const App = () => {
  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in",
      delay: 100,
    });


    AOS.refresh();
  }, []);

  return (
    <div className="bg-white dark:bg-black dark:text-white text-black overflow-x-hidden">
      <BrowserRouter>
        <Routes>

          {/* Home view */}
          <Route path="/" element={<MainLayout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/verifypassword" element={<VerifyPassword />} />
          <Route path="/passwordreset"  element={<ResetPassword />} />
          <Route path="/changePassword" element={<ChangePassword />} />
    

           {/* End Home view */}

            {/* Admin */}

          <Route path="/admin" element={<Layout />} >
            <Route index element={<AdminHome />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/edituser/:id" element={<EditUsers />} />
            <Route path="/admin/createUser/" element={<CreateUser />} />

            <Route path="/admin/expenses" element={<AdminManageExpenses />} />
            <Route path="/admin/createExpense/" element={<AdminCreateNewExpense />} />
            <Route path="/admin/editExpense/:id" element={<AdminEditExpense />} />

            <Route path="/admin/reimbursements" element={<AdminManage_Reimbursement />} />


          </Route>

           {/* End of Admin route*/}


        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
