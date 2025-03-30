/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Driver_Map from "./map";

const RwandaMapApp = () => {
  // State to track the selected destination info
  const [selectedDestination, setSelectedDestination] = useState(null);
  
  // Your JSON data
  const geoData = {
    "provinces": [
        {
            "city": "Kigali",
            "country": "Rwanda",
            "coordinates": {
              "city_center": {
                "latitude": -1.9441,
                "longitude": 30.0619
              },
              "notable_locations": [
                {
                  "name": "Kigali International Airport",
                  "latitude": -1.9686,
                  "longitude": 30.1345
                },
                {
                  "name": "Kigali Convention Centre",
                  "latitude": -1.9557,
                  "longitude": 30.0939
                },
                {
                  "name": "Kigali Genocide Memorial",
                  "latitude": -1.9227,
                  "longitude": 30.0590
                },
                {
                  "name": "Nyamirambo District",
                  "latitude": -1.9827,
                  "longitude": 30.0434
                },
                {
                  "name": "Kimironko Market",
                  "latitude": -1.9335,
                  "longitude": 30.1139
                }
              ],
              "districts": [
                {
                  "name": "Nyarugenge",
                  "latitude": -1.9620,
                  "longitude": 30.0420,
                  "sectors": [
                    {
                      "name": "Nyarugenge",
                      "latitude": -1.9518,
                      "longitude": 30.0596
                    },
                    {
                      "name": "Muhima",
                      "latitude": -1.9430,
                      "longitude": 30.0580
                    },
                    {
                      "name": "Nyamirambo",
                      "latitude": -1.9827,
                      "longitude": 30.0434
                    },
                    {
                      "name": "Kigali",
                      "latitude": -1.9528,
                      "longitude": 30.0344
                    },
                    {
                      "name": "Kimisagara",
                      "latitude": -1.9448,
                      "longitude": 30.0376
                    },
                    {
                      "name": "Gitega",
                      "latitude": -1.9418,
                      "longitude": 30.0477
                    },
                    {
                      "name": "Mageragere",
                      "latitude": -1.9958,
                      "longitude": 30.0163
                    },
                    {
                      "name": "Nyakabanda",
                      "latitude": -1.9642,
                      "longitude": 30.0441
                    },
                    {
                      "name": "Rwezamenyo",
                      "latitude": -1.9506,
                      "longitude": 30.0510
                    },
                    {
                      "name": "Kimisagara",
                      "latitude": -1.9426,
                      "longitude": 30.0397
                    }
                  ]
                },
                {
                  "name": "Kicukiro",
                  "latitude": -1.9967,
                  "longitude": 30.0893,
                  "sectors": [
                    {
                      "name": "Kicukiro",
                      "latitude": -1.9846,
                      "longitude": 30.0903
                    },
                    {
                      "name": "Gahanga",
                      "latitude": -2.0340,
                      "longitude": 30.0817
                    },
                    {
                      "name": "Gatenga",
                      "latitude": -1.9723,
                      "longitude": 30.0982
                    },
                    {
                      "name": "Gikondo",
                      "latitude": -1.9553,
                      "longitude": 30.0781
                    },
                    {
                      "name": "Kagarama",
                      "latitude": -1.9793,
                      "longitude": 30.0908
                    },
                    {
                      "name": "Kanombe",
                      "latitude": -1.9718,
                      "longitude": 30.1378
                    },
                    {
                      "name": "Masaka",
                      "latitude": -2.0209,
                      "longitude": 30.1954
                    },
                    {
                      "name": "Niboye",
                      "latitude": -1.9808,
                      "longitude": 30.1061
                    },
                    {
                      "name": "Nyarugunga",
                      "latitude": -1.9909,
                      "longitude": 30.1342
                    }
                  ]
                },
                {
                  "name": "Gasabo",
                  "latitude": -1.9050,
                  "longitude": 30.1030,
                  "sectors": [
                    {
                      "name": "Kacyiru",
                      "latitude": -1.9368,
                      "longitude": 30.0891
                    },
                    {
                      "name": "Kimihurura",
                      "latitude": -1.9469,
                      "longitude": 30.0862
                    },
                    {
                      "name": "Kimironko",
                      "latitude": -1.9335,
                      "longitude": 30.1139
                    },
                    {
                      "name": "Remera",
                      "latitude": -1.9553,
                      "longitude": 30.1095
                    },
                    {
                      "name": "Gisozi",
                      "latitude": -1.9218,
                      "longitude": 30.0743
                    },
                    {
                      "name": "Kinyinya",
                      "latitude": -1.9081,
                      "longitude": 30.0906
                    },
                    {
                      "name": "Bumbogo",
                      "latitude": -1.8783,
                      "longitude": 30.1141
                    },
                    {
                      "name": "Gatsata",
                      "latitude": -1.9180,
                      "longitude": 30.0439
                    },
                    {
                      "name": "Gikomero",
                      "latitude": -1.8648,
                      "longitude": 30.1874
                    },
                    {
                      "name": "Jabana",
                      "latitude": -1.8977,
                      "longitude": 30.0264
                    },
                    {
                      "name": "Jali",
                      "latitude": -1.8869,
                      "longitude": 30.1387
                    },
                    {
                      "name": "Nduba",
                      "latitude": -1.8542,
                      "longitude": 30.1493
                    },
                    {
                      "name": "Ndera",
                      "latitude": -1.9097,
                      "longitude": 30.1654
                    },
                    {
                      "name": "Rusororo",
                      "latitude": -1.9324,
                      "longitude": 30.1578
                    },
                    {
                      "name": "Rutunga",
                      "latitude": -1.8496,
                      "longitude": 30.1240
                    }
                  ]
                }
              ],
              "boundaries": {
                "north": -1.8470,
                "south": -2.0800,
                "east": 30.1930,
                "west": 29.9740
              }
            }
          }
    ]
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rwanda Geographic Map</h1>
      <p className="mb-4">Explore Kigali's geographic locations and landmarks.</p>
      
      <div className="border rounded-lg p-2 bg-white">
        <Driver_Map geoData={geoData} />
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Map Legend</h2>
        <ul className="space-y-2">
          <li className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span>Kigali City Center</span>
          </li>
          <li className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            <span>Districts</span>
          </li> 
          <li className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span>Sectors</span>
          </li>
          <li className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
            <span>Notable Locations</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RwandaMapApp;