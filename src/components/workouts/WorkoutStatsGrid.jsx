const WorkoutStatsGrid = ({ stats, className = 'stats-grid', cardClassName = 'stat-card' }) => (
  <div className={className}>
    {stats.map((stat) => (
      <div key={stat.label} className={cardClassName}>
        <p className="stat-label">{stat.label}</p>
        <p className="stat-value">{stat.value}</p>
        {stat.detail && <p className="stat-detail">{stat.detail}</p>}
      </div>
    ))}
  </div>
);

export default WorkoutStatsGrid;
