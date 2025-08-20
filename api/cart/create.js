import { connectDB } from '../../db';
import Cart from '../../models/Cart';
import { verifyToken } from '../verifyToken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req, res);
  if (!user) return;

  await connectDB();

  try {
    const newCart = new Cart(req.body);
    const savedCart = await newCart.save();
    res.status(200).json(savedCart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create cart' });
  }
}
