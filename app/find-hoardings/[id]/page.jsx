import React from 'react';
import AdDetailClient from './AdDetailClient';

// Server-side metadata generation for individual ad
export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    
    if (!id) {
        return {
            title: 'Ad Not Found | JMD Advertisement',
            description: 'The requested advertisement could not be found.',
        };
    }

    try {
        // Fetch ad data on server side for metadata
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jmdadvertisement.com';
        const res = await fetch(`${baseUrl}/api/ads/update?mediacode=${encodeURIComponent(id)}`, {
            cache: 'no-store' // Always fetch fresh data for metadata
        });
        
        if (!res.ok) {
            throw new Error('Ad not found');
        }
        
        const ad = await res.json();
        
        const title = `${ad.type} in ${ad.city} - ${ad.title}`;
        const description = `Book ${ad.type.toLowerCase()} advertising space in ${ad.city}. Size: ${ad.size}, Lighting: ${ad.lighting}, Price: ₹${ad.priceperday}/day. Premium outdoor advertising with JMD Advertisement.`;
        const currentUrl = `${baseUrl}/find-hoardings/${id}`;
        
        return {
            title: `${title} | JMD Advertisement`,
            description,
            keywords: `${ad.type}, ${ad.city}, outdoor advertising, hoardings, billboards, ${ad.mediacode}, JMD Advertisement, ${ad.lighting}`,
            authors: [{ name: 'JMD Advertisement' }],
            creator: 'JMD Advertisement',
            publisher: 'JMD Advertisement',
            
            // Open Graph (Facebook, WhatsApp, LinkedIn)
            openGraph: {
                title: `${title} | JMD Advertisement`,
                description,
                url: currentUrl,
                siteName: 'JMD Advertisement',
                type: 'article',
                locale: 'en_IN',
                images: [
                    {
                        url: ad.imageUrl || `${baseUrl}/images/find/test.png`,
                        width: 1200,
                        height: 630,
                        alt: `${ad.title} - ${ad.type} in ${ad.city}`,
                    },
                ],
                article: {
                    publishedTime: ad.createdAt || new Date().toISOString(),
                    modifiedTime: ad.updatedAt || new Date().toISOString(),
                    section: 'Outdoor Advertising',
                    tag: [ad.type, ad.city, 'Outdoor Advertising', 'Hoardings'],
                },
            },
            
            // Twitter Cards
            twitter: {
                card: 'summary_large_image',
                title: `${title} | JMD Advertisement`,
                description,
                site: '@jmdadvertisement',
                creator: '@jmdadvertisement',
                images: [ad.imageUrl || `${baseUrl}/images/find/test.png`],
            },
            
            // Additional meta tags
            alternates: {
                canonical: currentUrl,
            },
            
            // Geo-location and business info
            other: {
                'og:image:width': '1200',
                'og:image:height': '630',
                'geo.region': 'IN',
                'geo.placename': ad.city,
                'business:contact_data:locality': ad.city,
                'business:contact_data:region': 'India',
                'business:contact_data:country_name': 'India',
            },
        };
    } catch (error) {
        return {
            title: 'Ad Not Found | JMD Advertisement',
            description: 'The requested advertisement could not be found.',
        };
    }
}

// Server component
const Page = async ({ params }) => {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    
    if (!id) {
        return <div className="w-full h-screen flex items-center justify-center text-black text-center">Invalid Ad ID</div>;
    }

    let ad = null;
    try {
        // Fetch ad data on server side
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jmdadvertisement.com';
        const res = await fetch(`${baseUrl}/api/ads/update?mediacode=${encodeURIComponent(id)}`, {
            cache: 'no-store'
        });
        
        if (res.ok) {
            ad = await res.json();
        }
    } catch (error) {
        console.error('Error fetching ad:', error);
    }

    return (
        <>
            {/* Structured Data for SEO */}
            {ad && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Product",
                            "name": ad.title,
                            "description": ad.message || `${ad.type} advertising space in ${ad.city}`,
                            "image": ad.imageUrl,
                            "brand": {
                                "@type": "Brand",
                                "name": "JMD Advertisement"
                            },
                            "offers": {
                                "@type": "Offer",
                                "price": ad.priceperday,
                                "priceCurrency": "INR",
                                "priceSpecification": {
                                    "@type": "PriceSpecification",
                                    "price": ad.priceperday,
                                    "priceCurrency": "INR",
                                    "referenceQuantity": {
                                        "@type": "QuantitativeValue",
                                        "value": "1",
                                        "unitText": "day"
                                    }
                                },
                                "availability": "https://schema.org/InStock",
                                "seller": {
                                    "@type": "Organization",
                                    "name": "JMD Advertisement"
                                }
                            },
                            "category": ad.type,
                            "sku": ad.mediacode,
                            "additionalProperty": [
                                {
                                    "@type": "PropertyValue",
                                    "name": "Size",
                                    "value": ad.size
                                },
                                {
                                    "@type": "PropertyValue",
                                    "name": "Lighting",
                                    "value": ad.lighting
                                },
                                {
                                    "@type": "PropertyValue",
                                    "name": "Location",
                                    "value": ad.city
                                }
                            ],
                            "provider": {
                                "@type": "Organization",
                                "name": "JMD Advertisement",
                                "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://jmdadvertisement.com'
                            }
                        })
                    }}
                />
            )}
            
            {/* Client component for interactive functionality */}
            <AdDetailClient initialAd={ad} adId={id} />
        </>
    );
};

export default Page;