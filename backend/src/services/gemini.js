const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function analyzeResume(resumeText, jobDescription) {
  const prompt = `You are an expert ATS (Applicant Tracking System) and career coach. Analyze the following resume against the job description.

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "ats_score": <integer 0-100>,
  "job_title_detected": "<string>",
  "keywords_found": ["<keyword>", ...],
  "keywords_missing": ["<keyword>", ...],
  "suggestions": [
    { "section": "<Resume Section>", "issue": "<problem>", "fix": "<actionable fix>" }
  ],
  "overall_feedback": "<2-3 sentence summary>"
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const text = completion.choices[0].message.content.trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(cleaned);
}

async function tailorResume(resumeText, jobDescription) {
  const prompt = `You are a professional resume editor. Your job is to make MINIMAL, targeted edits to a resume so it better fits a job description.

STRICT RULES:
1. Do NOT invent, fabricate, or add any experience, skills, tools, or technologies that are not explicitly stated in the original resume
2. Do NOT append phrases like "ensuring payroll processing", "utilizing MongoDB", "using Go" or any technology/domain that isn't in the original bullet
3. Keep all bullet points that are already strong — only rewrite ones that are weak or generic
4. Only rewrite: the summary paragraph, and weak/generic bullet points (strengthen with metrics/action verbs already implied by context)
5. Keep all company names, job titles, dates, education, certifications, and awards EXACTLY as they appear — do not remove any bullets
6. The output must have the SAME number of bullets per job as the original
7. Return ONLY valid JSON — no markdown, no extra text

Return this exact JSON structure:
{
  "name": "<full name from resume>",
  "contact": "<email | phone | location | linkedin | github — exactly as in resume>",
  "summary": "<rewritten summary — 2-3 sentences, aligned to JD, no fake content>",
  "experience": [
    {
      "title": "<Job Title – Company>",
      "period": "<dates>",
      "tech": "<tech stack line if present>",
      "bullets": ["<bullet>", ...]
    }
  ],
  "education": [
    { "degree": "<degree – institution>", "period": "<dates>", "detail": "<CGPA or other detail>" }
  ],
  "skills": {
    "Languages": "<value>",
    "Backend": "<value>",
    "Big Data": "<value>",
    "Cloud & DevOps": "<value>",
    "Observability": "<value>",
    "Database": "<value>",
    "Testing": "<value>",
    "Frontend": "<value>",
    "Concepts": "<value>"
  },
  "certifications": [
    { "name": "<cert name>", "issuer": "<issuer>", "date": "<date>" }
  ],
  "awards": [
    { "title": "<award>", "date": "<date>", "detail": "<description>" }
  ],
  "projects": [
    { "title": "<name>", "period": "<dates>", "tech": "<tech>", "detail": "<description>" }
  ]
}

ORIGINAL RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });

  const text = completion.choices[0].message.content.trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(cleaned);
}

module.exports = { analyzeResume, tailorResume };
