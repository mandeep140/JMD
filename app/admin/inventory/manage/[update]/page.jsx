"use client"
import React, { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
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
  "Raipur", "Bhilai", "Durg", "Bilaspur", "Korba", "Raigarh", "Jagdalpur", "Ambikapur",

  // Other major cities
  "Agra", "Ahmedabad", "Ajmer", "Allahabad", "Amritsar", "Bangalore", "Bareilly", "Belgaum", "Bhavnagar", "Bhopal", "Bikaner", "Chandigarh", "Chennai", "Coimbatore", "Dehradun", "Delhi", "Faridabad", "Firozabad", "Ghaziabad", "Gorakhpur", "Guntur", "Gurgaon", "Guwahati", "Gwalior", "Hubli–Dharwad", "Hyderabad", "Indore", "Jabalpur", "Jaipur", "Jalandhar", "Jammu", "Jamnagar", "Jhansi", "Jodhpur", "Kakinada", "Kannur", "Kanpur", "Kochi", "Kolhapur", "Kota", "Kozhikode", "Kurnool", "Lucknow", "Ludhiana", "Madurai", "Malappuram", "Mangalore", "Mathura", "Meerut", "Moradabad", "Mumbai", "Mysore", "Nagpur", "Nashik", "Nellore", "New Delhi", "Noida", "Pondicherry", "Pune", "Rajkot", "Salem", "Sangli", "Shimla", "Solapur", "Srinagar", "Surat", "Thiruvananthapuram", "Thrissur", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Ujjain", "Vadodara", "Varanasi", "Vasai-Virar", "Vijayawada", "Visakhapatnam", "Warangal"
];

// Lighting options
const lightingOptions = [
  "No Light",
  "Fully Light",
  "Front Light",
  "Back Light",
];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const initialForm = {
  mediacode: "",
  title: "",
  city: "",
  customCity: "",
  lighting: "",
  status: "",
  height: "",
  width: "",
  unit: 1,
  printing: "",
  mounting: "",
  locality: "",
  clientname: "",
  bookedfrom: "",
  bookedtill: "",
  type: "",
  priceperday: "",
  pricepermonth: "",
  latitude: "",
  longitude: "",
  show: true,
  state: "",
  holdBookedBy: "",
  mediaOwner: "",
  visibility: "Single",
  message: "",
  imageUrl: "",
  imageId: "",
  date: "",
};

// Function to parse size string back to height and width
const parseSizeString = (sizeString) => {
  if (!sizeString) return { height: "", width: "" };
  // Parse formats like "10*20ft (200sqft)" or "10*20" or similar
  const match = sizeString.match(/(\d+(?:\.\d+)?)\*(\d+(?:\.\d+)?)/);
  if (match) {
    return {
      height: match[1],
      width: match[2]
    };
  }
  return { height: "", width: "" };
};

const Page = () => {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const mediacode = params.update;
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

        // Parse existing size to get height and width if not available separately
        const { height, width } = parseSizeString(ad.size);

        // Check if current city is in the list, if not set it as "Other" and put in customCity
        const cityInList = indianCities.includes(ad.city);

        setForm({
          ...ad,
          show: ad.show ?? true,
          date: ad.date ? ad.date.substring(0, 10) : "",
          latitude: ad.coordinates?.lat || "",
          longitude: ad.coordinates?.lng || "",
          visibility: ad.visibility || "Single",
          height: ad.height || height || "",
          width: ad.width || width || "",
          unit: ad.unit || 1,
          printing: ad.printing || "",
          mounting: ad.mounting || "",
          locality: ad.locality || "",
          state: ad.state || "",
          holdBookedBy: ad.holdBookedBy || "",
          mediaOwner: ad.mediaOwner || "",
          imageId: ad.imageId || "",
          city: cityInList ? ad.city : "Other",
          customCity: cityInList ? "" : ad.city
        });
      } catch (error) {
        console.error("Error fetching ad:", error);
        alert("Failed to fetch ad data");
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

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to ImageKit and return the URL
  const uploadImage = async (file) => {
    if (!file) return { url: "", fileId: "" };
    
    try {
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
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // Delete old image from ImageKit
  const deleteOldImage = async (imageId) => {
    if (!imageId) return;
    
    try {
      const res = await fetch("/api/imagekit/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: imageId }),
      });
      
      if (!res.ok) {
        console.error("Failed to delete old image from ImageKit");
      }
    } catch (error) {
      console.error("Error deleting old image:", error);
    }
  };

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
        holdBookedBy: value === "Available" ? "" : prev.holdBookedBy,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let newImageUrl = form.imageUrl;
      let newImageId = form.imageId;

      // Handle image update if a new image is selected
      if (imageFile) {
        // Upload new image
        const uploadResult = await uploadImage(imageFile);
        newImageUrl = uploadResult.url;
        newImageId = uploadResult.fileId;

        // Delete old image if it exists
        if (form.imageId) {
          await deleteOldImage(form.imageId);
        }
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

      const updateData = {
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
        mediaOwner: form.mediaOwner, // Store media owner
        imageUrl: newImageUrl,
        imageId: newImageId,
        coordinates: {
          lat: parseFloat(form.latitude) || 0,
          lng: parseFloat(form.longitude) || 0
        },
        visibility: form.visibility,
        // Keep existing uploadedBy info if present
        uploadedBy: form.uploadedBy || {
          name: "Unknown",
          email: "Unknown"
        }
      };

      // Remove form-specific fields that shouldn't be sent to API
      delete updateData.latitude;
      delete updateData.longitude;
      delete updateData.customCity;

      const res = await fetch("/api/ads/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        alert("Advertisement updated successfully! ✅");
        router.push("/admin/inventory");
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || "Failed to update advertisement"}`);
      }
    } catch (error) {
      console.error("Error updating ad:", error);
      alert("An error occurred while updating the advertisement. Please try again.");
    }
    setLoading(false);
  };

  // Clear image selection
  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (status === "loading" || loading) {
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
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">Update Advertisement</h2>

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* BASIC DETAILS SECTION */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 border-b border-gray-300 pb-2">Basic Details</h3>

                  {/* Row 1 - Media Code & Title */}
                  <div className="flex flex-col md:flex-row gap-3 w-full mb-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Media Code*</label>
                      <input
                        type="text"
                        name="mediacode"
                        value={form.mediacode}
                        readOnly
                        className="w-full bg-gray-200 border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                      />
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
                        {form.height && form.width ? `${(parseFloat(form.height) * parseFloat(form.width)).toFixed(0)} sqft` : "Total sqft"}
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
                      <label className="block text-xs md:text-sm font-semibold mb-1">Mounting charges</label>
                      <input
                        type="number"
                        name="mounting"
                        value={form.mounting}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 focus:border-blue-400 focus:outline-none rounded px-3 py-2"
                        placeholder="price per sqft"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Printing Charge</label>
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
                    <div className={`flex-1 min-w-0 ${form.status !== "Hold" && form.status !== "Booked" ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        Hold/Booked By{(form.status === "Hold" || form.status === "Booked") && "*"}
                      </label>
                      <input
                        type="text"
                        name="holdBookedBy"
                        value={form.holdBookedBy}
                        onChange={handleChange}
                        required={form.status === "Hold" || form.status === "Booked"}
                        disabled={form.status !== "Hold" && form.status !== "Booked"}
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

                {/* IMAGE UPDATE SECTION */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 border-b border-gray-300 pb-2">Update Image</h3>
                  
                  {/* Current Image Display */}
                  <div className="mb-4">
                    <h4 className="text-md font-semibold mb-2 text-gray-700">Current Image:</h4>
                    {form.imageUrl ? (
                      <div className="flex justify-center">
                        <img
                          src={form.imageUrl}
                          alt={form.title}
                          className="max-w-md w-full h-auto rounded-lg border shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8 border border-dashed border-gray-300 rounded-lg">
                        No image uploaded for this advertisement
                      </div>
                    )}
                  </div>

                  {/* New Image Selection */}
                  <div className="space-y-4">
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold mb-2 text-gray-700">Upload New Image (Optional):</span>
                      <span className="text-xs text-gray-400 mb-2">Only JPG and PNG file supported. This will replace the current image.</span>

                      <div className="flex gap-4 items-center flex-wrap">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Choose New Image
                        </button>

                        {imageFile && (
                          <button
                            type="button"
                            onClick={clearImageSelection}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear Selection
                          </button>
                        )}
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                      />

                      {imageFile && (
                        <div className="mt-4 w-full">
                          <span className="text-sm font-semibold text-green-600 mb-2 block">New Image Selected:</span>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-green-600">{imageFile.name}</span>
                            {imagePreview && (
                              <div className="flex justify-center">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="max-w-xs w-full h-auto rounded-lg border shadow-sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6 pb-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`
                      ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                      } 
                      text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 
                      w-full md:w-auto min-w-[200px] text-lg shadow-lg
                      ${!loading ? 'hover:shadow-xl transform hover:-translate-y-0.5' : ''}
                    `}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating Advertisement...
                      </span>
                    ) : (
                      "💾 Update Advertisement"
                    )}
                  </button>
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

export default Page;