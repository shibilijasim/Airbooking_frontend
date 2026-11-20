import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  uppercase?: boolean;
  compact?: boolean;
}

export function FormInput({
  label,
  uppercase = false,
  compact = false,
  className = '',
  ...props
}: FormInputProps) {
  const paddingClass = compact ? 'p-2' : 'p-2.5';
  const caseClass = uppercase ? 'uppercase' : '';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        className={`w-full ${paddingClass} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${caseClass} ${className}`.trim()}
      />
    </div>
  );
}

export interface SelectOption {
  label: string;
  value: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  compact?: boolean;
}

export function FormSelect({
  label,
  options,
  compact = false,
  className = '',
  ...props
}: FormSelectProps) {
  const paddingClass = compact ? 'p-2' : 'p-2.5';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        {...props}
        className={`w-full ${paddingClass} border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none ${className}`.trim()}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}