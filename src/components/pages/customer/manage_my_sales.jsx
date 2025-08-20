/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faPlus,
  faInfoCircle,
  faTimes,
  faBox,
  faMoneyBillWave,
  faUser,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import img from "../../../assets/pictures/sunflower2.jpg";
import { useTranslation } from "react-i18next";

const FarmerSalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [harvestStocks, setHarvestStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    harvest_stock: "",
    quantity_sold: "",
    unit_price: "",
    delivery_days: 7,
    notes: "",
  });
  const [filters, setFilters] = useState({
    sell_status: "",
    payment_status: "",
    searchQuery: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  useEffect(() => {
    fetchSales();
    fetchHarvestStocks();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/sales/my-sells/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("My retrieved sales: ", response.data);
      setSales(response.data.my_sells || []);
    } catch (err) {
      setError(t("sales.errors.fetchFailed"));
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHarvestStocks = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/stock/my-stocks/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHarvestStocks(response.data.stocks || []);
    } catch (err) {
      console.error("Error fetching harvest stocks:", err);
    }
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/sales/create/",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage(t("sales.messages.createSuccess"), "success");
      setIsCreateModalOpen(false);
      fetchSales();
      setFormData({
        harvest_stock: "",
        quantity_sold: "",
        unit_price: "",
        delivery_days: 7,
        notes: "",
      });
    } catch (err) {
      showMessage(
        err.response?.data?.errors.non_field_errors || t("sales.errors.createFailed"),
        "error"
      );
      console.error("Error creating sale:", err);
    }
  };

  const cancelSale = async (saleId) => {
    if (window.confirm(t("sales.confirmations.cancelSale"))) {
      try {
        await axios.delete(`http://127.0.0.1:8000/sales/delete/${saleId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showMessage(t("sales.messages.cancelSuccess"), "success");
        fetchSales();
      } catch (err) {
        showMessage(
          err.response?.data?.error || t("sales.errors.cancelFailed"),
          "error"
        );
        console.error("Error cancelling sale:", err);
      }
    }
  };

  const completeSale = async (saleId) => {
    if (
      window.confirm(t("sales.confirmations.completeSale"))
    ) {
      try {
        await axios.post(
          `http://127.0.0.1:8000/sales/complete/${saleId}/`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showMessage(t("sales.messages.completeSuccess"), "success");
        fetchSales();
      } catch (err) {
        showMessage(
          err.response?.data?.error || t("sales.errors.completeFailed"),
          "error"
        );
        console.error("Error completing sale:", err);
      }
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch = [
        sale.id?.toString(),
        sale.quantity_sold?.toString(),
        sale.unit_price?.toString(),
        sale.total_amount?.toString(),
        sale.buyer?.phone_number || "",
      ].some((field) =>
        field?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );

      const matchesStatus =
        !filters.sell_status || sale.sell_status === filters.sell_status;
      const matchesPayment =
        !filters.payment_status ||
        sale.payment_status === filters.payment_status;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [sales, filters]);

  const SaleStatusBadge = ({ status }) => {
    const statusMap = {
      posted: { color: "bg-blue-600", text: t("sales.status.posted"), icon: faBox },
      purchased: { color: "bg-purple-600", text: t("sales.status.purchased"), icon: faUser },
      completed: {
        color: "bg-green-600",
        text: t("sales.status.completed"),
        icon: faCheckCircle,
      },
      cancelled: {
        color: "bg-red-600",
        text: t("sales.status.cancelled"),
        icon: faTimesCircle,
      },
    };
    const statusInfo = statusMap[status] || statusMap.posted;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs flex items-center ${statusInfo.color} text-white`}
      >
        <FontAwesomeIcon icon={statusInfo.icon} className="mr-1" />
        {statusInfo.text}
      </span>
    );
  };

  const PaymentStatusBadge = ({ status }) => {
    const statusMap = {
      unpaid: { color: "bg-red-600", text: t("sales.payment.unpaid"), icon: faTimesCircle },
      partial: { color: "bg-yellow-600", text: t("sales.payment.partial"), icon: faSpinner },
      paid: { color: "bg-green-600", text: t("sales.payment.paid"), icon: faCheckCircle },
    };
    const statusInfo = statusMap[status] || statusMap.unpaid;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs flex items-center ${statusInfo.color} text-white`}
      >
        <FontAwesomeIcon icon={statusInfo.icon} className="mr-1" />
        {statusInfo.text}
      </span>
    );
  };

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 p-6 bg-yellow-900 rounded-lg shadow-lg border-b-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400 mb-2">
                {t("sales.title")}
              </h1>
              <p className="text-yellow-200">
                {t("sales.subtitle")}
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              {t("sales.buttons.newSale")}
            </button>
          </div>
        </div>

        {/* Message Notification */}
        {message && (
          <div
            className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 ${
              messageType === "success" ? "bg-green-800" : "bg-red-800"
            } text-white`}
          >
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={messageType === "success" ? faCheckCircle : faTimesCircle}
                className="mr-3"
              />
              <div>
                <p className="font-semibold">
                  {messageType === "success" ? t("common.success") : t("common.error")}
                </p>
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

        {/* Filters */}
        <div className="mb-6 p-4 bg-yellow-900 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-yellow-400" />
              </div>
              <input
                type="text"
                placeholder={t("sales.filters.searchPlaceholder")}
                className="pl-10 w-full py-2 bg-yellow-800 border border-yellow-700 rounded-lg text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters({ ...filters, searchQuery: e.target.value })
                }
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-lg text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={filters.sell_status}
                onChange={(e) =>
                  setFilters({ ...filters, sell_status: e.target.value })
                }
              >
                <option value="">{t("sales.filters.allStatuses")}</option>
                <option value="posted">{t("sales.status.posted")}</option>
                <option value="purchased">{t("sales.status.purchased")}</option>
                <option value="completed">{t("sales.status.completed")}</option>
                <option value="cancelled">{t("sales.status.cancelled")}</option>
              </select>

              <select
                className="px-3 py-2 bg-yellow-800 border border-yellow-700 rounded-lg text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={filters.payment_status}
                onChange={(e) =>
                  setFilters({ ...filters, payment_status: e.target.value })
                }
              >
                <option value="">{t("sales.filters.allPayments")}</option>
                <option value="unpaid">{t("sales.payment.unpaid")}</option>
                <option value="partial">{t("sales.payment.partial")}</option>
                <option value="paid">{t("sales.payment.paid")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-yellow-900 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-4xl text-yellow-400"
              />
              <p className="mt-4 text-yellow-200">{t("sales.loading")}</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">
              <FontAwesomeIcon icon={faTimesCircle} className="text-4xl mb-4" />
              <p>{error}</p>
              <button
                onClick={fetchSales}
                className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
              >
                {t("common.retry")}
              </button>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="p-8 text-center text-yellow-400">
              <FontAwesomeIcon
                icon={faMoneyBillWave}
                className="text-4xl mb-4"
              />
              <p>{t("sales.noSalesFound")}</p>
              {(filters.sell_status ||
                filters.payment_status ||
                filters.searchQuery) && (
                <button
                  onClick={() =>
                    setFilters({
                      sell_status: "",
                      payment_status: "",
                      searchQuery: "",
                    })
                  }
                  className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                >
                  {t("sales.buttons.clearFilters")}
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-yellow-700">
                <thead className="bg-yellow-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t("sales.table.saleId")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t("sales.table.stock")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t("sales.table.quantity")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t("sales.table.price")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t("sales.table.status")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t("sales.table.payment")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t("sales.table.date")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t("sales.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-yellow-900 divide-y divide-yellow-800">
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-yellow-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-yellow-200">
                        #{sale.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-yellow-300">
                          <div className="font-medium">
                            {sale.harvest_grade}
                          </div>
                          <div className="text-xs text-yellow-400">
                            {sale.harvest_location}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-yellow-200 font-medium">
                        {parseFloat(sale.quantity_sold).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-yellow-200">
                        {parseFloat(sale.unit_price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <SaleStatusBadge status={sale.sell_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PaymentStatusBadge status={sale.payment_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-yellow-200 text-sm">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/farmer/sales/${sale.id}`}
                            className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                            title={t("sales.buttons.viewDetails")}
                          >
                            <FontAwesomeIcon icon={faInfoCircle} />
                          </Link>

                          {sale.sell_status === "posted" && (
                            <button
                              onClick={() => cancelSale(sale.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                              title={t("sales.buttons.cancelSale")}
                            >
                              <FontAwesomeIcon icon={faTimesCircle} />
                            </button>
                          )}

                          {sale.sell_status === "purchased" && (
                            <button
                              onClick={() => completeSale(sale.id)}
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                              title={t("sales.buttons.markCompleted")}
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Sale Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-yellow-900 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-yellow-300">
                    {t("sales.modal.title")}
                  </h2>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <form onSubmit={handleCreateSale}>
                  <div className="mb-4">
                    <label className="block text-yellow-200 mb-2">
                      {t("sales.form.harvestStock")}
                    </label>
                    <select
                      name="harvest_stock"
                      value={formData.harvest_stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          harvest_stock: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-200"
                      required
                    >
                      <option value="">{t("sales.form.selectHarvestStock")}</option>
                      {harvestStocks.map((stock) => (
                        <option key={stock.id} value={stock.id}>
                          {t("sales.form.stockOption", { 
                            stockId: stock.id, 
                            quantity: stock.current_quantity 
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-yellow-200 mb-2">
                        {t("sales.form.quantity")}
                      </label>
                      <input
                        type="number"
                        name="quantity_sold"
                        min="0.01"
                        step="0.01"
                        value={formData.quantity_sold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity_sold: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-yellow-200 mb-2">
                        {t("sales.form.unitPrice")}
                      </label>
                      <input
                        type="number"
                        name="unit_price"
                        min="0.01"
                        step="0.01"
                        value={formData.unit_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            unit_price: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-yellow-200 mb-2">
                      {t("sales.form.deliveryDays")}
                    </label>
                    <input
                      type="number"
                      name="delivery_days"
                      min="1"
                      value={formData.delivery_days}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          delivery_days: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-200"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-yellow-200 mb-2">
                      {t("sales.form.notes")}
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full p-2 bg-yellow-800 border border-yellow-700 rounded text-yellow-200"
                      rows="3"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                      {t("sales.buttons.postSale")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerSalesManagement;