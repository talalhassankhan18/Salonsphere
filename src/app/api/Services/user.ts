import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/dbConnect'; // Import the dbConnect function
import User from '@/mongoose-models/register'; // Ensure the path to your User model is correct

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // Ensure that we establish a connection to the database before making queries

  if (req.method === 'GET') {
    const { email } = req.query; // Assuming the email is passed as a query parameter

    try {
      // Find user by email and exclude the password field from the response
      const user = await User.findOne({ email }).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user); // Return the user details
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ message: 'Server error', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' }); // Handle methods other than GET
  }
}
