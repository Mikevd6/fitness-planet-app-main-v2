import './PageHeader.css';

const PageHeader = ({
  kicker,
  title,
  subtitle,
  actions,
  className = 'workout-header',
  kickerClassName = 'header-kicker',
  subtitleClassName = 'header-subtitle'
}) => (
  <div className={className}>
    <div>
      {kicker && <p className={kickerClassName}>{kicker}</p>}
      <h1>{title}</h1>
      {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
    </div>
    {actions && <div className="header-actions">{actions}</div>}
  </div>
);

export default PageHeader;
