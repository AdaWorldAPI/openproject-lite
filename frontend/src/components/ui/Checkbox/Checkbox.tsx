import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate, className, id: externalId, ...rest }, ref) => {
    const autoId = useId();
    const id = externalId ?? autoId;

    return (
      <label htmlFor={id} className={[styles.wrapper, className ?? ''].join(' ')}>
        <input
          ref={(el) => {
            if (el) el.indeterminate = indeterminate ?? false;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          id={id}
          type="checkbox"
          className={styles.input}
          {...rest}
        />
        <span className={styles.check} aria-hidden="true">
          <svg viewBox="0 0 12 12" fill="none" className={styles.checkIcon}>
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg viewBox="0 0 12 12" fill="none" className={styles.indeterminateIcon}>
            <path d="M2 6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
