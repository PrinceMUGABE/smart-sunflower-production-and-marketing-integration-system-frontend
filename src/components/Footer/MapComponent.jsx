/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapDebugComponent = () => {
  const [mapInstance, setMapInstance] = useState(null);
  const mapContainerRef = useRef(null);
  const kigaliCenter = [-1.9441, 30.0619];

  const resetMap = () => {
    if (mapInstance) {
      // Remove the existing map
      mapInstance.remove();
      
      // Create a new map
      const newMap = L.map(mapContainerRef.current).setView(kigaliCenter, 12);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(newMap);

      setMapInstance(newMap);
    }
  };

  useEffect(() => {
    // Initial map creation
    const map = L.map(mapContainerRef.current).setView(kigaliCenter, 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    setMapInstance(map);

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  return (
    <div>
      <button 
        onClick={resetMap} 
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Reset Map
      </button>
      
      <div 
        ref={mapContainerRef} 
        style={{ height: '500px', width: '100%' }} 
      />

    </div>
  );
};

export default MapDebugComponent;