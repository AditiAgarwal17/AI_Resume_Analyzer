const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { pool } = require('../db');

router.get('/', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, job_title, ats_score, resume_snippet, created_at FROM analyses WHERE user_id = $1 ORDER BY created_at DESC',
    [req.userId]
  );
  res.json(rows);
});

router.get('/:id', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM analyses WHERE id = $1 AND user_id = $2',
    [req.params.id, req.userId]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

module.exports = router;
