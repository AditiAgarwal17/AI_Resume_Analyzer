export default function SuggestionCard({ section, issue, fix }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">{section}</span>
      </div>
      <p className="text-sm text-red-300">{issue}</p>
      <p className="text-sm text-gray-300">
        <span className="text-emerald-400 font-medium">Fix: </span>
        {fix}
      </p>
    </div>
  );
}
