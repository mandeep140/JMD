"use client";
import { useEffect } from "react";

export default function TrackCity() {
  useEffect(() => {
    const alreadyTracked = sessionStorage.getItem("cityTracked");

    if (alreadyTracked) return; // Prevent duplicate

    const fetchAndSend = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        const city = data?.city;
        if (!city) return;

        // Send to server
        await fetch("/api/log-visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city }),
        });

        // Mark as tracked
        sessionStorage.setItem("cityTracked", "true");
      } catch (err) {
        console.error("City tracking failed:", err);
      }
    };

    fetchAndSend();
  }, []);

  return null;
}
