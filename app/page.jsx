"use client";
import React, { useState, useEffect } from 'react';

const Home = () => {
  const [imgnav, setImgnav] = useState(0);
  const [citynav, setCitynav] = useState(0);
  const [companiesnav, setCompaniesnav] = useState(0);
  const [videoNav, setVideoNav] = useState(0);
  const [activeVideo, setActiveVideo] = useState(null);

  const serviceCards = [
    { title: "Hoardings", link: "svg/hoardings.svg", image: "images/billboard.png" },
    { title: "Digital Hoardings", link: "svg/digital.svg", image: "images/digital_billboard.png" },
    { title: "transit media", link: "svg/bus_shelter.svg", image: "images/transit_media.png" },
    { title: "Airport Branding", link: "svg/kiosk.svg", image: "images/airport_branding.png" },
    { title: "Mall Media", link: "svg/mobile_van.svg", image: "images/mall_media.png" }
  ];

  const s3cards = [
    { img: "svg/city.svg", text: "Prime Locations Across Major Cities" },
    { img: "svg/targeted.svg", text: "High Footfall & Targeted Reach" },
    { img: "svg/ete.svg", text: "End-To-End Campaign Execuation and Support" },
  ];

  const location = ["images/location/l1.png", "images/location/l2.png", "images/location/l3.png", "images/location/l4.png", "images/location/l5.png", "images/location/l6.png", "images/location/l7.png", "images/location/l8.png", "images/location/l9.png", "images/location/l10.png", "images/location/l11.png", "images/location/l12.png", "images/location/l13.png", "images/location/l14.png", "images/location/l15.png", "images/location/l16.png", "images/location/l17.png", "images/location/l18.png", "images/location/l19.png"];

  const companyLogos = ["images/companies/c1.png", "images/companies/c2.png", "images/companies/c3.png", "images/companies/c4.png", "images/companies/c5.png", "images/companies/c6.png", "images/companies/c7.png", "images/companies/c8.png", "images/companies/c9.png", "images/companies/c10.png", "images/companies/c11.png", "images/companies/c12.png", "images/companies/c13.png", "images/companies/c14.png", "images/companies/c15.png", "images/companies/c16.png", "images/companies/c17.png", "images/companies/c18.png", "images/companies/c19.png", "images/companies/c20.png", "images/companies/c21.png", "images/companies/c22.png", "images/companies/c23.png", "images/companies/c24.png", "images/companies/c25.png", "images/companies/c26.png", "images/companies/c27.png", "images/companies/c28.png", "images/companies/c29.png", "images/companies/c30.png", "images/companies/c31.png", "images/companies/c32.png"];

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


  const videoCards = [
    { src: "videos/lander_bg.mp4", thumb: "images/jmd_logo.png", title: "Brand Campaign 1" },
    { src: "videos/lander_bg.mp4", thumb: "images/jmd_logo.png", title: "Brand Campaign 2" },
    { src: "videos/lander_bg.mp4", thumb: "images/jmd_logo.png", title: "Brand Campaign 3" },
    { src: "videos/lander_bg.mp4", thumb: "images/jmd_logo.png", title: "Brand Campaign 4" },
    { src: "videos/lander_bg.mp4", thumb: "images/jmd_logo.png", title: "Brand Campaign 4" },
  ];

  return (
    <>
      {/* Section 1 */}
      <div className='h-[120vh]'>
        <div className='absolute z-[-1] opacity-70'>
          <video src="videos/lander_bg.mp4" className='h-full w-full' autoPlay muted loop></video>
        </div>
        <div className='w-[40vw] absolute top-44 left-31 text-white '>
          <span><h1 className='text-2xl font-bold'><span className='text-red-500'>India's </span>Fastest Growing</h1></span>
          <span>
            <h1 className='text-7xl font-extrabold'>Outdoor</h1>
            <h1 className='text-6xl font-extrabold'>Advertisement</h1>
            <h1 className='text-4xl font-bold'>Company In East Zone</h1>
          </span>
          <span className='flex items-center gap-2 mt-4'>
            <img src="svg/Rectangle.svg" alt="" />
            <span>
              <h1>Trusted By India's Top Brands</h1>
              <h1>To Deliver Maximun Impact.</h1>
            </span>
          </span>
          <span className='flex items-center gap-4 mt-6 text-lg font-semibold'>
            <a href="#" className='flex gap-16 border-2 rounded-4xl px-6 py-3 hover:border-red-500 duration-200'>Find Hoardings <img src="svg/Arrow.svg" alt="Arrow svg" /></a>
            <a href="#" className='scale-80 hover:scale-100 duration-100'><img src="svg/dialer.svg" alt="" /></a>
          </span>
        </div>
      </div>

      {/* Section 2 */}
      <div className='w-full min-h-[110vh] -mt-4 bg-red-500 backdrop-blur-lg flex items-center justify-center' id='services'>
        <div className='text-white w-full h-[30vh] text-center absolute top-20'>
          <h1 className='text-6xl font-extrabold tracking-tight'>Our Services</h1>
          <h1 className='text-xs mt-2 font-thin tracking-wide'>Choose from below to deliver advertisements in a truly <br /> exciting, innovative and creative way.</h1>
          <div className='h-1 w-[13vw] bg-white/50 rounded-md mx-auto mt-10'></div>
          <div className='flex items-center justify-center gap-2 mt-6 border-2 border-white/50 rounded-full w-fit ms-auto me-[10vw] px-4 py-1 hover:border-white duration-150'>
            <button onClick={decImgNav} className=' cursor-pointer'> L </button>|
            <button onClick={incImgNav} className=' cursor-pointer'> R </button>
          </div>
        </div>
        <div className="max-w-[85vw] h-[50vh] flex flex-row flex-nowrap items-center bg-white/30 backdrop-blur-lg border-y-1 border-s-1 rounded-s-4xl p-10 mt-70 ms-auto gap-6 overflow-hidden scrollbar-hide scroll-smooth">
          {serviceCards.map((card, index) => (
            <div
              key={index}
              style={{ transform: `translateX(-${imgnav * 120}%)` }}
              className="min-w-[250px] w-[20vw] h-[40vh] flex flex-col items-center justify-center overflow-hidden bg-white backdrop-blur-lg rounded-2xl hover:scale-105 duration-200 shadow-lg hover:shadow-xl transition-transform"
            >
              <img src={card.image} alt={card.title} className="w-[104%] h-3/5 object-cover mb-4 -mt-5" />
              <h1 className="font-bold text-black/70">{card.title}</h1>
              <a href={card.link} className="mt-4 text-black/70 hover:text-black flex items-center gap-2 text-sm duration-100">
                Learn More <img src="svg/black_arrow.svg" alt="Arrow svg" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3*/}
      <div className='w-full min-h-[100vh] bg-[#FFF4F4] flex items-center justify-center'>
        {/* left part on desktop */}
        <div className='w-[50vw] me-auto mb-auto text-center'>
          <span className='flex flex-col items-center gap-2 mt-23'>
            <h1 className='text-5xl font-extrabold text-black'>Why To Choose</h1>
            <h1 className='text-4xl font-extrabold text-black'><span className='text-red-500'>JMD Advertisement</span>?</h1>
          </span>
          <div className='h-[35vh] w-full flex items-center justify-center mt-8 bg-red-500 rounded-e-2xl'>
            <p className='px-10 ms-18 text-start text-[17px] tracking-wide font-extralight'>At JMD, we’re not just another outdoor advertising company. We are your strategic partner in putting your brand in front of millions — right where it can’t be missed. Our approach blends location intelligence, bold creative execution, and proven reach to deliver unmatched visibility.</p>
          </div>
          <div className='flex items-center justify-center gap-4 mt-7 ms-8'>
            {s3cards.map((item, index) => (
              <div key={index} className='flex flex-col items-center gap-2 rounded-lg w-[12vw] h-[25vh] bg-white hover:scale-105 duration-200 shadow-lg hover:shadow-xl transition-transform'>
                <span className='flex items-center justify-center w-full h-[60%] rounded-t-lg bg-red-500'>
                  <img src={item.img} alt={item.text} className='w-16 h-16' />
                </span>
                <h1 className=' mx-3 text-xs text-black/70'>{item.text}</h1>
              </div>
            ))}
          </div>
        </div>

        {/* right part on desktop */}
        <div className='w-[50vw] ms-auto mb-auto flex items-center justify-center'>
          <img src="svg/billboard.svg" alt="" className='h-[50%] w-[70%] object-cover rounded-2xl mt-20 ms-17' />
          <img src="svg/" alt="" />
        </div>
      </div>
      <div className='w-full h-[20vh] bg-red-400 rounded-t-[100%] -mt-20'></div>

      {/* Section 4 */}
      <div className='w-full min-h-[100vh] bg-[#FFF4F4] flex flex-col items-center justify-center' id='city'>
        <img src="svg/red-city.svg" alt="" className='w-[40%] bg-cover absolute left-0 ' />
        <div className='w-full h-[30%] mt-25 mb-auto flex flex-col items-center justify-center text-center z-1'>
          <h1 className='text-red-500 text-4xl font-extrabold'>Explore Your City Listing</h1>
          <p className='text-black/70 tracking-wide mt-4 w-[30%]'>Discover premium outdoor ad spaces across India's major cities and boost your brand visibility where it matters most.</p>
        </div>
        <div className='z-1 flex flex-row items-center justify-center gap-4'>
          <button className='mb-auto mt-18 me-3 cursor-pointer' onClick={decCityNav}><img src="svg/left-arr.svg" alt="" /></button>
          <div className='bg-[#FF4646] border-red border-1 flex flex-row items-center gap-4 overflow-hidden rounded-2xl h-[32vh] w-[60vw] mb-35 px-2'>
            {location.map((loc, index) => (
              <img key={index} src={loc} alt={`Location ${index + 1}`} className='w-[35%]  object-cover rounded-lg m-2 duration-200 transition-transform' style={{ transform: `translateX(-${citynav * 110}%)` }} />
            ))}
          </div>
          <button className='mb-auto mt-18 ms-3 cursor-pointer' onClick={incCityNav}><img src="svg/right-arr.svg" alt="" /></button>
        </div>
      </div>

      {/* Section 5 */}
      <div id='clients' className='w-full h-[70vh] bg-red-500 flex flex-col items-center justify-center '>
        <h1 className='text-4xl font-extrabold text-white'>Meet Our Happy Clients</h1>
        <div className='h-1 w-[13vw] bg-white/50 rounded-md mx-auto mt-10'></div>
        <div className='w-[70vw] h-[25vh] bg-white/50 border-2 mt-10 rounded-2xl flex items-center overflow-hidden flex-row gap-4 scrollbar-hide scroll-smooth'>
          {companyLogos.map((logo, logoIndex) =>
            <img
              key={logoIndex}
              src={companyLogos[logoIndex]}
              alt={`Company Logo ${logoIndex + 1}`}
              className='w-[10%] h-[80%] object-contain rounded-lg duration-200 transition-transform'
              style={{ transform: `translateX(-${companiesnav * 100}%)` }}
            />
          )}
        </div>
      </div>

      {/* Section 6 */}
      <div className='w-full min-h-[200vh] bg-gradient-to-b flex flex-col items-center from-red-500 to-white relative'>
        <div className='opacity-40 absolute'>
          <img src="svg/Videos.svg" className='w-full' alt="" />
        </div>
        <div className='z-1 w-full min-h-[40vh] mt-30 flex flex-col items-center justify-center text-center'>
          <h1 className='text-4xl font-extrabold text-white'>Videos</h1>
          <div className='flex flex-row'>
            <button className='mb-auto mt-35 me-3 cursor-pointer' onClick={decVideoNav}><img src="svg/left-arr.svg" alt="" /></button>
            <div className='w-[70vw] min-h-[40vh] mt-10 rounded-2xl bg-white/60 flex flex-row px-10 overflow-x-hidden gap-6 items-center py-8 scrollbar-hide scroll-smooth'>
              {videoCards.map((video, idx) => (
                <div
                  key={idx}
                  className="w-[220px] h-[140px] bg-black/70 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:scale-105 duration-200 flex flex-col items-center flex-shrink-0"
                  onClick={() => setActiveVideo(video)}
                  style={{ transform: `translateX(-${videoNav * 110 }%)` }}
                >
                  <img src={video.thumb} alt={video.title} className="w-full object-cover" />
                  <span className="text-white text-sm font-semibold mt-auto">{video.title}</span>
                </div>
              ))}
            </div>
            <button className='mb-auto mt-35 ms-3 cursor-pointer' onClick={incVideoNav}><img src="svg/right-arr.svg" alt="" /></button>
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
              <video
                src={activeVideo.src}
                controls
                className="w-[90vw] max-w-3xl h-[60vh] rounded-2xl shadow-2xl bg-black"
                style={{ objectFit: 'contain' }}
              />
              <div className="text-white text-lg font-semibold mt-4 text-center drop-shadow">{activeVideo.title}</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Home