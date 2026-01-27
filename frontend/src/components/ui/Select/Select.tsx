import { type SelectHTMLAttributes, forwardRef, useId } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: readonly SelectOption[];
  placeholder?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, className, id: externalId, ...rest }, ref) => {
    const autoId = useId();
    const id = externalId ?? autoId;
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className={[styles.field, className ?? ''].join(' ')}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.selectWrapper}>
          <select
            ref={ref}
            id={id}
            className={[styles.select, error ? styles.selectError : ''].join(' ')}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className={styles.chevron} aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        {error && (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
