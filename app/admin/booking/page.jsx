"use client";
import React, { useState, useEffect, useRef } from 'react'
import AdminNav from '@/app/component/AdminNav'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { MdDownloading } from "react-icons/md";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AiOutlineEye, AiOutlineDelete } from 'react-icons/ai';
import ExportToExcel from '@/app/component/ExportToExcel';

const PER_PAGE = 10;

const page = () => {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [page, setPage] = useState(1);
    const [showAllPages, setShowAllPages] = useState(false);

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedType, setSelectedType] = useState("");

    // Export states
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [exportFromDate, setExportFromDate] = useState("");
    const [exportToDate, setExportToDate] = useState("");
    const exportRef = useRef();

    // Delete states
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        }
        if (status === "authenticated") {
            const fetchBookings = async () => {
                setLoading(true);
                try {
                    const res = await fetch("/api/booking");
                    const data = await res.json();
                    setBookings(data);
                } catch (err) {
                    setBookings([]);
                }
                setLoading(false);
            };
            fetchBookings();
        }
    }, [status, router]);

    // Extract unique filter options
    const statusOptions = Array.from(new Set(bookings.map(b => b.status).filter(Boolean)));
    const cityOptions = Array.from(new Set(bookings.map(b => b.city).filter(Boolean)));
    const typeOptions = Array.from(new Set(bookings.map(b => b.mediatype).filter(Boolean)));

    // Filter bookings by all filters
    const filteredBookings = bookings.filter(b =>
        (selectedStatus ? b.status === selectedStatus : true) &&
        (selectedCity ? b.city === selectedCity : true) &&
        (selectedType ? b.mediatype === selectedType : true)
    );

    const paginated = filteredBookings.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(filteredBookings.length / PER_PAGE);

    // Export handler
    const handleExportWithDateRange = () => {
        if (bookings.length === 0) {
            alert("No data to export.");
            return;
        }
        // Filter by date range
        const exportData = bookings
            .filter(b => {
                if (!b.date) return false;
                const bDate = new Date(b.date).setHours(0,0,0,0);
                const from = exportFromDate ? new Date(exportFromDate).setHours(0,0,0,0) : null;
                const to = exportToDate ? new Date(exportToDate).setHours(0,0,0,0) : null;
                if (from && bDate < from) return false;
                if (to && bDate > to) return false;
                return true;
            })
            .map(({ _id, __v, ...rest }) => rest); // Remove unwanted fields

        if (exportData.length === 0) {
            alert("No data found in selected date range.");
            return;
        }
        exportRef.current.exportData(exportData);
    };

    // Delete handler
    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await fetch("/api/booking", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reqid: deleteId }),
            });
            setBookings(prev => prev.filter(b => b.reqid !== deleteId));
        } catch {}
        setConfirmDelete(false);
        setDeleteId(null);
    };

    if (status === "loading" || loading) {
        return <div className="w-full h-screen flex items-center justify-center text-black text-center">Hold on While we fetching data - JMD <br />Showa.online</div>;
    }

    if (status === "authenticated") {
        return (
            <AdminNav>
                <div className='w-full md:h-9/10 flex flex-col items-center justify-start gap-4 p-2 md:p-6 bg-[#E9E9E9]'>
                    {/* top nav */}
                    <div className='w-full h-auto bg-white flex flex-col md:flex-row items-center justify-center rounded-md overflow-hidden'>
                        <Link href="/admin/booking" className="w-full md:w-1/2">
                            <span className={`block w-full py-2 text-center font-bold text-lg md:text-2xl cursor-pointer transition rounded-none md:rounded-md
                            ${pathname === "/admin/booking" ? "bg-blue-200 text-blue-500 shadow-md" : "bg-transparent text-black"}`}>
                                View Booking Table
                            </span>
                        </Link>
                        <Link href="/admin/booking/analytics" className="w-full md:w-1/2">
                            <span className={`block w-full py-2 text-center font-bold text-lg md:text-2xl cursor-pointer transition rounded-none md:rounded-md
                            ${pathname === "/admin/booking/analytics" ? "bg-blue-200 text-blue-500 shadow-md" : "bg-transparent text-black"}`}>
                                Analytics
                            </span>
                        </Link>
                    </div>

                    {/* main */}
                    <div className="bg-white w-full h-auto min-h-[400px] text-black rounded-lg shadow p-2 md:p-4">
                        {/* Filters */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {/* Status filter */}
                            <select
                                className="border rounded px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm"
                                value={selectedStatus}
                                onChange={e => {
                                    setSelectedStatus(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">Status</option>
                                {statusOptions.map(status => (
                                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                ))}
                            </select>
                            {/* City filter */}
                            <select
                                className="border rounded px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm"
                                value={selectedCity}
                                onChange={e => {
                                    setSelectedCity(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">City</option>
                                {cityOptions.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            {/* Type filter */}
                            <select
                                className="border rounded px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm"
                                value={selectedType}
                                onChange={e => {
                                    setSelectedType(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">Type</option>
                                {typeOptions.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        {/* Table */}
                        <div className="overflow-x-auto flex flex-col rounded-2xl bg-[#E9E9E9]">
                            <div className='w-full flex flex-col md:flex-row items-center justify-between mb-2 px-2 md:px-4 pt-2 gap-2'>
                                <span className="text-base md:text-lg font-bold text-black">Booking Request Detail - JMD Advertisement </span>
                                <button
                                    className="mx-auto md:ml-auto md:mx-0 bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-700 px-2 py-1 md:px-3 md:py-1 rounded flex items-center gap-1 duration-200 text-xs md:text-base"
                                    onClick={() => setShowExportPopup(true)}
                                >
                                    <span className='flex flex-row items-center justify-center text-center gap-1'> <MdDownloading /> Export to Excel</span>
                                    <ExportToExcel ref={exportRef} />
                                </button>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="min-w-[700px] md:min-w-full text-xs md:text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="px-2 py-2 text-left">Request ID</th>
                                            <th className="px-2 py-2 text-left">Date</th>
                                            <th className="px-2 py-2 text-left">Title</th>
                                            <th className="px-2 py-2 text-left">Media Code</th>
                                            <th className="px-2 py-2 text-left">City</th>
                                            <th className="px-2 py-2 text-left">Type</th>
                                            <th className="px-2 py-2 text-left">Customer Name</th>
                                            <th className="px-2 py-2 text-left">Contact</th>
                                            <th className="px-2 py-2 text-left">Status</th>
                                            <th className="px-2 py-2 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="text-center py-4">No bookings found.</td>
                                            </tr>
                                        ) : (
                                            paginated.map((row, i) => (
                                                <tr key={row._id || i} className={`hover:bg-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-100"}`}>
                                                    <td className="px-2 py-2">{row.reqid}</td>
                                                    <td className="px-2 py-2">{row.date ? new Date(row.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}</td>
                                                    <td className="px-2 py-2 max-w-[180px] truncate" title={row.title}>{row.title}</td>
                                                    <td className="px-2 py-2">{row.mediacode}</td>
                                                    <td className="px-2 py-2">{row.city}</td>
                                                    <td className="px-2 py-2">{row.mediatype}</td>
                                                    <td className="px-2 py-2">{row.name}</td>
                                                    <td className="px-2 py-2">{row.phone}</td>
                                                    <td className={`px-2 py-2 capitalize ${row.status === "approved" ? 'text-green-600' : row.status === "rejected" ? 'text-red-600' : 'text-gray-400'}`}>{row.status}</td>
                                                    <td className="px-2 py-2 flex gap-2 justify-center">
                                                        <Link href={`/admin/booking/${row.reqid}`} >
                                                            <button className="text-green-600 hover:scale-110 transition" title="View">
                                                                <AiOutlineEye size={18} />
                                                            </button>
                                                        </Link>
                                                        <button
                                                            className="text-red-600 hover:scale-110 transition"
                                                            title="Delete"
                                                            onClick={() => {
                                                                setDeleteId(row.reqid);
                                                                setConfirmDelete(true);
                                                            }}
                                                        >
                                                            <AiOutlineDelete size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
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

                    {/* Export Popup */}
                    {showExportPopup && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
                                <div className="mb-4">
                                    <span className="font-bold text-lg">Export Bookings</span>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <label>
                                        From Date:
                                        <input
                                            type="date"
                                            className="border rounded px-2 py-1 ml-2"
                                            value={exportFromDate}
                                            onChange={e => setExportFromDate(e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        To Date:
                                        <input
                                            type="date"
                                            className="border rounded px-2 py-1 ml-2"
                                            value={exportToDate}
                                            onChange={e => setExportToDate(e.target.value)}
                                        />
                                    </label>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        className="px-4 py-2 rounded bg-gray-200"
                                        onClick={() => setShowExportPopup(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded bg-blue-600 text-white"
                                        onClick={() => {
                                            handleExportWithDateRange();
                                            setShowExportPopup(false);
                                        }}
                                    >
                                        Export
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Popup */}
                    {confirmDelete && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
                                <div className="mb-4">
                                    <span className="font-bold text-lg">Confirm Delete</span>
                                </div>
                                <div className="mb-4">
                                    Are you sure you want to delete this booking request?
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        className="px-4 py-2 rounded bg-gray-200"
                                        onClick={() => setConfirmDelete(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded bg-red-600 text-white"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AdminNav>
        )
    }
}

export default page;