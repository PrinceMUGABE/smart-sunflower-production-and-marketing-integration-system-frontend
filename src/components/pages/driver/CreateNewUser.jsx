/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const ManagerCreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    role: 'Choose Role',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    const newErrors = {};

    // Phone validation (10 digits starting with specific prefixes)
    if (!/^(078|079|072|073)\d{7}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits starting with 078, 079, 072, or 073.';
    }

    // Email validation (basic regex check)
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Role validation
    if (formData.role === 'Choose Role') {
      newErrors.role = 'You must select a role.';
    }

    return newErrors;
  };

  const token = localStorage.getItem("token"); // Retrieve the token from local storage


  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateFields();
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    const dataToSubmit = {
      phone: formData.phone,
      email: formData.email,
      role: formData.role,
    };
  
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      const response = await axios.post(
        'http://127.0.0.1:8000/register/',
        dataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );
  
      if (response.status === 201) {
        setMessage('Registration successful!');
        setTimeout(() => navigate('/manager/users'), 2000);
      }
    } catch (error) {
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const errorMessages = {};
  
        if (backendErrors.phone) {
          errorMessages.phone = backendErrors.phone;
        }
        if (backendErrors.email) {
          errorMessages.email = backendErrors.email;
        }
  
        setErrors((prev) => ({
          ...prev,
          ...errorMessages,
          form: backendErrors.error || 'An error occurred. Please try again.',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: 'An unexpected error occurred. Please try again.',
        }));
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="flex justify-center items-center rounded-lg shadow-xl w-full max-w-4xl bg-white p-8">
        <div className="w-full sm:max-w-md">
          <h2 className="mt-3 text-center text-2xl font-bold text-gray-900">Create New Driver</h2>

          {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}

          <form className="mt-8 space-y-2" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                required
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                required
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full text-gray-900 rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="Choose Role" disabled>Choose Role</option>
                {/* <option value="admin">Admin</option>
                <option value="manager">Manager</option> */}
                <option value="driver">Driver</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" /> : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagerCreateUser;
