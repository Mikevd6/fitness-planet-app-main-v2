import ActionButton from './ActionButton';

const EmptyState = ({ icon, title, message, actionLabel, onAction, className = 'empty-state' }) => (
  <div className={className}>
    {icon && <div className="empty-icon">{icon}</div>}
    {title && <h3>{title}</h3>}
    {message && <p>{message}</p>}
    {actionLabel && onAction && (
      <ActionButton className="browse-recipes-btn" onClick={onAction} label={actionLabel} />
    )}
  </div>
);

export default EmptyState;
