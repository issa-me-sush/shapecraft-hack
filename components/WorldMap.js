import { useEffect, useRef, useState, useCallback } from 'react';
import { useUser, useAuthModal, useLogout } from "@account-kit/react";
import { useRouter } from 'next/router';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import LandmarkModal from './LandmarkModal';

// Set the token before any map operations
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

console.log('Mapbox Token:', process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? 'Token exists' : 'No token found');

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

// Add these constants at the top
const BOUNDARY_BUFFER = 0.5; // 50% buffer beyond visible bounds
const MIN_VISITORS_THRESHOLD = 10;
const FETCH_THRESHOLD = 0.75; // Refetch when user reaches 75% of buffer

export default function WorldMap() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const { logout } = useLogout();
  const router = useRouter();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [aura, setAura] = useState(0);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapBounds, setMapBounds] = useState(null);
  const [loadedLocations, setLoadedLocations] = useState(new Set());

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      console.log('Initializing map with token:', mapboxgl.accessToken);

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-73.968285, 40.785091],
        zoom: 12,
        maxZoom: 20,
        minZoom: 3
      });

      map.current.on('style.load', () => {
        console.log('Map style loaded successfully');
      });

      map.current.on('style.error', (e) => {
        console.error('Map style error:', e);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        
        map.current.resize();
        
        map.current.addControl(new mapboxgl.NavigationControl());

        map.current.on('click', ['poi-label', 'place-label'], async (e) => {
          if (!e.features?.length) return;

          const feature = e.features[0];
          const coordinates = feature.geometry.coordinates.slice();
          const name = feature.properties.name;

          e.preventDefault();

          try {
            map.current.flyTo({
              center: coordinates,
              zoom: 15,
              pitch: 60,
              bearing: Math.random() * 180 - 90,
              duration: 1500
            });

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

        map.current.on('mouseenter', ['poi-label', 'place-label'], () => {
          map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', ['poi-label', 'place-label'], () => {
          map.current.getCanvas().style.cursor = '';
        });
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

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

    return {
      type: 'Discovery Zone',
      icon: '🌟',
      bonus: 'Explorer\'s Luck',
      quests: ['Pioneer', 'Trailblazer']
    };
  };

  const checkBoundaries = useCallback(() => {
    if (!map.current) return;

    const bounds = map.current.getBounds();
    const center = map.current.getCenter();

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const latBuffer = (ne.lat - sw.lat) * BOUNDARY_BUFFER;
    const lngBuffer = (ne.lng - sw.lng) * BOUNDARY_BUFFER;

    const bufferBounds = {
      north: ne.lat + latBuffer,
      south: sw.lat - latBuffer,
      east: ne.lng + lngBuffer,
      west: sw.lng - lngBuffer
    };

    const currentBounds = map.current.getBounds();
    const needsFetch = !mapBounds || 
      currentBounds.getNorth() > mapBounds.south + (mapBounds.north - mapBounds.south) * FETCH_THRESHOLD ||
      currentBounds.getSouth() < mapBounds.north - (mapBounds.north - mapBounds.south) * FETCH_THRESHOLD ||
      currentBounds.getEast() > mapBounds.west + (mapBounds.east - mapBounds.west) * FETCH_THRESHOLD ||
      currentBounds.getWest() < mapBounds.east - (mapBounds.east - mapBounds.west) * FETCH_THRESHOLD;

    if (needsFetch) {
      loadLocationData(bufferBounds);
      setMapBounds(bufferBounds);
    }
  }, [mapBounds]);

  const loadLocationData = async (bounds) => {
    try {
      const response = await fetch('/api/locations/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bounds,
          minVisitors: MIN_VISITORS_THRESHOLD
        })
      });

      const locations = await response.json();
      
      const newLocations = locations.filter(loc => !loadedLocations.has(loc.placeId));
      
      const updatedLocations = new Set(loadedLocations);
      newLocations.forEach(loc => updatedLocations.add(loc.placeId));
      setLoadedLocations(updatedLocations);

      newLocations.forEach(location => {
        createMarker({
          ...location,
          coordinates: location.coordinates.coordinates
        });
      });
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  useEffect(() => {
    if (!map.current) return;

    map.current.on('moveend', checkBoundaries);
    
    return () => {
      map.current?.off('moveend', checkBoundaries);
    };
  }, [checkBoundaries]);

  const handleConnect = () => {
    if (!user) {
      openAuthModal();
    }
  };

  const handleDisconnect = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="relative w-full h-[100dvh] bg-gray-100">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }}
      />
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
              Loading...
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute top-4 right-4 left-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 z-10">
        {user ? (
          <>
            <div className="order-2 sm:order-1 flex-1 px-4 py-2 rounded-full bg-purple-900/50 backdrop-blur-sm border border-purple-500/20">
              <div className="flex items-center gap-2">
                {user.profileImage && (
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border border-purple-500/50"
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm text-gray-300">Explorer</span>
                  <span className="text-xs text-gray-400">
                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="order-1 sm:order-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">✨</span>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-200">Total Aura</span>
                  <span className="font-mono font-bold">{aura}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="order-3 px-4 py-2 rounded-full border border-red-500/20 hover:bg-red-500/10 text-red-400 font-medium transition-all duration-200 whitespace-nowrap"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            className="w-full sm:w-auto group relative px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <span className="relative z-10">Connect Wallet</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 blur transition-opacity duration-200"></div>
          </button>
        )}
      </div>

      {selectedSpot?.action === 'view-landmark' && (
        <div className="fixed inset-0 z-50 p-4 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center">
            <LandmarkModal 
              landmark={selectedSpot}
              onClose={() => setSelectedSpot(null)}
              onAuraClaimed={(amount) => setAura(prev => prev + amount)}
            />
          </div>
        </div>
      )}
    </div>
  );
}