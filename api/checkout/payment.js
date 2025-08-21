import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { tokenId, amount } = req.body;

  try {
    const charge = await stripe.charges.create({
      source: tokenId,
      amount,
      currency: 'inr',
    });

    return res.status(200).json(charge);
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
}
