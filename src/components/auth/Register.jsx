/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Phone, Mail, Lock, Eye, EyeOff, Home, ArrowLeft } from "lucide-react";
import loginImage from '../../assets/pictures/coffee.jpg';

const Register = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    const newErrors = {};

    if (!/^(078|079|072|073)\d{7}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits starting with 078, 079, 072, or 073.';
    }

    if (formData.email === '') {
      newErrors.email = 'Enter valid email.';
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateFields();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSubmit = {
      phone: formData.phone,
      password: formData.password,
      email: formData.email,
      confirmPassword: formData.confirmPassword,
      role: "farmer",
      
    };

    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/register/', dataToSubmit);

      if (response.status === 201) {
        setMessage('Registration successful!');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const errorMessages = {};

        if (backendErrors.phone) {
          errorMessages.phone = backendErrors.phone;
        }
        if (backendErrors.password) {
          errorMessages.password = backendErrors.password;
        }
        if (backendErrors.email) {
          errorMessages.email = backendErrors.email;
        }

        setErrors((prev) => ({
          ...prev,
          ...errorMessages,
          form: backendErrors.error || 'An error occured. Please try again.',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: 'An unexpected error occured. Please try again.',
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

    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords do not match.',
        }));
      }
    }
  };

  return (
    <section className="bg-gray-800 min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background overlay with image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${loginImage})` }}
      ></div>

      {/* Container with responsive width - adjusts based on screen size */}
      <div className="container mx-auto z-10 w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Create Account
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto">
            Sign up to access our services and get started
          </p>
        </div>

        {/* Form container with responsive width */}
        <div className="mx-auto bg-gray-900 rounded-lg shadow-xl overflow-hidden 
                       sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
          <div className="p-6 bg-green-600 text-white">
            <h3 className="text-xl font-semibold">Account Registration</h3>
            <p className="text-gray-100 mt-1">Fill in your details to create an account</p>
          </div>

          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            {errors.form && (
              <div className="mb-5 p-3 rounded bg-red-900 text-green-100">
                {errors.form}
              </div>
            )}
            
            {message && (
              <div className="mb-5 p-3 rounded bg-green-900 text-green-100">
                {message}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-300 mb-2 font-medium">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., 0781234567"
                  className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
              {errors.phone && <p className="mt-1 text-green-400 text-sm">{errors.phone}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2 font-medium">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
              {errors.email && <p className="mt-1 text-green-400 text-sm">{errors.email}</p>}
            </div>

            {/* On larger screens, arrange password fields side by side */}
            <div className="md:flex md:space-x-4">
              <div className="mb-4 md:w-1/2">
                <label className="block text-gray-300 mb-2 font-medium">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create your password"
                    className="w-full p-3 pl-10 pr-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                {errors.password && <p className="mt-1 text-red-400 text-sm">{errors.password}</p>}
              </div>

              <div className="mb-4 md:w-1/2">
                <label className="block text-gray-300 mb-2 font-medium">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full p-3 pl-10 pr-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-red-400 text-sm">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Sign Up"
              )}
            </button>

            <div className="mt-5 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-green-400 hover:text-green-300">
                  Sign in now
                </Link>
              </p>
            </div>

            <div className="mt-5 text-center">
              <Link
                to="/"
                className="text-gray-400 hover:text-white flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;