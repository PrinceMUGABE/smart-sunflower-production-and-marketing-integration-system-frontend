/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Import Leaflet styles

const MapComponent = () => {
  useEffect(() => {
    // Check if the map has already been initialized to avoid re-initialization
    if (document.getElementById("map")._leaflet_id) {
      return; // If the map is already initialized, return early
    }

    // Initialize the map
    const map = L.map("map", {
      center: [1.9441, 29.8739], // Coordinates for Rwanda
      zoom: 8, // Initial zoom level
    });

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add a marker at a specific location (e.g., Kigali, Rwanda)
    L.marker([1.9441, 29.8739])
      .addTo(map)
      .bindPopup("<b>Kigali</b><br>Capital of Rwanda.")
      .openPopup();
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <div
      id="map"
      style={{
        height: "200px", // Adjust the height of the map
        width: "100%", // Make the map take the full width of its container
      }}
      className="lg:w-full w-[300%]" // Adjust the width for larger screens
    ></div>
  );
};

export default MapComponent;
