import { connectDB } from '../../db';
import Product from '../../models/Product';
import { verifyTokenAndAdmin } from '../verifyToken';

export default async function handler(req, res) {
  const { method, query } = req;

  await connectDB();

  try {
    // ✅ CREATE PRODUCT
    if (method === 'POST') {
      const user = verifyTokenAndAdmin(req, res);
      if (!user) return;

      const newProduct = new Product(req.body);
      const savedProduct = await newProduct.save();
      return res.status(201).json(savedProduct);
    }

    // ✅ UPDATE PRODUCT
    if (method === 'PUT') {
      const user = verifyTokenAndAdmin(req, res);
      if (!user) return;

      const updatedProduct = await Product.findByIdAndUpdate(
        query.id,
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedProduct);
    }

    // ✅ DELETE PRODUCT
    if (method === 'DELETE') {
      const user = verifyTokenAndAdmin(req, res);
      if (!user) return;

      await Product.findByIdAndDelete(query.id);
      return res.status(200).json({ message: 'Product deleted' });
    }

    // ✅ GET PRODUCT BY ID
    if (method === 'GET' && query.id) {
      const product = await Product.findById(query.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.status(200).json(product);
    }

    // ✅ GET ALL PRODUCTS / FILTERED PRODUCTS
    if (method === 'GET') {
      let products;

      if (query.new) {
        products = await Product.find().sort({ createdAt: -1 }).limit(1);
      } else if (query.category) {
        products = await Product.find({
          categories: { $in: [query.category] },
        });
      } else {
        products = await Product.find();
      }

      return res.status(200).json(products);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
