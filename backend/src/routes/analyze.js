const router = require('express').Router();
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { extractTextFromPDF } = require('../services/pdfParser');
const { analyzeResume } = require('../services/gemini');
const { pool } = require('../db');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', requireAuth, upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription, resumeText } = req.body;
    if (!jobDescription) return res.status(400).json({ error: 'Job description is required' });

    let text = resumeText || '';
    if (req.file) {
      text = await extractTextFromPDF(req.file.buffer);
    }
    if (!text.trim()) return res.status(400).json({ error: 'Resume content is required' });

    const result = await analyzeResume(text, jobDescription);

    const snippet = text.slice(0, 300);
    const { rows } = await pool.query(
      `INSERT INTO analyses
        (user_id, job_title, ats_score, keywords_found, keywords_missing, suggestions, overall_feedback, resume_snippet, full_resume_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [
        req.userId,
        result.job_title_detected || null,
        result.ats_score,
        result.keywords_found,
        result.keywords_missing,
        JSON.stringify(result.suggestions),
        result.overall_feedback,
        snippet,
        text,
      ]
    );

    res.json({ id: rows[0].id, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed. Check your API key or try again.' });
  }
});

module.exports = router;
