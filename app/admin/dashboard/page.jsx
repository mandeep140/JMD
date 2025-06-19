"use client";
import React, { useEffect } from 'react';
import AdminNav from '@/app/component/AdminNav';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
     return <div className="w-full h-screen flex items-center justify-center text-black text-center">Hold on While we fetching data - JMD <br />Showa.online</div>;
  }

  if (status === "authenticated") {
    return (
      <AdminNav>
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
      </AdminNav>
    );
  }

};

export default Dashboard;