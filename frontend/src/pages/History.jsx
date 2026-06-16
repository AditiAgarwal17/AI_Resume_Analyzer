import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/history')
      .then(({ data }) => setAnalyses(data))
      .finally(() => setLoading(false));
  }, []);

  function scoreColor(score) {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Analysis History</h1>
        <Link to="/analyzer" className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition">
          + New Analysis
        </Link>
      </div>

      {loading && <p className="text-gray-400 animate-pulse">Loading…</p>}

      {!loading && analyses.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <p className="text-5xl">📂</p>
          <p className="text-gray-400">No analyses yet.</p>
          <Link to="/analyzer" className="inline-block px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition">
            Analyze Your First Resume
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {analyses.map((a) => (
          <Link
            key={a.id}
            to={`/result/${a.id}`}
            className="block rounded-2xl border border-gray-800 bg-gray-900 p-5 hover:border-gray-600 transition group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{a.job_title || 'Untitled Analysis'}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.resume_snippet}</p>
                <p className="text-xs text-gray-600 mt-2">{new Date(a.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-2xl font-extrabold ${scoreColor(a.ats_score)}`}>{a.ats_score}</span>
                <p className="text-xs text-gray-500">ATS Score</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
