import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiArrowLeft, FiArrowRight, FiClock, FiUsers, FiCalendar, FiCreditCard, FiDollarSign } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { BaseUrl } from "../api/api";
// Utility function to format time in 12-hour format with AM/PM
const formatTimeTo12Hour = (time24) => {
    if (!time24) return '';

    // Handle time in format 'HH:MM:SS' or 'HH:MM'
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const minute = minutes || '00';

    // Convert to 12-hour format
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM

    return `${hour12}:${minute} ${period}`;
};

// Function to format time range
const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return '-';

    const formattedStart = formatTimeTo12Hour(startTime);
    const formattedEnd = formatTimeTo12Hour(endTime);

    return `${formattedStart} to ${formattedEnd}`;
};

const BookingConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    bookingDetails,
    summaryData,
    selectedSlots = [],
    sportName = '',
    bookingType = 'day'
}) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [step, setStep] = useState(1);
    const [selectedPayment, setSelectedPayment] = useState('online');
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isCancellingPayment, setIsCancellingPayment] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [showPaymentCancelled, setShowPaymentCancelled] = useState(false);
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
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
            setShowPaymentCancelled(false);
            setIsProcessingPayment(false);
            setIsCancellingPayment(false);
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

    // Clean up on unmount
    useEffect(() => {
        return () => {
            // Clean up any global event listeners if needed
            document.body.classList.remove('blur-overlay');
        };
    }, []);

    // Add styles for blur overlay
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .blur-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(5px);
                z-index: 9998;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .payment-verifying {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 9999;
                text-align: center;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
            document.body.classList.remove('blur-overlay');
        };
    }, []);

    const handleBack = async () => {
        // If payment modal is open and we have a payment ID, just show cancelled UI and redirect home
        if (showPaymentModal && selectedPaymentMode === 'online' && window.rzpPaymentData) {
            setShowPaymentCancelled(true);
            // Clean up payment data
            window.rzpPaymentData = null;
        }
        // Close any open modals
        setShowPaymentModal(false);
        // Redirect to home page
        navigate('/', { replace: true });
    };

    const handleProceedToPay = () => {
        setShowPaymentModal(true);
    };

    const handlePaymentModeSelect = (paymentMethod) => {
        setSelectedPaymentMode(paymentMethod);
        // Reset loading state when changing payment method
        setIsLoading(false);
    };

    const processPayment = async () => {
        if (!selectedPaymentMode) {
            alert('Please select a payment method');
            return;
        }

        // Set loading states when Pay Now is clicked
        setIsProcessingPayment(true);
        setIsLoading(true);

        try {
            // Debug logging
            console.log('Processing payment with method:', selectedPaymentMode);
            console.log('Booking Details:', bookingDetails);
            console.log('Summary Data:', summaryData);
            console.log('Selected Slots:', selectedSlots);

            // Get sport ID from the first selected slot or fallback to other sources
            const sportId = selectedSlots?.[0]?.sportId ||
                selectedSlots?.[0]?.sports_id ||
                bookingDetails?.sportId ||
                summaryData?.ground?.sport_id;

            if (!sportId) {
                console.error('Sports ID is missing. Selected slots:', selectedSlots);
                throw new Error('Sports ID is missing. Please try selecting a time slot again.');
            }

            // Prepare the booking payload
            const bookingPayload = {
                slot_type: bookingDetails?.slotType || 'DAY',
                times: selectedSlots?.length > 0
                    ? selectedSlots.map(slot => ({
                        start_time: slot.start_time || (slot.time ? slot.time.split('-')[0].trim() : ''),
                        end_time: slot.end_time || (slot.time ? slot.time.split('-')[1]?.trim() : ''),
                        ground_id: bookingDetails?.groundId || summaryData?.ground?.id || ''
                    }))
                    : [{
                        start_time: bookingDetails?.time?.split('-')[0]?.trim() || summaryData?.slots?.[0]?.start_time || '',
                        end_time: bookingDetails?.time?.split('-')[1]?.trim() || summaryData?.slots?.[0]?.end_time || '',
                        ground_id: bookingDetails?.groundId || summaryData?.ground?.id || ''
                    }]
            };

            // Add date information
            const bookingDate = bookingDetails?.date || summaryData?.slots?.[0]?.booking_date || new Date().toISOString().split('T')[0];
            bookingPayload.booking_date = bookingDate;

            if (bookingDetails?.slotType === 'MONTH') {
                bookingPayload.type_month = bookingDetails?.month || new Date().getMonth() + 1;
                bookingPayload.type_year = bookingDetails?.year || new Date().getFullYear();
            } else if (bookingDetails?.slotType === 'YEAR') {
                bookingPayload.type_year = bookingDetails?.year || new Date().getFullYear();
            }

            // Final payload
            const payload = {
                sports_id: sportId,
                no_of_players: parseInt(summaryData?.no_of_players || bookingDetails?.players || 1, 10),
                payment_method: selectedPaymentMode,
                bookings: [bookingPayload]
            };

            console.log('Sending payload:', payload);

            // Get auth token
            let token = '';
            try {
                const stored = localStorage.getItem('lf_user');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    token = parsed?.token || '';
                }
            } catch (err) {
                console.error('Error getting auth token:', err);
                throw new Error('Authentication error. Please try again.');
            }

            // Call the API
            const response = await fetch(`${BaseUrl}booking/slot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('API Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to process booking');
            }

            // Handle payment based on method
            if (selectedPaymentMode === 'COD') {
                setShowPaymentModal(false);
                // Show processing indicator briefly before success
                setTimeout(() => {
                    setIsProcessingPayment(false);
                    setShowPaymentSuccess(true);
                    // Redirect to home after showing success message
                    setTimeout(() => {
                        navigate('/', { replace: true });
                    }, 3000);
                }, 1500);
            } else if (selectedPaymentMode === 'online') {
                // Close the modal immediately when redirecting to Razorpay
                setShowPaymentModal(false);

                // Load Razorpay script
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                script.onload = () => {
                    // Store payment data for potential cancellation
                    window.rzpPaymentData = {
                        payment_id: data.payment_id,
                        order_id: data.order_id,
                        amount: data.amount
                    };

                    const options = {
                        key: data.key_id,
                        amount: data.amount * 100, // Convert to paise
                        currency: data.currency || 'INR',
                        order_id: data.razorpay_order_id,
                        name: 'Learn Fort Sports Park',
                        description: 'Booking Payment',
                        prefill: {
                            name: formData.fullName || 'Customer',
                            email: formData.email || '',
                            contact: formData.mobileNumber || ''
                        },
                        handler: async function (response) {
                            try {
                                // Prepare verification payload
                                const verifyPayload = {
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                    order_id: data.order_id,
                                    payment_id: data.payment_id
                                };

                                console.log('Verifying payment with payload:', verifyPayload);

                                setIsProcessingPayment(true);

                                // Verify payment
                                const verifyResponse = await fetch(`${BaseUrl}booking/verify-payment`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify(verifyPayload)
                                });

                                const result = await verifyResponse.json();

                                if (verifyResponse.ok && (result.success || result.message?.includes('verified'))) {
                                    // Payment verification successful
                                    console.log('Payment verification successful:', result);

                                    // Hide processing indicator and show success popup
                                    setIsProcessingPayment(false);
                                    setShowPaymentModal(false);
                                    setShowPaymentSuccess(true);

                                    // Redirect to home page after delay
                                    setTimeout(() => {
                                        navigate('/', { replace: true });
                                    }, 3000);
                                } else {
                                    // Payment verification failed, cancel the booking
                                    console.error('Payment verification failed:', result);
                                    const errorMessage = result.message || 'Payment verification failed';
                                    if (!errorMessage.includes('verified')) {
                                        setIsProcessingPayment(false);
                                        await handlePaymentCancellation(data.payment_id, 'Payment verification failed. Your booking has been cancelled.');
                                    }
                                }
                            } catch (error) {
                                console.error('Payment processing error:', error);
                                setIsProcessingPayment(false);
                                // Only show error alert if it's not a success message
                                if (!error.message?.includes('verified')) {
                                    alert(error.message || 'Payment processing failed. Please contact support.');
                                }
                                setShowPaymentModal(false);
                            }
                        },
                        modal: {
                            ondismiss: async function () {
                                console.log('Payment modal dismissed by user');
                                try {
                                    if (data?.payment_id) {
                                        await handlePaymentCancellation(data.payment_id, 'Payment cancelled by user');
                                    }
                                } catch (err) {
                                    console.error('Error cancelling booking on dismiss:', err);
                                    setShowPaymentCancelled(true);
                                    window.rzpPaymentData = null;
                                }

                                setTimeout(() => {
                                    navigate('/', { replace: true });
                                }, 3000);
                            }
                        },
                        theme: {
                            color: '#3399cc'
                        }
                    };

                    const rzp = new window.Razorpay(options);

                    // If we get a failure response from the script, call the cancel API
                    rzp.on('payment.failed', async function (response) {
                        console.error('Payment failed response:', response);
                        try {
                            setIsProcessingPayment(false);
                            await handlePaymentCancellation(data.payment_id, 'Payment failed. Your booking has been cancelled.');
                        } catch (err) {
                            console.error('Error handling payment failure:', err);
                        }
                    });

                    rzp.open();
                };
                script.onerror = () => {
                    console.error('Failed to load Razorpay script');
                    alert('Failed to load payment processor. Please try again.');
                    setIsLoading(false);
                };
                document.body.appendChild(script);
            }

        } catch (error) {
            console.error('Booking error:', error);
            alert(error.message || 'Failed to process booking. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentCancellation = async (paymentId, message) => {
        if (!paymentId) return;

        try {
            setIsLoading(true);
            setIsCancellingPayment(true);
            const token = currentUser?.token || '';

            // Call the cancel booking API
            console.log('CANCEL BOOKING → payment_id=', paymentId);
            const response = await fetch(`${BaseUrl}booking/cancel-booking/${paymentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to cancel booking');
            }

            console.log('Booking cancelled successfully:', result);
            setIsCancellingPayment(false);
            setShowPaymentCancelled(true);
            return true;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            setIsCancellingPayment(false);
            throw error;
        } finally {
            setIsLoading(false);
            setShowPaymentModal(false);
            setShowPaymentSuccess(false);
            // Clean up
            window.rzpPaymentData = null;
        }
    };

    const handlePaymentCancel = () => {
        // If we have an active payment, just show cancelled UI without calling API
        if (window.rzpPaymentData) {
            setShowPaymentCancelled(true);
            // Clean up payment data
            window.rzpPaymentData = null;
        }
        // Close the payment modal and redirect home
        setShowPaymentModal(false);
        navigate('/', { replace: true });
    };

    const handlePaymentConfirm = () => {
        // If already showing success, redirect to home
        if (showPaymentSuccess) {
            navigate('/');
        } else {
            processPayment();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
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
            try {
                setIsLoading(true);
                // Prepare the payment data
                const paymentData = {
                    payment_method: selectedPayment,
                    payment_status: selectedPayment === 'online' ? 'pending' : 'to_be_paid',
                    amount: bookingDetails.amount || 0,
                    notes: formData.notes || ''
                };

                // Call the onConfirm with all necessary data
                await onConfirm({
                    ...formData,
                    ...bookingDetails,
                    payment: paymentData,
                    booking_summary: summaryData
                });

                setShowPaymentSuccess(true);
            } catch (error) {
                console.error('Error confirming booking:', error);
                // You might want to show an error toast here
            } finally {
                setIsLoading(false);
            }
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
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Sports Details</h3>
                    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 flex items-center gap-2">
                            <FiCalendar className="text-white w-5 h-5" />
                            <h2 className="text-white font-semibold text-lg">Booking Details</h2>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <p className="font-semibold text-gray-700">Sport Name</p>
                                <p className="text-gray-600">
                                    {summaryData?.ground?.sport || bookingDetails?.sport || "-"}
                                </p>
                            </div>

                            <div className="flex justify-between border-b pb-2">
                                <p className="font-semibold text-gray-700">Date</p>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <FiCalendar className="text-blue-500" size={14} />
                                    <span>{
                                        bookingDetails?.date
                                            ? new Date(bookingDetails.date).toLocaleDateString('en-GB')
                                            : summaryData?.slots?.[0]?.booking_date
                                                ? new Date(summaryData.slots[0].booking_date).toLocaleDateString('en-GB')
                                                : "-"
                                    }</span>
                                </div>
                            </div>

                            <div className="flex justify-between border-b pb-2">
                                <p className="font-semibold text-gray-700">Time Slot{selectedSlots?.length > 1 ? 's' : ''}</p>
                                <div className="text-right">
                                    {selectedSlots?.length > 0 ? (
                                        <div className="space-y-1">
                                            {selectedSlots.map((slot, index) => (
                                                <div key={index} className="flex items-center justify-end gap-1 text-gray-600">
                                                    <FiClock className="text-blue-500" size={14} />
                                                    <span>
                                                        {(() => {
                                                            let startTime, endTime;
                                                            if (slot.start_time && slot.end_time) {
                                                                startTime = formatTimeTo12Hour(slot.start_time);
                                                                endTime = formatTimeTo12Hour(slot.end_time);
                                                            } else if (slot.time) {
                                                                const timeString = slot.time.replace(/\./g, ':');
                                                                [startTime, endTime] = timeString.split('-').map(t => formatTimeTo12Hour(t.trim()));
                                                            } else if (typeof slot === 'string') {
                                                                const timeString = slot.replace(/\./g, ':');
                                                                [startTime, endTime] = timeString.split('-').map(t => formatTimeTo12Hour(t.trim()));
                                                            }
                                                            return `${startTime} - ${endTime}`;
                                                        })()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : summaryData?.slots?.length > 0 ? (
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <FiClock className="text-blue-500" size={14} />
                                            <span>
                                                {summaryData.slots.map(slot =>
                                                    `${formatTimeTo12Hour(slot.start_time)} - ${formatTimeTo12Hour(slot.end_time)}`
                                                ).join(', ')}
                                            </span>
                                        </div>
                                    ) : bookingDetails?.time || bookingDetails?.timeSlot ? (
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <FiClock className="text-blue-500" size={14} />
                                            <span>{
                                                (() => {
                                                    const timeString = (bookingDetails.time || bookingDetails.timeSlot).replace(/\./g, ':');
                                                    const [start, end] = timeString.split('-').map(t => t.trim());
                                                    return `${formatTimeTo12Hour(start)} - ${formatTimeTo12Hour(end)}`;
                                                })()
                                            }</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">-</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between border-b pb-2">
                                <p className="font-semibold text-gray-700">Players</p>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <FiUsers className="text-blue-500" size={14} />
                                    <span>{summaryData?.no_of_players || bookingDetails?.players || 1} Player{summaryData?.no_of_players > 1 || bookingDetails?.players > 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            {/* Add more fields here */}
                        </div>
                    </div>
                    {/* User Details Section */}
                    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 flex items-center gap-2">
                            <FiUsers className="text-white w-5 h-5" />
                            <h2 className="text-white font-semibold text-lg">User Details</h2>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <p className="font-semibold text-gray-700">Full Name</p>
                                <p className="text-gray-600">
                                    {formData.fullName || currentUser?.name || "-"}
                                </p>
                            </div>

                            <div className="flex justify-between border-b pb-2">
                                <p className="font-semibold text-gray-700">Mobile Number</p>
                                <p className="text-gray-600">
                                    {formData.mobileNumber || currentUser?.mobile || "-"}
                                </p>
                            </div>

                            <div className="flex justify-between">
                                <p className="font-semibold text-gray-700">Email</p>
                                <p className="text-gray-600">
                                    {formData.email || currentUser?.email || "-"}
                                </p>
                            </div>
                        </div>
                    </div>


                    {/* Add more sections here */}

                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-100">
                        <div className="space-y-3">

                            {/* Add more fields here */}

                            <div className="">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-lg text-gray-800">Total Amount</p>

                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-blue-700">
                                            ₹{(summaryData?.total_amount || 0).toLocaleString('en-IN')}
                                        </span>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="flex justify-between space-x-4 pt-2">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium flex items-center justify-center space-x-2"
                        >
                            <FiArrowLeft size={18} />
                            <span>Back</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleProceedToPay}
                            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                        >
                            <span>Proceed to Pay</span>
                            <FiArrowRight size={18} />
                        </button>
                    </div>

                    {/* Payment Mode Modal */}
                    <AnimatePresence>
                        {showPaymentModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="bg-white rounded-lg p-6 w-full max-w-md"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Select Payment Mode</h3>
                                        <button
                                            onClick={handlePaymentCancel}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <FiX size={24} />
                                        </button>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        {/* Always show Online Payment option */}
                                        <button
                                            type="button"
                                            onClick={() => handlePaymentModeSelect('online')}
                                            disabled={isLoading}
                                            className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedPaymentMode === 'online'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex items-center">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${selectedPaymentMode === 'online' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                                    {selectedPaymentMode === 'online' && <FiCheck className="text-white w-3 h-3" />}
                                                </div>
                                                <span className="font-medium">
                                                    Online Payment
                                                </span>
                                            </div>
                                        </button>

                                        {/* Show COD option only if user is not a regular USER */}
                                        {currentUser?.role !== 'USER' && (
                                            <button
                                                type="button"
                                                onClick={() => handlePaymentModeSelect('COD')}
                                                disabled={isLoading}
                                                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedPaymentMode === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="flex items-center">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${selectedPaymentMode === 'COD' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                                        {selectedPaymentMode === 'COD' && <FiCheck className="text-white w-3 h-3" />}
                                                    </div>
                                                    <span className="font-medium">
                                                        Cash on Delivery (COD)
                                                    </span>
                                                </div>
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={handlePaymentCancel}
                                            className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handlePaymentConfirm}
                                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            disabled={!selectedPaymentMode || isLoading}
                                        >
                                            {isLoading ? 'Processing...' : 'Pay Now'}
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );

    const renderBookingSummary = () => (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <FiX className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                {step === 1 ? 'Booking Summary' : 'Payment Method'}
                            </h3>

                            {step === 1 && summaryData ? (
                                <div className="space-y-4">
                                    {/* Booking Details */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Booking Details</h4>

                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <FiFileText className="h-5 w-5 text-gray-400 mr-2" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Sport</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {summaryData?.ground?.sport ||
                                                            summaryData?.slots?.[0]?.sport_name ||
                                                            summaryData?.sportName ||
                                                            'Not specified'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <FiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Date</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {summaryData?.slots?.[0]?.booking_date ?
                                                            new Date(summaryData.slots[0].booking_date).toLocaleDateString('en-US', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            }) :
                                                            (selectedSlots[0]?.date ?
                                                                new Date(selectedSlots[0].date).toLocaleDateString('en-US', {
                                                                    weekday: 'long',
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                }) :
                                                                'Not specified'
                                                            )
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <FiClock className="h-5 w-5 text-gray-400 mr-2" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Time Slot</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {summaryData?.slots?.[0]?.start_time && summaryData?.slots?.[0]?.end_time
                                                            ? `${summaryData.slots[0].start_time} - ${summaryData.slots[0].end_time}`
                                                            : (selectedSlots[0]?.startTime && selectedSlots[0]?.endTime
                                                                ? `${selectedSlots[0].startTime} - ${selectedSlots[0].endTime}`
                                                                : 'Not specified'
                                                            )
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <FiUsers className="h-5 w-5 text-gray-400 mr-2" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Player(s)</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {summaryData?.no_of_players ||
                                                            (bookingDetails.players ? parseInt(bookingDetails.players) : 1)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Summary */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Price Summary</h4>

                                        <div className="space-y-2">
                                            {summaryData.breakdown?.map((item, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <span className="text-sm text-gray-600">{item.description}</span>
                                                    <span className="text-sm font-medium text-gray-900">₹{item.amount?.toFixed(2) || "0.00"}</span>
                                                </div>
                                            ))}

                                            <div className="border-t border-gray-200 my-2"></div>

                                            <div className="flex justify-between">
                                                <span className="text-base font-medium text-gray-900">Total Amount</span>
                                                <span className="text-base font-bold text-gray-900">
                                                    {summaryData.currency === 'INR' || !summaryData.currency ? '₹' : ''}
                                                    {(summaryData.total_amount || summaryData.totalAmount || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                            Additional Notes (Optional)
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            rows="2"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Any special requests or notes..."
                                        />
                                    </div>
                                </div>
                            ) : step === 2 ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPayment('online')}
                                            className={`p-4 border rounded-lg text-left transition-colors ${selectedPayment === 'online'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-5 w-5 text-blue-600">
                                                    {selectedPayment === 'online' && <FiCheck className="h-5 w-5" />}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">Online Payment</p>
                                                    <p className="text-sm text-gray-500">Pay securely online</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedPayment('onsite')}
                                            className={`p-4 border rounded-lg text-left transition-colors ${selectedPayment === 'onsite'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-5 w-5 text-blue-600">
                                                    {selectedPayment === 'onsite' && <FiCheck className="h-5 w-5" />}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">Pay at Venue</p>
                                                    <p className="text-sm text-gray-500">Pay when you arrive</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>

                                    {summaryData && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Subtotal</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        ₹{summaryData.subtotal?.toFixed(2) || "0.00"}
                                                    </span>
                                                </div>
                                                {summaryData.tax_amount > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Tax ({summaryData.tax_percentage || 0}%)</span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            ₹{summaryData.tax_amount?.toFixed(2) || "0.00"}
                                                        </span>
                                                    </div>
                                                )}
                                                {summaryData.discount_amount > 0 && (
                                                    <div className="flex justify-between text-green-600">
                                                        <span className="text-sm">Discount</span>
                                                        <span className="text-sm font-medium">
                                                            -₹{summaryData.discount_amount?.toFixed(2) || "0.00"}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="border-t border-gray-200 my-2"></div>
                                                <div className="flex justify-between">
                                                    <span className="text-base font-medium text-gray-900">Total</span>
                                                    <span className="text-base font-bold text-gray-900">
                                                        ₹{summaryData.total_amount?.toFixed(2) || "0.00"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500 mb-4">
                                            By confirming this booking, you agree to our Terms of Service and Privacy Policy.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Loading booking details...</p>
                                </div>
                            )}

                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                {step === 2 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-1 sm:text-sm"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!summaryData && step === 1}
                                    className={`mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:col-start-2 sm:text-sm ${step === 1
                                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                        : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                        } ${(!summaryData && step === 1) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {step === 1 ? 'Continue to Payment' : 'Confirm Booking'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProcessingPayment = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <div className={`animate-spin rounded-full h-16 w-16 border-b-4 ${isCancellingPayment ? 'border-red-600' : 'border-blue-600'}`}></div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isCancellingPayment ? 'Cancelling Payment...' : 'Processing Payment...'}
                    </h3>
                    <p className="text-gray-600">
                        {isCancellingPayment
                            ? 'Please wait while we cancel your payment.'
                            : 'Please wait while we process your payment.'}
                    </p>
                </div>
            </div>
        </div>
    );

    const renderPaymentSuccess = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheck className="text-green-500 text-3xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h3>
                    <p className="text-gray-600 mb-6">Your booking has been confirmed.</p>
                    <button
                        onClick={() => {
                            setShowPaymentSuccess(false);
                            onClose();
                            navigate('/');
                        }}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPaymentCancelled = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiX className="text-red-500 text-3xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Cancelled</h3>
                    <p className="text-gray-600 mb-6">Your booking has been cancelled.</p>
                    <button
                        onClick={() => {
                            setShowPaymentCancelled(false);
                            onClose();
                            navigate('/');
                        }}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Back to Home
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
                    {step === 1 ? renderStepTwo() : renderStepTwo()}
                </motion.div>
            </div>
            {(isProcessingPayment || isCancellingPayment) && renderProcessingPayment()}
            {showPaymentSuccess && renderPaymentSuccess()}
            {showPaymentCancelled && renderPaymentCancelled()}
        </AnimatePresence>
    );
};

export default BookingConfirmation;
