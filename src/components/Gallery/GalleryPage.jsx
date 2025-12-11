import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaPlay, FaPlus, FaTimes, FaSpinner, FaCheckCircle, FaTrash } from "react-icons/fa";
import { FiArrowLeft, FiCheck, FiInfo } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { BaseUrl } from '../api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';





const initialSportsData = {};

const GalleryPage = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: "", type: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'single' or 'all'
  const [deleteItemId, setDeleteItemId] = useState('');
  const [deleteSportId, setDeleteSportId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type) => {
    setToast({ message, type });
    if (message) {
      setTimeout(() => setToast({ message: "", type: "" }), 3000);
    }
  };
  const [sportsData, setSportsData] = useState(initialSportsData);
  const [sportsList, setSportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [activeTab, setActiveTab] = useState("image"); // Default to 'image' to match tab values
  const [showForm, setShowForm] = useState(false);
  const [galleryType, setGalleryType] = useState("image");
  const [videoLinks, setVideoLinks] = useState([""]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedSportId, setSelectedSportId] = useState("");
  const [eventName, setEventName] = useState("");
  const [galleryTitle, setGalleryTitle] = useState("");
  const [conductedTime, setConductedTime] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [sportGalleries, setSportGalleries] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const dateInputRef = useRef(null);
  const location = useLocation();
  // Check if user came from Admin Dashboard
  const isFromAdmin = location.state?.fromAdmin || false;
  const [user, setUser] = useState(null);
  const token = sessionStorage.getItem('token');

  // Get user data from localStorage on component mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("lf_user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  // Check if user is admin or super admin
  const isAdminUser = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

  useEffect(() => {
    const fetchSportsList = async () => {
      try {
        setLoading(true);
        console.log('Fetching sports list...');
        const response = await axios.get(`${BaseUrl}sports/list`, {
          headers: {
            // 'Authorization': `Bearer ${token}`
          }
        });

        console.log('API Response:', response.data);

        if (response.data && response.data.sports) {
          const sports = response.data.sports;
          console.log('Sports data:', sports);

          // Transform the API response to include gallery images and videos
          const formattedData = {};
          sports.forEach(sport => {
            if (sport && sport.name) {
              formattedData[sport.name] = {
                images: sport.gallery_images || [sport.image].filter(Boolean),
                videos: sport.gallery_videos || [],
                ...sport
              };
            }
          });

          console.log('Formatted data:', formattedData);
          setSportsData(formattedData);
          setSportsList(sports);
        } else {
          console.error('Unexpected API response format:', response.data);
          setError('Unexpected data format received from server');
        }
      } catch (err) {
        console.error('Error fetching sports list:', err);
        setError('Failed to load sports data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSportsList();
    } else {
      setError('Authentication required. Please log in.');
      setLoading(false);
    }
  }, [token]);

  const handleBack = () => {
    if (selectedSport) setSelectedSport(null);
    else navigate(-1);
  };

  const handleAddVideoField = () => {
    setVideoLinks([...videoLinks, ""]);
  };

  const handleVideoChange = (index, value) => {
    const updated = [...videoLinks];
    updated[index] = value;
    setVideoLinks(updated);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Store actual files to send to API
    setSelectedImages(files);

    // Create preview URLs
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previewUrls);
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const pad = num => num.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Add these helper functions
  const handleFormReset = () => {
    setShowForm(false);
    setGalleryType("image");
    setVideoLinks([""]);
    setSelectedImages([]);
    setPreviewImages([]);
    setEventName("");
    setGalleryTitle("");
    setConductedTime("");
    setStatus("PENDING");
    setFormError("");
  };


  // Function to confirm and delete a single gallery item
  const confirmDeleteItem = (itemId) => {
    setItemToDelete(itemId);
    setDeleteType('single');
    setDeleteSportId(selectedSportId);
    setShowDeleteModal(true);
  };

  // Function to confirm delete all items
  const confirmDeleteAll = (sportId, type) => {
    setDeleteType('all');
    setDeleteSportId(sportId);
    setShowDeleteModal(true);
  };
  const handleDelete = async () => {
    if (deleteType === "single" && itemToDelete) {
      try {
        setIsDeleting(true);
        showToast("Deleting item...", "info");

        await axios.delete(`${BaseUrl}gallery/delete/${itemToDelete}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        showToast("Item deleted successfully!", "success");
        setShowDeleteModal(false);
        // Refresh gallery data
        if (deleteSportId) {
          await fetchSportGallery(deleteSportId);
          await refreshSportsData();
        }

        // ✅ Close modal after success

        setItemToDelete(null);
        setDeleteType("");
        setDeleteSportId("");

      } catch (error) {
        console.error("Error deleting item:", error);
        showToast("Failed to delete item. Please try again.", "error");
      } finally {
        setIsDeleting(false);
      }
      return;
    }

    // --------------------------
    // DELETE ALL
    // --------------------------
    if (deleteType === "all" && deleteSportId) {
      const type = activeTab === "image" ? "images" : "videos";

      const itemsToDelete = sportGalleries.filter((item) =>
        type === "images" ? item.type === "IMAGE" : item.type === "VIDEO"
      );

      if (itemsToDelete.length === 0) {
        showToast(`No ${type} to delete.`, "info");
        return;
      }

      try {
        setIsDeleting(true);
        showToast(`Deleting ${itemsToDelete.length} ${type}...`, "info");

        // Delete all items one by one
        for (const item of itemsToDelete) {
          try {
            await axios.delete(`${BaseUrl}gallery/delete/${item._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (err) {
            console.error("Error deleting item:", item._id);
          }
        }

        showToast(`Successfully deleted ${itemsToDelete.length} ${type}.`, "success");
        // ✅ Close modal after success
        setShowDeleteModal(false);
        // Refresh UI
        await fetchSportGallery(deleteSportId);
        await refreshSportsData();


        setItemToDelete(null);
        setDeleteType("");
        setDeleteSportId("");

      } catch (error) {
        console.error("Bulk delete error:", error);
        showToast(`Error occurred while deleting ${type}.`, "error");
      } finally {
        setIsDeleting(false);
      }
    }
  };


  const refreshSportsData = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${BaseUrl}sports/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data?.sports) {
        const formattedData = {};
        response.data.sports.forEach(sport => {
          if (sport?.name) {
            formattedData[sport.name] = {
              images: sport.gallery_images || [],
              videos: sport.gallery_videos || [],
              ...sport
            };
          }
        });
        setSportsData(formattedData);
        setSportsList(response.data.sports);
      }
    } catch (error) {
      console.error('Error refreshing sports data:', error);
    }
  };

  const fetchSportGallery = async (sportId) => {
    if (!sportId) return;

    try {
      setLoadingGallery(true);
      const response = await axios.get(`${BaseUrl}gallery/list/${sportId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Transform the response to match our expected format
      const formattedGalleries = response.data.gallery.map(item => ({
        ...item,
        // For images, we'll use the URL directly
        // For videos, we'll extract the thumbnail from YouTube URL if needed
        thumbnail: item.type === 'IMAGE' ? item.url : getYoutubeThumbnail(item.url)
      }));

      setSportGalleries(formattedGalleries);
    } catch (error) {
      console.error('Error fetching sport gallery:', error);
      showToast('Failed to load gallery. Please try again.', 'error');
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleSportClick = (sportName, sportId) => {
    setSelectedSport(sportName);
    setSelectedSportId(sportId);
    setActiveTab('image'); // Reset to Images tab when a new sport is selected
    fetchSportGallery(sportId);
    // Scroll to top when changing sports
    window.scrollTo({ top: 0, behavior: 'smooth' });

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSportId) {
      showToast("Please select a sport", "error");
      return;
    }

    if (galleryType === "video" && videoLinks.some(link => !link)) {
      showToast("Please fill in all video links or remove empty fields", "error");
      return;
    }

    if (galleryType === "image" && selectedImages.length === 0) {
      showToast("Please select at least one image", "error");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      showToast("Uploading gallery items...", "info");
      const formData = new FormData();

      // Add basic fields
      formData.append('sports_id', selectedSportId);
      formData.append('event_name', eventName);
      formData.append('gallery_title', galleryTitle);
      formData.append('conducted_time', conductedTime || new Date().toISOString());

      // Add youtube links for videos
      if (galleryType === 'video') {
        videoLinks
          .filter(link => link.trim() !== '')
          .forEach(link => {
            formData.append('youtube_links', link);
          });
      } else {
        // Add image files
        for (let i = 0; i < selectedImages.length; i++) {
          const file = selectedImages[i];
          formData.append('files', file, file.name);
        }
      }

      const response = await axios.post(
        `${BaseUrl}gallery/add`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Gallery added successfully:', response.data);

      // Show success message
      showToast("Gallery added successfully!", 'success');

      // Reset form and refresh data
      handleFormReset();
      await fetchSportGallery(selectedSportId);
      await refreshSportsData();
      showToast("Gallery updated successfully!", "success");
    } catch (error) {
      console.error('Error uploading gallery items:', error);
      const errorMessage = error.response?.data?.message || "Failed to upload gallery items. Please try again.";
      showToast(errorMessage, "error");

      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  // Helper function to get YouTube thumbnail from URL
  const getYoutubeThumbnail = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
      : '';
  };

  // Update the renderGalleryContent function
  const renderGalleryContent = () => {
    if (loadingGallery) {
      return (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-blue-500 text-4xl" />
        </div>
      );
    }

    // Filter galleries based on active tab
    const filteredGalleries = sportGalleries.filter(item =>
      activeTab === 'image' ? item.type === 'IMAGE' : item.type === 'VIDEO'
    );

    // Add action buttons for admin
    const renderActionButtons = () => {
      if (!isFromAdmin) return null;

      return (
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <FaPlus /> Add {activeTab === 'image' ? 'Image' : 'Video'}
            </button>
            {filteredGalleries.length > 0 && (
              <button
                onClick={() => {
                  // Set delete type and show modal
                  setDeleteType('all');
                  setDeleteSportId(selectedSportId);
                  setShowDeleteModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                disabled={isDeleting}
              >
                <FaTimes /> Delete All
              </button>
            )}
          </div>
          <span className="text-sm text-gray-500">
            {filteredGalleries.length} {activeTab === 'image' ? 'images' : 'videos'} found
          </span>
        </div>
      );
    };

    if (filteredGalleries.length > 0) {
      return (
        <div className="p-4">
          {renderActionButtons()}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredGalleries.map((item) => (
              <div
                key={item._id}
                className="relative group rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                {isFromAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteItem(item._id);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FaTimes size={16} />
                  </button>
                )}
                {item.type === 'IMAGE' ? (
                  <img
                    src={item.url}
                    alt={item.gallery_title || 'Gallery image'}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                    }}
                  />
                ) : (
                  <div className="relative">
                    <img
                      src={item.thumbnail}
                      alt="Video thumbnail"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <div className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                        <FaPlay className="text-blue-600 text-xl" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-800 truncate">
                    {item.gallery_title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {item.event_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Show appropriate message based on active tab
    const noItemsMessage = activeTab === 'image'
      ? 'No images found for this sport.'
      : 'No videos found for this sport.';

    return (
      <div className="text-center py-10">
        <p className="text-gray-500">{noItemsMessage}</p>
        {isFromAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
          >
            + Add {activeTab === 'image' ? 'Image' : 'Video'}
          </button>
        )}
      </div>
    );
  };
  const renderSportsGrid = () => {
    if (Object.keys(sportsData).length === 0) {
      return (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{selectedSport} Gallery</h2>
            <button
              onClick={() => {
                setDeleteType('all');
                setDeleteSportId(selectedSportId);
                setShowDeleteModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              disabled={sportGalleries.length === 0}
            >
              <FaTrash />
              Delete All {activeTab === 'image' ? 'Images' : 'Videos'}
            </button>
            {isAdminUser && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                + Add New Gallery
              </button>
            )}
          </div>
          <div className="text-center py-10">
            <p className="text-gray-500">No sports available. Please add some sports to get started.</p>
            {isAdminUser && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                + Add Your First Sport
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{selectedSport} Gallery</h2>
          {isAdminUser && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              + Add New Gallery
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Object.entries(sportsData).map(([sportName, sportData]) => {
            const imageUrl = Array.isArray(sportData.images) && sportData.images.length > 0
              ? sportData.images[0]
              : sportData.image || 'https://via.placeholder.com/300x200?text=No+Image';
            return (
              <div
                key={sportName}
                onClick={() => handleSportClick(sportName, sportData._id || sportData.id)}
                className="relative rounded-2xl overflow-hidden bg-white/80 backdrop-blur-md shadow-md border border-blue-100 hover:shadow-2xl hover:scale-[1.03] hover:border-blue-300 transition-all duration-300 cursor-pointer"
              >
                <img
                  src={imageUrl}
                  alt={sportName}
                  className="w-full h-44 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-3">
                  <h3 className="text-white font-bold text-lg tracking-wide text-center">
                    {sportName}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSportGallery = () => {
    const sport = sportsData[selectedSport] || {};
    const content = activeTab === "images"
      ? (sport.images || [])
      : (sport.videos || []);

    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB'); // This will format as DD/MM/YYYY
    };

    return (
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedSport}</h1>
          <p className="text-gray-500">{formatDate(sport.conductedTime || new Date().toISOString())}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("images")}
            className={`px-6 py-3 font-medium text-sm ${activeTab === "images"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Images
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`px-6 py-3 font-medium text-sm ${activeTab === "videos"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Videos
          </button>
        </div>

        <div className="flex justify-end mb-4">
          {isFromAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              + Add New {activeTab === 'images' ? 'Image' : 'Video'}
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

          {content.length > 0 ? (
            content.map((item, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                {activeTab === "videos" ? (
                  <div className="relative group">
                    <img
                      src={item.thumbnail || 'https://via.placeholder.com/300x200?text=Video+Thumbnail'}
                      alt={`${selectedSport} video ${index + 1}`}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                        <FaPlay className="text-blue-600 text-lg" />
                      </div>
                    </div>
                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-white text-sm font-medium truncate">{item.title}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="group relative">
                    <img
                      src={item.url || item}
                      alt={`${selectedSport} image ${index + 1}`}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="bg-white/90 p-2 rounded-full text-blue-600 hover:scale-110 transition-transform">
                        <FaPlus className="text-lg" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">
                No {activeTab} found. {isFromAdmin && 'Click the button above to add some.'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              {deleteType === 'all'
                ? `Are you sure you want to delete all ${activeTab === 'image' ? 'images' : 'videos'}? This action cannot be undone.`
                : 'Are you sure you want to delete this item? This action cannot be undone.'}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete()}
                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Deleting...
                  </span>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 ease-in-out
            ${toast.type === "success" ? "bg-green-600" :
              toast.type === "error" ? "bg-red-600" :
                "bg-blue-600"}`}
        >
          <div className="flex items-center space-x-2">
            {toast.type === "success" ? (
              <FiCheck className="w-5 h-5" />
            ) : (
              <FiInfo className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
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
            Gallery
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {selectedSport ? (
          <div>
            <div className="flex items-center justify-between mb-6">

              {/* Back Button */}
              <button
                onClick={() => {
                  setSelectedSport(null);
                  setSportGalleries([]);
                }}
                className="    flex items-center gap-2
    px-4 py-2
    text-blue-700 font-medium
    bg-white border border-blue-200
    rounded-lg shadow-sm
    hover:bg-blue-50 hover:border-blue-400 hover:shadow
    transition-all duration-200"
              >
                <FiArrowLeft className="mr-2" />

              </button>

              {/* Page Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {selectedSport} Gallery
              </h2>

              {/* 🔵 Image / Video Tabs */}
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveTab("image")}
                  className={`px-4 py-2 text-sm font-medium transition ${activeTab === "image"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600"
                    }`}
                >
                  Images
                </button>

                <button
                  onClick={() => setActiveTab("video")}
                  className={`px-4 py-2 text-sm font-medium transition border-l ${activeTab === "video"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600"
                    }`}
                >
                  Videos
                </button>
              </div>

            </div>

            {renderGalleryContent()}
          </div>
        ) : (
          renderSportsGrid()
        )}
      </div>

      {/* Popup Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Gallery</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setGalleryType("image");
                  setVideoLinks([""]);
                  setSelectedImages([]);
                  setSelectedSportId("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Sport */}
              <div>
                {/* <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Sport *</label> */}
                <select
                  value={selectedSportId}
                  onChange={(e) => setSelectedSportId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required

                >
                  <option value="" disabled>Select a sport</option>
                  {sportsList.map((sport) => (
                    <option key={sport._id || sport.id} value={sport._id || sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Name */}
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Event Name"
              />

              {/* Gallery Title */}
              <input
                type="text"
                value={galleryTitle}
                onChange={(e) => setGalleryTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Gallery Title"
              />

              <div className="relative">
                {/* Conducted Time */}
                <input
                  type="datetime-local"
                  ref={dateInputRef}
                  value={conductedTime}
                  onChange={(e) => setConductedTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Conducted Time"
                />

                <span
                  className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                  onClick={() => {
                    if (dateInputRef.current) {
                      dateInputRef.current.showPicker(); // 👈 opens the calendar
                    }
                  }}
                >
                  📅
                </span>
              </div>

              {/* Gallery Type */}
              <select
                value={galleryType}
                onChange={(e) => setGalleryType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>

              {/* Status */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="BLOCKED">Blocked</option>
              </select>

              {/* Image Uploads (Only for Image Type) */}
              {galleryType === "image" && (
                <>
                  <label className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium cursor-pointer">
                    <span>🖼️ Pick Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {previewImages.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          className="w-full h-20 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Video Links (Only for Video Type) */}
              {galleryType === "video" && (
                <div className="space-y-2">
                  {videoLinks.map((link, index) => (
                    <input
                      key={index}
                      type="text"
                      value={link}
                      onChange={(e) => handleVideoChange(index, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="YouTube Video Link"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={handleAddVideoField}
                    className="text-blue-600 text-sm"
                  >
                    + Add Link
                  </button>
                </div>
              )}

              {/* Error Message */}
              {formError && (
                <p className="text-red-500 text-center">{formError}</p>
              )}

              {/* Buttons */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center ${isSubmitting
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
                  } text-white transition-colors`}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="mr-2" />
                    Save Gallery
                  </>
                )}
              </button>
            </form>


          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;


