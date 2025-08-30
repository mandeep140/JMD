"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const FindHoardingsClient = ({ searchParams }) => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    
    // Filter states
    const [selectedMediaTypes, setSelectedMediaTypes] = useState([]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [selectedArea, setSelectedArea] = useState([]);
    const [selectedLightingTypes, setSelectedLightingTypes] = useState([]);
    const [sortBy, setSortBy] = useState('popularity');
    const [showMoreMediaTypes, setShowMoreMediaTypes] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [cartLoaded, setCartLoaded] = useState(false);
    
    // Search states
    const [citySearch, setCitySearch] = useState('');
    const [showCityResults, setShowCityResults] = useState(false);
    
    // Mobile states
    const [showFilters, setShowFilters] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    
    const router = useRouter();

    // Filter options
    const mediaTypes = ['Hoarding', 'Unipole', 'Railway Station Branding', 'Pole Kiosk', 'Bus Shelter Branding', 'Transit Media', 'Mall Media', 'Airport Branding', 'Digital Hoarding', 'Digital Marketing', 'Gantry'];
    const topMediaTypes = mediaTypes.slice(0, 5);
    const moreMediaTypes = mediaTypes.slice(5);
    
    const lightingTypes = ['No Light', 'Full Light', 'Back Light', 'Font Light'];
    
    const priceRanges = [
        { label: 'Below 10000', min: 0, max: 9999 },
        { label: '10000 - 20000', min: 10000, max: 20000 },
        { label: '20000 - 30000', min: 20000, max: 30000 },
        { label: 'Above 30000', min: 30001, max: Infinity }
    ];

    const areaRange = [
        {label: 'Below 100 sqft', min: 0, max: 99 },
        {label: '100 - 200 sqft', min: 100, max: 200 },
        {label: '200 - 300 sqft', min: 200, max: 300 },
        {label: '300 - 400 sqft', min: 300, max: 400 },
        {label: '400 - 500 sqft', min: 400, max: 500 },
        {label: 'Above 500 sqft', min: 501, max: Infinity }
    ]

    // Get all unique search results (cities and localities)
    const getAllSearchResults = () => {
        const cities = ads.map(ad => ({
            type: 'city',
            value: ad.city,
            display: ad.city,
            count: ads.filter(a => a.city === ad.city).length
        })).filter(item => item.value);

        const localities = ads.map(ad => ({
            type: 'locality',
            value: ad.locality,
            display: `${ad.locality}, ${ad.city}`,
            city: ad.city,
            count: ads.filter(a => a.locality === ad.locality && a.city === ad.city).length
        })).filter(item => item.value);

        // Remove duplicates and combine
        const uniqueCities = cities.filter((item, index, self) => 
            index === self.findIndex(t => t.value === item.value)
        );
        
        const uniqueLocalities = localities.filter((item, index, self) => 
            index === self.findIndex(t => t.value === item.value && t.city === item.city)
        );

        return [...uniqueCities, ...uniqueLocalities].sort((a, b) => {
            // First sort by relevance to search term
            const aRelevance = a.display.toLowerCase().indexOf(citySearch.toLowerCase());
            const bRelevance = b.display.toLowerCase().indexOf(citySearch.toLowerCase());
            
            if (aRelevance !== bRelevance) {
                return aRelevance - bRelevance;
            }
            
            // Then sort by type (cities first)
            if (a.type !== b.type) {
                return a.type === 'city' ? -1 : 1;
            }
            
            // Finally sort alphabetically
            return a.display.localeCompare(b.display);
        });
    };

    // Filter search results based on search input
    const filteredSearchResults = getAllSearchResults().filter(item => 
        item.display.toLowerCase().includes(citySearch.toLowerCase())
    );

    // Load cart from localStorage on component mount
    useEffect(() => {
        const savedCart = localStorage.getItem('jmd_cart_items');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCartItems(parsedCart);
            } catch (error) {
                console.error('Error parsing cart from localStorage:', error);
                localStorage.removeItem('jmd_cart_items');
            }
        }
        setCartLoaded(true);
    }, []);

    // Save cart to localStorage whenever cartItems changes - but only after cart is loaded
    useEffect(() => {
        if (cartLoaded) {
            localStorage.setItem('jmd_cart_items', JSON.stringify(cartItems));
        }
    }, [cartItems, cartLoaded]);

    // Handle URL params on component mount ONLY
    useEffect(() => {
        if (!isInitialized && ads.length > 0) {
            if (searchParams?.city) {
                setCitySearch(searchParams.city);
            }
            if (searchParams?.type) {
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

    // Filter ads based on search and filters
    const filteredAds = ads
        .filter(ad => ad.show === true)
        .filter(ad => {
            // City search filter - Enhanced for combined searches
            if (citySearch.trim()) {
                const searchTerm = citySearch.toLowerCase().trim();
                
                // Check if search term contains comma (e.g., "Sakchi, Jamshedpur")
                if (searchTerm.includes(',')) {
                    const [localityPart, cityPart] = searchTerm.split(',').map(part => part.trim());
                    
                    // Match both locality and city parts
                    const localityMatches = ad.locality && ad.locality.toLowerCase().includes(localityPart);
                    const cityMatches = ad.city && ad.city.toLowerCase().includes(cityPart);
                    
                    // Both parts should match for combined search
                    if (!(localityMatches && cityMatches)) return false;
                } else {
                    // Single term search - check both city and locality
                    const cityMatch = ad.city && ad.city.toLowerCase().includes(searchTerm);
                    const localityMatch = ad.locality && ad.locality.toLowerCase().includes(searchTerm);
                    if (!cityMatch && !localityMatch) return false;
                }
            }
            
            // Media type filter (checkboxes)
            if (selectedMediaTypes.length > 0) {
                const hasMediaType = selectedMediaTypes.some(type => 
                    ad.type && ad.type.toLowerCase().includes(type.toLowerCase())
                );
                if (!hasMediaType) return false;
            }

            // Lighting filter
            if (selectedLightingTypes.length > 0) {
                const hasLighting = selectedLightingTypes.some(lighting => 
                    ad.lighting && ad.lighting.toLowerCase() === lighting.toLowerCase()
                );
                if (!hasLighting) return false;
            }

            // Price filter
            if (selectedPriceRanges.length > 0) {
                const price = parseFloat(ad.pricepermonth) || 0;
                const inPriceRange = selectedPriceRanges.some(range => 
                    price >= range.min && price <= range.max
                );
                if (!inPriceRange) return false;
            }

            // Area filter
            if (selectedArea.length > 0) {
                const area = (ad.height * ad.width);
                const inArea = selectedArea.some(range =>
                    area >= range.min && area <= range.max
                );
                if (!inArea) return false;
            }

            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'popularity') {
                return b.views - a.views || 0;
            }
            if (sortBy === 'price_low') {
                return (parseFloat(a.pricepermonth) || 0) - (parseFloat(b.pricepermonth) || 0);
            }
            if (sortBy === 'price_high') {
                return (parseFloat(b.pricepermonth) || 0) - (parseFloat(a.pricepermonth) || 0);
            }
            return 0;
        });

    // Pagination calculations
    const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAds = filteredAds.slice(startIndex, startIndex + itemsPerPage);

    // Handle filter changes
    const handleMediaTypeChange = (type) => {
        setSelectedMediaTypes(prev => 
            prev.includes(type) 
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
        setCurrentPage(1);
    };

    const handleLightingChange = (lighting) => {
        setSelectedLightingTypes(prev => 
            prev.includes(lighting) 
                ? prev.filter(l => l !== lighting)
                : [...prev, lighting]
        );
        setCurrentPage(1);
    };

    const handlePriceRangeChange = (range) => {
        setSelectedPriceRanges(prev => 
            prev.some(r => r.label === range.label)
                ? prev.filter(r => r.label !== range.label)
                : [...prev, range]
        );
        setCurrentPage(1);
    };

    const handleAreaRangeChange = (range) => {
        setSelectedArea(prev => 
            prev.some(r => r.label === range.label)
                ? prev.filter(r => r.label !== range.label)
                : [...prev, range]
        );
        setCurrentPage(1);
    };

    // Handle search result selection from dropdown
    const handleSearchSelect = (searchResult) => {
        setCitySearch(searchResult.display);
        setShowCityResults(false);
        setCurrentPage(1);
    };

    // Cart functions
    const addToCart = (ad, e) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation(); // Stop event bubbling
        
        setCartItems(prev => {
            const isAlreadyInCart = prev.some(item => item._id === ad._id);
            if (isAlreadyInCart) {
                return prev;
            }
            const newCart = [...prev, ad];
            console.log('Adding to cart:', ad.title, 'New cart size:', newCart.length);
            return newCart;
        });
    };

    const isInCart = (adId) => {
        return cartItems.some(item => item._id === adId);
    };

    // Clear filters function
    const clearFilters = () => {
        setSelectedMediaTypes([]);
        setSelectedLightingTypes([]);
        setSelectedPriceRanges([]);
        setSelectedArea([]);
        setCitySearch('');
        setCurrentPage(1);
    };

    // Format price function
    const formatPrice = (price) => {
        const numPrice = parseFloat(price) || 0;
        return `₹ ${numPrice}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FF8989] py-25 items-center justify-center flex">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
                    <p className="mt-4 text-white">Loading hoardings...</p>
                </div>
            </div>
        );
    }

    return (
        <>
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
                                {/* City Search Filter */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">LOCATION</h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search city or locality..."
                                            value={citySearch}
                                            onChange={(e) => {
                                                setCitySearch(e.target.value);
                                                setShowCityResults(true);
                                                setCurrentPage(1);
                                            }}
                                            onFocus={() => setShowCityResults(true)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                        {/* Search Results Dropdown */}
                                        {showCityResults && citySearch.trim() && filteredSearchResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                                                {filteredSearchResults.slice(0, 10).map((result, index) => (
                                                    <div
                                                        key={`${result.type}-${result.value}-${result.city || ''}-${index}`}
                                                        onClick={() => handleSearchSelect(result)}
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="text-gray-800">{result.display}</span>
                                                                {result.type === 'city' && (
                                                                    <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-1 rounded">City</span>
                                                                )}
                                                                {result.type === 'locality' && (
                                                                    <span className="ml-2 text-xs text-green-600 bg-green-100 px-1 rounded">Area</span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-500">{result.count} ads</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Search Results Count */}
                                    {citySearch.trim() && (
                                        <div className="mt-2 text-xs text-gray-600">
                                            {filteredAds.length} results found for "{citySearch}"
                                        </div>
                                    )}
                                </div>

                                {/* Media Type Filter */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">MEDIA TYPE</h3>
                                    <div className="space-y-2">
                                        {topMediaTypes.map((type) => (
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
                                        {showMoreMediaTypes && moreMediaTypes.map((type) => (
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
                                        {moreMediaTypes.length > 0 && (
                                            <button
                                                onClick={() => setShowMoreMediaTypes(!showMoreMediaTypes)}
                                                className="text-red-500 text-sm hover:underline"
                                            >
                                                {showMoreMediaTypes ? '& Less' : '& More'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* LIT/Non-LIT Filter */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">LIT/ Non-LIT</h3>
                                    <div className="space-y-2">
                                        {lightingTypes.map((lighting) => (
                                            <label key={lighting} className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLightingTypes.includes(lighting)}
                                                    onChange={() => handleLightingChange(lighting)}
                                                    className="w-4 h-4 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">{lighting}</span>
                                            </label>
                                        ))}
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

                                {/* Area Filter */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">AREA</h3>
                                    <div className="space-y-2">
                                        {areaRange.map((range) => (
                                            <label key={range.label} className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedArea.some(r => r.label === range.label)}
                                                    onChange={() => handleAreaRangeChange(range)}
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
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-gray-800">FILTERS</h2>
                                    <button
                                        onClick={clearFilters}
                                        className="text-red-500 text-sm hover:underline"
                                    >
                                        Clear
                                    </button>
                                </div>
                                
                                {/* City Search Filter */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">LOCATION</h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search city or locality..."
                                            value={citySearch}
                                            onChange={(e) => {
                                                setCitySearch(e.target.value);
                                                setShowCityResults(true);
                                                setCurrentPage(1);
                                            }}
                                            onFocus={() => setShowCityResults(true)}
                                            onBlur={() => setTimeout(() => setShowCityResults(false), 200)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                        {/* Search Results Dropdown */}
                                        {showCityResults && citySearch.trim() && filteredSearchResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                                                {filteredSearchResults.slice(0, 10).map((result, index) => (
                                                    <div
                                                        key={`${result.type}-${result.value}-${result.city || ''}-${index}`}
                                                        onClick={() => handleSearchSelect(result)}
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="text-gray-800">{result.display}</span>
                                                                {result.type === 'city' && (
                                                                    <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-1 rounded">City</span>
                                                                )}
                                                                {result.type === 'locality' && (
                                                                    <span className="ml-2 text-xs text-green-600 bg-green-100 px-1 rounded">Area</span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-500">{result.count} ads</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Search Results Count */}
                                    {citySearch.trim() && (
                                        <div className="mt-2 text-xs text-gray-600">
                                            {filteredAds.length} results found for "{citySearch}"
                                        </div>
                                    )}
                                </div>

                                {/* Media Type Filter */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">MEDIA TYPE</h3>
                                    <div className="space-y-2">
                                        {topMediaTypes.map((type) => (
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
                                        {showMoreMediaTypes && moreMediaTypes.map((type) => (
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
                                        {moreMediaTypes.length > 0 && (
                                            <button
                                                onClick={() => setShowMoreMediaTypes(!showMoreMediaTypes)}
                                                className="text-red-500 text-sm hover:underline"
                                            >
                                                {showMoreMediaTypes ? '& Less' : '& More'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* LIT/Non-LIT Filter */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">LIT/ Non-LIT</h3>
                                    <div className="space-y-2">
                                        {lightingTypes.map((lighting) => (
                                            <label key={lighting} className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLightingTypes.includes(lighting)}
                                                    onChange={() => handleLightingChange(lighting)}
                                                    className="w-4 h-4 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">{lighting}</span>
                                            </label>
                                        ))}
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

                                {/* Area Filter */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">AREA</h3>
                                    <div className="space-y-2">
                                        {areaRange.map((range) => (
                                            <label key={range.label} className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedArea.some(r => r.label === range.label)}
                                                    onChange={() => handleAreaRangeChange(range)}
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
                                    {/* Top Bar with Sort and Cart */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
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
                                            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Our Media</h1>
                                        </div>
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs lg:text-sm text-gray-600">Sort By</span>
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                    className="px-2 lg:px-3 py-1 lg:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-xs lg:text-sm"
                                                >
                                                    <option value="popularity">Popularity</option>
                                                    <option value="price_low">Price: Low to High</option>
                                                    <option value="price_high">Price: High to Low</option>
                                                </select>
                                            </div>
                                            
                                            {/* Cart Link */}
                                            <Link 
                                                href="/cart"
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md flex items-center gap-2 transition-colors text-sm"
                                            >
                                                🛒 Cart ({cartItems.length})
                                            </Link>
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
                                                    {paginatedAds.map((ad) => (
                                                        <div
                                                            key={ad._id}
                                                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
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
                                                                </div>
                                                            </Link>

                                                            {/* Content */}
                                                            <div className="p-3 lg:p-4">
                                                                <Link href={`/find-hoardings/${ad.mediacode}`}>
                                                                    <h3 className="font-semibold text-gray-800 mb-1 text-sm lg:text-base line-clamp-1 hover:text-red-600">
                                                                        {ad.message}
                                                                    </h3>
                                                                    <p className="text-xs lg:text-sm text-gray-600 mb-2">{ad.city}</p>
                                                                </Link>
                                                                
                                                                <div className="mb-3 flex justify-between items-center">
                                                                    <div className="text-red-600 font-bold text-sm flex flex-col">
                                                                        {formatPrice(ad.pricepermonth)} <span className="text-xs text-gray-500">Per Month</span>
                                                                    </div>
                                                                    <button 
                                                                        onClick={(e) => addToCart(ad, e)}
                                                                        disabled={isInCart(ad._id)}
                                                                        className={`px-4 py-2 rounded text-xs transition-colors ${
                                                                            isInCart(ad._id)
                                                                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                                                                : 'bg-red-500 hover:bg-red-600 text-white'
                                                                        }`}
                                                                    >
                                                                        {isInCart(ad._id) ? 'In Cart' : 'Add to Cart'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
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
                                                        Last
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