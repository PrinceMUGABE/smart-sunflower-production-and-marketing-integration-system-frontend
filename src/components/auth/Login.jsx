/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import axios from "axios";
import sunflowerField from "../../assets/pictures/sunflower3.png";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(true);

  const validatePhone = (phone) => {
    const phoneRegex = /^(078|072|079|073)\d{7}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
      setError(t("Please enter a valid email address."));
    } else {
      setError("");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (isPhoneLogin && !validatePhone(identifier)) {
      setError(t("Phone number must be valid."));
      return;
    }

    if (!isPhoneLogin && !validateEmail(identifier)) {
      setError(t("Please enter a valid email address."));
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
        { identifier, password },
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
            navigate("/farmer/predictions");
          } else if (user.role.trim().toLowerCase() === "minagri_officer") {
            navigate("/officer");
          } else if (user.role.trim().toLowerCase() === "processor") {
            navigate("/processor/operations");
          } else {
            setError(t("Unknown user role"));
          }
        } else {
          setError(t("No user found"));
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Login error:", error);
        setError(t("Invalid credentials. Please try again."));
      });
  };

  return (
    <section className="bg-gradient-to-b from-yellow-50 to-amber-100 min-h-screen flex items-center justify-center px-4 py-16">
      {/* Sunflower field background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${sunflowerField})` }}
      ></div>

      <div className="container mx-auto z-10">
        <div className="max-w-md mx-auto md:max-w-lg lg:max-w-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-800 mb-2">
              {t("Sunflower Smart System")}
            </h1>
            <h2 className="text-2xl font-semibold text-amber-700 mb-2">
              {t("Production & Marketing Platform")}
            </h2>
            <p className="text-amber-900 max-w-md mx-auto">
              {t("Login to manage your sunflower operations")}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-amber-300">
            <div className="p-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
              <h3 className="text-xl font-semibold">{t("System Login")}</h3>
              <p className="text-amber-100 mt-1">
                {t("Access your production and marketing dashboard")}
              </p>
            </div>

            <form className="p-6" onSubmit={handleLogin}>
              {error && (
                <div className="mb-5 p-3 rounded bg-red-100 text-red-800 border border-red-200">
                  {error}
                </div>
              )}

              <div className="mb-4 flex justify-between items-center">
                <label className="block text-amber-900 mb-2 font-medium">
                  {t("Login with")}
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md ${isPhoneLogin ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-800"}`}
                    onClick={() => setIsPhoneLogin(true)}
                  >
                    {t("Phone")}
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md ${!isPhoneLogin ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-800"}`}
                    onClick={() => setIsPhoneLogin(false)}
                  >
                    {t("Email")}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-amber-900 mb-2 font-medium">
                  {isPhoneLogin ? t("Phone Number") : t("Email Address")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isPhoneLogin ? (
                      <Phone className="h-5 w-5 text-amber-500" />
                    ) : (
                      <svg
                        className="h-5 w-5 text-amber-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    placeholder={
                      isPhoneLogin
                        ? t("e.g., 0781234567")
                        : t("your@email.com")
                    }
                    className="w-full p-3 pl-10 bg-amber-50 border border-amber-200 rounded-md text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-amber-900 font-medium">
                    {t("Password")}
                  </label>
                  <Link
                    to="/passwordreset"
                    className="text-sm text-amber-600 hover:text-amber-800"
                  >
                    {t("Forgot password?")}
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-amber-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("Enter your password")}
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
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full p-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-md hover:from-amber-600 hover:to-yellow-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      ></path>
                    </svg>
                    {t("Sign In")}
                  </>
                )}
              </button>

              <div className="mt-5 text-center">
                <p className="text-amber-800">
                  {t("New to Sunflower Smart System?")}{" "}
                  <Link
                    to="/signup"
                    className="text-amber-600 hover:text-amber-800 font-medium"
                  >
                    {t("Create Account")}
                  </Link>
                </p>
              </div>

              <div className="mt-5 text-center">
                <Link
                  to="/"
                  className="text-amber-700 hover:text-amber-900 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("Back to Homepage")}
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