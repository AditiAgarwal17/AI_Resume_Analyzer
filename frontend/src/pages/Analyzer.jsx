import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Analyzer() {
  const [mode, setMode] = useState('upload'); // 'upload' | 'paste'
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (mode === 'upload' && !file) return setError('Please upload a PDF file.');
    if (mode === 'paste' && !resumeText.trim()) return setError('Please paste your resume text.');
    if (!jobDescription.trim()) return setError('Please paste the job description.');

    setLoading(true);
    try {
      const formData = new FormData();
      if (mode === 'upload') formData.append('resume', file);
      else formData.append('resumeText', resumeText);
      formData.append('jobDescription', jobDescription);

      const { data } = await api.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/result/${data.id}`, { state: data });
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analyze Your Resume</h1>
        <p className="text-gray-400">Upload or paste your resume, then add the job description.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resume Input */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'upload' ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              Upload PDF
            </button>
            <button
              type="button"
              onClick={() => setMode('paste')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'paste' ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              Paste Text
            </button>
          </div>

          {mode === 'upload' ? (
            <div
              onClick={() => fileRef.current.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition
                ${file ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-700 hover:border-gray-500'}`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
              {file ? (
                <div className="space-y-1">
                  <p className="text-emerald-400 font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-xs text-gray-500 hover:text-red-400 transition mt-2">Remove</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-4xl">📄</p>
                  <p className="text-gray-300 font-medium">Click to upload PDF</p>
                  <p className="text-xs text-gray-500">Max 5 MB</p>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here…"
              rows={10}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-emerald-500 outline-none text-white placeholder-gray-500 resize-none text-sm transition"
            />
          )}
        </div>

        {/* Job Description */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-3">
          <label className="text-sm font-semibold text-gray-300">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here…"
            rows={8}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-emerald-500 outline-none text-white placeholder-gray-500 resize-none text-sm transition"
          />
        </div>

        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Analyzing…
            </>
          ) : 'Analyze Resume →'}
        </button>
      </form>
    </div>
  );
}
