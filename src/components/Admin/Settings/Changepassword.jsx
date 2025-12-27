// src/components/Admin/Settings/ChangePassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiShield,
  FiCheck,
  FiInfo,
} from "react-icons/fi";
import LearnFortLogo from "../../../images/LearnFort.png";
import { BaseUrl } from '../../api/api';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      showToast("New password and confirm password do not match", "error");
      return;
    }

    if (formData.newPassword.length < 8) {
      showToast("Password must be at least 8 characters long", "error");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      showToast("New password must be different from current password", "error");
      return;
    }

    setIsLoading(true);

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        showToast("No authentication token found. Please login again.", "error");
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${BaseUrl}user/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Password updated successfully!", "success");
        // Clear form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        // Navigate back after a short delay
        setTimeout(() => navigate(-1), 2000);
      } else {
        showToast(data.message || "Failed to update password", "error");
      }
    } catch (err) {
      // console.error(err);
      showToast("Error updating password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 ease-in-out
            ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          <div className="flex items-center space-x-2">
            {toast.type === "success" ? <FiCheck /> : <FiInfo />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-md bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-900 transition-all"
        >
          <FiArrowLeft className="mr-2" /> <span className="text-sm">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mt-6 mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={LearnFortLogo}
              alt="LearnFort Logo"
              className="w-20 h-20 object-contain drop-shadow-md"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 flex justify-center items-center gap-2">
            <FiShield className="text-blue-600" /> Change Password
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Keep your account safe with a strong password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Current Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type={show.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShow((prev) => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {show.current ? <FiEye /> : <FiEyeOff />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type={show.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShow((prev) => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {show.new ? <FiEye /> : <FiEyeOff />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters with numbers and symbols.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Confirm New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type={show.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() =>
                  setShow((prev) => ({ ...prev, confirm: !prev.confirm }))
                }
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {show.confirm ? <FiEye /> : <FiEyeOff />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:opacity-90 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              "Update Password"
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Tip: Use a mix of uppercase, lowercase, and special characters
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
