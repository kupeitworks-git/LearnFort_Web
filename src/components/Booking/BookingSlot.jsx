import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiCalendar, FiClock, FiUsers, FiChevronLeft, FiLoader, FiFileText, FiX } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';
import BookingConfirmation from './BookingConfirmation';
import { toast } from 'react-toastify';
import { BaseUrl } from "../api/api";

const sportColors = {
  cricket: "from-amber-500 to-amber-600",
  football: "from-emerald-500 to-emerald-600",
  badminton: "from-blue-500 to-blue-600",
  tennis: "from-red-500 to-red-600",
  basketball: "from-orange-500 to-orange-600",
  "table-tennis": "from-purple-500 to-purple-600",
  default: "from-indigo-500 to-indigo-600",
  // Add more mappings if needed based on API names
};

const BookingSlot = () => {
  const { sportType } = useParams();
  const navigate = useNavigate();
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookingType, setBookingType] = useState('day'); // 'day' or 'month'
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    description: '',
  });
  const [sportData, setSportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSummary, setBookingSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const location = useLocation();

  const fetchAvailableSlots = async (date) => {
    if (!sportData?.id) {
      return;
    }

    try {
      setLoadingSlots(true);

      // Prepare params according to the backend API format
      const params = {
        sports_id: sportData.id.toString(),
      };

      if (bookingType === 'month' && date) {
        // For month view - ensure we have a valid date
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          throw new Error('Invalid date format');
        }

        // Get month as 3-letter abbreviation (JAN, FEB, etc.)
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const month = monthNames[dateObj.getMonth()];
        const year = dateObj.getFullYear();

        params.slot_type = 'MONTH';
        params.type_month = month;
        params.type_year = year;

      } else if (date) {
        // For day view
        params.date = date;
      } else {
        setAvailableSlots([]);
        return;
      }

      // Convert params to URLSearchParams
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${BaseUrl}booking/available-slots?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch available slots');
      }

      const responseData = await response.json();
      // Process the slots from the API response
      const slots = responseData?.slots || [];

      if (slots.length === 0) {
        setAvailableSlots([]);
        return;
      }

      // Process the slots to match our expected format
      const processedSlots = slots.map(slot => {
        let slotDate = slot.date;
        if (bookingType === 'month' && selectedDate) {
          // For month view, ensure we're using the correct date format
          const dateObj = new Date(selectedDate);
          const [hours, minutes] = slot.start_time.split(':');
          dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          slotDate = dateObj.toISOString().split('T')[0];
        }

        return {
          ...slot,
          _id: slot._id || `${sportType}-${slotDate}-${slot.start_time}-${slot.end_time}`,
          startTime: slot.start_time,
          endTime: slot.end_time,
          available: slot.status === 'AVAILABLE',
          price: slot.total_price || slot.price || slot.sports?.final_price_per_day || 0,
          sportName: slot.sports?.name || sportData?.name || 'Sport',
          sportId: slot.sports_id || sportType,
          date: slotDate,
          status: slot.status || 'AVAILABLE'
        };
      });

      setAvailableSlots(processedSlots);

    } catch (error) {
      // console.error('Error fetching available slots:', error);
      toast.error(`Error: ${error.message || 'Failed to load available slots. Please try again.'}`);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Fetch sport details on component mount
  useEffect(() => {
    const fetchSportDetails = async () => {
      try {
        setLoading(true);

        // First, try to fetch all sports and find by name
        const response = await fetch(`${BaseUrl}sports/list`);
        if (!response.ok) {
          throw new Error('Failed to fetch sports list');
        }

        const data = await response.json();
        // Convert sportType to a URL-friendly format for comparison
        const formattedSportType = sportType.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Try to find by name first (case insensitive and URL-friendly)
        const selectedSport = data.sports?.find(sport => {
          // Create URL-friendly name for comparison
          const sportNameUrl = sport.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return sportNameUrl === formattedSportType ||
            sport._id === sportType ||
            sport.name.toLowerCase() === sportType.toLowerCase();
        });

        if (selectedSport) {
          setSportData({
            id: selectedSport._id,
            name: selectedSport.name,
            price: selectedSport.final_price_per_day || 200,
            description: selectedSport.about || `Book your ${selectedSport.name} slot now!`,
            image: selectedSport.imageUrl || (selectedSport.image ? `https://app.learnfortsports.com/${selectedSport.image}` : '')
          });

          // Update URL to use the sport name if it's not already
          const sportNameUrl = selectedSport.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          if (sportNameUrl !== sportType) {
            window.history.replaceState(null, '', `/book/${sportNameUrl}`);
          }
        } else {
          // Fallback if sport not found
          const sportName = sportType
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          setSportData({
            id: sportType,
            name: sportName,
            price: 200,
            description: `Book your ${sportName} slot now!`
          });
        }
      } catch (error) {
        // console.error('Error fetching sport details:', error);
        toast.error('Failed to load sport details');
      } finally {
        setLoading(false);
      }
    };

    fetchSportDetails();
  }, [sportType]);

  // Fetch available slots when date or booking type changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, bookingType]);

  const sportName = sportData?.name || sportType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const todayStr = new Date().toISOString().split('T')[0];

  const isPastSlot = (slot) => {
    if (!selectedDate) return false;

    const [startTime] = slot.split(' - ');
    const [time, period] = startTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) hours += 12;

    const now = new Date();
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hours, minutes, 0, 0);

    return slotDate < now;
  };

  // Check if a slot is available
  const isSlotAvailable = (slot) => {
    if (!slot) return false;

    // For month view, we need to check if the slot's month and year match the selected month
    if (bookingType === 'month' && selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      const selectedMonth = selectedDateObj.getMonth();
      const selectedYear = selectedDateObj.getFullYear();

      // Check if slot's month and year match the selected month and year
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const slotMonth = monthNames.indexOf(slot.type_month);
      const slotYear = parseInt(slot.type_year);

      const isMatchingMonthYear =
        slotMonth === selectedMonth &&
        slotYear === selectedYear;

      return slot.status === 'AVAILABLE' && isMatchingMonthYear;
    }

    // For day view, just check the status
    return slot.status === 'AVAILABLE';
  };

  const formatTimeSlot = (startTime, endTime) => {
    const formatTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';

    // Ensure we're working with the correct timezone
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    if (bookingType === 'month') {
      return date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'long',
        year: 'numeric'
      });
    }

    return date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlots([]); // Reset selected slots when date changes

    // If in month view, fetch slots for the selected month
    if (bookingType === 'month' && date) {
      fetchAvailableSlots(date);
    }
  };

  const handleBookingTypeChange = (e) => {
    const newType = e.target.value;
    setBookingType(newType);

    // Clear all selections when changing booking type
    setSelectedDate('');
    setSelectedSlots([]);
    setAvailableSlots([]);

    // Clear any existing date input
    const dateInput = document.querySelector('input[type="date"], input[type="month"]');
    if (dateInput) dateInput.value = '';
  };

  const handleSlotSelect = (slot) => {
    if (!isSlotAvailable(slot)) return;

    setSelectedSlots(prev => {
      const isSelected = prev.some(s =>
        s.start_time === slot.start_time &&
        s.end_time === slot.end_time &&
        s.date === slot.date
      );

      if (isSelected) {
        return prev.filter(s =>
          !(s.start_time === slot.start_time &&
            s.end_time === slot.end_time &&
            s.date === slot.date)
        );
      } else {
        return [...prev, { ...slot }];
      }
    });
  };

  const handleProceedToPayment = async () => {
    if (selectedSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }

    // Check if user is logged in
    let token = '';
    try {
      const stored = localStorage.getItem('lf_user');
      if (!stored) {
        // Redirect to login page if user is not logged in
        toast.info('Please login to continue with booking');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      const parsed = JSON.parse(stored);
      token = parsed?.token || '';

      if (!token) {
        toast.info('Please login to continue with booking');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
    } catch (err) {
      // console.error('Error getting auth token:', err);
      toast.error('An error occurred. Please try again.');
      return;
    }

    try {
      setLoadingSummary(true);

      // Prepare the times array from selected slots
      const times = selectedSlots.map(slot => ({
        start_time: slot.startTime,
        end_time: slot.endTime
      }));

      // Create the booking object
      const booking = {
        slot_type: bookingType === 'day' ? 'DAY' : 'MONTH',
        booking_date: selectedDate, // Just the date part, no time
        times: times
      };

      // For month view, add month and year
      if (bookingType === 'month' && selectedDate) {
        const date = new Date(selectedDate);
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        booking.type_month = monthNames[date.getMonth()];
        booking.type_year = date.getFullYear().toString();
      }

      // Create the final payload
      const payload = {
        sports_id: sportData?.id || '',
        no_of_players: parseInt(bookingDetails.players) || 1,
        bookings: [booking]
      };

      const response = await fetch(`${BaseUrl}booking/booking-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get booking summary');
      }

      const result = await response.json();

      // Process the response to ensure all required fields are present
      const processedSummary = {
        ...result,
        // Ensure we have the sport name from the response or fallback to the one from props
        sportName: result?.ground?.sport || result?.slots?.[0]?.sport_name || sportData?.name || 'Not specified',
        // Ensure we have the number of players
        no_of_players: result?.no_of_players || parseInt(bookingDetails.players) || 1,
        // Ensure we have the total amount
        total_amount: result?.total_amount || result?.totalAmount || 0,
        // Ensure we have the currency
        currency: result?.currency || 'INR',
        // Include the slots data
        slots: result?.slots || [{
          booking_date: selectedDate,
          start_time: selectedSlots[0]?.startTime,
          end_time: selectedSlots[0]?.endTime,
          sport_name: sportData?.name
        }]
      };

      // Update booking details with the processed summary
      setBookingDetails(prev => ({
        ...prev,
        sport: processedSummary?.ground?.sport || sportData?.name || 'Not specified',
        date: selectedDate,
        time: `${selectedSlots[0]?.startTime} - ${selectedSlots[0]?.endTime}`,
        players: processedSummary?.no_of_players || 1,
        price: processedSummary?.total_amount || 0,
        currency: processedSummary?.currency || 'INR',
        timeSlot: `${selectedSlots[0]?.startTime} - ${selectedSlots[0]?.endTime}`
      }));

      // Store the processed booking summary
      setBookingSummary(processedSummary);

      // Show the confirmation dialog
      setShowConfirmation(true);

    } catch (error) {
      // console.error('Error getting booking summary:', error);
      toast.error(error.message || 'Failed to get booking summary. Please try again.');
    } finally {
      setLoadingSummary(false);
    }
  };
  const handleConfirmBooking = async (formData) => {
    try {
      if (!sportData?.id || selectedSlots.length === 0) {
        throw new Error('Invalid booking data');
      }

      // Prepare the base payload
      const bookingPayload = {
        start_time: selectedSlots[0].startTime,
        end_time: selectedSlots[0].endTime,
        payment_method: formData.paymentMethod || 'online', // Default to online payment if not specified
      };

      // Add date or month/year based on booking type
      if (bookingType === 'day') {
        bookingPayload.booking_date = selectedDate;
      } else {
        const [year, month] = selectedDate.split('-');
        bookingPayload.type_month = month;
        bookingPayload.type_year = year;
      }

      // Prepare the final payload
      const payload = {
        sports_id: sportData.id,
        payment_method: bookingPayload.payment_method,
        bookings: [bookingPayload],
      };

      const response = await fetch(`${BaseUrl}booking/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any required authentication headers here
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to confirm booking');
      }

      // Show success message
      toast.success('Booking confirmed successfully!');

      // Reset form
      setShowConfirmation(false);
      setSelectedSlots([]);
      setSelectedDate('');

      // Optionally navigate to booking confirmation page or user's bookings
      // navigate('/my-bookings');

    } catch (error) {
      // console.error('Error confirming booking:', error);
      toast.error('Failed to confirm booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-4 md:p-8">
        <div className="max-w-5xl mx-auto animate-pulse">
          {/* Header Skeleton */}
          <div className="h-16 bg-blue-200 rounded-lg mb-10 w-full"></div>

          {/* Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
            {/* Left Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date Skeleton */}
              <div className="h-24 bg-gray-200 rounded-2xl"></div>
              {/* Time Slots Headers */}
              <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
              {/* Time Slots Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Right Section (Summary) */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-96 border border-gray-100 p-6 space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-24 bg-gray-100 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-12 bg-gray-200 rounded-xl w-full mt-6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/10 mr-4 transition"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
              {sportName} Slot
            </h1>
          </div>
        </header>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Choose Date */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <div className="w-full sm:w-32 relative group">
                  <div className="absolute -top-2 left-3 px-1 bg-white text-sm font-medium z-10">
                    Slot Type
                  </div>
                  <select
                    className="w-full p-3 rounded-lg border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                    value={bookingType}
                    onChange={handleBookingTypeChange}
                  >
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                  </select>
                </div>
                <div className="flex-1 relative group">
                  <div className="absolute -top-2 left-3 px-1 bg-white text-sm font-medium z-10">
                    {bookingType === 'day' ? 'Date' : 'Month'}
                  </div>
                  {bookingType === 'month' ? (
                    <DatePicker
                      selected={selectedDate ? new Date(selectedDate) : null}
                      onChange={(date) => {
                        if (!date) return;
                        // Set to the first day of the selected month
                        const firstDayOfMonth = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
                        setSelectedDate(firstDayOfMonth.toISOString().split('T')[0]);
                        // Force a re-render to update the display
                        fetchAvailableSlots(firstDayOfMonth.toISOString().split('T')[0]);
                      }}
                      minDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)} // First day of next month
                      maxDate={new Date(new Date().getFullYear() + 2, 11, 31)} // End of 2 years from now
                      dateFormat="MMM yyyy"
                      showMonthYearPicker
                      className="w-full p-3 rounded-lg border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                      wrapperClassName="w-full"
                      placeholderText="Select month"
                      showFullMonthYearPicker
                      showDisabledMonthNavigation
                      useWeekdaysShort={false}
                      useShortMonth
                      filterDate={(date) => {
                        // Only allow selection of the 1st of each month
                        return date.getDate() === 1;
                      }}
                      filterMonth={(date) => {
                        // Only allow future months (after current month)
                        const now = new Date();
                        const currentYear = now.getFullYear();
                        const currentMonth = now.getMonth();

                        // If the year is in the future, allow all months
                        if (date.getFullYear() > currentYear) return true;

                        // If it's the current year, only allow future months
                        if (date.getFullYear() === currentYear) {
                          return date.getMonth() > currentMonth;
                        }

                        // Past years not allowed
                        return false;
                      }}
                    />
                  ) : (
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                      placeholder="Select date"
                    />
                  )}
                </div>
              </div>
            </div>
            {/* Available Time Slots */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedDate
                    ? `Available Slots for ${bookingType === 'month'
                      ? new Date(selectedDate).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })
                      : new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    }`
                    : 'Available Slots'}
                </h2>

              </div>

              {loadingSlots ? (
                <div className="flex justify-center py-8">
                  <div className="flex items-center text-blue-600">
                    <FiLoader className="animate-spin mr-2" /> Loading slots...
                  </div>
                </div>
              ) : !selectedDate ? (
                <div className="text-center py-8 text-gray-500">
                  Please select a {bookingType === 'day' ? 'date' : 'month'} to see available slots
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No slots available for the selected {bookingType === 'day' ? 'date' : 'month'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSlots
                    .filter(slot => {
                      // For month view, only show slots for the selected month
                      if (bookingType === 'month' && selectedDate) {
                        const selectedDateObj = new Date(selectedDate);
                        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                        const slotMonth = slot.type_month;
                        const slotYear = parseInt(slot.type_year);

                        return (
                          monthNames[selectedDateObj.getMonth()] === slotMonth &&
                          selectedDateObj.getFullYear() === slotYear
                        );
                      }
                      return true; // For day view, show all slots
                    })
                    .map((slot, index) => {
                      const slotTime = formatTimeSlot(slot.startTime, slot.endTime);
                      const isPast = isPastSlot(slotTime);
                      const isBooked = slot.status !== 'AVAILABLE';
                      const isDisabled = isPast || isBooked;
                      const isSelected = selectedSlots.some(s =>
                        s.startTime === slot.startTime &&
                        s.endTime === slot.endTime &&
                        s.date === slot.date
                      );

                      return (
                        <div
                          key={index}
                          onClick={() => {
                            if (!isDisabled) {
                              handleSlotSelect(slot);
                            }
                          }}
                          className={`
                          p-4 rounded-lg border text-center transition-all
                          ${isSelected && !isDisabled
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : isDisabled
                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                            }
                        `}
                        >
                          <div className="font-medium">{slotTime}</div>
                          {!slot.available && (
                            <div className="text-xs text-green-500 font-semibold mt-1">Booked</div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Right Section (Booking Summary) */}
          <div>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden sticky top-8 border border-gray-100">
              <div className="p-6 border-b bg-indigo-50">
                <h2 className="text-xl font-semibold text-gray-800">
                  Booking Summary
                </h2>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 rounded-lg bg-indigo-100 mr-4">
                    <FiUsers className="text-2xl text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-700">Number of Players</h3>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => {
                          setBookingDetails(prev => {
                            const newPlayers = Math.max(1, (prev.players || 1) - 1);
                            return {
                              ...prev,
                              players: newPlayers
                            };
                          });
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{bookingDetails.players || 1}</span>
                      <button
                        onClick={() => {
                          setBookingDetails(prev => {
                            const newPlayers = (prev.players || 1) + 1;
                            return {
                              ...prev,
                              players: newPlayers
                            };
                          });
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                {/* Description Textarea */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">

                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows="3"
                    placeholder="Write Your Notes (Optional)"
                    value={bookingDetails.description || ''}
                    onChange={(e) => setBookingDetails(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sport:</span>
                    <span className="font-medium">{sportData?.name || 'Loading...'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {selectedDate
                        ? new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                        : 'Not selected'}
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">

                    {selectedSlots.length > 0 ? (
                      <div className="space-y-3 max-h-20 overflow-y-auto pr-2">

                        {/* <div className="pt-2 border-t border-gray-200 mt-4">
                          <div className="flex justify-between items-center font-medium text-gray-900">
                            <span>Total ({selectedSlots.length} slots):</span>
                            <span>₹{selectedSlots.reduce((sum, slot) => sum + (slot.price || 0), 0)}</span>
                          </div>
                        </div> */}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic"></p>
                    )}
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    disabled={selectedSlots.length === 0 || loadingSummary}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${selectedSlots.length > 0 && !loadingSummary
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    {loadingSummary ? (
                      <>
                        <FiLoader className="animate-spin mr-2" /> Loading...
                      </>
                    ) : selectedSlots.length > 0 ? (
                      `Book Now (${selectedSlots.length} ${selectedSlots.length === 1 ? 'slot' : 'slots'})`
                    ) : (
                      'Select Slots to Continue'
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-2">
                    You'll be able to review your booking before payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <BookingConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmBooking}
        bookingDetails={bookingDetails}
        showPersonalInfo={false} // Skip personal info step
        summaryData={bookingSummary}
        selectedSlots={selectedSlots}
        sportName={sportData?.name}
        bookingType={bookingType}
      />
    </div>
  );
};

export default BookingSlot;
