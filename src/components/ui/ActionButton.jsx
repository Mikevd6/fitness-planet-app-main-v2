import './ActionButton.css';

const ActionButton = ({
  children,
  label,
  type = 'button',
  className = '',
  disabled = false,
  onClick,
  ...buttonProps
}) => (
  <button
    type={type}
    className={`action-button ${className}`.trim()}
    disabled={disabled}
    onClick={onClick}
    {...buttonProps}
  >
    {children || label}
  </button>
);

export default ActionButton;
