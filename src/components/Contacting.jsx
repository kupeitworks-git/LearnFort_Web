import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiUser, FiPhone, FiMail, FiFileText, FiChevronDown, FiArrowLeft, FiMapPin } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {BaseUrl} from '../components/api/api'

const Contacting = () => {
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    mobileNumber: '',
    email: '',
    native: '',
    contactType: 'General Inquiry',
    notes: ''
  });

  const showToast = (message, type) => {
    setToast({ message, type });
    if (message) {
      setTimeout(() => {
        setToast({ message: '', type: '' });
      }, 3000);
    }
  };

  const contactTypes = [
    'General Inquiry',
    'Booking Assistance',
    'Feedback/Suggestions',
    'Partnership',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, fatherName, mobileNumber, email, native, contactType, notes } = formData;

    // Basic validation: required fields
    if (!name.trim()) {
      showToast('Please enter your name.', 'error');
      return;
    }
    if (!fatherName.trim()) {
      showToast("Please enter your father's name.", 'error');
      return;
    }
    if (!mobileNumber.trim()) {
      showToast('Please enter your mobile number.', 'error');
      return;
    }
    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    if (!native.trim()) {
      showToast('Please enter your native place.', 'error');
      return;
    }
    if (!notes.trim()) {
      showToast('Please write your notes.', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      father_name: fatherName.trim(),
      email: email.trim(),
      mobile: mobileNumber.trim(),
      native_place: native.trim(),
      country_code: '+91',
      message: notes.trim(),
      contact_type: contactType,
      device_id: 'web-device',
    };

    try {
      // Get auth token from stored user (set during login)
      let token = '';
      try {
        const stored = localStorage.getItem('lf_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed?.token || '';
        }
      } catch (err) {
        token = '';
      }

      if (!token) {
        showToast('Your session has expired. Please log in again to submit an enquiry.', 'error');
        return;
      }

      setIsSubmitting(true);

      const res = await fetch(`${BaseUrl}contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let message = 'Failed to submit enquiry';
        if (errorText) {
          try {
            const parsed = JSON.parse(errorText);
            message = parsed.message || parsed.error || message;
          } catch {
            message = errorText;
          }
        }
        throw new Error(message);
      }

      showToast('Your enquiry has been submitted successfully.', 'success');

      // Optionally clear the form
      setFormData({
        name: '',
        fatherName: '',
        mobileNumber: '',
        email: '',
        native: '',
        contactType: 'General Inquiry',
        notes: '',
      });
    } catch (err) {
      showToast(err.message || 'Something went wrong while submitting your enquiry.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => navigate(-1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-['Inter',sans-serif] flex flex-col">
      {/* Top header same style as other pages */}
      <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={handleBack}
            className="p-2 rounded-full bg-white/10 hover:bg-white/10 mr-4 transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">Contact Us</h1>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center py-8 px-4">
        <motion.div
          className="max-w-6xl w-full mx-auto bg-slate-900/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Left info column */}
          <div className="w-full md:w-1/2 px-8 py-10 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 flex flex-col justify-center relative overflow-hidden">

            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-left">Contact Us</h1>
            <p className="text-sm md:text-base text-slate-200/80 mb-8 max-w-md text-left">
              Have questions about bookings, facilities, or programs at LearnFort Sports Park? Share your details and our team will reach out to you shortly.
            </p>

            <div className="space-y-6 text-sm text-left">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <FiMapPin className="w-4 h-4" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-wider text-slate-200 uppercase">Address</p>
                  <div className="text-slate-200/90 text-sm leading-relaxed">
                    <span className="block font-semibold text-slate-50">LearnFort Sports Park</span>
                    <span>Batlagundu Road,</span>
                    <span>Bangalapatti,<br/> Nilakottai (Taluk),</span>
                    <span>Dindigul (Dist),<br/>Tamil Nadu, India - 624202</span>
                    
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <FiPhone className="w-4 h-4" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-wider text-slate-200 uppercase">Contact Numbers</p>
                  <div className="grid grid-cols-[110px_auto] gap-y-1 text-slate-200/90">
                    <span className="font-medium text-slate-50">Phone</span>
                    <span>+91 45432 45622</span>
                    <span className="font-medium text-slate-50">Mobile</span>
                    <span>+91 81247 45622</span>
                    <span className="font-medium text-slate-50">WhatsApp</span>
                    <span>+91 94441 23722</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <FiMail className="w-4 h-4" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-wider text-slate-200 uppercase">Email</p>
                  <div className="grid grid-cols-[110px_auto] gap-y-1 text-slate-200/90">
                    <span className="font-medium text-slate-50">Primary</span>
                    <span>info@learnfortsports.com</span>
                    <span className="font-medium text-slate-50">Support</span>
                    <span>learnfortsports@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right form column */}
          <div className="w-full md:w-1/2 bg-white text-gray-800 px-8 py-10 flex items-center">
            <form
              onSubmit={handleSubmit}
              className="w-full space-y-6"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Send Message</h2>
                <p className="text-xs text-gray-500 mt-1">Fill in your details and we will get back to you.</p>
              </div>

              {/* 2-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>

                {/* Father's Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Father’s Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your father's name"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your mobile number"
                      required
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your email address"
                    />
                  </div>
                </div>

                {/* Native */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Native
                  </label>
                  <input
                    type="text"
                    name="native"
                    value={formData.native}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your native place"
                  />
                </div>

                {/* Contact Type */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Contact Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <span
                        className={
                          formData.contactType === 'Select Contact Type'
                            ? 'text-gray-400'
                            : 'text-gray-800'
                        }
                      >
                        {formData.contactType}
                      </span>
                      <FiChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''
                          }`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-left">
                        {contactTypes.map((type, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                contactType: type
                              }));
                              setIsDropdownOpen(false);
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                          >
                            {type}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes (Full width) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Write your notes</label>
                <div className="relative">
                  <div className="absolute top-3 left-3">
                    <FiFileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your message here..."
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <div className="flex-1 flex flex-col items-stretch sm:flex-none sm:items-end gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center justify-center gap-2 py-2.5 px-8 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <FiSend className="h-4 w-4" />
                    {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                  </button>
                  {toast.message && (
                    <div
                      className={`text-xs sm:text-sm mt-1 text-left sm:text-right ${
                        toast.type === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {toast.message}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contacting;
