import { connectDB } from '../../db';
import Order from '../../models/Order';
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from '../verifyToken';

export default async function handler(req, res) {
  const { method, query } = req;

  await connectDB();

  try {
    // ✅ CREATE ORDER
    if (method === 'POST') {
      const user = verifyToken(req, res);
      if (!user) return;

      const newOrder = new Order(req.body);
      const savedOrder = await newOrder.save();
      return res.status(201).json(savedOrder);
    }

    // ✅ UPDATE ORDER
    if (method === 'PUT') {
      const user = verifyTokenAndAdmin(req, res);
      if (!user) return;

      const updatedOrder = await Order.findByIdAndUpdate(
        query.id,
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedOrder);
    }

    // ✅ DELETE ORDER
    if (method === 'DELETE') {
      const user = verifyTokenAndAdmin(req, res);
      if (!user) return;

      await Order.findByIdAndDelete(query.id);
      return res.status(200).json({ message: 'Order deleted' });
    }

    // ✅ GET INCOME
    if (method === 'GET' && query.income === 'true') {
      const user = verifyTokenAndAdmin(req, res);
      if (!user) return;

      const date = new Date();
      const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
      const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

      const income = await Order.aggregate([
        { $match: { createdAt: { $gte: previousMonth } } },
        {
          $project: {
            month: { $month: '$createdAt' },
            sales: '$amount',
          },
        },
        {
          $group: {
            _id: '$month',
            total: { $sum: '$sales' },
          },
        },
      ]);
      return res.status(200).json(income);
    }

    // ✅ GET USER ORDERS
    if (method === 'GET' && query.userId) {
      const user = verifyTokenAndAuthorization(req, res);
      if (!user) return;

      const orders = await Order.find({ userId: query.userId });
      return res.status(200).json(orders);
    }

    // ✅ GET ALL ORDERS (ADMIN)
    if (method === 'GET') {
      const user = verifyTokenAndAdmin(req, res);
      if (!user) return;

      const orders = await Order.find();
      return res.status(200).json(orders);
    }

    // ❌ Unknown method
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
