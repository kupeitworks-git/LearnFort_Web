import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiArrowLeft, FiArrowRight, FiClock, FiUsers, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const BookingConfirmation = ({ isOpen, onClose, onConfirm, bookingDetails }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "",
        fathersName: "",
        mobileNumber: "",
        email: "",
        aadharNumber: "",
        address: "",
        notes: "",
    });

    // Reset form when modal is closed
    useEffect(() => {
        if (!isOpen) {
            // Reset form data
            setFormData({
                fullName: "",
                fathersName: "",
                mobileNumber: "",
                email: "",
                aadharNumber: "",
                address: "",
                notes: "",
            });
            setStep(1);
            setShowPaymentSuccess(false);
        }
    }, [isOpen]);

    // When modal opens, try to prefill from logged-in user
    useEffect(() => {
        if (isOpen) {
            try {
                const stored = localStorage.getItem("lf_user");
                const parsed = stored ? JSON.parse(stored) : null;
                setCurrentUser(parsed);

                if (parsed) {
                    setFormData((prev) => ({
                        ...prev,
                        fullName: parsed.name || "",
                        fathersName: parsed.father_name || "",
                        mobileNumber: parsed.mobile || "",
                        email: parsed.email || "",
                        aadharNumber: parsed.aadhar_number || "",
                        address: parsed.address || "",
                    }));
                }
            } catch (err) {
                setCurrentUser(null);
            }
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (step === 1) {
            // If no logged-in user, redirect to login instead of proceeding
            if (!currentUser) {
                onClose();
                navigate("/login");
                return;
            }
            setStep(2);
        } else {
            setShowPaymentSuccess(true);
        }
    };

    const handlePaymentConfirm = () => {
        onConfirm({ ...formData, ...bookingDetails });
        setShowPaymentSuccess(false);
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            onClose();
        }
    };

    const renderFormFields = () => (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Full Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Father&apos;s Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="fathersName"
                    value={formData.fathersName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter father's name"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter mobile number"
                    required
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit mobile number"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Email (Optional)
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Aadhar Number <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Aadhar number"
                    required
                    pattern="[0-9]{12}"
                    title="Please enter a valid 12-digit Aadhar number"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Address <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full address"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Notes
                </label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional notes or requirements"
                />
            </div>
        </>
    );

    const renderStepOne = () => (
        <>
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white relative">
                <h2 className="text-2xl font-bold">Personal Details</h2>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition"
                    type="button"
                >
                    <FiX className="w-6 h-6" />
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                className="p-6 space-y-4 overflow-y-auto flex-1 animate-fadeIn"
            >
                {renderFormFields()}

                <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t border-gray-200">
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                    >
                        Next
                    </button>
                </div>
            </form>
        </>
    );

    const renderStepTwo = () => (
        <>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
                <h2 className="text-2xl font-bold">Booking Summary</h2>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition"
                    type="button"
                >
                    <FiX className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className="space-y-5">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Turf Details</h3>
                    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 flex items-center gap-2">
                            <FiCalendar className="text-white w-5 h-5" />
                            <h2 className="text-white font-semibold text-lg">Booking Details</h2>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-1">
                                <p className="font-semibold text-gray-700">Sport</p>
                                <p className="text-gray-600">{bookingDetails?.sport || "-"}</p>
                            </div>

                            <div className="flex justify-between border-b pb-1">
                                <p className="font-semibold text-gray-700">Date</p>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <FiCalendar className="text-blue-500" size={14} />
                                    <span>{bookingDetails?.date || "-"}</span>
                                </div>
                            </div>

                            <div className="flex justify-between border-b pb-1">
                                <p className="font-semibold text-gray-700">Time Slot</p>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <FiClock className="text-blue-500" size={14} />
                                    <span>{bookingDetails?.timeSlot || "-"}</span>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <p className="font-semibold text-gray-700">Players</p>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <FiUsers className="text-blue-500" size={14} />
                                    <span>{bookingDetails?.players || "-"} Players</span>
                                </div>
                            </div>
                        </div>
                    </div>



                    <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                            Personal Information
                        </h3>

                        <div className="w-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5.121 17.804A9 9 0 1118.879 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <h2 className="text-white font-semibold text-lg">User Details</h2>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-3 text-sm">
                                <div className="flex justify-between border-b pb-1">
                                    <p className="font-semibold text-gray-700">Full Name</p>
                                    <p className="text-gray-600">{formData.fullName || "-"}</p>
                                </div>

                                <div className="flex justify-between border-b pb-1">
                                    <p className="font-semibold text-gray-700">Father&apos;s Name</p>
                                    <p className="text-gray-600">{formData.fathersName || "-"}</p>
                                </div>

                                <div className="flex justify-between border-b pb-1">
                                    <p className="font-semibold text-gray-700">Mobile Number</p>
                                    <p className="text-gray-600">{formData.mobileNumber || "-"}</p>
                                </div>

                                <div className="flex justify-between border-b pb-1">
                                    <p className="font-semibold text-gray-700">Email</p>
                                    <p className="text-gray-600 break-all">{formData.email || "-"}</p>
                                </div>

                                <div className="flex justify-between border-b pb-1">
                                    <p className="font-semibold text-gray-700">Aadhar Number</p>
                                    <p className="text-gray-600">{formData.aadharNumber || "-"}</p>
                                </div>

                                <div className="flex justify-between">
                                    <p className="font-semibold text-gray-700">Address</p>
                                    <p className="text-gray-600 text-right">{formData.address || "-"}</p>
                                </div>
                            </div>
                        </div>

                    </div>


                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-700">Total Amount</p>
                                <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                            </div>
                            <div className="text-right">
                                {bookingDetails?.originalAmount > bookingDetails?.amount && (
                                    <p className="text-sm text-gray-500 line-through">
                                        ₹{bookingDetails?.originalAmount?.toLocaleString('en-IN')}
                                    </p>
                                )}
                                <span className="text-2xl font-bold text-blue-700">
                                    ₹{bookingDetails?.amount?.toLocaleString('en-IN') || "0.00"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between space-x-4 pt-2">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium flex items-center justify-center space-x-2"
                        >
                            <FiArrowLeft size={18} />
                            <span>Back</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                        >
                            <span>Proceed to Pay</span>
                            <FiArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    const renderPaymentSuccess = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheck className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                    <p className="text-gray-600 mb-6">Your booking has been confirmed. We've sent the details to your email.</p>
                    <button
                        onClick={handlePaymentConfirm}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
                <motion.div
                    className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-8 max-h-[90vh] flex flex-col"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    {step === 1 ? renderStepOne() : renderStepTwo()}
                </motion.div>
            </div>
            {showPaymentSuccess && renderPaymentSuccess()}
        </AnimatePresence>
    );
};

export default BookingConfirmation;
