"use client";
import React from 'react'
import { useState, useEffect } from 'react';
import Link from 'next/link';

const Home = () => {
  const [imgnav, setImgnav] = useState(0);

  const serviceCards = [
    { title: "Hoardings", link: "svg/hoardings.svg", image: "images/billboard.png" },
    { title: "Digital Hoardings", link: "svg/digital.svg", image: "images/digital_billboard.png" },
    { title: "transit media", link: "svg/bus_shelter.svg", image: "images/transit_media.png" },
    { title: "Airport Branding", link: "svg/kiosk.svg", image: "images/airport_branding.png" },
    { title: "Mall Media", link: "svg/mobile_van.svg", image: "images/mall_media.png" }
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
              className="min-w-[250px] w-[20vw] h-[40vh] flex flex-col items-center justify-center bg-white backdrop-blur-lg rounded-2xl p-4 hover:scale-105 duration-200 shadow-lg hover:shadow-xl transition-transform"
            >
              <img src={card.image} alt={card.title} className="w-[100%] h-3/5 object-cover mb-4" />
              <h1 className="font-bold text-black/70">{card.title}</h1>
              <a href={card.link} className="mt-4 text-black/70 hover:text-black flex items-center gap-2 text-sm duration-100">
                Learn More <img src="svg/black_arrow.svg" alt="Arrow svg" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Home