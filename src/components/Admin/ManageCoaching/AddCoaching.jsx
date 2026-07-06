import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiUploadCloud, FiCheck, FiX, FiHome,
  FiInfo,
} from "react-icons/fi";
import { BaseUrl } from "../../api/api";

const AddCoaching = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coaching_actual_fees_month: "",
    coaching_final_fees_month: "",
    coaching_actual_fees_year: "",
    coaching_final_fees_year: "",
    status: true,
  });

  // Image states
  const [sportImage, setSportImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [webBannerImage, setWebBannerImage] = useState(null);
  const [sportImageFile, setSportImageFile] = useState(null);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [webBannerImageFile, setWebBannerImageFile] = useState(null);

  const sportInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const webBannerInputRef = useRef(null);

  const [toast, setToast] = useState({ message: "", type: "" });
  const [errors, setErrors] = useState({});

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "sport") { setSportImage(reader.result); setSportImageFile(file); }
      else if (type === "banner") { setBannerImage(reader.result); setBannerImageFile(file); }
      else if (type === "webBanner") { setWebBannerImage(reader.result); setWebBannerImageFile(file); }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type) => {
    if (type === "sport") { setSportImage(null); setSportImageFile(null); if (sportInputRef.current) sportInputRef.current.value = ""; }
    else if (type === "banner") { setBannerImage(null); setBannerImageFile(null); if (bannerInputRef.current) bannerInputRef.current.value = ""; }
    else if (type === "webBanner") { setWebBannerImage(null); setWebBannerImageFile(null); if (webBannerInputRef.current) webBannerInputRef.current.value = ""; }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.coaching_actual_fees_month) newErrors.coaching_actual_fees_month = "Required";
    if (!formData.coaching_final_fees_month) newErrors.coaching_final_fees_month = "Required";
    if (!formData.coaching_actual_fees_year) newErrors.coaching_actual_fees_year = "Required";
    if (!formData.coaching_final_fees_year) newErrors.coaching_final_fees_year = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const token = sessionStorage.getItem("token");
      if (!token) { navigate("/login"); throw new Error("No token"); }
      const res = await fetch(`${BaseUrl}couching`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.message === "jwt expired") { sessionStorage.clear(); navigate("/login"); throw new Error("Session expired"); }
        // Extract validation errors array if present
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          throw new Error(data.errors.join("\n"));
        }
        throw new Error(data.message || "Failed to create coaching sport");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching_admin"] });
      showToast("Coaching sport created successfully!", "success");
      setTimeout(() => navigate("/coaching"), 1200);
    },
    onError: (err) => showToast(err.message || "Error creating coaching sport", "error"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append("name", formData.name.trim());
    fd.append("description", formData.description.trim());
    fd.append("coaching_actual_fees_month", formData.coaching_actual_fees_month);
    fd.append("coaching_final_fees_month", formData.coaching_final_fees_month);
    fd.append("coaching_actual_fees_year", formData.coaching_actual_fees_year);
    fd.append("coaching_final_fees_year", formData.coaching_final_fees_year);
    fd.append("status", formData.status);
    if (sportImageFile) fd.append("image", sportImageFile);
    if (bannerImageFile) fd.append("banner", bannerImageFile);
    if (webBannerImageFile) fd.append("web_banner", webBannerImageFile);

    createMutation.mutate(fd);
  };

  // ── Image Upload Box ──────────────────────────────────────────────────────
  const ImageUploadBox = ({ label, preview, inputRef, onFileChange, onRemove, type }) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div
        className="relative w-full h-40 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden group"
        onClick={() => !preview && inputRef.current?.click()}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover rounded-xl" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(type); }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiX className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <FiUploadCloud className="w-8 h-8 mb-2 text-blue-400" />
            <span className="text-xs text-center px-2">Click to upload<br />(JPEG, PNG, GIF · max 3MB)</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
        onChange={(e) => onFileChange(e, type)}
      />
    </div>
  );

  // ── Fee Input Pair ────────────────────────────────────────────────────────
  const FeePair = ({ label, actualKey, finalKey }) => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} — Actual (₹) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
          <input
            type="number"
            name={actualKey}
            value={formData[actualKey]}
            onChange={handleInputChange}
            placeholder="0"
            className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition
              ${errors[actualKey] ? "border-red-400" : "border-gray-300"}`}
          />
        </div>
        {errors[actualKey] && <p className="text-red-500 text-xs mt-1">{errors[actualKey]}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} — Final (₹) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
          <input
            type="number"
            name={finalKey}
            value={formData[finalKey]}
            onChange={handleInputChange}
            placeholder="0"
            className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition
              ${errors[finalKey] ? "border-red-400" : "border-gray-300"}`}
          />
        </div>
        {errors[finalKey] && <p className="text-red-500 text-xs mt-1">{errors[finalKey]}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white flex flex-col">
      {/* Toast */}
      {toast.message && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300
          ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          <div className="flex items-center space-x-2">
            {toast.type === "success" ? <FiCheck /> : <FiInfo />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate("/coaching")} className="p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">Add Coaching Sport</h1>
          <button onClick={() => navigate("/")} className="ml-auto p-2 rounded-full bg-white/10 hover:bg-white/20 transition" title="Go Home">
            <FiHome className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-3xl mx-auto w-full px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coaching Sport Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Cricket Coaching"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                ${errors.name ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe the coaching program..."
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none
                ${errors.description ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Fees */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide border-b pb-2">Coaching Fees</h3>
            <FeePair
              label="Monthly"
              actualKey="coaching_actual_fees_month"
              finalKey="coaching_final_fees_month"
            />
            <FeePair
              label="Yearly"
              actualKey="coaching_actual_fees_year"
              finalKey="coaching_final_fees_year"
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, status: !p.status }))}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none
                ${formData.status ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300
                  ${formData.status ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
            <span className={`ml-3 text-sm font-medium ${formData.status ? "text-blue-600" : "text-gray-500"}`}>
              {formData.status ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide border-b pb-2">Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ImageUploadBox
                label="Sport Image"
                preview={sportImage}
                inputRef={sportInputRef}
                onFileChange={handleImageChange}
                onRemove={removeImage}
                type="sport"
              />
              <ImageUploadBox
                label="Banner (Mobile)"
                preview={bannerImage}
                inputRef={bannerInputRef}
                onFileChange={handleImageChange}
                onRemove={removeImage}
                type="banner"
              />
              <ImageUploadBox
                label="Web Banner"
                preview={webBannerImage}
                inputRef={webBannerInputRef}
                onFileChange={handleImageChange}
                onRemove={removeImage}
                type="webBanner"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/coaching")}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  Create Coaching Sport
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCoaching;
