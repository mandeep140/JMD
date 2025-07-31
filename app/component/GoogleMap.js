import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: '100%',
  height: '400px'
};

export default function MyMap({ coordinates }) {
  const [center, setCenter] = useState({
    lat: 22.5937, // Default latitude for India
    lng: 78.9629  // Default longitude for India
  });

  useEffect(() => {
    if (coordinates && coordinates.lat && coordinates.lng) {
      setCenter({ 
        lat: coordinates.lat, 
        lng: coordinates.lng 
      });
    }
  }, [coordinates]);

  // Don't render map if coordinates are not available
  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    return (
      <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center text-gray-500">
        <p>Map coordinates not available</p>
      </div>
    );
  }

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