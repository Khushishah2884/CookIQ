const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./userRoutes');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Make sure your MongoDB URI is correct and database is named "CookIQ"
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log('MongoDB connected'))
 .catch(err => console.error('MongoDB connection error:', err));

// This line makes /api/users/signup available
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
