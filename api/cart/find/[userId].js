import { connectDB } from '../../../db';
import Cart from '../../../models/Cart';
import { verifyTokenAndAuthorization } from '../../verifyToken';

export default async function handler(req, res) {
  const { userId } = req.query;
  const user = verifyTokenAndAuthorization(req, res);
  if (!user) return;

  await connectDB();

  try {
    const cart = await Cart.findOne({ userId });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get cart' });
  }
}
