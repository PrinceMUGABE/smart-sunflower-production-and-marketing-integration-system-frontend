/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Phone, Mail, Lock, Eye, EyeOff, Home, ArrowLeft } from "lucide-react";
import sunflowerField from '../../assets/pictures/sunflowers1.png';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer', // Default role for sunflower system
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    const newErrors = {};

    if (!/^(078|079|072|073)\d{7}$/.test(formData.phone)) {
      newErrors.phone = t('Phone number must be 10 digits starting with 078, 079, 072, or 073.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('Please enter a valid email address.');
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = t('Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('Passwords do not match.');
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

    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/register/', formData);

      if (response.status === 201) {
        setMessage(t('Registration successful! Welcome to Sunflower Smart System.'));
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
          form: backendErrors.error || t('Registration failed. Please try again.'),
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: t('Network error. Please check your connection and try again.'),
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
          confirmPassword: t('Passwords do not match.'),
        }));
      }
    }
  };

  return (
    <section className="bg-gradient-to-b from-yellow-50 to-amber-100 min-h-screen flex items-center justify-center px-4 py-16">
      {/* Sunflower field background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${sunflowerField})` }}
      ></div>

      <div className="container mx-auto z-10 w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2">
            {t('Sunflower Smart System')}
          </h1>
          <h2 className="text-2xl font-semibold text-amber-700 mb-2">
            {t('Production & Marketing Platform')}
          </h2>
          <p className="text-amber-900 max-w-xl mx-auto">
            {t('Join our network of sunflower professionals')}
          </p>
        </div>

        <div className="mx-auto bg-white rounded-lg shadow-xl overflow-hidden border-2 border-amber-300 
                       sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
          <div className="p-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
            <h3 className="text-xl font-semibold">{t('Account Registration')}</h3>
            <p className="text-amber-100 mt-1">
              {t('Create your account to access the sunflower platform')}
            </p>
          </div>

          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            {errors.form && (
              <div className="mb-5 p-3 rounded bg-red-100 text-red-800 border border-red-200">
                {errors.form}
              </div>
            )}
            
            {message && (
              <div className="mb-5 p-3 rounded bg-green-100 text-green-800 border border-green-200">
                {message}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-amber-900 mb-2 font-medium">
                {t('Phone Number')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-amber-500" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('e.g., 0781234567')}
                  className="w-full p-3 pl-10 bg-amber-50 border border-amber-200 rounded-md text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
              {errors.phone && <p className="mt-1 text-red-600 text-sm">{errors.phone}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-amber-900 mb-2 font-medium">
                {t('Email Address')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-amber-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('your.email@example.com')}
                  className="w-full p-3 pl-10 bg-amber-50 border border-amber-200 rounded-md text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
              {errors.email && <p className="mt-1 text-red-600 text-sm">{errors.email}</p>}
            </div>

            <div className="md:flex md:space-x-4">
              <div className="mb-4 md:w-1/2">
                <label className="block text-amber-900 mb-2 font-medium">
                  {t('Password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-amber-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('Create your password')}
                    className="w-full p-3 pl-10 pr-10 bg-amber-50 border border-amber-200 rounded-md text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                </div>
                {errors.password && <p className="mt-1 text-red-600 text-sm">{errors.password}</p>}
              </div>

              <div className="mb-4 md:w-1/2">
                <label className="block text-amber-900 mb-2 font-medium">
                  {t('Confirm Password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-amber-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t('Confirm your password')}
                    className="w-full p-3 pl-10 pr-10 bg-amber-50 border border-amber-200 rounded-md text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-red-600 text-sm">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Role selection for sunflower system */}
            <div className="mb-6">
              <label className="block text-amber-900 mb-2 font-medium">
                {t('Account Type')}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`p-3 rounded-md border ${formData.role === 'farmer' ? 'bg-amber-100 border-amber-500 text-amber-800' : 'bg-white border-amber-200 text-amber-700'}`}
                  onClick={() => setFormData({...formData, role: 'farmer'})}
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    {t('Farmer')}
                  </div>
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-md border ${formData.role === 'buyer' ? 'bg-amber-100 border-amber-500 text-amber-800' : 'bg-white border-amber-200 text-amber-700'}`}
                  onClick={() => setFormData({...formData, role: 'buyer'})}
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    {t('Buyer')}
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-md hover:from-amber-600 hover:to-yellow-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  {t('Register Account')}
                </>
              )}
            </button>

            <div className="mt-5 text-center">
              <p className="text-amber-800">
                {t('Already have an account?')}{" "}
                <Link
                  to="/login"
                  className="text-amber-600 hover:text-amber-800 font-medium"
                >
                  {t('Sign in now')}
                </Link>
              </p>
            </div>

            <div className="mt-5 text-center">
              <Link
                to="/"
                className="text-amber-700 hover:text-amber-900 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('Back to Homepage')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;