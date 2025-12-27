import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiChevronRight, FiSearch, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "react-datepicker/dist/react-datepicker.css";
import { BaseUrl } from "../api/api";

// Gradient colors for different sports
const sportGradients = {
  cricket: "from-sky-400 to-blue-600",
  football: "from-blue-400 to-blue-700",
  badminton: "from-sky-300 to-blue-500",
  tennis: "from-blue-300 to-blue-600",
  basketball: "from-sky-400 to-indigo-600",
  'table-tennis': "from-blue-400 to-sky-600",
  volleyball: "from-sky-400 to-indigo-700",
  swimming: "from-cyan-400 to-blue-600",
  default: "from-gray-400 to-gray-600"
};

// Sport image base URL
const SPORT_IMAGE_BASE_URL = 'https://app.learnfortsports.com';

// Fallback image URL in case the API doesn't provide one
const DEFAULT_SPORT_IMAGE = 'https://via.placeholder.com/150';

// Function to get the full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return DEFAULT_SPORT_IMAGE;
  return imagePath.startsWith('http') ? imagePath : `${SPORT_IMAGE_BASE_URL}${imagePath}`;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const SportsCard = ({ sport, onClick }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [showMaintenancePopup, setShowMaintenancePopup] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (sport.status === 'NOT_AVAILABLE') {
      setShowMaintenancePopup(true);
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  const closePopup = (e) => {
    e.stopPropagation();
    setShowMaintenancePopup(false);
  };

  const isDisabled = sport.status === 'NOT_AVAILABLE';

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover={{ y: isDisabled ? 0 : -6, scale: isDisabled ? 1 : 1.03 }}
      className={`relative bg-white rounded-2xl p-6 border border-gray-100 shadow-md ${isDisabled ? 'cursor-default' : 'hover:shadow-2xl cursor-pointer group'}`}
      onClick={!isDisabled ? onClick : undefined}
    >
      {showMaintenancePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closePopup}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Note!</h3>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-4 text-left">This sport is currently under maintenance. Please try again later!</p>
            <button
              onClick={closePopup}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div
        className={`absolute inset-0 bg-gradient-to-br ${sport.gradient} opacity-0 ${!isDisabled ? 'group-hover:opacity-15' : ''} transition duration-500 rounded-2xl`}
      ></div>

      <div className="flex flex-col items-center text-center relative z-10">
        <div className="w-full h-40 rounded-xl overflow-hidden mb-4 shadow-md">
          <img
            src={getImageUrl(sport.image || sport.banner)}
            alt={sport.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_SPORT_IMAGE;
            }}
          />
        </div>
        <h3 className={`text-xl font-bold mb-4 ${isDisabled ? 'text-gray-500' : 'text-gray-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-sky-500'} transition-all`}>
          {sport.name}
        </h3>

        <motion.button
          whileHover={!isDisabled ? { scale: 1.05 } : { scale: 1 }}
          whileTap={!isDisabled ? { scale: 0.97 } : { scale: 0.98 }}
          onClick={handleClick}
          className={`px-4 py-2 rounded-full font-medium text-sm flex items-center shadow-md ${isDisabled
              ? 'bg-gray-300 text-gray-500 cursor-pointer hover:bg-gray-400'
              : 'bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:shadow-lg'
            }`}
        >
          {isDisabled ? 'Not Available' : 'Book Now'}
          {!isDisabled && <FiChevronRight className="ml-1" />}
        </motion.button>
      </div>
    </motion.div>
  );
};

const SportsList = ({ onBack }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [sports, setSports] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${BaseUrl}sports/list`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Handle the response structure
      const sportsData = result.sports || [];

      if (!sportsData || sportsData.length === 0) {
        setError('No sports available at the moment');
        setSports([]);
        return;
      }

      // Transform the data to match our expected format
      const formattedSports = sportsData.map(sport => ({
        id: sport._id || sport.name.toLowerCase().replace(/\s+/g, '-'),
        name: sport.name || 'Sport',
        gradient: sportGradients[sport.name ? sport.name.toLowerCase().replace(/\d+/g, '').trim() : ''] || sportGradients.default,
        image: sport.image || '',
        banner: sport.banner || '',
        price: sport.final_price_per_slot || 0,
        status: sport.status || 'AVAILABLE' // Add status with a default of 'AVAILABLE'
      }));

      setSports(formattedSports);
    } catch (err) {
      // console.error('Error fetching sports:', err);
      setError('Failed to load sports. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSports = sports.filter(
    (sport) => sport.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // ('Filtered Sports:', filteredSports); // Debug log

  const handleSportSelect = (sport) => {
    // Use sport ID in the URL for API calls
    navigate(`/book/${sport.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#EAF3FF] via-[#F3F8FF] to-[#E0EEFF] px-6 md:px-12 py-10 relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          whileHover={{ x: -4 }}
          className="flex items-center text-blue-600 mb-6 hover:text-blue-800 font-medium bg-transparent border-none focus:outline-none"
        >
          <FiArrowLeft className="mr-2" /> Back to Booking
        </motion.button>

        {/* Title */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-4xl font-extrabold text-center text-[#1E40AF] mb-10 tracking-wide"
        >
          Explore Available Sports
        </motion.h1>

        {/* Search and Filters */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
            <div className="relative flex-1 w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your favorite sport..."
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-white/80 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* <div className="flex items-center space-x-2 overflow-x-auto">
              {["all", "popular", "indoor", "outdoor", "team", "individual"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md"
                        : "bg-white/80 border border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                )
              )}
            </div> */}
          </div>
        </motion.div>

        {/* Sports Grid */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md h-64 animate-pulse">
                <div className="w-24 h-24 bg-gray-200 rounded-2xl mb-4 mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto mb-4"></div>
                <div className="h-10 bg-gray-200 rounded-full w-32 mx-auto"></div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to load sports</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchSports}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredSports.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-gray-800 mb-2">No sports found</h3>
              <p className="text-gray-600">Try adjusting your search or check back later.</p>
            </div>
          ) : (
            filteredSports.map((sport) => (
              <SportsCard
                key={sport.id}
                sport={sport}
                onClick={() => handleSportSelect(sport)}
              />
            ))
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-16 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >

        </motion.div>
      </div>
    </motion.div>
  );
};

export default SportsList;
