import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BaseUrl } from "../api/api";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
    FiArrowLeft,
    FiClock,
    FiCalendar,
    FiCheckCircle,
    FiX,
    FiUser,
    FiLayers,
    FiChevronRight
} from "react-icons/fi";
import {
    GiSoccerBall,
    GiCricketBat,
    GiTennisRacket,
    GiBasketballBall,
    GiShuttlecock,
} from "react-icons/gi";
import { FaSpinner } from "react-icons/fa";

const BookingsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("upcoming");
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [pendingBooking, setPendingBooking] = useState(null);
    const [showPendingPayment, setShowPendingPayment] = useState(false);
    const [user, setUser] = useState(null);
    const [viewMode, setViewMode] = useState("selection"); // 'selection' or 'history'
    const [historyType, setHistoryType] = useState("my"); // 'my' or 'all'

    // State for pagination and data
    const [bookings, setBookings] = useState({
        upcoming: [],
        live: [],
        completed: [],
        "my-bookings": [],
        all: []
    });

    // Page counters (start at 0, increment before fetch)
    const [pages, setPages] = useState({
        upcoming: 0,
        live: 0,
        completed: 0,
        "my-bookings": 0,
        all: 0
    });

    const [hasMore, setHasMore] = useState({
        upcoming: true,
        live: true,
        completed: true,
        "my-bookings": true,
        all: true
    });

    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState({
        upcoming: 0,
        live: 0,
        completed: 0,
        "my-bookings": 0,
        all: 0
    });
    const receiptRef = useRef(null);

    // Get user and handle initial view
    useEffect(() => {
        const storedUser = localStorage.getItem("lf_user");
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
        }
    }, []);

    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

    const downloadReceipt = async () => {
        const receiptElement = document.getElementById('receipt-content');
        if (!receiptElement) return;

        // Create a temporary container for the receipt (completely off-screen)
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '0';
        container.style.top = '0';
        container.style.width = '100%';
        container.style.zIndex = '9999';
        container.style.visibility = 'hidden';

        // Create a clone of the receipt element with print-specific styles
        const receiptClone = receiptElement.cloneNode(true);
        receiptClone.style.position = 'absolute';
        receiptClone.style.left = '0';
        receiptClone.style.top = '0';
        receiptClone.style.width = '21cm';
        receiptClone.style.maxWidth = 'none';
        receiptClone.style.overflow = 'visible';
        receiptClone.style.boxShadow = 'none';
        receiptClone.style.borderRadius = '0';
        receiptClone.style.background = '#ffffff';
        receiptClone.style.padding = '20px';
        receiptClone.style.zIndex = '10000';

        // Append to container and then to body
        container.appendChild(receiptClone);
        document.body.appendChild(container);

        try {
            // Make the container visible for capture
            container.style.visibility = 'visible';

            // Wait for the browser to render the element
            await new Promise(resolve => setTimeout(resolve, 100));

            // Get the scrollable content and make it fully visible
            const scrollableContent = receiptClone.querySelector('.custom-scrollbar');
            if (scrollableContent) {
                scrollableContent.style.overflow = 'visible';
                scrollableContent.style.maxHeight = 'none';
            }

            // Hide any download buttons in the clone
            const downloadButtons = receiptClone.querySelectorAll('button[title="Download Receipt"]');
            downloadButtons.forEach(btn => {
                btn.style.display = 'none';
            });

            // Use html2canvas with the clone
            const canvas = await html2canvas(receiptClone, {
                scale: 2,
                width: receiptClone.offsetWidth,
                height: receiptClone.scrollHeight + 100, // Add some extra space
                scrollX: 0,
                scrollY: 0,
                useCORS: true,
                allowTaint: true,
                logging: true,
                backgroundColor: '#ffffff',
                removeContainer: true
            });

            // Create PDF with proper dimensions
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Calculate dimensions to fit the page width while maintaining aspect ratio
            const pageWidth = pdf.internal.pageSize.getWidth() - 20;
            const pageHeight = (canvas.height * pageWidth) / canvas.width;

            // Add image to PDF with proper scaling and centering
            pdf.addImage(imgData, 'PNG', 10, 10, pageWidth, pageHeight);

            // Save the PDF with a proper name
            pdf.save(`receipt-${selectedBooking?.id || Date.now()}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            // Clean up
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }
    };

    // Game icons mapping
    const gameIcons = {
        Football: <GiSoccerBall className="w-7 h-7 text-blue-700" />,
        Cricket: <GiCricketBat className="w-7 h-7 text-green-700" />,
        Tennis: <GiTennisRacket className="w-7 h-7 text-yellow-600" />,
        Basketball: <GiBasketballBall className="w-7 h-7 text-orange-600" />,
        Badminton: <GiShuttlecock className="w-7 h-7 text-indigo-700" />,
    };

    // Helper to convert 24h time string to 12h AM/PM string
    const formatTo12Hour = (timeStr) => {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(':');
        let h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // the hour '0' should be '12'
        return `${h}:${minutes} ${ampm}`;
    };

    const handleBack = () => {
        if (viewMode === "history") {
            setViewMode("selection");
            // Reset bookings for the new context if needed, 
            // but keeping them might be fine unless user wants a fresh fetch every time
        } else {
            navigate(-1);
        }
    };

    // Helper to format API data to match UI expected fields
    // Assuming API returns standard fields, but we map safe properties
    const mapBookingData = (item) => ({
        id: item._id || item.id,
        game: item?.sports?.name || item.sport_name || item.game || "Sport",
        date: item.booking_date ? new Date(item.booking_date).toLocaleDateString("en-GB") : "Date", // DD/MM/YYYY
        time: (item.start_time && item.end_time)
            ? `${formatTo12Hour(item.start_time)} - ${formatTo12Hour(item.end_time)}`
            : (item.slot_time || item.time || "Time"),
        duration: item.duration_minutes ? `${item.duration_minutes} mins` : (item.duration || "1 hour"),
        status: item.status || item.booking_status || "Pending",
        amount: item.total_price || item.payment?.amount || item.amount || "0",
        customer: {
            name: item.user?.name || item.user_id?.name || "User",
            email: item.user?.email || item.user_id?.email || "email@example.com",
            phone: item.user?.mobile || item.user_id?.mobile || "N/A",
            native: item.user?.native_place || item.user_id?.native_place || "N/A"
        },
        bookingId: item.booking_id || item._id || "ID",
        paymentId: (item.payment && item.payment.order_id) || item.payment_id || "PAY-ID",
        paymentMode: "Online Payment", // Hardcoded or derived if available
        turf: item?.sports?.name || "Turf",
        notes: item.notes || null,
        rawDate: item.booking_date // Keep raw for receipts if needed
    });

    const fetchBookings = React.useCallback(async (type, pageNum) => {
        if (loading) return;

        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            let status = type;
            let filter = historyType === "all" ? "all" : "my-bookings";

            let url = `${BaseUrl}booking/booking-details?status=${status}&limit=50&page=${pageNum}`;
            if (filter) {
                url += `&filter=${filter}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();

            const newItems = (result.data || result.bookings || []).map(mapBookingData);

            // If API provides total items, store it. Otherwise estimate from results.
            const total = result.total || result.total_count || (newItems.length < 50 ? (pageNum - 1) * 50 + newItems.length : 1000);

            setTotalItems(prev => ({ ...prev, [type]: total }));

            setBookings(prev => ({
                ...prev,
                [type]: newItems
            }));

            setHasMore(prev => ({
                ...prev,
                [type]: newItems.length === 50
            }));

            setPages(prev => ({
                ...prev,
                [type]: pageNum
            }));

        } catch (error) {
            console.error(`Fetch Error for ${type} →`, error);
        } finally {
            setLoading(false);
        }
    }, [historyType]); // Removed loading from dependencies to keep the function stable

    const handlePrevPage = () => {
        if (pages[activeTab] > 1) {
            fetchBookings(activeTab, pages[activeTab] - 1);
        }
    };

    const handleNextPage = () => {
        if (hasMore[activeTab]) {
            fetchBookings(activeTab, pages[activeTab] + 1);
        }
    };


    // Update the useEffect to use useCallback memoized loadMore
    React.useEffect(() => {
        const fetchInitialData = async () => {
            if (viewMode === "history" && bookings[activeTab].length === 0 && !loading) {
                await fetchBookings(activeTab, 1);
            }
        };

        fetchInitialData();
    }, [activeTab, viewMode, historyType, fetchBookings]); // Removed 'bookings' to break the loop
    const getBookings = () => bookings[activeTab] || [];

    const toggleBooking = (id) => {
        if (expandedBooking === id) {
            setExpandedBooking(null);
        } else {
            setExpandedBooking(id);
        }
    };

    return (
       <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white text-gray-800 font-['Inter',sans-serif] pb-12">
        
        {/* Header */}
           <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-10">
  
                 <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
                    <button
                        onClick={handleBack}
                        className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 mr-4 transition-all duration-300 hover:scale-110 active:scale-95 shadow-inner"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                        {viewMode === "selection" ? "Booking History" : (historyType === "all" ? "All Bookings" : "My Bookings")}
                    </h1>
                </div>
            </header>

            {viewMode === "selection" ? (
                <div className="max-w-3xl mx-auto mt-12 px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-[#1E3A8A] mb-3">Welcome Back!</h2>
                        <p className="text-gray-500 text-lg">Select which records you'd like to explore today.</p>
                    </div>

                    <div className={`${isAdmin ? "grid grid-cols-1 md:grid-cols-2" : "flex justify-center"} gap-8`}>
                        {/* My Bookings Card */}
                        <motion.button
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => {
                                setHistoryType("my");
                                setViewMode("history");
                                // Reset data for fresh fetch
                                setBookings({ upcoming: [], live: [], completed: [], "my-bookings": [], all: [] });
                                setPages({ upcoming: 0, live: 0, completed: 0, "my-bookings": 0, all: 0 });
                                setHasMore({ upcoming: true, live: true, completed: true, "my-bookings": true, all: true });
                            }}
                            className="bg-white group p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-blue-50 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                                <FiUser className="w-9 h-9" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">My Bookings</h3>
                            <p className="text-gray-500 mb-6">Access your personal bookings and check status.</p>
                            <div className="mt-auto flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all duration-300">
                                <span>Explore Now</span>
                                <FiChevronRight className="w-5 h-5" />
                            </div>
                        </motion.button>

                        {/* All Bookings Card (Admin Only) */}
                        {isAdmin && (
                            <motion.button
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                onClick={() => {
                                    setHistoryType("all");
                                    setViewMode("history");
                                    setActiveTab("upcoming");
                                    setBookings({ upcoming: [], live: [], completed: [], "my-bookings": [], all: [] });
                                    setPages({ upcoming: 0, live: 0, completed: 0, "my-bookings": 0, all: 0 });
                                    setHasMore({ upcoming: true, live: true, completed: true, "my-bookings": true, all: true });
                                }}
                                className="bg-white group p-8 rounded-[2.5rem] shadow-xl shadow-green-900/5 border border-green-50 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:shadow-green-900/10"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300">
                                    <FiLayers className="w-9 h-9" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">All Bookings</h3>
                                <p className="text-gray-500 mb-6">Monitor all traffic and bookings across the park.</p>
                                <div className="mt-auto flex items-center gap-2 text-green-600 font-bold group-hover:gap-4 transition-all duration-300">
                                    <span>Manage All</span>
                                    <FiChevronRight className="w-5 h-5" />
                                </div>
                            </motion.button>
                        )}
                    </div>
                </div>
            ) : (
                <>

                    {/* Tabs - Only show for All Bookings */}
                    {historyType === "all" && (
                        <div className="max-w-5xl mx-auto mt-4 px-4 sticky top-16 z-10 bg-gray-50 pt-2 pb-2">
                            <div className="flex border-b border-gray-200">
                                {["upcoming", "live", "completed"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-3 text-sm font-medium capitalize transition-all duration-300 relative ${activeTab === tab
                                            ? "text-blue-700"
                                            : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-700 rounded-t-full"></span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bookings List */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-5xl mx-auto px-4 mt-6 pb-20"
                    >
                        <div className="flex flex-col gap-4">
                            <h2 className="text-xl font-bold text-blue-900 mb-2">
                                Your Recent Bookings
                            </h2>

                            {loading && getBookings().length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                                    <p className="text-blue-900 font-medium animate-pulse">Fetching your {activeTab} bookings...</p>
                                </div>
                            ) : getBookings().length > 0 ? (
                                getBookings().map((booking, index) => {
                                    const isExpanded = expandedBooking === booking.id;
                                    const uniqueKey = `${booking.id}-${index}`;

                                    return (
                                        <motion.div
                                            key={uniqueKey}
                                            layout
                                            className="bg-white rounded-xl overflow-hidden shadow-sm border border-purple-100"
                                        >
                                            {/* Card Header (Always Visible) */}
                                            <div
                                                onClick={() => toggleBooking(booking.id)}
                                                className="p-4 cursor-pointer flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-700 shadow-sm">
                                                        {gameIcons[booking.game] || <GiSoccerBall className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-blue-900 text-lg capitalize text-left">{booking.game}</h3>
                                                        <p className="text-blue-400 text-sm font-medium text-left">{booking.date}</p>
                                                        <p className="text-blue-400 text-sm font-medium text-left">{booking.time}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <motion.div
                                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </motion.div>
                                                </div>
                                            </div>

                                            {/* Expanded Content */}
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="px-4 pb-4"
                                                >
                                                    {/* Status Badge */}
                                                    <div className="flex items-center gap-2 mb-4">
                                                        {booking.status === 'CONFIRMED' || booking.status === 'Paid' ? (
                                                            <FiCheckCircle className="w-5 h-5 text-green-500" />
                                                        ) : (
                                                            <FiClock className="w-5 h-5 text-yellow-500" />
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-blue-900">
                                                                {booking.status === 'CONFIRMED' || booking.status === 'Paid' ? 'Payment Successful' : 'Payment Information'}
                                                            </p>
                                                            <p className="text-blue-700 font-bold">Amount: ₹{booking.amount}</p>
                                                        </div>
                                                    </div>

                                                    {/* Notes / Info */}
                                                    <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 mb-4 text-green-800 text-sm flex items-start gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>{booking.notes || "No additional notes provided."}</span>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedBooking(booking);
                                                                setShowReceipt(true);
                                                            }}
                                                            className="bg-[#3B5998] hover:bg-[#2d4373] text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                            </svg>
                                                            View Receipt
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <FiCalendar className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No {activeTab} bookings found.</p>
                                    <p className="text-gray-400 text-sm mt-1">Book your first game to see it here!</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {viewMode === "history" && (
                            <div className="flex flex-col items-center gap-4 mt-10 pb-16">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={loading || pages[activeTab] <= 1}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-blue-700 font-bold rounded-2xl shadow-md border border-blue-50 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        <span>Previous</span>
                                    </button>

                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Page</span>
                                        <span className="text-blue-900 font-black text-xl">{pages[activeTab]}</span>
                                    </div>

                                    <button
                                        onClick={handleNextPage}
                                        disabled={loading || !hasMore[activeTab]}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-[#1E3A8A] text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                    >
                                        <span>Next</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                {loading && (
                                    <div className="flex items-center gap-2 text-blue-600 font-medium">
                                        <FaSpinner className="animate-spin" />
                                        <span className="text-sm">Loading records...</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}

            {/* Payment Success Modal (Simplified/Removed in favor of specific flow if needed, but keeping logic just in case) */}
            {selectedBooking && !showReceipt && false && (
                // Kept for backward compatibility if logic requires it, but user flow seems to go straight to receipt on button click
                // Or if this was for valid immediate payment success. 
                // For now, minimizing to avoid clutter since we want "View Receipt" to open Receipt directly.
                <></>
            )}

            {/* Receipt Modal */}
            {selectedBooking && showReceipt && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 font-['Inter',sans-serif]">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        id="receipt-content"
                        ref={receiptRef}
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-y-auto relative flex flex-col print:shadow-none print:rounded-none"
                        style={{ maxHeight: '90vh' }}
                    >
                        {/* Header Bar */}
                        <div className="bg-[#3B5998] text-white p-4 flex items-center justify-between">
                            <button
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition"
                                onClick={() => {
                                    setSelectedBooking(null);
                                    setShowReceipt(false);
                                }}
                            >
                                <FiArrowLeft className="w-6 h-6" />
                            </button>
                            <h2 className="text-lg font-medium">Receipt</h2>
                            <button
                                onClick={downloadReceipt}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                                title="Download Receipt"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar print:overflow-visible">
                            {/* Logo & Title */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-3 p-2">
                                    {/* Placeholder for Logo - You can replace with actual Image */}
                                    <GiSoccerBall className="w-full h-full text-[#1E3A8A]" />
                                </div>
                                <h2 className="text-xl font-bold text-[#3B5998] text-center">LearnFort Sports Park</h2>
                                <p className="text-gray-500 font-medium">Booking Receipt</p>
                                <p className="text-gray-400 text-xs italic mt-1">Receipt ID: #{selectedBooking.id}</p>
                            </div>

                            {/* Customer Details */}
                            <div className="mb-6">
                                <h3 className="text-[#1E3A8A] font-bold text-lg mb-3 text-center">Customer Details</h3>
                                <div className="space-y-3 px-2">
                                    <div className="flex justify-between">
                                        <span className="text-blue-300 font-medium">Name:</span>
                                        <span className="text-gray-700 font-medium text-right">{selectedBooking.customer.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-300 font-medium">Mobile:</span>
                                        <span className="text-gray-700 font-medium text-right">{selectedBooking.customer.phone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-300 font-medium">Email:</span>
                                        <span className="text-gray-700 font-medium text-right truncate max-w-[180px]">{selectedBooking.customer.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-300 font-medium">Native:</span>
                                        <span className="text-gray-700 font-medium text-right">{selectedBooking.customer.native}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="mb-6">
                                <h3 className="text-[#1E3A8A] font-bold text-lg mb-3 text-center">Booking Details</h3>
                                <div className="space-y-3 px-2">
                                    <div className="flex justify-between">
                                        <span className="text-blue-300 font-medium">Sport:</span>
                                        <span className="text-gray-700 font-medium text-right">{selectedBooking.game}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-300 font-medium">Date:</span>
                                        <span className="text-gray-700 font-medium text-right">{selectedBooking.date}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-300 font-medium">Time Slot:</span>
                                        {/* Use raw time or 24h format if that's what screenshot had, but user asked for 12h in list. 
                                            Screenshot 2 shows '19:00 - 20:00'. Let's stick to what's in list for consistency or 
                                            reuse formatTo12Hour if preferred. Screenshot shows 24h. I'll use list's format (12h) 
                                            as it's friendlier, but code above sets 'time' to 12h. 
                                        */}
                                        <span className="text-gray-700 font-medium text-right">{selectedBooking.time}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-300 font-medium">Duration:</span>
                                        <span className="text-gray-700 font-medium text-right">{selectedBooking.duration}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-300 font-medium">Turf:</span>
                                        <span className="text-gray-700 font-medium text-right">{selectedBooking.turf}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="mb-6">
                                <h3 className="text-[#1E3A8A] font-bold text-lg mb-3 text-center">Payment Details</h3>
                                <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-blue-300 font-medium">Amount:</span>
                                        <span className="text-gray-800 font-bold">₹{selectedBooking.amount}</span>
                                    </div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-blue-300 font-medium">Payment Mode:</span>
                                        <div className="text-right">
                                            <span className="text-gray-800 font-medium block">Online</span>
                                            <span className="text-gray-800 font-medium block">Payment</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center gap-2">
                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-green-600 font-bold uppercase text-sm">Paid</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <p className="text-[#3B5998] font-bold text-sm">Thank you for choosing</p>
                                <p className="text-[#3B5998] font-bold text-sm">LearnFort Sports Park!</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Pending Payment Modal */}
            {pendingBooking && !showPendingPayment && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6 relative">
                        <button
                            onClick={() => setPendingBooking(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <FiX className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <FiClock className="w-12 h-12 text-yellow-500 mb-3" />
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Payment Pending
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Your payment of{" "}
                                <span className="font-semibold text-yellow-700">
                                    $500
                                </span>{" "}
                                for {pendingBooking.game} booking is pending.
                            </p>
                            <button
                                onClick={() => setShowPendingPayment(true)}
                                className="bg-yellow-500 text-white px-5 py-2 rounded-full hover:bg-yellow-600 transition"
                            >
                                Pay Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Payment Details Modal */}
            {pendingBooking && showPendingPayment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        id="pending-receipt"
                        className="bg-gradient-to-b from-white via-yellow-50 to-white rounded-2xl shadow-2xl 
      w-full max-w-xs sm:max-w-sm p-4 relative border border-yellow-100"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setPendingBooking(null);
                                setShowPendingPayment(false);
                            }}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        >
                            <FiX className="w-4 h-4" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-3">
                            <div className="flex items-center justify-center mb-1">
                                {gameIcons[pendingBooking.game] || (
                                    <FiCalendar className="w-6 h-6 text-yellow-600" />
                                )}
                            </div>
                            <h3 className="text-base font-bold text-yellow-700">SportsPark</h3>
                            <p className="text-[10px] text-gray-500">Pending Payment Details</p>
                            <div className="mt-1 h-0.5 w-8 bg-yellow-500 mx-auto rounded-full"></div>
                        </div>

                        {/* Receipt Body */}
                        <div className="space-y-2 text-[12px] text-gray-700">
                            {/* Customer Info */}
                            <div className="bg-white rounded-lg shadow-inner p-2 border border-yellow-100">
                                <h4 className="font-semibold text-gray-900 mb-1 border-b pb-0.5 text-[11px]">
                                    Customer Details
                                </h4>
                                <div className="space-y-0.5">
                                    <p><b>Name:</b> John Doe</p>
                                    <p><b>Email:</b> john.doe@gmail.com</p>
                                    <p><b>Phone:</b> +91 9876543210</p>
                                </div>
                            </div>

                            {/* Booking Info */}
                            <div className="bg-white rounded-lg shadow-inner p-2 border border-yellow-100">
                                <h4 className="font-semibold text-gray-900 mb-1 border-b pb-0.5 text-[11px]">
                                    Booking Details
                                </h4>
                                <div className="space-y-0.5">
                                    <p><b>Game:</b> {pendingBooking.game}</p>
                                    <p><b>Date:</b> {pendingBooking.date}</p>
                                    <p><b>Time:</b> {pendingBooking.time}</p>
                                    <p><b>Duration:</b> {pendingBooking.duration}</p>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-white rounded-lg shadow-inner p-2 border border-yellow-100">
                                <h4 className="font-semibold text-gray-900 mb-1 border-b pb-0.5 text-[11px]">
                                    Payment Details
                                </h4>
                                <div className="space-y-0.5">
                                    <p><b>Due Amount:</b> $500</p>
                                    <p><b>Status:</b> <span className="text-yellow-600 font-medium">Pending</span></p>
                                    <p><b>Date:</b> {pendingBooking.date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-3 text-center border-t pt-2">
                            <p className="text-[10px] text-gray-600 leading-snug">
                                💛 <b>Thank You</b> for choosing <b>SportsPark!</b><br />
                                For support, contact us at{" "}
                                <a href="mailto:support@sportspark.com" className="text-yellow-600 underline">
                                    support@sportspark.com
                                </a>
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}


        </div>
    );
};

export default BookingsPage;
