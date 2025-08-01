"use client"
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation'; // Changed: useParams instead of useSearchParams
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
  "Raipur", "Bhilai", "Durg", "Bilaspur", "Korba", "Raigarh", "Jagdalpur", "Ambikapur",
  
  // Odisha
  "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur (Brahmapur)", "Sambalpur", "Balasore", "Baripada", "Jharsuguda", "Puri", "Angul",
  
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

// Generate size string from height and width
const generateSizeString = (height, width) => {
  if (!height || !width) return "";
  const heightNum = Number(height);
  const widthNum = Number(width);
  const area = heightNum * widthNum;
  return `${height}*${width}ft (${area}sqft)`;
};

const Page = () => {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams(); // Changed: use useParams
  const mediacode = params.update; // Changed: get from params instead of searchParams

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
        
        // Parse existing size to get height and width
        const { height, width } = parseSizeString(ad.size);
        
        // Check if current city is in the list, if not set it as "Other" and put in customCity
        const cityInList = indianCities.includes(ad.city);
        
        setForm({
          ...ad,
          show: ad.show ?? true,
          date: ad.date ? ad.date.substring(0, 10) : "",
          latitude: ad.coordinates?.lat || "",
          longitude: ad.coordinates?.lng || "",
          height,
          width,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use custom city if "Other" is selected, otherwise use selected city
      const finalCity = form.city === "Other" ? form.customCity : form.city;
      
      if (form.city === "Other" && !form.customCity.trim()) {
        alert("Please enter a custom city name.");
        setLoading(false);
        return;
      }

      const updateData = {
        ...form,
        city: finalCity, // Use the final city value
        size: generateSizeString(form.height, form.width),
        coordinates: {
          lat: parseFloat(form.latitude) || 0,
          lng: parseFloat(form.longitude) || 0
        }
      };
      
      // Remove fields that shouldn't be sent to API
      delete updateData.height;
      delete updateData.width;
      delete updateData.latitude;
      delete updateData.longitude;
      delete updateData.customCity; // Remove customCity from the final form data

      const res = await fetch("/api/ads/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        alert("Ad updated successfully!");
        router.push("/admin/inventory");
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || "Failed to update ad"}`);
      }
    } catch (error) {
      console.error("Error updating ad:", error);
      alert("An error occurred while updating the ad.");
    }
    setLoading(false);
  };

  if (status === "loading" || loading) {
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
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Update Advertisement</h2>
            
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1 */}
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
                
                {/* Row 8: Show current image only, no upload */}
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
        </div>
      </AdminNav>
    );
  }

  return null;
};

export default Page;
