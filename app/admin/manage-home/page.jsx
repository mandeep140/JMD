"use client";
import React, { useState, useEffect } from 'react';
import AdminNav from '@/app/component/AdminNav';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaArrowUp, FaArrowDown, FaPlay, FaUser } from "react-icons/fa";
import { MdVideoLibrary } from "react-icons/md";
import Image from 'next/image';

const ManageHomePage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    // Videos State
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showVideoPreview, setShowVideoPreview] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        youtubeUrl: '',
        order: 0
    });

    // Testimonials State
    const [testimonials, setTestimonials] = useState([]);
    const [testimonialsLoading, setTestimonialsLoading] = useState(true);
    const [showTestimonialAddModal, setShowTestimonialAddModal] = useState(false);
    const [showTestimonialEditModal, setShowTestimonialEditModal] = useState(false);
    const [showTestimonialDeleteModal, setShowTestimonialDeleteModal] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);
    
    const [testimonialFormData, setTestimonialFormData] = useState({
        name: '',
        designation: '',
        message: '',
        active: true,
        order: 0
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        }
        if (status === "authenticated") {
            if (!session?.user?.isAdmin) {
                alert("Admin access required");
                router.push("/admin");
                return;
            }
            fetchVideos();
            fetchTestimonials();
        }
    }, [status, router, session]);

    // Videos Functions
    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/videos?showAll=true');
            if (response.ok) {
                const data = await response.json();
                setVideos(data);
            } else {
                throw new Error('Failed to fetch videos');
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
            alert('Error fetching videos');
        } finally {
            setLoading(false);
        }
    };

    // Testimonials Functions
    const fetchTestimonials = async () => {
        try {
            setTestimonialsLoading(true);
            const response = await fetch('/api/testimonials?showAll=true');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setTestimonials(data.testimonials);
                }
            } else {
                throw new Error('Failed to fetch testimonials');
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            alert('Error fetching testimonials');
        } finally {
            setTestimonialsLoading(false);
        }
    };

    const handleTestimonialSubmit = async (e) => {
        e.preventDefault();
        
        if (!testimonialFormData.name.trim() || !testimonialFormData.designation.trim() || !testimonialFormData.message.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const url = selectedTestimonial ? `/api/testimonials/${selectedTestimonial._id}` : '/api/testimonials';
            const method = selectedTestimonial ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testimonialFormData)
            });

            const data = await response.json();

            if (data.success) {
                alert(selectedTestimonial ? 'Testimonial updated successfully!' : 'Testimonial added successfully!');
                setShowTestimonialAddModal(false);
                setShowTestimonialEditModal(false);
                setSelectedTestimonial(null);
                setTestimonialFormData({
                    name: '',
                    designation: '',
                    message: '',
                    active: true,
                    order: 0
                });
                fetchTestimonials();
            } else {
                alert(data.message || 'Error saving testimonial');
            }
        } catch (error) {
            console.error('Error saving testimonial:', error);
            alert('Error saving testimonial');
        }
    };

    const handleTestimonialEdit = (testimonial) => {
        setSelectedTestimonial(testimonial);
        setTestimonialFormData({
            name: testimonial.name,
            designation: testimonial.designation,
            message: testimonial.message,
            active: testimonial.active,
            order: testimonial.order
        });
        setShowTestimonialEditModal(true);
    };

    const handleTestimonialDelete = async () => {
        if (!selectedTestimonial) return;

        try {
            const response = await fetch(`/api/testimonials/${selectedTestimonial._id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                alert('Testimonial deleted successfully!');
                setShowTestimonialDeleteModal(false);
                setSelectedTestimonial(null);
                fetchTestimonials();
            } else {
                alert(data.message || 'Error deleting testimonial');
            }
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            alert('Error deleting testimonial');
        }
    };

    const handleAddVideo = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Video added successfully!');
                setShowAddModal(false);
                setFormData({ title: '', youtubeUrl: '', order: 0 });
                fetchVideos();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to add video');
            }
        } catch (error) {
            console.error('Error adding video:', error);
            alert('Error adding video');
        }
    };

    const handleUpdateVideo = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                videoId: selectedVideo._id,
                title: formData.title,
                youtubeUrl: formData.youtubeUrl,
                order: formData.order
            };

            const response = await fetch('/api/videos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                alert('Video updated successfully!');
                setShowEditModal(false);
                setSelectedVideo(null);
                setFormData({ title: '', youtubeUrl: '', order: 0 });
                fetchVideos();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update video');
            }
        } catch (error) {
            console.error('Error updating video:', error);
            alert('Error updating video');
        }
    };

    const handleDeleteVideo = async () => {
        try {
            const response = await fetch('/api/videos', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId: selectedVideo._id })
            });

            if (response.ok) {
                alert('Video deleted successfully!');
                setShowDeleteModal(false);
                setSelectedVideo(null);
                fetchVideos();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete video');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Error deleting video');
        }
    };

    const handleToggleActive = async (video) => {
        try {
            const response = await fetch('/api/videos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoId: video._id,
                    isActive: !video.isActive
                })
            });

            if (response.ok) {
                fetchVideos();
            } else {
                alert('Failed to update video status');
            }
        } catch (error) {
            console.error('Error toggling video status:', error);
            alert('Error updating video status');
        }
    };

    const openEditModal = (video) => {
        setSelectedVideo(video);
        setFormData({
            title: video.title,
            youtubeUrl: video.youtubeUrl,
            order: video.order
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (video) => {
        setSelectedVideo(video);
        setShowDeleteModal(true);
    };

    const openPreviewModal = (video) => {
        setSelectedVideo(video);
        setShowVideoPreview(true);
    };

    const handleImageError = (e) => {
        e.target.src = '/images/about/bg.png'; // Default fallback image
    };

    if (status === "loading" || loading) {
        return (
            <AdminNav>
                <div className="w-full h-full flex items-center justify-center text-black text-center">
                    Loading home management data...
                </div>
            </AdminNav>
        );
    }

    if (status === "authenticated" && !session?.user?.isAdmin) {
        return (
            <AdminNav>
                <div className="w-full h-full flex items-center justify-center text-black text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        Access Denied: Admin privileges required
                    </div>
                </div>
            </AdminNav>
        );
    }

    return (
        <AdminNav>
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Home Page</h1>
                
                {/* Videos Section */}
                <div className="bg-white rounded-lg shadow-md mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <MdVideoLibrary className="text-2xl text-blue-500 mr-3" />
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">Videos Management</h2>
                                    <p className="text-gray-600 text-sm">Manage YouTube videos displayed on the home page</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                            >
                                <FaPlus className="mr-2" />
                                Add Video
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : videos.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <MdVideoLibrary className="text-4xl mx-auto mb-2 opacity-50" />
                                <p>No videos found. Add your first video to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {videos.map((video) => (
                                    <div key={video._id} className="bg-gray-50 rounded-lg p-4 border">
                                        <div className="relative mb-3">
                                            <img
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                className="w-full h-40 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => {
                                                    setSelectedVideo(video);
                                                    setShowVideoPreview(true);
                                                }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <FaPlay className="text-white text-2xl opacity-80 hover:opacity-100 cursor-pointer" />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <h3 className="font-semibold text-gray-800 mb-1">{video.title}</h3>
                                            <p className="text-sm text-gray-600">Order: {video.order}</p>
                                            <div className="flex items-center mt-2">
                                                {video.isActive ? (
                                                    <><FaEye className="text-green-500 mr-1" /> <span className="text-green-600 text-sm">Active</span></>
                                                ) : (
                                                    <><FaEyeSlash className="text-red-500 mr-1" /> <span className="text-red-600 text-sm">Inactive</span></>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <button
                                                onClick={() => {
                                                    setSelectedVideo(video);
                                                    setFormData({
                                                        title: video.title,
                                                        youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
                                                        order: video.order
                                                    });
                                                    setShowEditModal(true);
                                                }}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                                            >
                                                <FaEdit className="mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedVideo(video);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                                            >
                                                <FaTrash className="mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Testimonials Section */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <FaUser className="text-2xl text-green-500 mr-3" />
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">Testimonials Management</h2>
                                    <p className="text-gray-600 text-sm">Manage customer testimonials displayed on the home page</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowTestimonialAddModal(true)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                            >
                                <FaPlus className="mr-2" />
                                Add Testimonial
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {testimonialsLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            </div>
                        ) : testimonials.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FaUser className="text-4xl mx-auto mb-2 opacity-50" />
                                <p>No testimonials found. Add your first testimonial to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {testimonials.map((testimonial) => (
                                    <div key={testimonial._id} className="bg-gray-50 rounded-lg p-4 border">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-3">
                                                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                                                        <FaUser className="text-white text-sm" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800">{testimonial.name}</h3>
                                                        <p className="text-sm text-gray-600">{testimonial.designation}</p>
                                                    </div>
                                                    <div className="ml-auto flex items-center">
                                                        <span className="text-sm text-gray-500 mr-4">Order: {testimonial.order}</span>
                                                        {testimonial.active ? (
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Inactive</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 mb-3">{testimonial.message}</p>
                                                <p className="text-xs text-gray-500">
                                                    Created: {new Date(testimonial.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2 mt-4">
                                            <button
                                                onClick={() => handleTestimonialEdit(testimonial)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                                            >
                                                <FaEdit className="mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedTestimonial(testimonial);
                                                    setShowTestimonialDeleteModal(true);
                                                }}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                                            >
                                                <FaTrash className="mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Video Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Add New Video</h3>
                        </div>
                        <form onSubmit={handleAddVideo} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Video Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter video title"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    YouTube URL
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={formData.youtubeUrl}
                                    onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Paste the full YouTube video URL
                                </p>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.order}
                                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setFormData({ title: '', youtubeUrl: '', order: 0 });
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Add Video
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Video Modal */}
            {showEditModal && selectedVideo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Edit Video</h3>
                        </div>
                        <form onSubmit={handleUpdateVideo} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Video Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    YouTube URL
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={formData.youtubeUrl}
                                    onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.order}
                                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedVideo(null);
                                        setFormData({ title: '', youtubeUrl: '', order: 0 });
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Update Video
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedVideo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Delete Video</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete the video "<strong>{selectedVideo.title}</strong>"? 
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedVideo(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteVideo}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Preview Modal */}
            {showVideoPreview && selectedVideo && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                {selectedVideo.title}
                            </h3>
                            <button
                                onClick={() => setShowVideoPreview(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="aspect-video">
                                <iframe
                                    src={selectedVideo.embedUrl}
                                    title={selectedVideo.title}
                                    className="w-full h-full rounded-lg"
                                    allowFullScreen
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Testimonial Add Modal */}
            {showTestimonialAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-semibold mb-4">Add New Testimonial</h3>
                        <form onSubmit={handleTestimonialSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={testimonialFormData.name}
                                    onChange={(e) => setTestimonialFormData({...testimonialFormData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                                <input
                                    type="text"
                                    value={testimonialFormData.designation}
                                    onChange={(e) => setTestimonialFormData({...testimonialFormData, designation: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                                <textarea
                                    value={testimonialFormData.message}
                                    onChange={(e) => setTestimonialFormData({...testimonialFormData, message: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                <input
                                    type="number"
                                    value={testimonialFormData.order}
                                    onChange={(e) => setTestimonialFormData({...testimonialFormData, order: parseInt(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={testimonialFormData.active}
                                        onChange={(e) => setTestimonialFormData({...testimonialFormData, active: e.target.checked})}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTestimonialAddModal(false);
                                        setTestimonialFormData({
                                            name: '',
                                            designation: '',
                                            message: '',
                                            active: true,
                                            order: 0
                                        });
                                    }}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                >
                                    Add Testimonial
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Testimonial Edit Modal */}
            {showTestimonialEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-semibold mb-4">Edit Testimonial</h3>
                        <form onSubmit={handleTestimonialSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={testimonialFormData.name}
                                    onChange={(e) => setTestimonialFormData({...testimonialFormData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                                <input
                                    type="text"
                                    value={testimonialFormData.designation}
                                    onChange={(e) => setTestimonialFormData({...testimonialFormData, designation: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                                <textarea
                                    value={testimonialFormData.message}
                                    onChange={(e) => setTestimonialFormData({...testimonialFormData, message: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                <input
                                    type="number"
                                    value={testimonialFormData.order}
                                    onChange={(e) => setTestimonialFormData({...testimonialFormData, order: parseInt(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={testimonialFormData.active}
                                        onChange={(e) => setTestimonialFormData({...testimonialFormData, active: e.target.checked})}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTestimonialEditModal(false);
                                        setSelectedTestimonial(null);
                                        setTestimonialFormData({
                                            name: '',
                                            designation: '',
                                            message: '',
                                            active: true,
                                            order: 0
                                        });
                                    }}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                >
                                    Update Testimonial
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Testimonial Delete Modal */}
            {showTestimonialDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-semibold mb-4">Delete Testimonial</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete the testimonial from <strong>{selectedTestimonial?.name}</strong>? 
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowTestimonialDeleteModal(false);
                                    setSelectedTestimonial(null);
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTestimonialDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminNav>
    );
};

export default ManageHomePage;