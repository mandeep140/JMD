"use client"
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminNav from '@/app/component/AdminNav';

const initialForm = {
  mediacode: "",
  title: "",
  city: "",
  lighting: "",
  status: "",
  size: "",
  clientname: "",
  bookedfrom: "",
  bookedtill: "",
  type: "",
  priceperday: "",
  pricepermonth: "",
  locationmap: "",
  longitude: "",
  latitude: "",
  message: "",
  imageUrl: "",
};

const Page = () => {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mediacode = searchParams.get("mediacode");

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);

  // Fetch ad data on mount
  useEffect(() => {
    if (!mediacode) {
      alert("No mediacode provided");
      router.push("/admin/inventory");
      return;
    }
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads/update?mediacode=${encodeURIComponent(mediacode)}`);
        if (!res.ok) throw new Error("Failed to fetch ad");
        const ad = await res.json();
        setForm({
          ...ad,
          longitude: ad.codinates?.lng || "",
          latitude: ad.codinates?.lat || "",
        });
      } catch (err) {
        alert("Error fetching ad");
        router.push("/admin/inventory");
      }
      setLoading(false);
    };
    fetchAd();
  }, [mediacode, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        codinates: {
          lat: Number(form.latitude),
          lng: Number(form.longitude),
        },
      };
      const res = await fetch("/api/ads/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      alert("Ad updated!");
      router.push("/admin/inventory");
    } catch (err) {
      alert("Error updating ad");
    }
    setLoading(false);
  };

  if (status === "loading" || loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-black text-center">
        Loading...
      </div>
    );
  }

  return (
    <AdminNav>
      <div className='w-full md:h-9/10 flex flex-col items-center justify-start gap-4 p-2 md:p-6 bg-[#E9E9E9]'>
        {/* top nav */}
        <div className='w-full h-auto bg-white flex flex-col md:flex-row items-center justify-center rounded-md overflow-hidden'>
          <Link href="/admin/inventory/manage" className="w-full md:w-1/2">
            <span className={`block w-full py-2 text-center font-bold text-lg md:text-2xl cursor-pointer transition rounded-none md:rounded-md
              bg-blue-200 text-blue-500 shadow-md`}>
              Update Media Listing
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
          <form className="w-full h-auto flex flex-col gap-3" onSubmit={handleSubmit}>
            {/* All input fields, prefilled with form values */}
            {/* ...repeat your input fields, using value={form.field} and onChange={handleChange} ... */}
            {/* Example for Media Code (readonly) */}
            <div className="flex flex-col md:flex-row gap-3 w-full">
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Media Code*</label>
                <input
                  type="text"
                  name="mediacode"
                  value={form.mediacode}
                  readOnly
                  className="w-full bg-gray-200 border border-gray-300 rounded px-2 py-1 md:py-2"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Title*</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
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
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="City"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Lighting*</label>
                <input
                  type="text"
                  name="lighting"
                  value={form.lighting}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Lighting"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Status*</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                >
                  <option value="">Select</option>
                  <option>Available</option>
                  <option>Booked</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Size*</label>
                <input
                  type="text"
                  name="size"
                  value={form.size}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Size"
                />
              </div>
            </div>
            {/* Row 3 */}
            <div className="flex flex-col md:flex-row gap-3 w-full">
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Client Name*</label>
                <input
                  type="text"
                  name="clientname"
                  value={form.clientname}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Client Name"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Booked from*</label>
                <input
                  type="text"
                  name="bookedfrom"
                  value={form.bookedfrom}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Booked from"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Booked till*</label>
                <input
                  type="text"
                  name="bookedtill"
                  value={form.bookedtill}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Booked till"
                />
              </div>
            </div>
            {/* Row 4 */}
            <div className="flex flex-col md:flex-row gap-3 w-full">
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Type*</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                >
                  <option value="">Select</option>
                  <option>Billboard</option>
                  <option>Digital</option>
                  <option>Mall</option>
                  <option>Airport</option>
                  <option>Transit</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Price per day*</label>
                <input
                  type="text"
                  name="priceperday"
                  value={form.priceperday}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Price per day"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Price per month*</label>
                <input
                  type="text"
                  name="pricepermonth"
                  value={form.pricepermonth}
                  onChange={handleChange}
                  required
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
                  name="locationmap"
                  value={form.locationmap}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Location map link"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Longitude*</label>
                <input
                  type="text"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Longitude"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Latitude*</label>
                <input
                  type="text"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Latitude"
                />
              </div>
            </div>
            {/* Row 6: Message (full width) */}
            <div className="w-full">
              <label className="block text-xs md:text-sm font-semibold mb-1">Message about media*</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                rows={2}
                placeholder="Message about media"
              />
            </div>
            {/* Row 7: Show current image only, no upload */}
            <div className="flex flex-col items-center md:items-start">
              <span className="text-xs text-gray-500 mb-1">Current Image</span>
              {form.imageUrl && (
                <img src={form.imageUrl} alt="Ad" className="w-40 rounded border mb-2" />
              )}
            </div>
            {/* Actions */}
            <div className="w-full flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between gap-3 mt-2">
              <button type="submit" className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold text-xs md:text-sm">
                Update Media Listing
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminNav>
  );
};

export default Page;
