"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [cartLoaded, setCartLoaded] = useState(false);
    const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
    const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const [downloadType, setDownloadType] = useState('');
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        mobile: '',
        reason: ''
    });
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('jmd_cart_items');
        console.log('Loading cart from localStorage:', savedCart);
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                console.log('Parsed cart:', parsedCart);
                setCartItems(parsedCart);
            } catch (error) {
                console.error('Error parsing cart from localStorage:', error);
                localStorage.removeItem('jmd_cart_items');
            }
        }
        setCartLoaded(true);
    }, []);

    // Save cart to localStorage - only after cart is loaded
    useEffect(() => {
        if (cartLoaded) {
            console.log('Saving cart to localStorage:', cartItems);
            localStorage.setItem('jmd_cart_items', JSON.stringify(cartItems));
        }
    }, [cartItems, cartLoaded]);

    // Remove item from cart
    const removeFromCart = (adId) => {
        setCartItems(prev => prev.filter(item => item._id !== adId));
    };

    // Clear entire cart
    const clearCart = () => {
        if (confirm('Are you sure you want to clear the entire cart?')) {
            setCartItems([]);
        }
    };

    // Format price function
    const formatPrice = (price) => {
        const numPrice = parseFloat(price) || 0;
        return `₹ ${numPrice}`;
    };

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => sum + (parseFloat(item.pricepermonth) || 0), 0);

    // Contact form handlers
    const handleContactFormChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContactFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingForm(true);

        try {
            const response = await fetch('/api/download-contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...contactForm,
                    selectedAds: cartItems,
                    downloadType: downloadType
                }),
            });

            if (response.ok) {
                alert('Contact form submitted successfully! You can now proceed with the download.');
                setShowContactForm(false);
                setContactForm({ name: '', email: '', mobile: '', reason: '' });
                
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
            setIsSubmittingForm(false);
        }
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

    const handleDownload = (type) => {
        if (cartItems.length === 0) {
            alert('Please add items to cart first!');
            return;
        }
        setDownloadType(type);
        setShowContactForm(true);
    };

    // Show loading state while cart is being loaded
    if (!cartLoaded) {
        return (
            <div className="min-h-screen bg-[#FF8989] py-25 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading cart...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Outer Container with Light Red Background - Same as find-hoardings */}
            <div className="min-h-screen bg-[#FF8989] py-25">
                <div className="max-w-8xl mx-auto px-4 lg:px-8">
                    {/* Main Layout */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="flex flex-col">
                            {/* Content Area */}
                            <div className="flex-1 flex flex-col min-h-screen">
                                <div className="flex-1 p-3 lg:p-6">
                                    {/* Top Bar with Actions */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Link 
                                                href="/find-hoardings"
                                                className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                                            >
                                                ← Back to Browse
                                            </Link>
                                            <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
                                            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Your Cart</h1>
                                            <span className="text-sm text-gray-600">({cartItems.length} items)</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <button
                                                onClick={() => handleDownload('Excel')}
                                                disabled={cartItems.length === 0 || isGeneratingExcel}
                                                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-md flex items-center gap-2 transition-colors text-sm"
                                            >
                                                {isGeneratingExcel ? '⏳' : '📊'} Download Excel
                                            </button>
                                            
                                            <button
                                                onClick={() => handleDownload('PPT')}
                                                disabled={cartItems.length === 0 || isGeneratingPPT}
                                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-md flex items-center gap-2 transition-colors text-sm"
                                            >
                                                {isGeneratingPPT ? '⏳' : '📄'} Download PPT
                                            </button>
                                            
                                            {cartItems.length > 0 && (
                                                <button
                                                    onClick={clearCart}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md transition-colors text-sm"
                                                >
                                                    Clear Cart
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Total Price Display */}
                                    {cartItems.length > 0 && (
                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                                            <div className="text-lg font-semibold text-gray-800">
                                                Total Price: <span className="text-red-600">{formatPrice(totalPrice)}</span> per month
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {cartItems.length} hoarding{cartItems.length > 1 ? 's' : ''} selected
                                            </div>
                                        </div>
                                    )}

                                    {/* Cart Items or Empty State */}
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 mb-8">
                                            {cartItems.map((ad) => (
                                                <div
                                                    key={ad._id}
                                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                                                >
                                                    {/* Image */}
                                                    <Link href={`/find-hoardings/${ad.mediacode}`}>
                                                        <div className="relative h-32 lg:h-48">
                                                            <Image 
                                                                src={ad.imageUrl || "/images/find/test.png"} 
                                                                alt={ad.title} 
                                                                fill
                                                                className="object-cover"
                                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                            />
                                                            <div className="absolute top-2 right-2">
                                                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                                                                    In Cart
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>

                                                    {/* Content */}
                                                    <div className="p-3 lg:p-4">
                                                        <Link href={`/find-hoardings/${ad.mediacode}`}>
                                                            <h3 className="font-semibold text-gray-800 mb-1 text-sm lg:text-base line-clamp-1 hover:text-red-600">
                                                                {ad.type} - {ad.locality || ad.city}
                                                            </h3>
                                                            <p className="text-xs lg:text-sm text-gray-600 mb-2">{ad.city}</p>
                                                        </Link>
                                                        
                                                        <div className="mb-3 flex justify-between items-center">
                                                            <div className="text-red-600 font-bold text-sm flex flex-col">
                                                                {formatPrice(ad.pricepermonth)} <span className="text-xs text-gray-500">Per Month</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => removeFromCart(ad._id)}
                                                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Summary - Always at Bottom */}
                                {cartItems.length > 0 && (
                                    <div className="border-t bg-gray-50 px-3 lg:px-6 py-3 lg:py-4">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                            <p className="text-xs lg:text-sm text-gray-600">
                                                {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in cart • Total: {formatPrice(totalPrice)}/month
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDownload('excel')}
                                                    disabled={isGeneratingExcel}
                                                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-xs transition-colors"
                                                >
                                                    {isGeneratingExcel ? 'Generating...' : 'Excel'}
                                                </button>
                                                <button
                                                    onClick={() => handleDownload('ppt')}
                                                    disabled={isGeneratingPPT}
                                                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-xs transition-colors"
                                                >
                                                    {isGeneratingPPT ? 'Generating...' : 'PPT'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form Modal */}
            {showContactForm && (
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
                        
                        <form onSubmit={handleContactFormSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={contactForm.name}
                                        onChange={handleContactFormChange}
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
                                        value={contactForm.email}
                                        onChange={handleContactFormChange}
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
                                        value={contactForm.mobile}
                                        onChange={handleContactFormChange}
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
                                        value={contactForm.reason}
                                        onChange={handleContactFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Tell us about your advertising needs..."
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowContactForm(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingForm}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                                >
                                    {isSubmittingForm ? 'Submitting...' : 'Submit & Download'}
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