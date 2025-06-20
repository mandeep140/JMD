import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: '100%',
  height: '400px'
};

export default function MyMap({ mapLink }) {
  const [center, setCenter] = useState({
    lat: 22.5937, // Default latitude for India
    lng: 78.9629  // Default longitude for India
  });

  useEffect(() => {
    let isMounted = true;
    if (!mapLink) return;
    // Call backend to get lat/lng
    const fetchLatLng = async () => {
      try {
        const res = await fetch("/api/get-latlng", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: mapLink }),
        });
        const data = await res.json();
        if (data.lat && data.lng && isMounted) {
          setCenter({ lat: data.lat, lng: data.lng });
        }
      } catch (err) {
        console.error("Failed to fetch lat/lng:", err);
        // fallback to default
      }
    };
    fetchLatLng();
    return () => { isMounted = false; };
  }, [mapLink]);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}