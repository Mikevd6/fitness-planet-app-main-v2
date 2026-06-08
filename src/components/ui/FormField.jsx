const normalizeOption = (option) => (
  typeof option === 'string' ? { value: option, label: option } : option
);

const FormField = ({
  id,
  name = id,
  label,
  type = 'text',
  value,
  defaultValue,
  placeholder,
  error,
  onChange,
  options = [],
  rows = 3,
  disabled = false,
  required = false
}) => (
  <div className="form-group form-control">
    <label htmlFor={id}>{label}</label>
    {type === 'select' ? (
      <select
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        className={error ? 'error' : ''}
      >
        {options.map((option) => {
          const normalizedOption = normalizeOption(option);
          return (
            <option key={normalizedOption.value} value={normalizedOption.value}>
              {normalizedOption.label}
            </option>
          );
        })}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        onChange={onChange}
        disabled={disabled}
        className={error ? 'error' : ''}
      />
    ) : (
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={error ? 'error' : ''}
      />
    )}
    {error && <span className="error-text">{error}</span>}
  </div>
);

export default FormField;
