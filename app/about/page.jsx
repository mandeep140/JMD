import React from 'react'

const page = () => {
  return (
    <>
      {/* section 1 */}
      <div className='w-full h-[100vh] flex items-center justify-center relative'>
        <img src="images/about/bg.png" className='w-full h-full absolute top-0 left-0 object-cover' alt="" />
        <div className='w-full h-full bg-black/20 z-1  flex items-center justify-start text-start px-4 sm:px-10'>
          <div className='w-full max-w-[800px] me-auto text-white z-10 p-4 ps-0 sm:ps-30 mb-auto mt-30 sm:mt-60'>
            <h1 className='text-3xl sm:text-6xl font-extrabold mb-4'>About Us</h1>
            <span className='flex items-center gap-2 mt-8 sm:mt-14'>
              <img src="svg/Rectangle.svg" alt="" className="w-auto" />
              <span className='text-base sm:text-xl font-bold'>
                <h1>Welcome To East India's Fastest Growing</h1>
                <h1>Outdoor Advertisement Agency</h1>
              </span>
            </span>
            <span>
              <p className='font-light mt-4 w-full sm:w-[38vw] tracking-wide'>
                Jai Mata Di Advertising — based in Harhargutu,
                Jamshedpur is East India's fastest-growing and most trusted OOH advertising agency, backed by 18+ years of experience and 1000+ successful campaigns across the region.</p>
              <p className='font-light mt-4 w-full sm:w-[38vw] tracking-wide'>
                We are committed to delivering impactful, result-driven outdoor advertising solutions tailored to each client’s unique needs. Our focus on quality, consistency, and strategic execution ensures your brand doesn’t just get seen — it gets remembered
              </p>
            </span>
          </div>
        </div>
      </div>

      {/* section 2 */}
      <div className='w-full min-h-[110vh] flex flex-col-reverse sm:flex-row items-center bg-gradient-to-b from-[#060406] to-[#D44E51] justify-center z-1 relative'>
        {/* Content Left */}
        <div className='w-full max-w-[90vw] sm:max-w-[50vw] text-white text-center z-10 p-4 ps-0 sm:pe-30 mb-auto ms-auto me-0 sm:me-auto mt-20 sm:mt-40 relative'>
          <h1 className='text-3xl sm:text-5xl font-extrabold mb-4 text-red-500'> Our Vision</h1>
          <p className='font-extralight mt-8 sm:mt-14 w-full sm:w-[38vw] text-start tracking-widest'>
            At JMD (Jai Mata Di Advertising), our vision is to revolutionize the outdoor advertising landscape across East India and beyond by making brand visibility smarter, simpler, and more strategic.
          </p>
          <p className='font-extralight mt-4 sm:mt-8 w-full sm:w-[38vw] text-start tracking-widest'>
            We aim to create a seamless ecosystem where businesses can effortlessly plan, book, and manage outdoor advertising campaigns — from billboards to mall media — all under one trusted name.
          </p>
          <p className='font-extralight mt-4 sm:mt-8 w-full sm:w-[38vw] text-start tracking-widest'>
            Our commitment is not just to display your message, but to amplify your brand’s voice, spark visibility, and drive real results. With our 18+ years of experience and 1000+ successful campaigns, we know what it takes to turn heads, grab attention, and leave a lasting impact.
          </p>
          <ul className='font-extralight mt-4 sm:mt-8 ms-4 text-start tracking-widest list-disc list-inside mb-10'>
            <li>We don't just advertise.</li>
            <li>We craft presence.</li>
            <li>We bridge brands with people.</li>
            <li>We build legacies in bold.</li>
          </ul>
          {/* Mobile Image */}
          <img src="images/about/char.png" className='block sm:hidden w-2/3 mx-auto mt-6 opacity-80' alt="" />
        </div>
        {/* Desktop Image on right */}
        <div className="w-full sm:w-auto flex justify-center -ml-50 items-center">
          <img src="images/about/char.png" className='hidden sm:block mt-80 w-[670px] max-w-[40vw]' alt="" />
        </div>
      </div>

      {/* section 3 */}
      <div className='w-full min-h-[110vh] flex flex-col sm:flex-row items-center bg-gradient-to-b from-[#D44E51] to-[#0A0507] justify-center z-1 relative'>
        {/* Desktop Image */}
          <img src="images/about/target.png" className='hidden sm:block  absolute left-0 top-1/2 -translate-y-1/2 w-[650px] max-w-[40vw]  mt-35 z-50' alt="" />
          <div className='w-full max-w-[90vw] sm:max-w-[50vw] text-white text-center z-10 p-4 ps-0 sm:ps-30 mb-auto ms-auto me-0 sm:me-20 mt-20 sm:mt-40 relative'>
            <h1 className='text-3xl sm:text-5xl font-black mb-4 text-white'> Our Mission</h1>
            <p className='font-light mt-8 sm:mt-14 w-full sm:w-[38vw] text-start tracking-widest'>
              At JMD Advertising, our mission is to become India's leading force in OOH advertising, helping brands find their voice and tell powerful stories through impactful outdoor campaigns.
            </p>
            <p className='font-light mt-4 sm:mt-8 w-full sm:w-[38vw] text-start tracking-widest'>
              We are dedicated to delivering high-quality, creative, and result-driven solutions across cities — because "quality never goes out of style," and we ensure yours stands tall.
            </p>
            <p className='font-light mt-4 sm:mt-8 w-full sm:w-[38vw] text-start tracking-widest'>
              We bring together strategy, creativity, and experience to promote your business where it matters most — on roads, in minds, and across skylines.
            </p>
            <ul className='font-light mt-4 sm:mt-8 ms-4 text-start tracking-widest list-disc list-inside mb-10'>
              <li>You have a brand.</li>
              <li>We have the vision to make it unforgettable.</li>
            </ul>
            {/* Mobile Image */}
          <img src="images/about/target.png" className='block sm:hidden w-2/3 mx-auto mt-6 opacity-80 z-11' alt="" />
        </div>
      </div>
      <div className='w-full h-[10vh] sm:h-[20vh] bg-red-400 rounded-t-[100%]  -mt-10 sm:-mt-20 relative z-10'></div>
    </>
  )
}

export default page