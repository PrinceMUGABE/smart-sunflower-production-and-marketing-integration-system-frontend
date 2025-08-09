/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faTimes,
  faCheckCircle,
  faTimesCircle,
  faBoxOpen,
  faMoneyBillWave,
  faCalendarAlt,
  faInfoCircle,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import img from "../../../assets/pictures/sunflower2.jpg";

const EditSaleView = () => {
  const { saleId } = useParams();
  const [sale, setSale] = useState(null);
  const [formData, setFormData] = useState({
    quantity_sold: "",
    unit_price: "",
    delivery_days: 7,
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSale();
  }, [saleId]);

  const fetchSale = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/sales/${saleId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSale(response.data.sell);
      setFormData({
        quantity_sold: response.data.sell.quantity_sold,
        unit_price: response.data.sell.unit_price,
        delivery_days: response.data.sell.delivery_days || 7,
        notes: response.data.sell.notes || "",
      });
    } catch (err) {
      setError("Failed to fetch sale details");
      console.error("Error fetching sale:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate quantity doesn't exceed available stock
    if (parseFloat(formData.quantity_sold) > parseFloat(sale.harvest_stock.current_quantity)) {
      showMessage("Quantity cannot exceed available stock", "error");
      return;
    }

    try {
      await axios.put(
        `http://127.0.0.1:8000/sales/update/${saleId}/`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage("Sale updated successfully", "success");
      setTimeout(() => navigate(`/farmer/sales/${saleId}`), 1500);
    } catch (err) {
      showMessage(err.response?.data?.error || "Failed to update sale", "error");
      console.error("Error updating sale:", err);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-yellow-400 mb-4" />
          <p className="text-yellow-200 text-xl">Loading sale details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="text-center">
          <FontAwesomeIcon icon={faTimesCircle} className="text-4xl text-red-400 mb-4" />
          <p className="text-yellow-200 text-xl mb-6">{error}</p>
          <button
            onClick={fetchSale}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="text-center">
          <FontAwesomeIcon icon={faTimesCircle} className="text-4xl text-red-400 mb-4" />
          <p className="text-yellow-200 text-xl">Sale not found</p>
        </div>
      </div>
    );
  }

  if (sale.sell_status !== "posted") {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="text-center max-w-md p-6 bg-yellow-900 rounded-lg shadow-lg">
          <FontAwesomeIcon icon={faInfoCircle} className="text-4xl text-yellow-400 mb-4" />
          <h2 className="text-xl font-bold text-yellow-300 mb-2">Cannot Edit Sale</h2>
          <p className="text-yellow-200 mb-6">
            Only posted sales can be edited. This sale has already been {sale.sell_status}.
          </p>
          <button
            onClick={() => navigate(`/farmer/sales/${saleId}`)}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Sale Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 p-6 bg-yellow-900 rounded-lg shadow-lg border-b-4 border-yellow-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-yellow-400 mb-2">
                Edit Sale #{sale.id}
              </h1>
              <p className="text-yellow-200">
                Update your sunflower sale details
              </p>
            </div>
            <button
              onClick={() => navigate(`/farmer/sales/${saleId}`)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Sale
            </button>
          </div>
        </div>

        {/* Message Notification */}
        {message && (
          <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 ${
            messageType === "success" ? "bg-green-800" : "bg-red-800"
          } text-white`}
          >
            <div className="flex items-center">
              <FontAwesomeIcon 
                icon={messageType === "success" ? faCheckCircle : faTimesCircle} 
                className="mr-3" 
              />
              <div>
                <p className="font-semibold">{messageType === "success" ? "Success" : "Error"}</p>
                <p className="text-sm">{message}</p>
              </div>
              <button 
                onClick={() => setMessage("")} 
                className="ml-4 text-yellow-300 hover:text-white"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        )}

        {/* Harvest Information */}
        <div className="mb-8 p-6 bg-yellow-900 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4 border-b border-yellow-700 pb-2">
            <FontAwesomeIcon icon={faBoxOpen} className="mr-2" />
            Harvest Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-300 mb-1">Quality Grade</h3>
              <p className="text-yellow-200">
                {sale.harvest_stock_info?.quality_grade || "N/A"}
              </p>
            </div>
            <div className="bg-yellow-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-300 mb-1">Available Quantity</h3>
              <p className="text-yellow-200">
                {parseFloat(sale.harvest_stock.current_quantity).toFixed(2)} kg
              </p>
            </div>
            <div className="bg-yellow-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-300 mb-1">Location</h3>
              <p className="text-yellow-200">
                {sale.harvest_stock_info?.location || "N/A"}
              </p>
            </div>
            <div className="bg-yellow-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-300 mb-1">Current Status</h3>
              <div className="flex items-center">
                <span className="px-2 py-1 rounded-full text-xs bg-blue-600 text-white">
                  {sale.sell_status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-yellow-900 p-6 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-yellow-200 mb-1">
                Quantity to Sell (kg)
              </label>
              <input
                type="number"
                name="quantity_sold"
                value={formData.quantity_sold}
                onChange={handleInputChange}
                required
                min="0.01"
                step="0.01"
                max={sale.harvest_stock.current_quantity}
                className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
              />
              <p className="text-xs text-yellow-500 mt-1">
                Max available: {parseFloat(sale.harvest_stock.current_quantity).toFixed(2)} kg
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-200 mb-1">
                Unit Price (RWF/kg)
              </label>
              <input
                type="number"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleInputChange}
                required
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-200 mb-1">
                Delivery Days
              </label>
              <input
                type="number"
                name="delivery_days"
                value={formData.delivery_days}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
              />
              <p className="text-xs text-yellow-500 mt-1">
                Days after payment for delivery
              </p>
            </div>

            <div className="flex items-end">
              <div className="w-full">
                <label className="block text-sm font-medium text-yellow-200 mb-1">
                  Estimated Total
                </label>
                <div className="px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md text-yellow-200">
                  {(
                    parseFloat(formData.quantity_sold || 0) * 
                    parseFloat(formData.unit_price || 0)
                  ).toFixed(2)} RWF
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-yellow-200 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-200"
              rows="3"
              placeholder="Any additional information about this sale..."
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/farmer/sales/${saleId}`)}
              className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-yellow-200 rounded-lg flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSaleView;