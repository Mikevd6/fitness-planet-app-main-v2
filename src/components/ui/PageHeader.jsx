const PageHeader = ({ kicker, title, subtitle, actions, className = 'workout-header' }) => (
  <div className={className}>
    <div>
      {kicker && <p className="header-kicker">{kicker}</p>}
      <h1>{title}</h1>
      {subtitle && <p className="header-subtitle">{subtitle}</p>}
    </div>
    {actions && <div className="header-actions">{actions}</div>}
  </div>
);

export default PageHeader;
