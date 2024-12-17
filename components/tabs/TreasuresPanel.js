import { useState, useEffect } from 'react';
import { useUser } from "@account-kit/react";
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, ABI } from '../../contracts/abi';

export function TreasuresPanel({ landmark }) {
  const [stakingAmount, setStakingAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [userStakeInfo, setUserStakeInfo] = useState({
    stakedAmount: 0
  });
  const user = useUser();

  const fetchStakingInfo = async () => {
    if (!user?.address || !landmark?.place_id) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      // Get user's stake info from userStakes mapping
      const stakeInfo = await contract.userStakes(user.address, landmark.place_id);
      
      setUserStakeInfo({
        stakedAmount: Number(ethers.utils.formatUnits(stakeInfo.amount, 18))
      });
    } catch (error) {
      console.error('Error fetching stake info:', error);
    }
  };

  useEffect(() => {
    fetchStakingInfo();
  }, [user?.address, landmark?.place_id]);

  const handleStake = async () => {
    if (!user?.address || !stakingAmount) return;

    setIsStaking(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const amountWei = ethers.utils.parseUnits(stakingAmount, 18);
      const tx = await contract.stake(landmark.place_id, amountWei);
      await tx.wait();

      setStakingAmount('');
      await fetchStakingInfo();
    } catch (error) {
      console.error('Staking error:', error);
      alert('Failed to stake: ' + (error.reason || error.message));
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Staking Section */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Aura Staking Pool
          </h3>
          <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
            APR: 15%
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20 mb-6">
          <div className="text-sm text-gray-400 mb-1">Your Stake</div>
          <div className="text-2xl font-bold text-purple-400">
            {userStakeInfo.stakedAmount.toFixed(2)} AURA
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Stake Amount</label>
            <div className="relative">
              <input 
                type="number"
                value={stakingAmount}
                onChange={(e) => setStakingAmount(e.target.value)}
                className="w-full bg-black/30 border border-purple-500/20 rounded-lg px-4 py-3 text-white pr-16"
                placeholder="Enter amount..."
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                AURA
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleStake}
            disabled={isStaking || !stakingAmount || !user}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStaking ? 'Staking...' : user ? 'Stake AURA' : 'Connect Wallet to Stake'}
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
          ].map((building, idx) => (
            <div key={idx} className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <span role="img" aria-label={building.name} className="text-xl">{building.icon}</span>
                </div>
                <div>
                  <div className="font-semibold text-white">{building.name}</div>
                  <div className="text-sm text-purple-400">{building.bonus}</div>
                </div>
              </div>
              <button className="w-full px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-sm text-purple-300 transition-colors">
                {building.cost} AURA
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Boost */}
      <div className="bg-white/5 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-purple-400">Referral Boost</h3>
          <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
            +20% Rewards
          </div>
        </div>
        <p className="text-gray-400 mb-4">
          Invite friends to stake at this location and earn bonus rewards
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={`https://shape.network/ref/${user?.address?.slice(0, 8)}`}
            readOnly
            className="flex-1 bg-black/30 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
          />
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
            Copy
          </button>
        </div>
      </div>

      {/* Location Achievements */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-xl font-bold text-purple-400 mb-4">Achievements</h3>
        <div className="space-y-4">
          {[
            {
              name: "Early Adopter",
              description: "Among first 100 stakers",
              progress: 45,
              reward: 500
            },
            {
              name: "Diamond Hands",
              description: "Stake for 30 days",
              progress: 80,
              reward: 1000
            },
            {
              name: "Community Leader",
              description: "Refer 5 friends",
              progress: 20,
              reward: 2000
            }
          ].map((achievement, idx) => (
            <div key={idx} className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-white">{achievement.name}</div>
                  <div className="text-sm text-gray-400">{achievement.description}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-purple-400">+{achievement.reward} AURA</div>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-purple-500 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 