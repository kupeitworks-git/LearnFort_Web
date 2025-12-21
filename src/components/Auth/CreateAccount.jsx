import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {BaseUrl} from '../api/api'


// Independent Input Component (THIS FIXES YOUR ISSUE)
const InputField = ({ name, placeholder, type = "text", value, onChange }) => (
  <input
    name={name}
    placeholder={placeholder}
    type={type}
    value={value}
    onChange={onChange}
    required
    autoComplete="off"
    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
  />
);

const CreateAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    father_name: "",
    mobile: "",
    email: "",
    native_place: "",
    aadhar_number: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState("USER");
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Handle role from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const role = params.get("role") || "user";
    setActiveTab(role === "admin" ? "ADMIN" : role === "superadmin" ? "SUPER ADMIN" : "USER");
  }, [location.search]);

  // Universal change handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setToast("Passwords do not match");
      return;
    }

    let url;
    if (activeTab === "ADMIN") {
      url = `${BaseUrl}admin/register`;
    } else if (activeTab === "SUPER ADMIN") {
      url = `${BaseUrl}super-admin/register`; // Make sure this endpoint exists on your backend
    } else {
      url = `${BaseUrl}user/register`;
    }

    setIsLoading(true);
    setToast("");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          country_code: "in",
          mobile_code: "91",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast(data.error || data.message || "Registration failed");
        return;
      }

      setToast("Registered successfully!");
      setTimeout(() => navigate("/login"), 1200);
    } catch {
      setToast("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow text-white 
      ${toast.includes("success") ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast}
        </div>
      )}

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-semibold text-center text-blue-700 mb-3">
            Create Account
          </h1>

          {/* Tabs */}
          <div className="flex justify-center space-x-6 mb-6 border-b">
            {["USER", "ADMIN"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 -mb-px border-b-2 text-sm font-semibold ${
                  activeTab === tab
                    ? "border-blue-700 text-blue-700"
                    : "border-transparent text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <InputField
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
            />
            {/* <InputField
              name="father_name"
              placeholder="Father Name"
              value={form.father_name}
              onChange={handleChange}
            /> */}
            <InputField
              name="mobile"
              placeholder="Mobile Number"
              value={form.mobile}
              onChange={handleChange}
            />
            <InputField
              name="email"
              placeholder="Email Address"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            {/* <InputField
              name="native_place"
              placeholder="Native Place"
              value={form.native_place}
              onChange={handleChange}
            /> */}
            {/* <InputField
              name="aadhar_number"
              placeholder="Aadhar Number"
              value={form.aadhar_number}
              onChange={handleChange}
            />
            <InputField
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
            /> */}

            {/* Password */}
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="off"
                className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="off"
                className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FiEye size={20} /> : <FiEyeOff size={20} />}
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-700 text-white rounded-lg py-3 font-medium hover:bg-blue-800 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Registering..." : "Register Now"}
            </button>
          </form>

          <div className="text-center mt-4 text-sm">
            <button
              onClick={() => navigate("/login")}
              className="text-blue-700 hover:underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
