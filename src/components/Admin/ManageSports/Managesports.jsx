import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FiArrowLeft, FiAlertTriangle, FiCheck, FiInfo, FiHome, FiMoreVertical, FiEdit2, FiTrash2, FiUserX, FiCheckCircle, FiDollarSign } from "react-icons/fi";
import { BaseUrl } from '../../api/api'
import Pagination from "../../common/Pagination";


// Confirmation Popup Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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

const ManageSports = () => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  // const [sportsData, setSportsData] = useState([]); // Replaced by useQuery data
  const [selectedSport, setSelectedSport] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // const [loading, setLoading] = useState(true); // Replaced by useQuery isLoading
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const [currentPage, setCurrentPage] = useState(1);

  // Action Menu State
  const [showActions, setShowActions] = useState(false);
  const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 });
  const [currentAction, setCurrentAction] = useState(null);

  // Fetch Sports Query
  const { data: queryData = { sports: [], pagination: {} }, isLoading: loading } = useQuery({
    queryKey: ['sports_admin', currentPage],
    queryFn: async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        throw new Error("No token found");
      }

      const limit = 100; // Keeping limit 100 as per original code
      const res = await fetch(`${BaseUrl}sports/list?page=${currentPage}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.message === "jwt expired") {
          sessionStorage.clear();
          navigate("/login");
          throw new Error("Session expired");
        }
        throw new Error(data.message || "Failed to fetch sports list");
      }

      const sortedSports = [...(data.sports || [])].sort((a, b) => (b._id || '').localeCompare(a._id || ''));

      return {
        sports: sortedSports,
        pagination: data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalDocs: sortedSports.length
        }
      };
    },
    placeholderData: keepPreviousData
  });

  const sportsData = queryData.sports;
  const pagination = queryData.pagination;

  // Delete Sport Mutation
  const deleteSportMutation = useMutation({
    mutationFn: async (sportId) => {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `${BaseUrl}sports/delete/${sportId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        if (data.message === "jwt expired") {
          sessionStorage.clear();
          navigate("/login");
          throw new Error("Session expired");
        }
        throw new Error(data.message || "Failed to delete sport");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports_home'] });
      queryClient.invalidateQueries({ queryKey: ['sports_booking'] });
      queryClient.invalidateQueries({ queryKey: ['sports_admin'] });
      setShowDeleteDialog(false);
      setSelectedSport(null);
      showToast("Sport deleted successfully!", "success");
    },
    onError: (err) => {
      showToast(err.message || "Error deleting sport", "error");
      setShowDeleteDialog(false);
      setSelectedSport(null);
    }
  });

  // Update Sport Mutation (for status and price type changes)
  const updateSportMutation = useMutation({
    mutationFn: async ({ sportId, payload }) => {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${BaseUrl}sports/update/${sportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.message === "jwt expired") {
          sessionStorage.clear();
          navigate("/login");
          throw new Error("Session expired");
        }
        throw new Error(data.message || "Failed to update sport");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports_home'] });
      queryClient.invalidateQueries({ queryKey: ['sports_booking'] });
      queryClient.invalidateQueries({ queryKey: ['sports_admin'] });
      showToast("Sport updated successfully!", "success");
    },
    onError: (err) => {
      showToast(err.message || "Error updating sport", "error");
    }
  });

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDeleteClick = (sport) => {
    setSelectedSport(sport);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSport && selectedSport._id) {
      deleteSportMutation.mutate(selectedSport._id);
    }
  };

  // Action Menu Helpers
  const handleActionClick = (sport, e) => {
    e.stopPropagation();
    setSelectedSport(sport);
    const rect = e.currentTarget.getBoundingClientRect();
    // Adjust position to stay within viewport
    const menuWidth = 192; // w-48 = 12rem = 192px
    let x = rect.right - menuWidth;
    let y = rect.bottom + 5;

    // Check if it would go off-screen vertically
    if (y + 150 > window.innerHeight) {
      y = rect.top - 150;
    }

    setActionPosition({ x, y });
    setShowActions(true);
  };

  const getSportActions = (status) => {
    const actions = [
      { label: 'Edit', action: 'edit', icon: FiEdit2 },
    ];

    if (status === 'AVAILABLE') {
      actions.push({ label: 'Deactivate', action: 'deactivate', icon: FiUserX, className: 'text-orange-600' });
    } else {
      actions.push({ label: 'Activate', action: 'activate', icon: FiCheckCircle, className: 'text-green-600' });
    }

    actions.push({ label: `Switch to ${selectedSport.sport_price_type === 'GROUP' ? 'Individual' : 'Group'}`, action: 'priceType', icon: FiDollarSign, className: 'text-purple-600' });
    actions.push({ label: 'Delete', action: 'delete', icon: FiTrash2, className: 'text-red-600' });

    return actions;
  };

  const handleAction = (action) => {
    setCurrentAction(action);
    setShowActions(false);

    if (action === 'edit') {
      navigate("/edit-sport", { state: { sport: selectedSport } });
    } else if (action === 'delete') {
      setShowDeleteDialog(true);
    } else if (action === 'activate' || action === 'deactivate') {
      const newStatus = action === 'activate' ? 'AVAILABLE' : 'NOT_AVAILABLE';
      updateSportMutation.mutate({ sportId: selectedSport._id, payload: { status: newStatus } });
    } else if (action === 'priceType') {
      const newPriceType = selectedSport.sport_price_type === 'GROUP' ? 'INDIVIDUAL' : 'GROUP';
      updateSportMutation.mutate({ sportId: selectedSport._id, payload: { sport_price_type: newPriceType } });
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setShowActions(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-emerald-50 to-white flex flex-col">
      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 ease-in-out
            ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          <div className="flex items-center space-x-2">
            {toast.type === "success" ? <FiCheck /> : <FiInfo />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/10 mr-4 transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            Manage Sports
          </h1>
          <button
            onClick={() => navigate('/')}
            className="ml-auto p-2 rounded-full bg-white/10 hover:bg-white/10 transition"
            title="Go Home"
          >
            <FiHome className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ⭐ LOADING INDICATOR */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading sports data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6 mx-6 animate-fadeIn">

          {/* Table Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Sports List</h2>

            <button
              onClick={() => navigate("/add-sport")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition shadow-md"
            >
              + Add New Sport
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">

              {/* ⭐ STICKY HEADER */}
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>

                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Image
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Sport Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Ground Location
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actual Charge (₹)
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Final Charge (₹)
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {sportsData.map((sport, index) => (
                  <tr key={sport._id} className="hover:bg-gray-50 transition-colors">

                    <td className="py-4 px-4 text-sm">
                      <div className="w-14 h-14 bg-gray-100 animate-pulse rounded-lg border shadow-sm overflow-hidden flex items-center justify-center">
                        <img
                          src={sport.image}
                          alt={sport.name}
                          loading="lazy"
                          className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
                          onLoad={(e) => {
                            e.target.style.opacity = '1';
                            e.target.parentElement.classList.remove('animate-pulse', 'bg-gray-100');
                          }}
                          onError={(e) => {
                            e.target.parentElement.classList.remove('animate-pulse');
                            e.target.parentElement.innerHTML = '<span class="text-[10px] text-gray-400">Error</span>';
                          }}
                        />
                      </div>
                    </td>

                    <td className="py-4 px-4 text-sm font-medium text-gray-800 text-left">
                      {sport.name}
                    </td>

                    <td className="py-4 px-4 text-sm text-gray-700 text-left">
                      {sport.ground_name}
                    </td>

                    <td className="py-4 px-4 text-sm text-gray-700">
                      ₹{sport.actual_price_per_day}
                    </td>

                    <td className="py-4 px-4 text-sm font-semibold text-green-600">
                      ₹{sport.final_price_per_day}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium 
                          ${sport.status === "AVAILABLE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {sport.status === "NOT_AVAILABLE" ? "INACTIVE" : sport.status}
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

            {sportsData.length === 0 && (
              <p className="text-center py-10 text-gray-500">
                No sports available.
              </p>
            )}
          </div>

          {!loading && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      {/* Delete Popup */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Sport"
        message={`Are you sure you want to delete "${selectedSport?.name}"? This action cannot be undone.`}
        isLoading={deleteSportMutation.isPending}
      />

      {/* Action Menu Dropdown */}
      <AnimatePresence>
        {showActions && selectedSport && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed bg-white rounded-xl shadow-xl py-2 z-50 w-48 border border-gray-100"
            style={{
              top: `${actionPosition.y}px`,
              left: `${actionPosition.x}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {getSportActions(selectedSport.status).map((item) => (
              <button
                key={item.action}
                onClick={() => handleAction(item.action)}
                className={`flex items-center w-full px-4 py-2.5 text-sm ${item.className || 'text-gray-700'} hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl`}
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

export default ManageSports;
