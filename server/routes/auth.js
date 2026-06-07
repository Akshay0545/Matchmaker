const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const matchmakers = require('../data/matchmakers.json');

const JWT_SECRET = process.env.JWT_SECRET || 'tdc_secret_key_2024';

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const matchmaker = matchmakers.find(
    (m) => m.username === username && m.password === password
  );

  if (!matchmaker) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: matchmaker.id, username: matchmaker.username, name: matchmaker.name },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  const { password: _, ...matchmakerData } = matchmaker;
  res.json({ token, matchmaker: matchmakerData });
});

router.get('/me', verifyToken, (req, res) => {
  res.json(req.user);
});

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

module.exports = router;
module.exports.verifyToken = verifyToken;
