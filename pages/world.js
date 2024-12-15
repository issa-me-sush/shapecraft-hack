import { useUser } from "@account-kit/react";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import map component dynamically to avoid SSR issues
const WorldMap = dynamic(() => import('../components/WorldMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
        Loading World...
      </div>
    </div>
  )
});

export default function WorldPage() {
  const user = useUser();
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Protect the route
  useEffect(() => {
    if (!user) {
      router.push('/?open=true');
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            GeoVerse
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-purple-900/50 text-sm border border-purple-500/20">
              <span className="text-purple-300">Connected: </span>
              <span className="text-purple-100">{user?.address.slice(0, 6)}...{user?.address.slice(-4)}</span>
            </div>
            <button 
              onClick={() => setSelectedLocation(null)}
              className="px-4 py-1.5 rounded-full bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
            >
              World View
            </button>
          </div>
        </div>
      </nav>

      {/* Main Map Interface */}
      <main className="h-screen pt-14">
        <WorldMap 
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
          userAddress={user?.address}
        />
      </main>

      {/* Location Info Panel */}
      {selectedLocation && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md border-t border-white/10 p-4 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-2">
              {selectedLocation.name || 'Unclaimed Territory'}
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => {/* Handle claim/interact */}}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transform hover:scale-105 transition-all duration-200"
              >
                {selectedLocation.owner ? 'View Details' : 'Claim Territory'}
              </button>
              <button
                onClick={() => setSelectedLocation(null)}
                className="px-6 py-2 rounded-full border border-red-500/20 hover:bg-red-500/10 text-red-400 font-medium transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}