"use client";

import React, { useEffect, useState } from 'react'
import { useParams, redirect } from 'next/navigation';
import Link from 'next/link';
import GoogleMap from '@/app/component/GoogleMap';

const Page = () => {
  const params = useParams();
  const id = params?.id;
  const [open, setOpen] = useState(true);
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      redirect('/find-hoardings');
      return;
    }
    // Fetch ad from backend using mediacode
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads/update?mediacode=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setAd(data);
      } catch (err) {
        redirect('/find-hoardings');
      }
      setLoading(false);
    };
    fetchAd();
  }, [id]);

  if (!id || loading) return null;
  if (!ad) return <div className="w-full h-screen flex items-center justify-center text-black text-center">Ad not found</div>;

  return (
    <>
      {/* section 1 */}
      <div className='w-full min-h-[100vh] bg-red-500 flex items-center justify-center relative'>
        <div className='w-[98%] md:w-[80%] min-h-[80vh] border-white border-2 mt-8 md:mt-25 bg-white/40 backdrop-blur-md rounded-3xl p-2 md:p-6 flex flex-col md:flex-row gap-4 md:gap-0 overflow-hidden'>
          {/* Left: Images */}
          <div className="w-full md:w-1/2 flex flex-col justify-between gap-4 md:gap-0 p-2 md:p-5 rounded-3xl">
            <div className={`w-full ${open ? 'h-2/3' : 'h-1/4'} duration-300 ease-in-out aspect-video overflow-hidden`}>
              <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover rounded-2xl cursor-pointer" onClick={() => setOpen(true)} />
            </div>
            <div className={`w-full ${open ? 'h-1/4' : 'h-2/3'} duration-300 mt-3 md:mt-5 ease-in-out aspect-video rounded-2xl overflow-hidden`}>
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
            <h2 className='mt-4 text-base md:text-xl'><b>MEDIA LOCATION:</b> {ad.locationmap}</h2>
            <h2 className='mt-4 text-base md:text-xl'><b>PRICE PER DAY:</b> ₹{ad.priceperday}</h2>
            <h2 className='mt-2 text-base md:text-xl'><b>PRICE PER MONTH:</b> ₹{ad.pricepermonth}</h2>
            <div className='flex flex-col md:flex-row items-center justify-between w-full md:w-[80%] mt-8 md:mt-20 gap-3 md:gap-0'>
              <button className='w-full md:w-auto px-6 py-2 bg-white/10 border-2 hover:bg-black/10 rounded-2xl transition-all duration-200 cursor-pointer' onClick={() => setOpen(!open)}>
                Expand {open ? "Map" : "Photo"}
              </button>
              <Link href={`/find-hoardings/${id}/#contact-us`} className='w-full md:w-auto px-6 py-2 bg-red-500 border-2 hover:bg-white hover:text-red-500 rounded-2xl transition-all duration-200 cursor-pointer text-center'>
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* section 2 */}
      <div className='w-full min-h-[100vh] bg-gradient-to-b from-red-500 to-black/90 flex items-center justify-center' id='contact-us'>
        <div className='w-full mb-auto text-center'>
          <span className='flex flex-col items-center gap-2 mt-10 md:mt-24'>
            <h1 className='text-2xl md:text-4xl font-extrabold text-black/70'><span className='text-white/80'>Connect</span> With Us!</h1>
          </span>
          <div className='h-auto md:h-[70vh] w-[98%] md:w-[80%] mx-auto flex flex-col md:flex-row items-center justify-center mt-8 bg-[#E2CFCF] rounded-3xl'>
            <div className='w-full md:w-[35%] h-full flex flex-col p-5 items-center justify-center text-start bg-red-500 rounded-3xl me-auto'>
              <h1 className='md:text-2xl text-lg text-white font-extrabold'>Why Choose JMD?</h1>
              <div className='h-[3px] w-[60vw] md:w-[13vw] bg-white rounded-md mx-auto mt-6'></div>
              <ul className='list-disc text-white mt-6 text-base md:text-lg px-5 ms-3'>
                <li>19+ Years of Outdoor Advertising Excellence</li>
                <li>1000+ Successful Campaigns Executed</li>
                <li>Coverage Across 7+ East Indian States</li>
                <li>Trusted by Top Brands & Local Businesses</li>
              </ul>
              <span className='flex flex-col items-center mt-6 pt-10 text-lg md:text-2xl font-extrabold'>
                <h2>Thinking of Branding</h2>
                <h2>Think JMD</h2>
              </span>
            </div>
            <div className='w-full md:w-[65%] h-full flex flex-col items-center text-black/80 justify-center ps-0 md:ps-15 mt-6 p-5'>
              <p className='text-[10px] me-auto mb-auto'>*Please fill all the details</p>
              <div className='w-full md:w-[90%] mb-auto me-auto'>
                <form action="">
                  <span className='flex flex-col items-center gap-2 mb-4'>
                    <label htmlFor="name" className='me-auto'>Name</label>
                    <input type="text" name='name' id='name' className='me-auto w-full md:w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='Full Name' />
                  </span>
                  <span className='flex flex-col md:flex-row items-center gap-2 mb-4'>
                    <span className='flex flex-col items-center gap-2 w-full'>
                      <label htmlFor="email" className='me-auto'>Email</label>
                      <input type="text" name='email' id='email' className='me-auto w-full md:w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='email' />
                    </span>
                    <span className='flex flex-col items-center gap-2 ms-0 md:ms-6 w-full'>
                      <label htmlFor="phone" className='me-auto'>Phone</label>
                      <input type="text" name='phone' id='phone' className='me-auto w-full md:w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='01 2345 6789' />
                    </span>
                  </span>
                  <span className='flex flex-col items-center gap-2 mb-2'>
                    <label htmlFor="message" className='me-auto'>Message</label>
                    <textarea rows={1} type="text" name='message' id='message' className='me-auto w-full md:w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='Full Name' />
                  </span>
                  <span className='flex flex-col md:flex-row justify-between items-center gap-2 mt-8'>
                    <span className='flex flex-row items-center gap-2'>
                      <input type="checkbox" defaultChecked name='checkbox' id='checkbox' className='' required />
                      <label htmlFor="checkbox" className='me-auto'>Request Callback</label>
                    </span>
                    <button className='me-0 md:me-12 bg-red-500 px-9 py-3 text-white font-bold text-lg rounded-lg cursor-pointer hover:bg-red-800 duration-200' type='submit'>Send Message</button>
                  </span>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Page;