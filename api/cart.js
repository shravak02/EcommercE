import { connectDB } from './db';
import Cart from '../models/Cart';
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from './verifyToken';

export default async function handler(req, res) {
  const { method, query, body } = req;
  await connectDB();

  const cartId = query.id;
  const userId = query.userId;

  try {
    // 🔄 CREATE CART
    if (method === 'POST') {
      const { user, error, status } = verifyToken(req);
      if (error) return res.status(status).json({ error });

      const newCart = new Cart(body);
      const savedCart = await newCart.save();
      return res.status(200).json(savedCart);
    }

    // 🆙 UPDATE CART by :id
    if (method === 'PUT') {
      const { user, error, status } = verifyTokenAndAuthorization(req, cartId);
      if (error) return res.status(status).json({ error });

      const updatedCart = await Cart.findByIdAndUpdate(
        cartId,
        { $set: body },
        { new: true }
      );
      return res.status(200).json(updatedCart);
    }

    // ❌ DELETE CART by :id
    if (method === 'DELETE') {
      const { user, error, status } = verifyTokenAndAuthorization(req, cartId);
      if (error) return res.status(status).json({ error });

      await Cart.findByIdAndDelete(cartId);
      return res.status(200).json({ message: 'Cart deleted successfully' });
    }

    // 🔍 GET USER CART by userId
    if (method === 'GET' && userId) {
      const { user, error, status } = verifyTokenAndAuthorization(req, userId);
      if (error) return res.status(status).json({ error });

      const cart = await Cart.findOne({ userId });
      return res.status(200).json(cart);
    }

    // 🔍 GET ALL CARTS (Admin only)
    if (method === 'GET') {
      const { user, error, status } = verifyTokenAndAdmin(req);
      if (error) return res.status(status).json({ error });

      const carts = await Cart.find();
      return res.status(200).json(carts);
    }

    res.status(405).json({ error: 'Method Not Allowed or Missing Params' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
}
