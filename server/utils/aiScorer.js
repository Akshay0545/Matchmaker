/**
 * TDC AI Match Scorer
 * Primary: Groq (llama-3.3-70b) — free tier, instant setup
 * Fallback: Google Gemini (gemini-2.0-flash) — if GEMINI_API_KEY is set
 */

const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Initialise Groq ──────────────────────────────────────────────────────────
let groqClient = null;
const groqKey = (process.env.GROQ_API_KEY || '').trim();
if (groqKey) {
  groqClient = new Groq({ apiKey: groqKey });
  console.log('✅ Groq AI scorer initialised (llama-3.1-8b-instant)');
}

// ── Initialise Gemini (fallback) ─────────────────────────────────────────────
let genAI = null;
const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
if (!groqClient && geminiKey && geminiKey !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(geminiKey);
  console.log('✅ Gemini AI scorer initialised (gemini-2.0-flash) as fallback');
}

if (!groqClient && !genAI) {
  console.warn('⚠️  No AI API key configured. Add GROQ_API_KEY to server/.env');
  console.warn('   Get a free key at https://console.groq.com');
}

const scoreCache = new Map();

function condense(p) {
  return {
    id: p.id,
    age: p.age,
    city: p.city,
    religion: p.religion,
    caste: p.caste || '',
    income: `₹${(p.income / 100000).toFixed(0)}L`,
    job: p.designation,
    degree: p.degree,
    kids: p.wantKids,
    relocate: p.openToRelocate,
    diet: p.diet,
    smoke: p.smoking,
    drink: p.drinking,
    family: p.familyType,
    manglik: p.manglik ? 'Y' : 'N',
    marital: p.maritalStatus
  };
}

function buildPrompt(customer, candidates) {
  const c = condense(customer);
  const list = candidates.map(condense);
  const isMale = customer.gender === 'Male';

  return `Indian matrimony matchmaker. Score compatibility between client and candidates.
Client(${isMale ? 'M' : 'F'}): ${JSON.stringify(c)}
Candidates: ${JSON.stringify(list)}
Weights: religion/caste/family=30, kids/relocate/lifestyle=25, career/income=20, diet/habits=15, age/city=10.
Labels: >=75=High Potential Match,60-74=Strong Match,45-59=Good Match,30-44=Possible Match,<30=Low Compatibility
${isMale ? 'Male prefs: she 2-7yr younger, similar/lower income ok.' : 'Female prefs: he 1-6yr older, equal/higher income preferred.'}
Return JSON object: {"results":[{"id":"<id>","score":<0-100>,"label":"<label>","breakdown":{"familyValues":<0-100>,"lifeGoals":<0-100>,"career":<0-100>,"lifestyle":<0-100>,"practical":<0-100>},"positives":["<str1>","<str2>"],"concerns":["<str if any>"],"introText":"Dear ${customer.firstName}, I introduce [name] — [label]. [1 sentence why compatible]. Warm regards, Meera Kapoor, The Date Crew"}]}`;
}

function parseJSON(raw, expectedCount) {
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch {
    const m = raw.match(/\[[\s\S]*\]/);
    if (!m) throw new Error('No JSON array found in response');
    parsed = JSON.parse(m[0]);
  }
  if (!Array.isArray(parsed)) throw new Error('Response is not a JSON array');
  return parsed.map(r => ({ ...r, score: Math.min(100, Math.max(0, parseInt(r.score) || 50)) }));
}

// ── Score via Groq ────────────────────────────────────────────────────────────
async function scoreWithGroq(customer, candidates) {
  const prompt = buildPrompt(customer, candidates);
  const completion = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 2048,
    response_format: { type: 'json_object' }
  });
  const raw = completion.choices[0].message.content.trim();
  let text = raw;
  try {
    const obj = JSON.parse(raw);
    if (!Array.isArray(obj)) {
      const arrVal = obj.results || Object.values(obj).find(v => Array.isArray(v));
      text = arrVal ? JSON.stringify(arrVal) : raw;
    }
  } catch { /* use raw */ }
  return parseJSON(text, candidates.length);
}

// ── Score via Gemini ──────────────────────────────────────────────────────────
async function scoreWithGemini(customer, candidates) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json', temperature: 0.65, maxOutputTokens: 8192 }
  });
  const result = await model.generateContent(buildPrompt(customer, candidates));
  return parseJSON(result.response.text().trim(), candidates.length);
}

// ── Public: score matches ─────────────────────────────────────────────────────
async function scoreMatchesWithAI(customer, candidates) {
  if (!groqClient && !genAI) return null;

  const cacheKey = `${customer.id}::${candidates.map(c => c.id).join(',')}`;
  if (scoreCache.has(cacheKey)) {
    console.log(`Cache hit for ${customer.firstName}`);
    return scoreCache.get(cacheKey);
  }

  const provider = groqClient ? 'Groq' : 'Gemini';
  console.log(`Calling ${provider} for ${customer.firstName} × ${candidates.length} candidates…`);

  try {
    const parsed = groqClient
      ? await scoreWithGroq(customer, candidates)
      : await scoreWithGemini(customer, candidates);

    scoreCache.set(cacheKey, parsed);
    console.log(`✅ ${provider} scored ${parsed.length} candidates for ${customer.firstName}`);
    return parsed;
  } catch (err) {
    console.error(`${provider} scoring error:`, err.message);
    return null;
  }
}

// ── Public: analyse notes ─────────────────────────────────────────────────────
async function analyzeNotes(customer, notesText) {
  if (!groqClient && !genAI) return null;
  if (!notesText || notesText.trim().length < 10) return null;

  const prompt = `You are Meera Kapoor, a senior Indian matrimonial matchmaker at The Date Crew. Analyse these matchmaker notes and extract structured intelligence.

CLIENT: ${customer.firstName} ${customer.lastName}, ${customer.age} yrs, ${customer.city}, ${customer.designation} at ${customer.company}

RAW NOTES:
"${notesText}"

Return ONLY a valid JSON object:
{
  "keyPreferences": ["<preference 1>", "<preference 2>", "<preference 3>"],
  "recommendedMatchTraits": ["<trait 1>", "<trait 2>", "<trait 3>"],
  "concerns": ["<concern if any>"],
  "personalityInsights": "<1-2 sentence personality summary>",
  "nextSteps": "<1 actionable suggestion for the matchmaker>"
}`;

  try {
    let raw;
    if (groqClient) {
      const completion = await groqClient.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1024,
        response_format: { type: 'json_object' }
      });
      raw = completion.choices[0].message.content.trim();
    } else {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: { responseMimeType: 'application/json', temperature: 0.5 }
      });
      raw = (await model.generateContent(prompt)).response.text().trim();
    }

    try { return JSON.parse(raw); }
    catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('Non-JSON response');
      return JSON.parse(m[0]);
    }
  } catch (err) {
    console.error('Notes analysis error:', err.message);
    return null;
  }
}

const isAIEnabled = () => !!(groqClient || genAI);
const getAIProvider = () => groqClient ? 'Groq' : genAI ? 'Gemini' : null;

module.exports = { scoreMatchesWithAI, analyzeNotes, isAIEnabled, getAIProvider };
