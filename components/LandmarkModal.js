import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import Image from 'next/image';
import { EVOLUTION_LEVELS, ZONE_TYPES } from '../utils/placeEvolution';
import { useUser , useAuthModal } from "@account-kit/react";
import { XMarkIcon } from '@heroicons/react/24/outline';
// import { useAuthModal } from '../hooks/useAuthModal';

// Add this helper function at the top of the file, before the component
const formatTimeRemaining = (nextClaimTime) => {
  if (!nextClaimTime) {
    return 'Available Now';
  }

  const now = Date.now();
  const timeLeft = nextClaimTime - now;
  
  if (timeLeft <= 0) return 'Available Now';

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Add these new components for the Treasures and Community tabs
const TreasuresPanel = ({ landmark }) => {
  const [stakingAmount, setStakingAmount] = useState(0);
  
  return (
    <div className="space-y-6">
      {/* Staking Section */}
      <div className="bg-white/5 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-purple-400">Aura Staking Pool</h3>
          <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
            APR: 12%
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Staked</div>
            <div className="text-2xl font-bold text-white">
              {landmark.totalStaked || 0} Aura
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Your Earnings</div>
            <div className="text-2xl font-bold text-green-400">
              +{landmark.yourEarnings || 0}/day
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Stake Amount</label>
            <input 
              type="number"
              value={stakingAmount}
              onChange={(e) => setStakingAmount(e.target.value)}
              className="w-full bg-black/30 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
              placeholder="Enter amount to stake..."
            />
          </div>
          <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
            Stake Aura
          </button>
        </div>
      </div>

      {/* World Building Options */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-xl font-bold text-purple-400 mb-4">Build & Enhance</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              name: "Digital Garden",
              cost: 1000,
              bonus: "+5% Aura Generation",
              icon: "🌸"
            },
            {
              name: "Community Hub",
              cost: 2000,
              bonus: "+10% Visitor Rewards",
              icon: "🏛️"
            },
            {
              name: "Quest Beacon",
              cost: 1500,
              bonus: "Unlock Special Quests",
              icon: "🎯"
            },
            {
              name: "Aura Amplifier",
              cost: 3000,
              bonus: "+15% Staking Rewards",
              icon: "⚡"
            }
          ].map((building) => (
            <div key={building.name} className="bg-black/30 rounded-lg p-4 hover:bg-black/50 transition-colors cursor-pointer group">
              <div className="text-3xl mb-2">{building.icon}</div>
              <h4 className="font-semibold text-white mb-1">{building.name}</h4>
              <div className="text-sm text-gray-400 mb-2">{building.bonus}</div>
              <div className="text-sm text-purple-400">
                Cost: {building.cost} Aura
              </div>
              <button className="w-full mt-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 rounded-md transition-colors text-sm">
                Build
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Community Rewards */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-xl font-bold text-purple-400 mb-4">Community Rewards</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-black/30 rounded-lg">
            <div>
              <div className="font-semibold text-white">Visitor Referral</div>
              <div className="text-sm text-gray-400">Earn 50 Aura per new visitor</div>
            </div>
            <button className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600 rounded-lg transition-colors">
              Share Link
            </button>
          </div>
          <div className="flex justify-between items-center p-4 bg-black/30 rounded-lg">
            <div>
              <div className="font-semibold text-white">Staker Bonus</div>
              <div className="text-sm text-gray-400">+5% APR for every 10 new stakers</div>
            </div>
            <div className="text-sm text-purple-400">
              Progress: 3/10
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function EvolutionPanel({ evolution, zone }) {
  return (
    <div className="space-y-6">
      <div className="bg-black/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: EVOLUTION_LEVELS[evolution.level].color }}>
            {evolution.level}
          </h3>
          <div className="text-sm text-gray-400">
            {evolution.nextLevel ? `Next: ${evolution.nextLevel}` : 'Maximum Level'}
          </div>
        </div>
        
        {evolution.nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Evolution Progress</span>
              <span>{evolution.progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${evolution.progress}%`,
                  background: EVOLUTION_LEVELS[evolution.level].color 
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Active Benefits</h4>
          <ul className="space-y-1 text-sm">
            {EVOLUTION_LEVELS[evolution.level].benefits.map(benefit => (
              <li key={benefit} className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Zone Information */}
      <div className="bg-black/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{zone.icon}</span>
          <div>
            <h3 className="font-bold">{zone.type}</h3>
            <p className="text-sm text-gray-400">{zone.bonus}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {zone.quests.map(quest => (
            <div key={quest} className="bg-black/30 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span>{quest}</span>
                <button className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600 rounded-full text-sm transition-colors">
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandmarkModal({ landmark, onClose, onAuraClaimed }) {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  console.log("Landmark data received:", landmark); // Debug log
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [claimStatus, setClaimStatus] = useState({
    canClaim: false,
    nextClaimTime: null
  });

  const photos = landmark.photos || [];
  const currentPhoto = photos[currentPhotoIndex]?.url;

  // Fetch user stats for this location
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.address || !landmark.place_id) return;

      try {
        const response = await fetch(`/api/users/location-stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: user.address,
            placeId: landmark.place_id
          })
        });

        const data = await response.json();
        console.log('User stats:', data); // Debug log
        setUserStats(data);
        
        // Simplified claim status logic
        const lastClaim = data.lastClaim ? new Date(data.lastClaim) : null;
        const now = new Date();
        
        if (!lastClaim) {
          // Never claimed before
          setClaimStatus({
            canClaim: true,
            nextClaimTime: null
          });
        } else {
          const timeSinceLastClaim = now - lastClaim;
          const canClaim = timeSinceLastClaim >= 24 * 60 * 60 * 1000;
          
          setClaimStatus({
            canClaim,
            nextClaimTime: canClaim ? null : lastClaim.getTime() + (24 * 60 * 60 * 1000)
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchUserStats();
  }, [user, landmark.place_id]);

  // Handle aura claim
  const handleClaim = async () => {
    if (!user?.address || !landmark.place_id) {
      console.log("User or landmark data is missing:", { user, landmark });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/locations/claim-aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: user.address,
          placeId: landmark.place_id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to claim');
      }

      const data = await response.json();
      console.log('Claim response:', data); // Debug log
      
      if (data.success) {
        // Update local state
        setUserStats(prev => ({
          ...prev,
          totalAuraEarned: data.totalAuraEarned,
          lastClaim: new Date()
        }));

        setClaimStatus({
          canClaim: false,
          nextClaimTime: data.nextClaimTime
        });

        // Notify parent component
        onAuraClaimed(data.auraEarned);
      }
    } catch (error) {
      console.error('Error claiming aura:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-black/95 backdrop-blur-md rounded-2xl max-w-2xl w-full mx-auto overflow-hidden">
      {/* Modal Header */}
      <div className="relative h-48 sm:h-64">
        {currentPhoto ? (
          <Image
            src={currentPhoto}
            alt={landmark.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
        )}
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{landmark.name}</h2>
          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1 rounded-full bg-purple-500/20 backdrop-blur-sm text-purple-200 text-sm">
              Level {landmark.level || 1}
            </div>
            <div className="px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-sm text-blue-200 text-sm">
              {landmark.visitors || 0} Visitors
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Make scrollable on mobile */}
      <Tab.Group onChange={setSelectedTab}>
        <Tab.List className="flex overflow-x-auto border-b border-white/10 hide-scrollbar">
          {[
            { name: 'Overview', icon: '🌟' },
            { name: 'Quests', icon: '⚔️' },
            { name: 'Treasures', icon: '����' },
            { name: 'Community', icon: '👥' },
            { name: 'Events', icon: '����' }
          ].map((tab, idx) => (
            <Tab
              key={tab.name}
              className={({ selected }) => `
                flex items-center gap-2 px-6 py-4 focus:outline-none transition-colors
                ${selected 
                  ? 'text-purple-400 border-b-2 border-purple-500 bg-white/5' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'}
              `}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="p-4 sm:p-6 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
          {/* Overview Panel */}
          <Tab.Panel>
            <div className="p-6 space-y-6">
              {/* Location Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Unique Visitors</div>
                  <div className="text-2xl font-bold text-white">
                    {landmark.uniqueVisitors?.length || 0}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Total Aura Farmed</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {landmark.totalAura || 0}
                  </div>
                </div>
              </div>

              {/* Personal Stats */}
              {user && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-purple-400 mb-3">Your Activity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Your Visits</div>
                      <div className="text-xl font-bold text-white">
                        {userStats?.totalVisits || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Aura Earned</div>
                      <div className="text-xl font-bold text-purple-400">
                        {userStats?.totalAuraEarned || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Claim Section */}
              {user ? (
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-purple-400">Daily Aura Claim</h3>
                    <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
                      {landmark.auraReward} per day
                    </div>
                  </div>
                  
                  {(claimStatus.canClaim || !claimStatus.nextClaimTime) ? (
                    <button
                      onClick={handleClaim}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoading ? 'Claiming...' : 'Claim Daily Aura'}
                    </button>
                  ) : (
                    <div className="text-center text-gray-400">
                      Next claim available in {formatTimeRemaining(claimStatus.nextClaimTime)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl p-6 text-center">
                  <p className="text-gray-400 mb-4">Connect your wallet to start earning Aura</p>
                  <button
                    onClick={() => openAuthModal()}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-all duration-200"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </Tab.Panel>

          {/* Quests Panel */}
          <Tab.Panel>
            <div className="space-y-4">
              {[
                {
                  title: "Digital Archaeologist",
                  description: "Find 3 hidden artifacts in Central Park",
                  reward: 500,
                  difficulty: "Medium",
                  participants: 24,
                  progress: 1,
                  total: 3
                },
                // Add more quests
              ].map((quest, idx) => (
                <div key={idx} className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-purple-400">
                      {quest.title}
                    </h3>
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
                      {quest.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-4">{quest.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-purple-400">
                          {quest.progress}/{quest.total}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-purple-500 rounded-full h-2 transition-all duration-500"
                          style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                      Start Quest
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Tab.Panel>

          {/* Treasures Panel */}
          <Tab.Panel>
            <TreasuresPanel landmark={landmark} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 