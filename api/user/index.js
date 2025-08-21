import { connectDB } from '../../db';
import User from '../../models/User';
import CryptoJS from 'crypto-js';
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from '../verifyToken';

export default async function handler(req, res) {
  const { method, query } = req;
  await connectDB();

  try {
    // ✅ UPDATE USER
    if (method === 'PUT') {
      const user = verifyTokenAndAuthorization(req, res);
      if (!user) return;

      const { id } = query;

      if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(
          req.body.password,
          process.env.PASS_SEC
        ).toString();
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );

      return res.status(200).json(updatedUser);
    }

    // ✅ DELETE USER
    if (method === 'DELETE') {
      const user = verifyTokenAndAuthorization(req, res);
      if (!user) return;

      await User.findByIdAndDelete(query.id);
      return res.status(200).json({ message: 'User deleted' });
    }

    // ✅ GET USER BY ID
    if (method === 'GET' && query.findId) {
      const admin = verifyTokenAndAdmin(req, res);
      if (!admin) return;

      const user = await User.findById(query.findId);
      const { password, ...others } = user._doc;
      return res.status(200).json(others);
    }

    // ✅ GET USER STATS
    if (method === 'GET' && query.stats === 'true') {
      const admin = verifyTokenAndAdmin(req, res);
      if (!admin) return;

      const date = new Date();
      const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

      const data = await User.aggregate([
        { $match: { createdAt: { $gte: lastYear } } },
        {
          $project: {
            month: { $month: '$createdAt' },
          },
        },
        {
          $group: {
            _id: '$month',
            total: { $sum: 1 },
          },
        },
      ]);

      return res.status(200).json(data);
    }

    // ✅ GET ALL USERS
    if (method === 'GET') {
      const admin = verifyTokenAndAdmin(req, res);
      if (!admin) return;

      const users = query.new
        ? await User.find().sort({ _id: -1 }).limit(5)
        : await User.find();

      return res.status(200).json(users);
    }

    // ❌ Unsupported Method
    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
