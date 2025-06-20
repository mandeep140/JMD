"use client";
import React, { useState, useEffect } from 'react'
import AdminNav from '@/app/component/AdminNav'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const bookingStats = {
  total: 335,
  approved: 335,
  denied: 335,
  pending: 335,
};

// Data for cities
const cityChartData = [
  { name: "Kolkata", value: 40, color: "#9B59B6" },
  { name: "Jamshedpur", value: 30, color: "#2ECC71" },
  { name: "Gaya", value: 20, color: "#3498DB" },
  { name: "Hyderabad", value: 15, color: "#1ABC9C" },
  { name: "Patna", value: 10, color: "#16A085" },
  { name: "Siliguri", value: 8, color: "#C0392B" },
  { name: "Raipur", value: 7, color: "#F1C40F" },
  { name: "Bokaro", value: 5, color: "#E74C3C" },
];

// Data for media types
const mediaChartData = [
  { name: "Billboard", value: 50, color: "#9B59B6" },
  { name: "Digital Billboard", value: 30, color: "#2ECC71" },
  { name: "Mall Media", value: 20, color: "#3498DB" },
  { name: "Airport Branding", value: 15, color: "#1ABC9C" },
  { name: "Transit Media", value: 10, color: "#E74C3C" },
];

function renderCustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const { name, value, percent, color } = payload[0];
    return (
      <div className="bg-white border rounded shadow px-3 py-2 text-xs font-semibold" style={{ color }}>
        <div>{name}</div>
        <div>
          <span className="font-bold">{value}%</span>
        </div>
      </div>
    );
  }
  return null;
}

// Pie chart component
function DonutChart({ data, label }) {
  return (
    <ResponsiveContainer width={200} height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          labelLine={false}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={renderCustomTooltip} />
      </PieChart>
    </ResponsiveContainer>
  );
}

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
                    <div className="bg-white w-full h-auto min-h-9/10 text-black rounded-lg shadow p-2 md:p-4 flex flex-col gap-8">
                     
                    {/* Booking stats */}
                    <div className="w-full flex flex-col md:flex-row gap-4 justify-between items-center">
                      <div className="flex-1 flex flex-col items-center border-b-2 md:border-b-0 md:border-r-2 border-black pb-2 md:pb-0 md:pr-4">
                        <span className="font-bold text-lg md:text-xl">Total Bookings:</span>
                        <span className="text-orange-500 text-2xl md:text-3xl font-bold">{bookingStats.total}</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center border-b-2 md:border-b-0 md:border-r-2 border-black pb-2 md:pb-0 md:pr-4">
                        <span className="font-bold text-lg md:text-xl">Approved Bookings:</span>
                        <span className="text-green-500 text-2xl md:text-3xl font-bold">{bookingStats.approved}</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center border-b-2 md:border-b-0 md:border-r-2 border-black pb-2 md:pb-0 md:pr-4">
                        <span className="font-bold text-lg md:text-xl">Denied Bookings:</span>
                        <span className="text-red-500 text-2xl md:text-3xl font-bold">{bookingStats.denied}</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <span className="font-bold text-lg md:text-xl">Pending Bookings:</span>
                        <span className="text-gray-400 text-2xl md:text-3xl font-bold">{bookingStats.pending}</span>
                      </div>
                    </div>

                    {/* Donut charts and legends */}
                    <div className="w-full flex flex-col md:flex-row gap-8 md:my-auto">
                      {/* Cities */}
                      <div className="flex-1 flex flex-col items-center">
                        <Card className="mb-4 w-fit">
                          <CardHeader className="items-center pb-0">
                            <CardTitle>Top Request Cities</CardTitle>
                          </CardHeader>
                          <CardContent className="flex-1 pb-0 flex items-center justify-center">
                            <DonutChart data={cityChartData} label="Cities" />
                          </CardContent>
                        </Card>
                        {/* Legend */}
                        <div className="flex flex-wrap gap-2 justify-center">
                          {cityChartData.map(city => (
                            <span key={city.name} className="flex items-center gap-1 text-xs">
                              <span className="inline-block w-3 h-3 rounded-full" style={{ background: city.color }}></span>
                              {city.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Media Types */}
                      <div className="flex-1 flex flex-col items-center">
                        <Card className="mb-4 w-fit">
                          <CardHeader className="items-center pb-0">
                            <CardTitle>Top Request Media Type </CardTitle>
                          </CardHeader>
                          <CardContent className="flex-1 pb-0 flex items-center justify-center">
                            <DonutChart data={mediaChartData} label="Media" />
                          </CardContent>
                        </Card>
                        {/* Legend */}
                        <div className="flex flex-wrap gap-2 justify-center">
                          {mediaChartData.map(media => (
                            <span key={media.name} className="flex items-center gap-1 text-xs">
                              <span className="inline-block w-3 h-3 rounded-full" style={{ background: media.color }}></span>
                              {media.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </AdminNav>
        )
    }
}

export default page