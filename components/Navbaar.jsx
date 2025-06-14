"use client"
import React from 'react'
import Link from 'next/link'
import { useState, useEffect } from 'react'


const Navbaar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrolledNav = {
        paddingTop: scrolled ? '0.5rem' : '1.25rem',
        paddingBottom: scrolled ? '0.5rem' : '1.25rem',
        top: scrolled ? '0.3em' : '',
        marginLeft: scrolled ? '8%' : '',
        width: scrolled ? '85%' : '100%',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        border: scrolled ? '1px solid rgba(255, 255, 255, 0.3)' : '',
        borderRadius: scrolled ? '20px' : '0'
    }

    return (
        <nav className={`flex justify-between items-center p-4 border-b-1 text-white fixed top-0 px-[10%] z-50 ${scrolled? " bg-white/1 backdrop-blur-lg" : "bg-transparent"} transition-all duration-300`} style={scrolledNav}>
            <div className='logo'>
                <img src="images/jmd_logo.png" alt="" />
            </div>
            <div className='nav-links gap-4 flex items-center'>
                <Link href="/about" className={`${scrolled? "": "text-xl"} hover:underline duration-300`}>About us</Link>
                <Link href="/about" className={`${scrolled? "": "text-xl"} hover:underline duration-300`}>Services</Link>
                <Link href="/about" className={`${scrolled? "": "text-xl"} hover:underline duration-300`}>Cities</Link>
                <Link href="/about" className={`${scrolled? "": "text-xl"} hover:underline duration-300`}>Clients</Link>
                <Link href="/about" className={`${scrolled? "": "text-xl"} hover:underline duration-300`}>Videos</Link>
            </div>
            <Link href="/about" className='text-xl px-3 py-2 border-3 rounded-xl hover:border-red-600 duration-200'>Contact us</Link>

        </nav>
    )
}

export default Navbaar