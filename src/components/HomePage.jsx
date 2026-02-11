import React, { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { BaseUrl } from './api/api';
import { FiSearch, FiBell, FiChevronLeft, FiChevronRight, FiChevronDown, FiMenu, FiX, FiMapPin, FiStar, FiClock, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// Lazy load components
const SportsList = React.lazy(() => import('./Booking/SportsList'));
// import Contacting from './Contacting'; // Unused
// import AdminDashboard from './Admin/AdminDashboard'; // Unused
import LearnFortLogo from '../images/LearnFort.png';
import Pagination from './common/Pagination';



const HomePage = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [direction, setDirection] = useState(0);
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
    { id: 'games', label: 'List Of Sports', submenu: [] }, // no submenu
    {
      id: 'book',
      label: 'Book Your Slot',
      submenu: [],
      onClick: () => {
        if (currentUser) {
          navigate('/explore-sports');
        } else {
          navigate('/login');
        }
      }
    },
    { id: 'gallery', label: 'Gallery', submenu: [] }, // ✅ changed
    { id: 'contact', label: 'Contact Us', submenu: [] },
    { id: 'about', label: 'About Us', submenu: ['Our Story', 'Facilities', 'Team'] },
    { id: 'terms', label: 'Terms & Conditions', submenu: [] },
    { id: 'privacy', label: 'Privacy Policy', submenu: [] },
    // { id: 'admin', label: 'Admin Only', submenu: ['Dashboard', 'Bookings', 'Users'] },
    // { id: 'logout', label: 'Logout', submenu: [] },
  ];



  // Fetch sports data using TanStack Query
  const fetchSports = async (page = 1) => {
    const limit = 8; // Number of items per page for infinite scroll
    const response = await fetch(`${BaseUrl}sports/list?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const sportsData = data.sports || (Array.isArray(data) ? data : (data.data || []));
    return {
      sports: sportsData,
      pagination: data.pagination || {
        currentPage: page,
        totalPages: 1,
        totalDocs: sportsData.length
      }
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loading
  } = useInfiniteQuery({
    queryKey: ['sports_home'],
    queryFn: ({ pageParam = 1 }) => fetchSports(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.totalPages) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
  });

  const sports = data?.pages.flatMap(page => page.sports) || [];

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0
  });



  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Preload banner image - REMOVED (caused issues). Implementing direct state change with animation.
  const goToBanner = (index, dir = 1) => {
    setDirection(dir);
    setCurrentBanner(index);
  };

  // Auto-rotate banners
  useEffect(() => {
    if (sports.length === 0) return;
    const timer = setInterval(() => {
      const nextIndex = (currentBanner + 1) % sports.length;
      goToBanner(nextIndex, 1);
    }, 5000);
    return () => clearInterval(timer);
  }, [sports, currentBanner]);

  // Preload adjacent images for smoother transitions
  useEffect(() => {
    if (sports.length === 0) return;

    const indicesToPreload = [
      (currentBanner + 1) % sports.length,
      (currentBanner + 2) % sports.length,
      (currentBanner - 1 + sports.length) % sports.length
    ];

    indicesToPreload.forEach(index => {
      if (sports[index]?.web_banner) {
        const img = new Image();
        img.src = sports[index].web_banner;
      }
    });
  }, [currentBanner, sports]);

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
      const nextIndex = (currentBanner + 1) % sports.length;
      goToBanner(nextIndex, 1);
    }
  };

  const prevBanner = () => {
    if (sports.length > 0) {
      const prevIndex = (currentBanner - 1 + sports.length) % sports.length;
      goToBanner(prevIndex, -1);
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
    return (
      <React.Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <SportsList onBack={() => setSelectedBookingType(null)} />
      </React.Suspense>
    );
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
              className="w-20 h-20 object-cover rounded-full shadow-md mb-2 border-2 border-white/30"
            />

            {/* Title */}
            <h1 className="text-base font-bold leading-tight tracking-wide">
              LearnFort Sports Park
            </h1>

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
            <div className="relative mb-10 rounded-3xl overflow-hidden h-64 shadow-lg bg-gray-100">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentBanner}
                  custom={direction}
                  variants={{
                    enter: (direction) => ({
                      x: direction > 0 ? "100%" : "-100%",
                      opacity: 0
                    }),
                    center: {
                      zIndex: 1,
                      x: 0,
                      opacity: 1
                    },
                    exit: (direction) => ({
                      zIndex: 0,
                      x: direction < 0 ? "100%" : "-100%",
                      opacity: 0
                    })
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={sports[currentBanner]?.web_banner}
                    alt={sports[currentBanner]?.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  {/* Clickable center area opens venue details */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/venue/${sports[currentBanner]?.name?.toLowerCase()}`)
                    }
                    className="absolute inset-0 bg-black/40 flex items-center justify-center w-full h-full focus:outline-none cursor-pointer"
                  >
                    <h2 className="text-3xl font-bold text-white tracking-wide drop-shadow-lg">
                      {sports[currentBanner]?.name}
                    </h2>
                  </button>
                </motion.div>
              </AnimatePresence>

              {/* Arrows (only slide, no navigation) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevBanner();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-2 shadow-md hover:scale-110 active:scale-95 transition-all z-10"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextBanner();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-2 shadow-md hover:scale-110 active:scale-95 transition-all z-10"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
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
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Trending Games</h2>
            <button
              onClick={() => navigate('/games')}
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm flex items-center gap-1"
            >
              View All <FiChevronRight />
            </button>
          </div>

          {loading ? (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sports.map((turf) => (
                  <div
                    key={turf._id}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={turf.image}
                        alt={turf.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-800 break-words">{turf.name}</h3>
                          <div className="flex items-center text-gray-500 text-xs mt-1">
                            <FiMapPin className="mr-1 flex-shrink-0" size={12} />
                            <span className="truncate">{turf.ground_name || 'LearnFort Sports Park'}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-blue-600 whitespace-nowrap">₹{turf.final_price_per_day}</p>
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider whitespace-nowrap">/ Slot</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${turf.status === 'NOT_AVAILABLE' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {turf.status === 'NOT_AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookNow(turf, e);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${turf.status === 'NOT_AVAILABLE'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'
                            }`}
                        >
                          {turf.status === 'NOT_AVAILABLE' ? 'Info' : 'Book Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Infinite Scroll Loader Sentinel */}
          {!loading && (
            <div ref={ref} className="mt-10 py-4 flex justify-center">
              {isFetchingNextPage ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-gray-500 font-medium">Loading more games...</p>
                </div>
              ) : hasNextPage ? (
                <div className="h-4"></div>
              ) : sports.length > 0 ? (
                <p className="text-sm text-gray-400 font-medium italic">— No more games to show —</p>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
