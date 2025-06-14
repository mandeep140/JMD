import React from 'react'

const Home = () => {
  return (
    <>
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
    <div className='w-full h-[100vh] bg-red-500 backdrop-blur-lg flex items-center justify-center'>
      <div className='text-white text-2xl font-bold'>
        <h1>We are coming soon</h1>
        <h1>Stay Tuned!</h1>
      </div>
    </div>
    </>
  )
}

export default Home