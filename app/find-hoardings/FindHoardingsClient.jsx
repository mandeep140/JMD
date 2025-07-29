"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const categories = [
    { icon: "/svg/find/billboard.svg", alt: "Billboard advertising" },
    { icon: "/svg/find/digital.svg", alt: "Digital advertising" },
    { icon: "/svg/find/airport.svg", alt: "Airport advertising" },
    { icon: "/svg/find/mall.svg", alt: "Mall advertising" },
    { icon: "/svg/find/transit.svg", alt: "Transit advertising" },
];

const FindHoardingsClient = ({ searchParams }) => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState(searchParams?.city || '');
    const [selectedType, setSelectedType] = useState('');
    const [selectedAds, setSelectedAds] = useState([]);
    const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
    const router = useRouter();

    // Set selectedType from URL query param
    useEffect(() => {
        if (searchParams?.type) {
            // Replace underscores with spaces, capitalize each word
            const formattedType = searchParams.type
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            setSelectedType(formattedType);
        }
    }, [searchParams?.type]);

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

    // Filter ads on client side
    const filteredAds = ads
        .filter(ad => ad.show === true)
        .filter(ad => {
            const cityMatch = selectedCity
                ? ad.city && ad.city.trim().toLowerCase() === selectedCity.trim().toLowerCase()
                : true;
            const typeMatch = selectedType
                ? ad.type && ad.type.trim().toLowerCase() === selectedType.trim().toLowerCase()
                : true;
            return cityMatch && typeMatch;
        });

    const cityOptions = Array.from(new Set(ads.map(ad => ad.city).filter(Boolean)));
    const typeOptions = Array.from(new Set(ads.map(ad => ad.type).filter(Boolean)));

    // Update URL when filters change
    const updateURL = (city, type) => {
        const params = new URLSearchParams();
        if (city) params.set('city', city);
        if (type) params.set('type', type.toLowerCase().replace(/ /g, '_'));
        
        const newURL = `/find-hoardings${params.toString() ? `?${params.toString()}` : ''}`;
        router.push(newURL, { scroll: false });
    };

    const handleCityChange = (e) => {
        const city = e.target.value;
        setSelectedCity(city);
        updateURL(city, selectedType);
    };

    const handleTypeChange = (e) => {
        const type = e.target.value;
        setSelectedType(type);
        updateURL(selectedCity, type);
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

    // Select all filtered ads
    const handleSelectAll = () => {
        if (selectedAds.length === filteredAds.length) {
            setSelectedAds([]);
        } else {
            setSelectedAds(filteredAds);
        }
    };

    // Clear all selections
    const handleClearSelection = () => {
        setSelectedAds([]);
    };

    // Generate PowerPoint
    const handleGeneratePPT = async () => {
        if (selectedAds.length === 0) {
            alert('Please select at least one ad to generate PowerPoint.');
            return;
        }

        setIsGeneratingPPT(true);
        
        try {
            // Create presentation data
            const presentationData = {
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
                    locationMap: ad.locationmap
                }))
            };

            // Call API to generate PPT
            const response = await fetch('/api/generate-ppt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(presentationData),
            });

            if (response.ok) {
                // Download the file
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
                
                alert('PowerPoint presentation downloaded successfully!');
            } else {
                throw new Error('Failed to generate presentation');
            }
        } catch (error) {
            console.error('Error generating PPT:', error);
            alert('Error generating PowerPoint. Please try again.');
        } finally {
            setIsGeneratingPPT(false);
        }
    };

    return (
        <>
            {/* section 1 */}
            <div className='w-full min-h-[120vh] flex items-center justify-center relative'>
                <Image 
                    src="/images/find/bg.png" 
                    alt="Find Hoardings - JMD Advertisement Background" 
                    fill
                    className='object-cover'
                    priority
                />
                <div className='absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center'>
                    <span>
                        <h1 className='text-4xl sm:text-7xl font-extrabold text-white text-center'>Find Hoardings</h1>
                        <div className='h-1 w-[40vw] sm:w-[13vw] bg-white/50 rounded-md mx-auto mt-6 sm:mt-10'></div>
                    </span>
                    <span className='flex flex-col sm:flex-row items-center justify-between w-[90%] sm:w-[50%] mt-8 sm:mt-10 gap-4'>
                        <select
                            name="city"
                            id="city"
                            required
                            value={selectedCity}
                            onChange={handleCityChange}
                            className="px-4 sm:px-6 py-2 sm:py-3 rounded-md text-white font-semibold text-base sm:text-lg border-b-1 focus:outline-none focus:ring-2 focus:ring-red-400 w-full sm:w-auto"
                            style={{
                                WebkitBackdropFilter: "blur(8px)",
                                backdropFilter: "blur(8px)",
                            }}
                        >
                            <option value="" className='text-black'>Select city</option>
                            {cityOptions.map(city => (
                                <option key={city} value={city} className='text-black'>{city}</option>
                            ))}
                        </select>

                        <select
                            name="type"
                            id="type"
                            required
                            value={selectedType}
                            onChange={handleTypeChange}
                            className="px-4 sm:px-6 py-2 sm:py-3 rounded-md text-white font-semibold text-base sm:text-lg border-b-1 focus:outline-none focus:ring-2 focus:ring-red-400 w-full sm:w-auto"
                            style={{
                                WebkitBackdropFilter: "blur(8px)",
                                backdropFilter: "blur(8px)",
                            }}
                        >
                            <option value="" className='text-black'>Select Advertisement Type</option>
                            {selectedType && !typeOptions.includes(selectedType) && (
                                <option value={selectedType} className='text-black'>
                                    {selectedType}
                                </option>
                            )}
                            {typeOptions.map(type => (
                                <option key={type} value={type} className='text-black'>{type}</option>
                            ))}
                        </select>
                    </span>

                    {/* Category Partition */}
                    <div className="w-[98vw] sm:w-[80vw] mt-10 sm:mt-16 flex flex-row items-center justify-between rounded-2xl gap-2 sm:gap-0 overflow-x-auto scrollbar-hide px-2">
                        {categories.map((cat, idx) => (
                            <div
                                key={idx}
                                className={`flex flex-col items-center justify-center min-w-[90px] sm:w-1/5 border-2 border-white py-4 sm:py-6 ${idx % 2 !== 0 ? 'bg-white/10 hover:bg-white/40' : 'bg-red-400/70 hover:bg-red-500'} backdrop-blur-md shadow-lg transition-all duration-200 rounded-xl sm:rounded-2xl mx-1`}
                            >
                                <Image 
                                    src={cat.icon} 
                                    alt={cat.alt} 
                                    width={80} 
                                    height={80} 
                                    className="w-12 h-12 sm:w-20 sm:h-20 mb-2 sm:mb-3" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* section 2 */}
            <div className='w-full min-h-[120vh] flex items-center justify-center bg-red-400 py-8 sm:py-0' id='results'>
                <div className='w-[98vw] sm:w-[80%] h-auto sm:h-[100vh] items-start justify-start bg-white/10 border-1 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-10 overflow-y-auto scrollbar-hide'>
                    
                    {/* Results Header with Total Count */}
                    <div className="w-full mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/20 pb-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">
                                {loading ? 'Loading...' : 'Available Hoardings'}
                            </h2>
                            {!loading && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <p className="text-base sm:text-lg font-semibold text-black/80">
                                        Total: <span className="text-black font-bold">{filteredAds.length}</span> ads found
                                        {selectedAds.length > 0 && (
                                            <span className="ml-2 text-blue-600">
                                                | <span className="font-bold">{selectedAds.length}</span> selected
                                            </span>
                                        )}
                                    </p>
                                    {(selectedCity || selectedType) && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCity && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    📍 {selectedCity}
                                                </span>
                                            )}
                                            {selectedType && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    🎯 {selectedType}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Quick Stats */}
                        {!loading && filteredAds.length > 0 && (
                            <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                <div className="text-center">
                                    <div className="text-lg sm:text-xl font-bold text-black">{cityOptions.length}</div>
                                    <div className="text-xs text-black/70">Cities</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg sm:text-xl font-bold text-black">{typeOptions.length}</div>
                                    <div className="text-xs text-black/70">Types</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Selection Controls */}
                    {!loading && filteredAds.length > 0 && (
                        <div className="w-full mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white/20 rounded-lg">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={handleSelectAll}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
                                >
                                    {selectedAds.length === filteredAds.length ? 'Deselect All' : 'Select All'}
                                </button>
                                {selectedAds.length > 0 && (
                                    <button
                                        onClick={handleClearSelection}
                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
                                    >
                                        Clear Selection
                                    </button>
                                )}
                                <span className="text-black font-medium">
                                    {selectedAds.length} of {filteredAds.length} selected
                                </span>
                            </div>
                            
                            {selectedAds.length > 0 && (
                                <button
                                    onClick={handleGeneratePPT}
                                    disabled={isGeneratingPPT}
                                    className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                                >
                                    {isGeneratingPPT ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Download as PPT ({selectedAds.length})
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Results Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {loading ? (
                            <div className="col-span-full text-center text-black py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                                Loading ads...
                            </div>
                        ) : filteredAds.length === 0 ? (
                            <div className="col-span-full text-center text-black py-12">
                                <div className="mb-4">
                                    <svg className="w-16 h-16 mx-auto text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.515-.626-6.399-1.72C4.258 12.745 3 11.44 3 10c0-3.314 2.686-6 6-6h6c3.314 0 6 2.686 6 6 0 1.441-1.258 2.745-2.601 3.28C16.515 14.374 14.34 15 12 15z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No ads found</h3>
                                <p className="text-black/70">Try adjusting your search criteria or browse all available hoardings.</p>
                            </div>
                        ) : (
                            filteredAds.map((ad, idx) => {
                                const isSelected = selectedAds.some(selectedAd => selectedAd._id === ad._id);
                                return (
                                    <div 
                                        key={ad._id || idx} 
                                        className={`w-full h-[31vh] bg-red-500 rounded-lg shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-all duration-200 cursor-pointer relative ${isSelected ? 'ring-4 ring-blue-400 ring-opacity-75' : ''}`}
                                        onClick={() => handleAdSelection(ad)}
                                    >
                                        {/* Selection Checkbox */}
                                        <div className="absolute top-2 left-2 z-10">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white/80 border-gray-300'}`}>
                                                {isSelected && (
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>

                                        <div className="relative w-full h-[70%] rounded-t-lg overflow-hidden">
                                            <Image 
                                                src={ad.imageUrl || "/images/find/test.png"} 
                                                alt={`${ad.title} - ${ad.type} in ${ad.city}`} 
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </div>
                                        <div className='w-full h-[30%] flex flex-col text-start justify-center p-4'>
                                            <h3 className='text-base sm:text-lg font-semibold text-white'>{ad.title?.slice(0, 25) || "No Title"}...</h3>
                                            <Link 
                                                href={`/find-hoardings/${ad.mediacode || ad._id}`} 
                                                className='mt-2 text-gray-300 hover:underline text-sm sm:text-base'
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FindHoardingsClient;