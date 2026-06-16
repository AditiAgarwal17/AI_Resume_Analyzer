export default function KeywordBadges({ found = [], missing = [] }) {
  return (
    <div className="space-y-4">
      {found.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
            Found ({found.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {found.map((kw) => (
              <span
                key={kw}
                className="px-3 py-1 rounded-full text-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
      {missing.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-2">
            Missing ({missing.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {missing.map((kw) => (
              <span
                key={kw}
                className="px-3 py-1 rounded-full text-sm bg-red-500/10 text-red-300 border border-red-500/20"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
