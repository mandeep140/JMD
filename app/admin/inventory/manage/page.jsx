"use client"
import React, { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminNav from '@/app/component/AdminNav';

// Indian cities list
const indianCities = [
  "Agra", "Ahmedabad", "Ajmer", "Allahabad", "Amritsar", "Aurangabad", "Bangalore", "Bareilly", "Belgaum", "Bhavnagar", "Bhilai", "Bhopal", "Bhubaneswar", "Bikaner", "Bilaspur", "Bokaro", "Chandigarh", "Chennai", "Coimbatore", "Cuttack", "Dehradun", "Delhi", "Dhanbad", "Durgapur", "Faridabad", "Firozabad", "Ghaziabad", "Gorakhpur", "Guntur", "Gurgaon", "Guwahati", "Gwalior", "Hubli–Dharwad", "Hyderabad", "Indore", "Jabalpur", "Jaipur", "Jalandhar", "Jammu", "Jamnagar", "Jamshedpur", "Jhansi", "Jodhpur", "Kakinada", "Kannur", "Kanpur", "Kochi", "Kolhapur", "Kolkata", "Kota", "Kozhikode", "Kurnool", "Lucknow", "Ludhiana", "Madurai", "Malappuram", "Mangalore", "Mathura", "Meerut", "Moradabad", "Mumbai", "Mysore", "Nagpur", "Nashik", "Nellore", "New Delhi", "Noida", "Patna", "Pondicherry", "Pune", "Raipur", "Rajkot", "Ranchi", "Rourkela", "Salem", "Sangli", "Shimla", "Siliguri", "Solapur", "Srinagar", "Surat", "Thiruvananthapuram", "Thrissur", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Ujjain", "Vadodara", "Varanasi", "Vasai-Virar", "Vijayawada", "Visakhapatnam", "Warangal"
];

// Lighting options
const lightingOptions = [
  "No Light",
  "Fully Light", 
  "Front Light",
  "Back Light",
  "Side Light",
  "LED Light",
  "Spot Light"
];

const initialForm = {
  mediacode: "",
  title: "",
  city: "",
  lighting: "",
  status: "",
  height: "",
  width: "",
  clientname: "",
  bookedfrom: "",
  bookedtill: "",
  type: "",
  priceperday: "",
  pricepermonth: "",
  latitude: "",
  longitude: "",
  show: true,
  message: "",
  imageUrl: "",
  imageId: "",
};

const page = () => {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [mediacodeExists, setMediacodeExists] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // Update handleChange to clear bookedfrom/bookedtill if status is Available
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "status") {
      setForm((prev) => ({
        ...prev,
        status: value,
        bookedfrom: value === "Available" ? "" : prev.bookedfrom,
        bookedtill: value === "Available" ? "" : prev.bookedtill,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Upload image to ImageKit and return the URL
  const uploadImage = async (file) => {
    if (!file) return "";
    // 1. Get auth params
    const authRes = await fetch("/api/imagekit/auth");
    const auth = await authRes.json();
    // 2. Prepare form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("publicKey", auth.publicKey);
    formData.append("signature", auth.signature);
    formData.append("expire", auth.expire);
    formData.append("token", auth.token);
    formData.append("fileName", file.name);
    formData.append("folder", "/uploads");
    // 3. Upload
    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data || "";
  };

  // Generate size string from height and width
  const generateSizeString = (height, width) => {
    if (!height || !width) return "";
    const heightNum = Number(height);
    const widthNum = Number(width);
    const area = heightNum * widthNum;
    return `${height}*${width}ft (${area}sqft)`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Upload image and get URL
      let imageUrl = "";
      let imageId = "";
      let data = {};
      if (imageFile) {
        data = await uploadImage(imageFile);
        imageUrl = data.url;
        imageId = data.fileId;
      }
      
      // 2. Prepare form data with coordinates and generated size
      const payload = {
        ...form,
        imageUrl,
        imageId,
        size: generateSizeString(form.height, form.width),
        coordinates: {
          lat: form.latitude ? Number(form.latitude) : null,
          lng: form.longitude ? Number(form.longitude) : null
        }
      };
      
      // Remove height, width, latitude and longitude from the main form
      delete payload.height;
      delete payload.width;
      delete payload.latitude;
      delete payload.longitude;
      
      // 3. Send form data
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to upload");
      setForm(initialForm);
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("Media listing added!");
      router.push("/admin/inventory");
    } catch (err) {
      alert("Error uploading data", err);
    }
    setLoading(false);
  };

  // Handler for mediacode input change
  const handleMediacodeChange = async (e) => {
    const value = e.target.value.toUpperCase().trim();
    setForm(prev => ({ ...prev, mediacode: value }));
    if (value.trim().length > 0) {
      // Check with backend if mediacode exists
      const res = await fetch(`/api/ads/update?mediacode=${encodeURIComponent(value)}`);
      if (res.ok) {
        setMediacodeExists(true);
      } else {
        setMediacodeExists(false);
      }
    } else {
      setMediacodeExists(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <AdminNav>
        <div className="w-full h-screen flex items-center justify-center text-black text-center">
          {loading ? "Uploading data, please wait..." : "Hold on While we fetching data - JMD \nShowa.online"}
        </div>
      </AdminNav>
    );
  }

  return (
    <AdminNav>
      <div className='w-full md:h-9/10 flex flex-col items-center justify-start gap-4 p-2 md:p-6 bg-[#E9E9E9]'>
        {/* top nav */}
        <div className='w-full h-auto bg-white flex flex-col md:flex-row items-center justify-center rounded-md overflow-hidden'>
          <Link href="/admin/inventory/manage" className="w-full md:w-1/2">
            <span className={`block w-full py-2 text-center font-bold text-lg md:text-2xl cursor-pointer transition rounded-none md:rounded-md
              ${pathname === "/admin/inventory/manage" ? "bg-blue-200 text-blue-500 shadow-md" : "bg-transparent text-black"}`}>
              New Media Listing
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
            {/* Row 1 */}
            <div className="flex flex-col md:flex-row gap-3 w-full">
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Media Code*</label>
                <input
                  type="text"
                  name="mediacode"
                  value={form.mediacode}
                  onChange={handleMediacodeChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Media Code"
                />
                {mediacodeExists && (
                  <span className="text-red-500 text-xs">A post with this Media Code already exists!</span>
                )}
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
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                >
                  <option value="">Select City</option>
                  {indianCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Lighting*</label>
                <select
                  name="lighting"
                  value={form.lighting}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                >
                  <option value="">Select Lighting</option>
                  {lightingOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
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
            </div>
            {/* Row 3 - Height and Width */}
            <div className="flex flex-col md:flex-row gap-3 w-full">
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Height (in feet)*</label>
                <input
                  type="number"
                  step="0.1"
                  name="height"
                  value={form.height}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Height in feet"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Width (in feet)*</label>
                <input
                  type="number"
                  step="0.1"
                  name="width"
                  value={form.width}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Width in feet"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Size Preview</label>
                <div className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1 md:py-2 text-gray-600">
                  {form.height && form.width ? generateSizeString(form.height, form.width) : "Enter height and width"}
                </div>
              </div>
            </div>
            {/* Row 4 (update Booked from/till to type="date") */}
            <div className="flex flex-col md:flex-row gap-3 w-full">
              <div className={`flex-1 ${form.status !== "Booked" ? "opacity-50 cursor-not-allowed" : ""}`}>
                <label className="block text-xs md:text-sm font-semibold mb-1">Client Name{form.status === "Booked" && "*"}</label>
                <input
                  type="text"
                  name="clientname"
                  value={form.clientname}
                  onChange={handleChange}
                  required={form.status === "Booked"}
                  disabled={form.status !== "Booked"}
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Client Name"
                />
              </div>
              <div className={`flex-1 ${form.status !== "Booked" ? "opacity-50 cursor-not-allowed" : ""}`}>
                <label className="block text-xs md:text-sm font-semibold mb-1">Booked from{form.status === "Booked" && "*"}</label>
                <input
                  type="date"
                  name="bookedfrom"
                  value={form.bookedfrom}
                  onChange={handleChange}
                  required={form.status === "Booked"}
                  disabled={form.status !== "Booked"}
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Booked from"
                />
              </div>
              <div className={`flex-1 ${form.status !== "Booked" ? "opacity-50 cursor-not-allowed" : ""}`}>
                <label className="block text-xs md:text-sm font-semibold mb-1">Booked till{form.status === "Booked" && "*"}</label>
                <input
                  type="date"
                  name="bookedtill"
                  value={form.bookedtill}
                  onChange={handleChange}
                  required={form.status === "Booked"}
                  disabled={form.status !== "Booked"}
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Booked till"
                />
              </div>
            </div>
            {/* Row 5 */}
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
                  <option>Digital Billboard</option>
                  <option>Mall Media</option>
                  <option>Airport Branding</option>
                  <option>Transit Media</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Price per day*</label>
                <input
                  type="number"
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
                  type="number"
                  name="pricepermonth"
                  value={form.pricepermonth}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Price per month"
                />
              </div>
            </div>
            {/* Row 6 - Coordinates (optional) and Show on site */}
            <div className="flex flex-col md:flex-row gap-3 w-full">
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Latitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Latitude"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Longitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                  placeholder="Longitude"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-semibold mb-1">Show on site*</label>
                <select
                  name="show"
                  value={form.show ? "yes" : "no"}
                  onChange={e => setForm(prev => ({ ...prev, show: e.target.value === "yes" }))}
                  required
                  className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
            {/* Row 7: Message about media (full width) */}
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
            {/* Row 8: Image upload (required) */}
            <div className="flex flex-col items-center md:items-start">
              <span className="text-xs text-gray-500 mb-1">Upload Image*</span>
              <span className="text-xs text-gray-400 mb-2">Only JPG and PNG file supported</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                required
                className="block w-full text-xs text-gray-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
              />
              {imageFile && (
                <span className="text-xs text-green-600 mt-1">{imageFile.name}</span>
              )}
            </div>
            {/* Row 9: Actions (full width) */}
            <div className="w-full flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between gap-3 mt-2">
              <button type="submit" className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold text-xs md:text-sm">
                <span className="mr-1">➕</span> Add Media in Listing
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminNav>
  )
}

export default page
