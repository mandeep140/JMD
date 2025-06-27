"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { FaWhatsappSquare } from "react-icons/fa";

const Home = () => {
  const [imgnav, setImgnav] = useState(0);
  const [citynav, setCitynav] = useState(0);
  const [companiesnav, setCompaniesnav] = useState(0);
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

  // Auto-shuffle effect for mobile carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setMobileCardIndex(prev => (prev >= serviceCards.length - 1) ? 0 : prev + 1);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle video loading and looping for mobile
  const handleVideoLoad = (e) => {
    const video = e.target;
    video.currentTime = 0;
    
    // Force restart when video ends (especially for mobile)
    const handleVideoEnd = () => {
      video.currentTime = 0;
      video.play().catch(err => console.log('Video play failed:', err));
    };
    
    video.addEventListener('ended', handleVideoEnd);
    
    // Cleanup function
    return () => {
      video.removeEventListener('ended', handleVideoEnd);
    };
  };

  // Ensure video plays properly on mobile
  useEffect(() => {
    const video = document.querySelector('video');
    if (video) {
      // Force play on mobile after component mounts
      const playVideo = () => {
        video.play().catch(err => {
          console.log('Autoplay prevented, will play on user interaction');
        });
      };
      
      // Small delay to ensure video is loaded
      setTimeout(playVideo, 100);
      
      // Handle visibility change (when user switches tabs)
      const handleVisibilityChange = () => {
        if (!document.hidden && video.paused) {
          video.play().catch(err => console.log('Play on visibility change failed'));
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  const serviceCards = [
    { title: "Hoardings", link: "/find-hoardings?type=billboard#results", image: "/images/billboard.png" },
    { title: "Digital Hoardings", link: "/find-hoardings?type=digital_billboard#results", image: "/images/digital_billboard.png" },
    { title: "transit media", link: "/find-hoardings?type=transit_media#results", image: "/images/transit_media.png" },
    { title: "Airport Branding", link: "/find-hoardings?type=airport_branding#results", image: "/images/airport_branding.png" },
    { title: "Mall Media", link: "/find-hoardings?type=mall_media#results", image: "/images/mall_media.png" }
  ];

  const s3cards = [
    { img: "/svg/city.svg", text: "Prime Locations Across Major Cities" },
    { img: "/svg/targeted.svg", text: "High Footfall & Targeted Reach" },
    { img: "/svg/ete.svg", text: "End-To-End Campaign Execuation and Support" },
  ];

  const location = [
    "/images/location/l1.png", "/images/location/l2.png", "/images/location/l3.png", "/images/location/l4.png", "/images/location/l5.png",
    "/images/location/l6.png", "/images/location/l7.png", "/images/location/l8.png", "/images/location/l9.png", "/images/location/l10.png",
    "/images/location/l11.png", "/images/location/l12.png", "/images/location/l13.png", "/images/location/l14.png", "/images/location/l15.png",
    "/images/location/l16.png", "/images/location/l17.png", "/images/location/l18.png", "/images/location/l19.png"
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

  const videoCards = [
    { src: "https://www.youtube.com/embed/9b1QFyFrYY4?si=_61RW6F4228we0F3", thumb: "https://img.youtube.com/vi/9b1QFyFrYY4/maxresdefault.jpg", title: "What does an ad agency do?" },
    { src: "https://www.youtube.com/embed/ysLRUcCHIiw?si=RGwNm13OE6UnWI3d", thumb: "https://img.youtube.com/vi/ysLRUcCHIiw/maxresdefault.jpg", title: "10 benifits of outdoor advertisement" },
    { src: "https://www.youtube.com/embed/B83CpMCgPL0?si=2xeDuZd7SheplUB3", thumb: "https://img.youtube.com/vi/B83CpMCgPL0/maxresdefault.jpg", title: "what is outdoor advertisement" },
    { src: "https://www.youtube.com/embed/fi0gxvSUNZw?si=wMOVJaUDkDF7pl0S", thumb: "/images/about/bg.png", title: "the power of out-of-home advertisement" },
  ];

  const media = [
    {img: '/images/award.jpg', title: 'Buiness Multiplier Award', date: 'June 2024'},
    {img: '/images/outdoor.jpg', title: 'Outdoor Asia Magazine', date: 'June 2025'},
    {img: '/images/magazine.jpg', title: 'Outdoor Asia Magazine', date: ''},
  ]

  const incImgNav = () => {
    if (imgnav >= serviceCards.length - 3) {
      setImgnav(0);
    } else {
      setImgnav(imgnav + 1);
    }
  }
  const decImgNav = () => {
    if (imgnav == 0) {
      setImgnav(serviceCards.length - 3);
    } else {
      setImgnav(imgnav - 1);
    }
  }

  const incCityNav = () => {
    if (citynav >= location.length - 1) {
      setCitynav(0);
    } else {
      setCitynav(citynav + 1);
    }
  }
  const decCityNav = () => {
    if (citynav == 0) {
      setCitynav(location.length - 1);
    } else {
      setCitynav(citynav - 1);
    }
  }

  const incVideoNav = () => {
    if (videoNav >= videoCards.length - 3) {
      setVideoNav(0);
    }
    else {
      setVideoNav(videoNav + 1);
    }
  }
  const decVideoNav = () => {
    if (videoNav == 0) {
      setVideoNav(videoCards.length - 3);
    } else {
      setVideoNav(videoNav - 1);
    }
  }
  
  // Removed auto-scroll for companies since we're using CSS marquee animation

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
    form.callback = form.callback ? "yes" : "no"
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

  return (
    <>
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
              // Prevent video from getting stuck at the end
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
            <img src="svg/Rectangle.svg" alt="" className='max-md:w-auto' />
            <span>
              <h1 className='max-md:text-xs'>Trusted By India's Top Brands</h1>
              <h1 className='max-md:text-xs'>To Deliver Maximun Impact.</h1>
            </span>
          </span>
          <span className='flex items-center gap-4 mt-6 text-lg font-semibold md:gap-2 md:mt-3 md:text-base'>
            <Link href="find-hoardings" className="relative group overflow-hidden flex gap-8 border-2 rounded-4xl px-4 py-2 hover:border-red-500 duration-200 md:gap-6 md:px-10  md:py-3 md:text-xl">
              <span className="absolute inset-0 bg-white scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 z-0"></span>
              <span className="relative z-10 text-white group-hover:text-red-500 transition-colors duration-300">Find Hoardings</span>
              <img src="svg/Arrow.svg" alt="Arrow svg" className="relative z-10 max-md:w-4" />
            </Link>
            <a href="#contact-us" className='scale-80 hover:scale-100 duration-100'><img src="svg/dialer.svg" alt="" className='w-12 md:w-15' /></a>
          </span>
        </div>
      </div>

      {/* Section 2 */}
      <div className='w-full min-h-[90vh] -mt-20 bg-red-600 backdrop-blur-lg flex items-center justify-center relative lg:min-h-[100vh] md:min-h-[95vh]' id='services'>
        <div className='text-white w-full h-[30vh] pt-10 md:pt-15 text-center absolute top-20 max-lg:top-8 max-md:top-4'>
          <h1 className='text-6xl font-black tracking-tight max-lg:text-4xl max-md:text-3xl'>Our Services</h1>
          <h1 className='text-xs mt-2 font-light tracking-wide max-md:text-[12px]'>Choose from below to deliver advertisements in a truly <br /> exciting, innovative and creative way.</h1>
          <div className='h-1 w-[13vw] bg-white/50 rounded-md mx-auto mt-10 max-md:w-[30vw] max-md:mt-4'></div>
        </div>
        
        {/* Desktop Service Cards */}
        <div className="hidden md:flex flex-nowrap items-start justify-center gap-4 mt-20 md:mt-70 max-lg:mt-16 px-4 max-w-6xl mx-auto">
          {serviceCards.map((card, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`w-[240px] h-[320px] flex flex-col items-center justify-center overflow-hidden bg-white backdrop-blur-lg rounded-2xl hover:scale-110 duration-300 shadow-md hover:shadow-2xl transition-all cursor-pointer flex-shrink-0 ${
                hoveredCard !== null && hoveredCard !== index 
                  ? 'opacity-40 scale-95' 
                  : 'opacity-100 scale-100'
              }`}
            >
              <img src={card.image} alt={card.title} className="w-full h-3/5 object-cover" />
              <div className="p-4 text-center flex flex-col items-center justify-center h-2/5">
                <h1 className="font-bold text-black/70 text-lg mb-3">{card.title}</h1>
                <Link href={card.link} className="text-black/70 hover:text-black flex items-center justify-center gap-2 text-sm duration-200">
                  Learn More <img src="svg/black_arrow.svg" alt="Arrow svg" className='w-3' />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden w-full flex items-center justify-center mt-40 px-6">
          <div className="w-full max-w-sm">
            {/* Single Card Display */}
            <div className="relative w-full">
              {serviceCards.map((card, index) => (
                <div
                  key={index}
                  className={`w-full transition-all duration-700 ease-out transform ${
                    index === mobileCardIndex 
                      ? 'block opacity-100 translate-x-0 scale-100' 
                      : 'hidden opacity-0 translate-x-4 scale-95'
                  }`}
                >
                  <div className="w-full bg-white backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden">
                    <img src={card.image} alt={card.title} className="w-full h-48 object-cover" />
                    <div className="w-full p-6 text-center">
                      <h1 className="font-bold text-black/70 text-xl mb-4">{card.title}</h1>
                      <Link href={card.link} className="text-black/70 hover:text-black flex items-center justify-center gap-2 text-base duration-300 hover:scale-105">
                        Learn More <img src="svg/black_arrow.svg" alt="Arrow svg" className='w-4' />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 gap-3">
              {serviceCards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setMobileCardIndex(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === mobileCardIndex 
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
        {/* left part */}
        <div className='w-[50vw] me-auto mb-auto text-center max-lg:w-full max-lg:mb-0'>
          <span className='flex flex-col items-center gap-0 md:gap-2 mt-25 max-md:mt-'>
            <h1 className='text-5xl font-black text-black max-lg:text-3xl max-md:text-3xl'>Why To Choose</h1>
            <h1 className='text-4xl font-extrabold text-black max-lg:text-2xl max-md:text-lg'><span className='text-red-500'>JMD Advertisement</span>?</h1>
          </span>
          <div className='h-[15vh] w-full flex items-center justify-center mt-8 bg-red-600 md:rounded-e-2xl lg:h-[35vh] md:h-[25vh] md:mt-4'>
            <p className='px-10 md:ms-18 md:text-start  text-[17px] tracking-wide font-light max-lg:px-4 max-md:px-2 max-md:text-xs text-white'>At JMD, we’re not just another outdoor advertising company. We are your strategic partner in putting your brand in front of millions — right where it can’t be missed. Our approach blends location intelligence, bold creative execution, and proven reach to deliver unmatched visibility.</p>
          </div>
          <div className='flex items-center justify-center px-2 md:px-0 gap-4 mt-7 md:ms-8 max-lg:gap-2 max-lg:mt-3 '>
            {s3cards.map((item, index) => (
              <div key={index} className='flex flex-col items-center gap-2 rounded-lg w-[12vw] h-[20vh] bg-white hover:scale-105 duration-200 shadow-lg hover:shadow-xl transition-transform max-lg:w-[25vw] lg:h-[25vh] max-md:w-[32vw] md:h-[20vh]'>
                <span className='flex items-center justify-center w-full h-[60%] rounded-t-lg bg-red-500'>
                  <img src={item.img} alt={item.text} className='w-16 h-16 max-lg:w-10 max-lg:h-10 max-md:w-7 max-md:h-7' />
                </span>
                <h1 className='mx-3 text-xs text-black/70 max-md:text-[10px]'>{item.text}</h1>
              </div>
            ))}
          </div>
        </div>
        {/* right part */}
        <div className='w-[60vw] ms-auto mb-auto flex items-center justify-center max-lg:w-full max-lg:justify-center'>
          <img src="svg/billboard.svg" alt="" className='h-[100%] w-[80%] object-cover rounded-2xl mt-16 ms-10 lg:h-[] lg:w-[] max-lg:mt-1' />
        </div>
      </div>
      <div className='w-full h-[20vh] bg-red-400 rounded-t-[100%] -mt-1 md:-mt-43 max-lg:h-[10vh] max-md:h-[6vh]'></div>

      {/* Section 4 */}
      <div className='w-full min-h-[100vh] bg-[#FFF4F4]  flex flex-col items-center justify-center relative max-md:min-h-[60vh]' id='city'>
        <div className='w-full h-[30%] mt-35 mb-auto flex flex-col items-center justify-center text-center z-1  max-md:mt-8'>
          <h1 className='text-red-500 text-4xl font-black max-md:text-3xl'>Explore Your City Listing</h1>
          <p className='text-black/70 tracking-wide mt-4 w-[30%] max-md:w-[80%] max-md:text-xs'>Discover premium outdoor ad spaces across India's major cities and boost your brand visibility where it matters most.</p>
        </div>
        <div className='z-1 flex flex-row items-center justify-center gap-4 max-md:gap-1'>
          <button className='mb-auto mt-18 me-3 hidden md:block cursor-pointer max-md:mt-4 max-md:me-1' onClick={decCityNav}><img src="svg/left-arr.svg" alt="" className='max-md:w-4' /></button>
          <div className='bg-[#FF4646] border-red border-1 flex flex-row items-center gap-4 overflow-auto md:overflow-hidden rounded-2xl h-[30vh] w-[60vw] -mt-10 mb-35 px-2 max-md:h-[14vh] max-md:w-[90vw] max-md:gap-2'>
            {location.map((loc, index) => (
              <img key={index} src={loc} alt={`Location ${index + 1}`} className='w-[35%] object-cover rounded-lg m-2 duration-200 transition-transform md:w-[35%] max-md:m-1' style={{ transform: `translateX(-${citynav * 110}%)` }} />
            ))}
          </div>
          <button className='mb-auto mt-18 ms-3 hidden md:block cursor-pointer max-md:mt-4 max-md:ms-1' onClick={incCityNav}><img src="svg/right-arr.svg" alt="" className='max-md:w-4' /></button>
        </div>
      </div>

      {/* Section 5 */}
      <div id='clients' className='w-full h-[70vh] bg-red-600 flex flex-col items-center justify-center max-md:h-[30vh]'>
        <h1 className='text-4xl font-black text-white max-md:text-2xl'>Meet Our Happy Clients</h1>
        <div className='h-1 w-[13vw] bg-white/50 rounded-md mx-auto mt-10 max-md:w-[30vw] max-md:mt-4'></div>
        
        {/* Seamless Marquee Container */}
        <div className='w-[80vw] h-[25vh] bg-white/50 border-2 mt-10 rounded-2xl flex items-center overflow-hidden relative max-md:w-[99vw] max-md:h-[90px] max-md:mt-4'>
          {/* Marquee Track */}
          <div className='flex items-center gap-8 md:gap-12 animate-marquee'>
            {/* First Set of Logos */}
            {companyLogos.map((logo, logoIndex) => (
              <div
                key={`first-${logoIndex}`}
                className="flex items-center justify-center flex-shrink-0 min-w-[70px] min-h-[70px] md:min-w-[100px] md:min-h-[100px]"
              >
                <img
                  src={logo}
                  alt={`Company Logo ${logoIndex + 1}`}
                  className="object-contain rounded-lg w-full h-full filter brightness-90 hover:brightness-100 transition-all duration-300"
                  draggable={false}
                />
              </div>
            ))}
            {/* Duplicate Set for Seamless Loop */}
            {companyLogos.map((logo, logoIndex) => (
              <div
                key={`second-${logoIndex}`}
                className="flex items-center justify-center flex-shrink-0 min-w-[70px] min-h-[70px] md:min-w-[100px] md:min-h-[100px]"
              >
                <img
                  src={logo}
                  alt={`Company Logo ${logoIndex + 1}`}
                  className="object-contain rounded-lg w-full h-full filter brightness-90 hover:brightness-100 transition-all duration-300"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 6 */}
        <div className='w-full min-h-[100vh] bg-gradient-to-b flex flex-col items-center from-red-600 to-white relative max-md:min-h-[60vh]' id='videos'>
          <div className='opacity-90  mt-10 absolute mix-blend-lighten'>
            <img src="svg/Videos.svg" className='w-full' alt="" />
          </div>
          <div className='z-1 w-full min-h-[40vh] mt-50 flex flex-col items-center justify-center text-center max-md:mt-8'>
            <h1 className='text-4xl font-black text-white max-md:text-2xl'>Videos</h1>
            <div className='flex flex-row max-md:gap-1'>
          <button className='mb-auto mt-35 me-3 hidden md:block cursor-pointer max-md:mt-4 max-md:me-1' onClick={decVideoNav}><img src="svg/left-arr.svg" alt="" className='max-md:w-4' /></button>
          <div className='w-[70vw] h-[20vh] md:h-[40vh] mt-10 rounded-2xl bg-white/60 flex flex-row px-10 overflow-auto md:overflow-x-hidden gap-6 items-center py-8 scrollbar-hide scroll-smooth max-md:w-[95vw] max-md:mt-4 max-md:px-2 max-md:gap-2 max-md:py-2 mix-blend-normal'>
            {videoCards.map((video, idx) => (
              <div
            key={idx}
            className="md:w-[320px] md:h-[240px] bg-black/70 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:scale-105 duration-200 flex flex-col items-center flex-shrink-0 w-[140px] h-[100px] mix-blend-normal"
            onClick={() => setActiveVideo(video)}
            style={{ transform: `translateX(-${videoNav * 110}%)` }}
              >
            <img src={video.thumb} alt={video.title} className="w-full h-full object-cover mix-blend-normal" />
            <span className="text-white text-sm font-semibold mt-auto max-md:text-[10px]">{video.title}</span>
              </div>
            ))}
          </div>
          <button className='mb-auto mt-35 ms-3 hidden md:block cursor-pointer max-md:mt-4 max-md:ms-1' onClick={incVideoNav}><img src="svg/right-arr.svg" alt="" className='max-md:w-4' /></button>
            </div>
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

      {/* Media section */}
      <div className='w-full min-h-[100vh] bg-gradient-to-b from-white to-[#FFF4F4] flex items-center justify-start flex-col relative md:min-h-[100vh]' id='media'>
        <h1 className='text-4xl mb-10 md:mb-0 md:text-6xl text-red-500 font-extrabold mt-30'>Media Coverage</h1>
        <div className='w-full h-auto flex flex-col md:flex-row items-center justify-evenly my-auto px-2 sm:px-10 gap-6'>
          {media.map((item, index) => (
            <div
              key={index}
              className='w-full md:w-[25vw] h-[40vh] flex flex-col items-start justify-start gap-2 mb-6 md:mb-0 cursor-pointer'
              onClick={() => setActiveMedia(item)}
            >
              <img
                src={item.img}
                alt={`Media Image ${index + 1}`}
                className='w-full h-[70%] object-cover rounded-lg'
              />
              <h1 className='text-xl font-bold text-black/70'>{item.title}</h1>
              <p className='text-sm text-black/50'>{item.date}</p>
            </div>
          ))}
        </div>

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
              <img
                src={activeMedia.img}
                alt={activeMedia.title}
                className="w-full max-w-[500px] max-h-[60vh] object-contain rounded-lg mb-4"
              />
              <h1 className='text-2xl font-bold text-black/80 mb-2'>{activeMedia.title}</h1>
              <p className='text-base text-black/60'>{activeMedia.date}</p>
            </div>
          </div>
        )}
      </div>

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
              <p className='mt-10 tracking-wide max-md:mt-4 max-md:text-xs text-white'>Whether you’re launching a new product, boosting brand awareness, or driving local footfall — JMD Advertisement helps you connect with your audience through impactful outdoor media. From strategic billboard placements to dynamic transit advertising, we make sure your message is seen, remembered, and acted upon.</p>
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
                  </span>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/919910564908?text=Hi%2C%20I%20want%20to%20enquire%20about%20your%20ads"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50"
        style={{ fontSize: "3.5rem", color: "#25D366" }}
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsappSquare />
      </a>
    </>
  )
}

export default Home