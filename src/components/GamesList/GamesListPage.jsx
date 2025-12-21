import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { BaseUrl } from "../api/api";
import { motion } from "framer-motion";
import { FaRunning } from "react-icons/fa";

const GamesListPage = () => {
  const navigate = useNavigate();
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch(`${BaseUrl}sports/list`);
        const data = await response.json();
        // Handle different API response structures just in case
        const sportsList = Array.isArray(data) ? data : (data.sports || data.data || []);
        setSports(sportsList);
      } catch (error) {
        console.error("Error fetching sports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  // Filter sports based on search
  const filteredSports = sports.filter((sport) =>
    sport.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-['Inter',sans-serif]">
      {/* Header */}
      <header className="bg-[#1E3A8A] text-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/10 transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
              Games & Facilities
            </h1>
          </div>
          {/* Search Bar (optional, added for "wonderful" UX) */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-full px-4 py-2 border border-blue-400/30 focus-within:bg-white/20 transition-all">
            <FiSearch className="text-blue-200 mr-2" />
            <input
              type="text"
              placeholder="Search sports..."
              className="bg-transparent border-none outline-none text-white placeholder-blue-200 text-sm w-40 md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-20">

        {/* Mobile Search (visible only on small screens) */}
        <div className="sm:hidden mb-6">
          <div className="flex items-center bg-white rounded-full px-4 py-3 shadow-sm border border-gray-200">
            <FiSearch className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search sports..."
              className="bg-transparent border-none outline-none text-gray-700 text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading sports...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSports.length > 0 ? (
              filteredSports.map((sport, index) => (
                <motion.div
                  key={sport._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => navigate(`/venue/${sport.name}`)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div className="relative h-48 sm:h-52 overflow-hidden">
                    {sport.image || sport.web_banner ? (
                      <img
                        src={sport.image || sport.web_banner}
                        alt={sport.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                        <FaRunning className="w-12 h-12 text-blue-300" />
                      </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-800 shadow-sm">
                      {sport.final_price_per_day ? `₹${sport.final_price_per_day}/slot` : 'Book Now'}
                    </div>

                    {/* Title over Image (optional style, or below) - choosing below for cleanliness, kept simple title on image */}
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold tracking-wide drop-shadow-md capitalize">
                        {sport.name}
                      </h3>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {sport.description || `Experience premium ${sport.name} facilities with LearnFort Sports Park.`}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        AVAILABLE NOW
                      </span>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="text-gray-400 w-8 h-8" />
                </div>
                <h3 className="text-gray-800 font-semibold text-lg">No sports found</h3>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesListPage;
