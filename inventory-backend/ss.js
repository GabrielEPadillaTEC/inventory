const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getDatabase } = require('firebase-admin/database');

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-adminsdk.json');
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://soa1-442406-default-rtdb.firebaseio.com'
});
const db = getDatabase();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Middleware to validate Firebase ID token
async function authenticate(req, res, next) {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).send('Unauthorized: Missing token');
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.user = decodedToken; // Add user info to request
    next();
  } catch (error) {
    console.error('Error verifying ID token:', error.message);
    res.status(403).send('Unauthorized: Invalid token');
  }
}

// Protect all routes with the `authenticate` middleware
app.use(authenticate);

// CRUD Endpoints
app.get('/products', async (req, res) => {
  try {
    const ref = db.ref('products');
    const snapshot = await ref.once('value');
    res.status(200).json(snapshot.val() || {});
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).send('Error fetching products');
  }
});

app.post('/products', async (req, res) => {
  const { price, quantity, description } = req.body;

  if (!price || !quantity || !description) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const ref = db.ref('products').push();
    await ref.set({ price, quantity, description });
    res.status(201).send('Product added successfully');
  } catch (error) {
    console.error('Error adding product:', error.message);
    res.status(500).send('Error adding product');
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
