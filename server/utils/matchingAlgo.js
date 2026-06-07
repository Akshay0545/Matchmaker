/**
 * TDC Matchmaker Algorithm
 * Rule-based AI scoring engine that computes compatibility between a customer
 * and each candidate in the pool, generating natural-language explanations.
 */

function scoreLifestyle(c1, c2) {
  let score = 0;
  if (c1.diet === c2.diet) score += 4;
  else if (
    (c1.diet === 'Vegetarian' && c2.diet === 'Vegan') ||
    (c1.diet === 'Vegan' && c2.diet === 'Vegetarian')
  ) score += 2;
  else score += 0;

  if (c1.smoking === c2.smoking) score += 3;
  else if (c1.smoking === 'Never' || c2.smoking === 'Never') score += 0;
  else score += 1;

  if (c1.drinking === c2.drinking) score += 3;
  else if (c1.drinking === 'Never' || c2.drinking === 'Never') score += 0;
  else score += 1;
  return Math.min(score, 10);
}

function scoreEducation(deg1, deg2) {
  const tiers = {
    'Ph.D': 5, 'MBBS': 4, 'M.Tech': 3, 'M.Sc': 3, 'MBA': 3, 'MCA': 3, 'LLB': 3,
    'B.Tech': 3, 'B.E.': 3, 'B.Sc': 2, 'BCA': 2, 'BBA': 2, 'B.Com': 2, 'BA': 2,
    'Diploma': 1, 'Others': 1
  };
  const t1 = tiers[deg1] || 2;
  const t2 = tiers[deg2] || 2;
  const diff = Math.abs(t1 - t2);
  if (diff === 0) return 10;
  if (diff === 1) return 7;
  if (diff === 2) return 4;
  return 2;
}

function getProfessionCategory(designation) {
  const cats = {
    tech: ['software', 'developer', 'engineer', 'data scientist', 'devops', 'product manager', 'ui', 'ux', 'ml', 'tech lead', 'architect', 'analyst'],
    finance: ['finance', 'ca', 'accountant', 'investment', 'banker', 'financial', 'auditor', 'cfo'],
    medical: ['doctor', 'physician', 'surgeon', 'nurse', 'medical', 'dentist', 'pharmacist'],
    law: ['lawyer', 'advocate', 'legal', 'judge', 'attorney'],
    education: ['professor', 'teacher', 'lecturer', 'researcher', 'scientist'],
    management: ['marketing', 'hr', 'operations', 'consultant', 'manager', 'executive', 'director'],
    creative: ['designer', 'content', 'photographer', 'journalist', 'writer', 'artist'],
    govt: ['ias', 'ips', 'army', 'navy', 'officer', 'civil servant', 'pilot']
  };

  const d = designation.toLowerCase();
  for (const [cat, keywords] of Object.entries(cats)) {
    if (keywords.some((k) => d.includes(k))) return cat;
  }
  return 'other';
}

function scoreProfessionCompat(desg1, desg2) {
  const c1 = getProfessionCategory(desg1);
  const c2 = getProfessionCategory(desg2);
  if (c1 === c2) return 15;
  const compatible = {
    tech: ['finance', 'management', 'education'],
    finance: ['tech', 'management', 'law'],
    medical: ['education', 'management'],
    law: ['finance', 'management', 'govt'],
    education: ['medical', 'tech', 'creative'],
    management: ['tech', 'finance', 'law', 'creative'],
    creative: ['management', 'education'],
    govt: ['law', 'management']
  };
  if ((compatible[c1] || []).includes(c2)) return 10;
  return 6;
}

function kidsScore(wk1, wk2) {
  if (wk1 === wk2) return { score: 20, reason: `Both want kids: ${wk1}` };
  if (wk1 === 'Maybe' || wk2 === 'Maybe') return { score: 10, reason: 'Open discussion needed on children' };
  return { score: 0, reason: '⚠️ Incompatible views on having children' };
}

function religionScore(r1, r2) {
  if (r1 === r2) return { score: 15, reason: `Shared ${r1} faith & values` };
  return { score: 2, reason: `⚠️ Different religions (${r1} & ${r2}) — open conversation needed` };
}

// --- Male customer: match with women ---
function scoreForMaleCustomer(customer, candidate) {
  const reasons = [];
  let total = 0;

  // Age (25 pts)
  const ageDiff = customer.age - candidate.age;
  let ageScore;
  if (ageDiff >= 2 && ageDiff <= 6) {
    ageScore = 25; reasons.push(`Ideal age gap of ${ageDiff} years (she is younger)`);
  } else if (ageDiff >= 7 && ageDiff <= 10) {
    ageScore = 18; reasons.push(`Good age difference of ${ageDiff} years`);
  } else if (ageDiff > 10) {
    ageScore = 8;
  } else if (ageDiff >= 0) {
    ageScore = 12; reasons.push('Similar age range');
  } else if (ageDiff >= -2) {
    ageScore = 6; reasons.push('⚠️ She is slightly older');
  } else {
    ageScore = 2; reasons.push('⚠️ She is older than him');
  }
  total += ageScore;

  // Kids (20 pts)
  const kids = kidsScore(customer.wantKids, candidate.wantKids);
  total += kids.score; reasons.push(kids.reason);

  // Religion (15 pts)
  const rel = religionScore(customer.religion, candidate.religion);
  total += rel.score; reasons.push(rel.reason);

  // Height (10 pts)
  const hDiff = customer.height - candidate.height;
  let htScore;
  if (hDiff >= 10 && hDiff <= 22) { htScore = 10; reasons.push('Compatible height difference'); }
  else if (hDiff >= 5) { htScore = 7; }
  else if (hDiff >= 0) { htScore = 4; }
  else { htScore = 1; reasons.push('⚠️ She is taller than him'); }
  total += htScore;

  // Income (10 pts)
  let incScore;
  if (candidate.income < customer.income * 0.6) { incScore = 10; reasons.push('Income expectations align well'); }
  else if (candidate.income < customer.income * 0.9) { incScore = 7; }
  else if (candidate.income <= customer.income) { incScore = 4; }
  else { incScore = 1; reasons.push('⚠️ She earns more than him'); }
  total += incScore;

  // Education (10 pts)
  total += scoreEducation(customer.degree, candidate.degree);

  // Lifestyle (10 pts)
  const ls = scoreLifestyle(customer, candidate);
  total += ls;
  if (ls >= 7) reasons.push('Strong lifestyle compatibility');
  else if (ls <= 2) reasons.push('⚠️ Different lifestyle habits');

  // City bonus
  if (customer.city === candidate.city) { total += 5; reasons.push(`Both based in ${customer.city}`); }
  else if (candidate.openToRelocate === 'Yes') { total += 3; reasons.push('She is open to relocating'); }

  // Relocation preference
  if (customer.openToRelocate === 'Yes' && candidate.openToRelocate === 'Yes') {
    total += 2; reasons.push('Both flexible on relocation');
  }

  // Caste bonus
  if (customer.caste && candidate.caste && customer.caste === candidate.caste) {
    total += 3; reasons.push(`Same caste (${customer.caste})`);
  }

  // Family type
  if (customer.familyType === candidate.familyType) {
    total += 2; reasons.push(`Both prefer ${customer.familyType} family setup`);
  }

  return { total: Math.min(total, 100), reasons };
}

// --- Female customer: match with men ---
function scoreForFemaleCustomer(customer, candidate) {
  const reasons = [];
  let total = 0;

  // Kids (20 pts)
  const kids = kidsScore(customer.wantKids, candidate.wantKids);
  total += kids.score; reasons.push(kids.reason);

  // Values: religion (12) + family type (8) = 20 pts
  const rel = religionScore(customer.religion, candidate.religion);
  total += rel.score; reasons.push(rel.reason);
  if (customer.familyType === candidate.familyType) {
    total += 8; reasons.push(`Both value a ${customer.familyType} family`);
  } else {
    total += 2; reasons.push('⚠️ Different preferences on family setup (Joint vs Nuclear)');
  }

  // Profession compatibility (15 pts)
  const profScore = scoreProfessionCompat(customer.designation, candidate.designation);
  total += profScore;
  if (profScore >= 10) reasons.push('Professionally compatible careers');

  // Relocation (15 pts)
  if (customer.city === candidate.city) {
    total += 12; reasons.push(`Both in ${customer.city} — no relocation needed`);
  } else if (candidate.openToRelocate === 'Yes' || customer.openToRelocate === 'Yes') {
    total += 15; reasons.push('Flexible on relocation');
  } else if (candidate.openToRelocate === 'Maybe' || customer.openToRelocate === 'Maybe') {
    total += 8; reasons.push('May be open to relocating');
  } else {
    total += 2; reasons.push('⚠️ Neither is open to relocate — different cities');
  }

  // Income (10 pts)
  let incScore;
  if (candidate.income >= customer.income) { incScore = 10; reasons.push('He earns equal or more'); }
  else if (candidate.income >= customer.income * 0.8) { incScore = 7; }
  else if (candidate.income >= customer.income * 0.6) { incScore = 4; }
  else { incScore = 1; reasons.push('⚠️ Significant income gap'); }
  total += incScore;

  // Age (10 pts)
  const ageDiff = candidate.age - customer.age;
  let ageScore;
  if (ageDiff >= 1 && ageDiff <= 5) { ageScore = 10; reasons.push(`He is ${ageDiff} years older — ideal match`); }
  else if (ageDiff >= 6 && ageDiff <= 10) { ageScore = 5; reasons.push(`He is ${ageDiff} years older`); }
  else if (ageDiff === 0) { ageScore = 8; reasons.push('Same age'); }
  else if (ageDiff < 0 && ageDiff >= -2) { ageScore = 4; reasons.push('⚠️ She is slightly older'); }
  else if (ageDiff > 10) { ageScore = 2; reasons.push('⚠️ Large age gap'); }
  else { ageScore = 1; reasons.push('⚠️ She is older than him'); }
  total += ageScore;

  // Lifestyle (10 pts)
  const ls = scoreLifestyle(customer, candidate);
  total += ls;
  if (ls >= 7) reasons.push('Strong lifestyle compatibility');
  else if (ls <= 2) reasons.push('⚠️ Different lifestyle habits');

  // Education (5 pts max)
  total += Math.round(scoreEducation(customer.degree, candidate.degree) * 0.5);

  // Caste bonus
  if (customer.caste && candidate.caste && customer.caste === candidate.caste) {
    total += 3; reasons.push(`Same caste (${customer.caste})`);
  }

  // Languages bonus
  const sharedLangs = customer.languages.filter((l) => candidate.languages.includes(l));
  if (sharedLangs.length >= 2) {
    total += 2; reasons.push(`Speaks shared languages: ${sharedLangs.join(', ')}`);
  }

  return { total: Math.min(total, 100), reasons };
}

function getMatchLabel(score) {
  if (score >= 78) return 'High Potential Match';
  if (score >= 62) return 'Strong Match';
  if (score >= 48) return 'Good Match';
  if (score >= 35) return 'Possible Match';
  return 'Low Compatibility';
}

function generateIntro(customer, candidate, score, reasons) {
  const positives = reasons.filter((r) => !r.startsWith('⚠️')).slice(0, 3);
  const label = getMatchLabel(score);
  const greeting = `Dear ${customer.firstName},\n\n`;
  const opening = `We're thrilled to introduce you to ${candidate.firstName} ${candidate.lastName}, a ${label.toLowerCase()} for you based on our deep-dive compatibility analysis.\n\n`;
  const highlights = `What makes this match special: ${positives.join('; ')}.\n\n`;
  const profile = `${candidate.firstName} is a ${candidate.designation} at ${candidate.company} based in ${candidate.city}. At ${candidate.age} years old, ${candidate.gender === 'Female' ? 'she' : 'he'} shares your values and brings complementary strengths to a relationship.\n\n`;
  const cta = `We believe this could be the beginning of something beautiful. Shall we arrange an introduction? Please let us know and we'll take care of the rest.\n\nWith warmth,\nThe Date Crew Team`;
  return greeting + opening + highlights + profile + cta;
}

function calculateMatches(customer, pool) {
  const results = pool.map((candidate) => {
    const { total, reasons } =
      customer.gender === 'Male'
        ? scoreForMaleCustomer(customer, candidate)
        : scoreForFemaleCustomer(customer, candidate);

    const label = getMatchLabel(total);

    return {
      ...candidate,
      matchScore: total,
      matchLabel: label,
      matchReasons: reasons,
      introText: generateIntro(customer, candidate, total, reasons),
      aiPowered: false
    };
  });

  return results
    .filter((r) => r.matchScore >= 30)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Quick pre-filter: lightweight score to pick the best N candidates
 * before sending them to the Gemini AI for deep scoring.
 */
function quickScore(customer, candidate) {
  let s = 0;
  if (customer.religion === candidate.religion) s += 22;
  if (customer.wantKids === candidate.wantKids) s += 20;
  else if (customer.wantKids === 'Maybe' || candidate.wantKids === 'Maybe') s += 10;

  const ageGap = customer.gender === 'Male'
    ? customer.age - candidate.age
    : candidate.age - customer.age;
  if (ageGap >= 0 && ageGap <= 8) s += 16;
  else if (ageGap > 8 && ageGap <= 14) s += 8;

  if (customer.city === candidate.city) s += 10;
  if (customer.familyType === candidate.familyType) s += 8;
  if (customer.gender === 'Male' && candidate.income <= customer.income) s += 8;
  if (customer.gender === 'Female' && candidate.income >= customer.income * 0.8) s += 8;
  if (candidate.maritalStatus === 'Single') s += 6;
  if (customer.diet === candidate.diet) s += 5;
  if (customer.smoking === candidate.smoking) s += 4;
  return s;
}

function preFilterCandidates(customer, pool, topN = 30) {
  return pool
    .map(c => ({ ...c, _qs: quickScore(customer, c) }))
    .sort((a, b) => b._qs - a._qs)
    .slice(0, topN)
    .map(({ _qs, ...c }) => c);
}

module.exports = { calculateMatches, preFilterCandidates };
