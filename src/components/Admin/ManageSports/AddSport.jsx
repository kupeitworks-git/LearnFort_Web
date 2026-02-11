import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft, FiUploadCloud, FiUser, FiUsers, FiMapPin, FiFolderPlus,
    FiInfo, FiDollarSign, FiHash, FiCheck, FiX
} from "react-icons/fi";
import { BaseUrl } from '../../api/api'


const AddSport = () => {
    const navigate = useNavigate();

    // Form States
    const [status, setStatus] = useState(true);
    const [sportPriceType, setSportPriceType] = useState("INDIVIDUAL");
    const [sportImage, setSportImage] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);
    const [webBannerImage, setWebBannerImage] = useState(null);
    const [sportImageFile, setSportImageFile] = useState(null);
    const [bannerImageFile, setBannerImageFile] = useState(null);
    const [webBannerImageFile, setWebBannerImageFile] = useState(null);
    const sportInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    const webBannerInputRef = useRef(null);



    const [form, setForm] = useState({
        name: "",
        ground_name: "",
        actual_price_per_day: "",
        final_price_per_day: "",
        actual_price_per_day_light: "",
        final_price_per_day_light: "",
        actual_price_per_month: "",
        final_price_per_month: "",
        actual_price_per_month_light: "",
        final_price_per_month_light: "",
        actual_price_per_year: "",
        final_price_per_year: "",
        actual_price_per_year_light: "",
        final_price_per_year_light: "",
        about: ""
    });

    // 🔹 Handle text inputs
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 🔹 Image Compression Helper
    const compressImage = (file, width, height) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', 0.8);
                };
            };
        });
    };

    // 🔹 Handle images
    const handleSportImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast("Sport Image size must be below 5MB!", "error");
                e.target.value = null;
                return;
            }
            setSportImage(URL.createObjectURL(file));
            setSportImageFile(file);
        }
    };

    const handleBannerImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast("Banner Image size must be below 5MB!", "error");
                e.target.value = null;
                return;
            }
            setBannerImage(URL.createObjectURL(file));
            setBannerImageFile(file);
        }
    };

    const handleWebBannerImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast("Web Banner Image size must be below 5MB!", "error");
                e.target.value = null;
                return;
            }
            setWebBannerImage(URL.createObjectURL(file));
            setWebBannerImageFile(file);
        }
    };
    const [toast, setToast] = useState({ message: "", type: "" });
    // const [isLoading, setIsLoading] = useState(false); // Managed by mutation

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "" }), 3000);
    };

    const queryClient = useQueryClient();

    const addSportMutation = useMutation({
        mutationFn: async (formData) => {
            const token = sessionStorage.getItem("token");
            if (!token) throw new Error("No token found. Please login first.");

            const res = await fetch(`${BaseUrl}sports/add`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) {
                if (data.message === "jwt expired") {
                    sessionStorage.clear();
                    navigate("/login");
                    throw new Error("Session expired");
                }
                throw new Error(data.message || "Something went wrong!");
            }
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['sports_home'] });
            queryClient.invalidateQueries({ queryKey: ['sports_booking'] });
            queryClient.invalidateQueries({ queryKey: ['sports_admin'] });
            showToast("Sport Added Successfully!", "success");
            setTimeout(() => navigate("/sports", { replace: true }), 1500);
        },
        onError: (error) => {
            showToast(error.message || "Error adding sport!", "error");
        }
    });

    // ⭐ SUBMIT FUNCTION WITH API
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!sportImageFile) {
            showToast("Sport Image is required!", "error");
            return;
        }
        if (!bannerImageFile) {
            showToast("Banner Image is required!", "error");
            return;
        }
        if (!webBannerImageFile) {
            showToast("Web Banner Image is required!", "error");
            return;
        }
        const token = sessionStorage.getItem("token");
        if (!token) {
            showToast("No token found. Please login first.", "error");
            return;
        }

        // Create FormData
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("about", form.about);
        formData.append("actual_price_per_day", form.actual_price_per_day);
        formData.append("final_price_per_day", form.final_price_per_day);
        formData.append("ground_name", form.ground_name);
        formData.append("actual_price_per_day_light", form.actual_price_per_day_light);
        formData.append("final_price_per_day_light", form.final_price_per_day_light);
        formData.append("actual_price_per_month", form.actual_price_per_month);
        formData.append("final_price_per_month", form.final_price_per_month);
        formData.append("actual_price_per_month_light", form.final_price_per_month_light);
        formData.append("final_price_per_month_light", form.final_price_per_month_light);
        formData.append("actual_price_per_year", form.actual_price_per_year);
        formData.append("final_price_per_year", form.final_price_per_year);
        formData.append("actual_price_per_year_light", form.actual_price_per_year_light);
        formData.append("final_price_per_year_light", form.final_price_per_year_light);
        formData.append("status", status ? "AVAILABLE" : "NOT_AVAILABLE");
        formData.append("sport_price_type", sportPriceType);
        formData.append("list", "test");

        if (sportImageFile) formData.append("image", sportImageFile);
        if (bannerImageFile) formData.append("banner", bannerImageFile);
        if (webBannerImageFile) formData.append("web_banner", webBannerImageFile);

        addSportMutation.mutate(formData);
    };

    const isLoading = addSportMutation.isPending;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
            {/* Header */}
            <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/10 mr-4 transition"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
                        Add Sports
                    </h1>
                </div>
            </header>

            {/* Form Card */}
            <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl  mb-12 overflow-hidden border border-gray-100">
                {/* Form Header */}
                <div className="px-8 pt-6 pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    {/* Left Side - Title */}
                    <div className="flex items-center mb-4 sm:mb-0">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <FiUser className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold text-gray-800">Sport Information</h2>
                            <p className="text-sm text-gray-500">
                                Fill in the details below to add a new sport
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Toggles */}
                    <div className="flex items-center space-x-6">
                        {/* Price Type Toggle */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                                Charge Type
                            </label>
                            <div className="flex items-center">
                                <div
                                    onClick={() => setSportPriceType(sportPriceType === "GROUP" ? "INDIVIDUAL" : "GROUP")}
                                    className={`relative inline-flex items-center h-8 rounded-full w-16 cursor-pointer transition-colors duration-200 ${sportPriceType === "GROUP" ? "bg-blue-500" : "bg-purple-500"
                                        }`}
                                >
                                    <span
                                        className={`inline-block w-7 h-7 transform transition-transform duration-200 rounded-full bg-white shadow-md flex items-center justify-center ${sportPriceType === "GROUP" ? "translate-x-1" : "translate-x-9"
                                            }`}
                                    >
                                        {sportPriceType === "GROUP" ? (
                                            <FiUsers className="text-blue-500" size={16} />
                                        ) : (
                                            <FiUser className="text-purple-500" size={16} />
                                        )}
                                    </span>
                                </div>
                                <span
                                    className={`ml-3 text-sm font-medium ${sportPriceType === "GROUP" ? "text-blue-600" : "text-purple-600"}`}
                                >
                                    {sportPriceType === "GROUP" ? "Group" : "Individual"}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 max-w-[150px]">
                                {sportPriceType === "GROUP" ? "Charge is for the entire group" : "Charge is per individual"}
                            </p>
                        </div>

                        {/* Status Toggle */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <div className="flex items-center">
                                <div
                                    onClick={() => setStatus(!status)}
                                    className={`relative inline-flex items-center h-8 rounded-full w-16 cursor-pointer transition-colors duration-200 ${status ? "bg-green-500" : "bg-gray-300"
                                        }`}
                                >
                                    <span
                                        className={`inline-block w-7 h-7 transform transition-transform duration-200 rounded-full bg-white shadow-md flex items-center justify-center ${status ? "translate-x-9" : "translate-x-1"
                                            }`}
                                    >
                                        {status ? (
                                            <FiCheck className="text-green-500" size={18} />
                                        ) : (
                                            <FiX className="text-gray-500" size={18} />
                                        )}
                                    </span>
                                </div>
                                <span
                                    className={`ml-3 text-sm font-medium ${status ? "text-green-600" : "text-gray-600"
                                        }`}
                                >
                                    {status ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {status
                                    ? "This sport will be visible to users"
                                    : "This sport will be hidden from users"}
                            </p>
                        </div>
                    </div>
                </div>




                {/* FORM START */}
                <form onSubmit={handleSubmit} className="p-8 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* SPORT NAME */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 flex items-center text-left">
                                <span>Sport Name</span>
                                <span className="text-red-500 ml-1">*</span>
                                <FiInfo className="ml-2 text-gray-400" size={14} />
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Football"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiFolderPlus className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            {/* <p className="text-xs text-gray-500 mt-1 text-left">Enter the name of the sport</p> */}

                        </div>

                        {/* GROUND NAME */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 text-left">Ground Name
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="ground_name"
                                    required
                                    placeholder="Main Field"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMapPin className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                        </div>

                        {/* Actual Price per day */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 text-left">Actual Charge per day
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="actual_price_per_day"
                                    required
                                    placeholder="2000"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 text-left">Final Charge per day
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="final_price_per_day"
                                    required
                                    placeholder="1500"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                            </div>
                        </div>

                        {/* Actual Lighting Price Per Day */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <span>Actual Charge Per Day (Lighting)</span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    placeholder="199"
                                    name="actual_price_per_day_light"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Final Lighting Price Per Day */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <span>Final Charge Per Day (Lighting)</span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    placeholder="652"
                                    name="final_price_per_day_light"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* price per month  */}

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <span>Actual Charge Per Month</span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    placeholder="772"
                                    name="actual_price_per_month"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* final price per month */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <span>Final Charge Per Month</span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    placeholder="850"
                                    name="final_price_per_month"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/*price per month with lighting   */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <span>Actual Charge Per Month (Lighting)</span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    placeholder="5208"
                                    name="actual_price_per_month_light"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/*price per month with lighting   */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <span>Final Charge Per Month (Lighting)</span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    placeholder="4008"
                                    name="final_price_per_month_light"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* price per year */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <span>Actual Charge Per Year</span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    placeholder="800"
                                    name="actual_price_per_year"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* final price per year */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <span>Final Charge Per Year</span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    placeholder="800"
                                    name="final_price_per_year"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/*Actual price per year with lighting  */}

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <span>Actual Charge Per Year (Lighting)</span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    placeholder="1800"
                                    name="actual_price_per_year_light"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* final price per year with lighting  */}

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <span>Final Charge Per Year (Lighting)</span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    placeholder="1400"
                                    name="final_price_per_year_light"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* About Sport */}
                    <div className="mt-8 mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <span>About Sport</span>
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                            <textarea
                                rows="4"
                                name="about"
                                value={form.about}
                                required
                                onChange={handleChange}
                                placeholder="Write a detailed description about this sport, including any special rules or requirements..."
                                className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                            ></textarea>
                            {/* <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                <span className="font-medium">0</span>/500 characters
                            </div> */}
                        </div>
                    </div>


                    {/* IMAGES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        {/* SPORT IMAGE */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sport Image <span className="text-red-500">*</span>
                            </label>

                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${sportImage ? "border-green-300 bg-green-50" : "border-blue-300 bg-white"
                                    }`}
                            >
                                <label className="cursor-pointer flex flex-col items-center">
                                    {/* Icon */}
                                    <div className="p-4 rounded-full bg-blue-100 text-blue-600 mb-3">
                                        <FiUploadCloud className="w-7 h-7" />
                                    </div>

                                    {/* Text */}
                                    <p className="text-sm font-medium text-gray-800">
                                        Upload Sport Image
                                    </p>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Recommended size: 150×150px, JPG or PNG up to 3MB
                                    </p>

                                    {/* Hidden File Input */}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={sportInputRef}
                                        className="hidden"
                                        onChange={handleSportImageChange}
                                    />


                                    {/* Button */}
                                    <button
                                        type="button"
                                        onClick={() => sportInputRef.current.click()}
                                        className="mt-4 px-4 py-2 bg-white border border-gray-300
                text-gray-700 text-sm font-medium rounded-lg shadow hover:bg-gray-100 transition"
                                    >
                                        Select File
                                    </button>


                                    {/* Preview */}
                                    {sportImage && (
                                        <img
                                            src={sportImage}
                                            alt="Sport Preview"
                                            className="mt-4 h-28 w-auto rounded-lg shadow border"
                                        />
                                    )}
                                </label>
                            </div>
                        </div>


                        {/* BANNER IMAGE */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Banner Image <span className="text-red-500">*</span>
                            </label>

                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${bannerImage ? "border-purple-300 bg-purple-50" : "border-gray-300 bg-gray-50"
                                    }`}
                            >
                                <label className="cursor-pointer flex flex-col items-center">
                                    <div className="p-4 rounded-full bg-purple-100 text-purple-600 mb-3">
                                        <FiUploadCloud className="w-7 h-7" />
                                    </div>

                                    <p className="text-sm font-medium text-gray-800">
                                        Upload Banner Image
                                    </p>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Recommended size: 1200×400px, JPG or PNG up to 3MB
                                    </p>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={bannerInputRef}
                                        className="hidden"
                                        onChange={handleBannerImageChange}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => bannerInputRef.current.click()}

                                        className="mt-4 px-4 py-2 bg-white border border-gray-300
                text-gray-700 text-sm font-medium rounded-lg shadow hover:bg-gray-100 transition"
                                    >
                                        Select Banner
                                    </button>

                                    {bannerImage && (
                                        <img
                                            src={bannerImage}
                                            alt="Banner Preview"
                                            className="mt-4 h-28 w-full object-cover rounded-lg shadow border max-w-2xl"
                                        />
                                    )}
                                </label>
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                A banner image will be displayed at the top of the sport's page
                            </p>
                        </div>


                        {/* WEB BANNER IMAGE */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Web Banner Image <span className="text-red-500">*</span>
                            </label>

                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${webBannerImage ? "border-purple-300 bg-purple-50" : "border-gray-300 bg-gray-50"
                                    }`}
                            >
                                <label className="cursor-pointer flex flex-col items-center">
                                    <div className="p-4 rounded-full bg-purple-100 text-purple-600 mb-3">
                                        <FiUploadCloud className="w-7 h-7" />
                                    </div>

                                    <p className="text-sm font-medium text-gray-800">
                                        Upload Web Banner Image
                                    </p>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Recommended size: 1200×400px, JPG or PNG up to 3MB
                                    </p>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={webBannerInputRef}
                                        className="hidden"
                                        onChange={handleWebBannerImageChange}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => webBannerInputRef.current.click()}

                                        className="mt-4 px-4 py-2 bg-white border border-gray-300
                            text-gray-700 text-sm font-medium rounded-lg shadow hover:bg-gray-100 transition"
                                    >
                                        Select Web Banner
                                    </button>

                                    {webBannerImage && (
                                        <img
                                            src={webBannerImage}
                                            alt="Web Banner Preview"
                                            className="mt-4 h-28 w-full object-cover rounded-lg shadow border max-w-2xl"
                                        />
                                    )}
                                </label>
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                A banner image will be displayed at the top of the sport's web page
                            </p>
                        </div>

                    </div>

                    {/* SUBMIT */}
                    <div className="flex justify-end mt-10">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg 
                                ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-blue-600"}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding Sport...
                                </span>
                            ) : (
                                "Add Sport"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSport;
