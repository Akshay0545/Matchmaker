const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const matchRoutes = require('./routes/matches');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/matches', matchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'TDC Matchmaker API is running' });
});

app.listen(PORT, () => {
  console.log(`TDC Matchmaker Server running on port ${PORT}`);
});
