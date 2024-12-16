import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import LandmarkModal from './LandmarkModal';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

export default function WorldMap({ selectedLocation, onLocationSelect, userAddress }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [aura, setAura] = useState(0);
  const [selectedSpot, setSelectedSpot] = useState(null);

  // Handle marker clicks
  const handleSpotClick = (isLandmark) => {
    if (isLandmark) {
      setSelectedSpot({
        name: 'Central Park Nexus',
        description: 'A vast digital garden where nature meets technology',
        auraReward: 150,
        action: 'view-landmark',
        bannerImage: 'https://images.unsplash.com/photo-1576820250567-95c1e96880d6',  // Static Central Park image
        level: 3,
        visitors: 1234,
        zone: {
          type: 'Nature Zone',
          icon: '🌳',
          bonus: 'Environmental Harmony',
          quests: ['Trail Blazer', 'Wildlife Observer']
        }
      });
    } else {
      setSelectedSpot({
        name: 'Times Square Beacon',
        description: 'A nexus of digital energy',
        auraReward: 100,
        action: 'interact'
      });
    }
  };

  // Helper function to create marker elements
  function createMarkerElement(isLandmark) {
    const wrapper = document.createElement('div');
    wrapper.className = 'marker-wrapper';
    wrapper.style.position = 'relative';

    const el = document.createElement('div');
    Object.assign(el.style, {
      width: isLandmark ? '40px' : '30px',
      height: isLandmark ? '40px' : '30px',
      borderRadius: '50%',
      background: isLandmark
        ? 'linear-gradient(45deg, #FF1493, #FFD700)'
        : 'linear-gradient(45deg, #3B82F6, #2DD4BF)',
      border: '3px solid rgba(255, 255, 255, 0.8)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
      position: 'absolute',
      left: '50%',
      top: '50%',
      marginLeft: isLandmark ? '-20px' : '-15px',
      marginTop: isLandmark ? '-20px' : '-15px'
    });

    // Add hover effect
    el.onmouseenter = () => {
      el.style.transform = 'scale(1.2)';
    };
    el.onmouseleave = () => {
      el.style.transform = 'scale(1)';
    };

    // Add click handler
    el.addEventListener('click', () => {
      handleSpotClick(isLandmark);
    });

    wrapper.appendChild(el);
    return wrapper;
  }

  // Initialize map
  useEffect(() => {
    console.log("Initializing map..."); // Debug log
    if (!mapContainer.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Changed to streets style for better visibility
        center: [-73.968285, 40.785091],
        zoom: 12
      });

      map.current.on('load', () => {
        console.log("Map loaded"); // Debug log
        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl());

        // Add Central Park marker
        const centralPark = new mapboxgl.Marker({
          element: createMarkerElement(true)
        })
          .setLngLat([-73.968285, 40.785091])
          .addTo(map.current);

        // Add Times Square marker
        const timesSquare = new mapboxgl.Marker({
          element: createMarkerElement(false)
        })
          .setLngLat([-73.9855, 40.7580])
          .addTo(map.current);
      });
    } catch (error) {
      console.error("Map initialization error:", error); // Debug log
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      {/* Map Container - Fixed styles */}
      <div 
        ref={mapContainer} 
        style={{ 
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Aura Display */}
      <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full text-white shadow-lg z-10">
        <span className="font-mono">✨ {aura} Aura</span>
      </div>

      {/* Rich Landmark Modal */}
      {selectedSpot?.action === 'view-landmark' && (
        <LandmarkModal 
          landmark={selectedSpot}
          onClose={() => setSelectedSpot(null)}
        />
      )}

      {/* Simple Interaction Modal */}
      {selectedSpot?.action === 'interact' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-black/80 border border-fuchsia-500/30 p-6 rounded-2xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-fuchsia-400 mb-4">
              {selectedSpot.name}
            </h3>
            <p className="text-gray-300 mb-4">
              {selectedSpot.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-fuchsia-400">
                +{selectedSpot.auraReward} Aura
              </span>
              <button 
                onClick={() => {
                  setAura(prev => prev + selectedSpot.auraReward);
                  setSelectedSpot(null);
                }}
                className="px-6 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full hover:scale-105 transition-all duration-200"
              >
                Collect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}