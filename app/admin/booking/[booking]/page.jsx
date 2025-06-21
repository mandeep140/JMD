"use client";
import React, { useState, useEffect } from 'react';
import AdminNav from '@/app/component/AdminNav';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';

const Page = () => {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const bookingId = params.booking;

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusValue, setStatusValue] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        }
        if (status === "authenticated" && bookingId) {
            const fetchBooking = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`/api/booking?reqid=${bookingId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setBooking(data);
                    } else {
                        setBooking(null);
                    }
                } catch (err) {
                    setBooking(null);
                }
                setLoading(false);
            };
            fetchBooking();
        }
    }, [status, router, bookingId]);

    useEffect(() => {
        if (booking) setStatusValue(booking.status);
    }, [booking]);

    const handleStatusUpdate = async () => {
        setSubmitting(true);
        try {
            const res = await fetch("/api/booking", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reqid: booking.reqid,
                    status: statusValue
                })
            });
            if (res.ok) {
                alert("Status updated!");
                // Optionally refetch booking
                const updated = await res.json();
                setBooking(prev => ({ ...prev, status: updated.booking.status }));
            } else {
                alert("Failed to update status.");
            }
        } catch (err) {
            alert("Error updating status.");
        }
        setSubmitting(false);
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
                        {booking ? (
                            <div>
                                <h2 className="text-xl font-bold mb-2">Booking Details</h2>
                                <div><b>Request ID:</b> {booking.reqid}</div>
                                <div><b>Date:</b> {booking.date ? new Date(booking.date).toLocaleString() : ""}</div>
                                <div><b>Title:</b> {booking.title}</div>
                                <div><b>Media Code:</b> {booking.mediacode}, <Link href={`/find-hoardings/${booking.mediacode}`} className='text-blue-500 hover:underline duration-150'>View Media</Link> </div>
                                <div><b>City:</b> {booking.city}</div>
                                <div><b>Type:</b> {booking.mediatype}</div>
                                <div><b>Name:</b> {booking.name}</div>
                                <div><b>Email:</b> {booking.email}</div>
                                <div><b>Phone:</b> {booking.phone}</div>
                                <div className="flex items-center gap-2">
                                    <b>Status:</b>
                                    <select
                                        value={statusValue}
                                        onChange={e => setStatusValue(e.target.value)}
                                        className="border rounded px-2 py-1"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    <button
                                        onClick={handleStatusUpdate}
                                        disabled={submitting || statusValue === booking.status}
                                        className="ml-2 px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                                    >
                                        {submitting ? "Updating..." : "Update"}
                                    </button>
                                </div>
                                <div><b>Message:</b> {booking.message}</div>
                                <div><b>Callback:</b> {booking.callback}</div>
                            </div>
                        ) : (
                            <div>Booking not found.</div>
                        )}
                    </div>
                </div>
            </AdminNav>
        );
    }

    return null;
};

export default Page;