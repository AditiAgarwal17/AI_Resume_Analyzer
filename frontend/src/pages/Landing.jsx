import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '📊', title: 'ATS Score', desc: 'Instantly see how your resume ranks against the job description with a 0–100 score.' },
  { icon: '🔑', title: 'Keyword Analysis', desc: 'See exactly which keywords you have and which are missing — the words ATS systems scan for.' },
  { icon: '✍️', title: 'AI Suggestions', desc: 'Get section-by-section feedback with specific, actionable improvements written by AI.' },
  { icon: '📁', title: 'Analysis History', desc: 'Every analysis is saved. Revisit, compare, and track your improvements over time.' },
];

export default function Landing() {
  const { isAuth } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-6">
          Powered by Google Gemini
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          Beat the ATS.<br />
          <span className="text-emerald-400">Land the Interview.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Upload your resume and paste a job description. Get an ATS compatibility score,
          keyword gaps, and AI-powered suggestions in seconds.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to={isAuth ? '/analyzer' : '/register'}
            className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg transition"
          >
            Analyze My Resume →
          </Link>
          {!isAuth && (
            <Link to="/login" className="px-8 py-3 rounded-xl border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold transition">
              Sign In
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-3">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-24 text-center">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 space-y-4">
          <h2 className="text-3xl font-bold">Ready to optimize your resume?</h2>
          <p className="text-gray-400">Free to use. No credit card required.</p>
          <Link
            to={isAuth ? '/analyzer' : '/register'}
            className="inline-block px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
