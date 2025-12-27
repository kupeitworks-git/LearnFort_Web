import React, { useState, useEffect, useRef } from "react";
import { FaPlay, FaTimes, FaSpinner, FaCheckCircle, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiArrowLeft, FiCheck, FiInfo } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { BaseUrl } from '../api/api';

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
  const [selectedEvent, setSelectedEvent] = useState(null); // Track selected event for viewing all images
  const [groupedGalleries, setGroupedGalleries] = useState([]); // Store grouped events
  const [viewingImage, setViewingImage] = useState(null); // Track image being viewed in modal
  const [viewingIndex, setViewingIndex] = useState(0);
  const [viewingItems, setViewingItems] = useState([]);
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
      // console.error("Error parsing user data:", error);
    }
  }, []);

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    if (viewingItems.length <= 1) return;
    const newIndex = (viewingIndex - 1 + viewingItems.length) % viewingItems.length;
    setViewingIndex(newIndex);
    setViewingImage(viewingItems[newIndex].url);
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    if (viewingItems.length <= 1) return;
    const newIndex = (viewingIndex + 1) % viewingItems.length;
    setViewingIndex(newIndex);
    setViewingImage(viewingItems[newIndex].url);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewingImage) return;
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') setViewingImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingImage, viewingIndex, viewingItems]);

  // Check if user is admin or super admin
  const isAdminUser = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

  useEffect(() => {
    const fetchSportsList = async () => {
      try {
        setLoading(true);
        // ('Fetching sports list...');
        const response = await axios.get(`${BaseUrl}sports/list`, {
          headers: {
            // 'Authorization': `Bearer ${token}`
          }
        });

        // ('API Response:', response.data);

        if (response.data && response.data.sports) {
          const sports = response.data.sports;
          // ('Sports data:', sports);

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

          // ('Formatted data:', formattedData);
          setSportsData(formattedData);
          setSportsList(sports);
        } else {
          // console.error('Unexpected API response format:', response.data);
          setError('Unexpected data format received from server');
        }
      } catch (err) {
        // console.error('Error fetching sports list:', err);
        setError('Failed to load sports data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSportsList();
  }, []);

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

        setItemToDelete(null);
        setDeleteType("");
        setDeleteSportId("");

      } catch (error) {
        // console.error("Error deleting item:", error);
        showToast("Failed to delete item. Please try again.", "error");
      } finally {
        setIsDeleting(false);
      }
      return;
    }

    // --------------------------
    // DELETE EVENT (All items in a specific event)
    // --------------------------
    if (deleteType === "event" && Array.isArray(itemToDelete) && itemToDelete.length > 0) {
      try {
        setIsDeleting(true);
        showToast(`Deleting ${itemToDelete.length} items from event...`, "info");

        // Delete all items in the event one by one
        for (const itemId of itemToDelete) {
          try {
            await axios.delete(`${BaseUrl}gallery/delete/${itemId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (err) {
            // console.error("Error deleting item:", itemId);
          }
        }

        showToast(`Successfully deleted event with ${itemToDelete.length} items.`, "success");
        setShowDeleteModal(false);

        // Refresh UI
        if (selectedSportId) {
          await fetchSportGallery(selectedSportId);
          await refreshSportsData();
        }

        setItemToDelete(null);
        setDeleteType("");
        setDeleteSportId("");

      } catch (error) {
        // console.error("Event delete error:", error);
        showToast("Error occurred while deleting event.", "error");
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
            // console.error("Error deleting item:", item._id);
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
        // console.error("Bulk delete error:", error);
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
      // console.error('Error refreshing sports data:', error);
    }
  };

  const fetchSportGallery = async (sportId) => {
    if (!sportId) return;

    try {
      setLoadingGallery(true);
      const response = await axios.get(`${BaseUrl}gallery/list/${sportId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data && response.data.gallery) {
        let allItems = [];
        let grouped = [];

        // Iterate through the grouped gallery response
        response.data.gallery.forEach(group => {
          if (group.items && Array.isArray(group.items)) {
            const groupItems = group.items.map(item => ({
              ...item,
              event_name: group.event_name,
              conducted_time: group.conducted_time,
              parent_gallery_title: group.gallery_title,
              thumbnail: item.type === 'IMAGE' ? item.url : getYoutubeThumbnail(item.url)
            }));
            allItems = [...allItems, ...groupItems];

            // Store grouped structure
            grouped.push({
              event_name: group.event_name,
              gallery_title: group.gallery_title,
              conducted_time: group.conducted_time,
              items: groupItems
            });
          }
        });

        // ("Flattened gallery items:", allItems);
        // ("Grouped gallery events:", grouped);
        setSportGalleries(allItems);
        setGroupedGalleries(grouped);

      } else {
        setSportGalleries([]);
        setGroupedGalleries([]);
      }
    } catch (error) {
      // console.error('Error fetching sport gallery:', error);
      showToast('Failed to load gallery. Please try again.', 'error');
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleSportClick = (sportName, sportId) => {
    setSelectedSport(sportName);
    setSelectedSportId(sportId);
    setActiveTab('image'); // Reset to Images tab when a new sport is selected
    setSelectedEvent(null); // Reset selected event
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

      // ('Gallery added successfully:', response.data);

      // Show success message
      showToast("Gallery added successfully!", 'success');

      // Reset form and refresh data
      handleFormReset();
      await fetchSportGallery(selectedSportId);
      await refreshSportsData();
      showToast("Gallery updated successfully!", "success");
    } catch (error) {
      // console.error('Error uploading gallery items:', error);
      const errorMessage = "Failed to upload gallery items. Please try again.";
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

    // If an event is selected, show all images/videos within that event
    if (selectedEvent) {
      const filteredItems = selectedEvent.items.filter(item =>
        activeTab === 'image' ? item.type === 'IMAGE' : item.type === 'VIDEO'
      );

      return (
        <div className="p-4">
          {/* Back button and event header */}
          <div className="mb-6 text-center">
            <p className="text-gray-500 font-medium">{selectedEvent.gallery_title}</p>
            <p className="text-sm text-gray-400">{formatDate(selectedEvent.conducted_time)}</p>
          </div>

          {/* Images/Videos Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredItems.map((item, index) => (
                <div
                  key={item._id}
                  onClick={() => {
                    if (item.type === 'IMAGE') {
                      // Open image in modal
                      setViewingImage(item.url);
                      setViewingIndex(index);
                      setViewingItems(filteredItems);
                    } else {
                      // Open video in new tab
                      window.open(item.url, '_blank');
                    }
                  }}
                  className="relative group rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No {activeTab === 'image' ? 'images' : 'videos'} found for this event.</p>
            </div>
          )}
        </div>
      );
    }

    // Show grouped events
    const filteredEvents = groupedGalleries.map(event => ({
      ...event,
      items: event.items.filter(item =>
        activeTab === 'image' ? item.type === 'IMAGE' : item.type === 'VIDEO'
      )
    })).filter(event => event.items.length > 0);

    if (filteredEvents.length > 0) {
      return (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event, index) => {
              const previewImage = event.items[0];

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  {/* Event Header */}
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate text-left">    <span className="font-bold">Event Name:</span> {event.event_name}</h3>
                        <p className="text-xs text-gray-500 truncate text-left">   <span className="font-bold">Gallery Name:</span> {event.gallery_title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 text-left">  <span className="font-bold">Date:</span> {formatDate(event.conducted_time)}</p>
                      </div>
                      {isFromAdmin && (
                        <div className="relative group flex-shrink-0">
                          <button className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <circle cx="10" cy="4" r="1.5" />
                              <circle cx="10" cy="10" r="1.5" />
                              <circle cx="10" cy="16" r="1.5" />
                            </svg>
                          </button>
                          {/* Dropdown menu */}
                          <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 rounded-t-lg flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteType('event');
                                setItemToDelete(event.items.map(i => i._id));
                                setShowDeleteModal(true);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-red-50 text-sm text-red-600 rounded-b-lg flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete All
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview Image */}
                  <div
                    onClick={() => setSelectedEvent(event)}
                    className="cursor-pointer relative"
                  >
                    <div className="relative h-48">
                      {previewImage.type === 'IMAGE' ? (
                        <img
                          src={previewImage.url}
                          alt={event.event_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                          }}
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <img
                            src={previewImage.thumbnail}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <div className="w-14 h-14 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                              <FaPlay className="text-blue-600 text-xl ml-1" />
                            </div>
                          </div>
                        </div>
                      )}
                      {event.items.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                          +{event.items.length - 1} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
    // This function is seemingly unused but left for reference if needed or cleaned up
    // We primarily use renderGalleryContent now.
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaTrash className="text-red-500 text-2xl" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {deleteType === 'all'
                  ? 'Delete All Items?'
                  : deleteType === 'event'
                    ? 'Delete Event?'
                    : 'Delete Item?'}
              </h3>

              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {deleteType === 'all'
                  ? `Are you sure you want to delete all ${activeTab === 'image' ? 'images' : 'videos'}? This action cannot be undone.`
                  : deleteType === 'event'
                    ? `Are you sure you want to delete this entire event with all its ${Array.isArray(itemToDelete) ? itemToDelete.length : 0} items? This action cannot be undone.`
                    : 'Are you sure you want to delete this item? This action cannot be undone.'}
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete()}
                  className={`flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all duration-200 flex items-center justify-center ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : 'Delete'}
                </button>
              </div>
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
            <div className="relative flex items-center justify-center mb-6 min-h-[42px]">

              {/* Back Button */}
              <button
                onClick={() => {
                  if (selectedEvent) {
                    setSelectedEvent(null);
                  } else {
                    setSelectedSport(null);
                    setSportGalleries([]);
                  }
                }}
                className="absolute left-0 flex items-center justify-center w-10 h-10 text-blue-700 bg-white border border-blue-200 rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-400 hover:shadow transition-all duration-200"
              >
                <FiArrowLeft className="text-xl" />
              </button>

              {/* Page Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {selectedSport} {selectedEvent && <span className="font-normal text-gray-600">/ {selectedEvent.event_name}</span>}
              </h2>

              {/* 🔵 Image / Video Tabs - Only show when NOT inside an event */}
              {!selectedEvent && (
                <div className="absolute right-0 flex border rounded-lg overflow-hidden hidden sm:flex">
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
              )}
              {/* Mobile Tabs Fallback (if needed, but for now sticking to maintaining structure) */}
            </div>

            {/* Mobile Tabs - Visible only on small screens and when not in event view */}
            {!selectedEvent && (
              <div className="flex sm:hidden border rounded-lg overflow-hidden mb-4 w-full">
                <button
                  onClick={() => setActiveTab("image")}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition ${activeTab === "image"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600"
                    }`}
                >
                  Images
                </button>

                <button
                  onClick={() => setActiveTab("video")}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition border-l ${activeTab === "video"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600"
                    }`}
                >
                  Videos
                </button>
              </div>
            )}

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
                  max={(() => {
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);
                    return today.toISOString().slice(0, 16);
                  })()}
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

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 md:p-10"
          onClick={() => setViewingImage(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-all duration-300 z-[110] bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md"
            title="Close (Esc)"
          >
            <FaTimes className="text-2xl" />
          </button>

          {/* Navigation Buttons */}
          {viewingItems.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all duration-300 z-[110] bg-white/5 hover:bg-white/15 p-4 md:p-6 rounded-full backdrop-blur-sm group"
                title="Previous (Left Arrow)"
              >
                <FaChevronLeft className="text-2xl md:text-3xl group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={handleNextImage}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all duration-300 z-[110] bg-white/5 hover:bg-white/15 p-4 md:p-6 rounded-full backdrop-blur-sm group"
                title="Next (Right Arrow)"
              >
                <FaChevronRight className="text-2xl md:text-3xl group-hover:scale-110 transition-transform" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-md text-sm font-medium z-[110]">
                {viewingIndex + 1} / {viewingItems.length}
              </div>
            </>
          )}

          {/* Image Container */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={viewingImage}
              alt={`Gallery image ${viewingIndex + 1}`}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg animate-in fade-in zoom-in duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
