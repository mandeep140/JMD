"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [additionalPacks, setAdditionalPacks] = useState([]);
    const [cartLoaded, setCartLoaded] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
    const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const [showDownloadForm, setShowDownloadForm] = useState(false);
    const [downloadType, setDownloadType] = useState('');
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        callback: true
    });
    const [downloadForm, setDownloadForm] = useState({
        name: '',
        email: '',
        mobile: '',
        reason: ''
    });
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const [isSubmittingDownloadForm, setIsSubmittingDownloadForm] = useState(false);

    // Load cart and additional packs from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('jmd_cart_items');
        const savedAdditionalPacks = localStorage.getItem('jmd_additional_packs');
        
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCartItems(parsedCart);
            } catch (error) {
                console.error('Error parsing cart from localStorage:', error);
                localStorage.removeItem('jmd_cart_items');
            }
        }
        
        if (savedAdditionalPacks) {
            try {
                const parsedAdditionalPacks = JSON.parse(savedAdditionalPacks);
                setAdditionalPacks(parsedAdditionalPacks);
            } catch (error) {
                console.error('Error parsing additional packs from localStorage:', error);
                localStorage.removeItem('jmd_additional_packs');
            }
        }
        
        setCartLoaded(true);
    }, []);

    // Save cart to localStorage - only after cart is loaded
    useEffect(() => {
        if (cartLoaded) {
            localStorage.setItem('jmd_cart_items', JSON.stringify(cartItems));
            localStorage.setItem('jmd_additional_packs', JSON.stringify(additionalPacks));
        }
    }, [cartItems, additionalPacks, cartLoaded]);

    // Handle item selection
    const handleSelectItem = (itemId, isChecked) => {
        if (isChecked) {
            setSelectedItems(prev => [...prev, itemId]);
        } else {
            setSelectedItems(prev => prev.filter(id => id !== itemId));
        }
    };

    // Handle select all
    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            setSelectedItems(cartItems.map(item => item._id));
        } else {
            setSelectedItems([]);
        }
    };

    // Remove selected items from cart
    const removeSelectedItems = () => {
        if (selectedItems.length === 0) {
            // If no items selected, clear entire cart
            if (confirm('No items selected. Do you want to clear the entire cart?')) {
                setCartItems([]);
                setSelectedItems([]);
            }
        } else {
            if (confirm(`Remove ${selectedItems.length} selected item(s) from cart?`)) {
                setCartItems(prev => prev.filter(item => !selectedItems.includes(item._id)));
                setSelectedItems([]);
            }
        }
    };

    // Calculate total costs
    const calculateMainCost = () => {
        return cartItems.reduce((sum, item) => sum + (parseFloat(item.pricepermonth) || 0), 0);
    };

    // Fixed: Calculate additional cost from ads' printing and mounting
    const calculateAdditionalCost = () => {
        return cartItems.reduce((sum, item) => {
            const printing = parseFloat(item.printing) || 0;
            const mounting = parseFloat(item.mounting) || 0;
            return sum + printing + mounting;
        }, 0);
    };

    const calculateTotalCost = () => {
        return calculateMainCost() + calculateAdditionalCost();
    };

    // Contact form handlers
    const handleContactFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setContactForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleContactFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingForm(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...contactForm,
                    subject: 'Cart Request Callback',
                    selectedAds: cartItems,
                    additionalPacks: additionalPacks
                }),
            });

            if (response.ok) {
                alert('Request sent successfully! We will get back to you soon.');
                setShowContactForm(false);
                setContactForm({ name: '', email: '', phone: '', message: '', callback: true });
            } else {
                throw new Error('Failed to submit request');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Error submitting request. Please try again.');
        } finally {
            setIsSubmittingForm(false);
        }
    };

    // Download form handlers
    const handleDownloadFormChange = (e) => {
        const { name, value } = e.target;
        setDownloadForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDownloadFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingDownloadForm(true);

        try {
            const response = await fetch('/api/download-contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...downloadForm,
                    selectedAds: cartItems,
                    downloadType: downloadType
                }),
            });

            if (response.ok) {
                alert('Contact form submitted successfully! You can now proceed with the download.');
                setShowDownloadForm(false);
                setDownloadForm({ name: '', email: '', mobile: '', reason: '' });
                
                // Proceed with download
                if (downloadType === 'PPT') {
                    await generatePPT();
                } else if (downloadType === 'Excel') {
                    await generateExcel();
                }
            } else {
                throw new Error('Failed to submit contact form');
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            alert('Error submitting contact form. Please try again.');
        } finally {
            setIsSubmittingDownloadForm(false);
        }
    };

    const handleDownload = (type) => {
        if (cartItems.length === 0) {
            alert('Please add items to cart first!');
            return;
        }
        setDownloadType(type);
        setShowDownloadForm(true);
    };

    const generatePPT = async () => {
        setIsGeneratingPPT(true);
        
        try {
            const pptData = {
                title: `JMD Advertisement - Selected Hoardings (${cartItems.length} items)`,
                subtitle: `Generated on ${new Date().toLocaleDateString()}`,
                ads: cartItems.map(ad => ({
                    id: ad._id,
                    title: ad.title,
                    type: ad.type,
                    city: ad.city,
                    size: ad.size,
                    lighting: ad.lighting,
                    locality: ad.locality,
                    pricePerDay: ad.priceperday,
                    pricePerMonth: ad.pricepermonth,
                    mediaCode: ad.mediacode,
                    imageUrl: ad.imageUrl,
                    message: ad.message,
                    coordinates: ad.coordinates,
                    visibility: ad.visibility
                }))
            };

            const response = await fetch('/api/generate-ppt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pptData),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `JMD_Selected_Hoardings_${new Date().toISOString().split('T')[0]}.pptx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                alert('PPT file downloaded successfully!');
            } else {
                throw new Error('Failed to generate PPT file');
            }
        } catch (error) {
            console.error('Error generating PPT:', error);
            alert('Error generating PPT file. Please try again.');
        } finally {
            setIsGeneratingPPT(false);
        }
    };

    const generateExcel = async () => {
        setIsGeneratingExcel(true);
        
        try {
            const excelData = {
                title: `JMD Advertisement - Selected Hoardings (${cartItems.length} items)`,
                subtitle: `Generated on ${new Date().toLocaleDateString()}`,
                ads: cartItems.map(ad => ({
                    id: ad._id,
                    title: ad.title,
                    type: ad.type,
                    city: ad.city,
                    size: ad.size,
                    height: ad.height,
                    width: ad.width,
                    unit: ad.unit,
                    lighting: ad.lighting,
                    printing: ad.printing,
                    printingCost: ad.printingCost,
                    mounting: ad.mounting,
                    mountingCost: ad.mountingCost,
                    locality: ad.locality,
                    pricePerDay: ad.priceperday,
                    pricePerMonth: ad.pricepermonth,
                    mediaCode: ad.mediacode,
                    imageUrl: ad.imageUrl,
                    message: ad.message,
                    coordinates: ad.coordinates,
                    visibility: ad.visibility
                }))
            };

            const response = await fetch('/api/generate-excel/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(excelData),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `JMD_Selected_Hoardings_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                alert('Excel file downloaded successfully!');
            } else {
                throw new Error('Failed to generate Excel file');
            }
        } catch (error) {
            console.error('Error generating Excel:', error);
            alert('Error generating Excel file. Please try again.');
        } finally {
            setIsGeneratingExcel(false);
        }
    };

    // Show loading state while cart is being loaded
    if (!cartLoaded) {
        return (
            <div className="min-h-screen bg-red-500 py-25 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
                    <p className="mt-4 text-white">Loading cart...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-red-500 py-25">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-2xl font-bold text-gray-900">Campaign Summary</h1>
                                <div className="text-sm text-gray-600">
                                    Campaign Date: {new Date().toLocaleDateString('en-GB', { 
                                        day: '2-digit', 
                                        month: 'long', 
                                        year: 'numeric' 
                                    })}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox"
                                        checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <span className="text-sm text-gray-600">Select All</span>
                                </div>
                                <button
                                    onClick={removeSelectedItems}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>

                        {/* Cart Items Table */}
                        {cartItems.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mb-4">
                                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2-2v4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                                <p className="text-gray-600 mb-6">Add some hoardings to get started!</p>
                                <Link 
                                    href="/find-hoardings"
                                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg inline-block transition-colors"
                                >
                                    Browse Hoardings
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="bg-red-100 px-6 py-3">
                                    <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                                        <div className="col-span-1"></div>
                                        <div className="col-span-4">Media</div>
                                        <div className="col-span-2">Quantity</div>
                                        <div className="col-span-2">Media Type</div>
                                        <div className="col-span-2">Other <br /> <span className='text-xs text-gray-500'>(Mounting + Printing)</span></div>
                                        <div className="col-span-1">Cost <br /> <span className='text-xs text-gray-500'>(Per Month)</span></div>
                                    </div>
                                </div>

                                {/* Table Body */}
                                <div className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <div key={item._id} className="px-6 py-4">
                                            <div className="grid grid-cols-12 gap-4 items-center">
                                                {/* Checkbox */}
                                                <div className="col-span-1">
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedItems.includes(item._id)}
                                                        onChange={(e) => handleSelectItem(item._id, e.target.checked)}
                                                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                    />
                                                </div>
                                                
                                                {/* Media */}
                                                <div className="col-span-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        Hoarding - {item.locality || item.city}
                                                    </div>
                                                    <Link 
                                                        href={`/find-hoardings/${item.mediacode}`}
                                                        className="text-xs text-red-500 hover:text-red-700"
                                                    >
                                                        View
                                                    </Link>
                                                </div>
                                                
                                                {/* Quantity */}
                                                <div className="col-span-2">
                                                    <span className="text-sm text-gray-900">30 Day (s)</span>
                                                </div>
                                                
                                                {/* Media Type */}
                                                <div className="col-span-2">
                                                    <span className="text-sm text-gray-900">{item.type}</span>
                                                </div>
                                                
                                                {/* Other - Show ad's own printing and mounting costs */}
                                                <div className="col-span-2">
                                                    <div className="text-xs text-gray-600">
                                                        ₹ {((parseFloat(item.printing) || 0) + (parseFloat(item.mounting) || 0))}
                                                    </div>
                                                </div>
                                                
                                                {/* Cost */}
                                                <div className="col-span-1">
                                                    <div className="text-sm font-semibold text-gray-900">₹ {item.pricepermonth}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Media Button */}
                                <div className="px-6 py-3 border-t border-gray-200">
                                    <Link
                                        href="/find-hoardings"
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                    >
                                        Add Media
                                    </Link>
                                </div>

                                {/* Final Price Section */}
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Final Price</h3>
                                            <p className="text-xs text-gray-600">Excl. of Taxes</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-gray-900">
                                                ₹ {calculateMainCost()} + ₹ {calculateAdditionalCost()} = ₹ {calculateTotalCost()}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                Main Cost + Other Cost (monthly)
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="px-6 py-6 bg-white border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Left Column */}
                                        <div>
                                            <button
                                                onClick={() => setShowContactForm(true)}
                                                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                            >
                                                Request a Callback
                                            </button>
                                            <ul className="mt-3 text-xs text-gray-600 space-y-1">
                                                <li>• Book Campaigns</li>
                                                <li>• Check Best Rates</li>
                                                <li>• Co-ordinate with POC</li>
                                            </ul>
                                        </div>
                                        
                                        {/* Right Column */}
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => handleDownload('PPT')}
                                                disabled={cartItems.length === 0 || isGeneratingPPT}
                                                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                            >
                                                {isGeneratingPPT ? 'Generating...' : 'Download PPT'}
                                            </button>
                                            <button
                                                onClick={() => handleDownload('Excel')}
                                                disabled={cartItems.length === 0 || isGeneratingExcel}
                                                className="w-full bg-white hover:bg-gray-50 border border-red-500 text-red-500 px-6 py-3 rounded-lg font-semibold transition-colors"
                                            >
                                                {isGeneratingExcel ? 'Generating...' : 'Download Excel'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Contact Form Modal - Request Callback */}
            {showContactForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                Connect With Us!
                            </h3>
                            <button
                                onClick={() => setShowContactForm(false)}
                                className="text-black hover:text-black/60 text-xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column - Info */}
                                <div className="bg-red-500 text-white p-6 rounded-lg">
                                    <h4 className="text-lg font-bold mb-4">What can JMD Advertisement help you with?</h4>
                                    <div className="h-1 w-16 bg-white rounded mb-4"></div>
                                    <p className="text-sm leading-relaxed">
                                        Whether you're launching a new product, boosting brand awareness, or driving local footfall — JMD Advertisement helps you connect with your audience through impactful outdoor media.
                                    </p>
                                </div>
                                
                                {/* Right Column - Form */}
                                <div>
                                    <p className="text-xs text-gray-600 mb-4">*Please fill all the details</p>
                                    <form onSubmit={handleContactFormSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={contactForm.name}
                                                onChange={handleContactFormChange}
                                                className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 outline-none"
                                                placeholder="Full Name"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value={contactForm.email}
                                                    onChange={handleContactFormChange}
                                                    className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 outline-none"
                                                    placeholder="email"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    value={contactForm.phone}
                                                    onChange={handleContactFormChange}
                                                    className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 outline-none"
                                                    placeholder="01 2345 6789"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Message
                                            </label>
                                            <textarea
                                                name="message"
                                                rows={3}
                                                required
                                                value={contactForm.message}
                                                onChange={handleContactFormChange}
                                                className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 outline-none resize-none"
                                                placeholder="Your message"
                                            />
                                        </div>
                                        
                                        <div className="flex justify-between items-center pt-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="callback"
                                                    checked={contactForm.callback}
                                                    onChange={handleContactFormChange}
                                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <label className="text-sm text-gray-700">Request Callback</label>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSubmittingForm}
                                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:bg-gray-400"
                                            >
                                                {isSubmittingForm ? 'Sending...' : 'Send Message'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Download Form Modal */}
            {showDownloadForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Contact Information Required
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Please fill in your details to proceed with {downloadType === 'PPT' ? 'PPT' : 'Excel'} download
                            </p>
                        </div>
                        
                        <form onSubmit={handleDownloadFormSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={downloadForm.name}
                                        onChange={handleDownloadFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={downloadForm.email}
                                        onChange={handleDownloadFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mobile Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        required
                                        value={downloadForm.mobile}
                                        onChange={handleDownloadFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason for Interest
                                    </label>
                                    <textarea
                                        name="reason"
                                        rows={3}
                                        value={downloadForm.reason}
                                        onChange={handleDownloadFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Tell us about your advertising needs..."
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowDownloadForm(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingDownloadForm}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                                >
                                    {isSubmittingDownloadForm ? 'Submitting...' : 'Submit & Download'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CartPage;