"use client";

import React, { useEffect, useState } from 'react'
import { useParams, redirect } from 'next/navigation';

const Page = () => {
  const params = useParams();
  const id = params?.id;
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!id) {
      redirect('/find-hoardings');
    }
  }, [id]);

  if (!id) return null;

  let sd = { /* sample data */
    id: id,
    title: "NH - 45 andheri unipole",
    type: "Billboard",
    description: "Details of the hoarding lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "/images/find/test.png",
    location: "Billboard at Mumbai Andheri Side",
    size: "20x10 ft",
    area: "310 sq. ft.",
    lightning: "yes",
    available: "yes",
    priceperday: 1200,
    pricepermonth: 30000,
    codinates: {
      lat: 19.0760,
      lng: 72.8777
    },
  }

  return (
    <>
      {/* section 1 */}
      <div className='w-full min-h-[100vh] bg-red-500 flex items-center justify-center relative'>
        <div className='w-[80%] min-h-[80vh] border-white border-2 mt-30 bg-white/40 backdrop-blur-md rounded-4xl p-3 flex'>
          <div className="left bg-yellow w-[50%] flex flex-col justify-between p-5 rounded-4xl ">
            <div className={` w-full ${open ? 'h-4/5' : 'h-1/5'} duration-300 ease-in-out`}>
              <img src={sd.image} alt={sd.title} className="w-full h-full object-cover rounded-4xl" onClick={() => setOpen(true)} />
            </div>
            <div className={` w-full ${open ? 'h-1/5' : 'h-4/5'} duration-300 mt-5 ease-in-out`}>
              <img src={sd.image} alt="" className='w-full h-full object-cover rounded-4xl' onClick={() => setOpen(false)} />
            </div>
          </div>
          <div className="right w-[50%] h-fit flex flex-col justify-between p-5 tracking-widest mt-5">
            <h2 className='text-5xl font-bold'>{sd.type}</h2>
            <h1 className='text-3xl font-extrabold mt-3'>{sd.title}</h1>
            <h4 className='text-xs'>CODE: {sd.id}</h4>
            <span className='flex flex-row items-center gap-2 justify-between w-[80%] text-xl mt-4'>
              <h2><b>SIZE:</b> {sd.size}</h2>
              <h2><b>AREA:</b> {sd.area}</h2>
            </span>
            <span className='flex flex-row items-center gap-2 justify-between w-[80%] mt-2 text-xl'>
              <h2><b>LIGHTNING:</b> {sd.lightning}</h2>
              <h2><b>AVAILABLITY:</b> {sd.available}</h2>
            </span>
            <p className=' mt-3'>
              {sd.description}
            </p>
            <h2 className='mt-4 text-xl'><b>MEDIA LOCATION:</b> {sd.location}</h2>
            <h2 className='mt-4 text-xl'><b>PRICE PER DAY:</b> ₹{sd.priceperday}</h2>
            <h2 className='mt-2 text-xl'><b>PRICE PER MONTH:</b> ₹{sd.pricepermonth}</h2>

            <span className='flex flex-row items-center justify-between w-[80%] mt-20'>
              <button className=' px-6 py-2 bg-white/10 border-2 hover:bg-black/10 rounded-2xl transition-all duration-200 cursor-pointer' onClick={() => setOpen(!open)}>Expand {open ? "Map" : "Photo"}</button>
              <a href='#' className=' px-6 py-2 bg-red-500 border-2 hover:bg-white hover:text-red-500 rounded-2xl transition-all duration-200 cursor-pointer'>Book Now</a>
            </span>
          </div>
        </div>
      </div>

      {/* section 2 */}
      <div className='w-full min-h-[100vh] bg-gradient-to-b from-red-500 to-black/90 flex items-center justify-center' id='contact-us'>
        <div className='w-[100%] mb-auto text-center'>
          <span className='flex flex-col items-center gap-2 mt-23'>
            <h1 className='text-4xl font-extrabold text-black/70'><span className='text-white/80'>Connect</span> With Us!</h1>
          </span>
          <div className='h-[70vh] w-[80%] mx-auto flex flex-row items-center justify-center mt-8 bg-[#E2CFCF] rounded-4xl'>
            <div className='w-[35%] h-full flex flex-col p-5 items-center justify-center text-start bg-red-500 rounded-4xl me-auto'>
              <h1 className='text-lg text-white font-extrabold'>What can JMD Advertisement help you with?</h1>
              <div className='h-[3px] w-[13vw] bg-white rounded-md me-auto mt-6'></div>
              <p className='mt-10 tracking-wide'>Whether you’re launching a new product, boosting brand awareness, or driving local footfall — JMD Advertisement helps you connect with your audience through impactful outdoor media. From strategic billboard placements to dynamic transit advertising, we make sure your message is seen, remembered, and acted upon.</p>
            </div>
            <div className='w-[65%] h-full flex flex-col items-center text-black/80 justify-center ps-15 mt-6 p-5'>
              <p className='text-[10px] me-auto mb-auto'>*Please fill all the details</p>
              <div className='w-[90%] mb-auto me-auto'>
                <form action="">
                  <span className='flex flex-col items-center gap-2 mb-4'>
                    <label htmlFor="name" className='me-auto'>Name</label>
                    <input type="text" name='name' id='name' className='me-auto w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='Full Name' />
                  </span>
                  <span className='flex flex-row items-center gap-2 mb-4'>
                    <span className='flex flex-col items-center gap-2'>
                      <label htmlFor="email" className='me-auto'>Email</label>
                      <input type="text" name='email' id='email' className='me-auto w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='email' />
                    </span>
                    <span className='flex flex-col items-center gap-2 ms-6'>
                      <label htmlFor="phone" className='me-auto'>Phone</label>
                      <input type="text" name='phone' id='phone' className='me-auto w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='01 2345 6789' />
                    </span>
                  </span>
                  <span className='flex flex-col items-center gap-2 mb-2'>
                    <label htmlFor="message" className='me-auto'>message</label>
                    <textarea rows={1} type="text" name='message' id='message' className='me-auto w-[90%] outline-none border-b-1 focus:border-b-red-500' required placeholder='Full Name' />
                  </span>
                  <span className='flex flex-row justify-between items-center gap-2 mt-8'>
                    <span className='flex flex-row items-center gap-2'>
                      <input type="checkbox" name='checkbox' id='checkbox' className='' required />
                      <label htmlFor="checkbox" className='me-auto'>Request Callback</label>
                    </span>
                    <button className='me-12 bg-red-500 px-9 py-3 text-white font-bold text-lg rounded-lg cursor-pointer hover:bg-red-800 duration-200' type='submit'>Send Message</button>
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

export default Page