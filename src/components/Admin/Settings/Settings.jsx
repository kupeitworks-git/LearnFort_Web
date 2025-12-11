// src/components/Admin/Settings/Settings.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

const Settings = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem('lf_user');
      sessionStorage.removeItem('token');
    } catch (err) {
      // ignore storage errors
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">

      {/* Header */}
      <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/10 mr-4 transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            Settings
          </h1>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Security</h2>

        <div
          onClick={() => navigate('/change-password')}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center text-left">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <FiLock className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Change Password</h3>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
          </div>
          <FiArrowRight className="text-gray-400" />
        </div>

        <div
          onClick={handleLogout}
          className="mt-4 flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center text-left">
            <div className="p-2 bg-red-100 rounded-lg mr-4">
              <FiLock className="text-red-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Logout</h3>
              <p className="text-sm text-gray-500">Sign out from this account</p>
            </div>
          </div>
          <FiArrowRight className="text-gray-400" />
        </div>
      </div>

    </div>
  );
};

export default Settings;