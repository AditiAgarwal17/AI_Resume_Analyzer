import { useEffect, useState } from 'react';

export default function ScoreGauge({ score }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(score / 50);
    const timer = setInterval(() => {
      start += step;
      if (start >= score) {
        setDisplayed(score);
        clearInterval(timer);
      } else {
        setDisplayed(start);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [score]);

  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const pct = (displayed / 100) * 360;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-40 h-40 rounded-full flex items-center justify-center relative"
        style={{
          background: `conic-gradient(${color} ${pct}deg, #1f2937 ${pct}deg)`,
        }}
      >
        <div className="w-28 h-28 rounded-full bg-gray-900 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold" style={{ color }}>{displayed}</span>
          <span className="text-xs text-gray-400 uppercase tracking-widest">ATS Score</span>
        </div>
      </div>
      <p className="text-sm font-medium" style={{ color }}>
        {score >= 75 ? 'Strong Match' : score >= 50 ? 'Moderate Match' : 'Weak Match'}
      </p>
    </div>
  );
}
