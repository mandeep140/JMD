"use client";
import React, { useState, useEffect } from 'react';
import AdminNav from '@/app/component/AdminNav';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaArrowUp, FaArrowDown, FaPlay, FaUser, FaImage } from "react-icons/fa";
import { MdVideoLibrary } from "react-icons/md";
import Image from 'next/image';
import { set } from 'mongoose';

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

    // Media Coverage State
    const [mediaCoverage, setMediaCoverage] = useState([]);
    const [mediaCoverageLoading, setMediaCoverageLoading] = useState(true);
    const [showMediaAddModal, setShowMediaAddModal] = useState(false);
    const [showMediaEditModal, setShowMediaEditModal] = useState(false);
    const [showMediaDeleteModal, setShowMediaDeleteModal] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaUploading, setMediaUploading] = useState(false);

    const [mediaFormData, setMediaFormData] = useState({
        title: '',
        image: null,
        order: 0
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        }
        if (status === "authenticated") {
            if (!session?.user?.isAdmin) {
                setLoading(false);
            } else {
                fetchVideos();
                fetchTestimonials();
                fetchMediaCoverage();
            }
        }
    }, [status, session, router]);

    // Video Functions
    const fetchVideos = async () => {
        try {
            const response = await fetch('/api/videos');
            if (response.ok) {
                const videosData = await response.json();
                setVideos(videosData);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Testimonials Functions
    const fetchTestimonials = async () => {
        try {
            const response = await fetch('/api/testimonials');
            const data = await response.json();
            if (data.success) {
                setTestimonials(data.testimonials);
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        } finally {
            setTestimonialsLoading(false);
        }
    };

    // Media Coverage Functions
    const fetchMediaCoverage = async () => {
        try {
            const response = await fetch('/api/media-coverage');
            const data = await response.json();
            if (data.success) {
                setMediaCoverage(data.items || []);
            }
        } catch (error) {
            console.error('Error fetching media coverage:', error);
        } finally {
            setMediaCoverageLoading(false);
        }
    };

    const handleMediaImageUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'media-coverage');

        try {
            const response = await fetch('/api/imagekit', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    url: data.url,
                    fileId: data.fileId
                };
            } else {
                throw new Error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleMediaAdd = async (e) => {
        e.preventDefault();
        if (!mediaFormData.title || !mediaFormData.image) {
            alert('Please fill in all fields and select an image');
            return;
        }

        setMediaUploading(true);
        try {
            // First upload image to ImageKit
            const imageData = await handleMediaImageUpload(mediaFormData.image);

            // Then save to database
            const response = await fetch('/api/media-coverage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: mediaFormData.title,
                    imageUrl: imageData.url,
                    imageId: imageData.fileId,
                    order: mediaFormData.order
                }),
            });

            if (response.ok) {
                await fetchMediaCoverage();
                setShowMediaAddModal(false);
                setMediaFormData({ title: '', image: null, order: 0 });
                alert('Media coverage item added successfully!');
            } else {
                throw new Error('Failed to add media coverage item');
            }
        } catch (error) {
            console.error('Error adding media coverage:', error);
            alert('Error adding media coverage item');
        } finally {
            setMediaUploading(false);
        }
    };

    const handleMediaEdit = async (e) => {
        e.preventDefault();
        if (!mediaFormData.title) {
            alert('Please enter a title');
            return;
        }

        setMediaUploading(true);
        try {
            let updateData = {
                id: selectedMedia._id,
                title: mediaFormData.title,
                order: mediaFormData.order
            };

            // If new image is selected, upload it first
            if (mediaFormData.image) {
                const imageData = await handleMediaImageUpload(mediaFormData.image);
                updateData.imageUrl = imageData.url;
                updateData.imageId = imageData.fileId;
            }

            const response = await fetch('/api/media-coverage', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                await fetchMediaCoverage();
                setShowMediaEditModal(false);
                setSelectedMedia(null);
                setMediaFormData({ title: '', image: null, order: 0 });
                alert('Media coverage item updated successfully!');
            } else {
                throw new Error('Failed to update media coverage item');
            }
        } catch (error) {
            console.error('Error updating media coverage:', error);
            alert('Error updating media coverage item');
        } finally {
            setMediaUploading(false);
        }
    };

    const handleMediaDelete = async () => {
        try {
            const response = await fetch(`/api/media-coverage?id=${selectedMedia._id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchMediaCoverage();
                setShowMediaDeleteModal(false);
                setSelectedMedia(null);
                alert('Media coverage item deleted successfully!');
            } else {
                throw new Error('Failed to delete media coverage item');
            }
        } catch (error) {
            console.error('Error deleting media coverage:', error);
            alert('Error deleting media coverage item');
        }
    };

    const handleMediaToggleActive = async (media) => {
        try {
            const response = await fetch('/api/media-coverage', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: media._id,
                    active: !media.active
                }),
            });

            if (response.ok) {
                await fetchMediaCoverage();
            } else {
                throw new Error('Failed to toggle media coverage status');
            }
        } catch (error) {
            console.error('Error toggling media coverage status:', error);
            alert('Error updating media coverage status');
        }
    };

    // Video functions (keeping existing ones)...
    const handleAddVideo = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/videos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await fetchVideos();
                setShowAddModal(false);
                setFormData({ title: '', youtubeUrl: '', order: 0 });
                alert('Video added successfully!');
            } else {
                alert('Failed to add video');
            }
        } catch (error) {
            console.error('Error adding video:', error);
            alert('Error adding video');
        }
    };

    const handleUpdateVideo = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/videos', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: selectedVideo._id,
                    ...formData
                }),
            });

            if (response.ok) {
                await fetchVideos();
                setShowEditModal(false);
                setSelectedVideo(null);
                setFormData({ title: '', youtubeUrl: '', order: 0 });
                alert('Video updated successfully!');
            } else {
                alert('Failed to update video');
            }
        } catch (error) {
            console.error('Error updating video:', error);
            alert('Error updating video');
        }
    };

    const handleDeleteVideo = async () => {
        try {
            const response = await fetch(`/api/videos?id=${selectedVideo._id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchVideos();
                setShowDeleteModal(false);
                setSelectedVideo(null);
                alert('Video deleted successfully!');
            } else {
                alert('Failed to delete video');
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: video._id,
                    isActive: !video.isActive
                }),
            });

            if (response.ok) {
                await fetchVideos();
            } else {
                alert('Failed to toggle video status');
            }
        } catch (error) {
            console.error('Error toggling video status:', error);
            alert('Error updating video status');
        }
    };

    // Testimonial functions...
    const handleTestimonialSubmit = async (e) => {
        e.preventDefault();

        if (!testimonialFormData.name.trim() || !testimonialFormData.designation.trim() || !testimonialFormData.message.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const url = selectedTestimonial ? '/api/testimonials' : '/api/testimonials';
            const method = selectedTestimonial ? 'PUT' : 'POST';
            const body = selectedTestimonial
                ? { id: selectedTestimonial._id, ...testimonialFormData }
                : testimonialFormData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                await fetchTestimonials();
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
                alert(`Testimonial ${selectedTestimonial ? 'updated' : 'added'} successfully!`);
            } else {
                alert(`Failed to ${selectedTestimonial ? 'update' : 'add'} testimonial`);
            }
        } catch (error) {
            console.error('Error with testimonial:', error);
            alert('Error processing testimonial');
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
            const response = await fetch(`/api/testimonials?id=${selectedTestimonial._id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchTestimonials();
                setShowTestimonialDeleteModal(false);
                setSelectedTestimonial(null);
                alert('Testimonial deleted successfully!');
            } else {
                alert('Failed to delete testimonial');
            }
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            alert('Error deleting testimonial');
        }
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
            <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
                <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-800">Manage Home Page</h1>

                {/* Videos Section */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-4 lg:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="flex items-center">
                                <MdVideoLibrary className="text-xl lg:text-2xl text-blue-500 mr-3" />
                                <div>
                                    <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Videos Management</h2>
                                    <p className="text-gray-600 text-sm">Manage YouTube videos displayed on the home page</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm lg:text-base"
                            >
                                <FaPlus className="mr-2" />
                                Add Video
                            </button>
                        </div>
                    </div>

                    <div className="p-4 lg:p-6">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                {videos.map((video) => (
                                    <div key={video._id} className="bg-gray-50 rounded-lg p-4 border">
                                        <div className="relative mb-3">
                                            <img
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                className="w-full h-32 lg:h-40 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => {
                                                    setSelectedVideo(video);
                                                    setShowVideoPreview(true);
                                                }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <FaPlay className="text-white text-xl lg:text-2xl opacity-80 hover:opacity-100 cursor-pointer" />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <h3 className="font-semibold text-gray-800 mb-1 text-sm lg:text-base line-clamp-2">{video.title}</h3>
                                            <p className="text-xs lg:text-sm text-gray-600">Order: {video.order}</p>
                                            <div className="flex items-center mt-2">
                                                {video.isActive ? (
                                                    <><FaEye className="text-green-500 mr-1" /> <span className="text-green-600 text-xs lg:text-sm">Active</span></>
                                                ) : (
                                                    <><FaEyeSlash className="text-red-500 mr-1" /> <span className="text-red-600 text-xs lg:text-sm">Inactive</span></>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between gap-2">
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
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 lg:px-3 py-1 rounded text-xs lg:text-sm flex items-center transition-colors"
                                            >
                                                <FaEdit className="mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedVideo(video);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="bg-red-500 hover:bg-red-600 text-white px-2 lg:px-3 py-1 rounded text-xs lg:text-sm flex items-center transition-colors"
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
                    <div className="p-4 lg:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="flex items-center">
                                <FaUser className="text-xl lg:text-2xl text-green-500 mr-3" />
                                <div>
                                    <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Testimonials Management</h2>
                                    <p className="text-gray-600 text-sm">Manage customer testimonials displayed on the home page</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowTestimonialAddModal(true)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm lg:text-base"
                            >
                                <FaPlus className="mr-2" />
                                Add Testimonial
                            </button>
                        </div>
                    </div>

                    <div className="p-4 lg:p-6">
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
                                                <div className="flex flex-col sm:flex-row sm:items-center mb-3 gap-3">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-black rounded-full flex items-center justify-center mr-3">
                                                            <FaUser className="text-white text-xs lg:text-sm" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800 text-sm lg:text-base">{testimonial.name}</h3>
                                                            <p className="text-xs lg:text-sm text-gray-600">{testimonial.designation}</p>
                                                        </div>
                                                    </div>
                                                    <div className="sm:ml-auto flex items-center gap-4">
                                                        <span className="text-xs lg:text-sm text-gray-500">Order: {testimonial.order}</span>
                                                        {testimonial.active ? (
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Inactive</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 mb-3 text-sm lg:text-base">{testimonial.message}</p>
                                                <p className="text-xs text-gray-500">
                                                    Created: {new Date(testimonial.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2 mt-4">
                                            <button
                                                onClick={() => handleTestimonialEdit(testimonial)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 lg:px-3 py-1 rounded text-xs lg:text-sm flex items-center transition-colors"
                                            >
                                                <FaEdit className="mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedTestimonial(testimonial);
                                                    setShowTestimonialDeleteModal(true);
                                                }}
                                                className="bg-red-500 hover:bg-red-600 text-white px-2 lg:px-3 py-1 rounded text-xs lg:text-sm flex items-center transition-colors"
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

                {/* Media Coverage Section */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-4 lg:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="flex items-center">
                                <FaImage className="text-xl lg:text-2xl text-purple-500 mr-3" />
                                <div>
                                    <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Media Coverage Management</h2>
                                    <p className="text-gray-600 text-sm">Manage media coverage items displayed on the home page</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowMediaAddModal(true)}
                                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm lg:text-base"
                            >
                                <FaPlus className="mr-2" />
                                Add Media Item
                            </button>
                        </div>
                    </div>

                    <div className="p-4 lg:p-6">
                        {mediaCoverageLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading media coverage...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-2 lg:px-4 py-3 text-left text-xs lg:text-sm font-medium text-gray-700">Image</th>
                                            <th className="px-2 lg:px-4 py-3 text-left text-xs lg:text-sm font-medium text-gray-700">Title</th>
                                            <th className="px-2 lg:px-4 py-3 text-left text-xs lg:text-sm font-medium text-gray-700 hidden sm:table-cell">Order</th>
                                            <th className="px-2 lg:px-4 py-3 text-left text-xs lg:text-sm font-medium text-gray-700">Status</th>
                                            <th className="px-2 lg:px-4 py-3 text-left text-xs lg:text-sm font-medium text-gray-700 hidden md:table-cell">Created</th>
                                            <th className="px-2 lg:px-4 py-3 text-left text-xs lg:text-sm font-medium text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mediaCoverage.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                                    No media coverage items found. Add your first item!
                                                </td>
                                            </tr>
                                        ) : (
                                            mediaCoverage.map((media) => (
                                                <tr key={media._id} className="border-b hover:bg-gray-50">
                                                    <td className="px-2 lg:px-4 py-3">
                                                        <Image
                                                            src={media.imageUrl}
                                                            alt={media.title}
                                                            width={50}
                                                            height={50}
                                                            className="w-10 h-10 lg:w-15 lg:h-15 object-cover rounded-md"
                                                        />
                                                    </td>
                                                    <td className="px-2 lg:px-4 py-3 font-medium text-gray-900 text-xs lg:text-sm">
                                                        <div className="max-w-xs truncate">{media.title}</div>
                                                    </td>
                                                    <td className="px-2 lg:px-4 py-3 text-gray-700 text-xs lg:text-sm hidden sm:table-cell">
                                                        {media.order}
                                                    </td>
                                                    <td className="px-2 lg:px-4 py-3">
                                                        <button
                                                            onClick={() => handleMediaToggleActive(media)}
                                                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${media.active
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}
                                                        >
                                                            {media.active ? <FaEye className="text-xs" /> : <FaEyeSlash className="text-xs" />}
                                                            <span className="hidden sm:inline">{media.active ? 'Active' : 'Inactive'}</span>
                                                        </button>
                                                    </td>
                                                    <td className="px-2 lg:px-4 py-3 text-gray-600 text-xs hidden md:table-cell">
                                                        {new Date(media.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-2 lg:px-4 py-3">
                                                        <div className="flex gap-1 lg:gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMedia(media);
                                                                    setMediaFormData({
                                                                        title: media.title,
                                                                        image: null,
                                                                        order: media.order
                                                                    });
                                                                    setShowMediaEditModal(true);
                                                                }}
                                                                className="text-blue-500 hover:text-blue-700 p-1"
                                                                title="Edit"
                                                            >
                                                                <FaEdit className="text-xs lg:text-sm" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMedia(media);
                                                                    setShowMediaDeleteModal(true);
                                                                }}
                                                                className="text-red-500 hover:text-red-700 p-1"
                                                                title="Delete"
                                                            >
                                                                <FaTrash className="text-xs lg:text-sm" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
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
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
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
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
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
                                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                                <input
                                    type="text"
                                    value={testimonialFormData.designation}
                                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, designation: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                                <textarea
                                    value={testimonialFormData.message}
                                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, message: e.target.value })}
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
                                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, order: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={testimonialFormData.active}
                                        onChange={(e) => setTestimonialFormData({ ...testimonialFormData, active: e.target.checked })}
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
                                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                                <input
                                    type="text"
                                    value={testimonialFormData.designation}
                                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, designation: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                                <textarea
                                    value={testimonialFormData.message}
                                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, message: e.target.value })}
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
                                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, order: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={testimonialFormData.active}
                                        onChange={(e) => setTestimonialFormData({ ...testimonialFormData, active: e.target.checked })}
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

            {/* Media Coverage Add Modal */}
            {showMediaAddModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4">
                        <div className="p-4 lg:p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Media Coverage Item</h3>
                            <form onSubmit={handleMediaAdd}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={mediaFormData.title}
                                        onChange={(e) => setMediaFormData({ ...mediaFormData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setMediaFormData({ ...mediaFormData, image: e.target.files[0] })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                                    <input
                                        type="number"
                                        value={mediaFormData.order}
                                        onChange={(e) => setMediaFormData({ ...mediaFormData, order: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        min="0"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowMediaAddModal(false);
                                            setMediaFormData({ title: '', image: null, order: 0 });
                                        }}
                                        className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                        disabled={mediaUploading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={mediaUploading}
                                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300"
                                    >
                                        {mediaUploading ? 'Uploading...' : 'Add Item'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Coverage Edit Modal */}
            {showMediaEditModal && selectedMedia && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4">
                        <div className="p-4 lg:p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Media Coverage Item</h3>
                            <form onSubmit={handleMediaEdit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={mediaFormData.title}
                                        onChange={(e) => setMediaFormData({ ...mediaFormData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Image</label>
                                    <Image
                                        src={selectedMedia.imageUrl}
                                        alt={selectedMedia.title}
                                        width={80}
                                        height={80}
                                        className="w-16 h-16 object-cover rounded-md mb-2"
                                    />
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Image (optional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setMediaFormData({ ...mediaFormData, image: e.target.files[0] })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                                    <input
                                        type="number"
                                        value={mediaFormData.order}
                                        onChange={(e) => setMediaFormData({ ...mediaFormData, order: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        min="0"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowMediaEditModal(false);
                                            setSelectedMedia(null);
                                            setMediaFormData({ title: '', image: null, order: 0 });
                                        }}
                                        className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                        disabled={mediaUploading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={mediaUploading}
                                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300"
                                    >
                                        {mediaUploading ? 'Updating...' : 'Update Item'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Coverage Delete Modal */}
            {showMediaDeleteModal && selectedMedia && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4">
                        <div className="p-4 lg:p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Media Coverage Item</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete "{selectedMedia.title}"? This action cannot be undone and will also delete the image from cloud storage.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowMediaDeleteModal(false);
                                        setSelectedMedia(null);
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleMediaDelete}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminNav>
    );
};

export default ManageHomePage;