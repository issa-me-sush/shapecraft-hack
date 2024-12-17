import dbConnect from '../../../utils/dbConnect';
import UserLocation from '../../../models/UserLocation';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { walletAddress, placeId } = req.body;

    // Find or create user location record
    let userLocation = await UserLocation.findOne({ walletAddress, placeId });
    
    if (!userLocation) {
      userLocation = new UserLocation({
        walletAddress,
        placeId,
        lastClaim: null
      });
    }

    // Check if can claim
    const now = new Date();
    const lastClaim = userLocation.lastClaim;
    const canClaim = !lastClaim || 
      (now - new Date(lastClaim)) >= 24 * 60 * 60 * 1000;

    if (!canClaim) {
      return res.status(400).json({ 
        message: 'Cannot claim yet',
        nextClaimTime: new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000)
      });
    }

    // Calculate aura reward (you can customize this)
    const auraEarned = 100; // Base reward

    // Update user location record
    userLocation.lastClaim = now;
    userLocation.totalAuraEarned += auraEarned;
    userLocation.totalVisits += 1;
    await userLocation.save();

    res.status(200).json({
      success: true,
      auraEarned,
      nextClaimTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      totalAuraEarned: userLocation.totalAuraEarned
    });

  } catch (error) {
    console.error('Error in claim-aura:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 