import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft, FiUploadCloud, FiUser, FiMapPin, FiFolderPlus,
    FiInfo, FiDollarSign, FiHash, FiCheck, FiX
} from "react-icons/fi";
import {BaseUrl} from '../../api/api'


const AddSport = () => {
    const navigate = useNavigate();

    // Form States
    const [status, setStatus] = useState(true);
    const [sportImage, setSportImage] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);
    const [sportImageFile, setSportImageFile] = useState(null);
    const [bannerImageFile, setBannerImageFile] = useState(null);
    const sportInputRef = useRef(null);
    const bannerInputRef = useRef(null);



    const [form, setForm] = useState({
        name: "",
        ground_name: "",
        actual_price_per_slot: "",
        final_price_per_slot: "",
        sport_lighting_price_half: "",
        sport_lighting_price_full: "",
        about: ""
    });

    // 🔹 Handle text inputs
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 🔹 Handle images
    const handleSportImageChange = (e) => {
        const file = e.target.files[0];
        setSportImage(URL.createObjectURL(file));
        setSportImageFile(file); // Store actual file for upload
    };

    const handleBannerImageChange = (e) => {
        const file = e.target.files[0];
        setBannerImage(URL.createObjectURL(file));
        setBannerImageFile(file);
    };

    const [toast, setToast] = useState({ message: "", type: "" });
    const [isLoading, setIsLoading] = useState(false);

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "" }), 3000);
    };

    // ⭐ SUBMIT FUNCTION WITH API
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = sessionStorage.getItem("token");

            if (!token) {
                showToast("No token found. Please login first.", "error");
                setIsLoading(false);
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("about", form.about);
            formData.append("actual_price_per_slot", form.actual_price_per_slot);
            formData.append("final_price_per_slot", form.final_price_per_slot);
            formData.append("ground_name", form.ground_name);
            formData.append("sport_lighting_price_half", form.sport_lighting_price_half);
            formData.append("sport_lighting_price_full", form.sport_lighting_price_full);
            formData.append("status", status ? "AVAILABLE" : "NOT_AVAILABLE");
            formData.append("list", "test"); // static because Postman has it

            if (sportImageFile) formData.append("image", sportImageFile);
            if (bannerImageFile) formData.append("banner", bannerImageFile);
            if (bannerImageFile) formData.append("web_banner", bannerImageFile);

            // API Call
            const res = await fetch(`${BaseUrl}sports/add`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`, // FIXED HERE
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                showToast("Sport Added Successfully!", "success");
                console.log("Response:", data);
                setTimeout(() => navigate(-1), 1500);
            } else {
                showToast(data.message || "Something went wrong!", "error");
            }

        } catch (error) {
            console.error(error);
            showToast("Error adding sport!", "error");
        } finally {
            setIsLoading(false);
        }
    };

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
                <div className="px-8 pt-6 pb-4 border-b border-gray-100">
                    <div className="px-8 pt-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            {/* Left Side: Title + Subtitle */}
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                    <FiUser className="h-6 w-6" />

                                </div>
                                <div className="ml-4">
                                    <h2 className="text-2xl font-bold text-gray-800 text-left">
                                        Sport Information
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Fill in the details below to add a new sport
                                    </p>
                                </div>
                            </div>

                            {/* Right Side: Status Toggle */}
                            <div className="flex flex-col items-end space-y-1">
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
                            <p className="text-xs text-gray-500 mt-1 text-left">Enter the name of the sport</p>

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
                            <p className="text-xs text-gray-500 mt-1 text-left">Name or number of the ground/field</p>

                        </div>

                        {/* PRICES */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 text-left">Actual Price per slot
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="actual_price_per_slot"
                                    required
                                    placeholder="2000"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-left">Standard price before any discounts</p>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 text-left">Discounted Price per Slot
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="final_price_per_slot"
                                    required
                                    placeholder="1500"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-left">Special price after discount (if any)</p>
                        </div>

                        {/* Half Ground */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <span>Half Lighting Price</span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    placeholder="e.g. 4"
                                    name="sport_lighting_price_half"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-left">Number of slots for half ground</p>
                        </div>

                        {/* Full Ground */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <span>Full Lighting Price</span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    placeholder="e.g. 8"
                                    name="sport_lighting_price_full"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-left">Number of slots for full ground</p>
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
                                required
                                onChange={handleChange}
                                placeholder="Write a detailed description about this sport, including any special rules or requirements..."
                                className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                            ></textarea>
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                <span className="font-medium">0</span>/500 characters
                            </div>
                        </div>
                    </div>


                    {/* IMAGES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        {/* SPORT IMAGE */}
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
                                        PNG, JPG, JPEG up to 5MB
                                    </p>

                                    <p className="text-xs text-gray-400 italic mt-1">
                                        Recommended sizes:<br />
                                        <span className="font-medium text-gray-600">
                                            320×120 (Sports Image) • 1200×400 (Website)
                                        </span>
                                    </p>

                                    {/* Hidden File Input */}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={sportInputRef}
                                        required
                                        className="hidden"
                                        onChange={handleSportImageChange}
                                    />


                                    {/* Button */}
                                    <button
                                        type="button"
                                        onClick={() => sportInputRef.current.click()}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 transition"
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
                                Banner Image <span className="text-blue-500">(Optional)</span>
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
                                        Recommended size: 1200×400px, JPG or PNG up to 2MB
                                    </p>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={bannerInputRef}
                                        required
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
