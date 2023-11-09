// routes.js
const express = require('express');
const router = express.Router();
const db = require('./db');

// Retrieve products
router.get('/products', async (req, res) => {
  try {
    const products = await db.query('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add item to user's cart
router.post('/add-to-cart', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  try {
    await db.query('INSERT INTO user_carts (user_id, product_id, quantity) VALUES (?, ?, ?)', [user_id, product_id, quantity]);
    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Retrieve user's cart
router.get('/cart/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const cartItems = await db.query('SELECT uc.*, p.name, p.price FROM user_carts as uc LEFT JOIN products as p on uc.product_id = p.id WHERE user_id = ?', [user_id]);
    res.json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Complete a purchase
router.post('/complete-purchase', async (req, res) => {
  const { user_id } = req.body;
  try {

    const cartItems = await db.query('SELECT uc.*, p.price FROM user_carts as uc LEFT JOIN products as p on uc.product_id = p.id WHERE user_id = ?', [user_id]);

    const totalPrice = cartItems.reduce((acc, item) => {return acc + item.quantity * item.price}, 0);

    // Move items to order history
    await db.query('INSERT INTO order_history (user_id, total_price) VALUES (?, ?)', [user_id, totalPrice]);

    // Clear user's cart
    await db.query('DELETE FROM user_carts WHERE user_id = ?', [user_id]);

    res.json({ message: 'Purchase completed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Retrieve user's order history
router.get('/order-history/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const orders = await db.query('SELECT * FROM order_history WHERE user_id = ?', [user_id]);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Remove product from the user's cart
router.post('/remove-from-cart', async (req, res) => {
  const { user_id, product_id } = req.body;
  try {

    // Validate inputs (you may want to add more robust validation)
    if (!user_id || !product_id) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Remove the product from the user's cart
    const result = await db.query('DELETE FROM user_carts WHERE user_id = ? AND product_id = ?', [user_id, product_id]);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
