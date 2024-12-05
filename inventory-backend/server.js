

const express = require('express');

const bodyParser = require('body-parser');
const cors = require('cors');

const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

const app = express();
app.use(bodyParser.json());
//Se supone que poner un * es un problema de seguridad pero para un practica chica no pasa nada
app.use(cors({ origin: '*', methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type'] }));



// // Enable CORS for all origins
// app.use(cors({
//   origin: [
//     'https://soa1-442406.web.app', // Your frontend domain
//     'https://soa1-442406.wl.r.appspot.com' // Your backend domain
//   ],
//   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type']
// }));



// Firebase Admin SDK setup
const serviceAccount = require('./firebase-adminsdk.json');
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://soa1-442406-default-rtdb.firebaseio.com',
});
const db = getDatabase();

// Fetch all products
// app.get('/products', async (req, res) => {
//   try {
//     const snapshot = await db.ref('products').once('value');
//     res.status(200).json(snapshot.val() || {});
//   } catch (error) {
//     res.status(500).send('Error fetching products');
//   }
// });

app.get('/products', async (req, res) => {
  console.log('GET /products request received');
  try {
    const snapshot = await db.ref('products').once('value');
    const products = snapshot.val();
    console.log('Products fetched:', products);
    res.status(200).json(products || {});
  } catch (error) {
    console.error('Error fetching products:', error);
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

// Delete a product
app.delete('/products/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    await db.ref(`products/${productId}`).remove();
    res.status(200).send('Product deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting product');
  }
});

// Update a product
app.put('/products/:id', async (req, res) => {
  const productId = req.params.id;
  const { description, price, quantity } = req.body;
  if (!description || !price || !quantity) {
    return res.status(400).send('Missing required fields');
  }
  try {
    await db.ref(`products/${productId}`).update({ description, price, quantity });
    res.status(200).send('Product updated successfully');
  } catch (error) {
    res.status(500).send('Error updating product');
  }
});


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
