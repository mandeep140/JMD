"use client";

import React, { useEffect, useState, useMemo } from 'react'
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import GoogleMap from '@/app/component/GoogleMap';
import { FaShoppingBag, FaTag, FaMapMarkedAlt, FaRegImage } from "react-icons/fa";



const AdDetailClient = ({ initialAd, adId }) => {
  const [showMap, setShowMap] = useState(false);
  const [ad, setAd] = useState(initialAd);
  const [loading, setLoading] = useState(!initialAd);
  const [similarAds, setSimilarAds] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [similarAdsFetched, setSimilarAdsFetched] = useState(false);
  const [cartItems, setCartItems] = useState([]); // Add cart state
  const [cartLoaded, setCartLoaded] = useState(false); // Add cart loaded state
  const [additionalPacks, setAdditionalPacks] = useState([]); // Add additional packs state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    callback: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  // New state variables for additional charges
  const [addPrinting, setAddPrinting] = useState(false);
  const [addMounting, setAddMounting] = useState(false);

  // Define additional packs data
  const additionalPacksData = [
    {
      id: 'mounting',
      title: 'Mounting Charge',
      unit: 'per unit',
      image: '/images/mounting.png',
      description: 'Professional mounting service for your hoarding'
    },
    {
      id: 'printing',
      title: 'Printing Charge',
      unit: 'per sqft',
      image: '/images/printing.png',
      description: 'High-quality printing service for your advertisement'
    }
  ];

  // Load cart and additional packs from localStorage on component mount
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

  // Save cart and additional packs to localStorage whenever they change - but only after cart is loaded
  useEffect(() => {
    if (cartLoaded) {
      localStorage.setItem('jmd_cart_items', JSON.stringify(cartItems));
      localStorage.setItem('jmd_additional_packs', JSON.stringify(additionalPacks));
    }
  }, [cartItems, additionalPacks, cartLoaded]);

  useEffect(() => {
    if (!adId) {
      redirect('/find-hoardings');
      return;
    }

    // If no initial ad data, fetch it
    if (!initialAd) {
      const fetchAd = async () => {
        try {
          const res = await fetch(`/api/ads/update?mediacode=${encodeURIComponent(adId)}`);
          if (!res.ok) throw new Error("Not found");
          const data = await res.json();
          setAd(data);
        } catch (err) {
          redirect('/find-hoardings');
        }
        setLoading(false);
      };
      fetchAd();
    }

    // Increment view count and visitor count - only once per page load
    if (ad && ad.mediacode) {
      // Increment view count
      fetch("/api/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediacode: ad.mediacode }),
      }).catch(console.error);

      // Log visitor for analytics
      fetch("/api/log-visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: ad.city }),
      }).catch(console.error);
    }
  }, [adId, initialAd]);

  // Fetch similar ads - Fixed to prevent repeated fetches
  useEffect(() => {
    if (ad && ad.mediacode && !similarAdsFetched) {
      const fetchSimilarAds = async () => {
        setSimilarLoading(true);
        try {
          const res = await fetch('/api/ads');
          if (res.ok) {
            const allAds = await res.json();

            // Filter out current ad and only show available ads
            const availableAds = allAds.filter(item =>
              item.mediacode !== ad.mediacode &&
              item.status === 'Available' &&
              item.show !== false
            );

            // Sort by priority: same city + same type > same city > same type > others
            const sortedAds = availableAds.sort((a, b) => {
              const aIsSameCity = a.city === ad.city;
              const aIsSameType = a.type === ad.type;
              const bIsSameCity = b.city === ad.city;
              const bIsSameType = b.type === ad.type;

              // Priority scoring
              const aScore = (aIsSameCity && aIsSameType ? 4 : 0) + (aIsSameCity ? 2 : 0) + (aIsSameType ? 1 : 0);
              const bScore = (bIsSameCity && bIsSameType ? 4 : 0) + (bIsSameCity ? 2 : 0) + (bIsSameType ? 1 : 0);

              return bScore - aScore;
            });

            // Take first 8 ads for display
            setSimilarAds(sortedAds.slice(0, 8));
            setSimilarAdsFetched(true);
          }
        } catch (error) {
          console.error('Error fetching similar ads:', error);
        }
        setSimilarLoading(false);
      };

      fetchSimilarAds();
    }
  }, [ad?.mediacode, ad?.city, ad?.type, similarAdsFetched]);

  // Update the addToCart function
  const addToCart = () => {
    if (!ad) return;

    setCartItems(prev => {
      const isAlreadyInCart = prev.some(item => item._id === ad._id);
      if (isAlreadyInCart) {
        return prev;
      }
      
      // Calculate additional costs
      const printingCost = addPrinting ? (ad.printing * ad.height * ad.width * ad.unit) : 0;
      const mountingCost = addMounting ? (ad.mounting * ad.height * ad.width * ad.unit) : 0;
      
      // Add item with additional cost flags
      const newCartItem = {
        ...ad,
        addPrinting,
        addMounting,
        printingCost,
        mountingCost,
      };
      
      const newCart = [...prev, newCartItem];
      console.log('Adding to cart:', ad.title, 'New cart size:', newCart.length);
      return newCart;
    });
  };

  // Add the missing isInCart function
  const isInCart = () => {
    return cartItems.some(item => item._id === ad._id);
  };

  // Add functions to handle individual additional cost additions
  const addPrintingToCart = () => {
    if (!ad) return;
    
    setAdditionalPacks(prev => {
      const isAlreadyAdded = prev.some(pack => pack.adId === ad._id && pack.type === 'printing');
      if (isAlreadyAdded) return prev;
      
      const printingPack = {
        id: `printing_${ad._id}`,
        adId: ad._id,
        type: 'printing',
        title: `Printing for ${ad.title}`,
        cost: ad.printing * ad.height * ad.width * ad.unit,
        unitCost: ad.printing,
        unit: 'per sqft',
        mediacode: ad.mediacode,
      };
      
      return [...prev, printingPack];
    });
  };

  const addMountingToCart = () => {
    if (!ad) return;
    
    setAdditionalPacks(prev => {
      const isAlreadyAdded = prev.some(pack => pack.adId === ad._id && pack.type === 'mounting');
      if (isAlreadyAdded) return prev;
      
      const mountingPack = {
        id: `mounting_${ad._id}`,
        adId: ad._id,
        type: 'mounting',
        title: `Mounting for ${ad.title}`,
        cost: ad.mounting * ad.height * ad.width * ad.unit,
        unitCost: ad.mounting,
        unit: 'per sqft',
        mediacode: ad.mediacode,
      };
      
      return [...prev, mountingPack];
    });
  };

  // Check if printing/mounting is already added
  const isPrintingAdded = () => {
    return additionalPacks.some(pack => pack.adId === ad._id && pack.type === 'printing');
  };

  const isMountingAdded = () => {
    return additionalPacks.some(pack => pack.adId === ad._id && pack.type === 'mounting');
  };

  // Handle sharing
  const handleShare = async () => {
    const shareData = {
      title: `${ad.type} in ${ad.city}`,
      text: `Check out this ${ad.type} available for advertising in ${ad.city}. Size: ${ad.size}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShareMessage('Shared successfully!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage('Link copied to clipboard!');
      }
    } catch (err) {
      // Final fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage('Link copied to clipboard!');
      } catch (clipboardErr) {
        setShareMessage('Unable to share');
      }
    }

    // Clear message after 3 seconds
    setTimeout(() => setShareMessage(''), 3000);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediacode: ad.mediacode,
          mediatype: ad.type,
          title: ad.title,
          city: ad.city,
          status: "Pending",
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          callback: form.callback ? "Yes" : "No",
        }),
      });
      if (res.ok) {
        alert("Booking request sent!");
        setForm({ name: "", email: "", phone: "", message: "", callback: true });
      } else {
        alert("Failed to send booking request.");
      }
    } catch (err) {
      alert("Error sending booking request.");
    }
    setSubmitting(false);
  };

  // Memoize scroll handlers to prevent unnecessary re-renders
  const handleScrollLeft = useMemo(() => () => {
    const container = document.getElementById('similarContainer');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }, []);

  const handleScrollRight = useMemo(() => () => {
    const container = document.getElementById('similarContainer');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }, []);

  if (!adId || loading) return (
    <div className="w-full h-screen flex items-center justify-center text-black text-center">
      Loading...
    </div>
  );

  if (!ad) return (
    <div className="w-full h-screen flex items-center justify-center text-black text-center">
      Ad not found
    </div>
  );

  return (
    <>
      {/* section 1 - Ad Details */}
      <div className='w-full min-h-[100vh] bg-red-500 flex items-center justify-center relative'>
        <div className='w-[95%] min-h-[80vh] mt-25
         md:mt-25 bg-white backdrop-blur-md rounded-t-sm p-2 md:p-6 flex flex-col md:flex-row gap-4    md:gap-0 overflow-hidden relative'>

          {/* Share Button - Card Top Right */}
          <button
            className='absolute top-4 right-4 md:top-6 md:right-6 z-10 w-10 h-10 md:w-12 md:h-12 bg-red-500/80 backdrop-blur-sm border border-white/30 hover:bg-red-600 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center group shadow-lg'
            onClick={handleShare}
            title="Share this ad"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:scale-110 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>

          {/* Share Success Message */}
          {shareMessage && (
            <div className="absolute top-16 right-4 md:top-20 md:right-6 z-20 p-2 bg-green-500 text-white text-center rounded-lg text-xs md:text-sm shadow-lg animate-pulse">
              {shareMessage}
            </div>
          )}

          {/* Left: Image and Map */}
          <div className="w-full md:w-1/2 h-[40vh] md:h-[80vh] flex flex-col gap-4 p-2 md:p-5 rounded-3xl">
            {/* Image Box */}
            <div
              className={`w-full ${!showMap ? 'h-2/3' : 'h-1/3'
                } duration-300 ease-in-out aspect-video overflow-hidden relative cursor-pointer`}
              onClick={() => {
                setShowMap(false);
                setIsFullscreen(true);
              }}
            >
              <Image
                src={ad.imageUrl || "/images/find/jmd_logo.png"}
                alt={`${ad.title} - ${ad.type} in ${ad.city}`}
                fill
                className="object-contain bg-white rounded-md"
                sizes="(max-width: 1080px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Map Box */}
            <div
              className={`w-full ${showMap ? 'h-2/3' : 'h-1/3'} duration-300 ease-in-out aspect-video rounded-md overflow-hidden cursor-pointer relative`}
              onClick={() => setShowMap(true)}
            >
              <GoogleMap coordinates={ad.coordinates} />
              {/* Map Button */}
              <button
                className="absolute bottom-2 right-2 bg-red-500 text-white p-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMap(!showMap);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right: Details and Key Insights */}
          <div className="w-full md:w-1/2 flex flex-col justify-between p-2 md:p-5 tracking-widest">
            {/* Title Section */}
            <div className='flex flex-col gap-3'>
              <div>
                <h2 className='text-3xl md:text-5xl font-bold'>{ad.type}</h2>
                <h1 className='text-xl md:text-2xl font-semibold mt-2 md:mt-3'>{ad.locality && ad.locality + ","} {ad.city}</h1>
              </div>

              {/* Description */}
              <p className='mt-4 text-sm md:text-base leading-relaxed'>
                {ad.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-wrap gap-3 mt-6'>
              <button
                onClick={addToCart}
                disabled={isInCart()}
                className={`flex items-center font-bold gap-2 p-4 rounded-sm transition-colors duration-200 ${isInCart()
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
              >
                <FaShoppingBag className='w-4 h-4' />
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isInCart() && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  )}
                </svg>
                {isInCart() ? 'Added to Cart' : 'Add to Cart'}
              </button>

              <Link
                href={`/find-hoardings/${adId}/#contact-us`}
                className='flex items-center gap-2 p-4 bg-red-500 font-bold text-white rounded-sm hover:bg-red-600 transition-colors duration-200'
                onClick={async () => {
                  await fetch("/api/conversion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "book" }),
                  });
                }}
              >
                <FaTag className='w-4 h-4' />
                Book Now
              </Link>

              <button
                onClick={() => setShowMap(!showMap)}
                className='flex items-center gap-2 px-4 py-2 bg-red-500 border border-white/30 text-white rounded-sm hover:bg-red-600 transition-colors duration-200'
                title={showMap ? "Show Image Larger" : "Show Map Larger"}
              >
                {!showMap ? <FaMapMarkedAlt className='w-4 h-4' /> : <FaRegImage className='w-4 h-4' />}
              </button>
            </div>

            {/* Key Insights Section */}
            <div className='mt-8'>
              <h3 className='text-xl md:text-3xl font-extrabold mb-4'>Key Insights</h3>
              <div className='grid grid-cols-2 gap-3'>
                <div className='bg-[#FFB8B8] backdrop-blur-sm border border-white/30 rounded-sm p-3 text-center'>
                  <div className='text-lg md:text-xl '>{ad.visibility || "Single"}</div>
                  <div className='text-xs md:text-sm font-extrabold'>Visibility</div>
                </div>
                <div className='bg-[#FFB8B8] backdrop-blur-sm border border-white/30 rounded-sm p-3 text-center'>
                  <div className='text-lg md:text-xl'>{ad.width}*{ad.height} - {ad.width * ad.height}sqft</div>
                  <div className='text-xs md:text-sm font-extrabold'>Size</div>
                </div>
                <div className='bg-[#FFB8B8] backdrop-blur-sm border border-white/30 rounded-sm p-3 text-center'>
                  <div className='text-lg md:text-xl'>{ad.lighting}</div>
                  <div className='text-xs md:text-sm font-extrabold'>Lighting</div>
                </div>
                <div className='bg-[#FFB8B8] backdrop-blur-sm border border-white/30 rounded-sm p-3 text-center'>
                  <div className='text-lg md:text-xl'>₹{ad.pricepermonth}</div>
                  <div className='text-xs md:text-sm font-extrabold'>Per Month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Packs Section */}
      <div className='w-full bg-red-500 flex items-start justify-center'>
        <div className='w-[95%] bg-white backdrop-blur-sm p-4 md:p-8'>
          <h2 className='text-2xl md:text-4xl font-bold text-black mb-6 md:mb-8'>
            ADDITIONAL CHARGES:
          </h2>
          <div className='flex flex-col md:flex-row gap-6'>
            {/* Printing Card */}
            <div className='bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200'>
              <div className='relative h-40 md:h-48 w-80'>
                <Image
                  src={"/images/printing.png"}
                  alt={"printing"}
                  fill
                  className='object-cover'
                />
              </div>
              <div className='p-4'>
                <h3 className='text-lg md:text-xl font-bold text-black'>Printing</h3>
                <div className='flex items-center justify-between'>
                  <div className='w-full'>
                    <div className='text-sm text-gray-500 mb-2'>₹ {ad.printing} Per sqft</div>
                    <div className='text-2xl font-semibold text-black w-full px-4 py-2 rounded-md bg-red-300 flex flex-row justify-between items-center'>
                      <span>
                        ₹ {(ad.printing * ad.height * ad.width * ad.unit)}
                      </span>
                      <button
                        onClick={addPrintingToCart}
                        disabled={isPrintingAdded()}
                        className={`px-3 py-1 ml-2 rounded-md transition-colors duration-200 text-sm flex items-center ${
                          isPrintingAdded() 
                            ? 'bg-green-500 text-white cursor-not-allowed' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        <FaShoppingBag className='w-3 h-3' /> &nbsp;
                        {isPrintingAdded() ? 'Added' : 'Add to cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mounting Card */}
            <div className='bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200'>
              <div className='relative h-40 md:h-48 w-80'>
                <Image
                  src={"/images/mounting.png"}
                  alt={"mounting"}
                  fill
                  className='object-cover'
                />
              </div>
              <div className='p-4'>
                <h3 className='text-lg md:text-xl font-bold text-black'>Mounting</h3>
                <div className='flex items-center justify-between'>
                  <div className='w-full'>
                    <div className='text-sm text-gray-500 mb-2'>₹ {ad.mounting} Per sqft</div>
                    <div className='text-2xl font-semibold text-black w-full px-4 py-2 rounded-md bg-red-300 flex flex-row justify-between items-center'>
                      <span>
                        ₹ {(ad.mounting * ad.height * ad.width * ad.unit)}
                      </span>
                      <button
                        onClick={addMountingToCart}
                        disabled={isMountingAdded()}
                        className={`px-3 py-1 ml-2 rounded-md transition-colors duration-200 text-sm flex items-center ${
                          isMountingAdded() 
                            ? 'bg-green-500 text-white cursor-not-allowed' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        <FaShoppingBag className='w-3 h-3' /> &nbsp;
                        {isMountingAdded() ? 'Added' : 'Add to cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      <div className='w-full min-h-[60vh] bg-red-500 flex items-start justify-center'>
        <div className='w-[95%] bg-white backdrop-blur-sm rounded-b-sm p-4 md:p-8'>
          <div className='flex items-center justify-between mb-6 md:mb-8 mt-4'>
            <h2 className='text-2xl md:text-4xl font-bold text-black'>
              SIMILAR PRODUCTS:
            </h2>
            <div className='flex gap-2'>
              <button
                className='w-10 h-10 md:w-12 md:h-12 bg-red-500/50 hover:bg-red-500/30 border border-red-500 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer'
                onClick={handleScrollLeft}
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className='w-10 h-10 md:w-12 md:h-12 bg-red-500/50 hover:bg-red-500/30 border border-red-500 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer'
                onClick={handleScrollRight}
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {similarLoading ? (
            <div className='flex items-center justify-center h-40'>
              <div className='text-white text-lg'>Loading similar products...</div>
            </div>
          ) : similarAds.length > 0 ? (
            <div
              id="similarContainer"
              className='flex gap-4 md:gap-6 overflow-x-auto pb-4'
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <style jsx>{`
                #similarContainer::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {similarAds.map((similarAd) => (
                <div key={similarAd.mediacode} className='flex-shrink-0 w-64 md:w-72 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group'>
                  <div className='relative h-40 md:h-48 overflow-hidden'>
                    <Image
                      src={similarAd.imageUrl || "/images/find/jmd_logo.png"}
                      alt={`${similarAd.title} - ${similarAd.type}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 256px, 288px"
                    />

                    {/* Badge for same city/type */}
                    {(similarAd.city === ad.city || similarAd.type === ad.type) && (
                      <div className='absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full'>
                        {similarAd.city === ad.city && similarAd.type === ad.type ? 'Same City & Type' :
                          similarAd.city === ad.city ? 'Same City' : 'Same Type'}
                      </div>
                    )}
                  </div>

                  <div className='p-4'>
                    <h3 className='font-bold text-lg text-gray-800 truncate'>
                      {similarAd.title}
                    </h3>
                    <p className='text-gray-600 text-sm mt-1'>
                      {similarAd.city}
                    </p>
                    <div className='flex items-center justify-between mt-3'>
                      <span className='text-xs bg-gray-100 px-2 py-1 rounded'>
                        {similarAd.type}
                      </span>
                      <span className='text-red-500 font-bold'>
                        ₹{similarAd.pricepermonth}/month
                      </span>
                    </div>
                    <Link
                      href={`/find-hoardings/${similarAd.mediacode}`}
                      className='block w-full mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-center rounded-lg transition-all duration-200 cursor-pointer'
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center text-white py-10'>
              <p className='text-lg'>No similar products found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Form Section (existing code continues...) */}
      <div id="contact-us" className='w-full min-h-[70vh] bg-red-500 flex items-center justify-center py-10'>
        <div className='w-full min-h-[100vh] bg-gradient-to-b from-red-500 to-black/90 flex items-center justify-center'>
          <div className='w-full mb- text-center mb-10'>
            <span className='flex flex-col items-center gap-2 mt-10 md:mt-24'>
              <h1 className='text-2xl md:text-4xl font-extrabold text-black/70'><span className='text-white/80'>Connect</span> With Us!</h1>
            </span>
            <div className='h-auto md:h-[70vh] w-[98%] md:w-[80%] mx-auto flex flex-col md:flex-row items-center justify-center mt-8 bg-[#E2CFCF] rounded-3xl'>
              <div className='w-full md:w-[35%] h-full flex flex-col p-5 items-center justify-center text-start bg-red-500 rounded-t-3xl md:rounded-3xl me-auto'>
                <h1 className='md:text-2xl text-lg text-white font-extrabold'>Why Choose JMD?</h1>
                <div className='h-[3px] w-[60vw] md:w-[13vw] bg-white rounded-md mx-auto mt-6'></div>
                <ul className='list-disc text-white mt-6 text-base md:text-lg px-5 ms-3'>
                  <li>19+ Years of Outdoor Advertising Excellence</li>
                  <li>1000+ Successful Campaigns Executed</li>
                  <li>Coverage Across 7+ East Indian States</li>
                  <li>Trusted by Top Brands & Local Businesses</li>
                </ul>
                <span className='flex flex-col items-center mt-6 pt-10 text-lg md:text-2xl font-extrabold' >
                  <h2>Thinking of Branding</h2>
                  <h2>Think JMD</h2>
                </span>
              </div>

              <div className='w-full md:w-[65%] h-full flex flex-col items-center text-black/80 justify-center ps-0 md:ps-15 mt-6 p-5' id='contact-us'>
                <h2 className='text-2xl font-extrabold text-black'>Book Free Consultation for media booking</h2>
                <span className='flex flex-row items-center justify-between w-[90%] md:w-[80%] my-3 text-xl  text-black'>
                  <h2>Media code: {ad.mediacode}</h2>
                  <h2>Media Type: {ad.type}</h2>
                </span>
                <p className='text-[10px] me-auto mb-auto'>*Please fill all the details</p>
                <div className='w-full md:w-[90%] mb-auto px-4 md:px-auto me-auto'>
                  <form onSubmit={handleSubmit}>
                    <span className='flex flex-col items-center gap-2 mb-4'>
                      <label htmlFor="name" className='me-auto'>Name</label>
                      <input type="text" name='name' id='name' value={form.name} onChange={handleChange} className='me-auto w-full md:w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='Full Name' />
                    </span>
                    <span className='flex flex-col md:flex-row items-center gap-2 mb-4'>
                      <span className='flex flex-col items-center gap-2 w-full'>
                        <label htmlFor="email" className='me-auto'>Email</label>
                        <input type="email" name='email' id='email' value={form.email} onChange={handleChange} className='me-auto w-full md:w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='email' />
                      </span>
                      <span className='flex flex-col items-center gap-2 ms-0 md:ms-6 w-full'>
                        <label htmlFor="phone" className='me-auto'>Phone</label>
                        <input type="tel" name='phone' id='phone' value={form.phone} onChange={handleChange} className='me-auto w-full md:w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='01 2345 6789' />
                      </span>
                    </span>
                    <span className='flex flex-col items-center gap-2 mb-2'>
                      <label htmlFor="message" className='me-auto'>Message</label>
                      <textarea rows={1} name='message' id='message' value={form.message} onChange={handleChange} className='me-auto w-full md:w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='Message' />
                    </span>
                    <span className='flex flex-col md:flex-row justify-between items-center gap-2 mt-8'>
                      <span className='flex flex-row items-center gap-2'>
                        <input type="checkbox" name='callback' id='checkbox' checked={form.callback} onChange={handleChange} className='' />
                        <label htmlFor="checkbox" className='me-auto'>Request Callback</label>
                      </span>
                      <button
                        className='me-0 md:me-12 bg-red-500 px-9 py-3 text-white font-bold text-lg rounded-lg cursor-pointer hover:bg-red-800 duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                        type='submit'
                        disabled={submitting}
                      >
                        {submitting ? "Sending..." : "Send Message"}
                      </button>
                    </span>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full screen image */}
      {!showMap && isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
          <button onClick={() => setIsFullscreen(false)} className="absolute top-10 right-14 text-white bg-red-400 border-2 border-red-600 rounded-xl px-4 py-1 cursor-pointer hover:bg-red-500">
            X
          </button>
          <img src={ad.imageUrl || "/images/find/jmd_logo.png"} alt={ad.title} className="max-w-full max-h-full" />
        </div>
      )}
    </>
  );
};

export default AdDetailClient;