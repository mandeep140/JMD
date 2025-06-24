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
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    callback: true,
  });
  const [submitting, setSubmitting] = useState(false);

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
  useEffect(() => {
    const interval = setInterval(() => {
      setCompaniesnav((prev) =>
        prev + 2 >= companyLogos.length ? 0 : prev + 2
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

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
      <div className='h-[110vh] w-full relative lg:h-[120vh]'>
        <div className='absolute z-[-1] w-full h-full'>
          <video src="/videos/lander_bg.mp4" className='w-full h-full object-cover' autoPlay muted loop></video>
        </div>
        <div className='w-[40vw] absolute top-44 pt-50 md:pt-0 left-31 text-white max-lg:w-[70vw] max-lg:top-24 max-lg:left-6 max-md:w-[90vw] max-md:top-16 max-md:left-2'>
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
      <div className='w-full min-h-[80vh] -mt-4 bg-red-500 backdrop-blur-lg flex items-center justify-center relative lg:min-h-[110vh] md:min-h-[90vh]' id='services'>
        <div className='text-white w-full h-[30vh] pt-10 md:pt-0 text-center absolute top-20 max-lg:top-8 max-md:top-4'>
          <h1 className='text-6xl font-extrabold tracking-tight max-lg:text-4xl max-md:text-2xl'>Our Services</h1>
          <h1 className='text-xs mt-2 font-thin tracking-wide max-md:text-[10px]'>Choose from below to deliver advertisements in a truly <br /> exciting, innovative and creative way.</h1>
          <div className='h-1 w-[13vw] bg-white/50 rounded-md mx-auto mt-10 max-md:w-[30vw] max-md:mt-4'></div>
          <div className='items-center justify-center gap-2 mt-6 border-2 hidden md:flex border-white/50 rounded-full w-fit ms-auto me-[10vw] px-4 py-1 hover:border-white duration-150 max-md:gap-1 max-md:px-2 max-md:py-0.5'>
            <button onClick={decImgNav} className='cursor-pointer text-lg max-md:text-base'> <FaArrowLeft /> </button>|
            <button onClick={incImgNav} className='cursor-pointer text-lg max-md:text-base'> <FaArrowRight /> </button>
          </div>
        </div>
        <div className="w-full md:w-[85vw] h-[25vh] md:h-[50vh] flex flex-row flex-nowrap items-center bg-white/30 backdrop-blur-lg border-y-1 md:border-s-1 md:rounded-s-4xl p-10 mt-20 md:mt-70 ms-auto gap-6 overflow-auto md:overflow-hidden scrollbar-hide scroll-smooth max-lg:p-4 max-md:p-2">
          {serviceCards.map((card, index) => (
            <div
              key={index}
              style={{ transform: `translateX(-${imgnav * 120}%)` }}
              className="min-w-[250px] w-[20vw] h-[20vh] flex flex-col items-center justify-center overflow-hidden bg-white backdrop-blur-lg rounded-2xl hover:scale-105 duration-200 shadow-lg hover:shadow-xl transition-transform max-lg:min-w-[180px] max-lg:w-[30vw] lg:h-[33vh] md:w-[120px] max-md:w-[40vw] md:h-[15vh]"
            >
              <img src={card.image} alt={card.title} className="w-[104%] h-3/5 object-cover mb-4 -mt-10 lg:h-3/4 md:h-2/5" />
              <h1 className="font-bold text-black/70 max-md:text-xs">{card.title}</h1>
              <Link href={card.link} className="mt-4 text-black/70 hover:text-black flex items-center gap-2 text-sm duration-100 max-md:text-xs max-md:mt-1">
                Learn More <img src="svg/black_arrow.svg" alt="Arrow svg" className='max-md:w-3' />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 */}
      <div className='w-full h-[110vh] md:min-h-[100vh] bg-[#FFF4F4] flex items-center justify-center flex-row max-lg:flex-col max-lg:gap-8 max-md:min-h-[60vh]'>
        {/* left part */}
        <div className='w-[50vw] me-auto mb-auto text-center max-lg:w-full max-lg:mb-0'>
          <span className='flex flex-col items-center gap-2 mt-23 max-md:mt-8'>
            <h1 className='text-5xl font-extrabold text-black max-lg:text-3xl max-md:text-xl'>Why To Choose</h1>
            <h1 className='text-4xl font-extrabold text-black max-lg:text-2xl max-md:text-lg'><span className='text-red-500'>JMD Advertisement</span>?</h1>
          </span>
          <div className='h-[15vh] w-full flex items-center justify-center mt-8 bg-red-500 md:rounded-e-2xl lg:h-[35vh] md:h-[25vh] md:mt-4'>
            <p className='px-10 md:ms-18 md:text-start  text-[17px] tracking-wide font-extralight max-lg:px-4 max-md:px-2 max-md:text-xs text-white'>At JMD, we’re not just another outdoor advertising company. We are your strategic partner in putting your brand in front of millions — right where it can’t be missed. Our approach blends location intelligence, bold creative execution, and proven reach to deliver unmatched visibility.</p>
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
        <div className='w-[50vw] ms-auto mb-auto flex items-center justify-center max-lg:w-full max-lg:justify-center'>
          <img src="svg/billboard.svg" alt="" className='h-[100%] w-[70%] object-cover rounded-2xl mt-20 ms-17 lg:h-[100vh] lg:w-[40vw] max-lg:mt-4' />
        </div>
      </div>
      <div className='w-full h-[20vh] bg-red-400 rounded-t-[100%] -mt-30 md:-mt-20 max-lg:h-[10vh] max-md:h-[6vh]'></div>

      {/* Section 4 */}
      <div className='w-full min-h-[100vh] bg-[#FFF4F4] flex flex-col items-center justify-center relative max-md:min-h-[60vh]' id='city'>
        <div className='w-full h-[30%] mt-25 mb-auto flex flex-col items-center justify-center text-center z-1 max-md:mt-8'>
          <h1 className='text-red-500 text-4xl font-extrabold max-md:text-xl'>Explore Your City Listing</h1>
          <p className='text-black/70 tracking-wide mt-4 w-[30%] max-md:w-[80%] max-md:text-xs'>Discover premium outdoor ad spaces across India's major cities and boost your brand visibility where it matters most.</p>
        </div>
        <div className='z-1 flex flex-row items-center justify-center gap-4 max-md:gap-1'>
          <button className='mb-auto mt-18 me-3 hidden md:block cursor-pointer max-md:mt-4 max-md:me-1' onClick={decCityNav}><img src="svg/left-arr.svg" alt="" className='max-md:w-4' /></button>
          <div className='bg-[#FF4646] border-red border-1 flex flex-row items-center gap-4 overflow-auto md:overflow-hidden rounded-2xl h-[32vh] w-[60vw] mb-35 px-2 max-md:h-[14vh] max-md:w-[90vw] max-md:gap-2'>
            {location.map((loc, index) => (
              <img key={index} src={loc} alt={`Location ${index + 1}`} className='w-[35%] object-cover rounded-lg m-2 duration-200 transition-transform md:w-[35%] max-md:m-1' style={{ transform: `translateX(-${citynav * 110}%)` }} />
            ))}
          </div>
          <button className='mb-auto mt-18 ms-3 hidden md:block cursor-pointer max-md:mt-4 max-md:ms-1' onClick={incCityNav}><img src="svg/right-arr.svg" alt="" className='max-md:w-4' /></button>
        </div>
      </div>

      {/* Section 5 */}
      <div id='clients' className='w-full h-[70vh] bg-red-500 flex flex-col items-center justify-center max-md:h-[30vh]'>
        <h1 className='text-4xl font-extrabold text-white max-md:text-xl'>Meet Our Happy Clients</h1>
        <div className='h-1 w-[13vw] bg-white/50 rounded-md mx-auto mt-10 max-md:w-[30vw] max-md:mt-4'></div>
        <div className='w-[80vw] h-[25vh] bg-white/50 border-2 mt-10 rounded-2xl ps-10 flex items-center justify-start overflow-hidden flex-row gap-6 scrollbar-hide scroll-smooth relative max-md:w-[99vw] max-md:ps-1 max-md:h-[90px] md:gap-8 max-md:mt-4'>
          {companyLogos.map((logo, logoIndex) =>
            <div
              key={logoIndex}
              className="flex items-center justify-center
                min-w-[70px] min-h-[70px]
                md:min-w-[100px] md:min-h-[100px]"
              style={{
                transform: `translateX(-${companiesnav * 110}%)`,
                transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)"
              }}
            >
              <img
                src={logo}
                alt={`Company Logo ${logoIndex + 1}`}
                className="object-contain rounded-lg w-full h-full"
                draggable={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Section 6 */}
      <div className='w-full min-h-[100vh] bg-gradient-to-b flex flex-col items-center from-red-500 to-white relative max-md:min-h-[60vh]' id='videos'>
        <div className='opacity-40 absolute'>
          <img src="svg/Videos.svg" className='w-full' alt="" />
        </div>
        <div className='z-1 w-full min-h-[40vh] mt-30 flex flex-col items-center justify-center text-center max-md:mt-8'>
          <h1 className='text-4xl font-extrabold text-white max-md:text-xl'>Videos</h1>
          <div className='flex flex-row max-md:gap-1'>
            <button className='mb-auto mt-35 me-3 hidden md:block cursor-pointer max-md:mt-4 max-md:me-1' onClick={decVideoNav}><img src="svg/left-arr.svg" alt="" className='max-md:w-4' /></button>
            <div className='w-[70vw] h-[20vh] md:h-[40vh] mt-10 rounded-2xl bg-white/60 flex flex-row px-10 overflow-auto md:overflow-x-hidden gap-6 items-center py-8 scrollbar-hide scroll-smooth max-md:w-[95vw] max-md:mt-4 max-md:px-2 max-md:gap-2 max-md:py-2'>
              {videoCards.map((video, idx) => (
                <div
                  key={idx}
                  className="md:w-[320px] md:h-[240px] bg-black/70 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:scale-105 duration-200 flex flex-col items-center flex-shrink-0 w-[140px] h-[100px]"
                  onClick={() => setActiveVideo(video)}
                  style={{ transform: `translateX(-${videoNav * 110}%)` }}
                >
                  <img src={video.thumb} alt={video.title} className="w-full h-full object-cover " />
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

      {/* Section 7 */}
      <div className='w-full min-h-[100vh] bg-white mb-10 flex items-center justify-center max-md:min-h-[60vh]' id='contact-us'>
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