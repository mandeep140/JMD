import React from 'react'
import Image from 'next/image'

// SEO Metadata for About page
export const metadata = {
  title: 'About JMD Advertisement - East India\'s Leading Outdoor Advertising Agency',
  description: 'Learn about JMD (Jai Mata Di) Advertisement - East India\'s fastest-growing OOH advertising agency with 18+ years of experience and 1000+ successful campaigns across Jamshedpur, Kolkata, Bhubaneswar and more.',
  keywords: 'JMD Advertisement, Jai Mata Di Advertising, outdoor advertising agency East India, OOH advertising Jamshedpur, billboard advertising, about us, company history, advertising experience',
  authors: [{ name: 'JMD Advertisement' }],
  creator: 'JMD Advertisement',
  publisher: 'JMD Advertisement',
  
  // Open Graph (Facebook, WhatsApp, LinkedIn)
  openGraph: {
    title: 'About JMD Advertisement - East India\'s Leading OOH Agency',
    description: 'Discover JMD Advertisement\'s journey - 18+ years of outdoor advertising excellence, 1000+ successful campaigns, and trusted partnership across East India.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jmdadvertisement.com'}/about`,
    siteName: 'JMD Advertisement',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jmdadvertisement.com'}/images/about/bg.png`,
        width: 1200,
        height: 630,
        alt: 'JMD Advertisement - About Us',
      },
    ],
  },
  
  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'About JMD Advertisement - East India\'s Leading OOH Agency',
    description: 'Discover JMD Advertisement\'s journey - 18+ years of outdoor advertising excellence, 1000+ successful campaigns, and trusted partnership across East India.',
    site: '@jmdadvertisement',
    creator: '@jmdadvertisement',
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'https://jmdadvertisement.com'}/images/about/bg.png`],
  },
  
  // Additional meta tags
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jmdadvertisement.com'}/about`,
  },
  
  // Geo and business info
  other: {
    'geo.region': 'IN-JH',
    'geo.placename': 'Jamshedpur',
    'geo.position': '22.8046;86.2029',
    'ICBM': '22.8046, 86.2029',
    'business:contact_data:locality': 'Jamshedpur',
    'business:contact_data:region': 'Jharkhand',
    'business:contact_data:country_name': 'India',
  },
};

const AboutPage = () => {
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "mainEntity": {
              "@type": "Organization",
              "name": "JMD Advertisement",
              "alternateName": "Jai Mata Di Advertising",
              "description": "East India's fastest-growing and most trusted OOH advertising agency with 18+ years of experience",
              "foundingDate": "2006",
              "founder": {
                "@type": "Person",
                "name": "JMD Advertisement Founder"
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Harhargutu",
                "addressLocality": "Jamshedpur",
                "addressRegion": "Jharkhand",
                "addressCountry": "India"
              },
              "areaServed": [
                "East India",
                "Jharkhand",
                "West Bengal",
                "Odisha",
                "Bihar"
              ],
              "serviceType": "Outdoor Advertising",
              "knowsAbout": [
                "Billboard Advertising",
                "Digital Signage",
                "Transit Media",
                "Mall Advertising",
                "Airport Branding"
              ],
              "awards": "1000+ Successful Campaigns",
              "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://jmdadvertisement.com'
            },
            "about": {
              "@type": "Thing",
              "name": "Outdoor Advertising Services",
              "description": "Comprehensive outdoor advertising solutions across East India"
            }
          })
        }}
      />

      {/* section 1 */}
      <div className='w-full h-[100vh] flex items-center justify-center relative'>
        <Image 
          src="/images/about/bg.png" 
          alt="JMD Advertisement - About Us Background" 
          fill
          className='object-cover'
          priority
          sizes="100vw"
        />
        <div className='w-full h-full bg-black/20 z-1 flex items-center justify-start text-start px-4 sm:px-10'>
          <div className='w-full max-w-[800px] me-auto text-white z-10 p-4 ps-0 sm:ps-30 mb-auto mt-30 sm:mt-60'>
            <h1 className='text-3xl sm:text-6xl font-extrabold mb-4'>About Us</h1>
            <span className='flex items-center gap-2 mt-8 sm:mt-14'>
              <Image 
                src="/svg/Rectangle.svg" 
                alt="Decorative element" 
                width={20} 
                height={20} 
                className="w-auto" 
              />
              <span className='text-base sm:text-xl font-bold'>
                <h2>Welcome To East India's Fastest Growing</h2>
                <h2>Outdoor Advertisement Agency</h2>
              </span>
            </span>
            <div>
              <p className='font-light mt-4 w-full sm:w-[38vw] tracking-wide'>
                <strong>Jai Mata Di Advertising</strong> — based in Harhargutu,
                Jamshedpur is East India's fastest-growing and most trusted OOH advertising agency, backed by <strong>18+ years of experience</strong> and <strong>1000+ successful campaigns</strong> across the region.
              </p>
              <p className='font-light mt-4 w-full sm:w-[38vw] tracking-wide'>
                We are committed to delivering impactful, result-driven outdoor advertising solutions tailored to each client's unique needs. Our focus on quality, consistency, and strategic execution ensures your brand doesn't just get seen — <strong>it gets remembered</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* section 2 - Our Vision */}
      <div className='w-full min-h-[110vh] flex flex-col-reverse sm:flex-row items-center bg-gradient-to-b from-[#060406] to-[#D44E51] justify-center z-1 relative'>
        {/* Content Left */}
        <div className='w-full max-w-[90vw] sm:max-w-[50vw] text-white text-center z-10 p-4 ps-0 sm:pe-30 mb-auto ms-auto me-0 sm:me-auto mt-20 sm:mt-40 relative'>
          <h2 className='text-3xl sm:text-5xl font-extrabold mb-4 text-red-500'>Our Vision</h2>
          <p className='font-extralight mt-8 sm:mt-14 w-full sm:w-[38vw] text-start tracking-widest'>
            At <strong>JMD (Jai Mata Di Advertising)</strong>, our vision is to revolutionize the outdoor advertising landscape across East India and beyond by making brand visibility smarter, simpler, and more strategic.
          </p>
          <p className='font-extralight mt-4 sm:mt-8 w-full sm:w-[38vw] text-start tracking-widest'>
            We aim to create a seamless ecosystem where businesses can effortlessly plan, book, and manage outdoor advertising campaigns — from billboards to mall media — all under one trusted name.
          </p>
          <p className='font-extralight mt-4 sm:mt-8 w-full sm:w-[38vw] text-start tracking-widest'>
            Our commitment is not just to display your message, but to amplify your brand's voice, spark visibility, and drive real results. With our <strong>18+ years of experience</strong> and <strong>1000+ successful campaigns</strong>, we know what it takes to turn heads, grab attention, and leave a lasting impact.
          </p>
          <ul className='font-extralight mt-4 sm:mt-8 ms-4 text-start tracking-widest list-disc list-inside mb-10'>
            <li>We don't just advertise.</li>
            <li>We craft presence.</li>
            <li>We bridge brands with people.</li>
            <li>We build legacies in bold.</li>
          </ul>
          {/* Mobile Image */}
          <div className='block sm:hidden w-2/3 mx-auto mt-6 opacity-80 relative'>
            <Image 
              src="/images/about/char.png" 
              alt="JMD Advertisement - Our Vision Character" 
              width={300} 
              height={400} 
              className="w-full h-auto"
              sizes="(max-width: 640px) 66vw, 0px"
            />
          </div>
        </div>
        {/* Desktop Image on right */}
        <div className="w-full sm:w-auto flex justify-center -ml-50 items-center">
          <div className='hidden sm:block mt-80 w-[670px] max-w-[40vw] relative'>
            <Image 
              src="/images/about/char.png" 
              alt="JMD Advertisement - Our Vision Character" 
              width={670} 
              height={800} 
              className="w-full h-auto"
              sizes="(min-width: 640px) 40vw, 0px"
            />
          </div>
        </div>
      </div>

      {/* section 3 - Our Mission */}
      <div className='w-full min-h-[110vh] flex flex-col sm:flex-row items-center bg-gradient-to-b from-[#D44E51] to-[#0A0507] justify-center z-1 relative'>
        {/* Desktop Image */}
        <div className='hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-[650px] max-w-[40vw] mt-35 z-50'>
          <Image 
            src="/images/about/target.png" 
            alt="JMD Advertisement - Our Mission Target" 
            width={650} 
            height={500} 
            className="w-full h-auto"
            sizes="(min-width: 640px) 40vw, 0px"
          />
        </div>
        <div className='w-full max-w-[90vw] sm:max-w-[50vw] text-white text-center z-10 p-4 ps-0 sm:ps-30 mb-auto ms-auto me-0 sm:me-20 mt-20 sm:mt-40 relative'>
          <h2 className='text-3xl sm:text-5xl font-black mb-4 text-white'>Our Mission</h2>
          <p className='font-light mt-8 sm:mt-14 w-full sm:w-[38vw] text-start tracking-widest'>
            At <strong>JMD Advertising</strong>, our mission is to become India's leading force in OOH advertising, helping brands find their voice and tell powerful stories through impactful outdoor campaigns.
          </p>
          <p className='font-light mt-4 sm:mt-8 w-full sm:w-[38vw] text-start tracking-widest'>
            We are dedicated to delivering high-quality, creative, and result-driven solutions across cities — because <em>"quality never goes out of style,"</em> and we ensure yours stands tall.
          </p>
          <p className='font-light mt-4 sm:mt-8 w-full sm:w-[38vw] text-start tracking-widest'>
            We bring together strategy, creativity, and experience to promote your business where it matters most — on roads, in minds, and across skylines.
          </p>
          <ul className='font-light mt-4 sm:mt-8 ms-4 text-start tracking-widest list-disc list-inside mb-10'>
            <li>You have a brand.</li>
            <li>We have the vision to make it unforgettable.</li>
          </ul>
          {/* Mobile Image */}
          <div className='block sm:hidden w-2/3 mx-auto mt-6 opacity-80 z-11 relative'>
            <Image 
              src="/images/about/target.png" 
              alt="JMD Advertisement - Our Mission Target" 
              width={300} 
              height={200} 
              className="w-full h-auto"
              sizes="(max-width: 640px) 66vw, 0px"
            />
          </div>
        </div>
      </div>
      <div className='w-full h-[10vh] sm:h-[20vh] bg-red-400 rounded-t-[100%] -mt-10 sm:-mt-20 relative z-10'></div>
    </>
  )
}

export default AboutPage