export function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="score-card">
      <div className="score-value">{value}</div>
      <div className="score-label">{label}</div>
      <div className="score-track">
        <div
          className="score-fill"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
