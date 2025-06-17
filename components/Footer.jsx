import React from 'react'
import { FaFacebookSquare } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa6";

const Footer = () => {
    return (
        <footer>
            <div className='w-full min-h-[60vh] bg-red-500  overflow-hidden relative'>
                <img src="svg/JMD.svg" className="w-full h-full absolute opacity-20" alt="JMD" />
                <div className='flex flex-row items-center justify-evenly min-h-full z-1'>
                    <div className='h-[17rem] w-[16rem] mt-15 z-1 flex items-center justify-center flex-col'>
                        <img src="images/footer_logo.png" className='w-full mb-auto' alt="" />
                        <p className='mt-4 text-sm font-extralight text-white/70'>Jai Mata Di Advertising, based in Harhargutu, Jamshedpur, is a decade strong and the fastest growing advertising agency in East India, committed to delivering effective, result-driven campaigns. With a deep understanding of client needs,
                            we focus on crafting impactful outdoor advertising solutions marked by quality, consistency, and commitment.</p>
                        <span className='w-full flex items-center justify-start mt-8 text-black/70 text-2xl gap-4'>
                            <FaFacebookSquare className='hover:text-black duration-100 cursor-pointer' />
                            <FaSquareInstagram className='hover:text-black duration-100 cursor-pointer' />
                            <FaSquareXTwitter className='hover:text-black duration-100 cursor-pointer' />
                            <FaLinkedin className='hover:text-black duration-100 cursor-pointer' />
                        </span>
                    </div>
                    <div className='h-[17rem] w-[10rem] mt-15 z-1 flex items-center justify-center flex-col'>
                        <h1 className='mb-auto text-xl font-bold text-black/60 w-full flex justify-start'>QUICK LINKS</h1>
                        <span className='w-full flex items-start justify-start flex-col gap-2 text-black/70 mb-auto'>
                            <p className=' font-extralight text-white/70 cursor-pointer hover:text-black duration-100'>Home</p>
                            <p className=' font-extralight text-white/70 cursor-pointer hover:text-black duration-100'>Services</p>
                            <p className=' font-extralight text-white/70 cursor-pointer hover:text-black duration-100'>About Us</p>
                            <p className=' font-extralight text-white/70 cursor-pointer hover:text-black duration-100'>Contact Us</p>
                            <p className=' font-extralight text-white/70 cursor-pointer hover:text-black duration-100'>Privacy Policy</p>
                            <p className=' font-extralight text-white/70 cursor-pointer hover:text-black duration-100'>Terms & Conditions</p>
                        </span>
                    </div>
                    <div className='h-[17rem] w-[12rem] mt-15 z-1 flex items-center justify-center flex-col'>
                        <h1 className='mb-auto text-lg font-bold text-black/60 w-full flex justify-start'>EXPLORE SERVICES</h1>
                        <span className='w-full flex items-start justify-start flex-col gap-2 text-black/70 mb-auto'>
                            <p className=' font-extralight text-white/70 cursor-pointer hover:text-black duration-100'>Billboard</p>
                            <p className=' font-extralight text-white/70 cursor-pointer hover:text-black duration-100'>Digital Billboard</p>
                            <p className=' font-extralight text-white/70 cursor-pointer hover:text-black duration-100'>Airport Branding</p>
                            <p className=' font-extralight text-white/70 cursor-pointer hover:text-black duration-100'>Mall Media</p>
                            <p className=' font-extralight text-white/70 cursor-pointer hover:text-black duration-100'>Transit Media</p>
                        </span>
                    </div>
                    <div className='min-h-[17rem] w-[12rem] mt-15 pt-9 z-1 flex items-center justify-center flex-col gap-4'>
                        <h1 className='mb-auto text-lg font-bold text-black/60 w-full flex justify-start'>CONTACT INFO</h1>
                        <span className='w-full flex items-start justify-start flex-col gap-2 text-black/70 mb-auto'>
                            <span>
                                <p className=' font-bold text-black/60'>Phone:</p>
                                <p className=' font-extralight text-white/70'>+91-9204965321</p>
                                <p className=' font-extralight text-white/70'>+91-7368810121</p>
                                <p className=' font-extralight text-white/70'>+91-7368810125</p>
                            </span>
                            <span>
                                <p className=' font-bold text-black/60'>Email:</p>
                                <p className=' font-extralight text-white/70'>vishaljmd.jsr@gmail.com</p>
                            </span>
                            <span>
                                <p className=' font-bold text-black/60'>Address:</p>
                                <p className=' font-extralight text-white/70'>B-5 Murli Garden,
                                    TRF Colony, HarhargutuJamshedpur, Jharkhand (831002)</p>
                            </span>

                        </span>
                    </div>
                </div>
                <div className='h-[1px] w-[90%] bg-white/50 rounded-md mx-auto mt-10'></div>
                <div className='w-[90%] flex flex-row text-center justify-between mx-auto items-center my-4 z-1'>
                    <p className='text-center text-white/70 text-sm'>Copyright © 2025 JMD Advertising | All rights reserved</p>
                    <p className='text-center text-white/70 text-sm z-1'>Created With Love By <a href="https://www.showa.online" target='_blank'><b className='hover:text-black/70 duration-150 cursor-pointer'>Showa.online</b></a></p>
                </div>
            </div>
        </footer>
    )
}

export default Footer