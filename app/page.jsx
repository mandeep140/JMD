"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLongArrowAltRight, FaUser, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Head from 'next/head';
import GoogleMap from '@/app/component/GoogleMap';

// --- City/State Data (update as needed) ---
const cityToState = {
  asansol: "West Bengal",
  bhagalpur: "Bihar",
  bhubaneswar: "Odisha",
  bilaspur: "Chhattisgarh",
  bokaro: "Jharkhand",
  cuttack: "Odisha",
  dhanbad: "Jharkhand",
  durgapur: "West Bengal",
  durgbhilai: "Chhattisgarh",
  gaya: "Bihar",
  hyderabad: "Telangana",
  jamshedpur: "Jharkhand",
  kolkata: "West Bengal",
  muzaffarpur: "Bihar",
  patna: "Bihar",
  raipur: "Chhattisgarh",
  ranchi: "Jharkhand",
  rourkela: "Odisha",
  siliguri: "West Bengal"
};

// coordinates
const officeCordinates = {
  lat: 22.760073,
  lng: 86.189797
}

const cityImages = [
  // Jharkhand
  { name: "bokaro", file: "bokaro.png" },
  { name: "dhanbad", file: "dhanbad.png" },
  { name: "jamshedpur", file: "jamshedpur.png" },
  { name: "ranchi", file: "ranchi.png" },

  // Bihar
  { name: "bhagalpur", file: "bhagalpur.png" },
  { name: "gaya", file: "gaya.png" },
  { name: "muzaffarpur", file: "muzaffarpur.png" },
  { name: "patna", file: "patna.png" },

  // West Bengal
  { name: "asansol", file: "asansol.png" },
  { name: "durgapur", file: "durgapur.png" },
  { name: "kolkata", file: "kolkata.png" },
  { name: "siliguri", file: "siliguri.png" },

  // Odisha
  { name: "bhubaneswar", file: "bhubaneswar.png" },
  { name: "cuttack", file: "cuttack.png" },
  { name: "rourkela", file: "rourkela.png" },

  // Chhattisgarh
  { name: "bilaspur", file: "bilaspur.png" },
  { name: "durgbhilai", file: "durgbhilai.png" },
  { name: "raipur", file: "raipur.png" }
];


// Build state-to-cities mapping dynamically
const stateToCities = {};
cityImages.forEach(({ name, file }) => {
  const state = cityToState[name];
  if (state) {
    if (!stateToCities[state]) stateToCities[state] = [];
    stateToCities[state].push({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      img: `/images/location/${file}`,
    });
  }
});
const stateList = Object.keys(stateToCities);

const Home = () => {
  // Get base URL from environment variables
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jmdadvertisement.com';

  // --- UI State ---
  const [cityStateIdx, setCityStateIdx] = useState(0);
  const [cityScroll, setCityScroll] = useState(0);
  const [videoNav, setVideoNav] = useState(0);
  const [activeVideo, setActiveVideo] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mobileCardIndex, setMobileCardIndex] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    callback: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeMedia, setActiveMedia] = useState(null);
  const [isContactExpanded, setIsContactExpanded] = useState(false);

  // --- Dynamic Video Cards State ---
  const [videoCards, setVideoCards] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);

  // --- Testimonials State ---
  const [testimonials, setTestimonials] = useState([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonialStartIndex, setTestimonialStartIndex] = useState(0);

  // --- Media Coverage State ---
  const [mediaCoverage, setMediaCoverage] = useState([]);
  const [mediaCoverageLoading, setMediaCoverageLoading] = useState(true);

  // --- Fetch Videos from Database ---
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setVideosLoading(true);
        const response = await fetch('/api/videos');
        if (response.ok) {
          const videos = await response.json();
          // Transform database videos to match existing format
          const transformedVideos = videos
            .filter(video => video.isActive) // Only show active videos
            .sort((a, b) => a.order - b.order) // Sort by display order
            .map(video => ({
              src: video.embedUrl,
              thumb: video.thumbnailUrl,
              title: video.title,
              videoId: video.videoId
            }));

          setVideoCards(transformedVideos);
        } else {
          throw new Error('Failed to fetch videos');
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        // Fallback to default videos if API fails
        setVideoCards([
          { src: "https://www.youtube.com/embed/9b1QFyFrYY4?si=_61RW6F4228we0F3", thumb: "https://img.youtube.com/vi/9b1QFyFrYY4/maxresdefault.jpg", title: "What does an ad agency do?" },
          { src: "https://www.youtube.com/embed/ysLRUcCHIiw?si=RGwNm13OE6UnWI3d", thumb: "https://img.youtube.com/vi/ysLRUcCHIiw/maxresdefault.jpg", title: "10 benifits of outdoor advertisement" },
          { src: "https://www.youtube.com/embed/B83CpMCgPL0?si=2xeDuZd7SheplUB3", thumb: "https://img.youtube.com/vi/B83CpMCgPL0/maxresdefault.jpg", title: "what is outdoor advertisement" },
          { src: "https://www.youtube.com/embed/fi0gxvSUNZw?si=wMOVJaUDkDF7pl0S", thumb: "/images/about/bg.png", title: "the power of out-of-home advertisement" },
        ]);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // --- Fetch Testimonials from Database ---
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        const data = await response.json();
        if (data.success) {
          setTestimonials(data.testimonials);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    fetchTestimonials();
  }, []);

  // --- Fetch Media Coverage from Database ---
  useEffect(() => {
    const fetchMediaCoverage = async () => {
      try {
        setMediaCoverageLoading(true);
        const response = await fetch('/api/media-coverage');
        const data = await response.json();
        if (data.success) {
          // Filter active items and sort by order
          const activeItems = data.items
            .filter(item => item.active)
            .sort((a, b) => a.order - b.order);
          setMediaCoverage(activeItems);
        }
      } catch (error) {
        console.error('Error fetching media coverage:', error);
        // Fallback to default media if API fails
        setMediaCoverage([
          { _id: '1', title: 'Business Multiplier Award', imageUrl: '/images/award.jpg', order: 1 },
          { _id: '2', title: 'Outdoor Asia Magazine', imageUrl: '/images/outdoor.jpg', order: 2 },
          { _id: '3', title: 'Outdoor Asia Magazine', imageUrl: '/images/magazine.jpg', order: 3 },
        ]);
      } finally {
        setMediaCoverageLoading(false);
      }
    };

    fetchMediaCoverage();
  }, []);

  // --- Carousel/Auto-shuffle for mobile service cards ---
  useEffect(() => {
    const interval = setInterval(() => {
      setMobileCardIndex(prev => (prev >= serviceCards.length - 1) ? 0 : prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- Video load/loop logic ---
  const handleVideoLoad = (e) => {
    const video = e.target;
    video.currentTime = 0;
    const handleVideoEnd = () => {
      video.currentTime = 0;
      video.play().catch(err => { });
    };
    video.addEventListener('ended', handleVideoEnd);
    return () => {
      video.removeEventListener('ended', handleVideoEnd);
    };
  };
  useEffect(() => {
    const video = document.querySelector('video');
    if (video) {
      const playVideo = () => {
        video.play().catch(() => { });
      };
      setTimeout(playVideo, 100);
      const handleVisibilityChange = () => {
        if (!document.hidden && video.paused) {
          video.play().catch(() => { });
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  // --- Service Cards ---
  const serviceCards = [
    { title: "Hoardings", link: "/find-hoardings?type=hoarding", image: "/images/billboard.png" },
    { title: "Digital Hoardings", link: "/find-hoardings?type=digital_hoarding", image: "/images/digital_billboard.png" },
    { title: "Transit Media", link: "/find-hoardings?type=transit_media", image: "/images/transit_media.png" },
    { title: "Airport Branding", link: "/find-hoardings?type=airport_branding", image: "/images/airport_branding.png" },
    { title: "Mall Media", link: "/find-hoardings?type=mall_media", image: "/images/mall_media.png" },
    { title: "Pole Kiosk", link: "/find-hoardings?type=pole_kiosk", image: "/images/pole_kiosk.png" },
    { title: "Railway Station Branding", link: "/find-hoardings?type=railway_station_branding", image: "/images/railway_station_branding.png" },
    { title: "Unipole", link: "/find-hoardings?type=unipole", image: "/images/unipole.png" },
    { title: "Bus Shelter Branding", link: "/find-hoardings?type=bus_shelter_branding", image: "/images/bus_shelter_branding.png" },
    { title: "Digital Marketing", link: "/find-hoardings?type=digital_marketing", image: "/images/digital_marketing.png" }
  ];

  const s3cards = [
    { img: "/svg/city.svg", text: "Prime Locations Across Major Cities" },
    { img: "/svg/targeted.svg", text: "High Footfall & Targeted Reach" },
    { img: "/svg/ete.svg", text: "End-To-End Campaign Execuation and Support" },
  ];

  const companyLogos = [
    "/images/companies/c1.png", "/images/companies/c2.png", "/images/companies/c3.png", "/images/companies/c4.png", "/images/companies/c5.png",
    "/images/companies/c6.png", "/images/companies/c7.png", "/images/companies/c8.png", "/images/companies/c9.png", "/images/companies/c10.png",
    "/images/companies/c11.png", "/images/companies/c12.png", "/images/companies/c13.png", "/images/companies/c14.png", "/images/companies/c15.png",
    "/images/companies/c16.png", "/images/companies/c17.png", "/images/companies/c18.png", "/images/companies/c19.png", "/images/companies/c20.png",
    "/images/companies/c21.png", "/images/companies/c22.png", "/images/companies/c23.png", "/images/companies/c24.png", "/images/companies/c25.png",
    "/images/companies/c26.png", "/images/companies/c27.png", "/images/companies/c28.png", "/images/companies/c29.png", "/images/companies/c30.png",
    "/images/companies/c31.png", "/images/companies/c32.png"
  ];

  // --- Video Nav ---
  const incVideoNav = () => {
    if (videoCards.length <= 3) return; // Don't navigate if 3 or fewer videos
    if (videoNav >= videoCards.length - 3) setVideoNav(0);
    else setVideoNav(videoNav + 1);
  };
  const decVideoNav = () => {
    if (videoCards.length <= 3) return; // Don't navigate if 3 or fewer videos
    if (videoNav === 0) setVideoNav(videoCards.length - 3);
    else setVideoNav(videoNav - 1);
  };

  // --- Image Error Handler ---
  const handleImageError = (e) => {
    e.target.src = '/images/about/bg.png'; // Default fallback image
  };

  // --- Contact Form ---
  const handleFormChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    form.callback = form.callback ? "yes" : "no";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("Message sent!");
        setForm({ name: "", email: "", phone: "", message: "", callback: true });
      } else {
        alert("Failed to send message.");
      }
    } catch {
      alert("Error sending message.");
    }
    setSubmitting(false);
  };

  // --- City Listing Section Logic ---
  useEffect(() => {
    setCityScroll(0);
  }, [cityStateIdx]);

  const handleCityLeft = () => {
    const cities = stateToCities[stateList[cityStateIdx]] || [];
    if (cities.length <= 3) return;
    setCityScroll(prev => prev === 0 ? cities.length - 3 : prev - 1);
  };
  const handleCityRight = () => {
    const cities = stateToCities[stateList[cityStateIdx]] || [];
    if (cities.length <= 3) return;
    setCityScroll(prev => prev >= cities.length - 3 ? 0 : prev + 1);
  };

  // Contact info data
  const contactInfo = {
    phones: ["+91-9204965321", "+91-7368810121", "+91-7368810125"],
    email: "info.jmd.jsr@gmail.com",
    address: "B-5 Murli Garden, TRF Colony, Harhargutu Jamshedpur, Jharkhand (831002)"
  };

  // --- Render ---
  return (
    <>
      <Head>
        <title>JMD Advertisement - Leading Outdoor Advertising Company in East India</title>
        <meta name="description" content="JMD (Jai Mata Di Advertising) - East India's fastest-growing outdoor advertising agency with 18+ years of experience. Get premium billboard, digital signage, transit media solutions across Jharkhand, Bihar, West Bengal, Odisha & Chhattisgarh." />
        <meta name="keywords" content="JMD Advertisement, Outdoor Advertising East India, Billboards Jharkhand Bihar, Digital Hoardings West Bengal, Transit Media Advertising, Mall Advertising Odisha, Airport Branding Chhattisgarh, OOH Advertising Jamshedpur, Billboard Booking Kolkata, Digital Signage Ranchi, Brand Promotion Patna, Advertising Agency East Zone" />

        {/* Open Graph Tags */}
        <meta property="og:title" content="JMD Advertisement - Premium Outdoor Advertising in East India" />
        <meta property="og:description" content="Transform your brand visibility with JMD's premium outdoor advertising solutions. 18+ years of experience, 1000+ successful campaigns across East India's major cities." />
        <meta property="og:image" content={`${baseUrl}/images/jmd_logo.png`} />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="JMD Advertisement" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="JMD Advertisement - Premium Outdoor Advertising East India" />
        <meta name="twitter:description" content="18+ years of experience in outdoor advertising. Premium billboard, digital signage & transit media solutions across East India." />
        <meta name="twitter:image" content={`${baseUrl}/images/jmd_logo.png`} />

        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="JMD Advertisement" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="geo.region" content="IN-JH" />
        <meta name="geo.placename" content="Jamshedpur, Jharkhand" />
        <meta name="geo.position" content="22.8046;86.2029" />
        <meta name="ICBM" content="22.8046, 86.2029" />
        <link rel="canonical" href={baseUrl} />
      </Head>

      {/* Section 1 */}
      <div className='h-[110vh] -mt-10 w-full relative lg:h-[115vh]'>
        <div className='absolute z-[-1] w-full h-full'>
          <div className="overlay  z-10 absolute bg-black/65  w-full min-h-[110vh] "></div>
          <video
            src="/videos/bg_video.webm"
            className='w-full h-full md:ml-0 object-cover max-md:object-left mobile-video-left'
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={handleVideoLoad}
            onTimeUpdate={(e) => {
              if (e.target.currentTime >= e.target.duration - 0.1) {
                e.target.currentTime = 0;
              }
            }}
            webkit-playsinline="true"
          ></video>
        </div>
        <div className='w-[40vw] absolute top-70 pt-50 md:pt-0 left-31 text-white max-lg:w-[70vw] max-lg:top-24 max-lg:left-6 max-md:w-[90vw] max-md:top-16 max-md:left-2'>
          <span>
            <h1 className='text-3xl font-bold md:text-5xl'><span className='text-red-500'>Fastest</span> Growing</h1>
          </span>
          <span>
            <h1 className='text-7xl font-extrabold max-lg:text-5xl max-md:text-3xl'>Outdoor</h1>
            <h1 className='text-6xl font-extrabold max-lg:text-4xl max-md:text-2xl'>Advertisement</h1>
            <h1 className='text-4xl font-bold max-lg:text-2xl max-md:text-lg'>Company In East Zone</h1>
          </span>
          <span className='flex items-center gap-2 mt-4 max-md:gap-1 max-md:mt-2'>
            <img src="/svg/Rectangle.svg" alt="Rectangle decoration" className='max-md:w-auto' />
            <span>
              <h1 className='max-md:text-xs'>Trusted By India's Top Brands</h1>
              <h1 className='max-md:text-xs'>To Deliver Maximun Impact.</h1>
            </span>
          </span>
          <span className='flex items-center gap-4 mt-6 text-lg font-semibold md:gap-2 md:mt-3 md:text-base'>
            <Link href="find-hoardings" className="relative group overflow-hidden flex gap-8 border-2 rounded-4xl px-4 py-2 hover:border-red-500 duration-200 md:gap-6 md:px-10  md:py-3 md:text-xl">
              <span className="absolute inset-0 bg-white scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 z-0"></span>
              <span className="relative z-10 text-white group-hover:text-red-500 transition-colors duration-300">Make your plan</span>
              <FaLongArrowAltRight className="text-white h-6 w-6 group-hover:text-red-500 z-10 my-auto transition-colors duration-300" />
            </Link>
            <a href="#contact-us" className='scale-80 hover:scale-100 duration-100'>
              <Image src="/svg/dialer.svg" alt="Contact dialer" width={48} height={48} className='w-12 md:w-15' />
            </a>
          </span>
        </div>
      </div>

      {/* Section 2 */}
      <div className='w-full min-h-[120vh] -mt-20 bg-red-600 backdrop-blur-lg flex items-center justify-center relative lg:min-h-[130vh] md:min-h-[125vh]' id='services'>
        <div className='text-white w-full h-[30vh] pt-10 md:pt-15 text-center absolute top-20 max-lg:top-8 max-md:top-4'>
          <h1 className='text-6xl font-black tracking-tight max-lg:text-4xl max-md:text-3xl'>Our Services</h1>
          <h1 className='text-xs mt-2 font-light tracking-wide max-md:text-[12px]'>Choose from below to deliver advertisements in a truly <br /> exciting, innovative and creative way.</h1>
          <div className='h-1 w-[13vw] bg-white/50 rounded-md mx-auto mt-10 max-md:w-[30vw] max-md:mt-4'></div>
        </div>
        {/* Desktop Service Cards */}
        <div className="hidden md:flex flex-col items-center justify-center gap-6 mt-20 md:mt-70 max-lg:mt-16 px-4 max-w-6xl mx-auto">
          {/* First Row - 5 Cards */}
          <div className="flex flex-nowrap items-start justify-center gap-4">
            {serviceCards.slice(0, 5).map((card, index) => (
              <Link href={card.link} key={index}>
                <div
                  key={index}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`w-[220px] h-[300px] flex flex-col items-center justify-center overflow-hidden bg-white backdrop-blur-lg rounded-2xl hover:scale-110 duration-300 shadow-md hover:shadow-2xl transition-all cursor-pointer flex-shrink-0 ${hoveredCard !== null && hoveredCard !== index
                    ? 'opacity-40 scale-95'
                    : 'opacity-100 scale-100'
                    }`}
                >
                  <Image src={card.image} alt={card.title} width={220} height={180} className="w-full h-3/5 object-cover" />
                  <div className="p-4 text-center flex flex-col items-center justify-center h-2/5">
                    <h1 className="font-bold text-black/70 text-base mb-3">{card.title}</h1>
                    <p className="text-black/70 hover:text-black flex items-center justify-center gap-2 text-sm duration-200">
                      Learn More <Image src="/svg/black_arrow.svg" alt="Arrow" width={12} height={12} className='w-3' />
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Second Row - 5 Cards */}
          <div className="flex flex-nowrap items-start justify-center gap-4">
            {serviceCards.slice(5, 10).map((card, index) => (
              <Link href={card.link} key={index + 5}>
                <div
                  key={index + 5}
                  onMouseEnter={() => setHoveredCard(index + 5)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`w-[220px] h-[300px] flex flex-col items-center justify-center overflow-hidden bg-white backdrop-blur-lg rounded-2xl hover:scale-110 duration-300 shadow-md hover:shadow-2xl transition-all cursor-pointer flex-shrink-0 ${hoveredCard !== null && hoveredCard !== (index + 5)
                    ? 'opacity-40 scale-95'
                    : 'opacity-100 scale-100'
                    }`}
                >
                  <Image src={card.image} alt={card.title} width={220} height={180} className="w-full h-3/5 object-cover" />
                  <div className="p-4 text-center flex flex-col items-center justify-center h-2/5">
                    <h1 className="font-bold text-black/70 text-base mb-3">{card.title}</h1>
                    <p className="text-black/70 hover:text-black flex items-center justify-center gap-2 text-sm duration-200">
                      Learn More <Image src="/svg/black_arrow.svg" alt="Arrow" width={12} height={12} className='w-3' />
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {/* Mobile Carousel */}
        <div className="md:hidden w-full flex items-center justify-center mt-40 px-6">
          <div className="w-full max-w-sm">
            <div className="relative w-full">
              {serviceCards.map((card, index) => (
                <Link href={card.link} key={index}>
                  <div
                    key={index}
                    className={`w-full transition-all duration-700 ease-out transform ${index === mobileCardIndex
                      ? 'block opacity-100 translate-x-0 scale-100'
                      : 'hidden opacity-0 translate-x-4 scale-95'
                      }`}
                  >
                    <div className="w-full bg-white backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden">
                      <Image src={card.image} alt={card.title} width={320} height={192} className="w-full h-48 object-cover" />
                      <div className="w-full p-6 text-center">
                        <h1 className="font-bold text-black/70 text-xl mb-4">{card.title}</h1>
                        <p className="text-black/70 hover:text-black flex items-center justify-center gap-2 text-base duration-300 hover:scale-105">
                          Learn More <Image src="/svg/black_arrow.svg" alt="Arrow" width={16} height={16} className='w-4' />
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex justify-center mt-6 gap-3">
              {serviceCards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setMobileCardIndex(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${index === mobileCardIndex
                    ? 'bg-white w-8 shadow-lg'
                    : 'bg-white/50 w-3 hover:bg-white/70'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 */}
      <div className='w-full h-[105vh] md:min-h-[100vh] bg-[#FFF4F4] flex items-center justify-center flex-row max-lg:flex-col max-lg:gap-8 max-md:min-h-[80vh]'>
        <div className='w-[50vw] me-auto mb-auto text-center max-lg:w-full max-lg:mb-0'>
          <span className='flex flex-col items-center gap-0 md:gap-2 mt-25 max-md:mt-'>
            <h1 className='text-5xl font-black text-black max-lg:text-3xl max-md:text-3xl'>Why To Choose</h1>
            <h1 className='text-4xl font-extrabold text-black max-lg:text-2xl max-md:text-lg'><span className='text-red-500'>JMD Advertisement</span>?</h1>
          </span>
          <div className='h-[15vh] w-full flex items-center justify-center mt-8 bg-red-600 md:rounded-e-2xl lg:h-[35vh] md:h-[25vh] md:mt-4'>
            <p className='px-10 md:ms-18 md:text-start  text-[17px] tracking-wide font-light max-lg:px-4 max-md:px-2 max-md:text-xs text-white'>At JMD, we're not just another outdoor advertising company. We are your strategic partner in putting your brand in front of millions — right where it can't be missed. Our approach blends location intelligence, bold creative execution, and proven reach to deliver unmatched visibility.</p>
          </div>
          <div className='flex items-center justify-center px-2 md:px-0 gap-4 mt-7 md:ms-8 max-lg:gap-2 max-lg:mt-3 '>
            {s3cards.map((item, index) => (
              <div key={index} className='flex flex-col items-center gap-2 rounded-lg w-[12vw] h-[20vh] bg-white hover:scale-105 duration-200 shadow-lg hover:shadow-xl transition-transform max-lg:w-[25vw] lg:h-[25vh] max-md:w-[32vw] md:h-[20vh]'>
                <span className='flex items-center justify-center w-full h-[60%] rounded-t-lg bg-red-500'>
                  <Image src={item.img} alt={item.text} width={64} height={64} className='w-16 h-16 max-lg:w-10 max-lg:h-10 max-md:w-7 max-md:h-7' />
                </span>
                <h1 className='mx-3 text-xs text-black/70 max-md:text-[10px]'>{item.text}</h1>
              </div>
            ))}
          </div>
        </div>
        <div className='w-[60vw] ms-auto mb-auto flex items-center justify-center max-lg:w-full max-lg:justify-center'>
          <Image src="/svg/billboard.svg" alt="Billboard illustration" width={600} height={400} className='h-[100%] w-[80%] object-cover rounded-2xl mt-16 ms-10 lg:h-[] lg:w-[] max-lg:mt-1' />
        </div>
      </div>
      <div className='w-full h-[20vh] bg-red-400 rounded-t-[100%] -mt-1 md:-mt-43 max-lg:h-[10vh] max-md:h-[6vh]'></div>

      {/* Section 4: City Listing */}
      <div className='w-full min-h-[100vh] bg-[#FFF4F4] flex flex-col items-center justify-center relative max-md:min-h-[60vh]' id='city'>
        <div className='w-full h-[30%] mt-35 mb-auto flex flex-col items-center justify-center text-center z-1  max-md:mt-8'>
          <h1 className='text-red-500 text-4xl font-extrabold md:text-5xl'>Explore Your City Listing</h1>
          <p className='text-black/70 tracking-wide mt-4 mb-10 w-[30%] max-md:w-[80%] max-md:text-xs'>Discover premium outdoor ad spaces across India's major cities and boost your brand visibility where it matters most.</p>
        </div>
        {/* City Images with State Buttons and Scroll Buttons */}
        <div className='z-1 flex flex-row items-center justify-center gap-4 max-md:gap-1'>
          {/* Left Scroll Button (city) */}
          <button
            className={`mb-auto mt-18 me-3 hidden md:block cursor-pointer max-md:mt-4 max-md:me-1 ${((stateToCities[stateList[cityStateIdx]] || []).length <= 3 ? 'opacity-50 cursor-not-allowed' : '')}`}
            onClick={handleCityLeft}
            aria-label="Scroll cities left"
            disabled={(stateToCities[stateList[cityStateIdx]] || []).length <= 3}
          >
            <Image src="/svg/left-arr.svg" alt="Left arrow" width={24} height={24} className='max-md:w-4' />
          </button>
          <div className='flex flex-col items-center'>
            {/* City Images for selected state, with left/right nav, 3 visible at a time */}
            <div className='relative flex flex-col items-center '>
              {/* State Buttons */}
              <div className="flex flex-wrap justify-center mt-10 md:mt-0 gap-3 w-[90vw] md:w-full bg-[#FF4646] items-center rounded-t-2xl py-6">
                {stateList.map((state, idx) => (
                  <button
                    key={state}
                    className={`px-4 md:px-5 py-2 rounded-full font-semibold  ${cityStateIdx === idx ? 'bg-white text-red-600' : 'bg-red-400 text-white'} hover:bg-white/50 duration-200`}
                    onClick={() => setCityStateIdx(idx)}
                  >
                    {state}
                  </button>
                ))}
              </div>
              {/* Desktop: Carousel with nav buttons */}
              <div className='bg-[#FF4646]  flex flex-row items-center gap-4 overflow-hidden rounded-b-2xl h-[30vh] w-[60vw] -mt-2 mb-35 px-2 max-md:hidden transition-all duration-300'>
                {(stateToCities[stateList[cityStateIdx]] || [])
                  .slice(cityScroll, cityScroll + 3)
                  .map((city, index) => (
                    <Image
                      key={index}
                      src={city.img}
                      alt={city.name}
                      width={200}
                      height={150}
                      className='w-[35%] object-cover rounded-lg m-2 duration-300 transition-transform md:w-[35%]'
                    />
                  ))}
              </div>
              {/* Mobile: Horizontal scroll, all cities */}
              <div className='hidden max-md:flex bg-[#FF4646] flex-row items-center gap-2 overflow-x-auto flex-nowrap rounded-b-2xl h-[14vh] w-[90vw] -mt-2 mb-35 px-2 scrollbar-hide'>
                {(stateToCities[stateList[cityStateIdx]] || []).map((city, index) => (
                  <Image
                    key={index}
                    src={city.img}
                    alt={city.name}
                    width={160}
                    height={90}
                    className='w-[40vw] object-cover rounded-lg m-1'
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Right Scroll Button (city) */}
          <button
            className={`mb-auto mt-18 ms-3 hidden md:block cursor-pointer max-md:mt-4 max-md:ms-1 ${((stateToCities[stateList[cityStateIdx]] || []).length <= 3 ? 'opacity-50 cursor-not-allowed' : '')}`}
            onClick={handleCityRight}
            aria-label="Scroll cities right"
            disabled={(stateToCities[stateList[cityStateIdx]] || []).length <= 3}
          >
            <Image src="/svg/right-arr.svg" alt="Right arrow" width={24} height={24} className='max-md:w-4' />
          </button>
        </div>
      </div>

      {/* Section 5 */}
      <div id='clients' className='w-full h-[70vh] bg-red-600 flex flex-col items-center justify-center max-md:h-[30vh]'>
        <h1 className='text-4xl font-black text-white max-md:text-2xl'>Meet Our Happy Clients</h1>
        <div className='h-1 w-[13vw] bg-white/50 rounded-md mx-auto mt-10 max-md:w-[30vw] max-md:mt-4'></div>
        <div className='w-[80vw] h-[25vh] bg-white/50 border-2 mt-10 rounded-2xl flex items-center overflow-hidden relative max-md:w-[99vw] max-md:h-[90px] max-md:mt-4'>
          <div className='flex items-center gap-8 md:gap-12 animate-marquee'>
            {companyLogos.map((logo, logoIndex) => (
              <div
                key={`first-${logoIndex}`}
                className="flex items-center justify-center flex-shrink-0 min-w-[70px] min-h-[70px] md:min-w-[100px] md:min-h-[100px]"
              >
                <Image
                  src={logo}
                  alt={`Company Logo ${logoIndex + 1}`}
                  width={100}
                  height={100}
                  className="object-contain rounded-lg w-full h-full filter brightness-90 hover:brightness-100 transition-all duration-300"
                  draggable={false}
                />
              </div>
            ))}
            {companyLogos.map((logo, logoIndex) => (
              <div
                key={`second-${logoIndex}`}
                className="flex items-center justify-center flex-shrink-0 min-w-[70px] min-h-[70px] md:min-w-[100px] md:min-h-[100px]"
              >
                <Image
                  src={logo}
                  alt={`Company Logo ${logoIndex + 1}`}
                  width={100}
                  height={100}
                  className="object-contain rounded-lg w-full h-full filter brightness-90 hover:brightness-100 transition-all duration-300"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 6 - Videos (Dynamic from Database) */}
      <div className='w-full min-h-[100vh] bg-gradient-to-b flex flex-col items-center from-red-600 to-white relative max-md:min-h-[60vh]' id='videos'>
        <div className='opacity-90  mt-10 absolute mix-blend-lighten'>
          <Image src="/svg/Videos.svg" alt="Videos background" width={800} height={400} className='w-full' />
        </div>
        <div className='z-1 w-full min-h-[40vh] mt-50 flex flex-col items-center justify-center text-center max-md:mt-8'>
          <h1 className='text-4xl font-black text-white max-md:text-2xl'>Videos</h1>

          {/* Loading State */}
          {videosLoading ? (
            <div className="mt-10 text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-sm">Loading videos...</p>
            </div>
          ) : (
            <div className='flex flex-row max-md:gap-1'>
              {/* Left Navigation Button */}
              <button
                className={`mb-auto mt-35 me-3 hidden md:block cursor-pointer max-md:mt-4 max-md:me-1 ${videoCards.length <= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={decVideoNav}
                disabled={videoCards.length <= 3}
              >
                <Image src="/svg/left-arr.svg" alt="Left arrow" width={24} height={24} className='max-md:w-4' />
              </button>

              {/* Videos Container */}
              <div className='w-[70vw] h-[20vh] md:h-[40vh] mt-10 rounded-2xl bg-white/60 flex flex-row px-10 overflow-auto md:overflow-x-hidden gap-6 items-center py-8 scrollbar-hide scroll-smooth max-md:w-[95vw] max-md:mt-4 max-md:px-2 max-md:gap-2 max-md:py-2 mix-blend-normal'>
                {videoCards.length === 0 ? (
                  <div className="w-full text-center text-gray-600">
                    <p className="text-sm md:text-base">No videos available at the moment.</p>
                  </div>
                ) : (
                  videoCards.map((video, idx) => (
                    <div
                      key={idx}
                      className="md:w-[320px] md:h-[240px] bg-black/70 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:scale-105 duration-200 flex flex-col items-center flex-shrink-0 w-[140px] h-[100px] mix-blend-normal"
                      onClick={() => setActiveVideo(video)}
                      style={{
                        transform: videoCards.length > 3 ? `translateX(-${videoNav * 110}%)` : 'translateX(0)'
                      }}
                    >
                      <Image
                        src={video.thumb}
                        alt={video.title}
                        width={320}
                        height={240}
                        className="w-full h-full object-cover mix-blend-normal"
                        onError={handleImageError}
                      />
                      <span className="text-white text-sm font-semibold mt-auto max-md:text-[10px] absolute bottom-2 left-2 right-2 bg-black/50 p-1 rounded text-center">
                        {video.title}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Right Navigation Button */}
              <button
                className={`mb-auto mt-35 ms-3 hidden md:block cursor-pointer max-md:mt-4 max-md:ms-1 ${videoCards.length <= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={incVideoNav}
                disabled={videoCards.length <= 3}
              >
                <Image src="/svg/right-arr.svg" alt="Right arrow" width={24} height={24} className='max-md:w-4' />
              </button>
            </div>
          )}
        </div>

        {/* Video Modal */}
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white/0 rounded-2xl flex flex-col items-center justify-center">
              <button
                className="absolute top-2 right-2 text-white text-3xl font-bold z-10 cursor-pointer"
                onClick={() => setActiveVideo(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <iframe
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                title={activeVideo.title}
                src={activeVideo.src}
                controls
                autoPlay
                className="w-[90vw] max-w-3xl h-[60vh] rounded-2xl shadow-2xl bg-black max-md:h-[30vh]"
                style={{ objectFit: 'contain' }}
              ></iframe>
              <div className="text-white text-lg font-semibold mt-4 text-center drop-shadow max-md:text-xs">{activeVideo.title}</div>
            </div>
          </div>
        )}
      </div>

      {/* Media Coverage Section - Updated to use database */}
      <div className='w-full min-h-[100vh] bg-gradient-to-b from-white to-[#FFF4F4] flex items-center justify-start flex-col relative md:min-h-[100vh]' id='media'>
        <h1 className='text-4xl mb-10 md:mb-0 md:text-6xl text-red-500 font-extrabold mt-30'>Media Coverage</h1>
        
        {/* Loading State */}
        {mediaCoverageLoading ? (
          <div className="mt-10 text-red-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-sm">Loading media coverage...</p>
          </div>
        ) : (
          <div className='w-full h-auto flex flex-col md:flex-row items-center justify-evenly my-auto px-2 sm:px-10 gap-6'>
            {mediaCoverage.length === 0 ? (
              <div className="text-center text-gray-600">
                <p className="text-lg">No media coverage available at the moment.</p>
              </div>
            ) : (
              mediaCoverage.map((item, index) => (
                <div
                  key={item._id}
                  className='w-full md:w-[25vw] h-[40vh] flex flex-col items-start justify-start gap-2 mb-6 md:mb-0 cursor-pointer'
                  onClick={() => setActiveMedia(item)}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={400}
                    height={280}
                    className='w-full h-[70%] object-cover rounded-lg'
                    onError={handleImageError}
                  />
                  <h1 className='text-xl font-bold text-black/70'>{item.title}</h1>
                </div>
              ))
            )}
          </div>
        )}

        {/* Media Modal */}
        {activeMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl p-6 flex flex-col items-center max-w-[90vw] max-h-[90vh]">
              <button
                className="absolute top-2 right-2 text-black text-3xl font-bold z-10 cursor-pointer"
                onClick={() => setActiveMedia(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <Image
                src={activeMedia.imageUrl}
                alt={activeMedia.title}
                width={500}
                height={300}
                className="w-full max-w-[500px] max-h-[60vh] object-contain rounded-lg mb-4"
                onError={handleImageError}
              />
              <h1 className='text-2xl font-bold text-black/80 mb-2'>{activeMedia.title}</h1>
            </div>
          </div>
        )}
      </div>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <div className='w-full min-h-[60vh] bg-[#FFF4F4] flex flex-col items-center justify-center py-16 max-md:py-8'>
          <div className='text-center mb-12 max-md:mb-6'>
            <h1 className='text-4xl font-black text-black/70 max-md:text-2xl mb-4'>Testimonials</h1>
            <h2 className='text-2xl font-bold text-red-500 max-md:text-lg'>HEAR FROM OUR HAPPY CLIENTS</h2>
            <div className='h-1 w-[13vw] bg-red-500/50 rounded-md mx-auto mt-4 max-md:w-[30vw]'></div>
          </div>

          <div className='w-full max-w-6xl mx-auto px-4 relative'>
            {/* Desktop View - 3 Cards with Navigation */}
            <div className='hidden md:block'>
              {/* Navigation Arrows */}
              {testimonials.length > 3 && (
                <>
                  <button
                    onClick={() => setTestimonialStartIndex(prev => prev > 0 ? prev - 3 : Math.max(0, testimonials.length - 3))}
                    className='absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-red-50 transition-all duration-300 hover:scale-110'
                    disabled={testimonialStartIndex === 0}
                  >
                    <FaChevronLeft className={`text-lg ${testimonialStartIndex === 0 ? 'text-gray-300' : 'text-red-500'}`} />
                  </button>
                  <button
                    onClick={() => setTestimonialStartIndex(prev => prev + 3 < testimonials.length ? prev + 3 : 0)}
                    className='absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-red-50 transition-all duration-300 hover:scale-110'
                    disabled={testimonialStartIndex + 3 >= testimonials.length}
                  >
                    <FaChevronRight className={`text-lg ${testimonialStartIndex + 3 >= testimonials.length ? 'text-gray-300' : 'text-red-500'}`} />
                  </button>
                </>
              )}

              {/* Desktop Cards */}
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 px-16'>
                {testimonials.slice(testimonialStartIndex, testimonialStartIndex + 3).map((testimonial, index) => (
                  <div key={testimonial._id} className='bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-red-200'>
                    <div className='flex items-center gap-4 mb-4'>
                      <div className='w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md'>
                        <FaUser className='text-white text-lg' />
                      </div>
                      <div>
                        <h3 className='font-bold text-black/80 text-lg'>{testimonial.name}</h3>
                        <p className='text-sm text-red-600 font-medium'>{testimonial.designation}</p>
                      </div>
                    </div>
                    <p className='text-black/70 text-sm leading-relaxed italic'>"{testimonial.message}"</p>
                  </div>
                ))}
              </div>

              {/* Desktop Dots Indicator */}
              {testimonials.length > 3 && (
                <div className='flex justify-center mt-8 gap-2'>
                  {Array.from({ length: Math.ceil(testimonials.length / 3) }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setTestimonialStartIndex(index * 3)}
                      className={`h-3 rounded-full transition-all duration-300 ${Math.floor(testimonialStartIndex / 3) === index
                        ? 'bg-red-500 w-8'
                        : 'bg-red-300 w-3 hover:bg-red-400'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Mobile View - Single Card with Navigation */}
            <div className='md:hidden'>
              <div className='relative'>
                {/* Mobile Navigation Arrows */}
                {testimonials.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentTestimonial(prev => prev > 0 ? prev - 1 : testimonials.length - 1)}
                      className='absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-red-50 transition-all duration-300'
                    >
                      <FaChevronLeft className='text-red-500' />
                    </button>
                    <button
                      onClick={() => setCurrentTestimonial(prev => prev < testimonials.length - 1 ? prev + 1 : 0)}
                      className='absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-red-50 transition-all duration-300'
                    >
                      <FaChevronRight className='text-red-500' />
                    </button>
                  </>
                )}

                {/* Mobile Card */}
                <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-lg mx-4 border border-red-200'>
                  <div className='flex items-center gap-4 mb-4'>
                    <div className='w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md'>
                      <FaUser className='text-white text-lg' />
                    </div>
                    <div>
                      <h3 className='font-bold text-black/80 text-lg'>{testimonials[currentTestimonial]?.name}</h3>
                      <p className='text-sm text-red-600 font-medium'>{testimonials[currentTestimonial]?.designation}</p>
                    </div>
                  </div>
                  <p className='text-black/70 text-sm leading-relaxed italic'>"{testimonials[currentTestimonial]?.message}"</p>
                </div>
              </div>

              {/* Mobile Dots Indicator */}
              {testimonials.length > 1 && (
                <div className='flex justify-center mt-6 gap-2'>
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`h-3 rounded-full transition-all duration-300 ${index === currentTestimonial
                        ? 'bg-red-500 w-8'
                        : 'bg-red-300 w-3 hover:bg-red-400'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section 7 */}
      <div className='w-full min-h-[100vh] bg-gradient-to-b from-[#FFF4F4] to-white mb-10 flex items-center justify-center max-md:min-h-[60vh]' id='contact-us'>
        <div className='w-[100%] mb-auto text-center'>
          <span className='flex flex-col items-center gap-2 mt-23 max-md:mt-8'>
            <h1 className='text-4xl font-extrabold text-black/70 max-md:text-xl'><span className='text-red-500/80'>Connect</span> With Us!</h1>
          </span>
          <div className='h-[90vh] w-[80%] mx-auto flex flex-row items-center justify-center mt-8 bg-[#E2CFCF] rounded-4xl max-lg:flex-col md:h-[70vh]  max-md:w-[98vw] max-md:mt-4'>
            <div className='w-[100%] h-full flex flex-col p-5 items-center justify-center text-start bg-red-500 rounded-4xl mx-auto md:mx-0 me-auto lg:w-[35%] max-lg:mb-4 max-md:p-2'>
              <h1 className='text-lg text-white font-extrabold max-md:text-base'>What can JMD Advertisement help you with?</h1>
              <div className='h-[3px] w-[13vw] bg-white rounded-md me-auto mt-6 max-md:w-[30vw] max-md:mt-2'></div>
              <p className='mt-10 tracking-wide max-md:mt-4 max-md:text-xs text-white'>Whether you're launching a new product, boosting brand awareness, or driving local footfall — JMD Advertisement helps you connect with your audience through impactful outdoor media. From strategic billboard placements to dynamic transit advertising, we make sure your message is seen, remembered, and acted upon.</p>
            </div>
            <div className='w-[65%] h-full flex flex-col items-center text-black/80 justify-center ps-15 mt-6 p-5 max-lg:w-[90%] max-lg:mt-0 max-md:p-2'>
              <p className='text-[10px] me-auto mb-auto'>*Please fill all the details</p>
              <div className='w-[90%] mb-auto me-auto'>
                <form onSubmit={handleSubmit}>
                  <span className='flex flex-col items-center gap-2 mb-4'>
                    <label htmlFor="name" className='me-auto'>Name</label>
                    <input type="text" name='name' id='name' className='me-auto w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='Full Name' value={form.name} onChange={handleFormChange} />
                  </span>
                  <span className='flex items-center gap-2 mb-4 flex-row max-md:gap-1'>
                    <span className='flex flex-col items-center gap-2'>
                      <label htmlFor="email" className='me-auto'>Email</label>
                      <input type="email" name='email' id='email' className='me-auto w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='email' value={form.email} onChange={handleFormChange} />
                    </span>
                    <span className='flex flex-col items-center gap-2 ms-6 max-md:ms-0'>
                      <label htmlFor="phone" className='me-auto'>Phone</label>
                      <input type="text" name='phone' id='phone' className='me-auto w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='01 2345 6789' value={form.phone} onChange={handleFormChange} />
                    </span>
                  </span>
                  <span className='flex flex-col items-center gap-2 mb-2'>
                    <label htmlFor="message" className='me-auto'>Message</label>
                    <textarea rows={1} type="text" name='message' id='message' className='resize-none max-h-40 overflow-y-auto rows-5 me-auto w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='Your message' value={form.message} onChange={handleFormChange} />
                  </span>
                  <span className='flex flex-row justify-between items-center gap-2 mt-8 max-md:flex-col max-md:gap-2 max-md:mt-4'>
                    <span className='flex flex-row items-center gap-2'>
                      <input type="checkbox" name='callback' id='checkbox' checked={form.callback} onChange={handleFormChange} />
                      <label htmlFor="checkbox" className='me-auto'>Request Callback</label>
                    </span>
                    <button className='me-12 bg-red-500 px-9 py-3 text-white font-bold text-lg rounded-lg cursor-pointer hover:bg-red-800 duration-200 max-md:me-0 max-md:px-4 max-md:py-2 max-md:text-base' type='submit' disabled={submitting}>
                      {submitting ? "Sending..." : "Send Message"}
                    </button>
                    .
                  </span>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google map */}
      <div className='w-[80vw] h-[400px] mx-auto mb-50'>
        <h1 className='text-4xl font-extrabold text-black/70 text-center mb-6'>Our Office <span className='text-red-500'>Location</span></h1>
        <div className='border-2 border-red-500'>
          <GoogleMap
            coordinates={officeCordinates}
          />
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Contact Info Expanded Panel */}
        {isContactExpanded && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-80 max-w-[90vw] border border-gray-200 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">Contact Us</h3>
              <button
                onClick={() => setIsContactExpanded(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
                aria-label="Close contact info"
              >
                ×
              </button>
            </div>

            {/* Phone Numbers */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FaPhone className="text-blue-500 text-sm rotate-90" />
                <span className="font-semibold text-gray-700 text-sm">Call Us:</span>
              </div>
              {contactInfo.phones.map((phone, index) => (
                <a
                  key={index}
                  href={`tel:${phone}`}
                  className="block text-blue-600 hover:text-blue-800 text-sm pl-6 mb-1 hover:underline"
                >
                  {phone}
                </a>
              ))}
            </div>

            {/* Email */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FaEnvelope className="text-green-500 text-sm" />
                <span className="font-semibold text-gray-700 text-sm">Email Us:</span>
              </div>
              <a
                href={`mailto:${contactInfo.email}`}
                className="block text-green-600 hover:text-green-800 text-sm pl-6 hover:underline"
              >
                {contactInfo.email}
              </a>
            </div>

            {/* Address */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaMapMarkerAlt className="text-red-500 text-sm" />
                <span className="font-semibold text-gray-700 text-sm">Visit Us:</span>
              </div>
              <p className="text-gray-600 text-sm pl-6 leading-relaxed">
                {contactInfo.address}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Contact Button */}
          <button
            onClick={() => setIsContactExpanded(!isContactExpanded)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${isContactExpanded
              ? 'bg-gray-600 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            aria-label="Contact information"
          >
            {isContactExpanded ? (
              <span className="text-xl">×</span>
            ) : (
              <FaPhone className="text-lg rotate-90" />
            )}
          </button>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/917520212222?text=I%20visited%20your%20website.%0Aplease%20share%20your%20media%20plan%20for"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full flex items-center justify-center"
            aria-label="Chat on WhatsApp"
          >
            <FaWhatsapp className="text-green-500 text-4xl w-14 h-14 hover:text-green-600 hover:scale-105 duration-30 shadow-lg" />
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Home;