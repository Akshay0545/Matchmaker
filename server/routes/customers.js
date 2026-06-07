const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { verifyToken } = require('./auth');
const { analyzeNotes, isAIEnabled } = require('../utils/aiScorer');

const customersPath = path.join(__dirname, '../data/customers.json');

function readCustomers() {
  return JSON.parse(fs.readFileSync(customersPath, 'utf8'));
}

function writeCustomers(data) {
  fs.writeFileSync(customersPath, JSON.stringify(data, null, 2));
}

router.get('/', verifyToken, (req, res) => {
  const customers = readCustomers();
  const assigned = customers.filter((c) => c.assignedTo === req.user.username);
  res.json(assigned);
});

router.get('/:id', verifyToken, (req, res) => {
  const customers = readCustomers();
  const customer = customers.find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
});

router.patch('/:id/status', verifyToken, (req, res) => {
  const customers = readCustomers();
  const idx = customers.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Customer not found' });

  customers[idx].status = req.body.status;
  writeCustomers(customers);
  res.json(customers[idx]);
});

router.post('/:id/notes', verifyToken, (req, res) => {
  const customers = readCustomers();
  const idx = customers.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Customer not found' });

  const note = {
    id: Date.now().toString(),
    text: req.body.text,
    createdAt: new Date().toISOString(),
    author: req.user.name
  };

  if (!customers[idx].notes) customers[idx].notes = [];
  customers[idx].notes.unshift(note);
  writeCustomers(customers);
  res.json(customers[idx]);
});

router.delete('/:id/notes/:noteId', verifyToken, (req, res) => {
  const customers = readCustomers();
  const idx = customers.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Customer not found' });

  customers[idx].notes = (customers[idx].notes || []).filter(
    (n) => n.id !== req.params.noteId
  );
  writeCustomers(customers);
  res.json(customers[idx]);
});

router.post('/:id/send-match', verifyToken, (req, res) => {
  const customers = readCustomers();
  const idx = customers.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Customer not found' });

  const matchRecord = {
    id: Date.now().toString(),
    matchId: req.body.matchId,
    matchName: req.body.matchName,
    sentAt: new Date().toISOString(),
    introText: req.body.introText,
    score: req.body.score
  };

  if (!customers[idx].sentMatches) customers[idx].sentMatches = [];
  customers[idx].sentMatches.unshift(matchRecord);
  if (customers[idx].status === 'New' || customers[idx].status === 'Profiling') {
    customers[idx].status = 'Searching';
  }
  writeCustomers(customers);

  res.json({
    message: `Match introduction email sent to ${customers[idx].firstName}!`,
    record: matchRecord
  });
});

// AI-powered notes analysis — "Generate Insights" button
router.post('/:id/analyze-notes', verifyToken, async (req, res) => {
  const customers = readCustomers();
  const customer = customers.find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  if (!isAIEnabled()) {
    return res.status(503).json({ message: 'AI not configured. Add GEMINI_API_KEY to server/.env' });
  }

  const { notesText } = req.body;
  if (!notesText || notesText.trim().length < 10) {
    return res.status(400).json({ message: 'Please provide notes text (minimum 10 characters)' });
  }

  const insights = await analyzeNotes(customer, notesText);
  if (!insights) {
    return res.status(500).json({ message: 'AI analysis failed. Please try again.' });
  }

  res.json({ insights });
});

module.exports = router;
