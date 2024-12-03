// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";



// Imports
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout.jsx";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import VerifyPassword from "./components/auth/VerifyPassword.jsx";
import ResetPassword from "./components/auth/ResetPassword.jsx";
import ChangePassword from "./components/auth/ChangePassword.jsx";


// Admin imports
import Layout from "./components/admin/Layout.jsx";
import AdminManageExpenses from "./components/pages/admin/Expenses.jsx";
import AdminCreateNewExpense from "./components/pages/admin/CreateNewExpense.jsx";
import AdminEditExpense from "./components/pages/admin/EditExpense.jsx";
import AdminManage_Reimbursement from "./components/pages/admin/Reimbursements.jsx";
import AdminManagePolicies from "./components/pages/admin/Policies.jsx";
import CreatePolicy from "./components/pages/admin/CreateNewPolicy.jsx";
import EditPolicy from "./components/pages/admin/EditPolicy.jsx";
import AdminHome from "./components/pages/admin/Home.jsx";
import Users from "./components/pages/admin/Users.jsx";
import CreateUser from "./components/pages/admin/CreateNewUser.jsx";
import EditUsers from "./components/pages/admin/EditUsers.jsx";

// Manager imports
import ManagerLayout from "./components/manager/Layout.jsx";
import ManagerHome from "./components/pages/manager/Home.jsx";
import ManagerUsers from "./components/pages/manager/Users.jsx";
import ManagerCreateUser from "./components/pages/manager/CreateNewUser.jsx";
import ManagerEditUser from "./components/pages/manager/EditUsers.jsx";
import ManagerExpenses from "./components/pages/manager/Expenses.jsx";
import ManagerCreateNewExpense from "./components/pages/manager/CreateNewExpense.jsx";
import ManagerEditExpense from "./components/pages/manager/EditExpense.jsx";
import Manager_Reimbursement from "./components/pages/manager/Reimbursements.jsx";
import ManagerPolicies from "./components/pages/manager/Policies.jsx";


// Driver imports
import DriverLayout from "./components/driver/Layout.jsx";
import DriverHome from "./components/pages/driver/Home.jsx";
import DriverEditUser from "./components/pages/driver/EditUsers.jsx";
import DriverCreateNewExpense from "./components/pages/driver/CreateNewExpense.jsx";
import DriverExpenses from "./components/pages/driver/Expenses.jsx";
import DriverEditExpense from "./components/pages/driver/EditExpense.jsx";
import Driver_Reimbursement from "./components/pages/driver/Reimbursements.jsx";
import DriverPolicies from "./components/pages/driver/Policies.jsx";
import DriverUsers from "./components/pages/driver/Users.jsx";
import DriverProfile from "./components/pages/driver/DriverProfile.jsx";
import AdminProfile from "./components/pages/admin/AdminProfile.jsx";
import ManagerProfile from "./components/pages/manager/ManagerProfile.jsx";

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
          <Route path="/passwordreset" element={<ResetPassword />} />
          <Route path="/changePassword" element={<ChangePassword />} />

          {/* End Home view */}

          {/* Admin */}

          <Route path="/admin" element={<Layout />}>
            <Route index element={<AdminHome />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/edituser/:id" element={<EditUsers />} />
            <Route path="/admin/createUser/" element={<CreateUser />} />

            <Route path="/admin/expenses" element={<AdminManageExpenses />} />
            <Route
              path="/admin/createExpense/"
              element={<AdminCreateNewExpense />}
            />
            <Route
              path="/admin/editExpense/:id"
              element={<AdminEditExpense />}
            />

            <Route
              path="/admin/reimbursements"
              element={<AdminManage_Reimbursement />}
            />
            <Route path="/admin/policies" element={<AdminManagePolicies />} />
            <Route path="/admin/createPolicy/" element={<CreatePolicy />} />
            <Route path="/admin/editPolicy/:id" element={<EditPolicy />} />

            <Route path="/admin/profile/:id" element={<AdminProfile />} />
          </Route>

          {/* End of Admin route*/}

          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<ManagerHome />} />
            <Route path="/manager/users" element={<ManagerUsers />} />
            <Route path="/manager/edituser/:id" element={<ManagerEditUser />} />
            <Route
              path="/manager/createUser/"
              element={<ManagerCreateUser />}
            />

            <Route path="/manager/expenses" element={<ManagerExpenses />} />
            <Route
              path="/manager/createExpense/"
              element={<ManagerCreateNewExpense />}
            />
            <Route
              path="/manager/editExpense/:id"
              element={<ManagerEditExpense />}
            />

            <Route
              path="/manager/reimbursements"
              element={<Manager_Reimbursement />}
            />
            <Route path="/manager/policies" element={<ManagerPolicies />} />
            <Route path="/manager/profile/:id" element={<ManagerProfile />} />


            {/* <Route path="/admin/createPolicy/" element={<CreatePolicy />} />
            <Route path="/admin/editPolicy/:id" element={<EditPolicy />} /> */}
          </Route>




          <Route path="/driver" element={<DriverLayout />}>
            <Route index element={<DriverHome />} />
            <Route path="/driver/users" element={<DriverUsers />} />
            <Route path="/driver/edituser/:id" element={<DriverEditUser />} />
            <Route
              path="/driver/createUser/"
              element={<DriverCreateNewExpense />}
            />

            <Route path="/driver/expenses" element={<DriverExpenses />} />
            <Route
              path="/driver/createExpense/"
              element={<DriverCreateNewExpense />}
            />
            <Route
              path="/driver/editExpense/:id"
              element={<DriverEditExpense />}
            />

            <Route
              path="/driver/reimbursements"
              element={<Driver_Reimbursement />}
            />
            <Route path="/driver/policies" element={<DriverPolicies />} />
            <Route path="/driver/profile/:id" element={<DriverProfile />} />



            {/* <Route path="/admin/createPolicy/" element={<CreatePolicy />} />
            <Route path="/admin/editPolicy/:id" element={<EditPolicy />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
