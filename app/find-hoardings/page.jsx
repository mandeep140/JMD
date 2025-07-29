import React from 'react';
import FindHoardingsClient from './FindHoardingsClient';

// Server-side metadata generation
export async function generateMetadata({ searchParams }) {
    // Await the entire searchParams object first
    const params = await searchParams;
    const type = params?.type;
    const city = params?.city;
    
    // Format type parameter (replace underscores with spaces, capitalize)
    const formattedType = type 
        ? type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
        : null;

    let title = "Find Hoardings & Outdoor Advertising";
    let description = "Discover premium outdoor advertising spaces across East India. Find billboards, digital hoardings, transit media, airport branding, and mall advertising solutions.";
    
    if (city && formattedType) {
        title = `${formattedType} in ${city} - Find Hoardings`;
        description = `Find premium ${formattedType.toLowerCase()} advertising spaces in ${city}. Book hoardings and outdoor media with JMD Advertisement.`;
    } else if (city) {
        title = `Outdoor Advertising in ${city} - Find Hoardings`;
        description = `Explore outdoor advertising opportunities in ${city}. Premium billboards, digital signage, and media spaces available for booking.`;
    } else if (formattedType) {
        title = `${formattedType} Advertising - Find Hoardings`;
        description = `Find ${formattedType.toLowerCase()} advertising spaces across East India. Premium locations with high visibility and footfall.`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jmdadvertisement.com';
    const currentUrl = `${baseUrl}/find-hoardings${type ? `?type=${type}` : ''}${city ? `${type ? '&' : '?'}city=${city}` : ''}`;

    return {
        title: `${title} | JMD Advertisement`,
        description,
        keywords: `outdoor advertising, hoardings, billboards, ${formattedType || 'advertising'}, ${city || 'East India'}, JMD Advertisement`,
        authors: [{ name: 'JMD Advertisement' }],
        creator: 'JMD Advertisement',
        publisher: 'JMD Advertisement',
        
        // Open Graph (Facebook, WhatsApp, LinkedIn)
        openGraph: {
            title: `${title} | JMD Advertisement`,
            description,
            url: currentUrl,
            siteName: 'JMD Advertisement',
            type: 'website',
            locale: 'en_IN',
            images: [
                {
                    url: `${baseUrl}/images/about/bg.png`,
                    width: 1200,
                    height: 630,
                    alt: `${title} - JMD Advertisement`,
                },
            ],
        },
        
        // Twitter Cards
        twitter: {
            card: 'summary_large_image',
            title: `${title} | JMD Advertisement`,
            description,
            site: '@jmdadvertisement',
            creator: '@jmdadvertisement',
            images: [`${baseUrl}/images/about/bg.png`],
        },
        
        // Additional meta tags
        alternates: {
            canonical: currentUrl,
        },
    };
}

// Server component
const Page = async ({ searchParams }) => {
    // Also await searchParams in the component
    const params = await searchParams;
    
    return (
        <>
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "Find Hoardings & Outdoor Advertising",
                        "description": "Discover premium outdoor advertising spaces across East India",
                        "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jmdadvertisement.com'}/find-hoardings`,
                        "mainEntity": {
                            "@type": "ItemList",
                            "name": "Outdoor Advertising Spaces",
                            "description": "Premium hoardings and advertising spaces"
                        },
                        "provider": {
                            "@type": "Organization",
                            "name": "JMD Advertisement",
                            "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://jmdadvertisement.com'
                        }
                    })
                }}
            />
            
            {/* Client component for interactive functionality */}
            <FindHoardingsClient searchParams={params} />
        </>
    );
};

export default Page;