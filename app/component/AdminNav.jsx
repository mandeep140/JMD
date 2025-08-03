"use client";
import React, { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react';
import { IoMdArrowDropdown } from "react-icons/io";
import { MdDashboard } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { IoCalendarOutline, IoSearch } from "react-icons/io5";
import { TbReportAnalytics } from "react-icons/tb";
import { IoHomeSharp } from "react-icons/io5";
import { MdDownload } from "react-icons/md";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/inventory', label: 'Manage Inventory' },
  { href: '/admin/booking', label: 'Booking Request' },
  { href: '/admin/report', label: 'Report' },
  { href: '/admin/download-contact', label: 'Download Contact' },
  { href: '/', label: 'Home' }
];

const AdminNav = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (search.trim().length === 0) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(() => {
      fetch(`/api/ads?mediacode=${encodeURIComponent(search)}`)
        .then(res => res.json())
        .then(res => {
          setSearchResults(Array.isArray(res) ? res : []);
          setSearching(false);
        })
        .catch(() => {
          setSearchResults([]);
          setSearching(false);
        });
    }, 400); // debounce
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className='w-full min-h-screen bg-gray-100 flex flex-col md:flex-row items-stretch justify-center'>
      {/* sidebar */}
      <div className='w-full md:w-[20%] h-auto md:h-[100vh] bg-white shadow-lg flex flex-row md:flex-col items-center md:items-center justify-between p-3 md:p-5 pd-2  z-20'>
        <div className='w-full flex flex-row text-center px-2 md:px-4 items-center justify-between gap-2 relative'>
          <span className='flex flex-row items-center justify-center gap-2'>
            <img src="/admin/img/user.png" alt="Logo" className='w-10 object-contain' />
            <h2 className='text-black/80 text-base md:text-lg'>JMD Admin</h2>
          </span>
          <button onClick={() => setOpen(!open)} style={{
            rotate: open ? '45deg' : '0deg',
            transition: 'rotate 0.3s ease-in-out',
          }}>
            <IoMdArrowDropdown className='text-black cursor-pointer' />
          </button>
          {/* Dropdown overlay */}
          <div
            className="absolute top-full left-0 w-40 md:w-48 flex justify-center items-center bg-black/20 backdrop-blur-lg rounded shadow-lg z-50 transition-all duration-300 ease-in-out"
            style={{
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transform: open ? 'translateY(0)' : 'translateY(-10px)'
            }}
          >
            <button
              onClick={() => { setLoading(true); signOut({ callbackUrl: '/admin/login' }) }}
              className="my-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200 w-full"
            >
              {loading ? "Loading..." : "Logout"}
            </button>
          </div>
        </div>
        <div className='hidden md:flex w-full h-8/10 flex-col justify-start mt-4'>
          {/* side nav */}
          {links.map(link => {
            const isActive = pathname.includes(link.href) && link.href !== '/';
            if (link.href === '/') {
              return (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => setShowHomeConfirm(true)}
                  className={`w-full flex flex-row items-center ps-[20%] py-[3%] gap-[8%] text-md font-bold cursor-pointer rounded-md mb-2
                    ${isActive ? 'text-blue-600 bg-blue-200' : 'text-black hover:bg-blue-50'}`}
                >
                  <IoHomeSharp className='text-xl' />
                  <h2 className='text-black/80'>{link.label}</h2>
                </button>
              );
            }
            return (
              <Link key={link.href} href={link.href}>
                <div className={`w-full flex flex-row items-center ps-[20%] py-[3%] gap-[8%] text-md font-bold cursor-pointer rounded-md mb-2
                  ${isActive ? 'text-blue-600 bg-blue-200' : 'text-black hover:bg-blue-50'}`}>
                  {link.label === 'Dashboard' && <MdDashboard className='text-xl' />}
                  {link.label === 'Manage Inventory' && <FaClipboardList className='text-xl' />}
                  {link.label === 'Booking Request' && <IoCalendarOutline className='text-xl' />}
                  {link.label === 'Report' && <TbReportAnalytics className='text-xl' />}
                  {link.label === 'Download Contact' && <MdDownload className='text-xl' />}
                  <h2 className='text-black/80'>{link.label}</h2>
                </div>
              </Link>
            );
          })}
        </div>
        <div className='hidden md:flex w-full h-1/10'>
          <span className="mt-auto mx-auto mb-6 text-center text-black font-extrabold tracking-wide flex flex-col items-center gap-1">
            <h1>JMD</h1>
            <h1 className="-mt-2">ADVERTISEMENT</h1>
            <a href="https://www.showa.online" target="_blank" className="text-sm font-medium hover:text-black/70">Showa.online</a>
          </span>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="flex md:hidden w-full justify-start overflow-x-auto bg-white py-2 shadow z-10 mt-2 px-2">
        <div className="flex gap-1 min-w-max">
          {links.map(link => {
            const isActive = pathname.includes(link.href) && link.href !== '/';
            if (link.href === '/') {
              return (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => setShowHomeConfirm(true)}
                  className={`flex flex-col items-center ${isActive ? 'text-blue-600 bg-blue-100' : 'text-black bg-transparent'} px-1.5 py-1 rounded min-w-[60px]`}
                >
                  <IoHomeSharp className='text-lg' />
                  <span className="text-[10px] font-medium">{link.label}</span>
                </button>
              );
            }
            return (
              <Link key={link.href} href={link.href}>
                <div className={`flex flex-col items-center ${isActive ? 'text-blue-600 bg-blue-100' : 'text-black bg-transparent'} px-1.5 py-1 rounded min-w-[60px]`}>
                  {link.label === 'Dashboard' && <MdDashboard className='text-lg' />}
                  {link.label === 'Manage Inventory' && <FaClipboardList className='text-lg' />}
                  {link.label === 'Booking Request' && <IoCalendarOutline className='text-lg' />}
                  {link.label === 'Report' && <TbReportAnalytics className='text-lg' />}
                  {link.label === 'Download Contact' && <MdDownload className='text-lg' />}
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {link.label === 'Manage Inventory' ? 'Inventory' : 
                     link.label === 'Booking Request' ? 'Booking' :
                     link.label === 'Download Contact' ? 'Downloads' : 
                     link.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Confirmation Popup */}
      {showHomeConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4 text-black">Are you sure you want to go to Home?</h2>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => {
                  setShowHomeConfirm(false);
                  router.push('/');
                }}
              >
                Yes
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => setShowHomeConfirm(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {/* main content */}
      <div className='w-full md:w-[80%] h-[100vh] bg-white pt-0 flex flex-col items-center justify-start'>
        <div className='w-full md:h-1/10 flex flex-row items-center gap-2 md:gap-4 px-2 md:px-4 py-2 text-black relative'>
          <IoSearch className='text-blue-600' />
          <input
            type="text"
            placeholder="Quick Search ad by media code"
            className="border border-gray-300/10 rounded-2xl w-full md:w-[50%] focus:border-blue-600 focus:outline-none focus:ring-0 focus:border-2 px-2 py-1"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {/* Search Results Dropdown */}
          {search && (
            <div className="absolute top-full left-8 md:left-10 w-[90%] md:w-[50%] bg-white border border-gray-200 rounded shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
              {searching && (
                <div className="p-2 text-gray-500 text-sm">Searching...</div>
              )}
              {!searching && searchResults.length === 0 && (
                <div className="p-2 text-gray-500 text-sm">No results found.</div>
              )}
              {searchResults.map((ad, idx) => (
                <Link
                  key={ad._id || idx}
                  href={`/find-hoardings/${ad.mediacode}`}
                  className="block px-4 py-2 hover:bg-blue-100 text-black"
                  onClick={() => {
                    setSearch('');
                    setSearchResults([]);
                  }}
                >
                  <span className="font-bold">{ad.mediacode}</span> - {ad.title}
                </Link>
              ))}
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

export default AdminNav