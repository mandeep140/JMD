"use client";
import React from 'react'
import { FaFacebookSquare } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa6";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Footer = () => {
    const path = usePathname();
    if (path.includes("/admin")) return null;
    return (
        <footer>
            <div className='w-full min-h-[60vh] bg-[#FE3737] overflow-hidden relative'>
                <img src="/svg/JMD.svg" className="w-full h-full absolute opacity-20" alt="JMD" />

                <div className='flex flex-col lg:flex-row items-start justify-evenly min-h-full z-1 gap-10 lg:gap-0 px-4 py-8'>
                    {/* Logo & About */}
                    <div className='h-auto w-full max-w-xs mt-8 z-1 flex items-center justify-center flex-col'>
                        <img src="/images/footer_logo.png" className='w-full mb-auto max-w-[180px]' alt="" />
                        <p className='mt-4 text-sm font-extralight text-white text-left'>Jai Mata Di Advertising, based in Harhargutu, Jamshedpur, is a decade strong and the fastest growing advertising agency in East India, committed to delivering effective, result-driven campaigns. With a deep understanding of client needs,
                            we focus on crafting impactful outdoor advertising solutions marked by quality, consistency, and commitment.</p>
                        <span className='w-full flex items-start justify-start mt-8 text-black/70 text-2xl gap-4'>
                            <FaFacebookSquare className='hover:text-black duration-100 cursor-pointer' />
                            <FaSquareInstagram className='hover:text-black duration-100 cursor-pointer' />
                            <FaSquareXTwitter className='hover:text-black duration-100 cursor-pointer' />
                            <FaLinkedin className='hover:text-black duration-100 cursor-pointer' />
                        </span>
                    </div>

                    {/* Quick Links */}
                    <div className='h-auto w-full max-w-[180px] mt-8 z-1 flex items-start justify-start lg:items-center lg:justify-center flex-col'>
                        <h1 className='mb-auto text-xl font-bold text-black/60 w-full flex justify-start'>QUICK LINKS</h1>
                        <span className='w-full flex mt-2 items-start justify-start flex-col gap-2 text-black/70 mb-auto'>
                            <Link href='/'><p className='font-extralight text-white cursor-pointer hover:text-black duration-100'>Home</p></Link>
                            <Link href='#services'><p className='font-extralight text-white cursor-pointer hover:text-black duration-100'>Services</p></Link>
                            <Link href='/about'><p className='font-extralight text-white cursor-pointer hover:text-black duration-100'>About Us</p></Link>
                            <Link href='#contact-us'><p className='font-extralight text-white cursor-pointer hover:text-black duration-100'>Contact Us</p></Link>
                        </span>
                    </div>

                    {/* Explore Services */}
                    <div className='h-auto w-full max-w-[200px] mt-8 z-1 flex items-start justify-start lg:items-center lg:justify-center flex-col'>
                        <h1 className='mb-auto text-lg font-bold text-black/60 w-full flex justify-start'>EXPLORE SERVICES</h1>
                        <span className='w-full flex items-start mt-2 justify-start flex-col gap-2 text-black/70 mb-auto'>
                            <Link href='/find-hoardings?type=billboard#results'><p className='font-extralight text-white cursor-pointer hover:text-black duration-100'>Billboard</p></Link>
                            <Link href='/find-hoardings?type=digital_billboard#results'><p className='font-extralight text-white cursor-pointer hover:text-black duration-100'>Digital Billboard</p></Link>
                            <Link href='/find-hoardings?type=airport_branding#results'><p className='font-extralight text-white cursor-pointer hover:text-black duration-100'>Airport Branding</p></Link>
                            <Link href='/find-hoardings?type=mall_media#results'><p className='font-extralight text-white cursor-pointer hover:text-black duration-100'>Mall Media</p></Link>
                            <Link href='/find-hoardings?type=transit_media#results'><p className='font-extralight text-white cursor-pointer hover:text-black duration-100'>Transit Media</p></Link>
                        </span>
                    </div>

                    {/* Contact Info */}
                    <div className='min-h-[17rem] w-full max-w-[220px] mt-8 z-1 flex items-start justify-start lg:items-center lg:justify-center flex-col gap-4'>
                        <h1 className='mb-auto text-lg font-bold text-black/60 w-full flex justify-start'>CONTACT INFO</h1>
                        <span className='w-full flex items-start justify-start flex-col gap-2 text-black/70 mb-auto'>
                            <span>
                                <p className='font-bold text-black/60'>Phone:</p>
                                <p className='font-extralight text-white'>+91-9204965321</p>
                                <p className='font-extralight text-white'>+91-7368810121</p>
                                <p className='font-extralight text-white'>+91-7368810125</p>
                            </span>
                            <span>
                                <p className='font-bold text-black/60'>Email:</p>
                                <p className='font-extralight text-white'>vishaljmd.jsr@gmail.com</p>
                            </span>
                            <span>
                                <p className='font-bold text-black/60'>Address:</p>
                                <p className='font-extralight text-white'>B-5 Murli Garden, TRF Colony, Harhargutu Jamshedpur, Jharkhand (831002)</p>
                            </span>
                        </span>
                    </div>
                </div>

                {/* Bottom Divider and Copyright */}
                <div className='h-[1px] w-[90%] bg-white/50 rounded-md mx-auto mt-10'></div>
                <div className='w-[90%] flex flex-col md:flex-row text-center justify-between mx-auto items-center my-4 z-1 gap-2'>
                    <p className='text-center text-white text-sm'>Copyright © 2025 JMD Advertising | All rights reserved</p>
                    <p className='text-center text-white text-sm z-1'>
                        Created With Love By <a href="https://www.showa.online" target='_blank' rel="noopener noreferrer"><b className='hover:text-black/70 duration-150 cursor-pointer'>Showa.online</b></a>
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
