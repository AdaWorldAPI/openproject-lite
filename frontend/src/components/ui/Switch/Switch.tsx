import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import styles from './Switch.module.css';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, id: externalId, ...rest }, ref) => {
    const autoId = useId();
    const id = externalId ?? autoId;

    return (
      <label htmlFor={id} className={[styles.wrapper, className ?? ''].join(' ')}>
        <input ref={ref} id={id} type="checkbox" role="switch" className={styles.input} {...rest} />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
