"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const FindHoardingsClient = ({ searchParams }) => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAds, setSelectedAds] = useState([]);
    const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
    const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
    
    // Filter states
    const [selectedMediaTypes, setSelectedMediaTypes] = useState([]);
    const [selectedCities, setSelectedCities] = useState([]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [sortBy, setSortBy] = useState('popularity');
    const [showMoreCities, setShowMoreCities] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    
    // Mobile states
    const [showFilters, setShowFilters] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    
    // Contact form popup states
    const [showContactForm, setShowContactForm] = useState(false);
    const [downloadType, setDownloadType] = useState('');
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        mobile: '',
        reason: ''
    });
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    
    const router = useRouter();

    // Filter options
    const mediaTypes = ['Hoarding', 'Transit Media', 'Mall Media', 'Airport Branding', 'Digital Hoarding', 'Pole Kiosk', 'Unipole', 'Railway Station Branding', 'Bus Shelter Branding', 'Digital Marketing'];
    const majorCities = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata'];
    const priceRanges = [
        { label: 'Below ₹25,000', min: 0, max: 24999 },
        { label: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
        { label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000 },
        { label: 'Above ₹1,00,000', min: 100001, max: Infinity }
    ];

    // Get all available cities from ads
    const allAvailableCities = Array.from(new Set(ads.map(ad => ad.city).filter(Boolean))).sort();
    const otherCities = allAvailableCities.filter(city => !majorCities.includes(city));

    // Handle URL params on component mount ONLY
    useEffect(() => {
        if (!isInitialized && ads.length > 0) {
            if (searchParams?.city) {
                setSelectedCities([searchParams.city]);
            }
            if (searchParams?.type) {
                // Convert underscores back to spaces and match with available types
                const formattedType = searchParams.type
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                setSelectedMediaTypes([formattedType]);
            }
            setIsInitialized(true);
        }
    }, [searchParams, ads, isInitialized]);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const res = await fetch('/api/ads');
                const data = await res.json();
                setAds(data);
            } catch (err) {
                setAds([]);
            }
            setLoading(false);
        };
        fetchAds();
    }, []);

    // Filter ads based on selected filters
    const filteredAds = ads
        .filter(ad => ad.show === true)
        .filter(ad => {
            // Media type filter
            if (selectedMediaTypes.length > 0) {
                const hasMediaType = selectedMediaTypes.some(type => 
                    ad.type && ad.type.toLowerCase().includes(type.toLowerCase())
                );
                if (!hasMediaType) return false;
            }
            
            // City filter
            if (selectedCities.length > 0) {
                const hasCity = selectedCities.some(city => 
                    ad.city && ad.city.toLowerCase() === city.toLowerCase()
                );
                if (!hasCity) return false;
            }
            
            // Price filter - Changed to use pricepermonth instead of priceperday
            if (selectedPriceRanges.length > 0) {
                const price = parseFloat(ad.pricepermonth) || 0; // Changed from priceperday to pricepermonth
                const inPriceRange = selectedPriceRanges.some(range => 
                    price >= range.min && price <= range.max
                );
                if (!inPriceRange) return false;
            }
            
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'popularity') {
                return b.views - a.views || 0;
            }
            if (sortBy === 'price_low') {
                return (parseFloat(a.pricepermonth) || 0) - (parseFloat(b.pricepermonth) || 0); // Changed to pricepermonth
            }
            if (sortBy === 'price_high') {
                return (parseFloat(b.pricepermonth) || 0) - (parseFloat(a.pricepermonth) || 0); // Changed to pricepermonth
            }
            return 0;
        });

    // Pagination calculations
    const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAds = filteredAds.slice(startIndex, startIndex + itemsPerPage);

    // Update URL when filters change (debounced)
    // const updateURL = () => {
    //     if (!isInitialized) return; // Don't update URL during initialization
        
    //     const params = new URLSearchParams();
    //     if (selectedCities.length > 0) {
    //         params.set('city', selectedCities[0]); // Use first selected city
    //     }
    //     if (selectedMediaTypes.length > 0) {
    //         const type = selectedMediaTypes[0].toLowerCase().replace(/ /g, '_');
    //         params.set('type', type);
    //     }
        
    //     const newURL = `/find-hoardings${params.toString() ? `?${params.toString()}` : ''}`;
    //     router.replace(newURL, { scroll: false }); // Use replace instead of push
    // };

    // Handle filter changes
    const handleMediaTypeChange = (type) => {
        setSelectedMediaTypes(prev => 
            prev.includes(type) 
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
        setCurrentPage(1);
        // setTimeout(updateURL, 300); // Debounce URL update
    };

    const handleCityChange = (city) => {
        setSelectedCities(prev => 
            prev.includes(city) 
                ? prev.filter(c => c !== city)
                : [...prev, city]
        );
        setCurrentPage(1);
        // setTimeout(updateURL, 300); // Debounce URL update
    };

    const handlePriceRangeChange = (range) => {
        setSelectedPriceRanges(prev => 
            prev.some(r => r.label === range.label)
                ? prev.filter(r => r.label !== range.label)
                : [...prev, range]
        );
        setCurrentPage(1);
    };

    // Handle ad selection
    const handleAdSelection = (ad) => {
        setSelectedAds(prev => {
            const isSelected = prev.some(selectedAd => selectedAd._id === ad._id);
            if (isSelected) {
                return prev.filter(selectedAd => selectedAd._id !== ad._id);
            } else {
                return [...prev, ad];
            }
        });
    };

    // Contact form handlers
    const handleContactFormChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const showContactFormPopup = (type) => {
        if (selectedAds.length === 0) {
            alert('Please select at least one ad to download.');
            return;
        }
        setDownloadType(type);
        setShowContactForm(true);
    };

    const handleContactFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!contactForm.name || !contactForm.email || !contactForm.mobile || !contactForm.reason) {
            alert('Please fill all fields');
            return;
        }
        
        setIsSubmittingForm(true);
        
        try {
            const contactResponse = await fetch('/api/download-contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...contactForm,
                    downloadType,
                    selectedAds: selectedAds
                }),
            });

            if (contactResponse.ok) {
                setShowContactForm(false);
                setContactForm({
                    name: '',
                    email: '',
                    mobile: '',
                    reason: ''
                });
                
                if (downloadType === 'PPT') {
                    await generatePPT();
                } else if (downloadType === 'Excel') {
                    await generateExcel();
                }
            } else {
                throw new Error('Failed to save contact details');
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            alert('Error submitting form. Please try again.');
        } finally {
            setIsSubmittingForm(false);
        }
    };

    const generatePPT = async () => {
        setIsGeneratingPPT(true);
        
        try {
            const pptData = {
                title: `JMD Advertisement - Selected Hoardings (${selectedAds.length} items)`,
                subtitle: `Generated on ${new Date().toLocaleDateString()}`,
                ads: selectedAds.map(ad => ({
                    id: ad._id,
                    title: ad.title,
                    type: ad.type,
                    city: ad.city,
                    size: ad.size,
                    lighting: ad.lighting,
                    pricePerDay: ad.priceperday,
                    pricePerMonth: ad.pricepermonth,
                    mediaCode: ad.mediacode,
                    imageUrl: ad.imageUrl,
                    message: ad.message,
                    coordinates: ad.coordinates
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
                title: `JMD Advertisement - Selected Hoardings (${selectedAds.length} items)`,
                subtitle: `Generated on ${new Date().toLocaleDateString()}`,
                ads: selectedAds.map(ad => ({
                    id: ad._id,
                    title: ad.title,
                    type: ad.type,
                    city: ad.city,
                    size: ad.size,
                    height: ad.height, // Add height
                    width: ad.width,   // Add width
                    unit: ad.unit,     // Add unit
                    lighting: ad.lighting,
                    printing: ad.printing, // Add printing type
                    printingCost: ad.printingCost, // Add printing cost
                    mounting: ad.mounting, // Add mounting type
                    mountingCost: ad.mountingCost, // Add mounting cost
                    locality: ad.locality, // Add locality
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

    return (
        <>
            {/* Contact Form Popup */}
            {showContactForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">
                                    To Download This {downloadType}, First Fill This Form
                                </h3>
                                <button
                                    onClick={() => setShowContactForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                    disabled={isSubmittingForm}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <form onSubmit={handleContactFormSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={contactForm.name}
                                        onChange={handleContactFormChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={contactForm.email}
                                        onChange={handleContactFormChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                                        Mobile Number *
                                    </label>
                                    <input
                                        type="tel"
                                        id="mobile"
                                        name="mobile"
                                        value={contactForm.mobile}
                                        onChange={handleContactFormChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Enter your mobile number"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason to Download These Ads *
                                    </label>
                                    <textarea
                                        id="reason"
                                        name="reason"
                                        rows={3}
                                        value={contactForm.reason}
                                        onChange={handleContactFormChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Please explain why you want to download these ads..."
                                    />
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-sm text-gray-600">
                                        <strong>Selected Ads:</strong> {selectedAds.length} hoarding{selectedAds.length !== 1 ? 's' : ''}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <strong>Download Format:</strong> {downloadType}
                                    </p>
                                </div>
                                
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowContactForm(false)}
                                        disabled={isSubmittingForm}
                                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 rounded-md font-medium transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingForm}
                                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingForm ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit & Download'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Filter Overlay */}
            {showFilters && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden">
                    <div className="fixed inset-y-0 left-0 top-30 w-80 h-[80vh] bg-white shadow-xl z-50 overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-800">FILTERS</h2>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Filter Content - Same as sidebar */}
                            <div className="space-y-8">
                                {/* Media Type Filter */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">MEDIA TYPE</h3>
                                    <div className="space-y-2">
                                        {mediaTypes.map((type) => (
                                            <label key={type} className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMediaTypes.includes(type)}
                                                    onChange={() => handleMediaTypeChange(type)}
                                                    className="w-4 h-4 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* City Filter */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">CITY</h3>
                                    <div className="space-y-2">
                                        {/* Major Cities */}
                                        {majorCities.map((city) => (
                                            <label key={city} className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCities.includes(city)}
                                                    onChange={() => handleCityChange(city)}
                                                    className="w-4 h-4 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">{city}</span>
                                            </label>
                                        ))}
                                        
                                        {/* More Cities Toggle */}
                                        {otherCities.length > 0 && (
                                            <div>
                                                <button
                                                    onClick={() => setShowMoreCities(!showMoreCities)}
                                                    className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
                                                >
                                                    <span className="mr-1">More</span>
                                                    <svg 
                                                        className={`w-4 h-4 transition-transform ${showMoreCities ? 'rotate-180' : ''}`} 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                
                                                {/* Additional Cities */}
                                                {showMoreCities && (
                                                    <div className="mt-2 ml-4 space-y-2 max-h-40 overflow-y-auto">
                                                        {otherCities.map((city) => (
                                                            <label key={city} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedCities.includes(city)}
                                                                    onChange={() => handleCityChange(city)}
                                                                    className="w-4 h-4 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-600">{city}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">PRICE</h3>
                                    <div className="space-y-2">
                                        {priceRanges.map((range) => (
                                            <label key={range.label} className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPriceRanges.some(r => r.label === range.label)}
                                                    onChange={() => handlePriceRangeChange(range)}
                                                    className="w-4 h-4 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">{range.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Outer Container with Light Red Background */}
            <div className="min-h-screen bg-[#FF8989] py-25">
                <div className="max-w-8xl mx-auto px-4 lg:px-8">
                    {/* Main Layout */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="flex flex-col lg:flex-row">
                            {/* Left Sidebar - Desktop */}
                            <div className="hidden lg:block w-1/4 bg-white border-r border-gray-200 p-6 min-h-screen">
                                <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">FILTERS</h2>
                                
                                {/* Media Type Filter */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">MEDIA TYPE</h3>
                                    <div className="space-y-2">
                                        {mediaTypes.map((type) => (
                                            <label key={type} className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMediaTypes.includes(type)}
                                                    onChange={() => handleMediaTypeChange(type)}
                                                    className="w-4 h-4 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* City Filter */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">CITY</h3>
                                    <div className="space-y-2">
                                        {/* Major Cities */}
                                        {majorCities.map((city) => (
                                            <label key={city} className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCities.includes(city)}
                                                    onChange={() => handleCityChange(city)}
                                                    className="w-4 h-4 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">{city}</span>
                                            </label>
                                        ))}
                                        
                                        {/* More Cities Toggle */}
                                        {otherCities.length > 0 && (
                                            <div>
                                                <button
                                                    onClick={() => setShowMoreCities(!showMoreCities)}
                                                    className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
                                                >
                                                    <span className="mr-1">More</span>
                                                    <svg 
                                                        className={`w-4 h-4 transition-transform ${showMoreCities ? 'rotate-180' : ''}`} 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                
                                                {/* Additional Cities */}
                                                {showMoreCities && (
                                                    <div className="mt-2 ml-4 space-y-2 max-h-40 overflow-y-auto">
                                                        {otherCities.map((city) => (
                                                            <label key={city} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedCities.includes(city)}
                                                                    onChange={() => handleCityChange(city)}
                                                                    className="w-4 h-4 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-600">{city}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">PRICE</h3>
                                    <div className="space-y-2">
                                        {priceRanges.map((range) => (
                                            <label key={range.label} className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPriceRanges.some(r => r.label === range.label)}
                                                    onChange={() => handlePriceRangeChange(range)}
                                                    className="w-4 h-4 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">{range.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Content Area */}
                            <div className="flex-1 flex flex-col min-h-screen">
                                <div className="flex-1 p-3 lg:p-6">
                                    {/* Top Bar with Sort and Download Buttons */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                                            <div className="flex items-center gap-2">
                                                {/* Mobile Filter Button */}
                                                <button
                                                    onClick={() => setShowFilters(true)}
                                                    className="lg:hidden px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                                    </svg>
                                                    <span className="text-sm">Filters</span>
                                                </button>
                                                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Hoardings</h1>
                                            </div>
                                            {selectedAds.length > 0 && (
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs lg:text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded">
                                                        {selectedAds.length} selected
                                                    </span>
                                                    
                                                    {/* Cancel All Button - Show when 2+ selections */}
                                                    {selectedAds.length >= 2 && (
                                                        <button
                                                            onClick={() => setSelectedAds([])}
                                                            className="px-2 lg:px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs lg:text-sm font-medium transition-colors flex items-center gap-1"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Cancel All
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => showContactFormPopup('PPT')}
                                                        disabled={isGeneratingPPT}
                                                        className="px-2 lg:px-3 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded text-xs lg:text-sm font-medium transition-colors"
                                                    >
                                                        {isGeneratingPPT ? 'Generating...' : 'PPT'}
                                                    </button>
                                                    <button
                                                        onClick={() => showContactFormPopup('Excel')}
                                                        disabled={isGeneratingExcel}
                                                        className="px-2 lg:px-3 py-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded text-xs lg:text-sm font-medium transition-colors"
                                                    >
                                                        {isGeneratingExcel ? 'Generating...' : 'Excel'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <span className="text-xs lg:text-sm text-gray-600">Sort By</span>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="px-2 lg:px-3 py-1 lg:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-xs lg:text-sm flex-1 sm:flex-none"
                                            >
                                                <option value="popularity">Popularity</option>
                                                <option value="price_low">Price: Low to High</option>
                                                <option value="price_high">Price: High to Low</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Loading State */}
                                    {loading && (
                                        <div className="flex justify-center items-center h-64">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                                        </div>
                                    )}

                                    {/* Results Grid */}
                                    {!loading && (
                                        <>
                                            {filteredAds.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="mb-4">
                                                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.515-.626-6.399-1.72C4.258 12.745 3 11.44 3 10c0-3.314 2.686-6 6-6h6c3.314 0 6 2.686 6 6 0 1.441-1.258 2.745-2.601 3.28C16.515 14.374 14.34 15 12 15z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No hoardings found</h3>
                                                    <p className="text-gray-600">Try adjusting your filters to see more results.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 mb-8">
                                                    {paginatedAds.map((ad) => {
                                                        const isSelected = selectedAds.some(selectedAd => selectedAd._id === ad._id);
                                                        return (
                                                            <div 
                                                                key={ad._id} 
                                                                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                                                                onClick={() => handleAdSelection(ad)}
                                                            >
                                                                {/* Selection Checkbox */}
                                                                <div className="absolute top-2 left-2 z-10">
                                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                                                                        {isSelected && (
                                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Image */}
                                                                <div className="relative h-32 lg:h-48">
                                                                    <Image 
                                                                        src={ad.imageUrl || "/images/find/test.png"} 
                                                                        alt={ad.title} 
                                                                        fill
                                                                        className="object-cover"
                                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                                    />
                                                                </div>

                                                                {/* Content */}
                                                                <div className="p-3 lg:p-4">
                                                                    <h3 className="font-semibold text-gray-800 mb-1 text-sm lg:text-base line-clamp-1">{ad.title}</h3>
                                                                    <p className="text-xs lg:text-sm text-gray-600 mb-2">{ad.city}</p>
                                                                    <Link 
                                                                        href={`/find-hoardings/${ad.mediacode || ad._id}`}
                                                                        className="text-xs lg:text-sm text-blue-600 hover:underline inline-block"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        View Details
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Pagination - Always at Bottom */}
                                {!loading && (
                                    <div className="border-t bg-gray-50 px-3 lg:px-6 py-3 lg:py-4">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                            <p className="text-xs lg:text-sm text-gray-600 order-2 sm:order-1">
                                                Page {currentPage} of {Math.max(totalPages, 1)} 
                                                {filteredAds.length > 0 && ` (${filteredAds.length} total results)`}
                                            </p>
                                            <div className="flex items-center gap-1 lg:gap-2 order-1 sm:order-2">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-2 lg:px-3 py-1 border border-gray-300 rounded text-xs lg:text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Prev
                                                </button>
                                                {totalPages > 0 && [...Array(Math.min(totalPages, 3))].map((_, index) => {
                                                    const pageNumber = currentPage <= 2 ? index + 1 : currentPage - 1 + index;
                                                    if (pageNumber > totalPages || pageNumber < 1) return null;
                                                    return (
                                                        <button
                                                            key={pageNumber}
                                                            onClick={() => setCurrentPage(pageNumber)}
                                                            className={`px-2 lg:px-3 py-1 border rounded text-xs lg:text-sm ${
                                                                currentPage === pageNumber 
                                                                    ? 'bg-red-500 text-white border-red-500' 
                                                                    : 'border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
                                                    disabled={currentPage === totalPages || totalPages === 0}
                                                    className="px-2 lg:px-3 py-1 border border-gray-300 rounded text-xs lg:text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Next
                                                </button>
                                                {totalPages > 1 && (
                                                    <button
                                                        onClick={() => setCurrentPage(totalPages)}
                                                        disabled={currentPage === totalPages}
                                                        className="px-2 lg:px-3 py-1 bg-red-500 text-white rounded text-xs lg:text-sm hover:bg-red-600 disabled:opacity-50"
                                                    >
                                                        All
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FindHoardingsClient;