const router = require('express').Router();
const PDFDocument = require('pdfkit');
const { requireAuth } = require('../middleware/auth');
const { tailorResume } = require('../services/gemini');
const { pool } = require('../db');

const ACCENT = '#4f46e5';
const TEXT = '#111827';
const SUBTLE = '#6b7280';
const PAGE_W = 595.28;
const M = 38; // margin
const CW = PAGE_W - M * 2; // full content width

function secHeader(doc, label) {
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor(ACCENT).font('Helvetica-Bold')
    .text(label.toUpperCase(), M, doc.y);
  doc.moveTo(M, doc.y + 1).lineTo(PAGE_W - M, doc.y + 1)
    .strokeColor(ACCENT).lineWidth(0.7).stroke();
  doc.moveDown(0.2);
}

// Title left + date right on same baseline using absolute coords
function jobRow(doc, left, leftFont, leftSize, right) {
  const y = doc.y;
  const lw = CW * 0.73;
  const rx = M + lw;
  const rw = CW * 0.27;
  doc.fontSize(leftSize).fillColor(TEXT).font(leftFont)
    .text(left, M, y, { width: lw, lineBreak: false });
  const afterL = doc.y;
  doc.fontSize(8.5).fillColor(SUBTLE).font('Helvetica')
    .text(right, rx, y, { width: rw, align: 'right', lineBreak: false });
  doc.y = Math.max(afterL, doc.y) + doc.currentLineHeight();
}

function bul(doc, text) {
  const y = doc.y;
  doc.fontSize(8).fillColor(TEXT).font('Helvetica')
    .text('•', M + 6, y, { lineBreak: false });
  doc.text(text, M + 16, y, { width: CW - 16, lineGap: 1 });
}

router.post('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM analyses WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Analysis not found' });

    const analysis = rows[0];
    if (!analysis.full_resume_text)
      return res.status(400).json({ error: 'Resume text not available. Please run a new analysis.' });

    let data;
    if (analysis.tailored_resume) {
      try { data = JSON.parse(analysis.tailored_resume); } catch { data = null; }
    }
    if (!data) {
      data = await tailorResume(analysis.full_resume_text, analysis.job_title || '');
      await pool.query('UPDATE analyses SET tailored_resume = $1 WHERE id = $2',
        [JSON.stringify(data), analysis.id]);
    }

    const doc = new PDFDocument({ margin: M, size: 'A4', bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="tailored-resume.pdf"');
    doc.pipe(res);

    // NAME
    doc.fontSize(18).fillColor(TEXT).font('Helvetica-Bold')
      .text(data.name || '', M, M, { align: 'center', width: CW });

    // CONTACT
    if (data.contact) {
      doc.moveDown(0.2);
      doc.fontSize(8).fillColor(SUBTLE).font('Helvetica')
        .text(data.contact, M, doc.y, { align: 'center', width: CW });
    }

    // SUMMARY
    secHeader(doc, 'Summary');
    doc.fontSize(8.5).fillColor(TEXT).font('Helvetica')
      .text(data.summary || '', M, doc.y, { width: CW, lineGap: 1 });

    // EXPERIENCE
    if (data.experience && data.experience.length) {
      secHeader(doc, 'Work Experience');
      for (const job of data.experience) {
        jobRow(doc, job.title || '', 'Helvetica-Bold', 9, job.period || '');
        if (job.tech) {
          doc.fontSize(8).fillColor(SUBTLE).font('Helvetica-Oblique')
            .text(job.tech, M, doc.y, { width: CW });
        }
        doc.moveDown(0.15);
        for (const b of (job.bullets || [])) bul(doc, b);
        doc.moveDown(0.15);
      }
    }

    // EDUCATION
    if (data.education && data.education.length) {
      secHeader(doc, 'Education');
      for (const ed of data.education) {
        jobRow(doc, ed.degree || '', 'Helvetica-Bold', 9, ed.period || '');
        if (ed.detail) {
          doc.fontSize(8.5).fillColor(SUBTLE).font('Helvetica')
            .text(ed.detail, M, doc.y);
        }
        doc.moveDown(0.1);
      }
    }

    // SKILLS (left half) + CERTIFICATIONS (right half) — side by side like original
    const hasSkills = data.skills && Object.keys(data.skills).length;
    const hasCerts = data.certifications && data.certifications.length;

    if (hasSkills || hasCerts) {
      secHeader(doc, 'Skills');
      const colW = CW / 2 - 6;
      const rCol = M + colW + 12;
      const startY = doc.y;
      let lY = startY;
      let rY = startY;

      if (hasSkills) {
        for (const [k, v] of Object.entries(data.skills).filter(([, v]) => v)) {
          doc.fontSize(8.5).fillColor(TEXT).font('Helvetica-Bold')
            .text(`${k}: `, M, lY, { width: colW, continued: true, lineBreak: false });
          doc.fillColor(SUBTLE).font('Helvetica').text(v, { width: colW });
          lY = doc.y;
        }
      }

      if (hasCerts) {
        // CERTIFICATIONS header inline in right column
        doc.fontSize(9).fillColor(ACCENT).font('Helvetica-Bold')
          .text('CERTIFICATIONS', rCol, rY, { width: colW });
        doc.moveTo(rCol, doc.y + 1).lineTo(rCol + colW, doc.y + 1)
          .strokeColor(ACCENT).lineWidth(0.7).stroke();
        rY = doc.y + 4;

        for (const c of data.certifications) {
          const issuer = c.issuer && !c.name.includes(c.issuer) ? ` – ${c.issuer}` : '';
          const label = `${c.name}${issuer}`;
          doc.fontSize(8.5).fillColor(TEXT).font('Helvetica-Bold')
            .text(label, rCol, rY, { width: colW - 28, lineBreak: false });
          const afterName = doc.y;
          doc.fontSize(8).fillColor(SUBTLE).font('Helvetica')
            .text(c.date || '', rCol + colW - 26, rY, { width: 26, align: 'right', lineBreak: false });
          rY = Math.max(afterName, doc.y) + doc.currentLineHeight() * 0.6;
        }
      }

      doc.y = Math.max(lY, rY);
      doc.moveDown(0.3);
    }

    // AWARDS
    if (data.awards && data.awards.length) {
      secHeader(doc, 'Awards & Recognition');
      for (const a of data.awards) {
        jobRow(doc, a.title || '', 'Helvetica-Bold', 8.5, a.date || '');
        doc.moveDown(0.1);
      }
    }

    // PROJECTS
    if (data.projects && data.projects.length) {
      secHeader(doc, 'Projects');
      for (const p of data.projects) {
        jobRow(doc, p.title || '', 'Helvetica-Bold', 8.5, p.period || '');
        if (p.tech) {
          doc.fontSize(8).fillColor(SUBTLE).font('Helvetica-Oblique')
            .text(p.tech, M, doc.y, { width: CW });
        }
        if (p.detail) {
          doc.moveDown(0.1);
          bul(doc, p.detail);
        }
        doc.moveDown(0.2);
      }
    }

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent)
      res.status(500).json({ error: 'Failed to generate tailored resume.' });
  }
});

module.exports = router;
