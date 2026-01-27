export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  onPrimary: string;
  success: string;
  successHover: string;
  warning: string;
  warningHover: string;
  danger: string;
  dangerHover: string;
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  borderFocus: string;
  text: string;
  textMuted: string;
  textDisabled: string;
  textInverse: string;
}

export interface ThemeTypography {
  fontFamily: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
}

const CSS_VAR_MAP: Record<keyof ThemeColors, string> = {
  primary: '--color-primary',
  primaryHover: '--color-primary-hover',
  primaryActive: '--color-primary-active',
  onPrimary: '--color-on-primary',
  success: '--color-success',
  successHover: '--color-success-hover',
  warning: '--color-warning',
  warningHover: '--color-warning-hover',
  danger: '--color-danger',
  dangerHover: '--color-danger-hover',
  background: '--color-background',
  surface: '--color-surface',
  surfaceRaised: '--color-surface-raised',
  border: '--color-border',
  borderFocus: '--color-border-focus',
  text: '--color-text',
  textMuted: '--color-text-muted',
  textDisabled: '--color-text-disabled',
  textInverse: '--color-text-inverse',
};

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  // Remove data-theme to reset, then apply custom properties
  root.removeAttribute('data-theme');

  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    const value = theme.colors[key as keyof ThemeColors];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }

  if (theme.typography.fontFamily) {
    root.style.setProperty('--font-family', theme.typography.fontFamily);
  }
}

export function applyBuiltInTheme(name: 'light' | 'dark'): void {
  const root = document.documentElement;

  // Clear any inline overrides
  for (const cssVar of Object.values(CSS_VAR_MAP)) {
    root.style.removeProperty(cssVar);
  }
  root.style.removeProperty('--font-family');

  if (name === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }
}
