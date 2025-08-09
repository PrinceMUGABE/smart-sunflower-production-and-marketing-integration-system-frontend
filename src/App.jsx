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
import AdminHome from "./components/pages/admin/Home.jsx";
import Users from "./components/pages/admin/Users.jsx";
import CreateUser from "./components/pages/admin/CreateNewUser.jsx";
import EditUsers from "./components/pages/admin/EditUsers.jsx";




import AdminProfile from "./components/pages/admin/AdminProfile.jsx";
import UserProfile from "./components/pages/customer/UserProfile.jsx";
import UserHome from "./components/pages/customer/Home.jsx";
// import Admin_Manage_Inventory from "./components/pages/admin/manage_inventories.jsx";
import Admin_DemandForecast from "./components/pages/admin/manage_demandForecast.jsx";
import Admin_Manage_Drivers from "./components/pages/admin/manage_drivers.jsx";
import Customer_Layout from "./components/customer/Layout.jsx";
import Admin_Manage_Relocations from "./components/pages/admin/manage_relocations.jsx";
import Admin_Create_Relocation from "./components/pages/admin/create_relocation.jsx";
import Admin_Manage_Feedbacks from "./components/pages/admin/manage_feedbacks.jsx";
import Customer_Manage_Feedbacks from "./components/pages/customer/manage_feedbacks.jsx";
import Datasets from "./components/pages/admin/manage_datasets.jsx";
import Farmer_Manage_predictions from "./components/pages/customer/create_relocation.jsx";
import Admin_Manage_SunflowerHarvests from "./components/pages/admin/Admin_Manage_Sunflowers.jsx";
import Farmer_Manage_Stocks from './components/pages/customer/My_Harvest.jsx';
import Farmer_StockMovementManagement from "./components/pages/customer/My_Stock_Movements.jsx";
import Admin_Manage_Stocks from "./components/pages/admin/Manage_Stocks.jsx";
import StockMovementManagement from "./components/pages/admin/Stock_Movements.jsx";
import FarmerSalesManagement from "./components/pages/customer/manage_my_sales.jsx";
import SaleDetailView from "./components/pages/customer/sale_details_page.jsx";
import EditSaleView from "./components/pages/customer/edit_sale_deteil_page.jsx";
import Manage_Sales from "./components/pages/admin/manage_sales.jsx";
import Admin_SaleDetailView from "./components/pages/admin/sale_details_page.jsx";
import Officer_Layout from "./components/officer/Layout.jsx";
import Officer_Home from "./components/pages/officer/Home.jsx";
import Officer_Manage_Stocks from "./components/pages/officer/manage_stocks.jsx";
import Officer_Manage_Sales from "./components/pages/officer/manage_sales.jsx";
import Officer_Manage_Feedbacks from "./components/pages/officer/manage_feedbacks.jsx";
import Officer_SaleDetailView from "./components/pages/officer/sale_details.jsx";
import OfficerProfile from "./components/pages/officer/officer_profile.jsx";
import Officer_StockMovementManagement from "./components/pages/officer/stock_movements.jsx";
import Officer_Datasets from "./components/pages/officer/maanage_datasets.jsx";
import Officer_Manage_predictions from "./components/pages/officer/manage_predictions.jsx";





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
            <Route path="/admin/createUser" element={<CreateUser />} />

            <Route path="/admin/datasets" element={<Datasets />} />
            <Route path="/admin/predictions" element={<Admin_Manage_Relocations />} />
            <Route path="/admin/createRelocation" element={<Admin_Create_Relocation />} />


            <Route path="/admin/drivers" element={<Admin_Manage_Drivers />} />
            <Route path="/admin/harvest" element={<Admin_Manage_SunflowerHarvests />} />
            <Route path="/admin/feedbacks" element={<Admin_Manage_Feedbacks />} />
            <Route path="/admin/weather" element={<Admin_DemandForecast />} />
            <Route path="/admin/profile/:id" element={<AdminProfile />} />
            <Route path="/admin/sales" element={<Manage_Sales />} />
            <Route path="/admin/sales/:saleId" element={<Admin_SaleDetailView />} />


            <Route path="/admin/stock" element={<Admin_Manage_Stocks />} />
            <Route path="/admin/stocks/:stockId/movements" element={<StockMovementManagement />} />


            

          </Route>


          {/* user */}

          <Route path="/farmer" element={<Customer_Layout />}>
            <Route index element={<UserHome />} />
            <Route path="/farmer/predictions" element={<Farmer_Manage_predictions />} />
            <Route path="/farmer/feedbacks" element={<Customer_Manage_Feedbacks />} />
            <Route path="/farmer/stock" element={<Farmer_Manage_Stocks />} />
            <Route path="/farmer/sales" element={<FarmerSalesManagement />} />
            <Route path="/farmer/sales/:saleId" element={<SaleDetailView />} />
            <Route path="/farmer/sales/edit/:saleId" element={<EditSaleView />} />
            <Route path="/farmer/stocks/:stockId/movements" element={<Farmer_StockMovementManagement />} />

            <Route path="/farmer/profile/:id" element={<UserProfile />} />
     
          </Route>



          <Route path="/officer" element={<Officer_Layout />}>
            <Route index element={<Officer_Home />} />
            <Route path="/officer/sales" element={<Officer_Manage_Sales />} />
            <Route path="/officer/stocks" element={<Officer_Manage_Stocks />} />
            <Route path="/officer/feedbacks" element={<Officer_Manage_Feedbacks />} />
            <Route path="/officer/sales/:saleId" element={<Officer_SaleDetailView />} />
            <Route path="/officer/stocks/:stockId/movements" element={<Officer_StockMovementManagement />} />
            <Route path="/officer/datasets" element={<Officer_Datasets />} />
            <Route path="/officer/predictions" element={<Officer_Manage_predictions />} />

            <Route path="/officer/profile/:id" element={<OfficerProfile />} />

     
          </Route>




        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
