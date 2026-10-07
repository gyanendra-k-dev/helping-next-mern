function StatCard({ icon, label, value, delta, tile = "tile-1" }) {
  return (
    <div className="stat-card">
      <div>
        <h3>{value}</h3>
        <p>{label}</p>
        {delta && (
          <div className={`delta ${delta.startsWith("-") ? "down" : "up"}`}>
            {delta} this month
          </div>
        )}
      </div>
      <div className={`stat-card-icon ${tile}`} style={{ color: "#fff" }}>
        {icon}
      </div>
    </div>
  );
}

export default StatCard;
