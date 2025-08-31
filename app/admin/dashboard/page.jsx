"use client";
import React, { useEffect, useState, useRef } from 'react';
import AdminNav from '@/app/component/AdminNav';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { MdDownloading } from 'react-icons/md';
import * as XLSX from 'xlsx';
import ExportToExcel from '@/app/component/ExportToExcel';

const Dashboard = () => {
  const { status } = useSession();
  const router = useRouter();
  const [ads, setAds] = useState([]);
  const [totalads, setTotalAds] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [expiringBookings, setExpiringBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const exportRef = useRef(null);

  // Lead and booking stats
  const [todayLeads, setTodayLeads] = useState(0);
  const [weekLeads, setWeekLeads] = useState(0);
  const [todayBookings, setTodayBookings] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchAds = async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/ads?date=7");
          const data = await res.json();
          setAds(data);
        } catch (err) {
          setAds([]);
          alert("Failed to fetch ads. Please try again later.");
        }
        setLoading(false);
      };

      const fetchContactsAndBookings = async () => {
        setLoading(true);
        try {
          // Fetch contacts (leads)
          const resContact = await fetch("/api/contact");
          const dataContact = await resContact.json();
          setContacts(dataContact);

          // Calculate today's and last 7 days' leads
          const today = new Date();
          const todayStr = today.toISOString().slice(0, 10);
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 6);

          let todayLeadCount = 0;
          let weekLeadCount = 0;

          dataContact.forEach(c => {
            if (!c.createdAt) return;
            const contactDate = new Date(c.createdAt);
            const contactStr = contactDate.toISOString().slice(0, 10);

            // Today
            if (contactStr === todayStr) todayLeadCount++;

            // Last 7 days (including today)
            if (contactDate >= weekAgo && contactDate <= today) weekLeadCount++;
          });

          setTodayLeads(todayLeadCount);
          setWeekLeads(weekLeadCount);

          // Fetch bookings
          const resBooking = await fetch("/api/booking");
          const dataBooking = await resBooking.json();
          setBookings(dataBooking);

          // Calculate today's bookings
          let todayBookingCount = 0;
          dataBooking.forEach(b => {
            if (!b.date) return;
            const bookingDate = new Date(b.date);
            const bookingStr = bookingDate.toISOString().slice(0, 10);
            if (bookingStr === todayStr) todayBookingCount++;
          });
          setTodayBookings(todayBookingCount);

        } catch (err) {
          setContacts([]);
          setBookings([]);
          setTodayLeads(0);
          setWeekLeads(0);
          setTodayBookings(0);
          alert("Failed to fetch data. Please try again later.");
        }
        setLoading(false);
      };

      fetchContactsAndBookings();
      fetchAds();
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchAds = async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/ads");
          const data = await res.json();
          setTotalAds(data);

          // Filter ads that will become free in next 15 days (only booked ads)
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time to start of day
          const next15Days = new Date();
          next15Days.setDate(today.getDate() + 14);
          next15Days.setHours(23, 59, 59, 999); // End of the 15th day

          const expiring = data.filter(ad => {
            // Only include ads that are currently booked
            if (ad.status !== "Booked" || !ad.bookedtill) {
              return false;
            }

            // Parse the bookedtill date
            let bookedTillDate;
            try {
              if (ad.bookedtill.includes('/')) {
                // Handle DD/MM/YYYY format
                const [day, month, year] = ad.bookedtill.split('/');
                bookedTillDate = new Date(year, month - 1, day);
              } else if (ad.bookedtill.includes('-')) {
                // Handle YYYY-MM-DD format
                bookedTillDate = new Date(ad.bookedtill);
              } else {
                return false;
              }

              bookedTillDate.setHours(23, 59, 59, 999); // End of the day

              // Check if booking ends within next 15 days (inclusive)
              return bookedTillDate <= next15Days;
            } catch (error) {
              console.error('Error parsing date:', ad.bookedtill, error);
              return false;
            }
          });

          // sort in low to high days and expired first
          expiring.sort((a, b) => {
            const aDate = new Date(a.bookedtill);
            const bDate = new Date(b.bookedtill);
            if (aDate < today && bDate < today) {
              return -1; // Both are expired, keep original order
            } else if (aDate < today) {
              return -1; // a is expired, b is not
            } else if (bDate < today) {
              return 1; // b is expired, a is not
            }
            return aDate - bDate; // Both are not expired, sort by date
          });

          setExpiringBookings(expiring);
        } catch (err) {
          setTotalAds([]);
          setExpiringBookings([]);
        }
        setLoading(false);
      };
      fetchAds();
    }
  }, [status]);

  const exportToExcel = async () => {
    if (expiringBookings.length == 0) {
      alert("No expiring bookings to export.");
      return;
    }

    // Prefer the ExportToExcel component (it forwards to the same API and handles filename)
    if (exportRef.current && typeof exportRef.current.exportData === 'function') {
      exportRef.current.exportData(expiringBookings, 'expiring_bookings');
      return;
    }

    // Fallback: keep existing direct fetch if the ref isn't mounted
    // fetch("/api/generate-excel/admin", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ type: "expiring_bookings", data: expiringBookings }),
    // }).then((res) => res.blob()).then((blob) => {
    //   const url = URL.createObjectURL(blob);
    //   const link = document.createElement("a");
    //   link.href = url;
    //   link.download = "expiring_bookings.xlsx";
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    // });
  };

  // Calculate stats from totalads
  const availableCount = totalads.filter(ad => ad.status === "Available").length;
  const bookedCount = totalads.filter(ad => ad.status === "Booked").length;

  if (status === "loading" || loading) {
    return (
      <AdminNav>
        <div className="w-full h-screen flex items-center justify-center text-black text-center">Hold on While we fetching data - JMD <br />Showa.online</div>;
      </AdminNav>
    )
  }

  if (status === "authenticated") {
    return (
      <AdminNav>
        <ExportToExcel ref={exportRef} />
        <div className='w-full h-screen overflow-y-auto flex flex-col items-center justify-start gap-4 p-2 md:p-6 bg-[#E9E9E9]'>
          {/* Media Data Stats */}
          <div className='w-full flex flex-col justify-start items-start bg-white shadow-lg rounded-xl p-2 md:p-4'>
            <h2 className='text-base md:text-lg font-bold text-blue-600'>Media Data</h2>
            <div className='w-full flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4'>
              <span className='w-full md:w-1/3 flex flex-col items-center justify-center text-yellow-500 rounded-lg p-2'>
                <span className='text-2xl md:text-4xl font-bold '>{totalads.length}</span>
                <h3 className='text-sm md:text-md font-semibold'>Total Media</h3>
              </span>
              <div className='hidden md:block w-[2px] h-[90%] bg-black'></div>
              <span className='w-full md:w-1/3 flex flex-col items-center justify-center text-green-500 rounded-lg p-2'>
                <span className='text-2xl md:text-4xl font-bold '>{availableCount}</span>
                <h3 className='text-sm md:text-md font-semibold '>Available Media</h3>
              </span>
              <div className='hidden md:block w-[2px] h-[90%] bg-black'></div>
              <span className='w-full md:w-1/3 flex flex-col items-center justify-center text-red-500 rounded-lg p-2'>
                <span className='text-2xl md:text-4xl font-bold '>{bookedCount}</span>
                <h3 className='text-sm md:text-md font-semibold '>Booked Media</h3>
              </span>
            </div>
          </div>

          {/* Lead Data and Recent Listings */}
          <div className='w-full flex flex-col lg:flex-row gap-3 justify-center items-stretch'>
            <div className='w-full lg:w-[30%] bg-white rounded-2xl flex flex-col items-start gap-3 p-2 md:p-3 justify-start'>
              <h2 className='text-base md:text-lg font-bold text-blue-600'>Lead Data</h2>
              <Link className='w-full flex flex-col items-start justify-start' href="/admin/report">
                <h2 className='text-black text-sm md:text-base'>Lead's received today</h2>
                <h2 className='w-full h-full text-lg md:text-2xl bg-gray-200 text-black py-2 ps-4 rounded-md'>{todayLeads}</h2>
              </Link>
              <Link className='w-full flex flex-col items-start justify-start' href="/admin/report">
                <h2 className='text-black text-sm md:text-base'>Lead's received this week</h2>
                <h2 className='w-full h-full text-lg md:text-2xl bg-gray-200 text-black py-2 ps-4 rounded-md'>{weekLeads}</h2>
              </Link>
              <Link className='w-full flex flex-col items-start justify-start' href="/admin/booking">
                <h2 className='text-black text-sm md:text-base'>Booking request today</h2>
                <h2 className='w-full h-full text-lg md:text-2xl bg-gray-200 text-black py-2 ps-4 rounded-md'>{todayBookings}</h2>
              </Link>
              <span className='w-full flex flex-col items-start justify-start'>
                <h2 className='text-black text-sm md:text-base'>Expiring in next 15 days or expired</h2>
                <h2 className='w-full h-full text-lg md:text-2xl bg-orange-200 text-orange-700 py-2 ps-4 rounded-md'>{expiringBookings.length}</h2>
              </span>
            </div>

            <div className='w-full lg:w-[70%] bg-white rounded-2xl flex flex-col items-start p-2 md:p-3 justify-start'>
              <h2 className='text-base md:text-lg font-bold text-blue-600'>Quick summary: Recently added listing(last 7 days)</h2>
              <div className="w-full overflow-hidden text-black mt-2 md:mt-4 flex-1">
                <div className="h-64 overflow-y-auto w-full">
                  <table className="min-w-full w-full table-fixed border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-white border-y border-black text-left font-semibold sticky top-0">
                        <th className="w-1/4 px-2 md:px-4 py-2 border-r bg-white">Title</th>
                        <th className="w-1/5 px-2 md:px-4 py-2 border-r bg-white">City</th>
                        <th className="w-1/5 px-2 md:px-4 py-2 border-r bg-white">Status</th>
                        <th className="w-1/5 px-2 md:px-4 py-2 border-r bg-white">Type</th>
                        <th className="w-1/5 px-2 md:px-4 py-2 bg-white">Date Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ads.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4">No ads found for last 7 days.</td>
                        </tr>
                      ) : (
                        ads.map((ad, index) => (
                          <tr
                            key={ad._id || index}
                            className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                          >
                            <td className="px-2 md:px-4 py-3 border-r truncate">
                              {ad.title}
                            </td>
                            <td className="px-2 md:px-4 py-3 border-r">{ad.city}</td>
                            <td className="px-2 md:px-4 py-3 border-r">{ad.status || ""}</td>
                            <td className="px-2 md:px-4 py-3 border-r">{ad.type}</td>
                            <td className="px-2 md:px-4 py-3">
                              {ad.date ? new Date(ad.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Expiring Bookings Table */}
          <div className='w-full bg-white rounded-2xl flex flex-col items-start p-2 md:p-3 justify-start'>
            <span className='flex flex-col md:flex-row justify-between w-full'>
              <h2 className='text-base md:text-lg font-bold text-orange-600'>
                Booked Hoardings becoming free in next 15 days or expired ({expiringBookings.length})
              </h2>
              <button
                className="mt-4 lg:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                onClick={exportToExcel}
                disabled={expiringBookings.length === 0}
              >
                <MdDownloading />
                Export to Excel ({expiringBookings.length} records)
              </button>
            </span>
            <div className="w-full overflow-hidden text-black mt-2 md:mt-4 flex-1">
              <div className="h-64 overflow-y-auto w-full">
                <table className="min-w-full w-full table-fixed border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-white border-y border-black text-left font-semibold sticky top-0 z-10">
                      <th className="w-1/6 px-2 md:px-4 py-2 border-r bg-white">Media Code</th>
                      <th className="w-1/4 px-2 md:px-4 py-2 border-r bg-white">Title</th>
                      <th className="w-1/6 px-2 md:px-4 py-2 border-r bg-white">City</th>
                      <th className="w-1/6 px-2 md:px-4 py-2 border-r bg-white">Client</th>
                      <th className="w-1/6 px-2 md:px-4 py-2 border-r bg-white">Owner</th>
                      <th className="w-1/6 px-2 md:px-4 py-2 border-r bg-white">Booking Till</th>
                      <th className="w-1/6 px-2 md:px-4 py-2 bg-white">Days Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">No booked hoardings becoming free in next 15 days.</td>
                      </tr>
                    ) : (
                      expiringBookings.map((ad, index) => {
                        // Calculate days left
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        let bookedTillDate;

                        try {
                          if (ad.bookedtill.includes('/')) {
                            const [day, month, year] = ad.bookedtill.split('/');
                            bookedTillDate = new Date(year, month - 1, day);
                          } else {
                            bookedTillDate = new Date(ad.bookedtill);
                          }
                          bookedTillDate.setHours(23, 59, 59, 999);

                          const timeDiff = bookedTillDate.getTime() - today.getTime();
                          const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

                          return (
                            <tr
                              key={ad._id || index}
                              className={index % 2 === 0 ? "bg-orange-50" : "bg-white"}
                            >
                              <td className="px-2 md:px-4 py-3 border-r font-medium">
                                {ad.mediacode}
                              </td>
                              <td className="px-2 md:px-4 py-3 border-r truncate">
                                {ad.title}
                              </td>
                              <td className="px-2 md:px-4 py-3 border-r">{ad.city}</td>
                              <td className="px-2 md:px-4 py-3 border-r">{ad.clientname || 'N/A'}</td>
                              <td className="px-2 md:px-4 py-3 border-r">{ad.mediaOwner || 'N/A'}</td>
                              <td className="px-2 md:px-4 py-3 border-r">
                                {ad.bookedtill ? new Date(ad.bookedtill.includes('/')
                                  ? ad.bookedtill.split('/').reverse().join('-')
                                  : ad.bookedtill).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                  }) : 'N/A'}
                              </td>
                              <td className="px-2 md:px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${daysLeft <= 0 ? 'bg-red-100 text-red-700' :
                                  daysLeft <= 1 ? 'bg-red-100 text-red-700' :
                                    daysLeft <= 3 ? 'bg-orange-100 text-orange-700' :
                                      daysLeft <= 10 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                  }`}>
                                  {daysLeft <= 0 ? 'Expired' :
                                    daysLeft === 1 ? '1 day' :
                                      `${daysLeft} days`}
                                </span>
                              </td>
                            </tr>
                          );
                        } catch (error) {
                          console.error('Error calculating days left:', error);
                          return null;
                        }
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </AdminNav>
    );
  }
};

export default Dashboard;