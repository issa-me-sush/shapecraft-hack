import { useAuthModal, useUser, useLogout } from "@account-kit/react";
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const { openAuthModal } = useAuthModal();
  const { logout } = useLogout();
  const user = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnterWorld = () => {
    if (user) {
      router.push('/world');
    } else {
      // Handle authentication
      openAuthModal();
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-purple-900 to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute -inset-[10px] bg-gradient-to-b from-transparent via-purple-500/10 to-transparent blur-3xl"></div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
              Entering GeoVerse...
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              GeoVerse
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Enter a world where digital and physical realities merge. Build, explore, and connect in ways never before possible.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <>
                <div className="px-6 py-2 rounded-full bg-purple-900/50 backdrop-blur-sm border border-purple-500/20">
                  <span className="text-purple-300">Connected: </span>
                  <span className="text-purple-100">{user.address.slice(0, 6)}...{user.address.slice(-4)}</span>
                </div>
                <button
                  onClick={handleEnterWorld}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                >
                  Enter World
                </button>
                <button
                  onClick={logout}
                  className="px-6 py-2 rounded-full border border-red-500/20 hover:bg-red-500/10 text-red-400 font-medium transition-all duration-200"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleEnterWorld}
                className="group relative px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
              >
                <span className="relative z-10">Connect to Enter</span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 blur transition-opacity duration-200"></div>
              </button>
            )}
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-6xl mx-auto px-4">
          {[
            {
              title: "Explore",
              description: "Discover digital landmarks and hidden treasures in the real world",
              icon: "🗺️"
            },
            {
              title: "Build",
              description: "Create and evolve your own digital structures",
              icon: "🏗️"
            },
            {
              title: "Connect",
              description: "Join forces with others to build something greater",
              icon: "🤝"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 transform hover:scale-105 transition-all duration-200 hover:border-purple-500/30"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-purple-200">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}