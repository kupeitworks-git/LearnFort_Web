import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiArrowLeft,
    FiMoreVertical,
    FiEdit2,
    FiTrash2,
    FiUserX,
    FiCheckCircle,
    FiX,
    FiSave,
    FiUser,
    FiPhone,
    FiMail,
    FiMapPin,
    FiCreditCard,
    FiHome,
    FiChevronLeft,
    FiChevronRight
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { BaseUrl } from '../../api/api';

const ManageUsers = () => {
    const navigate = useNavigate();

    const [admins, setAdmins] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("Users");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showActions, setShowActions] = useState(false);
    const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [editedUser, setEditedUser] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Pagination state
    const [currentUserPage, setCurrentUserPage] = useState(1);
    const [currentAdminPage, setCurrentAdminPage] = useState(1);
    const itemsPerPage = 5;

    // Fetch Users
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                setError("No authentication token found. Please login again.");
                setLoading(false);
                return;
            }

            const res = await fetch(`${BaseUrl}user/users-list`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                setUsers(data.users || []);
            } else {
                setError(data.message || "Failed to fetch users");
            }
        } catch (err) {
            console.error(err);
            setError("Error fetching users");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Admins
    const fetchAdmins = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                setError("No authentication token found. Please login again.");
                setLoading(false);
                return;
            }

            const res = await fetch(`${BaseUrl}admin/admin-list`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                setAdmins(data.admins || []);
            } else {
                setError(data.message || "Failed to fetch admins");
            }
        } catch (err) {
            console.error(err);
            setError("Error fetching admins");
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when tab changes
    useEffect(() => {
        if (activeTab === "Users") {
            fetchUsers();
            setCurrentUserPage(1); // Reset to first page
        } else {
            fetchAdmins();
            setCurrentAdminPage(1); // Reset to first page
        }
    }, [activeTab]);

    const handleActionClick = (user, e) => {
        e.stopPropagation();
        setSelectedUser(user);
        const rect = e.currentTarget.getBoundingClientRect();
        setActionPosition({ x: rect.right - 160, y: rect.bottom + 5 });
        setShowActions(true);
    };

    const handleAction = (action) => {
        setCurrentAction(action);
        setShowActions(false);

        if (action === 'edit') {
            // Map API field names to component field names
            const userData = {
                ...selectedUser,
                fathersName: selectedUser.father_name || '',
                nativePlace: selectedUser.native_place || '',
                aadharNumber: selectedUser.aadhar_number || ''
            };
            setEditedUser(userData);
            setShowEditModal(true);
        } else {
            setShowConfirmModal(true);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setIsSaving(true);
            const token = sessionStorage.getItem("token");
            const res = await fetch(`${BaseUrl}user/update/${selectedUser._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();

            if (res.ok) {
                // Update the user in the appropriate list
                if (activeTab === "Users") {
                    setUsers(users.map(u =>
                        u._id === selectedUser._id ? { ...u, status: newStatus } : u
                    ));
                } else {
                    setAdmins(admins.map(a =>
                        a._id === selectedUser._id ? { ...a, status: newStatus } : a
                    ));
                }
            } else {
                throw new Error(data.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            setError(err.message || 'Failed to update status');
        } finally {
            setIsSaving(false);
            setShowConfirmModal(false);
        }
    };

    const handleEditSave = async () => {
        try {
            setIsSaving(true);
            const token = sessionStorage.getItem("token");

            // Prepare the payload with only changed fields
            const payload = {};
            const fieldsToCheck = [
                { component: 'name', api: 'name' },
                { component: 'fathersName', api: 'father_name' },
                { component: 'mobile', api: 'mobile' },
                { component: 'email', api: 'email' },
                { component: 'nativePlace', api: 'native_place' },
                { component: 'aadharNumber', api: 'aadhar_number' },
                { component: 'address', api: 'address' }
            ];

            fieldsToCheck.forEach(({ component, api }) => {
                // Check if the field has changed compared to the original data
                const originalValue = selectedUser[api] || selectedUser[component];
                if (editedUser[component] !== originalValue) {
                    payload[api] = editedUser[component];
                }
            });

            if (Object.keys(payload).length === 0) {
                setShowEditModal(false);
                return;
            }

            const res = await fetch(`${BaseUrl}user/update/${selectedUser._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                // Update the user in the appropriate list
                if (activeTab === "Users") {
                    setUsers(users.map(u =>
                        u._id === selectedUser._id ? { ...u, ...payload } : u
                    ));
                } else {
                    setAdmins(admins.map(a =>
                        a._id === selectedUser._id ? { ...a, ...payload } : a
                    ));
                }
                setShowEditModal(false);
            } else {
                throw new Error(data.message || 'Failed to update user');
            }
        } catch (err) {
            console.error('Error updating user:', err);
            setError(err.message || 'Failed to update user');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsSaving(true);
            const token = sessionStorage.getItem("token");
            const res = await fetch(`${BaseUrl}user/delete/${selectedUser._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                // Remove the user from the appropriate list
                if (activeTab === "Users") {
                    setUsers(users.filter(u => u._id !== selectedUser._id));
                } else {
                    setAdmins(admins.filter(a => a._id !== selectedUser._id));
                }
            } else {
                throw new Error(data.message || 'Failed to delete user');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(err.message || 'Failed to delete user');
        } finally {
            setIsSaving(false);
            setShowConfirmModal(false);
        }
    };

    const getStatusActions = (status) => {
        switch (status) {
            case 'ACTIVE':
                return [
                    { label: 'Edit', action: 'edit', icon: FiEdit2 },
                    { label: 'Block', action: 'block', icon: FiUserX, className: 'text-yellow-600' },
                    { label: 'Deactivate', action: 'deactivate', icon: FiUserX, className: 'text-orange-600' },
                    { label: 'Delete', action: 'delete', icon: FiTrash2, className: 'text-red-600' }
                ];
            case 'INACTIVE':
                return [
                    { label: 'Edit', action: 'edit', icon: FiEdit2 },
                    { label: 'Activate', action: 'activate', icon: FiCheckCircle, className: 'text-green-600' },
                    { label: 'Block', action: 'block', icon: FiUserX, className: 'text-orange-600' },
                    { label: 'Delete', action: 'delete', icon: FiTrash2, className: 'text-red-600' }
                ];
            case 'BLOCKED':
                return [
                    { label: 'Edit', action: 'edit', icon: FiEdit2 },
                    { label: 'Activate', action: 'activate', icon: FiCheckCircle, className: 'text-green-600' },
                    { label: 'Deactivate', action: 'Deactivate', icon: FiCheckCircle, className: 'text-green-600' },
                    { label: 'Delete', action: 'delete', icon: FiTrash2, className: 'text-red-600' }
                ];
            default:
                return [
                    { label: 'Edit', action: 'edit', icon: FiEdit2 },
                    { label: 'Activate', action: 'activate', icon: FiCheckCircle, className: 'text-green-600' },
                    { label: 'Block', action: 'block', icon: FiUserX, className: 'text-yellow-600' },
                    { label: 'Delete', action: 'delete', icon: FiTrash2, className: 'text-red-600' }
                ];
        }
    };

    const getActionLabel = (action) => {
        switch (action) {
            case 'activate': return 'Activate';
            case 'deactivate': return 'Deactivate';
            case 'block': return 'Block';
            case 'unblock': return 'Unblock';
            case 'delete': return 'Delete';
            default: return action;
        }
    };

    const getStatusFromAction = (action) => {
        switch (action) {
            case 'activate': return 'ACTIVE';
            case 'deactivate': return 'INACTIVE';
            case 'block': return 'BLOCKED';
            case 'unblock': return 'ACTIVE';
            default: return null;
        }
    };

    useEffect(() => {
        const handleClickOutside = () => setShowActions(false);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const UserCard = ({ user }) => {
        const [expanded, setExpanded] = useState(false);

        const DetailItem = ({ label, value, className = '' }) => (
            <div className={`flex items-start ${className}`}>
                <dt className="w-32 text-sm font-medium text-gray-500">{label}:</dt>
                <dd className="flex-1 text-sm text-gray-900 break-words">
                    {value}
                </dd>
            </div>
        );

        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="bg-white/90 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 overflow-hidden"
            >
                <div
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-left">{user.name || "N/A"}</h3>
                            <p className="text-sm text-gray-500 text-left">{user.email || "N/A"}</p>
                            <p className="text-xs text-gray-400 mt-1 text-left">joined :
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-CA') : "N/A"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 text-left">
                                Mobile: {user.mobile || "N/A"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full 
                        ${user.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : user.status === "PENDING"
                                    ? "bg-blue-100 text-blue-700"
                                    : user.status === "BLOCKED"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {user.status || "Unknown"}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleActionClick(user, e);
                            }}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                        >
                            <FiMoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-4 pb-4 pt-0 border-t border-gray-100"
                        >
                            <div className="w-full space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailItem label="Father's Name" value={user.father_name || 'N/A'} />
                                    <DetailItem label="Native Place" value={user.native_place || 'N/A'} />
                                    <DetailItem label="Aadhar Number" value={user.aadhar_number || 'N/A'} />
                                    <DetailItem label="Role" value={user.role || 'N/A'} />
                                    <DetailItem label="Email" value={user.email || 'N/A'} />
                                    <DetailItem label="Mobile" value={user.mobile || 'N/A'} />
                                    <DetailItem
                                        label="Status"
                                        value={
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "ACTIVE"
                                                ? "bg-green-100 text-green-700"
                                                : user.status === "PENDING"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : user.status === "BLOCKED"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {user.status || "Unknown"}
                                            </span>
                                        }
                                    />
                                </div>
                                <div className="pt-2">
                                    <DetailItem
                                        label="Address"
                                        value={user.address || 'N/A'}
                                        className="items-start"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    // Pagination helper functions
    const getPaginatedData = (data, currentPage) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const getTotalPages = (data) => {
        return Math.ceil(data.length / itemsPerPage);
    };

    // Pagination Component
    const Pagination = ({ currentPage, totalPages, onPageChange }) => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-center space-x-4 mt-6 px-4">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                        }`}
                >
                    <FiChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                </button>

                <div className="text-sm font-medium text-gray-700">
                    Page <span className="text-blue-600 font-semibold">{currentPage}</span> of <span className="text-blue-600 font-semibold">{totalPages}</span>
                </div>


                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                        }`}
                >
                    <span>Next</span>
                    <FiChevronRight className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white flex flex-col">
            <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
                        Manage Users
                    </h1>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex justify-center mt-4">
                <div className="bg-white/90 rounded-full p-1 flex shadow-inner">
                    {["Users", "Admins"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-gray-600 hover:text-blue-600"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow px-6 py-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600 font-medium">
                            Loading {activeTab.toLowerCase()}...
                        </p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-600 font-medium">{error}</p>
                        <button
                            onClick={() => (activeTab === "Users" ? fetchUsers() : fetchAdmins())}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === "Admins" ? (
                            <motion.div
                                key="admins"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-black font-semibold mb-4 text-lg">
                                    All Admins ({admins.length})
                                </h2>
                                {admins.length === 0 ? (
                                    <p className="text-center text-gray-500 py-10">No admins found</p>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {getPaginatedData(admins, currentAdminPage).map((admin) => (
                                                <UserCard key={admin._id || admin.id} user={admin} />
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={currentAdminPage}
                                            totalPages={getTotalPages(admins)}
                                            onPageChange={setCurrentAdminPage}
                                        />
                                    </>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-black font-semibold mb-4 text-lg">
                                    All Users ({users.length})
                                </h2>
                                {users.length === 0 ? (
                                    <p className="text-center text-gray-500 py-10">No users found</p>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {getPaginatedData(users, currentUserPage).map((user) => (
                                                <UserCard key={user._id || user.id} user={user} />
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={currentUserPage}
                                            totalPages={getTotalPages(users)}
                                            onPageChange={setCurrentUserPage}
                                        />
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Action Menu */}
            {showActions && selectedUser && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed bg-white rounded-md shadow-xl py-2 z-50 w-48"
                    style={{
                        top: `${actionPosition.y}px`,
                        left: `${actionPosition.x}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {selectedUser && getStatusActions(selectedUser.status || 'INACTIVE').map((item) => (
                        <button
                            key={item.action}
                            onClick={() => handleAction(item.action)}
                            className={`flex items-center w-full px-4 py-2 text-sm ${item.className || 'text-gray-700'} hover:bg-gray-100`}
                        >
                            <item.icon className="mr-2 w-4 h-4" /> {item.label}
                        </button>
                    ))}
                </motion.div>
            )}

            {/* Edit User Modal */}
            {showEditModal && editedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">Edit Profile</h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FiUser className="inline mr-1 w-4 h-4" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editedUser.name || ''}
                                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FiUser className="inline mr-1 w-4 h-4" />
                                        Father's Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editedUser.fathersName || ''}
                                        onChange={(e) => setEditedUser({ ...editedUser, fathersName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FiPhone className="inline mr-1 w-4 h-4" />
                                        Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={editedUser.mobile || ''}
                                        onChange={(e) => setEditedUser({ ...editedUser, mobile: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FiMail className="inline mr-1 w-4 h-4" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editedUser.email || ''}
                                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FiMapPin className="inline mr-1 w-4 h-4" />
                                        Native Place
                                    </label>
                                    <input
                                        type="text"
                                        value={editedUser.nativePlace || ''}
                                        onChange={(e) => setEditedUser({ ...editedUser, nativePlace: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FiCreditCard className="inline mr-1 w-4 h-4" />
                                        Aadhar Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editedUser.aadharNumber || ''}
                                        onChange={(e) => setEditedUser({ ...editedUser, aadharNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FiHome className="inline mr-1 w-4 h-4" />
                                        Address
                                    </label>
                                    <textarea
                                        value={editedUser.address || ''}
                                        onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleEditSave}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="mr-2 w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && selectedUser && currentAction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
                    >
                        <div className="text-center">
                            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${currentAction === 'delete' ? 'bg-red-100' : 'bg-yellow-100'
                                }`}>
                                {currentAction === 'delete' ? (
                                    <FiTrash2 className="h-6 w-6 text-red-600" />
                                ) : (
                                    <FiUserX className="h-6 w-6 text-yellow-600" />
                                )}
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {getActionLabel(currentAction)} User
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {currentAction === 'delete'
                                    ? `Are you sure you want to permanently delete ${selectedUser.name || 'this user'}? This action cannot be undone and all user data will be lost.`
                                    : `Are you sure you want to ${currentAction} ${selectedUser.name || 'this user'}?`
                                }
                            </p>
                            <div className="flex justify-center space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (currentAction === 'delete') {
                                            handleDelete();
                                        } else {
                                            handleStatusUpdate(getStatusFromAction(currentAction));
                                        }
                                    }}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentAction === 'delete'
                                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                        }`}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        getActionLabel(currentAction)
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
