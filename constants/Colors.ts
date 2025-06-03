/**
 * MediNex 2 - Modern Color Theme
 * Updated: June 2025
 * A sleek and modern color palette for the MediNex 2 app
 */

// Primary color - Royal Purple
const primaryLight = '#6C63FF';
const primaryDark = '#8F88FF';

// Secondary color - Teal
const secondaryLight = '#00C9B7';
const secondaryDark = '#00E5D0';

// Accent color - Coral
const accentLight = '#FF6B6B';
const accentDark = '#FF8A8A';

export const Colors = {
  light: {
    text: '#2D3748',
    background: '#FFFFFF',
    tint: primaryLight,
    icon: '#718096',
    tabIconDefault: '#A0AEC0',
    tabIconSelected: primaryLight,
    primary: primaryLight,
    secondary: secondaryLight,
    accent: accentLight,
    success: '#48BB78',
    warning: '#F6AD55',
    error: '#F56565',
    card: '#F7FAFC',
    border: '#E2E8F0',
  },
  dark: {
    text: '#F7FAFC',
    background: '#1A202C',
    tint: primaryDark,
    icon: '#A0AEC0',
    tabIconDefault: '#718096',
    tabIconSelected: primaryDark,
    primary: primaryDark,
    secondary: secondaryDark,
    accent: accentDark,
    success: '#68D391',
    warning: '#FBD38D',
    error: '#FC8181',
    card: '#2D3748',
    border: '#4A5568',
  },
};
