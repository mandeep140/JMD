"use client";

import React, { useEffect, useState } from 'react'
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import GoogleMap from '@/app/component/GoogleMap';

const AdDetailClient = ({ initialAd, adId }) => {
  const [open, setOpen] = useState(true);
  const [ad, setAd] = useState(initialAd);
  const [loading, setLoading] = useState(!initialAd);
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

    // Increment view count and visitor count
    if (ad) {
      // Increment view count
      fetch("/api/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediacode: adId }),
      });

      // Increment visitor count
      fetch("/api/conversion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "visitor" }),
      });
    }
  }, [adId, initialAd, ad]);

  // Handle share functionality
  const handleShare = async () => {
    const shareData = {
      title: `${ad.type} in ${ad.city} - ${ad.title}`,
      text: `Check out this ${ad.type.toLowerCase()} advertising space in ${ad.city}. Size: ${ad.size}, Price: ₹${ad.priceperday}/day. Book with JMD Advertisement!`,
      url: window.location.href,
    };

    try {
      // Try Web Share API first (mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShareMessage('Shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
        setShareMessage('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback: manual copy
      try {
        const textArea = document.createElement('textarea');
        textArea.value = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setShareMessage('Link copied to clipboard!');
      } catch (fallbackError) {
        setShareMessage('Unable to share. Please copy the URL manually.');
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
        setForm({ name: "", email: "", phone: "", message: "", callback: true});
      } else {
        alert("Failed to send booking request.");
      }
    } catch (err) {
      alert("Error sending booking request.");
    }
    setSubmitting(false);
  };

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
      {/* section 1 */}
      <div className='w-full min-h-[100vh] bg-red-500 flex items-center justify-center relative'>
        <div className='w-[98%] md:w-[80%] min-h-[80vh] border-white border-2 mt-25
         md:mt-25 bg-white/40 backdrop-blur-md rounded-3xl p-2 md:p-6 flex flex-col md:flex-row gap-4 md:gap-0 overflow-hidden relative'>
          
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

          {/* Left: Images */}
          <div className="w-full md:w-1/2 h-[30vh] md:h-auto flex flex-col justify-between gap-4 md:gap-0 p-2 md:p-5 rounded-3xl">
            <div className={`w-full ${open ? 'md:h-2/3' : 'md:h-1/4'} h-full duration-300 ease-in-out aspect-video overflow-hidden relative`}>
              <Image
                src={ad.imageUrl || "/images/find/test.png"}
                alt={`${ad.title} - ${ad.type} in ${ad.city}`}
                fill
                className="object-cover rounded-2xl cursor-pointer"
                onClick={() => setOpen(true)}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className={`w-full ${open ? 'md:h-1/4' : 'md:h-2/3'} hidden md:block duration-300 mt-3 md:mt-5 ease-in-out aspect-video rounded-2xl overflow-hidden`} onClick={() => setOpen(false)}>
              <GoogleMap mapLink={ad.locationmap} />
            </div>
          </div>
          {/* Right: Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-between p-2 md:p-5 tracking-widest mt-3 md:mt-5">
            <h2 className='text-3xl md:text-5xl font-bold'>{ad.type}</h2>
            <h1 className='text-xl md:text-3xl font-extrabold mt-2 md:mt-3'>{ad.title}</h1>
            <h4 className='text-xs md:text-sm'>CODE: {ad.mediacode}</h4>
            <div className='flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-8 w-full md:w-[80%] text-base md:text-xl mt-4'>
              <h2><b>SIZE:</b> {ad.size}</h2>
              <h2><b>AREA:</b> {ad.city || ""}</h2>
            </div>
            <div className='flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-8 w-full md:w-[80%] mt-2 text-base md:text-xl'>
              <h2><b>LIGHTING:</b> {ad.lighting}</h2>
              <h2><b>AVAILABILITY:</b> {ad.status || ""}</h2>
            </div>
            <p className='mt-3 text-sm md:text-base'>
              {ad.message}
            </p>
            <h2 className='mt-4 text-base md:text-xl'><b>MEDIA LOCATION:</b> {ad.city}</h2>
            <h2 className='mt-4 text-base md:text-xl'><b>PRICE PER DAY:</b> ₹{ad.priceperday}</h2>
            <h2 className='mt-2 text-base md:text-xl'><b>PRICE PER MONTH:</b> ₹{ad.pricepermonth}</h2>
            <div className={`w-full h-[40vh] md:hidden duration-300 mt-3 md:mt-5 ease-in-out aspect-video rounded-2xl overflow-hidden`} onClick={() => setOpen(false)}>
              <GoogleMap mapLink={ad.locationmap} />
            </div>

            <div className='flex flex-col md:flex-row items-center justify-between w-full md:w-[80%] mt-8 md:mt-20 gap-3 md:gap-0'>
              <button className='w-full hidden md:block md:w-auto px-6 py-2 bg-white/10 border-2 hover:bg-black/10 rounded-2xl transition-all duration-200 cursor-pointer' onClick={() => setOpen(!open)}>
                Expand {open ? "Map" : "Photo"}
              </button>

              <Link
                href={`/find-hoardings/${adId}/#contact-us`}
                className='w-full md:w-auto px-6 py-2 bg-red-500 border-2 hover:bg-white hover:text-red-500 rounded-2xl transition-all duration-200 cursor-pointer text-center'
                onClick={async () => {
                  await fetch("/api/conversion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "book" }),
                  });
                }}
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* section 2 - Contact Form */}
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
    </>
  );
};

export default AdDetailClient;