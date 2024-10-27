/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa"; // Import search icon

const CitizenCreateAppointment = () => {
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [results, setResults] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  
  const [data, setData] = useState({
    first_name: "",
    last_name: "",
    worker: "",
    service: "",
    address: "",
    details: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [materials, setMaterials] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }

    const fetchData = async () => {
      try {
        const workersRes = await fetch("http://127.0.0.1:8000/worker/workers/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const workersData = await workersRes.json();
        if (!workersRes.ok) throw new Error(workersData.message || 'Failed to fetch workers');
        setWorkers(workersData);

        const servicesRes = await fetch("http://127.0.0.1:8000/service/services/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const servicesData = await servicesRes.json();
        if (!servicesRes.ok) throw new Error(servicesData.message || 'Failed to fetch services');
        setServices(servicesData);

        const resultsRes = await fetch("http://127.0.0.1:8000/result/results/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resultsData = await resultsRes.json();
        if (!resultsRes.ok) throw new Error(resultsData.message || 'Failed to fetch results');
        setResults(resultsData);
      } catch (error) {
        setErrorMessage("Error fetching data. Please try again.");
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleServiceSearch = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }
    if (!data.service) {
      setErrorMessage("Please select a service first.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`http://127.0.0.1:8000/result/service/${data.service}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const workerData = await response.json();
      if (!response.ok) throw new Error(workerData.message || 'Failed to fetch workers');
      setFilteredWorkers(workerData);
    } catch (error) {
      setErrorMessage("Error fetching workers. Please try again.");
      console.error("Error fetching workers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("worker", data.worker);
    formData.append("service", data.service);
    formData.append("address", data.address);
    formData.append("details", data.details);

    if (materials) {
      formData.append("materials", materials);
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/appointment/create/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create appointment');
      }

      alert("Appointment created successfully");
      window.location.href = "/citizen/appointments";
    } catch (err) {
      setErrorMessage(err.message || "Error creating appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create New Appointment
        </h2>
      </div>

      {errorMessage && (
        <div className="text-red-600 text-center">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <label htmlFor="service" className="block text-sm font-medium text-gray-900">
                Select Service
              </label>
              <div className="mt-2 flex">
                <select
                  id="service"
                  name="service"
                  value={data.service || ""}
                  onChange={(e) => setData({ ...data, service: e.target.value, worker: "" })}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-gray-700"
                >
                  <option value="">Select service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleServiceSearch}
                  className="ml-2 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <FaSearch />
                </button>
              </div>
            </div>

            <div className="flex-1">
              <label htmlFor="worker" className="block text-sm font-medium text-gray-900">
                Select Worker
              </label>
              <div className="mt-2">
                <select
                  id="worker"
                  name="worker"
                  value={data.worker || ""}
                  onChange={(e) => setData({ ...data, worker: e.target.value })}
                  required
                  disabled={filteredWorkers.length === 0}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-gray-700"
                >
                  <option value="">Select worker</option>
                  {filteredWorkers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                     <span className="text-gray-700">{`${worker.first_name} ${worker.last_name} - ${worker.created_by.phone}, ${worker.address}`}</span> 
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-900">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={data.first_name || ""}
                onChange={(e) => setData({ ...data, first_name: e.target.value })}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-600 focus:border-indigo-600"
              />
            </div>

            <div className="flex-1">
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-900">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={data.last_name || ""}
                onChange={(e) => setData({ ...data, last_name: e.target.value })}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-600 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-900">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={data.address || ""}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-600 focus:border-indigo-600"
            />
          </div>

          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-900">
              Appointment Details
            </label>
            <textarea
              id="details"
              name="details"
              rows={4}
              value={data.details || ""}
              onChange={(e) => setData({ ...data, details: e.target.value })}
              required
              className="block w-full text-gray-700 rounded-md border-gray-300 shadow-sm focus:ring-indigo-600 focus:border-indigo-600"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              {loading ? "Loading..." : "Create Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CitizenCreateAppointment;
