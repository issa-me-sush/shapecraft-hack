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

    const user = await User.findOne({ walletAddress });
    const location = await Location.findOne({ placeId });

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    if (!user) {
      return res.status(200).json({
        totalVisits: 0,
        totalAuraEarned: 0,
        lastClaim: null
      });
    }

    const locationStats = user.discoveredLocations.find(
      loc => loc.locationId.toString() === location._id.toString()
    );

    if (!locationStats) {
      return res.status(200).json({
        totalVisits: 0,
        totalAuraEarned: 0,
        lastClaim: null
      });
    }

    res.status(200).json({
      totalVisits: locationStats.totalVisits,
      totalAuraEarned: locationStats.auraEarned,
      lastClaim: locationStats.lastClaim
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
} 