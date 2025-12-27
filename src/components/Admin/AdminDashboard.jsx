import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiUsers,
  FiMail,
  FiImage,
  FiGrid,
  FiChevronRight,
  FiSettings,
} from "react-icons/fi";
import { useNavigate, Routes, Route } from "react-router-dom";
const AdminDashboard = ({ onBack }) => {
  const navigate = useNavigate();
  // Initialize state from local storage to avoid flicker
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("lf_user");
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      return null;
    }
  });

  // Removed useEffect for fetching user since we do it in initial state

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const displayName = user?.name || (user?.role === "ADMIN" ? "Admin" : user?.role === "SUPER_ADMIN" ? "Super Admin" : "User");

  // Framer Motion variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }, // Speed up stagger
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 }, // Reduce y distance
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }, // Speed up duration
  };

  const baseMenuItems = [
    {
      id: "profile",
      label: "My Profile",
      icon: <FiUser />,
      gradient: "bg-gradient-to-r from-blue-800 to-blue-600",
    },
    {
      id: "bookings",
      label: "Manage Bookings",
      icon: <FiCalendar />,
      gradient: "bg-gradient-to-r from-indigo-700 to-blue-600",
    },
    {
      id: "users",
      label: "Manage Users",
      icon: <FiUsers />,
      gradient: "bg-gradient-to-r from-blue-700 to-indigo-600",
    },
    {
      id: "contact",
      label: "Contact Us",
      icon: <FiMail />,
      gradient: "bg-gradient-to-r from-blue-600 to-indigo-500",
    },
    {
      id: "sports",
      label: "Manage Sports",
      icon: <FiGrid />,
      gradient: "bg-gradient-to-r from-blue-800 to-indigo-700",
    },
    {
      id: "gallery",
      label: "Manage Gallery",
      icon: <FiImage />,
      gradient: "bg-gradient-to-r from-indigo-600 to-blue-500",
    },

    {
      id: "settings",
      label: "Manage Settings",
      icon: <FiSettings />,
      gradient: "bg-gradient-to-r from-indigo-600 to-blue-500",
    },
  ];

  const menuItems = isAdmin
    ? baseMenuItems
    : baseMenuItems.filter((item) =>
      ["profile", "bookings", "settings"].includes(item.id)
    );

  const handleBack = () => (onBack ? onBack() : navigate("/"));
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuItemClick = (menuId) => {
    setActiveMenu(menuId);
    if (menuId === "profile") {
      navigate("/profile");
    } else if (menuId === "bookings") {
      navigate("/bookings");
    } else if (menuId === "users") {
      navigate("/users");
    } else if (menuId === "contact") {
      navigate("/contact");
    } else if (menuId === "sports") {
      navigate("/sports");
    } else if (menuId === "gallery")
      navigate("/gallery", {
        state: { fromAdmin: true }
      });
    else if (menuId === "settings")
      navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white text-gray-800 font-['Inter',sans-serif] pb-12">
      <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/10 mr-4 transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            Admin Dashboard
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <motion.main
        className="max-w-7xl mx-auto px-6 sm:px-8 py-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Welcome Section */}
        <motion.div
          variants={item}
          className="mb-8 bg-white rounded-2xl shadow-md p-6 border border-blue-100"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-blue-700 mb-2">
            {`Welcome Back, ${displayName} 👋`}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your sports park efficiently — handle bookings, users, sports
            facilities, and more, all in one place.
          </p>
        </motion.div>

        {/* Dashboard Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
        >
          {menuItems.map((menuItem) => (
            <motion.div
              key={menuItem.id}
              variants={item}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => handleMenuItemClick(menuItem.id)}
              className="bg-white border border-blue-100 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-5 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${menuItem.gradient} shadow-md`}
                >
                  {React.cloneElement(menuItem.icon, { className: "w-6 h-6" })}
                </div>
                <div>
                  <h3 className="text-gray-800 font-semibold text-base">
                    {menuItem.label}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1">Tap to manage</p>
                </div>
              </div>
              <FiChevronRight className="text-gray-400 group-hover:text-blue-500 transition" />
            </motion.div>
          ))}
        </motion.div>
      </motion.main>


    </div>
  );
};

export default AdminDashboard;
