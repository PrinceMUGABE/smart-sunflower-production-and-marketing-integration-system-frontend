/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import axios from "axios";
import loginImage from "../../assets/pictures/chills.jpg";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");  // Use identifier for both phone and email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(true);  // State to toggle between phone or email login

  const validatePhone = (phone) => {
    const phoneRegex = /^(078|072|079|073)\d{7}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValidLength = password.length >= 8;

    return (
      hasUpperCase &&
      hasLowerCase &&
      hasDigit &&
      hasSpecialChar &&
      isValidLength
    );
  };

  const handleIdentifierChange = (e) => {
    const newIdentifier = e.target.value;
    setIdentifier(newIdentifier);

    if (isPhoneLogin && newIdentifier && !validatePhone(newIdentifier)) {
      setError(t("Phone number must be valid."));
    } else if (!isPhoneLogin && newIdentifier && !validateEmail(newIdentifier)) {
      setError(t("Email must be a valid Gmail address."));
    } else {
      setError("");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Validate based on the login method (phone or email)
    if (isPhoneLogin && !validatePhone(identifier)) {
      setError(t("Phone number must be valid."));
      return;
    }

    if (!isPhoneLogin && !validateEmail(identifier)) {
      setError(t("Email must be a valid Gmail address."));
      return;
    }

    if (!validatePassword(password)) {
      setError(t("Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character."));
      return;
    }

    setIsLoading(true);

    axios
      .post(
        "http://127.0.0.1:8000/login/",
        { identifier, password }, // send identifier (phone/email) and password
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => {
        setIsLoading(false);

        if (res.data) {
          const user = {
            id: res.data.id,
            role: res.data.role,
            email: res.data.email,
            created_at: res.data.created_at,
            phone: res.data.phone_number,
            refresh_token: res.data.token.refresh,
            access_token: res.data.token.access,
          };

          localStorage.setItem("userData", JSON.stringify(user));
          localStorage.setItem("token", res.data.token.access);

          if (user.role.trim().toLowerCase() === "admin") {
            navigate("/admin");
          } else if (user.role.trim().toLowerCase() === "farmer") {
            navigate("/farmer");
          }
          else {
            console.log(t("Uknown role"));
            setError(t("Unknown role"));
          }
        } else {
          console.log(t("No user found"));
          setError(t("No user found"));
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error(
          t("Error during login"),
          error.response || error.message || error
        );
        setError(t("Invalid credentials"));
      });
  };

  return (
    <section className="bg-gray-800 min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background overlay with image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${loginImage})` }}
      ></div>

      {/* Updated container to be responsive on different screen sizes */}
      <div className="container mx-auto z-10">
        <div className="max-w-md mx-auto md:max-w-lg lg:max-w-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {t("Welcome Back")}
            </h2>
            <p className="text-gray-300 max-w-md mx-auto">
              {t("Signin to your account")}
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 bg-green-600 text-white">
              <h3 className="text-xl font-semibold">{t("Account Login")}</h3>
              <p className="text-gray-100 mt-1">{t("Enter credentials")}</p>
            </div>

            <form className="p-6" onSubmit={handleLogin}>
              {error && (
                <div className="mb-5 p-3 rounded bg-red-900 text-green-100">
                  {error}
                </div>
              )}

              {/* Toggle between Phone and Email */}
              <div className="mb-4 flex justify-between items-center">
                <label className="block text-gray-300 mb-2 font-medium">{t("Login with")}</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md ${isPhoneLogin ? "bg-green-600" : "bg-gray-700"}`}
                    onClick={() => setIsPhoneLogin(true)}
                  >
                    {t("Phone")}
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md ${!isPhoneLogin ? "bg-green-600" : "bg-gray-700"}`}
                    onClick={() => setIsPhoneLogin(false)}
                  >
                    {t("Email")}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">{t("Identifier")}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isPhoneLogin ? <Phone className="h-5 w-5 text-gray-400" /> : null}
                  </div>
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    placeholder={isPhoneLogin ? t("Enter phone number") : t("Enter email")}
                    className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-300 font-medium">{t("Password")}</label>
                  <Link
                    to="/passwordreset"
                    className="text-sm text-green-400 hover:text-green-300"
                  >
                    {t("Forgot password?")}
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("Enter your password")}
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
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  t("Signin")
                )}
              </button>

              <div className="mt-5 text-center">
                <p className="text-gray-400">
                  {t("Don't have account?")}{" "}
                  <Link to="/signup" className="text-green-400 hover:text-green-300">
                    {t("Sign Up")}
                  </Link>
                </p>
              </div>

              <div className="mt-5 text-center">
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("Back to Home")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;