import React, { useEffect, useState } from "react";
import { BaseUrl } from '../api/api'

import {
    FiArrowLeft,
    FiUser,
    FiMail,
    FiPhone,
    FiHome,
    FiMapPin,
    FiCreditCard,
    FiCheck,
    FiInfo,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "" });

    const [formData, setFormData] = useState({
        name: "",
        father_name: "",
        email: "",
        native_place: "",
        aadhar_number: "",
        address: "",
    });

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "" }), 3000);
    };

    const fetchProfile = async () => {
        try {
            const token = sessionStorage.getItem("token");

            if (!token) {
                setError("No authentication token found. Please login again.");
                setLoading(false);
                return;
            }

            const res = await fetch(`${BaseUrl}user/profile`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                setUser(data.user);
                setFormData({
                    name: data.user.name || "",
                    father_name: data.user.father_name || "",
                    email: data.user.email || "",
                    native_place: data.user.native_place || "",
                    aadhar_number: data.user.aadhar_number || "",
                    address: data.user.address || "",
                });
            } else {
                setError(data.message || "Failed to fetch profile");
            }
        } catch (err) {
            console.error(err);
            setError("Error loading profile data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form data to original user data
        setFormData({
            name: user.name || "",
            father_name: user.father_name || "",
            email: user.email || "",
            native_place: user.native_place || "",
            aadhar_number: user.aadhar_number || "",
            address: user.address || "",
        });
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const token = sessionStorage.getItem("token");

            if (!token) {
                showToast("No authentication token found. Please login again.", "error");
                setIsSaving(false);
                return;
            }

            if (!user?._id) {
                showToast("User ID not found. Please refresh and try again.", "error");
                setIsSaving(false);
                return;
            }

            // Calculate changed fields
            const payload = {};
            Object.keys(formData).forEach((key) => {
                const originalValue = user[key] || "";
                const currentValue = formData[key];
                if (currentValue !== originalValue) {
                    payload[key] = currentValue;
                }
            });

            if (Object.keys(payload).length === 0) {
                showToast("No changes detected.", "info");
                setIsEditing(false);
                setIsSaving(false);
                return;
            }

            const res = await fetch(`${BaseUrl}user/update/${user._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                await fetchProfile();
                setIsEditing(false);
                showToast("Profile updated successfully!", "success");
            } else {
                showToast(data.message || "Failed to update profile", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error updating profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const displayName = user?.name || "Guest";
    const roleLabel = user?.role === "ADMIN" ? "Admin" : user?.role === "SUPER_ADMIN" ? "Super Admin" : "User";
    const mobile = user?.mobile || "-";

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-indigo-50 to-white">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-indigo-50 to-white">
                <div className="text-center">
                    <p className="text-red-600 font-medium">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-indigo-50 to-white text-gray-800 font-['Inter',sans-serif]">
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

            <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
                        Manage Profile
                    </h1>
                </div>
            </header>

            {/* Main Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl border border-blue-100 w-full max-w-2xl p-6 sm:p-8"
                >
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-blue-300 rounded-full shadow-md flex items-center justify-center">
                            <FiUser className="w-12 h-12 text-blue-700" />
                        </div>
                        <h2 className="mt-3 text-lg font-semibold text-blue-800">
                            {displayName}
                        </h2>
                        <p className="text-xs text-gray-500">{roleLabel} - LearnFort Sports Park</p>
                    </div>

                    {/* Profile Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Name */}
                        <div className="flex items-start bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-3 shadow-sm hover:shadow-md transition">
                            <div className="mt-1 mr-3 text-blue-600">
                                <FiUser className="text-blue-700" />
                            </div>
                            <div className="flex flex-col text-left w-full">
                                <span className="text-xs text-gray-500 font-medium tracking-wide">
                                    Name
                                </span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="text-sm font-semibold text-gray-800 mt-1 border-b border-blue-300 focus:outline-none focus:border-blue-600 bg-transparent"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-gray-800 mt-1">
                                        {user?.name || "-"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Father's Name */}
                        <div className="flex items-start bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-3 shadow-sm hover:shadow-md transition">
                            <div className="mt-1 mr-3 text-blue-600">
                                <FiUser className="text-blue-700" />
                            </div>
                            <div className="flex flex-col text-left w-full">
                                <span className="text-xs text-gray-500 font-medium tracking-wide">
                                    Father's Name
                                </span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="father_name"
                                        value={formData.father_name}
                                        onChange={handleInputChange}
                                        className="text-sm font-semibold text-gray-800 mt-1 border-b border-blue-300 focus:outline-none focus:border-blue-600 bg-transparent"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-gray-800 mt-1">
                                        {user?.father_name || "-"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Mobile Number (Read-only) */}
                        <div className="flex items-start bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-3 shadow-sm">
                            <div className="mt-1 mr-3 text-gray-400">
                                <FiPhone className="text-gray-500" />
                            </div>
                            <div className="flex flex-col text-left w-full">
                                <span className="text-xs text-gray-500 font-medium tracking-wide">
                                    Mobile Number
                                </span>
                                <span className="text-sm font-semibold text-gray-600 mt-1">
                                    {mobile}
                                </span>
                                {isEditing && (
                                    <span className="text-xs text-gray-400 italic mt-1">
                                        Cannot be edited
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-3 shadow-sm hover:shadow-md transition">
                            <div className="mt-1 mr-3 text-blue-600">
                                <FiMail className="text-blue-700" />
                            </div>
                            <div className="flex flex-col text-left w-full">
                                <span className="text-xs text-gray-500 font-medium tracking-wide">
                                    Email
                                </span>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="text-sm font-semibold text-gray-800 mt-1 border-b border-blue-300 focus:outline-none focus:border-blue-600 bg-transparent"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-gray-800 mt-1">
                                        {user?.email || "-"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Native Place */}
                        <div className="flex items-start bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-3 shadow-sm hover:shadow-md transition">
                            <div className="mt-1 mr-3 text-blue-600">
                                <FiMapPin className="text-blue-700" />
                            </div>
                            <div className="flex flex-col text-left w-full">
                                <span className="text-xs text-gray-500 font-medium tracking-wide">
                                    Native Place
                                </span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="native_place"
                                        value={formData.native_place}
                                        onChange={handleInputChange}
                                        className="text-sm font-semibold text-gray-800 mt-1 border-b border-blue-300 focus:outline-none focus:border-blue-600 bg-transparent"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-gray-800 mt-1">
                                        {user?.native_place || "-"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Aadhaar Number */}
                        <div className="flex items-start bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-3 shadow-sm hover:shadow-md transition">
                            <div className="mt-1 mr-3 text-blue-600">
                                <FiCreditCard className="text-blue-700" />
                            </div>
                            <div className="flex flex-col text-left w-full">
                                <span className="text-xs text-gray-500 font-medium tracking-wide">
                                    Aadhaar Number
                                </span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="aadhar_number"
                                        value={formData.aadhar_number}
                                        onChange={handleInputChange}
                                        maxLength="12"
                                        className="text-sm font-semibold text-gray-800 mt-1 border-b border-blue-300 focus:outline-none focus:border-blue-600 bg-transparent"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-gray-800 mt-1">
                                        {user?.aadhar_number || "-"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Address field spans full width */}
                        <div className="sm:col-span-2 flex items-start bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-3 shadow-sm hover:shadow-md transition text-left">
                            <div className="mt-1 mr-3 text-blue-600">
                                <FiHome className="text-blue-700" />
                            </div>
                            <div className="flex flex-col text-left w-full">
                                <span className="text-xs text-gray-500 font-medium tracking-wide">
                                    Address
                                </span>
                                {isEditing ? (
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="2"
                                        className="text-sm font-semibold text-gray-800 mt-1 border-b border-blue-300 focus:outline-none focus:border-blue-600 bg-transparent resize-none"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-gray-800 mt-1">
                                        {user?.address || "-"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center mt-8 space-x-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={isSaving}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-full shadow-md hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-medium rounded-full shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleEditClick}
                                className="px-6 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-medium rounded-full shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </motion.div>
            </main>

        </div>
    );
};

export default ProfilePage;
