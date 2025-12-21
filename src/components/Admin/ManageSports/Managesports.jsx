import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FiArrowLeft, FiAlertTriangle, FiCheck, FiInfo } from "react-icons/fi";
import {BaseUrl} from '../../api/api'


// Confirmation Popup Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageSports = () => {
  const navigate = useNavigate();

  const [sportsData, setSportsData] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true); // 🔥 LOADING STATE
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // 🔥 Fetch sports list from API
  const fetchSports = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Login session expired. Please login again.");
        return;
      }

      const res = await fetch(`${BaseUrl}sports/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setSportsData(data.sports);
      } else {
        alert("Failed to fetch sports list");
      }
    } catch (err) {
        (err);
      alert("Error fetching sports");
    } finally {
      setLoading(false); // 🟢 Stop loading
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const handleDeleteClick = (sport) => {
    setSelectedSport(sport);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await fetch(
        `${BaseUrl}sports/delete/${selectedSport._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setSportsData((prev) => prev.filter((s) => s._id !== selectedSport._id));
        setShowDeleteDialog(false);
        setSelectedSport(null);
        showToast("Sport deleted successfully!", "success");
      } else {
        showToast("Failed to delete sport", "error");
      }
    } catch (err) {
      showToast("Error deleting sport", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-emerald-50 to-white flex flex-col">
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

      {/* HEADER */}
      <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/10 mr-4 transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            Manage Sports
          </h1>
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
                    S.No
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Image
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Sport Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Ground Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actual Price (₹)
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Final Price (₹)
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
                    <td className="py-4 px-4 text-sm">{index + 1}</td>

                    <td className="py-4 px-4">
                      <img
                        src={sport.image}
                        alt={sport.name}
                        className="w-14 h-14 object-cover rounded-lg border shadow-sm"
                      />
                    </td>

                    <td className="py-4 px-4 text-sm font-medium text-gray-800">
                      {sport.name}
                    </td>

                    <td className="py-4 px-4 text-sm text-gray-700">
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
                        {sport.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right text-sm">
                      <button
                        onClick={() => navigate("/edit-sport", { state: { sport } })}
                        className="text-blue-600 hover:text-blue-900 mr-3 transition-colors"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(sport)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <FaTrash />
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
        </div>
      )}

      {/* Delete Popup */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Sport"
        message={`Are you sure you want to delete "${selectedSport?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default ManageSports;
