import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

export default function WorldMap({ selectedLocation, onLocationSelect, userAddress }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [locations, setLocations] = useState([]);
  const [memories, setMemories] = useState([]);
  const [shapePulse, setShapePulse] = useState(0);
  const [activeQuests, setActiveQuests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [aura, setAura] = useState(0);

  // Define spot types with aura theme
  const SPOT_TYPES = {
    NEXUS: {
      color: '#00ff94',
      auraColor: 'rgba(0, 255, 148, 0.4)',
      icon: '🔮'
    },
    PORTAL: {
      color: '#ff00f7',
      auraColor: 'rgba(255, 0, 247, 0.4)',
      icon: '⚡'
    },
    BEACON: {
      color: '#ffcc00',
      auraColor: 'rgba(255, 204, 0, 0.4)',
      icon: '✨'
    }
  };

  // Sample quests/events
  const WORLD_EVENTS = [
    {
      id: 'q1',
      type: 'SHAPEHUNT',
      title: 'Shape Seeker',
      description: 'Discover 3 hidden shapes in famous landmarks',
      reward: 500,
      requirements: {
        spots: ['spot1', 'spot2', 'spot3'],
        type: 'exploration'
      }
    },
    {
      id: 'q2',
      type: 'COMMUNITY',
      title: 'Shape Shifters',
      description: 'Join other shapers to create a collective masterpiece',
      reward: 750,
      requirements: {
        participants: 5,
        location: 'portal1',
        type: 'social'
      }
    }
  ];

  // Digital hotspots
  const HOTSPOTS = [
    {
      id: 1,
      coordinates: [-74.5, 40],
      type: 'NEXUS',
      name: 'Aura Garden',
      auraReward: 100,
      collectible: true,
      description: 'A place where digital auras blend and grow'
    },
    {
      id: 2,
      coordinates: [-74.45, 40.05],
      type: 'PORTAL',
      name: 'Aura Portal',
      auraReward: 150,
      collectible: true,
      activeEvent: {
        type: 'GATHERING',
        name: 'Aura Fusion',
        endTime: Date.now() + 3600000
      }
    }
  ];

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40],
      zoom: 9,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true
      })
    );

    // Add user location control with custom styling
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: true
      })
    );

    // Add some sample locations
    setLocations([
      {
        id: 1,
        coordinates: [-74.5, 40],
        type: 'unclaimed',
        name: 'Unclaimed Territory'
      },
      {
        id: 2,
        coordinates: [-74.45, 40.05],
        type: 'claimed',
        owner: '0x123...',
        name: 'Crystal Garden'
      },
      {
        id: 3,
        coordinates: [-74.55, 39.95],
        type: 'unclaimed',
        name: 'Mystic Valley'
      }
    ]);

    // Add 3D building layer for more immersive experience
    map.current.on('style.load', () => {
      // Add 3D building layer
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
      ).id;
      
      map.current.addLayer(
        {
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );
    });
  }, []);

  // Add markers for locations
  useEffect(() => {
    if (!map.current || !locations.length) return;

    // Clear existing markers
    const existingMarkers = document.getElementsByClassName('location-marker');
    while(existingMarkers[0]) {
      existingMarkers[0].parentNode.removeChild(existingMarkers[0]);
    }

    locations.forEach(location => {
      const el = document.createElement('div');
      el.className = 'location-marker';
      
      // Create a more visible marker
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.background = location.owner 
        ? 'linear-gradient(45deg, #8B5CF6, #6366F1)' 
        : 'linear-gradient(45deg, #3B82F6, #2DD4BF)';
      el.style.cursor = 'pointer';
      el.style.border = '3px solid rgba(255, 255, 255, 0.8)';
      el.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.3)';
      el.style.transition = 'transform 0.2s ease';

      // Add hover effect
      el.onmouseenter = () => {
        el.style.transform = 'scale(1.2)';
      };
      el.onmouseleave = () => {
        el.style.transform = 'scale(1)';
      };

      new mapboxgl.Marker(el)
        .setLngLat(location.coordinates)
        .addTo(map.current);

      el.addEventListener('click', () => {
        onLocationSelect(location);
        
        // Fly to location
        map.current.flyTo({
          center: location.coordinates,
          zoom: 15,
          pitch: 60,
          bearing: Math.random() * 180 - 90, // Random bearing for dramatic effect
          duration: 2000,
          essential: true
        });
      });
    });
  }, [locations, onLocationSelect]);

  // Update marker creation
  useEffect(() => {
    if (!map.current || !locations.length) return;

    locations.forEach(location => {
      const el = document.createElement('div');
      el.className = 'memory-spot';
      
      // Style based on type
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.background = `radial-gradient(circle at center, 
        ${location.collectible ? '#FFD700' : '#A0A0A0'}80 0%, 
        transparent 70%)`;
      el.style.animation = location.collectible ? 'pulse 2s infinite' : 'none';

      new mapboxgl.Marker(el)
        .setLngLat(location.coordinates)
        .addTo(map.current);

      el.addEventListener('click', () => {
        handleSpotClick(location);
      });
    });
  }, [locations]);

  const handleSpotClick = async (spot) => {
    if (!spot.collectible) return;

    const modalContent = {
      NEXUS: {
        title: `Explore ${spot.name}`,
        description: 'Leave your aura imprint',
        reward: `+${spot.auraReward} Aura`
      },
      PORTAL: {
        title: `Enter ${spot.name}`,
        description: spot.activeEvent 
          ? `Join the ${spot.activeEvent.name}!`
          : 'Create something amazing',
        reward: `+${spot.auraReward} Aura`
      },
      BEACON: {
        title: 'New Quest',
        description: spot.questDetails?.description,
        reward: `Quest Reward: ${spot.questDetails?.reward} Aura`
      }
    };

    setSelectedLocation({
      ...spot,
      action: 'interact',
      ui: modalContent[spot.type]
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Aura Display */}
      <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full text-white shadow-lg backdrop-blur-sm">
        <span className="font-mono">✨ {aura} Aura</span>
      </div>

      {/* Active Quest Display */}
      {activeQuests.length > 0 && (
        <div className="absolute top-20 right-4 w-64 bg-black/40 backdrop-blur-md rounded-lg p-4">
          <h3 className="text-fuchsia-400 font-mono mb-2">ACTIVE QUEST</h3>
          <div className="text-sm text-white">
            {activeQuests[0].title}
            <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
              <div 
                className="bg-fuchsia-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${activeQuests[0].progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Interaction Modal */}
      {selectedLocation?.action === 'interact' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-black/80 border border-fuchsia-500/30 p-6 rounded-2xl max-w-md w-full mx-4 shadow-lg shadow-fuchsia-500/20">
            <h3 className="text-2xl font-bold text-fuchsia-400 font-mono mb-4">
              {selectedLocation.ui.title}
            </h3>
            <p className="text-gray-300 mb-4">
              {selectedLocation.ui.description}
            </p>
            
            <textarea 
              className="w-full bg-black/60 border border-fuchsia-500/20 rounded-xl p-4 mb-4 text-fuchsia-100"
              placeholder="Share your creation..."
            />

            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-fuchsia-400">
                {selectedLocation.ui.reward}
              </span>
              <button 
                onClick={() => handleInteraction(selectedLocation)}
                className="px-6 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full hover:scale-105 transition-all duration-200"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}