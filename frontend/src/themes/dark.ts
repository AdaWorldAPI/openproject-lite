import type { Theme } from './tokens';

export const darkTheme: Theme = {
  name: 'Dark',
  colors: {
    primary: '#4A9FD4',
    primaryHover: '#5DB0E0',
    primaryActive: '#3A8FC4',
    onPrimary: '#FFFFFF',
    success: '#4BD955',
    successHover: '#3FC94A',
    warning: '#F0B856',
    warningHover: '#E0A846',
    danger: '#E04444',
    dangerHover: '#D03838',
    background: '#1A1A1A',
    surface: '#2A2A2A',
    surfaceRaised: '#333333',
    border: '#404040',
    borderFocus: '#4A9FD4',
    text: '#E0E0E0',
    textMuted: '#999999',
    textDisabled: '#666666',
    textInverse: '#1A1A1A',
  },
  typography: {
    fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
};
