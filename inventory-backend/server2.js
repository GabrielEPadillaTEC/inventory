const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Firebase Admin SDK setup
const serviceAccount = require('./firebase-adminsdk.json');
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://soa1-442406-default-rtdb.firebaseio.com',
});
const db = getDatabase();

// Fetch all products
app.get('/products', async (req, res) => {
  try {
    const snapshot = await db.ref('products').once('value');
    res.status(200).json(snapshot.val() || {});
  } catch (error) {
    res.status(500).send('Error fetching products');
  }
});

// Add a product
app.post('/products', async (req, res) => {
  const { description, price, quantity } = req.body;
  if (!description || !price || !quantity) {
    return res.status(400).send('Missing required fields');
  }
  try {
    await db.ref('products').push({ description, price, quantity });
    res.status(201).send('Product added successfully');
  } catch (error) {
    res.status(500).send('Error adding product');
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
