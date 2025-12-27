import React, { useState, useEffect } from 'react';
import { BaseUrl } from './api/api';
import { FiSearch, FiBell, FiChevronLeft, FiChevronRight, FiChevronDown, FiMenu, FiX, FiMapPin, FiStar, FiClock, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import SportsList from './Booking/SportsList';
import Contacting from './Contacting';
import AdminDashboard from './Admin/AdminDashboard';
import LearnFortLogo from '../images/LearnFort.png';



const HomePage = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState('');
  const [selectedBookingType, setSelectedBookingType] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showMaintenancePopup, setShowMaintenancePopup] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);
  const navigate = useNavigate();

  // Menu items data
  // Menu items data
  const menuItems = [
    { id: 'games', label: 'Our Sports List', submenu: [] }, // no submenu
    {
      id: 'book',
      label: 'Book Slot',
      submenu: [],
      onClick: () => navigate('/explore-sports')
    },
    { id: 'gallery', label: 'Gallery', submenu: [] }, // ✅ changed
    { id: 'contact', label: 'Contact Us', submenu: [] },
    { id: 'about', label: 'About Us', submenu: ['Our Story', 'Facilities', 'Team'] },
    { id: 'terms', label: 'Terms & Conditions', submenu: [] },
    { id: 'privacy', label: 'Privacy Policy', submenu: [] },
    // { id: 'admin', label: 'Admin Only', submenu: ['Dashboard', 'Bookings', 'Users'] },
    // { id: 'logout', label: 'Logout', submenu: [] },
  ];



  // Fetch sports data
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  const closePopup = (e) => {
    e?.stopPropagation();
    setShowMaintenancePopup(false);
  };

  const handleBookNow = (sport, e) => {
    e?.stopPropagation();
    if (sport.status === 'NOT_AVAILABLE') {
      setSelectedSport(sport);
      setShowMaintenancePopup(true);
      return false; // Prevent default action
    }
    navigate(`/book/${sport.name?.toLowerCase()}`);
    return true;
  };

  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BaseUrl}sports/list`);
        const data = await response.json();
        // Handle response structure (assuming array or object with data property)
        const sportsList = Array.isArray(data) ? data : (data.sports || data.data || []);
        setSports(sportsList);
      } catch (error) {
        // console.error("Error fetching sports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (sports.length === 0) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % sports.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sports]);

  // Read logged-in user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lf_user');
      setCurrentUser(stored ? JSON.parse(stored) : null);
    } catch (err) {
      setCurrentUser(null);
    }
  }, []);

  const nextBanner = () => {
    if (sports.length > 0) {
      setCurrentBanner((prev) => (prev + 1) % sports.length);
    }
  };

  const prevBanner = () => {
    if (sports.length > 0) {
      setCurrentBanner((prev) => (prev - 1 + sports.length) % sports.length);
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleSubmenu = (menuId, item) => {
    if (menuId === 'games') {
      navigate('/games'); // ✅ redirect to Games page
      setIsDrawerOpen(false);
      return;
    } else if (menuId === 'book' && item && item.id) {
      setSelectedBookingType(item.id);
      setActiveSubmenu('');
    } else if (menuId === 'contact') {
      navigate('/contacting');
      setIsDrawerOpen(false);
      return;
    }
    else if (menuId === 'gallery') {
      navigate('/gallery'); // ✅ redirect to gallery page
      setIsDrawerOpen(false);
      return;
    }
    else if (menuId === 'admin') {
      navigate('/admin');
      setIsDrawerOpen(false);
    } else if (menuId === 'about') {
      navigate('/about');
      setIsDrawerOpen(false);

    }
    else if (menuId === 'contacting') {
      navigate('/contacting');
      setIsDrawerOpen(false);
    }
    else if (menuId === 'terms') {
      navigate('/terms');
      setIsDrawerOpen(false);
      return;
    }
    else if (menuId === 'privacy') {
      navigate('/privacy');
      setIsDrawerOpen(false);
      return;
    }
    else if (menuId === 'logout') {
      try {
        localStorage.removeItem('lf_user');
        sessionStorage.removeItem('token');
      } catch (err) {
        // ignore
      }
      setCurrentUser(null);
      navigate('/');
      setIsDrawerOpen(false);
      return;
    }
    else {
      setActiveSubmenu(activeSubmenu === menuId ? '' : menuId);
      setSelectedBookingType(null);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const renderSubmenu = (items, menuId) => (
    <div className="">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => toggleSubmenu(menuId, typeof item === 'string' ? { id: item.toLowerCase() } : item)}
          className="w-full px-4 py-3 text-left text-sm font-medium
           text-white bg-blue-700
           flex justify-between items-center
           rounded-xl shadow-md 
           hover:from-blue-700 hover:to-blue-600 
           hover:shadow-lg transition-all duration-300"

        >
          {typeof item === 'string' ? item : item.label}
        </button>
      ))}
    </div>
  );

  // Show sports list when a booking type is selected
  if (selectedBookingType) {
    return <SportsList onBack={() => setSelectedBookingType(null)} />;
  }


  // Show admin dashboard when admin is selected
  // if (showAdminDashboard) {
  //   return <AdminDashboard onBack={() => setShowAdminDashboard(false)} />;
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 bg-gradient-to-br from-indigo-50 via-blue-50 to-white">
        <div className="flex items-center justify-between p-4 bg-[#1E40AF] shadow-md sticky top-0 z-10 border-b border-blue-200">
          <div className="flex items-center space-x-4">
            {/* Menu Button */}
            <button
              onClick={toggleDrawer}
              className="p-2 rounded-md bg-white/10 transition-colors"
              aria-label="Open menu"
            >
              <FiMenu className="w-6 h-6 text-white" />

            </button>

            <h1 className="text-xl font-bold text-white">LearnFort Sports Park</h1>
          </div>
          <div className="flex items-center space-x-4  ">
            <button
              type="button"
              onClick={() => {
                if (currentUser) {
                  navigate('/admin');
                } else {
                  navigate('/login');
                }
              }}
              className="p-2 rounded-md bg-white/10 text-white transition-transform transform hover:scale-105"
            >
              <FiUser className="w-6 h-6 " />
            </button>
          </div>
        </div>
      </header>

      {/* Side Drawer */}
      {/* Side Drawer */}
      <div className={`fixed inset-0 z-50 ${isDrawerOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={closeDrawer}
        ></div>

        {/* Drawer Content */}
        <div className="absolute inset-y-0 left-0 w-72 bg-gradient-to-b from-[#1E3A8A] via-[#1E40AF] to-[#2563EB] shadow-2xl rounded-r-3xl transform transition-transform duration-300 ease-in-out text-white">
          {/* Drawer Header */}
          {/* Drawer Header */}
          <div className="p-5 border-b border-white/20 flex flex-col items-center text-center">
            {/* Logo */}
            <img
              src={LearnFortLogo}
              alt="LearnFort Logo"
              className="w-14 h-14 object-cover rounded-full shadow-md mb-2 border-2 border-white/30"
            />

            {/* Title */}
            <h1 className="text-base font-bold leading-tight tracking-wide">
              LearnFort Sports Park
            </h1>

            {/* Subtext */}
            <p className="text-xs text-blue-200 mt-1 italic">
              An unit of Eshvar Edu Foundation
            </p>

            {/* Close Button (top-right corner) */}
            <button
              onClick={closeDrawer}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close menu"
            >
              <FiX className="w-6 h-6 text-white" />

            </button>
          </div>

          {/* Menu Items */}
          <nav className="h-[calc(100%-140px)] overflow-y-auto py-4 px-2">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => item.onClick ? item.onClick() : toggleSubmenu(item.id)}
                    className={`w-full flex justify-between items-center px-5 py-3 rounded-lg transition-all
                      bg-blue-700 text-white font-semibold hover:bg-blue-600`}
                  >
                    <span>{item.label}</span>
                    {item.submenu && item.submenu.length > 0 && item.id !== "about" && item.id !== "admin" && (
                      <FiChevronDown
                        className={`w-4 h-4 transform transition-transform ${activeSubmenu === item.id ? "rotate-180 text-yellow-300" : ""}`}
                      />
                    )}
                  </button>

                  {/* Submenu */}
                  {activeSubmenu === item.id &&
                    item.submenu &&
                    item.submenu.length > 0 &&
                    renderSubmenu(item.submenu, item.id)}
                </li>
              ))}
            </ul>
          </nav>



        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Sports Banner Carousel */}
        {loading ? (
          <div className="relative mb-10 rounded-3xl overflow-hidden h-64 shadow-lg bg-gray-200 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          sports.length > 0 && (
            <div className="relative mb-10 rounded-3xl overflow-hidden h-64 shadow-lg">
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                style={{
                  backgroundImage: `url(${sports[currentBanner]?.web_banner})`
                }}
              >
                {/* Clickable center area opens venue details */}
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/venue/${sports[currentBanner]?.name?.toLowerCase()}`)
                  }
                  className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center w-full h-full focus:outline-none cursor-pointer"
                >
                  <h2 className="text-3xl font-bold text-white tracking-wide drop-shadow-lg">
                    {sports[currentBanner]?.name}
                  </h2>
                </button>
              </div>

              {/* Arrows (only slide, no navigation) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevBanner();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
              >
                <FiChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextBanner();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
              >
                <FiChevronRight className="w-6 h-6 text-gray-800" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {sports.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentBanner(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-all ${currentBanner === index ? 'bg-white' : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </div>
          )
        )}


        {/* Maintenance Popup */}
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

        {/* Available Turfs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Trending Games</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
                      <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                      <div className="h-8 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sports.map((turf) => (
                <div key={turf._id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={turf.image}
                      alt={turf.name}
                      className="w-full h-full object-cover"
                    />
                    {/* <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                    <FiStar className="mr-1" /> {turf.rating}
                  </div> */}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{turf.name || turf.name}</h3>
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                          <FiMapPin className="mr-1" size={14} />
                          <span>{turf.ground_name || 'LearnFort Sports Park'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {turf.actual_price_per_day && (
                          <span className="text-gray-400 text-sm line-through">₹{turf.actual_price_per_day}</span>
                        )}
                        <p className="text-lg font-bold text-blue-600">₹{turf.final_price_per_day}<span className="text-sm text-gray-500">/slot</span></p>
                      </div>
                    </div>
                    {/* <div className="flex items-center text-gray-500 text-sm mt-2">
                    <FiClock className="mr-1" size={14} />
                    <span>{turf.timings}</span>
                  </div> */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-500">{turf.distance}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(turf, e);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${turf.status === 'NOT_AVAILABLE'
                            ? 'bg-gray-300 text-gray-500 cursor-pointer hover:bg-gray-400'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                      >
                        {turf.status === 'NOT_AVAILABLE' ? 'Not Available' : 'Book Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
