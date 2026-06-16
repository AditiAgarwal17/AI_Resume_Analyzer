const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      job_title TEXT,
      ats_score INTEGER,
      keywords_found TEXT[],
      keywords_missing TEXT[],
      suggestions JSONB,
      overall_feedback TEXT,
      resume_snippet TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`
    ALTER TABLE analyses ADD COLUMN IF NOT EXISTS full_resume_text TEXT;
    ALTER TABLE analyses ADD COLUMN IF NOT EXISTS tailored_resume TEXT;
  `);
  console.log('Database tables ready');
}

module.exports = { pool, initDB };
