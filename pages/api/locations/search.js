import dbConnect from '../../../utils/dbConnect';
import Location from '../../../models/Location';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { bounds, minVisitors } = req.body;

    const locations = await Location.find({
      'coordinates': {
        $geoWithin: {
          $box: [
            [bounds.west, bounds.south],
            [bounds.east, bounds.north]
          ]
        }
      },
      visitors: { $gte: minVisitors }
    }).limit(50); // Limit to prevent overloading

    res.status(200).json(locations);
  } catch (error) {
    console.error('Error searching locations:', error);
    res.status(500).json({ message: 'Error searching locations' });
  }
} 