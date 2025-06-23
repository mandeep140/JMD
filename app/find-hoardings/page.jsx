"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const categories = [
    { icon: "/svg/find/billboard.svg" },
    { icon: "/svg/find/digital.svg" },
    { icon: "/svg/find/airport.svg" },
    { icon: "/svg/find/mall.svg" },
    { icon: "/svg/find/transit.svg" },
];

const Page = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedType, setSelectedType] = useState('');

    // Set selectedType from URL query param (SSR/CSR safe)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            let typeParam = params.get("type");
            if (typeParam) {
                // Replace underscores with spaces, capitalize each word
                typeParam = typeParam
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                setSelectedType(typeParam);
            }
        }
    }, []);

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

    return (
        <>
            {/* section 1 */}
            <div className='w-full min-h-[120vh] flex items-center justify-center relative'>
                <img src="images/find/bg.png" className='w-full h-full absolute top-0 left-0 object-cover' alt="JMD" />
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
                            onChange={e => setSelectedCity(e.target.value)}
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
                            onChange={e => setSelectedType(e.target.value)}
                            className="px-4 sm:px-6 py-2 sm:py-3 rounded-md text-white font-semibold text-base sm:text-lg border-b-1 focus:outline-none focus:ring-2 focus:ring-red-400 w-full sm:w-auto"
                            style={{
                                WebkitBackdropFilter: "blur(8px)",
                                backdropFilter: "blur(8px)",
                            }}
                        >
                            <option value="" className='text-black'>Select Advertisement Type</option>
                            {/* Only show extra option if not already in typeOptions */}
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
                                <img src={cat.icon} alt={`category-${idx}`} className="w-12 h-12 sm:w-20 sm:h-20 mb-2 sm:mb-3" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* section 2 */}
            <div className='w-full min-h-[120vh] flex items-center justify-center bg-red-400 py-8 sm:py-0' id='results'>
                <div className='w-[98vw] sm:w-[80%] h-auto sm:h-[100vh] items-start justify-start bg-white/10 border-1 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-y-auto scrollbar-hide'>
                    {loading ? (
                        <div className="col-span-full text-center text-black">Loading ads...</div>
                    ) : filteredAds.length === 0 ? (
                        <div className="col-span-full text-center text-black">No ads found.</div>
                    ) : (
                        filteredAds.map((ad, idx) => (
                            <div key={ad._id || idx} className={`w-full h-[31vh] bg-red-500 rounded-lg shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform duration-200`}>
                                <img src={ad.imageUrl || "/images/find/test.png"} alt={ad.title} className='w-full h-[70%] object-cover rounded-t-lg' />
                                <div className='w-full h-[30%] flex flex-col text-start justify-center p-4'>
                                    <h2 className='text-base sm:text-lg font-semibold text-white'>{ad.title?.slice(0, 25) || "No Title"}...</h2>
                                    <Link href={`/find-hoardings/${ad.mediacode || ad._id}`} className='mt-2 text-gray-300 hover:underline text-sm sm:text-base'>View Details</Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}

export default Page;