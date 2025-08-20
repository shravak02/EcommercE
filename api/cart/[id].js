import { connectDB } from '../../db';
import Cart from '../../models/Cart';
import { verifyTokenAndAuthorization } from '../verifyToken';

export default async function handler(req, res) {
  const { id } = req.query;
  const user = verifyTokenAndAuthorization(req, res);
  if (!user) return;

  await connectDB();

  try {
    if (req.method === 'PUT') {
      const updatedCart = await Cart.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedCart);
    } else if (req.method === 'DELETE') {
      await Cart.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Cart deleted' });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
}
