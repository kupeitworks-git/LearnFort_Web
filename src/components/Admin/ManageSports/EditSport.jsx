import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUploadCloud, FiInfo, FiDollarSign, FiHash, FiCheck, FiX, FiMapPin, FiFolderPlus } from "react-icons/fi";
import {BaseUrl} from '../../api/api'

const EditSport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sportData = location.state?.sport;

  const [status, setStatus] = useState(true);
  const [sportImage, setSportImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [sportImageFile, setSportImageFile] = useState(null);
  const [bannerImageFile, setBannerImageFile] = useState(null);

  const sportInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    ground_name: "",
    actual_price_per_slot: "",
    final_price_per_slot: "",
    sport_lighting_price_half: "",
    sport_lighting_price_full: "",
    about: "",
  });

  const [toast, setToast] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // Pre-fill form with sport data
  useEffect(() => {
    if (sportData) {
      setFormData({
        name: sportData.name || "",
        ground_name: sportData.ground_name || "",
        actual_price_per_slot: sportData.actual_price_per_slot || "",
        final_price_per_slot: sportData.final_price_per_slot || "",
        sport_lighting_price_half: sportData.sport_lighting_price_half || "",
        sport_lighting_price_full: sportData.sport_lighting_price_full || "",
        about: sportData.about || "",
      });
      setStatus(sportData.status === "AVAILABLE");
      setSportImage(sportData.image || null);
      setBannerImage(sportData.banner || null);
    }
  }, [sportData]);

  const handleSportImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSportImage(URL.createObjectURL(file));
      setSportImageFile(file);
    }
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(URL.createObjectURL(file));
      setBannerImageFile(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

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

      const data = new FormData();
      data.append("name", formData.name);
      data.append("ground_name", formData.ground_name);
      data.append("actual_price_per_slot", formData.actual_price_per_slot);
      data.append("final_price_per_slot", formData.final_price_per_slot);
      data.append("sport_lighting_price_half", formData.sport_lighting_price_half);
      data.append("sport_lighting_price_full", formData.sport_lighting_price_full);
      data.append("about", formData.about);
      data.append("status", status ? "AVAILABLE" : "NOT_AVAILABLE");

      if (sportImageFile) data.append("image", sportImageFile);
      if (bannerImageFile) data.append("banner", bannerImageFile);
      if (bannerImageFile) data.append("web_banner", bannerImageFile);

      const res = await fetch(`${BaseUrl}sports/update/${sportData._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        showToast("Sport Updated Successfully!", "success");
        setTimeout(() => navigate("/sports"), 1500);
      } else {
        showToast(result.message || "Failed to update sport", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error updating sport", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!sportData) {
    return <div className="p-10 text-center">No sport data found. Please go back and select a sport to edit.</div>;
  }

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
      <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            Edit Sport
          </h1>
        </div>
      </header>


      {/* Form Card */}
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl mb-12 overflow-hidden border border-gray-100">
        {/* Form Header */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* Left Side - Title */}
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiFolderPlus className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-800">Edit Sport Information</h2>
              <p className="text-sm text-gray-500">
                Update the details below to modify the sport
              </p>
            </div>
          </div>

          {/* Right Side - Status Toggle */}
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

        <form className="p-8 pt-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sport Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <span>Sport Name</span>
                <span className="text-red-500 ml-1">*</span>
                <FiInfo className="ml-2 text-gray-400" size={14} />
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Football, Cricket"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFolderPlus className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter the name of the sport</p>
            </div>

            {/* Ground Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <span>Ground Name</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="ground_name"
                  value={formData.ground_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Main Field, Court 1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Name or number of the ground/field</p>
            </div>

            {/* Actual Price per Slot */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <span>Actual Price per Slot</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-medium">₹</span>
                </div>
                <input
                  type="number"
                  name="actual_price_per_slot"
                  value={formData.actual_price_per_slot}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 2000"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Standard price before any discounts</p>
            </div>

            {/* Final Price per Slot */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <span>Discounted Price per Slot</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-medium">₹</span>
                </div>
                <input
                  type="number"
                  name="final_price_per_slot"
                  value={formData.final_price_per_slot}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Special price after discount (if any)</p>
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
                  name="sport_lighting_price_half"
                  value={formData.sport_lighting_price_half}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 4"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Lighting price for half ground</p>
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
                  name="sport_lighting_price_full"
                  value={formData.sport_lighting_price_full}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 8"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Lighting price for full ground</p>
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
                value={formData.about}
                onChange={handleChange}
                required
                placeholder="Write a detailed description about this sport..."
                className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              ></textarea>
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                <span className="font-medium">{formData.about?.length || 0}</span>/500 characters
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sport Image */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sport Image
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${sportImage ? 'border-green-200 bg-green-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                }`}>
                <label className="cursor-pointer flex flex-col items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-3">
                    <FiUploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {sportImage ? 'Image Uploaded' : 'Upload Sport Image'}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {sportImage ? 'Click to change' : 'PNG, JPG, JPEG up to 5MB'}
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={sportInputRef}
                    onChange={handleSportImageChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => sportInputRef.current.click()}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    Select File
                  </button>

                  {sportImage && (
                    <div className="mt-4">
                      <img
                        src={sportImage}
                        alt="Sport"
                        className="h-24 w-24 object-cover rounded-lg shadow-sm border-2 border-white"
                      />
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Banner Image */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image
                <span className="text-blue-500 ml-1">(Optional)</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${bannerImage ? 'border-purple-200 bg-purple-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                }`}>
                <label className="cursor-pointer flex flex-col items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mb-3">
                    <FiUploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {bannerImage ? 'Banner Uploaded' : 'Upload Banner Image'}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {bannerImage ? 'Click to change' : 'Recommended size: 1200x400px'}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={bannerInputRef}
                    onChange={handleBannerImageChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => bannerInputRef.current.click()}
                    className="mt-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Select Banner
                  </button>

                  {bannerImage && (
                    <div className="mt-4 w-full">
                      <img
                        src={bannerImage}
                        alt="Banner Preview"
                        className="h-32 w-full object-cover rounded-lg shadow-sm border-2 border-white max-w-2xl"
                      />
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="md:col-span-2 flex flex-col sm:flex-row justify-between items-center mt-10 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto mb-3 sm:mb-0 px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5
                  ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Sport...
                  </span>
                ) : (
                  "Update Sport"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSport;
