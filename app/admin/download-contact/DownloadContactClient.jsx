"use client";
import React, { useState, useEffect } from 'react';

const DownloadContactClient = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/download-contact');
            const data = await response.json();
            setContacts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setContacts([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter contacts based on search term and filter type
    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            contact.mobile.includes(searchTerm) ||
                            contact.reqid.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === 'all' || contact.downloadType === filterType;
        
        return matchesSearch && matchesType;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDownloadTypeColor = (type) => {
        return type === 'PPT' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-2 md:p-4 bg-[#E9E9E9] overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
                {/* Header */}
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
                    <h1 className="text-lg md:text-2xl font-bold text-gray-900">Download Contact Requests</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                        Total: {contacts.length} contacts | Filtered: {filteredContacts.length}
                    </p>
                </div>

                {/* Filters */}
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex flex-col sm:flex-row gap-2 md:gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by name, email, mobile, or request ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                        />
                    </div>
                    <div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full sm:w-auto px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                        >
                            <option value="all">All Types</option>
                            <option value="PPT">PowerPoint</option>
                            <option value="Excel">Excel</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-hidden">
                    <div className="h-full overflow-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact Info
                                    </th>
                                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Download Details
                                    </th>
                                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reason
                                    </th>
                                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredContacts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-3 md:px-6 py-8 text-center text-gray-500 text-sm md:text-base">
                                            No contacts found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredContacts.map((contact) => (
                                        <tr key={contact._id} className="hover:bg-gray-50">
                                            <td className="px-3 md:px-6 py-3 md:py-4">
                                                <div>
                                                    <div className="text-xs md:text-sm font-medium text-gray-900">
                                                        {contact.name}
                                                    </div>
                                                    <div className="text-xs md:text-sm text-gray-500">
                                                        {contact.email}
                                                    </div>
                                                    <div className="text-xs md:text-sm text-gray-500">
                                                        📱 {contact.mobile}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        ID: {contact.reqid}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-6 py-3 md:py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDownloadTypeColor(contact.downloadType)}`}>
                                                        {contact.downloadType}
                                                    </span>
                                                    <span className="text-xs md:text-sm text-gray-900">
                                                        {contact.totalAdsCount} ads
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-6 py-3 md:py-4">
                                                <div className="text-xs md:text-sm text-gray-900 max-w-xs truncate" title={contact.reason}>
                                                    {contact.reason}
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-500">
                                                {formatDate(contact.createdAt)}
                                            </td>
                                            <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedContact(contact)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedContact && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Download Request Details
                            </h3>
                            <button
                                onClick={() => setSelectedContact(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {/* Contact Information */}
                            <div className="mb-6">
                                <h4 className="text-md font-semibold text-gray-900 mb-3">Contact Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Name:</span>
                                        <p className="text-gray-900">{selectedContact.name}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Email:</span>
                                        <p className="text-gray-900">{selectedContact.email}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Mobile:</span>
                                        <p className="text-gray-900">{selectedContact.mobile}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Request ID:</span>
                                        <p className="text-gray-900">{selectedContact.reqid}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Download Details */}
                            <div className="mb-6">
                                <h4 className="text-md font-semibold text-gray-900 mb-3">Download Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Download Type:</span>
                                        <p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDownloadTypeColor(selectedContact.downloadType)}`}>
                                                {selectedContact.downloadType}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Total Ads:</span>
                                        <p className="text-gray-900">{selectedContact.totalAdsCount} hoardings</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="font-medium text-gray-700">Date & Time:</span>
                                        <p className="text-gray-900">{formatDate(selectedContact.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="mb-6">
                                <h4 className="text-md font-semibold text-gray-900 mb-3">Reason for Download</h4>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {selectedContact.reason}
                                </p>
                            </div>

                            {/* Selected Ads */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-3">
                                    Selected Ads ({selectedContact.selectedAds.length})
                                </h4>
                                <div className="max-h-60 overflow-y-auto">
                                    <div className="grid gap-2">
                                        {selectedContact.selectedAds.map((ad, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="font-medium text-gray-900">
                                                            {ad.mediaCode}
                                                        </span>
                                                        <p className="text-gray-700">{ad.title}</p>
                                                        <p className="text-gray-500 text-xs">
                                                            {ad.type} • {ad.city}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DownloadContactClient;