import { connectDB } from '../../db';
import Cart from '../../models/Cart';
import { verifyTokenAndAdmin } from '../verifyToken';

export default async function handler(req, res) {
  const user = verifyTokenAndAdmin(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await connectDB();

  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch carts' });
  }
}
