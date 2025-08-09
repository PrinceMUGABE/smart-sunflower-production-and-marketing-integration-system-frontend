/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMoneyBillWave,
  faUser,
  faCalendarAlt,
  faOilCan,
  faBoxOpen,
  faCheckCircle,
  faSeedling,
  faTint,
  faMapMarkerAlt,
  faInfoCircle,
  faTimesCircle,
  faSpinner,
  faReceipt,
  faEdit,
  faTrash,
  faEnvelope,
  faTimes,
  faClock,
  faExclamationTriangle,
  faTruck,
  faCalendarCheck,
  faCalendarTimes,

} from "@fortawesome/free-solid-svg-icons";
import img from "../../../assets/pictures/sunflower2.jpg";

const SaleDetailView = () => {
  const { saleId } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSale();
  }, [saleId]);

  const fetchSale = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/sales/${saleId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSale(response.data.sell);
    } catch (err) {
      console.error("Error fetching sale:", err);
      showToast("Failed to fetch sale details", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setMessage(message);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleCompleteSale = async () => {
    if (window.confirm("Mark this sale as completed? This will record the stock movement.")) {
      try {
        await axios.post(`http://127.0.0.1:8000/sales/complete/${saleId}/`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Sale completed successfully", "success");
        fetchSale();
      } catch (err) {
        console.error("Error completing sale:", err);
        showToast(err.response?.data?.error || "Failed to complete sale", "error");
      }
    }
  };

  const handleCancelSale = async () => {
    if (window.confirm("Are you sure you want to cancel this sale?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/sales/delete/${saleId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Sale cancelled successfully", "success");
        navigate("/farmer/sales");
      } catch (err) {
        console.error("Error cancelling sale:", err);
        showToast(err.response?.data?.error || "Failed to cancel sale", "error");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleString();
  };

  const getDeliveryStatusInfo = () => {
    if (!sale.estimated_delivery_date) return null;

    const isOverdue = sale.is_delivery_overdue;
    const daysUntil = sale.days_until_delivery;

    if (isOverdue) {
      return {
        icon: faExclamationTriangle,
        text: `Overdue by ${Math.abs(daysUntil)} day(s)`,
        className: "text-red-300 bg-red-900",
      };
    } else if (daysUntil === 0) {
      return {
        icon: faCalendarCheck,
        text: "Due today",
        className: "text-orange-300 bg-orange-900",
      };
    } else if (daysUntil > 0) {
      return {
        icon: faCalendarTimes,
        text: `Due in ${daysUntil} day(s)`,
        className: "text-blue-300 bg-blue-900",
      };
    }

    return null;
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Loading sale details...</div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-2xl">Sale not found</div>
      </div>
    );
  }

  const deliveryStatus = getDeliveryStatusInfo();

  return (
    <div
      className="p-6 min-h-screen"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6 p-6 bg-yellow-900 rounded-lg shadow-xl border-b-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-yellow-400 font-bold text-2xl mb-2">
                Sale Details #{sale.id}
              </h1>
              <p className="text-yellow-200 text-sm">
                Detailed view of your sunflower sale
              </p>
              {deliveryStatus && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs mt-2 ${deliveryStatus.className}`}>
                  <FontAwesomeIcon icon={deliveryStatus.icon} className="mr-2" />
                  {deliveryStatus.text}
                </div>
              )}
            </div>
            <Link
              to="/farmer/sales"
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Sales
            </Link>
          </div>
        </div>

        {message && (
          <div
            className={`fixed top-5 right-5 py-3 px-4 rounded-lg shadow-xl border-l-4 z-50 transition-all duration-300 transform translate-x-0 ${
              messageType === "success"
                ? "bg-green-800 text-green-100 border-green-500"
                : "bg-red-800 text-red-100 border-red-500"
            }`}
          >
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={messageType === "success" ? faCheckCircle : faTimesCircle}
                className="mr-3"
              />
              <div>
                <p className="font-medium">
                  {messageType === "success" ? "Success" : "Error"}
                </p>
                <p className="text-sm opacity-90">{message}</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4 border-b border-yellow-700 pb-2">
              <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
              Sale Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-yellow-800 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-300 mb-1">Quantity Sold</h3>
                <p className="text-2xl font-bold text-yellow-200">
                  {parseFloat(sale.quantity_sold).toFixed(2)} kg
                </p>
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-300 mb-1">Unit Price</h3>
                <p className="text-2xl font-bold text-yellow-200">
                  {parseFloat(sale.unit_price).toFixed(2)} RWF/kg
                </p>
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-300 mb-1">Total Amount</h3>
                <p className="text-2xl font-bold text-yellow-200">
                  {parseFloat(sale.total_amount).toFixed(2)} RWF
                </p>
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-300 mb-1">Amount Paid</h3>
                <p className="text-2xl font-bold text-yellow-200">
                  {parseFloat(sale.amount_paid).toFixed(2)} RWF
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-yellow-800 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-300 mb-1">Sale Status</h3>
                <div className="mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      sale.sell_status === "posted"
                        ? "bg-blue-900 text-blue-300"
                        : sale.sell_status === "purchased"
                        ? "bg-purple-900 text-purple-300"
                        : sale.sell_status === "completed"
                        ? "bg-green-900 text-green-300"
                        : "bg-red-900 text-red-300"
                    }`}
                  >
                    {sale.sell_status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-800 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-300 mb-1">Payment Status</h3>
                <div className="mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      sale.payment_status === "paid"
                        ? "bg-green-900 text-green-300"
                        : sale.payment_status === "partial"
                        ? "bg-yellow-600 text-yellow-300"
                        : "bg-red-900 text-red-300"
                    }`}
                  >
                    {sale.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-800 p-4 rounded-lg mb-6">
              <h3 className="text-sm font-medium text-yellow-300 mb-2">Buyer Information</h3>
              {sale.buyer_info ? (
                <div className="space-y-2">
                  <p className="text-yellow-200">
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    {sale.buyer_info.phone_number}
                  </p>
                  {sale.buyer_info.email && (
                    <p className="text-yellow-200">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                      {sale.buyer_info.email}
                    </p>
                  )}
                  <p className="text-yellow-200">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                    Purchased on: {formatDateTime(sale.purchased_date)}
                  </p>
                </div>
              ) : (
                <p className="text-yellow-400 italic">No buyer assigned yet</p>
              )}
            </div>

            {/* Delivery Information Section - Enhanced */}
            <div className="bg-yellow-800 p-4 rounded-lg mb-6">
              <h3 className="text-sm font-medium text-yellow-300 mb-3 flex items-center">
                <FontAwesomeIcon icon={faTruck} className="mr-2" />
                Delivery Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-yellow-400 mb-1">Delivery Days</p>
                    <p className="text-yellow-200 flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-2" />
                      {sale.delivery_days} day(s) after full payment
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-yellow-400 mb-1">Payment Completed</p>
                    <p className="text-yellow-200 flex items-center">
                      <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                      {formatDateTime(sale.payment_completed_date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-yellow-400 mb-1">Estimated Delivery Date</p>
                    <p className="text-yellow-200 flex items-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                      {formatDate(sale.estimated_delivery_date)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-yellow-400 mb-1">Delivery Address</p>
                    <p className="text-yellow-200 flex items-start">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 mt-1" />
                      <span>{sale.delivery_address || "No delivery address specified"}</span>
                    </p>
                  </div>

                  {sale.delivery_notes && (
                    <div>
                      <p className="text-xs text-yellow-400 mb-1">Delivery Notes</p>
                      <p className="text-yellow-200 flex items-start">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-2 mt-1" />
                        <span>{sale.delivery_notes}</span>
                      </p>
                    </div>
                  )}

                  {/* Delivery Status Alert */}
                  {deliveryStatus && (
                    <div className={`p-3 rounded-lg ${deliveryStatus.className} border border-opacity-50`}>
                      <p className="text-sm font-medium flex items-center">
                        <FontAwesomeIcon icon={deliveryStatus.icon} className="mr-2" />
                        Delivery Status
                      </p>
                      <p className="text-xs mt-1">{deliveryStatus.text}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Remaining Balance */}
            {sale.remaining_balance > 0 && (
              <div className="bg-red-900 p-4 rounded-lg mb-6 border border-red-700">
                <h3 className="text-sm font-medium text-red-300 mb-2">Outstanding Balance</h3>
                <p className="text-2xl font-bold text-red-200">
                  {parseFloat(sale.remaining_balance).toFixed(2)} RWF
                </p>
                <p className="text-xs text-red-400 mt-1">
                  Payment required to calculate delivery date
                </p>
              </div>
            )}
          </div>

          <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4 border-b border-yellow-700 pb-2">
              <FontAwesomeIcon icon={faBoxOpen} className="mr-2" />
              Harvest Information
            </h2>

            <div className="bg-yellow-800 p-4 rounded-lg mb-4">
              <h3 className="text-sm font-medium text-yellow-300 mb-2">Harvest Details</h3>
              <div className="space-y-2">
                <p className="text-yellow-200">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  Harvest Date: {formatDate(sale.harvest_info?.harvest_date)}
                </p>
                <p className="text-yellow-200">
                  <FontAwesomeIcon icon={faSeedling} className="mr-2" />
                  Quality Grade: {sale.harvest_info?.quality_grade}
                </p>
                <p className="text-yellow-200">
                  <FontAwesomeIcon icon={faTint} className="mr-2" />
                  Moisture Content: {sale.harvest_info?.moisture_content}%
                </p>
                <p className="text-yellow-200">
                  <FontAwesomeIcon icon={faOilCan} className="mr-2" />
                  Oil Content: {sale.harvest_info?.oil_content}%
                </p>
              </div>
            </div>

            <div className="bg-yellow-800 p-4 rounded-lg mb-4">
              <h3 className="text-sm font-medium text-yellow-300 mb-2">Location</h3>
              <p className="text-yellow-200">
                {sale.harvest_info?.location}
              </p>
            </div>

            <div className="bg-yellow-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-300 mb-2">Stock Information</h3>
              <p className="text-yellow-200">
                Current Quantity: {parseFloat(sale.harvest_stock_info?.current_quantity || 0).toFixed(2)} kg
              </p>
              <p className="text-yellow-200">
                Last Updated: {formatDateTime(sale.updated_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-900 p-6 rounded-lg shadow-lg border border-yellow-800">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4 border-b border-yellow-700 pb-2">
            <FontAwesomeIcon icon={faReceipt} className="mr-2" />
            Payment History
          </h2>

          {sale.payments && sale.payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-yellow-800 text-yellow-300">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount (RWF)</th>
                    <th className="px-6 py-3">Method</th>
                    <th className="px-6 py-3">Reference</th>
                    <th className="px-6 py-3">Paid By</th>
                    <th className="px-6 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.payments.map((payment) => (
                    <tr key={payment.id} className="bg-yellow-900 border-b border-yellow-800">
                      <td className="px-6 py-4 text-yellow-200">
                        {formatDate(payment.payment_date)}
                      </td>
                      <td className="px-6 py-4 font-bold text-yellow-300">
                        {parseFloat(payment.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-yellow-200 capitalize">
                        {payment.payment_method.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-yellow-200">
                        {payment.reference_number || "-"}
                      </td>
                      <td className="px-6 py-4 text-yellow-200">
                        {payment.paid_by_info?.phone_number || "-"}
                      </td>
                      <td className="px-6 py-4 text-yellow-200">
                        {payment.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-yellow-400">
              <FontAwesomeIcon icon={faReceipt} className="text-4xl mb-3" />
              <p>No payment records found for this sale</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          {sale.sell_status === "posted" && (
            <button
              onClick={handleCancelSale}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
              Cancel Sale
            </button>
          )}

          {sale.sell_status === "purchased" && (
            <button
              onClick={handleCompleteSale}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Mark as Completed
            </button>
          )}

          <Link
            to={`/farmer/sales/edit/${sale.id}`}
            className={`px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 ${
              sale.sell_status !== "posted" ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-disabled={sale.sell_status !== "posted"}
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Edit Sale
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailView;