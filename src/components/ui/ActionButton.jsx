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
    className={className}
    disabled={disabled}
    onClick={onClick}
    {...buttonProps}
  >
    {children || label}
  </button>
);

export default ActionButton;
