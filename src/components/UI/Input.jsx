export default function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-gray-400">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-gray-800 p-1 rounded"
      />
    </div>
  );
}