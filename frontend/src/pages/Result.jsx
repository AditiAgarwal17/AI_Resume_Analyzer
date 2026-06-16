import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import ScoreGauge from '../components/ScoreGauge';
import KeywordBadges from '../components/KeywordBadges';
import SuggestionCard from '../components/SuggestionCard';
import api from '../utils/api';

export default function Result() {
  const { id } = useParams();
  const { state } = useLocation();
  const [result, setResult] = useState(state || null);
  const [loading, setLoading] = useState(!state);
  const [tailoring, setTailoring] = useState(false);
  const [tailorError, setTailorError] = useState('');

  useEffect(() => {
    if (!state) {
      api.get(`/history/${id}`)
        .then(({ data }) => setResult(data))
        .finally(() => setLoading(false));
    }
  }, [id, state]);

  async function handleTailor() {
    setTailoring(true);
    setTailorError('');
    try {
      const response = await api.post(`/tailor/${id}`, {}, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tailored-resume.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setTailorError('Failed to generate tailored resume. Try again.');
    } finally {
      setTailoring(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-gray-400 animate-pulse">Loading analysis…</div>
    </div>
  );

  if (!result) return (
    <div className="text-center py-20 text-gray-400">Analysis not found.</div>
  );

  const suggestions = Array.isArray(result.suggestions)
    ? result.suggestions
    : (result.suggestions ? Object.values(result.suggestions) : []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analysis Results</h1>
          {result.job_title_detected && (
            <p className="text-gray-400 mt-1">Role: <span className="text-white font-medium">{result.job_title_detected}</span></p>
          )}
        </div>
        <Link to="/analyzer" className="px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-sm text-gray-300 hover:text-white transition">
          ← New Analysis
        </Link>
      </div>

      {/* Score */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 flex flex-col sm:flex-row items-center gap-8">
        <ScoreGauge score={result.ats_score} />
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Overall Feedback</h2>
          <p className="text-gray-300 leading-relaxed">{result.overall_feedback}</p>
        </div>
      </div>

      {/* Keywords */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold mb-4">Keyword Analysis</h2>
        <KeywordBadges
          found={result.keywords_found || []}
          missing={result.keywords_missing || []}
        />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Improvement Suggestions</h2>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <SuggestionCard key={i} section={s.section} issue={s.issue} fix={s.fix} />
            ))}
          </div>
        </div>
      )}

      {/* Tailor CTA */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Tailor Your Resume</h2>
          <p className="text-sm text-gray-400 mt-1">
            AI rewrites your resume to match this job — incorporates missing keywords, strengthens bullet points, and tailors your summary.
          </p>
        </div>
        {tailorError && <p className="text-red-400 text-sm">{tailorError}</p>}
        <button
          onClick={handleTailor}
          disabled={tailoring}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition disabled:opacity-50"
        >
          {tailoring ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Generating PDF…
            </>
          ) : '⬇ Download Tailored Resume (PDF)'}
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <Link to="/analyzer" className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold transition">
          Analyze Another
        </Link>
        <Link to="/history" className="px-6 py-3 rounded-xl border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white transition">
          View History
        </Link>
      </div>
    </div>
  );
}
