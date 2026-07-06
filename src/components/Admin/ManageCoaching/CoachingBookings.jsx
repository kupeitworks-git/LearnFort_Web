import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft, FiHome, FiCheck, FiInfo, FiCalendar, FiClock,
  FiFilter, FiPackage,
} from "react-icons/fi";
import { BaseUrl } from "../../api/api";
import Pagination from "../../common/Pagination";

const STATUS_COLORS = {
  ACTIVE: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  EXPIRED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-800",
};

const PAYMENT_COLORS = {
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  FAILED: "bg-red-100 text-red-800",
};

const CoachingBookings = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const { data: queryData = { data: [], pagination: {} }, isLoading } = useQuery({
    queryKey: ["coaching_bookings_admin", currentPage, statusFilter, paymentFilter],
    queryFn: async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        throw new Error("No token found");
      }

      const params = new URLSearchParams({ page: currentPage, limit: 15 });
      if (statusFilter) params.append("status", statusFilter);
      if (paymentFilter) params.append("payment_status", paymentFilter);

      const res = await fetch(`${BaseUrl}couching-booking/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.message === "jwt expired") {
          sessionStorage.clear();
          navigate("/login");
          throw new Error("Session expired");
        }
        throw new Error(data.message || "Failed to fetch bookings");
      }
      return {
        data: data.data || [],
        pagination: data.pagination || { currentPage: 1, totalPages: 1, totalDocs: 0 },
      };
    },
  });

  const bookings = queryData.data;
  const pagination = queryData.pagination;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white flex flex-col">
      {/* Toast */}
      {toast.message && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-medium
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
          <button
            onClick={() => navigate("/admin")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            Coaching Bookings
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

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6 mx-4 sm:mx-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FiFilter className="w-4 h-4" />
            <span className="font-medium">Filters:</span>
          </div>
          <select
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={handleFilterChange(setPaymentFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          {(statusFilter || paymentFilter) && (
            <button
              onClick={() => { setStatusFilter(""); setPaymentFilter(""); setCurrentPage(1); }}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600 font-medium">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiPackage className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No coaching bookings found</p>
            <p className="text-gray-400 text-sm mt-1">
              {statusFilter || paymentFilter ? "Try clearing the filters" : "No bookings have been made yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="block sm:hidden space-y-4">
              {bookings.map((booking, i) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border border-blue-100 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">User</p>
                      <p className="font-semibold text-gray-800 text-sm">{booking.user?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{booking.user?.email || ""}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-600"}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Sport</p>
                      <p className="font-medium text-gray-700">{booking.couching_sport?.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Plan</p>
                      <p className="font-medium text-gray-700 flex items-center gap-1">
                        {booking.plan_type === "MONTH" ? <FiClock className="w-3 h-3" /> : <FiCalendar className="w-3 h-3" />}
                        {booking.plan_type === "MONTH" ? "Monthly" : "Yearly"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Amount</p>
                      <p className="font-semibold text-green-600">₹{booking.final_fees}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Payment</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[booking.payment_status] || "bg-gray-100 text-gray-600"}`}>
                        {booking.payment_status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(booking.start_date)} — {formatDate(booking.end_date)}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto max-h-[70vh]">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Sport</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount (₹)</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Start</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">End</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm">
                        <p className="font-medium text-gray-800">{booking.user?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{booking.user?.email || ""}</p>
                        {booking.user?.mobile && (
                          <p className="text-xs text-gray-400">{booking.user.mobile}</p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-800">
                        {booking.couching_sport?.name || "—"}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">
                        <span className="flex items-center gap-1">
                          {booking.plan_type === "MONTH"
                            ? <FiClock className="w-3 h-3 text-blue-500" />
                            : <FiCalendar className="w-3 h-3 text-emerald-500" />
                          }
                          {booking.plan_type === "MONTH" ? "Monthly" : "Yearly"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <span className="text-gray-400 text-xs line-through block">₹{booking.actual_fees}</span>
                        <span className="font-semibold text-green-600">₹{booking.final_fees}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[booking.payment_status] || "bg-gray-100 text-gray-600"}`}>
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-600"}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{formatDate(booking.start_date)}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{formatDate(booking.end_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CoachingBookings;
