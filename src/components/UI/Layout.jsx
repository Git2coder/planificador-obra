export function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      {children}
    </div>
  );
}

export function Card({ title, value, highlight }) {
  return (
    <div className={`p-4 rounded-xl bg-gray-800 ${highlight ? "border border-blue-500" : ""}`}>
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}