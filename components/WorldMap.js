import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import LandmarkModal from './LandmarkModal';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

// Initial notable spots
const NOTABLE_SPOTS = [
  {
    name: 'Central Park',
    coordinates: [-73.968285, 40.785091],
    placeId: 'ChIJ4zGFAZpYwokRGUGph3Mf37k',
    type: 'park'
  },
  {
    name: 'Times Square',
    coordinates: [-73.9855, 40.7580],
    placeId: 'ChIJmQJIxlVYwokRLgeuocVOGVw',
    type: 'attraction'
  },
  {
    name: 'Metropolitan Museum of Art',
    coordinates: [-73.9632, 40.7794],
    placeId: 'ChIJb8Jg9pZYwokR-qHGtvSkLzs',
    type: 'museum'
  }
  // Add more notable spots here
];

export default function WorldMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [aura, setAura] = useState(0);
  const [selectedSpot, setSelectedSpot] = useState(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-73.968285, 40.785091],
      zoom: 12
    });

    map.current.on('load', () => {
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl());

      // Add click handler for map labels
      map.current.on('click', ['poi-label', 'place-label'], async (e) => {
        if (!e.features?.length) return;

        const feature = e.features[0];
        const coordinates = feature.geometry.coordinates.slice();
        const name = feature.properties.name;

        // Prevent the click event from bubbling to other layers
        e.preventDefault();

        try {
          // Fly to location
          map.current.flyTo({
            center: coordinates,
            zoom: 15,
            pitch: 60,
            bearing: Math.random() * 180 - 90,
            duration: 1500
          });

          // Get place details using Google Places API text search
          const response = await fetch(`/api/places/search?query=${encodeURIComponent(name)}&location=${coordinates.join(',')}`);
          const placeData = await response.json();

          if (placeData) {
            setSelectedSpot({
              name,
              coordinates,
              ...placeData,
              action: 'view-landmark',
              level: 1,
              visitors: placeData.user_ratings_total || 0,
              auraReward: Math.floor((placeData.rating || 3) * 20),
              zone: determineZone(placeData.types)
            });
          }
        } catch (error) {
          console.error('Error fetching place details:', error);
        }
      });

      // Change cursor to pointer when hovering over place labels
      map.current.on('mouseenter', ['poi-label', 'place-label'], () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', ['poi-label', 'place-label'], () => {
        map.current.getCanvas().style.cursor = '';
      });
    });

    return () => map.current?.remove();
  }, []);

  // Helper function to determine zone type
  const determineZone = (types = []) => {
    if (types.includes('park')) {
      return {
        type: 'Nature Zone',
        icon: '🌳',
        bonus: 'Environmental Harmony',
        quests: ['Trail Blazer', 'Wildlife Observer']
      };
    }
    if (types.includes('museum') || types.includes('art_gallery')) {
      return {
        type: 'Cultural Zone',
        icon: '🏛️',
        bonus: 'Cultural Heritage',
        quests: ['Art Explorer', 'Culture Seeker']
      };
    }
    if (types.includes('restaurant') || types.includes('cafe')) {
      return {
        type: 'Social Zone',
        icon: '🍽️',
        bonus: 'Social Harmony',
        quests: ['Food Critic', 'Social Butterfly']
      };
    }
    // ... add more zone types

    return {
      type: 'Discovery Zone',
      icon: '🌟',
      bonus: 'Explorer\'s Luck',
      quests: ['Pioneer', 'Trailblazer']
    };
  };

  return (
    <div className="relative w-full h-screen">
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

      {/* Landmark Modal */}
      {selectedSpot?.action === 'view-landmark' && (
        <LandmarkModal 
          landmark={selectedSpot}
          onClose={() => setSelectedSpot(null)}
        />
      )}
    </div>
  );
}