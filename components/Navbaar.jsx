"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navbaar = () => {
    const path = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    
    // Close menu on route change or scroll
    useEffect(() => {
        if (menuOpen) {
            const closeMenu = () => setMenuOpen(false);
            window.addEventListener('resize', closeMenu);
            window.addEventListener('scroll', closeMenu);
            return () => {
                window.removeEventListener('resize', closeMenu);
                window.removeEventListener('scroll', closeMenu);
            }
        }
    }, [menuOpen]);
    
    if (path.includes("/admin")) return null;
    const scrolledNav = {
        paddingTop: scrolled ? '0.5rem' : '1.25rem',
        paddingBottom: scrolled ? '0.5rem' : '1.25rem',
        top: scrolled ? '0.3em' : '0.3em',
        marginLeft: scrolled ? '10%' : '',
        width: scrolled ? '80%' : '100%',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        border: scrolled ? '1px solid rgba(255, 255, 255, 0.3)' : '',
        borderRadius: scrolled ? '20px' : '0'
    }

    return (
        <>
            <nav
                className={`flex justify-between items-center p-4 border-b-1 text-white fixed top-0 md:px-[1%] z-50 ${scrolled ? " bg-black/15 backdrop-blur-md" : "bg-transparent"} transition-all duration-300`}
                style={scrolledNav}
            >
                <div className='logo pl-2 flex-shrink-0'>
                    <Link href="/">
                        <img src="/images/jmd_logo.png" alt="" className="h-10 w-auto" />
                    </Link>
                </div>
                {/* Hamburger for mobile */}
                <button
                    className="lg:hidden flex flex-col justify-center items-center ml-auto z-50"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`block w-7 h-1 bg-white rounded transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
                    <span className={`block w-7 h-1 bg-white rounded my-1 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}></span>
                    <span className={`block w-7 h-1 bg-white rounded transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
                </button>
                {/* Desktop nav */}
                <div className='nav-links gap-4 flex items-center max-lg:hidden'>
                    <Link href="/about" className={`${scrolled ? "" : "text-xl"} hover:underline duration-300`}>About us</Link>
                    <Link href="/#services" className={`${scrolled ? "" : "text-xl"} hover:underline duration-300`}>Services</Link>
                    <Link href="/#city" className={`${scrolled ? "" : "text-xl"} hover:underline duration-300`}>Cities</Link>
                    <Link href="/#clients" className={`${scrolled ? "" : "text-xl"} hover:underline duration-300`}>Clients</Link>
                    <Link href="/#videos" className={`${scrolled ? "" : "text-xl"} hover:underline duration-300`}>Videos</Link>
                </div>
                <Link
                    href="/#contact-us"
                    className={`text-xl px-3 py-2 border-3 rounded-xl max-lg:hidden ${scrolled ? "hover:bg-white hover:text-red-500 bg-red-500 border-red-500" : "hover:border-red-500"} duration-200`}
                >
                    Contact us
                </Link>
            </nav>
                <div className="fixed inset-0 w-full h-full top-0 left-0 text-white bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-8 z-40 lg:hidden transition-all ease-in-out duration-500"
                    style={{ transform: menuOpen ? 'translateY(0)' : 'translateY(-100%)', opacity: menuOpen ? 1 : 0 }}
                >
                    <Link href="/about" className="text-2xl font-semibold hover:underline" onClick={() => setMenuOpen(false)}>About us</Link>
                    <Link href="/#services" className="text-2xl font-semibold hover:underline" onClick={() => setMenuOpen(false)}>Services</Link>
                    <Link href="/#city" className="text-2xl font-semibold hover:underline" onClick={() => setMenuOpen(false)}>Cities</Link>
                    <Link href="/#clients" className="text-2xl font-semibold hover:underline" onClick={() => setMenuOpen(false)}>Clients</Link>
                    <Link href="/#videos" className="text-2xl font-semibold hover:underline" onClick={() => setMenuOpen(false)}>Videos</Link>
                    <Link
                        href="/#contact-us"
                        className="text-xl px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-white hover:text-red-500 border-2 border-red-500 duration-200"
                        onClick={() => setMenuOpen(false)}
                    >
                        Contact us
                    </Link>
                </div>
        </>

    )
}

export default Navbaar