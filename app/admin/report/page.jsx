"use client";
import React, { useState, useEffect } from 'react'
import AdminNav from '@/app/component/AdminNav'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { MdDownloading } from "react-icons/md";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const sampleData = Array.from({ length: 327 }, (_, i) => ({
    requestid: "R01UID" + (i + 1),
    name: "Client " + (i + 1),
    email: "client" + (i + 1) + "@example.com",
    phone: "123456789" + (i % 10),
    callback: "yes",
    message: "This is a sample message from client that your service is next level uffff " + (i + 1),
}));

const PER_PAGE = 7;

const page = () => {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [page, setPage] = useState(1);
    const [showAllPages, setShowAllPages] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        }
    }, [status, router]);

    const paginated = sampleData.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(sampleData.length / PER_PAGE);

    if (status === "loading") {
        return <div className="w-full h-screen flex items-center justify-center text-black text-center">Hold on While we fetching data - JMD <br />Showa.online</div>;
    }
    if (status === "authenticated") {
        return (
            <AdminNav>
                <div className='w-full md:h-9/10 flex flex-col items-center justify-start gap-4 p-2 md:p-6 bg-[#E9E9E9]'>
                    {/* quick analysis */}
                    <div className='w-full flex flex-col md:flex-row gap-3 h-auto md:h-3/10 items-stretch justify-between'>
                        {/* Card 1 */}
                        <div className='w-full md:w-1/3 bg-white flex flex-col items-center rounded-lg justify-start gap-2 p-3 md:p-4 mb-3 md:mb-0'>
                            <h1 className='text-base md:text-lg font-bold text-black me-auto'>Conversion Funnel:</h1>
                            <div className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2 mb-1'>
                                <p>Total Visitors</p>
                                <p>5846</p>
                            </div>
                            <div className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2 mb-1'>
                                <p>Clicked on "Book Now"</p>
                                <p>1265</p>
                            </div>
                            <div className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2'>
                                <p>Contact Forms Filled</p>
                                <p>2056</p>
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className='w-full md:w-1/3 bg-white flex flex-col items-center justify-start rounded-lg gap-2 p-3 md:p-4 mb-3 md:mb-0'>
                            <h1 className='text-base md:text-lg font-bold text-black me-auto'>Most Viewed Media Listings:</h1>
                            <div className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2 mb-1'>
                                <p>Billboard at baran</p>
                                <p>8745</p>
                            </div>
                            <div className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2 mb-1'>
                                <p>Billboard at kota</p>
                                <p>15265</p>
                            </div>
                            <div className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2'>
                                <p>Billboard at jaipur</p>
                                <p>45897</p>
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className='w-full md:w-1/3 bg-white flex flex-col items-center justify-start rounded-lg gap-2 p-3 md:p-4'>
                            <h1 className='text-base md:text-lg font-bold text-black me-auto'>Top City by Traffic:</h1>
                            <div className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2 mb-1'>
                                <p>Rajasthan </p>
                                <p>102354</p>
                            </div>
                            <div className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2 mb-1'>
                                <p>Maharashtra</p>
                                <p>25146</p>
                            </div>
                            <div className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2'>
                                <p>Tamo; Nadu</p>
                                <p>20145</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact-us Table */}
                    <div className="bg-white w-full h-auto min-h-[400px] text-black rounded-lg shadow p-2 md:p-4">
                        {/* Table */}
                        <div className="overflow-x-auto flex flex-col rounded-2xl bg-[#E9E9E9]">
                            <div className='w-full flex flex-col md:flex-row items-center justify-between mb-2 px-2 md:px-4 pt-2 gap-2'>
                                <span className="text-base md:text-lg font-bold text-black">All Media List - JMD Advertisement </span>
                                <button className="mx-auto md:ml-auto md:mx-0 bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-700 px-2 py-1 md:px-3 md:py-1 rounded flex items-center gap-1 duration-200 text-xs md:text-base">
                                    <span className='flex flex-row items-center justify-center text-center gap-1'> <MdDownloading /> Export to Excel</span>
                                </button>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="min-w-[700px] md:min-w-full text-xs md:text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="px-2 py-2 text-left">Request ID</th>
                                            <th className="px-2 py-2 text-left">Name</th>
                                            <th className="px-2 py-2 text-left">Email</th>
                                            <th className="px-2 py-2 text-left">Phone</th>
                                            <th className="px-2 py-2 text-left">Callback</th>
                                            <th className="px-2 py-2 text-left">Message</th>
                                            <th className="px-2 py-2 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map((row, i) => (
                                            <tr key={i} className={`hover:bg-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-100"}`}>
                                                <td className="px-2 py-2">{row.requestid}</td>
                                                <td className="px-2 py-2">{row.name}</td>
                                                <td className="px-2 py-2">{row.email}</td>
                                                <td className="px-2 py-2">{row.phone}</td>
                                                <td className="px-2 py-2">{row.callback}</td>
                                                <td className="px-2 py-2 max-w-[200px] truncate" title={row.message}>{row.message}</td>
                                                <td className="px-2 py-2 flex gap-2 justify-center">
                                                    <button className="text-green-600 hover:scale-110 transition" title="View">
                                                        <svg width="18" height="18" fill="currentColor"><circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="2" fill="none" /><circle cx="9" cy="9" r="3" /></svg>
                                                    </button>
                                                    <button className="text-red-600 hover:scale-110 transition" title="Delete">
                                                        <svg width="18" height="18" fill="currentColor"><rect x="6" y="6" width="6" height="6" rx="1" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-2 text-xs relative">
                            <div>
                                <span className="mr-3 font-semibold">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    className="px-2 py-1 rounded bg-gray-200 mr-1"
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    &lt; Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={`px-2 py-1 rounded ${page === i + 1 ? "bg-blue-500 text-white" : "bg-gray-100"}`}
                                        onClick={() => setPage(i + 1)}
                                        style={{ display: i < 5 ? "inline-block" : "none" }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                {totalPages > 5 && <span className="mx-1">...</span>}
                                {totalPages > 5 && (
                                    <button
                                        className={`px-2 py-1 rounded ${page === totalPages ? "bg-blue-500 text-white" : "bg-gray-100"}`}
                                        onClick={() => setPage(totalPages)}
                                    >
                                        {totalPages}
                                    </button>
                                )}
                                <button
                                    className="px-2 py-1 rounded bg-gray-200 ml-1"
                                    disabled={page === totalPages}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next &gt;
                                </button>
                                <button
                                    className="ml-2 underline text-blue-600"
                                    onClick={() => setShowAllPages(true)}
                                >
                                    Show all
                                </button>
                            </div>
                            {/*
                                      {/* Modal for all pages */}
                            {showAllPages && (
                                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-lg shadow-lg p-6 max-h-[70vh] overflow-y-auto min-w-[300px]">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="font-bold">Jump to Page</span>
                                            <button
                                                className="text-red-500 font-bold text-lg"
                                                onClick={() => setShowAllPages(false)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from({ length: totalPages }, (_, i) => (
                                                <button
                                                    key={i + 1}
                                                    className={`px-2 py-1 rounded border ${page === i + 1 ? "bg-blue-500 text-white" : "bg-gray-100"}`}
                                                    onClick={() => {
                                                        setPage(i + 1);
                                                        setShowAllPages(false);
                                                    }}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AdminNav>
        )
    }
}

export default page