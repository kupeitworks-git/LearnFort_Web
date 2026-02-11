import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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
    FiChevronRight,

} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { BaseUrl } from '../../api/api';
import Pagination from "../../common/Pagination";
import { toast } from 'react-toastify';

const ManageUsers = () => {
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("Users");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showActions, setShowActions] = useState(false);
    const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 });
    // const [loading, setLoading] = useState(false); // managed by useQuery
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [editedUser, setEditedUser] = useState(null);
    // const [isSaving, setIsSaving] = useState(false); // managed by useMutation
    const [aadharError, setAadharError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    // Pagination state
    const [paginationState, setPaginationState] = useState({
        users: { page: 1, limit: 10 },
        admins: { page: 1, limit: 10 }
    });

    const itemsPerPage = 10; // Increased from 5 to 10

    // Fetch Users Query
    const { data: usersData = { users: [], pagination: {} }, isLoading: loadingUsers } = useQuery({
        queryKey: ['users', paginationState.users.page],
        queryFn: async () => {
            const token = sessionStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");

            const res = await fetch(`${BaseUrl}user/users-list?role=USER&page=${paginationState.users.page}&limit=${paginationState.users.limit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const response = await res.json();
            if (!res.ok) {
                if (response.message === "jwt expired") {
                    sessionStorage.clear();
                    navigate("/login");
                    throw new Error("Session expired");
                }
                throw new Error(response.message || "Failed to fetch users");
            }
            const usersData = response.users || response.data || [];
            const pagination = response.pagination || {
                currentPage: 1,
                totalPages: 1,
                totalDocs: usersData.length,
                hasNext: false,
                hasPrev: false
            };
            return { users: usersData, pagination };
        },
        placeholderData: keepPreviousData,
        enabled: activeTab === "Users"
    });

    // Fetch Admins Query
    const { data: adminsData = { admins: [], pagination: {} }, isLoading: loadingAdmins } = useQuery({
        queryKey: ['admins', paginationState.admins.page],
        queryFn: async () => {
            const token = sessionStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");

            const res = await fetch(`${BaseUrl}admin/admin-list?role=ADMIN&page=${paginationState.admins.page}&limit=${paginationState.admins.limit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const response = await res.json();
            if (!res.ok) {
                if (response.message === "jwt expired") {
                    sessionStorage.clear();
                    navigate("/login");
                    throw new Error("Session expired");
                }
                throw new Error(response.message || "Failed to fetch admins");
            }

            const adminsData = response.admins || response.data || [];
            const pagination = response.pagination || {
                currentPage: 1,
                totalPages: 1,
                totalDocs: adminsData.length,
                hasNext: false,
                hasPrev: false
            };
            return { admins: adminsData, pagination };
        },
        placeholderData: keepPreviousData,
        enabled: activeTab === "Admins"
    });

    // Mutations
    const updateStatusMutation = useMutation({
        mutationFn: async ({ userId, status }) => {
            const token = sessionStorage.getItem("token");
            const res = await fetch(`${BaseUrl}user/update/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update status');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            queryClient.invalidateQueries(['admins']);
            setShowConfirmModal(false);
            // toast.success("Status updated successfully");
        },
        onError: (err) => {
            toast.error(err.message);
            setError(err.message);
            setShowConfirmModal(false);
        }
    });

    const updateUserMutation = useMutation({
        mutationFn: async ({ userId, payload }) => {
            const token = sessionStorage.getItem("token");
            const res = await fetch(`${BaseUrl}user/update/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update user');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            queryClient.invalidateQueries(['admins']);
            setShowEditModal(false);
            toast.success("User updated successfully!");
        },
        onError: (err) => {
            toast.error(err.message);
            setError(err.message);
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId) => {
            const token = sessionStorage.getItem("token");
            const res = await fetch(`${BaseUrl}user/delete/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete user');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            queryClient.invalidateQueries(['admins']);
            setShowConfirmModal(false);
            toast.success("User deleted successfully!");
        },
        onError: (err) => {
            toast.error(err.message);
            setError(err.message);
            setShowConfirmModal(false);
        }
    });

    const users = usersData.users;
    const userPagination = usersData.pagination;
    const admins = adminsData.admins;
    const adminPagination = adminsData.pagination;
    const loading = activeTab === "Users" ? loadingUsers : loadingAdmins;
    const isSaving = updateStatusMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending;

    // Handle page change for users
    const handleUserPageChange = (page) => {
        setPaginationState(prev => ({ ...prev, users: { ...prev.users, page } }));
    };

    // Handle page change for admins
    const handleAdminPageChange = (page) => {
        setPaginationState(prev => ({ ...prev, admins: { ...prev.admins, page } }));
    };

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
        } else if (action === 'deactivate') {
            // Set the status to 'INACTIVE' when deactivating
            setSelectedUser({ ...selectedUser, status: 'INACTIVE' });
            setShowConfirmModal(true);
        } else {
            setShowConfirmModal(true);
        }
    };

    const handleStatusUpdate = (newStatus) => {
        // Handle null/undefined status and ensure proper case
        let statusValue = 'INACTIVE'; // Default to INACTIVE if no status provided
        if (newStatus) {
            statusValue = newStatus === 'deactivate' ? 'INACTIVE' : newStatus.toUpperCase();
        }
        updateStatusMutation.mutate({ userId: selectedUser._id, status: statusValue });
    };
    const validateAadhar = (aadhar) => {
        if (!aadhar) return true; // Allow empty Aadhar
        return /^\d{12}$/.test(aadhar);
    };

    const handleAadharChange = (value) => {
        setEditedUser({ ...editedUser, aadharNumber: value });
        if (value && !/^\d{0,12}$/.test(value)) {
            setAadharError('Aadhar number must contain only digits');
        } else if (value && value.length !== 12) {
            setAadharError('Aadhar number must be 12 digits');
        } else {
            setAadharError('');
        }
    };


    const handleEditSave = () => {
        // Clear previous errors
        const errors = {};

        // Validate Name (required)
        if (!editedUser.name || !editedUser.name.trim()) {
            errors.name = 'Name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(editedUser.name.trim())) {
            errors.name = 'Name should contain only letters and spaces';
        }

        // Validate Mobile (required, 10 digits)
        if (!editedUser.mobile || !editedUser.mobile.trim()) {
            errors.mobile = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(editedUser.mobile.trim())) {
            errors.mobile = 'Mobile number must be 10 digits';
        }

        // Validate Email (required, valid format)
        if (!editedUser.email || !editedUser.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUser.email.trim())) {
            errors.email = 'Please enter a valid email address';
        }

        // Validate Aadhar number (optional but if provided, must be 12 digits)
        if (editedUser.aadharNumber && !validateAadhar(editedUser.aadharNumber)) {
            setAadharError('Please enter a valid 12-digit Aadhar number');
            errors.aadhar = true;
        }

        // If there are errors, set them and return
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        // Clear errors if validation passed
        setFormErrors({});

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

        // Always include mobile field as it's required by the API
        if (!payload.mobile) {
            payload.mobile = editedUser.mobile || selectedUser.mobile;
        }

        if (Object.keys(payload).length === 0) {
            setShowEditModal(false);
            return;
        }

        updateUserMutation.mutate({ userId: selectedUser._id, payload });
    };

    const handleDelete = () => {
        deleteUserMutation.mutate(selectedUser._id);
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
                    { label: 'Unblock', action: 'unblock', icon: FiCheckCircle, className: 'text-red-600' },
                    { label: 'Deactivate', action: 'Deactivate', icon: FiUserX, className: 'text-Orange-600' },
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
            case 'unblock': return 'ACTIVE'; // Changed from 'UNBLOCKED' to 'ACTIVE'
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                                                user.status === "PENDING" ? "bg-blue-100 text-blue-700" :
                                                    user.status === "BLOCKED" ? "bg-red-100 text-red-700" :
                                                        user.status === "UNBLOCKED" ? "bg-blue-200 text-blue-800" :
                                                            user.status === "INACTIVE" ? "bg-gray-100 text-gray-700" :
                                                                "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {user.status === 'INACTIVE' ? 'Inactive' :
                                                    user.status === 'UNBLOCKED' ? 'Unblocked' :
                                                        (user.status || "Unknown")}
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
    // Removed getPaginatedData and getTotalPages as we're using server-side pagination now

    // Pagination Component


    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white flex flex-col">
            <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
                        Manage Users
                    </h1>
                    <button
                        onClick={() => navigate('/')}
                        className="ml-auto p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                        title="Go Home"
                    >
                        <FiHome className="w-5 h-5" />
                    </button>
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
                                            {admins.map((admin) => (
                                                <UserCard
                                                    key={admin._id || admin.id}
                                                    user={admin}
                                                    onActionClick={handleActionClick}
                                                />
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={adminPagination.currentPage}
                                            totalPages={adminPagination.totalPages}
                                            totalItems={adminPagination.totalDocs}
                                            onPageChange={handleAdminPageChange}
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
                                            {users.map((user) => (
                                                <UserCard
                                                    key={user._id || user.id}
                                                    user={user}
                                                    onActionClick={handleActionClick}
                                                />
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={userPagination.currentPage}
                                            totalPages={userPagination.totalPages}
                                            totalItems={userPagination.totalDocs}
                                            onPageChange={handleUserPageChange}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                        <FiUser className="inline mr-1 w-4 h-4" />
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editedUser.name || ''}
                                        onChange={(e) => {
                                            setEditedUser({ ...editedUser, name: e.target.value });
                                            if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                                        }}
                                        className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                    {formErrors.name && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                        <FiPhone className="inline mr-1 w-4 h-4" />
                                        Mobile Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={editedUser.mobile || ''}
                                        maxLength={10}
                                        onChange={(e) => {
                                            const onlyDigits = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                            setEditedUser({ ...editedUser, mobile: onlyDigits });
                                            if (formErrors.mobile) setFormErrors({ ...formErrors, mobile: '' });
                                        }}
                                        className={`w-full px-3 py-2 border ${formErrors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                    {formErrors.mobile && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.mobile}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                        <FiMail className="inline mr-1 w-4 h-4" />
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={editedUser.email || ''}
                                        onChange={(e) => {
                                            setEditedUser({ ...editedUser, email: e.target.value });
                                            if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                                        }}
                                        className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                    {formErrors.email && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                        <FiCreditCard className="inline mr-1 w-4 h-4" />
                                        Aadhar Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editedUser.aadharNumber || ''}
                                        onChange={(e) => handleAadharChange(e.target.value)}
                                        className={`w-full px-3 py-2 border ${aadharError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        maxLength="12"
                                    />
                                    {aadharError && (
                                        <p className="mt-1 text-sm text-red-600">{aadharError}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
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
                                    className={`px-4 py-2 text-sm font-medium text-white ${aadharError ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center`}
                                    disabled={isSaving || !!aadharError}
                                    title={aadharError ? 'Please fix Aadhar number errors before saving' : ''}
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
