"use client";
import React, { useState, useEffect, useRef } from 'react'
import AdminNav from '@/app/component/AdminNav'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { MdDownloading } from "react-icons/md";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AiOutlineEye } from "react-icons/ai";
import { MdDeleteOutline } from "react-icons/md";
import ExportToExcel from '@/app/component/ExportToExcel';

const PER_PAGE = 7;

const page = () => {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [page, setPage] = useState(1);
    const [showAllPages, setShowAllPages] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMessage, setViewMessage] = useState(null);
    const [name, setName] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Export states
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [exportFromDate, setExportFromDate] = useState("");
    const [exportToDate, setExportToDate] = useState("");
    const exportRef = useRef();

    // Conversion states
    const [conversion, setConversion] = useState({ visitor: 0, book: 0 });

    // Top ads state
    const [topAds, setTopAds] = useState([]);

    // Top cities state
    const [topCities, setTopCities] = useState([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        }
        if (status === "authenticated") {
            setLoading(true);
            fetch("/api/contact")
                .then(res => res.json())
                .then(resData => {
                    setData(Array.isArray(resData) ? resData : []);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
            // Fetch conversion stats
            fetch("/api/conversion")
                .then(res => res.json())
                .then(res => {
                    if (res && res.doc && res.doc.visitor !== undefined && res.doc.book !== undefined) {
                        setConversion(res.doc);
                    }
                })
                .catch(() => { });
            // Fetch top 3 ads by views
            fetch("/api/ads?topthree=1")
                .then(res => res.json())
                .then(res => {
                    if (Array.isArray(res)) setTopAds(res);
                })
                .catch(() => { });
            // Fetch top 3 cities by traffic
            fetch("/api/log-visitor?topthree=1")
                .then(res => res.json())
                .then(res => {
                    if (Array.isArray(res)) setTopCities(res);
                })
                .catch(() => { });
        }
    }, [status, router]);

    const handleDelete = async () => {
        try {
            await fetch("/api/contact", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reqid: deleteId }),
            });
            setData(prev => prev.filter(d => d.reqid !== deleteId));
        } catch { }
        setConfirmDelete(false);
        setDeleteId(null);
    };

    const handleExportWithDateRange = () => {
        if (data.length === 0) {
            alert("No data to export.");
            return;
        }
        // Filter by createdAt date range
        const exportData = data
            .filter(d => {
                if (!d.createdAt) return false;
                const dDate = new Date(d.createdAt).setHours(0, 0, 0, 0);
                const from = exportFromDate ? new Date(exportFromDate).setHours(0, 0, 0, 0) : null;
                const to = exportToDate ? new Date(exportToDate).setHours(0, 0, 0, 0) : null;
                if (from && dDate < from) return false;
                if (to && dDate > to) return false;
                return true;
            })
            .map(({ _id, __v, ...rest }) => rest); // Remove unwanted fields

        if (exportData.length === 0) {
            alert("No data found in selected date range.");
            return;
        }
        exportRef.current.exportData(exportData);
    };

    const paginated = data.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(data.length / PER_PAGE);

    if (status === "loading" || loading) {
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
                                <p>{conversion.visitor?.toLocaleString()}</p>
                            </div>
                            <div className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2 mb-1'>
                                <p>Clicked on "Book Now"</p>
                                <p>{conversion.book?.toLocaleString()}</p>
                            </div>
                            <div className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2'>
                                <p>Contact Forms Filled</p>
                                <p>{data.length}</p>
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className='w-full md:w-1/3 bg-white flex flex-col items-center justify-start rounded-lg gap-2 p-3 md:p-4 mb-3 md:mb-0'>
                            <h1 className='text-base md:text-lg font-bold text-black me-auto'>Most Viewed Media Listings:</h1>
                            {topAds.length === 0 ? (
                                <div className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2 mb-1'>
                                    <p>No data</p>
                                    <p>0</p>
                                </div>
                            ) : (
                                topAds.map((ad, idx) => (
                                    <Link href={`/find-hoardings/${ad.mediacode}`} key={ad._id || idx} className='w-full'>
                                        <div key={ad._id || idx} className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2 mb-1'>
                                            <p>{ad.type} - {ad.title}</p>
                                            <p>{ad.views?.toLocaleString?.() ?? 0}</p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                        {/* Card 3 */}
                        <div className='w-full md:w-1/3 bg-white flex flex-col items-center justify-start rounded-lg gap-2 p-3 md:p-4'>
                            <h1 className='text-base md:text-lg font-bold text-black me-auto'>Top City by Traffic:</h1>
                            {topCities.length === 0 ? (
                                <div className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2 mb-1'>
                                    <p>No data</p>
                                    <p>0</p>
                                </div>
                            ) : (
                                topCities.map((city, idx) => (
                                    <div key={city._id || idx} className='w-full rounded-md bg-[#E9E9E9] text-black/70 px-3 md:px-5 flex flex-row items-center justify-between gap-2 mb-1'>
                                        <p>{city.name}</p>
                                        <p>{city.count?.toLocaleString?.() ?? 0}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Contact-us Table */}
                    <div className="bg-white w-full h-auto min-h-[400px] text-black rounded-lg shadow p-2 md:p-4">
                        {/* Table */}
                        <div className="overflow-x-auto flex flex-col rounded-2xl bg-[#E9E9E9]">
                            <div className='w-full flex flex-col md:flex-row items-center justify-between mb-2 px-2 md:px-4 pt-2 gap-2'>
                                <span className="text-base md:text-lg font-bold text-black">Contact Form List - JMD Advertisement </span>
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
                                            <th className="px-2 py-2 text-left">Name</th>
                                            <th className="px-2 py-2 text-left">Email</th>
                                            <th className="px-2 py-2 text-left">Phone</th>
                                            <th className="px-2 py-2 text-left">Callback</th>
                                            <th className="px-2 py-2 text-left">Message</th>
                                            <th className="px-2 py-2 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-4">No request found.</td>
                                            </tr>
                                        ) : (
                                            paginated.map((row, i) => (
                                                <tr key={row._id || i} className={`hover:bg-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-100"}`}>
                                                    <td className="px-2 py-2">{row.reqid}</td>
                                                    <td className="px-2 py-2">{row.name}</td>
                                                    <td className="px-2 py-2">{row.email}</td>
                                                    <td className="px-2 py-2">{row.phone}</td>
                                                    <td className="px-2 py-2">{row.callback}</td>
                                                    <td className="px-2 py-2 max-w-[200px] truncate" title={row.message}>{row.message.slice(0, 20)}...</td>
                                                    <td className="px-2 py-2 flex gap-2 justify-center">
                                                        <button
                                                            className="text-green-600 hover:scale-110 transition"
                                                            title="View"
                                                            onClick={() => setViewMessage(row)}
                                                        >
                                                            <AiOutlineEye size={20} />
                                                        </button>
                                                        <button
                                                            className="text-red-600 hover:scale-110 transition"
                                                            title="Delete"
                                                            onClick={() => {
                                                                setDeleteId(row.reqid);
                                                                setName(row.name);
                                                                setConfirmDelete(true);
                                                            }}
                                                        >
                                                            <MdDeleteOutline size={20} />
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
                </div>
                {/* Export Popup */}
                {showExportPopup && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
                            <div className="mb-4">
                                <span className="font-bold text-lg">Export Contacts</span>
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
                {/* Popup for viewing message */}
                {viewMessage && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw]">
                            <div className="mb-4">
                                <span className="font-bold text-lg">Full Message</span>
                            </div>
                            <div className="mb-4 whitespace-pre-line break-words max-w-[400px]">
                                {viewMessage.message}
                            </div>
                            <div className="flex justify-end">
                                <button
                                    className="px-4 py-2 rounded bg-blue-600 text-white"
                                    onClick={() => setViewMessage(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Popup for delete confirmation */}
                {confirmDelete && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
                            <div className="mb-4">
                                <span className="font-bold text-lg">Confirm Delete</span>
                            </div>
                            <div className="mb-4">
                                Are you sure you want to delete this request from {name}?
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
            </AdminNav>
        )
    }
}

export default page