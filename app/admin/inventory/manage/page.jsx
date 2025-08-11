"use client"
import React, { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminNav from '@/app/component/AdminNav';

// Updated cities list with Bihar, Jharkhand, West Bengal, Chhattisgarh, and Odisha cities
const indianCities = [
  // Jharkhand
  "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Chirkunda", "Lohardaga", "Chaibasa (West Singhbhum)", "Gumla", "Medininagar (Daltonganj)", "Dumka", "Sahebganj", "Jamtara", "Pakur", "Godda", "Latehar", "Khunti", "Simdega", "Chatra", "Koderma", "Barhi", "Phusro", "Chakradharpur", "Adityapur", "Saraikela",

  // Bihar
  "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra (Saran)", "Danapur", "Hajipur", "Siwan", "Motihari", "Bettiah", "Sasaram", "Dehri", "Samastipur", "Aurangabad", "Buxar", "Sitamarhi", "Jamalpur", "Nawada", "Khagaria", "Jehanabad", "Madhubani", "Supaul", "Lakhisarai", "Sheikhpura", "Arwal", "Kishanganj", "Madhepura", "Vaishali",

  // West Bengal
  "Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Kharagpur", "Haldia", "Malda (English Bazar)", "Berhampore",

  // Odisha
  "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur (Brahmapur)", "Sambalpur", "Balasore", "Baripada", "Jharsuguda", "Puri", "Angul",

  // Chhattisgarh
  "Raipur", "Durg", "Bilaspur", "Korba", "Raigarh", "Jagdalpur", "Ambikapur",

  // Other major cities
  "Agra", "Ahmedabad", "Ajmer", "Allahabad", "Amritsar", "Bangalore", "Bareilly", "Belgaum", "Bhavnagar", "Bhilai", "Bhopal", "Bikaner", "Chandigarh", "Chennai", "Coimbatore", "Dehradun", "Delhi", "Faridabad", "Firozabad", "Ghaziabad", "Gorakhpur", "Guntur", "Gurgaon", "Guwahati", "Gwalior", "Hubli–Dharwad", "Hyderabad", "Indore", "Jabalpur", "Jaipur", "Jalandhar", "Jammu", "Jamnagar", "Jhansi", "Jodhpur", "Kakinada", "Kannur", "Kanpur", "Kochi", "Kolhapur", "Kota", "Kozhikode", "Kurnool", "Lucknow", "Ludhiana", "Madurai", "Malappuram", "Mangalore", "Mathura", "Meerut", "Moradabad", "Mumbai", "Mysore", "Nagpur", "Nashik", "Nellore", "New Delhi", "Noida", "Pondicherry", "Pune", "Rajkot", "Salem", "Sangli", "Shimla", "Solapur", "Srinagar", "Surat", "Thiruvananthapuram", "Thrissur", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Ujjain", "Vadodara", "Varanasi", "Vasai-Virar", "Vijayawada", "Visakhapatnam", "Warangal"
];

// Lighting options
const lightingOptions = [
  "No Light",
  "Fully Light",
  "Front Light",
  "Back Light",
];

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

const initialForm = {
  mediacode: "",
  title: "",
  city: "",
  customCity: "",
  type: "",
  lighting: "",
  visibility: "Single",
  show: true,
  locality: "",
  latitude: "",
  longitude: "",
  height: "",
  width: "",
  unit: 1,
  status: "",
  clientname: "",
  bookedfrom: "",
  bookedtill: "",
  priceperday: "",
  pricepermonth: "",
  printing: "",
  mounting: "",
  message: "",
  state: "",
  holdBookedBy: "",
  mediaOwner: ""
};

const page = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [mediacodeExists, setMediacodeExists] = useState(false);
  const fileInputRef = useRef(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // Update handleChange to handle city and customCity
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "city") {
      setForm((prev) => ({
        ...prev,
        city: value,
        customCity: value === "Other" ? prev.customCity : "", // Keep custom city if Other is selected
      }));
    } else if (name === "status") {
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
    const file = e.target.files[0];
    setImageFile(file);
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
    const result = await res.json();
    return { url: result.url, fileId: result.fileId };
  };

  // Check if mediacode already exists
  const checkMediacode = async (mediacode) => {
    if (!mediacode) return;
    try {
      // Use the availability check endpoint
      const res = await fetch(`/api/ads?mediacode=${encodeURIComponent(mediacode)}&check=availability`);
      const data = await res.json();
      setMediacodeExists(data.exists);
    } catch (error) {
      console.error("Error checking mediacode:", error);
      setMediacodeExists(false);
    }
  };

  // Handle mediacode change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.mediacode) {
        checkMediacode(form.mediacode);
      } else {
        setMediacodeExists(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.mediacode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mediacodeExists) {
      alert("Media code already exists. Please choose a different one.");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = "";
      let imageId = "";

      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.url;
        imageId = uploadResult.fileId;
      }

      // Use custom city if "Other" is selected, otherwise use selected city
      const finalCity = form.city === "Other" ? form.customCity : form.city;

      if (form.city === "Other" && !form.customCity.trim()) {
        alert("Please enter a custom city name.");
        setLoading(false);
        return;
      }

      // Generate size string from height and width (including unit info)
      const sizeString = form.height && form.width ?
        `${form.height}*${form.width}ft (${(parseFloat(form.height) * parseFloat(form.width)).toFixed(0)}sqft)` : "";

      const formData = {
        ...form,
        city: finalCity,
        size: sizeString, // Keep for backward compatibility
        height: form.height, // Store separately
        width: form.width, // Store separately
        unit: form.unit, // Store number of units
        printing: form.printing, // Store printing type
        mounting: form.mounting, // Store mounting type
        locality: form.locality, // Store locality
        state: form.state, // Store state
        holdBookedBy: form.holdBookedBy, // Store hold booked by
        mediaOwner: form.mediaOwner,
        imageUrl,
        imageId,
        visibility: form.visibility,
        uploadedBy: {
          name: session?.user?.name || "Unknown",
          email: session?.user?.email || "Unknown"
        }
      };

      // Remove form-specific fields that shouldn't be sent to API
      delete formData.customCity;

      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Advertisement added successfully! 🎉");
        setForm(initialForm);
        setImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        router.push("/admin/inventory");
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || "Failed to add advertisement"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form. Please try again.");
    }
    setLoading(false);
  };

  if (status === "loading") {
    return <div className="w-full h-screen flex items-center justify-center text-black text-center">Hold on While we fetching data - JMD <br />Showa.online</div>;
  }

  if (status === "authenticated") {
    return (
      <AdminNav>
        <div className='w-full h-auto min-h-screen flex flex-col items-center justify-start gap-4 p-2 md:p-6 bg-[#E9E9E9] overflow-y-auto'>
          {/* Navigation Tabs */}
          <div className='w-full h-auto bg-white flex flex-col md:flex-row items-center justify-center rounded-md overflow-hidden shrink-0'>
            <Link href="/admin/inventory/manage" className="w-full md:w-1/2">
              <span className={`block w-full py-2 text-center font-bold text-lg md:text-2xl cursor-pointer transition rounded-none md:rounded-md
              ${pathname === "/admin/inventory/manage" ? "bg-blue-200 text-blue-500 shadow-md" : "bg-transparent text-black"}`}>
                New Media Listing
              </span>
            </Link>
            <Link href="/admin/inventory" className="w-full md:w-1/2">
              <span className={`block w-full py-2 text-center font-bold text-lg md:text-2xl cursor-pointer transition rounded-none md:rounded-md
              ${pathname === "/admin/inventory" ? "bg-blue-200 text-blue-500 shadow-md" : "bg-transparent text-black"}`}>
                View Inventory Table
              </span>
            </Link>
          </div>

          {/* Main Form Container */}
          <div className="bg-white w-full h-auto text-black rounded-lg shadow p-2 md:p-4 flex-1 max-w-full overflow-hidden">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">Add New Advertisement</h2>

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* BASIC DETAILS SECTION */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 border-b border-gray-300 pb-2">Basic Details</h3>

                  {/* Row 1 - Media Code & Title */}
                  <div className="flex flex-col md:flex-row gap-3 w-full mb-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Media Code*</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="mediacode"
                          value={form.mediacode}
                          onChange={handleChange}
                          required
                          className={`w-full bg-white border ${mediacodeExists
                            ? 'border-red-500 focus:border-red-500'
                            : form.mediacode && !mediacodeExists
                              ? 'border-green-500 focus:border-green-500'
                              : 'border-gray-300 focus:border-blue-400'
                            } focus:outline-none rounded px-3 py-2 pr-10`}
                          placeholder="JH01LT0865"
                        />
                        {form.mediacode && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {mediacodeExists ? (
                              <span className="text-red-500 text-lg">❌</span>
                            ) : (
                              <span className="text-green-500 text-lg">✅</span>
                            )}
                          </div>
                        )}
                      </div>
                      {form.mediacode && (
                        <div className="mt-1">
                          {mediacodeExists ? (
                            <p className="text-red-500 text-xs flex items-center gap-1">
                              <span>⚠️</span>
                              This media code already exists. Please choose a different one.
                            </p>
                          ) : (
                            <p className="text-green-500 text-xs flex items-center gap-1">
                              <span>✅</span>
                              Media code is available!
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Title*</label>
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="Advertisement title"
                      />
                    </div>
                  </div>

                  {/* Row 2 - Type, Lighting, Visibility, Show on Site */}
                  <div className="flex flex-col md:flex-row gap-3 w-full">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Type*</label>
                      <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                      >
                        <option value="">Select</option>
                        <option>Hoarding</option>
                        <option>Digital Hoarding</option>
                        <option>Mall Media</option>
                        <option>Airport Branding</option>
                        <option>Transit Media</option>
                        <option>Pole Kiosk</option>
                        <option>Railway Station Branding</option>
                        <option>Unipole</option>
                        <option>Bus Shelter Branding</option>
                        <option>Digital Marketing</option>
                      </select>
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Lighting*</label>
                      <select
                        name="lighting"
                        value={form.lighting}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                      >
                        <option value="">Select</option>
                        {lightingOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Visibility*</label>
                      <select
                        name="visibility"
                        value={form.visibility}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                      >
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                      </select>
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Show on site*</label>
                      <select
                        name="show"
                        value={form.show ? "yes" : "no"}
                        onChange={e => setForm(prev => ({ ...prev, show: e.target.value === "yes" }))}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* LOCATION AND SIZE SECTION */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 border-b border-gray-300 pb-2">Location and Size</h3>

                  {/* Row 1 - Locality, City, Latitude, Longitude */}
                  <div className="flex flex-col md:flex-row gap-3 w-full mb-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Locality*</label>
                      <input
                        type="text"
                        name="locality"
                        value={form.locality}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="Type Here"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">City*</label>
                      <select
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                      >
                        <option value="">Select</option>
                        {indianCities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                        <option value="Other">Other</option>
                      </select>

                      {form.city === "Other" && (
                        <input
                          type="text"
                          name="customCity"
                          value={form.customCity}
                          onChange={handleChange}
                          required
                          className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2 mt-2"
                          placeholder="Enter custom city name"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">State*</label>
                      <select
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                      >
                        <option value="">Select</option>
                        {indianStates.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        value={form.latitude}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="Type Here"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        value={form.longitude}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="Type Here"
                      />
                    </div>
                  </div>

                  {/* Row 2 - Height, Width, Area, Units */}
                  <div className="flex flex-col md:flex-row gap-3 w-full">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Height*</label>
                      <input
                        type="number"
                        step="0.1"
                        name="height"
                        value={form.height}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="20"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Width*</label>
                      <input
                        type="number"
                        step="0.1"
                        name="width"
                        value={form.width}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="30"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Area</label>
                      <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-600">
                        {form.height && form.width ? `${(parseFloat(form.height) * parseFloat(form.width)).toFixed(0)} sqft` : "Total Sqft"}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Units*</label>
                      <input
                        type="number"
                        min="1"
                        name="unit"
                        value={form.unit}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>

                {/* PRICING, BOOKING & OTHERS SECTION */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 border-b border-gray-300 pb-2">Pricing, Booking & Others</h3>

                  {/* Row 1 - Price per Day, Price per Month, Mounting charges, Printing Charge */}
                  <div className="flex flex-col md:flex-row gap-3 w-full mb-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Price per Day</label>
                      <input
                        type="number"
                        name="priceperday"
                        value={form.priceperday}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="Type Here"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Price per Month*</label>
                      <input
                        type="number"
                        name="pricepermonth"
                        value={form.pricepermonth}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="Type Here"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Mounting charges*</label>
                      <input
                        type="number"
                        name="mounting"
                        value={form.mounting}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="price per unit"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Printing Charge*</label>
                      <input
                        type="number"
                        name="printing"
                        value={form.printing}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="price per sqft"
                      />
                    </div>
                  </div>

                  {/* Row 2 - Status, Client Name, Booked From, Booked Till */}
                  <div className="flex flex-col md:flex-row gap-3 w-full mb-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Status*</label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                      >
                        <option value="">Select</option>
                        <option>Available</option>
                        <option>Booked</option>
                        <option>Hold</option>
                      </select>
                    </div>

                    <div className={`flex-1 ${form.status !== "Booked" ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <label className="block text-xs md:text-sm font-semibold mb-1">Client Name{form.status === "Booked" && "*"}</label>
                      <input
                        type="text"
                        name="clientname"
                        value={form.clientname}
                        onChange={handleChange}
                        required={form.status === "Booked"}
                        disabled={form.status !== "Booked"}
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="Type Here"
                      />
                    </div>

                    <div className={`flex-1 ${form.status !== "Booked" ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <label className="block text-xs md:text-sm font-semibold mb-1">Booked From{form.status === "Booked" && "*"}</label>
                      <input
                        type="date"
                        name="bookedfrom"
                        value={form.bookedfrom}
                        onChange={handleChange}
                        required={form.status === "Booked"}
                        disabled={form.status !== "Booked"}
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="Type Here"
                      />
                    </div>

                    <div className={`flex-1 ${form.status !== "Booked" ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <label className="block text-xs md:text-sm font-semibold mb-1">Booked Till{form.status === "Booked" && "*"}</label>
                      <input
                        type="date"
                        name="bookedtill"
                        value={form.bookedtill}
                        onChange={handleChange}
                        required={form.status === "Booked"}
                        disabled={form.status !== "Booked"}
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="Type Here"
                      />
                    </div>
                  </div>

                  {/* Row 3 - hold/booked by, media owner */}
                  <div className="flex flex-col md:flex-row gap-3 w-full">
                    <div className='flex-1 min-w-0'>
                      <label className="block text-xs md:text-sm font-semibold mb-1">Hold/Booked By</label>
                      <input
                        type="text"
                        name="holdBookedBy"
                        value={form.holdBookedBy}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="Type Here"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Media Owner</label>
                      <input
                        type="text"
                        name="mediaOwner"
                        value={form.mediaOwner}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="Type Here"
                      />
                    </div>
                  </div>
                </div>

                {/* MESSAGE SECTION */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 border-b border-gray-300 pb-2">Message about media*</h3>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                    rows={3}
                    placeholder="NH-45 in Jamshedpur at JMD Advertisement, In media options rates are mentioned in the advertising for all advertising options available at the Mall. Once you decided on the media option, do reach out to us to get the best discount available."
                  />
                </div>

                {/* IMAGE UPLOAD SECTION */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 border-b border-gray-300 pb-2">Upload Image</h3>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-400 mb-2">Only JPG and PNG file supported</span>

                    <div className="flex gap-4 items-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Image
                      </button>

                      <button
                        type="submit"
                        disabled={loading || mediacodeExists || !form.mediacode}
                        className={`px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${loading || mediacodeExists || !form.mediacode
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Media in Listing
                      </button>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      required
                      className="hidden"
                    />

                    {imageFile && (
                      <span className="text-xs text-green-600 mt-2">{imageFile.name}</span>
                    )}
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      </AdminNav>
    );
  }

  return null;
};

export default page;
