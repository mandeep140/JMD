"use client"
import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminNav from '@/app/component/AdminNav';

const page = () => {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div className="w-full h-screen flex items-center justify-center text-black text-center">Hold on While we fetching data - JMD <br />Showa.online</div>;
    }

    return (
        <AdminNav>
            <div className='w-full md:h-9/10 flex flex-col items-center justify-start gap-4 p-2 md:p-6 bg-[#E9E9E9]'>
                {/* top nav */}
                <div className='w-full h-auto bg-white flex flex-col md:flex-row items-center justify-center rounded-md overflow-hidden'>
                    <Link href="/admin/inventory/manage" className="w-full md:w-1/2">
                        <span className={`block w-full py-2 text-center font-bold text-lg md:text-2xl cursor-pointer transition rounded-none md:rounded-md
              ${pathname === "/admin/inventory/manage" ? "bg-blue-200 text-blue-500 shadow-md" : "bg-transparent text-black"}`}>
                            Update/New Media Listing
                        </span>
                    </Link>
                    <Link href="/admin/inventory" className="w-full md:w-1/2">
                        <span className={`block w-full py-2 text-center font-bold text-lg md:text-2xl cursor-pointer transition rounded-none md:rounded-md
              ${pathname === "/admin/inventory" ? "bg-blue-200 text-blue-500 shadow-md" : "bg-transparent text-black"}`}>
                            View All Media Listing
                        </span>
                    </Link>
                </div>

                {/* main */}
                <div className="bg-white w-full h-full min-h-0 flex flex-col items-center justify-start text-black rounded-lg shadow p-3 md:p-8 overflow-y-auto">
                    <div className="w-full h-auto flex flex-col gap-3">
                        {/* Row 1 */}
                        <div className="flex flex-col md:flex-row gap-3 w-full">
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Media Code*</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                    placeholder="Media Code"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Title*</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                    placeholder="Title"
                                />
                            </div>
                        </div>
                        {/* Row 2 */}
                        <div className="flex flex-col md:flex-row gap-3 w-full">
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">City*</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                    placeholder="City"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Lighting*</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                    placeholder="Lighting"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Status*</label>
                                <select className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2">
                                    <option value="">Select</option>
                                    <option>Available</option>
                                    <option>Booked</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Size*</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                    placeholder="Size"
                                />
                            </div>
                        </div>
                        {/* Row 3 */}
                        <div className="flex flex-col md:flex-row gap-3 w-full">
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Client Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                    placeholder="Client Name"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Booked from</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                    placeholder="Booked from"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Booked till</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                    placeholder="Booked till"
                                />
                            </div>
                        </div>
                        {/* Row 4 */}
                        <div className="flex flex-col md:flex-row gap-3 w-full">
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Type*</label>
                                <select className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2">
                                    <option value="">Select</option>
                                    <option>Billboard</option>
                                    <option>Digital</option>
                                    <option>Mall</option>
                                    <option>Airport</option>
                                    <option>Transit</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Price per day</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                    placeholder="Price per day"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Price per month</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                    placeholder="Price per month"
                                />
                            </div>
                        </div>
                        {/* Row 5 */}
                        <div className="flex flex-col md:flex-row gap-3 w-full">
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Location map link*</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                    placeholder="Location map link"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Longitude</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                    placeholder="Longitude"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-1">Latitude</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                    placeholder="Latitude"
                                />
                            </div>
                        </div>
                        {/* Row 6: Message (full width) */}
                        <div className="w-full">
                            <label className="block text-xs md:text-sm font-semibold mb-1">Message about media*</label>
                            <textarea
                                className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                                rows={2}
                                placeholder="Message about media"
                            />
                        </div>
                        {/* Row 7: Actions (full width) */}
                        <div className="w-full flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between gap-3 mt-2">
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-xs text-gray-500 mb-1">Upload Image</span>
                                <span className="text-xs text-gray-400 mb-2">Only JPG and PNG file supported</span>
                                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold text-xs md:text-sm">Upload Image</button>
                            </div>
                            <button className="flex items-center justify-center border border-blue-500 text-blue-500 px-4 py-2 rounded font-semibold text-xs md:text-sm hover:bg-blue-50">
                                Import data from Excel
                            </button>
                            <button className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold text-xs md:text-sm">
                                <span className="mr-1">➕</span> Add Media in Listing
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminNav>
    )
}

export default page
