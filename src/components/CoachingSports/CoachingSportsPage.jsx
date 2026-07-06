import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft, FiHome, FiCheck, FiInfo, FiX,
  FiCalendar, FiClock, FiShield, FiAlertCircle,
} from "react-icons/fi";
import { BaseUrl } from "../api/api";

// Convenience fee rate — must match the backend (2.42%)
const CONVENIENCE_FEE_RATE = 0.0242;

const CoachingSportsPage = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: "", type: "" });
  const [selectedSport, setSelectedSport] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const currentUser = (() => {
    try {
      const stored = localStorage.getItem("lf_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  })();

  // Fetch active coaching sports (public endpoint, no auth needed)
  const { data: queryData = { data: [], pagination: {} }, isLoading } = useQuery({
    queryKey: ["coaching_sports_public"],
    queryFn: async () => {
      const res = await fetch(`${BaseUrl}couching?status=true&limit=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch coaching sports");
      return {
        data: data.data || [],
        pagination: data.pagination || {},
      };
    },
  });

  const sports = queryData.data;

  // ── Purchase Flow ─────────────────────────────────────────────────────────
  const handlePurchaseClick = (sport) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setSelectedSport(sport);
    setSelectedPlan(null);
    setShowPurchaseModal(true);
  };

  // Compute fee breakdown whenever plan or sport changes
  const feeBreakdown = useMemo(() => {
    if (!selectedSport || !selectedPlan) return null;
    const bookingAmt =
      selectedPlan === "MONTH"
        ? selectedSport.coaching_final_fees_month
        : selectedSport.coaching_final_fees_year;
    const convenienceFee = Math.round(bookingAmt * CONVENIENCE_FEE_RATE * 100) / 100;
    const totalAmount = Math.round((bookingAmt + convenienceFee) * 100) / 100;
    return { bookingAmt, convenienceFee, totalAmount };
  }, [selectedSport, selectedPlan]);

  const handleConfirmPurchase = async () => {
    if (!selectedPlan || !selectedSport) return;
    setIsPurchasing(true);

    try {
      const token = sessionStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      // 1. Initiate purchase
      const initiateRes = await fetch(`${BaseUrl}couching-booking/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          couching_sport_id: selectedSport._id,
          plan_type: selectedPlan,
        }),
      });

      const initiateData = await initiateRes.json();

      if (!initiateRes.ok) {
        if (initiateData.message === "jwt expired") {
          sessionStorage.clear();
          navigate("/login");
          return;
        }
        throw new Error(
          Array.isArray(initiateData.errors) && initiateData.errors.length > 0
            ? initiateData.errors.join("\n")
            : initiateData.message || "Failed to initiate purchase"
        );
      }

      const {
        purchase_id,
        razorpay_order_id,
        amount,
        currency,
        key_id,
        booking_amount: apiBookingAmt,
        convenience_fee: apiConvenienceFee,
        total_amount: apiTotalAmount,
      } = initiateData.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "LearnFort Sports Park",
        description: `${selectedSport.name} — ${selectedPlan === "MONTH" ? "Monthly" : "Yearly"} Plan`,
        order_id: razorpay_order_id,
        handler: async function (response) {
          // 3. Verify payment
          try {
            const verifyRes = await fetch(`${BaseUrl}couching-booking/${purchase_id}/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              showToast("Payment successful! Your coaching plan is now active.", "success");
              setShowPurchaseModal(false);
              setSelectedSport(null);
              setSelectedPlan(null);
            } else {
              throw new Error(verifyData.message || "Payment verification failed");
            }
          } catch (verifyErr) {
            showToast(verifyErr.message || "Payment verification failed", "error");
          }
        },
        prefill: {
          name: currentUser?.name || "",
          email: currentUser?.email || "",
          contact: currentUser?.mobile || "",
        },
        theme: {
          color: "#1E3A8A",
        },
        modal: {
          ondismiss: function () {
            setIsPurchasing(false);
            showToast("Payment cancelled", "error");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setIsPurchasing(false);
    }
  };

  // ── Card Component ────────────────────────────────────────────────────────
  const SportCard = ({ sport, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
        {sport.image ? (
          <img
            src={sport.image}
            alt={sport.name}
            loading="lazy"
            className="w-full h-full object-cover opacity-0 transition-opacity duration-500"
            onLoad={(e) => { e.target.style.opacity = "1"; }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : null}
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/90 text-white backdrop-blur-sm shadow-sm">
            Available
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{sport.name}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">
          {sport.description}
        </p>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
              <FiClock className="w-3 h-3" />
              <span className="text-[10px] uppercase font-semibold tracking-wider">Monthly</span>
            </div>
            <p className="text-gray-400 text-xs line-through">₹{sport.coaching_actual_fees_month}</p>
            <p className="text-blue-700 font-bold text-lg">₹{sport.coaching_final_fees_month}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
              <FiCalendar className="w-3 h-3" />
              <span className="text-[10px] uppercase font-semibold tracking-wider">Yearly</span>
            </div>
            <p className="text-gray-400 text-xs line-through">₹{sport.coaching_actual_fees_year}</p>
            <p className="text-emerald-700 font-bold text-lg">₹{sport.coaching_final_fees_year}</p>
          </div>
        </div>

        {/* Purchase Button */}
        <button
          onClick={() => handlePurchaseClick(sport)}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          Purchase Plan
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white">
      {/* Toast */}
      <AnimatePresence>
        {toast.message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-medium
              ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === "success" ? <FiCheck /> : <FiInfo />}
              <span className="whitespace-pre-line">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            Coaching Games
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Intro */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Professional Games Coaching
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Choose from our range of professional coaching programs. Select a monthly or yearly plan and get started today!
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600 font-medium">Loading coaching programs...</p>
          </div>
        ) : sports.length === 0 ? (
          <div className="text-center py-20">
            <FiShield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No coaching programs available right now.</p>
            <p className="text-gray-400 text-sm mt-1">Check back later for new programs!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sports.map((sport, index) => (
              <SportCard key={sport._id} sport={sport} index={index} />
            ))}
          </div>
        )}
      </main>

      {/* ── Purchase Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPurchaseModal && selectedSport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
            onClick={() => { if (!isPurchasing) { setShowPurchaseModal(false); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] p-5 text-white relative">
                <button
                  onClick={() => { if (!isPurchasing) setShowPurchaseModal(false); }}
                  className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition"
                >
                  <FiX className="w-4 h-4" />
                </button>
                <h3 className="text-lg font-bold pr-8">{selectedSport.name}</h3>
                <p className="text-blue-200 text-sm mt-1">Select a coaching plan</p>
              </div>

              {/* Plan Options */}
              <div className="p-5 space-y-3">
                {/* Monthly Plan */}
                <button
                  onClick={() => setSelectedPlan("MONTH")}
                  disabled={isPurchasing}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between
                    ${selectedPlan === "MONTH"
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                    } disabled:opacity-50`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FiClock className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-gray-800">Monthly Plan</span>
                    </div>
                    <p className="text-xs text-gray-400 line-through">₹{selectedSport.coaching_actual_fees_month}/month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-700">₹{selectedSport.coaching_final_fees_month}</p>
                    <p className="text-xs text-gray-400">/month</p>
                  </div>
                </button>

                {/* Yearly Plan */}
                <button
                  onClick={() => setSelectedPlan("YEAR")}
                  disabled={isPurchasing}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between relative
                    ${selectedPlan === "YEAR"
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                    } disabled:opacity-50`}
                >
                  {/* Best Value Badge */}
                  <div className="absolute -top-2 left-4">
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                      Best Value
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FiCalendar className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold text-gray-800">Yearly Plan</span>
                    </div>
                    <p className="text-xs text-gray-400 line-through">₹{selectedSport.coaching_actual_fees_year}/year</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-700">₹{selectedSport.coaching_final_fees_year}</p>
                    <p className="text-xs text-gray-400">/year</p>
                  </div>
                </button>
              </div>

              {/* Fee Breakdown — shown once a plan is selected */}
              {feeBreakdown && (
                <div className="mx-5 mb-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-blue-100 flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Price Breakdown</span>
                  </div>
                  <div className="px-4 py-3 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Coaching Fee</span>
                      <span className="font-semibold text-gray-800">₹{feeBreakdown.bookingAmt.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        Convenience Fee
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">2.42%</span>
                      </span>
                      <span className="font-semibold text-gray-800">₹{feeBreakdown.convenienceFee.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                      <span className="font-bold text-gray-900">Total Payable</span>
                      <span className="text-lg font-black text-blue-700">₹{feeBreakdown.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm */}
              <div className="px-5 pb-5">
                <button
                  onClick={handleConfirmPurchase}
                  disabled={!selectedPlan || isPurchasing}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl
                    hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {isPurchasing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiShield className="w-4 h-4" />
                      {feeBreakdown
                        ? `Pay ₹${feeBreakdown.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "Select a Plan"
                      }
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-2">
                  Secured by Razorpay · 100% Safe Payment
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachingSportsPage;
