// verifyToken.ts
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export const verifyToken = (handler: Function) => async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Authorization token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    return handler(req, res);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};