/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const VehiclesDisplay = () => {
  const [vehicles, setVehicles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Fetch vehicles on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/vehicle/list_vehicles/');
        setVehicles(response.data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    fetchVehicles();
  }, []);

  // Automatic navigation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= vehicles.length - 2 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [vehicles.length]);

  const handleOrderClick = (vehicleId) => {
    navigate('/login', { state: { vehicleId } });
  };

  // Calculate total number of possible starting positions
  const totalPositions = Math.max(0, vehicles.length - 1);

  // Render two vehicles at a time
  const displayVehicles = vehicles.length > 1 
    ? vehicles.slice(currentIndex, currentIndex + 2)
    : vehicles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl relative">
        {/* Vehicles Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <AnimatePresence mode="wait">
            {displayVehicles.map((vehicle, index) => (
              <motion.div 
                key={vehicle.id}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white shadow-2xl rounded-2xl overflow-hidden transform transition-all hover:scale-105"
              >
                {/* Vehicle Image */}
                <div className="h-64 w-full relative">
                  {vehicle.image_base64 ? (
                    <img 
                      src={vehicle.image_base64} 
                      alt={`Vehicle ${vehicle.id}`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      No Image Available
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2">
                    {vehicle.vehicle_model || 'Unnamed Vehicle'}
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="p-6">
                  <div className="text-gray-700 mb-4 space-y-2">
                    <p className="flex justify-between">
                      <span className="font-semibold">Vehicle Type:</span>
                      <span>{vehicle.type}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">Weight Capacity:</span>
                      <span>{vehicle.total_weight_to_carry} kg</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">Relocation Size:</span>
                      <span>{vehicle.relocation_size}</span>
                    </p>
                  </div>

                  {/* Order Button */}
                  <button 
                    onClick={() => handleOrderClick(vehicle.id)}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-[1.02] active:scale-95 shadow-md"
                  >
                    Make order
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dot Pagination */}
        {vehicles.length > 2 && (
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: totalPositions + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  ${currentIndex === index 
                    ? 'bg-red-600 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'}
                `}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclesDisplay;