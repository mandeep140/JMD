"use client"
import React, { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminNav from '@/app/component/AdminNav';

// Updated cities list with Bihar, Jharkhand, West Bengal, Chhattisgarh, and Odisha cities
const indianCities = [
  // Bihar
  "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra (Saran)", "Danapur", "Hajipur", "Siwan", "Motihari", "Bettiah", "Sasaram", "Dehri", "Samastipur", "Aurangabad", "Buxar", "Sitamarhi", "Jamalpur", "Nawada", "Khagaria", "Jehanabad", "Madhubani", "Supaul", "Lakhisarai", "Sheikhpura", "Arwal", "Kishanganj", "Madhepura", "Vaishali",

  // Jharkhand
  "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Chirkunda", "Lohardaga", "Chaibasa (West Singhbhum)", "Gumla", "Medininagar (Daltonganj)", "Dumka", "Sahebganj", "Jamtara", "Pakur", "Godda", "Latehar", "Khunti", "Simdega", "Chatra", "Koderma", "Barhi", "Phusro", "Chakradharpur", "Adityapur", "Saraikela",

  // West Bengal
  "Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Kharagpur", "Haldia", "Malda (English Bazar)", "Berhampore",

  // Chhattisgarh
  "Raipur", "Durg", "Bilaspur", "Korba", "Raigarh", "Jagdalpur", "Ambikapur",

  // Odisha
  "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur (Brahmapur)", "Sambalpur", "Balasore", "Baripada", "Jharsuguda", "Puri", "Angul",

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

const initialForm = {
  mediacode: "",
  title: "",
  city: "",
  customCity: "", // New field for custom city input
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

      // Generate size string from height and width
      const sizeString = form.height && form.width ?
        `${form.height}*${form.width}ft (${(parseFloat(form.height) * parseFloat(form.width)).toFixed(0)}sqft)` : "";

      const formData = {
        ...form,
        city: finalCity,
        size: sizeString, // Add the generated size
        imageUrl,
        imageId,
      };

      // Remove fields that shouldn't be sent to API
      delete formData.customCity;
      delete formData.height;
      delete formData.width;

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
          {/* top nav */}
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

          {/* main form container */}
          <div className="bg-white w-full h-auto text-black rounded-lg shadow p-2 md:p-4 flex-1 max-w-full overflow-hidden">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Add New Advertisement</h2>

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1 */}
                <div className="flex flex-col md:flex-row gap-3 w-full">
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs md:text-sm font-semibold mb-1">Media Code*</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="mediacode"
                        value={form.mediacode}
                        onChange={handleChange}
                        required
                        className={`w-full bg-[#E9E9E9] border ${mediacodeExists
                            ? 'border-red-500 focus:border-red-500'
                            : form.mediacode && !mediacodeExists
                              ? 'border-green-500 focus:border-green-500'
                              : 'border-gray-300 focus:border-blue-400'
                          } focus:outline-none rounded px-2 py-1 md:py-2 pr-10`}
                        placeholder="Enter unique media code"
                      />
                      {/* Status indicator */}
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
                    {/* Status message */}
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
                      className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2"
                      placeholder="Advertisement title"
                    />
                  </div>
                </div>

                {/* Row 2 - City, Lighting, and Show on site */}
                <div className="flex flex-col md:flex-row gap-3 w-full">
                  <div className="flex-1 min-w-0">
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
                      <option value="Other">Other</option>
                    </select>

                    {/* Custom City Input - Show when "Other" is selected */}
                    {form.city === "Other" && (
                      <input
                        type="text"
                        name="customCity"
                        value={form.customCity}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#E9E9E9] border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-2 py-1 md:py-2 mt-2"
                        placeholder="Enter custom city name"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
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

                  <div className="flex-1 min-w-0">
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

                {/* Row 3 - Status, Height, Width, Size Preview */}
                <div className="flex flex-col md:flex-row gap-3 w-full">
                  <div className="flex-1 min-w-0">
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
                  <div className="flex-1 min-w-0">
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
                  <div className="flex-1 min-w-0">
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
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs md:text-sm font-semibold mb-1">Size Preview</label>
                    <div className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1 md:py-2 text-gray-600">
                      {form.height && form.width ? `${form.height}*${form.width}ft (${(parseFloat(form.height) * parseFloat(form.width)).toFixed(0)}sqft)` : "Enter height and width"}
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
                  <div className="flex-1 min-w-0">
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
                  <div className="flex-1 min-w-0">
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
                  <div className="flex-1 min-w-0">
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
                  <div className="flex-1 min-w-0">
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
                  <div className="flex-1 min-w-0">
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
                  {/* Submit button */}
                  <div className="flex justify-center pt-6 pb-2">
                    <button
                      type="submit"
                      disabled={loading || mediacodeExists || !form.mediacode}
                      className={`
                      ${loading || mediacodeExists || !form.mediacode
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                        } 
                      text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 
                      w-full md:w-auto min-w-[200px] text-lg shadow-lg
                      ${!loading && !mediacodeExists && form.mediacode ? 'hover:shadow-xl transform hover:-translate-y-0.5' : ''}
                    `}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding Advertisement...
                        </span>
                      ) : mediacodeExists ? (
                        "❌ Media Code Already Exists"
                      ) : !form.mediacode ? (
                        "Enter Media Code to Continue"
                      ) : (
                        "🚀 Add Advertisement"
                      )}
                    </button>
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
}

export default page
