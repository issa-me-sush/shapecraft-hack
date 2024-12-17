import dbConnect from '../../../utils/dbConnect';
import Location from '../../../models/Location';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { walletAddress, placeId } = req.body;

    // Find or create user
    let user = await User.findOne({ walletAddress });
    if (!user) {
      user = await User.create({ walletAddress });
    }

    // Find location
    const location = await Location.findOne({ placeId });
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Check if user has visited before
    let visitorRecord = location.uniqueVisitors.find(v => v.walletAddress === walletAddress);
    const isFirstVisit = !visitorRecord;

    if (isFirstVisit) {
      // First time visitor
      visitorRecord = {
        walletAddress,
        firstVisit: new Date(),
        lastVisit: new Date(),
        totalAuraEarned: 0
      };
      location.uniqueVisitors.push(visitorRecord);
    } else {
      // Check cooldown
      const hoursSinceLastClaim = (Date.now() - visitorRecord.lastVisit) / (1000 * 60 * 60);
      if (hoursSinceLastClaim < 24) {
        return res.status(400).json({
          message: 'Too soon to claim again',
          nextClaimTime: new Date(visitorRecord.lastVisit.getTime() + (24 * 60 * 60 * 1000))
        });
      }
    }

    // Calculate and update aura
    const auraEarned = calculateAuraReward(location, isFirstVisit);
    visitorRecord.lastVisit = new Date();
    visitorRecord.totalAuraEarned += auraEarned;
    location.totalAura += auraEarned;

    // Update user stats
    const userLocationStats = user.discoveredLocations.find(
      loc => loc.locationId.toString() === location._id.toString()
    );

    if (!userLocationStats) {
      user.discoveredLocations.push({
        locationId: location._id,
        firstVisit: new Date(),
        totalVisits: 1,
        auraEarned,
        lastClaim: new Date()
      });
      user.stats.totalLocationsVisited += 1;
    } else {
      userLocationStats.totalVisits += 1;
      userLocationStats.auraEarned += auraEarned;
      userLocationStats.lastClaim = new Date();
    }

    user.totalAura += auraEarned;
    user.stats.totalAuraEarned += auraEarned;

    // Save all updates
    await Promise.all([location.save(), user.save()]);

    res.status(200).json({
      auraEarned,
      totalVisits: userLocationStats?.totalVisits || 1,
      nextClaimTime: new Date(Date.now() + (24 * 60 * 60 * 1000)),
      locationStats: {
        uniqueVisitors: location.uniqueVisitors.length,
        totalAura: location.totalAura
      }
    });
  } catch (error) {
    console.error('Error claiming aura:', error);
    res.status(500).json({ message: 'Error claiming aura' });
  }
}

function calculateAuraReward(location, isFirstVisit) {
  let baseReward = 10; // Base reward for any location
  
  // Add bonuses based on location tier
  switch(location.tier) {
    case 'LEGENDARY': baseReward *= 4; break;
    case 'POPULAR': baseReward *= 2; break;
    case 'EMERGING': baseReward *= 1.5; break;
    default: break;
  }

  // First visit bonus
  if (isFirstVisit) {
    baseReward *= 2;
  }

  return Math.floor(baseReward);
} 