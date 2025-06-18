"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from 'next-auth/react';
import { IoMdArrowDropdown } from "react-icons/io";
import { MdDashboard } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { IoCalendarOutline, IoSearch } from "react-icons/io5";
import { TbReportAnalytics } from "react-icons/tb";

const ads = [
  {
    title: "Unipole at NH 45, Gola Road Vajnenvn...",
    city: "Jamshedpur",
    locality: "Gola Road",
    type: "Digital",
    dateAdded: "06 June, 2025",
  },
  {
    title: "Unipole at NH 45, Gola Road Vajnenvn...",
    city: "Jamshedpur",
    locality: "Gola Road",
    type: "Digital",
    dateAdded: "06 June, 2025",
  },
  {
    title: "Unipole at NH 45, Gola Road Vajnenvn...",
    city: "Jamshedpur",
    locality: "Gola Road",
    type: "Digital",
    dateAdded: "06 June, 2025",
  },
  {
    title: "Unipole at NH 45, Gola Road Vajnenvn...",
    city: "Jamshedpur",
    locality: "Gola Road",
    type: "Digital",
    dateAdded: "06 June, 2025",
  },
  {
    title: "Unipole at NH 45, Gola Road Vajnenvn...",
    city: "Jamshedpur",
    locality: "Gola Road",
    type: "Digital",
    dateAdded: "06 June, 2025",
  },
  {
    title: "Unipole at NH 45, Gola Road Vajnenvn...",
    city: "Jamshedpur",
    locality: "Gola Road",
    type: "Digital",
    dateAdded: "06 June, 2025",
  },
  {
    title: "Unipole at NH 45, Gola Road Vajnenvn...",
    city: "Jamshedpur",
    locality: "Gola Road",
    type: "Digital",
    dateAdded: "06 June, 2025",
  },
  {
    title: "Unipole at NH 45, Gola Road Vajnenvn...",
    city: "Jamshedpur",
    locality: "Gola Road",
    type: "Digital",
    dateAdded: "06 June, 2025",
  },
  {
    title: "Unipole at NH 45, Gola Road Vajnenvn...",
    city: "Jamshedpur",
    locality: "Gola Road",
    type: "Digital",
    dateAdded: "06 June, 2025",
  },
  {
    title: "Unipole at NH 45, Gola Road Vajnenvn...",
    city: "Jamshedpur",
    locality: "Gola Road",
    type: "Digital",
    dateAdded: "06 June, 2025",
  },
  {
    title: "Unipole at NH 45, Gola Road Vajnenvn...",
    city: "Jamshedpur",
    locality: "Gola Road",
    type: "Digital",
    dateAdded: "06 June, 2025",
  },
];

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="w-full h-screen flex items-center justify-center text-black">Hold on While we fetching data...</div>;
  }

  if (status === "authenticated") {
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
              rotate: open ? '180deg' : '0deg',
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
            <div className='w-full flex flex-row items-center ps-[20%] py-[3%] gap-[8%] text-md font-bold cursor-pointer text-blue-600 bg-blue-200 rounded-md mb-2'>
              <MdDashboard className='text-xl' />
              <h2 className='text-black/80'>Dashboard</h2>
            </div>
            <div className='w-full flex flex-row items-center ps-[20%] py-[3%] gap-[8%] text-md font-bold cursor-pointer text-black hover:bg-blue-50 rounded-md mb-2'>
              <FaClipboardList className='text-xl' />
              <h2 className='text-black/80'>Manage Inventory</h2>
            </div>
            <div className='w-full flex flex-row items-center ps-[20%] py-[3%] gap-[8%] text-md font-bold cursor-pointer text-black hover:bg-blue-50 rounded-md mb-2'>
              <IoCalendarOutline className='text-xl' />
              <h2 className='text-black/80'>Booking Request</h2>
            </div>
            <div className='w-full flex flex-row items-center ps-[20%] py-[3%] gap-[8%] text-md font-bold cursor-pointer text-black hover:bg-blue-50 rounded-md'>
              <TbReportAnalytics className='text-xl' />
              <h2 className='text-black/80'>Report</h2>
            </div>
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
        <div className="flex md:hidden w-full justify-around bg-white py-2 shadow z-10 mt-2">
          <button className="flex flex-col items-center text-blue-600">
            <MdDashboard className='text-xl' />
            <span className="text-xs">Dashboard</span>
          </button>
          <button className="flex flex-col items-center text-black">
            <FaClipboardList className='text-xl' />
            <span className="text-xs">Inventory</span>
          </button>
          <button className="flex flex-col items-center text-black">
            <IoCalendarOutline className='text-xl' />
            <span className="text-xs">Booking</span>
          </button>
          <button className="flex flex-col items-center text-black">
            <TbReportAnalytics className='text-xl' />
            <span className="text-xs">Report</span>
          </button>
        </div>
        {/* main content */}
        <div className='w-full md:w-[80%] h-[100vh] bg-white pt-0 flex flex-col items-center justify-start'>
          <div className='w-full md:h-1/10 flex flex-row items-center gap-2 md:gap-4 px-2 md:px-4 py-2 text-black'>
            <IoSearch className='text-blue-600' />
            <input
              type="text"
              placeholder="Quick Search ad by media code"
              className="border border-gray-300/10 rounded-2xl w-full md:w-[50%] focus:border-blue-600 focus:outline-none focus:ring-0 focus:border-2 px-2 py-1"
            />
          </div>
          <div className='w-full md:h-9/10 flex flex-col items-center justify-start gap-4 p-2 md:p-6 bg-[#E9E9E9]'>
            <div className='w-full flex flex-col justify-start items-start bg-white shadow-lg rounded-xl p-2 md:p-4 mb-2'>
              <h2 className='text-base md:text-lg font-bold text-blue-600'>Media Data</h2>
              <div className='w-full flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4'>
                <span className='w-full md:w-1/3 flex flex-col items-center justify-center text-yellow-500 rounded-lg p-2'>
                  <span className='text-2xl md:text-4xl font-bold '>150</span>
                  <h3 className='text-sm md:text-md font-semibold'>Total Media</h3>
                </span>
                <div className='hidden md:block w-[2px] h-[90%] bg-black'></div>
                <span className='w-full md:w-1/3 flex flex-col items-center justify-center text-green-500 rounded-lg p-2'>
                  <span className='text-2xl md:text-4xl font-bold '>50</span>
                  <h3 className='text-sm md:text-md font-semibold '>Available Media</h3>
                </span>
                <div className='hidden md:block w-[2px] h-[90%] bg-black'></div>
                <span className='w-full md:w-1/3 flex flex-col items-center justify-center text-red-500 rounded-lg p-2'>
                  <span className='text-2xl md:text-4xl font-bold '>100</span>
                  <h3 className='text-sm md:text-md font-semibold '>Booked Media</h3>
                </span>
              </div>
            </div>
            <div className='w-full flex flex-col lg:flex-row gap-3 justify-center items-center'>
              <div className='w-full lg:w-[30%] bg-white rounded-2xl flex flex-col items-start gap-4 md:gap-9 p-2 md:p-3 justify-start mb-2 lg:mb-0'>
                <h2 className='text-base md:text-lg font-bold text-blue-600'>Lead Data</h2>
                <span className='w-full flex flex-col items-start justify-start'>
                  <h2 className='text-black text-sm md:text-base'>Lead's received today</h2>
                  <h2 className='w-full h-full text-lg md:text-2xl bg-gray-200 text-black py-2 ps-4 rounded-md'>56</h2>
                </span>
                <span className='w-full flex flex-col items-start justify-start'>
                  <h2 className='text-black text-sm md:text-base'>Lead's received this week</h2>
                  <h2 className='w-full h-full text-lg md:text-2xl bg-gray-200 text-black py-2 ps-4 rounded-md'>431</h2>
                </span>
                <span className='w-full flex flex-col items-start justify-start'>
                  <h2 className='text-black text-sm md:text-base'>Booking request today</h2>
                  <h2 className='w-full h-full text-lg md:text-2xl bg-gray-200 text-black py-2 ps-4 rounded-md'>12</h2>
                </span>
              </div>
              <div className='w-full lg:w-[70%] bg-white rounded-2xl flex flex-col items-start p-2 md:p-3 justify-start'>
                <h2 className='text-base md:text-lg font-bold text-blue-600'>Quick summary: Recently added listing</h2>
                <div className="w-full overflow-x-auto text-black mt-2 md:mt-4" style={{ maxHeight: '320px' }}>
                  <div style={{ maxHeight: '100%', overflowY: 'auto', width: '100%' }}>
                    <table className="min-w-[600px] w-full table-fixed border-collapse text-xs md:text-sm">
                      <thead>
                        <tr className="bg-white border-y border-black text-left font-semibold">
                          <th className="w-1/4 px-2 md:px-4 py-2 border-r sticky -top-1 bg-white z-10">Title</th>
                          <th className="w-1/5 px-2 md:px-4 py-2 border-r sticky -top-1 bg-white z-10">City</th>
                          <th className="w-1/5 px-2 md:px-4 py-2 border-r sticky -top-1 bg-white z-10">Locality</th>
                          <th className="w-1/5 px-2 md:px-4 py-2 border-r sticky -top-1 bg-white z-10">Type</th>
                          <th className="w-1/5 px-2 md:px-4 py-2 sticky -top-1 bg-white z-10">Date Added</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ads.map((ad, index) => (
                          <tr
                            key={index}
                            className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                          >
                            <td className="px-2 md:px-4 py-3 border-r truncate max-w-xs">
                              {ad.title}
                            </td>
                            <td className="px-2 md:px-4 py-3 border-r">{ad.city}</td>
                            <td className="px-2 md:px-4 py-3 border-r">{ad.locality}</td>
                            <td className="px-2 md:px-4 py-3 border-r">{ad.type}</td>
                            <td className="px-2 md:px-4 py-3">{ad.dateAdded}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

};

export default Dashboard;