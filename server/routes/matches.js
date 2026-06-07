const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const { calculateMatches, preFilterCandidates } = require('../utils/matchingAlgo');
const { scoreMatchesWithAI, isAIEnabled, getAIProvider } = require('../utils/aiScorer');

const femalePool = require('../data/pool_female.json');
const malePool = require('../data/pool_male.json');
const customers = require('../data/customers.json');

router.get('/:customerId', verifyToken, async (req, res) => {
  const customer = customers.find((c) => c.id === req.params.customerId);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  const pool = customer.gender === 'Male' ? femalePool : malePool;

  // ── Step 1: Quick rule-based pre-filter → pick best 30 candidates ──────────
  const topCandidates = preFilterCandidates(customer, pool, 8);

  // ── Step 2: Score top 30 with Gemini in a SINGLE API call ──────────────────
  const aiResults = await scoreMatchesWithAI(customer, topCandidates);

  let topMatches;
  if (aiResults && Array.isArray(aiResults) && aiResults.length > 0) {
    topMatches = topCandidates.map((candidate) => {
      const ai = aiResults.find((r) => r.id === candidate.id);
      if (ai) {
        return {
          ...candidate,
          matchScore: Math.min(100, Math.max(0, parseInt(ai.score) || 50)),
          matchLabel: ai.label || 'Good Match',
          matchReasons: Array.isArray(ai.reasons) ? ai.reasons : [],
          introText: ai.introText || '',
          aiPowered: true
        };
      }
      // Gemini missed this candidate — fall back to rule-based
      const fallback = calculateMatches(customer, [candidate]);
      return fallback.length ? { ...fallback[0], aiPowered: false } : null;
    }).filter(Boolean);
  } else {
    // Full rule-based fallback for top 30
    topMatches = calculateMatches(customer, topCandidates);
  }

  // ── Step 3: Rule-based scoring for the remaining 75+ candidates ────────────
  const topIds = new Set(topCandidates.map((c) => c.id));
  const restPool = pool.filter((c) => !topIds.has(c.id));
  const restMatches = calculateMatches(customer, restPool);

  // ── Step 4: Merge, filter, sort ────────────────────────────────────────────
  const allMatches = [...topMatches, ...restMatches]
    .filter((m) => m.matchScore >= 30)
    .sort((a, b) => {
      // AI-powered results surface first within the same score band
      if (a.aiPowered !== b.aiPowered) return a.aiPowered ? -1 : 1;
      return b.matchScore - a.matchScore;
    });

  res.json({
    customer: {
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      gender: customer.gender
    },
    total: allMatches.length,
    matches: allMatches,
    aiEnabled: isAIEnabled(),
    aiProvider: getAIProvider(),
    aiScoredCount: topMatches.filter((m) => m.aiPowered).length
  });
});

module.exports = router;
