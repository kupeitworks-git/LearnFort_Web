import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiChevronDown, FiSun, FiMoon } from "react-icons/fi";
import { FaWifi, FaParking, FaTshirt, FaUtensils, FaDumbbell, FaChild } from "react-icons/fa";
import { BaseUrl } from "../api/api";

// Hardcoded facilities data (as requested by user)
const facilitiesData = {
    football: ["Night Lighting", "Changing Room", "Free Parking", "Drinking Water", "High-Speed WiFi"],
    cricket: ["Night Lighting", "Changing Room", "Food Court", "Free Parking", "Drinking Water"],
    tennis: ["Night Lighting", "Changing Room", "Gym Area", "Free Parking", "Drinking Water"],
    basketball: ["Night Lighting", "Changing Room", "Food Court", "Free Parking", "Drinking Water"],
    badminton: ["Night Lighting", "Changing Room", "High-Speed WiFi", "Free Parking", "Drinking Water"],
    swimming: ["Changing Room", "Free Parking", "Drinking Water", "Food Court"],
    default: ["Night Lighting", "Changing Room", "Free Parking", "Drinking Water"],
};

const VenueDetails = () => {
    const { sportType } = useParams();
    const navigate = useNavigate();
    
    // State declarations at the top level
    const [sportData, setSportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPriceDropdown, setShowPriceDropdown] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('day');
    
    // Remove the duplicate priceType state since we're using selectedPeriod

    // Fetch sport details from API
    useEffect(() => {
        const fetchSportDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${BaseUrl}sports/list`);
                const data = await response.json();
                const sportsList = Array.isArray(data) ? data : (data.sports || data.data || []);

                // Find the sport matching the URL param
                const match = sportsList.find(s => s.name.toLowerCase() === sportType.toLowerCase());

                if (match) {
                    setSportData(match);
                } else {
                    setError("Sport not found");
                }
            } catch (error) {
                console.error("Error fetching sport details:", error);
                setError("Failed to load sport details");
            } finally {
                setLoading(false);
            }
        };

        fetchSportDetails();
    }, [sportType]);

    // Get facilities for this sport (hardcoded)
    const facilities = facilitiesData[sportType] || facilitiesData.default;

    const sportLabel = sportType
        ? sportType
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : "Sport";

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading venue details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !sportData) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || "Venue not found"}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Format price with commas
    const formatPrice = (price) => {
        return price ? price.toLocaleString('en-IN') : '0';
    };

    // Facility icons mapping
    const facilityIcons = {
        'Night Lighting': <FiSun className="mr-2" />,
        'Rest Rooms': <FiSun className="mr-2" />,
        'Food Court': <FaUtensils className="mr-2" />,
        'Open Gym': <FaDumbbell className="mr-2" />,
        'Walking Path': <FiMapPin className="mr-2" />,
        "Children's Play Station": <FaChild className="mr-2" />,
        'Free Parking': <FaParking className="mr-2" />,
        'Changing Room': <FaTshirt className="mr-2" />,
        'High-Speed WiFi': <FaWifi className="mr-2" />,
        'default': <FiSun className="mr-2" />
    };

    // Use actual data from API
    const venue = {
        name: sportData.ground_name || sportData.name || "LearnFort Sports Venue",
        location: sportData.location || "Dindigul",
        image: sportData.image || sportData.web_banner,
        about: sportData.about || `A premium ${sportData.name} venue powered by LearnFort Sports Park, ideal for practice, coaching, and friendly matches.`,
        facilities: facilities,
        sportPriceType: sportData.sport_price_type || 'INDIVIDUAL',
        groundName: sportData.ground_name || 'Turf near store room',
        // Day pricing
        dayPrice: sportData.final_price_per_day || 0,
        dayActualPrice: sportData.actual_price_per_day || 0,
        // Night pricing
        nightPrice: sportData.final_price_per_day_light || 0,
        nightActualPrice: sportData.actual_price_per_day_light || 0,
        // Month pricing
        monthPrice: sportData.final_price_per_month || 0,
        monthActualPrice: sportData.actual_price_per_month || 0,
        // Month night pricing (fallback to day_light if not available)
        monthNightPrice: sportData.final_price_per_month_light || sportData.final_price_per_day_light || 0,
        monthNightActualPrice: sportData.actual_price_per_month_light || sportData.actual_price_per_day_light || 0,
        status: sportData.status || 'AVAILABLE'
    };
    
    // Get prices based on selected period
    const getPrices = () => {
        if (selectedPeriod === 'day') {
            return {
                dayPrice: venue.dayPrice,
                dayActualPrice: venue.dayActualPrice,
                nightPrice: venue.nightPrice,
                nightActualPrice: venue.nightActualPrice
            };
        } else {
            return {
                dayPrice: venue.monthPrice,
                dayActualPrice: venue.monthActualPrice,
                nightPrice: venue.monthNightPrice,
                nightActualPrice: venue.monthNightActualPrice
            };
        }
    };
    
    const { dayPrice, dayActualPrice, nightPrice, nightActualPrice } = getPrices();

    // selectedPeriod state is now at the top with other state declarations

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">

            {/* HERO IMAGE */}
            <div className="relative w-full h-60 md:h-80 overflow-hidden  shadow-lg">
                <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 bg-black/60 hover:bg-black/75 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm shadow-lg transition"
                >
                    <FiArrowLeft />
                    Back
                </button>
            </div>

            {/* Main card */}
            <div className="max-w-5xl mx-auto px-4 pb-16 mt-12">
                <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">

                    {/* Mobile Header Band */}
                    <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] text-white px-5 py-6 md:px-8 md:py-6 md:hidden">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100">
                            LearnFort Sports Park
                        </p>
                        <p className="text-[11px] text-blue-100/90 mt-1">{sportLabel} Venue</p>
                        <h1 className="text-2xl font-semibold mt-1">{venue.name}</h1>
                        <div className="flex items-center text-sm text-blue-100 mt-2">
                            <FiMapPin className="mr-1" />
                            {venue.location}
                        </div>
                        <div className="flex items-end gap-2 mt-4">
                            <span className="text-3xl font-bold">₹{venue.price}</span>
                            <span className="text-sm text-blue-100 mb-1">per slot</span>
                        </div>
                    </div>

                    {/* Grid Layout */}
                    <div className="md:px-8 md:py-10 px-5 py-6 grid md:grid-cols-[2fr,1.3fr] gap-10">

                        {/* LEFT SECTION — ABOUT + FACILITIES */}
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800 mb-3">
                                About {sportLabel}
                            </h2>

                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                {venue.about}
                            </p>


                            <h3 className="mt-8 text-xl font-semibold text-slate-800 mb-4">
                                Facilities Available
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {venue.facilities.map((facility) => (
                                    <div 
                                        key={facility}
                                        className="flex items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition"
                                    >
                                        {facilityIcons[facility] || facilityIcons.default}
                                        <span className="text-sm text-gray-700">{facility}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT SECTION — BOOKING CARD */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="mb-6">
                                
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Details</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium text-blue-600">Ground Name:</span> {venue.groundName}
                                    </p>
                                </div>
                            </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-500">Price per</span>
                                    <div className="relative w-32">
                                        <button 
                                            className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md text-sm"
                                            onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                                        >
                                            <span>{selectedPeriod === 'day' ? 'Day' : 'Month'}</span>
                                            <FiChevronDown className="text-gray-500" />
                                        </button>
                                        {showPriceDropdown && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                                <button 
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                                                    onClick={(e) => { 
                                                        e.stopPropagation();
                                                        setSelectedPeriod('day'); 
                                                        setShowPriceDropdown(false); 
                                                    }}
                                                >
                                                    Day
                                                </button>
                                                <button 
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                                                    onClick={(e) => { 
                                                        e.stopPropagation();
                                                        setSelectedPeriod('month'); 
                                                        setShowPriceDropdown(false); 
                                                    }}
                                                >
                                                    Month
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 mt-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        {/* <div className="flex items-center text-blue-700 mb-2">
                                            <FiSun className="mr-2" />
                                            <span className="font-medium">Day Time</span>
                                        </div> */}
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-500">Actual Price</p>
                                                <p className="text-red-500 text-sm line-through">
                                                    ₹{formatPrice(dayActualPrice)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Final Price</p>
                                                <p className="text-lg font-bold text-green-600">
                                                    ₹{formatPrice(dayPrice)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center text-gray-700 mb-2">
                                            <FiMoon className="mr-2" />
                                            <span className="font-medium">Lighting price for night time</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-500">Actual Price</p>
                                                <p className="text-red-500 text-sm line-through">
                                                    ₹{formatPrice(nightActualPrice)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Final Price</p>
                                                <p className="text-lg font-bold text-green-600">
                                                    ₹{formatPrice(nightPrice)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-4">
                                    {venue.status === 'AVAILABLE' ? (
                                        <span className="inline-flex items-center text-green-600 bg-green-100 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                            Available
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center text-red-600 bg-red-100 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
                                            Unavailable
                                        </span>
                                    )}
                                </p>

                                <button
                                    onClick={() => navigate(`/book/${sportType}`)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                >
                                    Book Now
                                </button>
                                
                                <p className="mt-3 text-xs text-center text-gray-500">
                                    Prices include all applicable taxes
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VenueDetails;
