import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft, FiAlertTriangle, FiCheck, FiInfo, FiHome,
  FiMoreVertical, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiPlusCircle,
} from "react-icons/fi";
import { BaseUrl } from "../../api/api";
import Pagination from "../../common/Pagination";

// ─── Confirmation Dialog ────────────────────────────────────────────────────
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-red-100 rounded-full mb-4">
            <FiAlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 mb-8 px-4">{message}</p>
          <div className="flex w-full space-x-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const ManageCoaching = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedSport, setSelectedSport] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showActions, setShowActions] = useState(false);
  const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 });

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // ── Fetch coaching sports ─────────────────────────────────────────────────
  const { data: queryData = { data: [], pagination: {} }, isLoading } = useQuery({
    queryKey: ["coaching_admin", currentPage],
    queryFn: async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        throw new Error("No token found");
      }
      const res = await fetch(`${BaseUrl}couching?page=${currentPage}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.message === "jwt expired") {
          sessionStorage.clear();
          navigate("/login");
          throw new Error("Session expired");
        }
        throw new Error(data.message || "Failed to fetch coaching sports");
      }
      return {
        data: data.data || [],
        pagination: data.pagination || { currentPage: 1, totalPages: 1, totalDocs: 0 },
      };
    },
    placeholderData: keepPreviousData,
  });

  const coachingData = queryData.data;
  const pagination = queryData.pagination;

  // ── Delete Mutation ───────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${BaseUrl}couching/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.message === "jwt expired") {
          sessionStorage.clear();
          navigate("/login");
          throw new Error("Session expired");
        }
        throw new Error(data.message || "Failed to delete");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching_admin"] });
      setShowDeleteDialog(false);
      setSelectedSport(null);
      showToast("Coaching sport deleted successfully!", "success");
    },
    onError: (err) => {
      showToast(err.message || "Error deleting coaching sport", "error");
      setShowDeleteDialog(false);
      setSelectedSport(null);
    },
  });

  // ── Toggle Status Mutation ────────────────────────────────────────────────
  const toggleStatusMutation = useMutation({
    mutationFn: async (id) => {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${BaseUrl}couching/${id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.message === "jwt expired") {
          sessionStorage.clear();
          navigate("/login");
          throw new Error("Session expired");
        }
        throw new Error(data.message || "Failed to toggle status");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching_admin"] });
      showToast("Status updated successfully!", "success");
    },
    onError: (err) => {
      showToast(err.message || "Error updating status", "error");
    },
  });

  // ── Action Menu ───────────────────────────────────────────────────────────
  const handleActionClick = (sport, e) => {
    e.stopPropagation();
    setSelectedSport(sport);
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 192;
    let x = rect.right - menuWidth;
    let y = rect.bottom + 5;
    if (y + 160 > window.innerHeight) y = rect.top - 160;
    setActionPosition({ x, y });
    setShowActions(true);
  };

  const handleAction = (action) => {
    setShowActions(false);
    if (action === "edit") {
      navigate("/edit-coaching", { state: { coaching: selectedSport } });
    } else if (action === "delete") {
      setShowDeleteDialog(true);
    } else if (action === "toggle") {
      toggleStatusMutation.mutate(selectedSport._id);
      setSelectedSport(null);
    }
  };

  useEffect(() => {
    const close = () => setShowActions(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white flex flex-col">
      {/* Toast */}
      {toast.message && (
        <div
          className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300
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
            onClick={() => navigate("/admin")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            Manage Coaching Sports
          </h1>
          <button
            onClick={() => navigate("/")}
            className="ml-auto p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            title="Go Home"
          >
            <FiHome className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Loading */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 font-medium">Loading coaching data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6 mx-4 sm:mx-6">
          {/* Table header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Coaching Sports List</h2>
            <button
              onClick={() => navigate("/add-coaching")}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition shadow-md"
            >
              <FiPlusCircle className="w-4 h-4" />
              Add New Coaching Sport
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Monthly (₹)</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Yearly (₹)</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coachingData.map((sport) => (
                  <tr key={sport._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm">
                      <div className="w-14 h-14 bg-gray-100 animate-pulse rounded-lg border shadow-sm overflow-hidden flex items-center justify-center">
                        {sport.image ? (
                          <img
                            src={sport.image}
                            alt={sport.name}
                            loading="lazy"
                            className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
                            onLoad={(e) => {
                              e.target.style.opacity = "1";
                              e.target.parentElement.classList.remove("animate-pulse", "bg-gray-100");
                            }}
                            onError={(e) => {
                              e.target.parentElement.classList.remove("animate-pulse");
                              e.target.parentElement.innerHTML = '<span class="text-[10px] text-gray-400">No Img</span>';
                            }}
                          />
                        ) : (
                          <span className="text-[10px] text-gray-400">No Img</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-800">{sport.name}</td>
                    <td className="py-4 px-4 text-sm text-gray-600 max-w-[200px] truncate">
                      {sport.description}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-xs line-through">₹{sport.coaching_actual_fees_month}</span>
                        <span className="font-semibold text-green-600">₹{sport.coaching_final_fees_month}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-xs line-through">₹{sport.coaching_actual_fees_year}</span>
                        <span className="font-semibold text-green-600">₹{sport.coaching_final_fees_year}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium
                          ${sport.status
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {sport.status ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-sm">
                      <button
                        onClick={(e) => handleActionClick(sport, e)}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <FiMoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {coachingData.length === 0 && (
              <p className="text-center py-10 text-gray-500">No coaching sports found.</p>
            )}
          </div>

          {!isLoading && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setSelectedSport(null); }}
        onConfirm={() => selectedSport?._id && deleteMutation.mutate(selectedSport._id)}
        title="Delete Coaching Sport"
        message={`Are you sure you want to delete "${selectedSport?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />

      {/* Action Dropdown */}
      <AnimatePresence>
        {showActions && selectedSport && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed bg-white rounded-xl shadow-xl py-2 z-50 w-48 border border-gray-100"
            style={{ top: `${actionPosition.y}px`, left: `${actionPosition.x}px` }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { label: "Edit", action: "edit", icon: FiEdit2, className: "text-gray-700" },
              {
                label: selectedSport.status ? "Deactivate" : "Activate",
                action: "toggle",
                icon: selectedSport.status ? FiXCircle : FiCheckCircle,
                className: selectedSport.status ? "text-orange-600" : "text-green-600",
              },
              { label: "Delete", action: "delete", icon: FiTrash2, className: "text-red-600" },
            ].map((item) => (
              <button
                key={item.action}
                onClick={() => handleAction(item.action)}
                className={`flex items-center w-full px-4 py-2.5 text-sm ${item.className} hover:bg-gray-50 transition-colors`}
              >
                <item.icon className="mr-3 w-4 h-4" />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageCoaching;
