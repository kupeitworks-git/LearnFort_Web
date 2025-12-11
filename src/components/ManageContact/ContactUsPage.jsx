import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiClock, FiX, FiLoader, FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { BaseUrl } from "../api/api";

const ContactUsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [reply, setReply] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMarkReadConfirm, setShowMarkReadConfirm] = useState(false);
  const [issues, setIssues] = useState({ reply: [], completed: [], unread: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [issueToMark, setIssueToMark] = useState(null);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Get user data from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("lf_user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
    }
  }, []);

  // Fetch enquiries based on user role
  const fetchEnquiries = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      let url = '';
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        url = `${BaseUrl}contact/admin-enquiries?page=1&limit=100`;
      } else {
        url = `${BaseUrl}contact/user-enquiries/${user._id}?page=1&limit=100`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch enquiries');
      }

      const data = await response.json();
      const allEnquiries = data.enquiries || [];

      const formattedData = {
        pending: allEnquiries.filter(item => item.reply_status === 'PENDING'),
        completed: allEnquiries.filter(item => item.reply_status === 'REPLIED'),
        unread: allEnquiries.filter(item => item.admin_read_status === 'UNREAD')
      };

      console.log('Formatted data:', formattedData);
      setIssues(formattedData);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setError(err.message || 'Failed to load enquiries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [user, activeTab]);

  const getIssues = () => issues[activeTab] || [];
  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  const handleSendReply = async () => {
    if (reply.trim() === "" || isSendingReply) return;


    try {
      setIsSendingReply(true);
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${BaseUrl}contact/reply/${selectedIssue._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reply })
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      // Show success message
      setShowSuccess(true);

      // Refresh the issues list
      await fetchEnquiries();

      // Close the popup after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedIssue(null); // This will close the popup
        setReply("");
      }, 500);

    } catch (err) {
      console.error('Error sending reply:', err);
      setError(err.message || 'Failed to send reply');
    } finally {
      setIsSendingReply(false); // Make sure to re-enable the button in case of error
    }
  };
  const handleMarkAsRead = async () => {
    if (!issueToMark) return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${BaseUrl}contact/mark-admin-read/${issueToMark._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      // Refresh the issues list
      fetchEnquiries();
      setShowMarkReadConfirm(false);
      setIssueToMark(null);
    } catch (err) {
      console.error('Error marking as read:', err);
      setError(err.message || 'Failed to mark as read');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white text-gray-800 font-['Inter',sans-serif] relative">
      <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/10 mr-4 transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            Contact Enquiries
          </h1>
        </div>
      </header>


      {/* Tabs */}
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <div className="flex flex-wrap justify-center gap-2 bg-white p-2 rounded-2xl shadow-md border border-blue-100">

          {[
            { id: "pending", label: "Pending" },
            { id: "unread", label: "Unread" },
            { id: "completed", label: "Completed" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
          min-w-[120px]       /* 🔥 Increased width */
          flex items-center justify-center gap-2 /* keeps count beside label */
          px-5 py-2 rounded-full text-sm font-medium 
          text-center transition-all duration-300 
          ${activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-blue-600"
                }
        `}
            >
              {/* Label */}
              <span>{tab.label}</span>

              {/* Unread Counter (inline) */}
              {tab.id === "unread" && issues.unread.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {issues.unread.length}
                </span>
              )}
            </button>
          ))}

        </div>
      </div>


      {/* Issues List */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto px-4 mt-8"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-blue-700">
            {activeTab === "pending" && "Pending Issues"}
            {activeTab === "unread" && "Unread Issues"}
            {activeTab === "completed" && "Completed Issues"}
          </h2>
          {activeTab === "unread" && issues.unread.length > 0 && (
            <button
              onClick={() => {
                setIssueToMark(issues.unread[0]);
                setShowMarkReadConfirm(true);
              }}
              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition"
            >
              Mark as Read
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {getIssues().length > 0 ? (
            getIssues().map((issue) => (
              <motion.div
                key={issue.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedIssue(issue)}
                className={`bg-white border border-blue-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-between cursor-pointer`}
              >
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-lg font-bold shadow-md relative">
                    {issue.name ? issue.name.charAt(0).toUpperCase() : '?'}
                    {issue.admin_read_status === "UNREAD" && (
                      <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {issue.contact_type && (
                  <h3 className="text-blue-500 font-semibold text-sm text-left whitespace-normal break-words">
                     {issue.contact_type}
                    </h3>
                    )}
                    <h3 className="text-gray-800  text-sm text-left whitespace-normal break-words">
                      <span className="font-medium">Message:</span>  {issue.message}
                    </h3>

                    <p className="flex items-center space-x-1 text-xs text-gray-500 mt-1 whitespace-normal break-words">
                      <span className="font-medium">From:</span> {issue.name}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                      <FiClock className="w-3 h-3 flex-shrink-0" />
                      <span className="whitespace-normal break-words">
                        {new Date(issue.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex space-x-2">
                    {activeTab === 'pending' ? (
                      // In Pending tab
                      <>
                        {issue.admin_read_status === 'UNREAD' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIssueToMark(issue);
                              setShowMarkReadConfirm(true);
                            }}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200 transition whitespace-nowrap"
                          >
                            Mark as Read
                          </button>
                        ) : (
                          <span
                            className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded whitespace-nowrap cursor-not-allowed"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Read
                          </span>
                        )}
                        {issue.reply_status === 'PENDING' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIssue(issue);
                            }}
                            className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded hover:bg-yellow-200 transition whitespace-nowrap"
                          >
                            Reply
                          </button>
                        )}
                      </>
                    ) : (
                      // In Completed tab
                      <>
                        <span
                          onClick={(e) => {
                            if (issue.reply_status === 'REPLIED') {
                              e.stopPropagation();
                              setSelectedIssue(issue);
                            }
                          }}
                          className={`text-xs px-2 py-0.5 rounded whitespace-nowrap cursor-pointer ${issue.reply_status === 'REPLIED'
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                          {issue.reply_status === 'REPLIED' ? 'Read' : 'No Reply'}
                        </span>
                      </>
                    )}
                  </div>
                  {/* <span
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap ${
                      issue.reply_status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {issue.reply_status === "PENDING" ? "Pending" : "Replied"}
                  </span> */}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-10">
              No {activeTab} issues found.
            </p>
          )}
        </div>
      </motion.div>

      {/* Reply Modal */}
      {/* Mark as Read Confirmation Modal */}
      {showMarkReadConfirm && issueToMark && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative"
          >
            <button
              onClick={() => setShowMarkReadConfirm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mark as Read!</h3>
              <p className="text-gray-600 mb-6">Do you want to mark this enquiry as read?</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowMarkReadConfirm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAsRead}
                  className="px-6 py-2 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reply Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative"
          >
            <button
              onClick={() => setSelectedIssue(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-blue-700 mb-2">
              Reply to {selectedIssue.customer}
            </h2>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">{selectedIssue.issue}</span>
            </p>
            <p className="text-sm text-gray-500 italic border-l-4 border-blue-200 pl-3 mt-2 mb-4">
              "{selectedIssue.message}"
            </p>

            {selectedIssue.reply_status === 'REPLIED' && selectedIssue.reply && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Your Reply:</h4>
                <p className="text-sm text-gray-600">{selectedIssue.reply}</p>
                {selectedIssue.updatedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Replied on: {new Date(selectedIssue.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {selectedIssue.reply_status !== 'REPLIED' && (
              <>
                <textarea
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                ></textarea>

                <button
                  onClick={handleSendReply}
                  disabled={isSendingReply || reply.trim() === ""}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition ${isSendingReply || reply.trim() === ""
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-blue-700 text-white hover:bg-blue-800'
                    }`}
                >
                  {isSendingReply ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </div>
                  ) : (
                    'Send Reply'
                  )}
                </button>
              </>
            )}

            {/* Add this right after the opening <div> of the component */}
            {showSuccess && (
              <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Reply sent successfully!</span>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      )}


    </div>
  );
};

export default ContactUsPage;
