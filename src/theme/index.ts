const commonTokens = {
  spacing: {
    xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32,
    'margin-mobile': 20, 'margin-tablet': 32, gutter: 16, base: 4,
  },
  radius: { sm: 8, md: 16, lg: 24, full: 9999 },
  shadows: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  },
  typography: {
    'display-lg': { fontSize: 34, lineHeight: 41, letterSpacing: -0.02, fontWeight: '700' },
    'display-lg-mobile': { fontSize: 28, lineHeight: 34, letterSpacing: -0.01, fontWeight: '700' },
    'headline-md': { fontSize: 22, lineHeight: 28, fontWeight: '600' },
    'title-lg': { fontSize: 20, lineHeight: 25, fontWeight: '600' },
    'body-lg': { fontSize: 17, lineHeight: 22, fontWeight: '400' },
    'body-md': { fontSize: 15, lineHeight: 20, fontWeight: '400' },
    'label-md': { fontSize: 13, lineHeight: 18, letterSpacing: 0.01, fontWeight: '500' },
    'label-sm': { fontSize: 11, lineHeight: 13, letterSpacing: 0.06, fontWeight: '600' },
  }
};

export const lightTheme = {
  ...commonTokens,
  colors: {
    primary: '#0058bc', 'on-primary': '#ffffff',
    'primary-container': '#0070eb', 'on-primary-container': '#fefcff',
    secondary: '#006e28', 'on-secondary': '#ffffff', 'secondary-container': '#6ffb85',
    tertiary: '#8a2bb9',
    background: '#fcf8fb', surface: '#fcf8fb',
    'surface-dim': '#dcd9dc', 'surface-variant': '#e4e2e4',
    'on-surface': '#1b1b1d', 'on-surface-variant': '#414755',
    outline: '#717786', 'outline-variant': '#c1c6d7',
    error: '#ba1a1a', 'on-error': '#ffffff',
    'status-pending': '#FF9500', 'status-skipped': '#FF3B30',
    'status-taken': '#34C759', 'status-rescheduled': '#5856D6',
  }
};

export const darkTheme = {
  ...commonTokens,
  colors: {
    primary: '#a2c9ff', 'on-primary': '#002e69',
    'primary-container': '#004494', 'on-primary-container': '#d3e3ff',
    secondary: '#4ed95e', 'on-secondary': '#00390f', 'secondary-container': '#00531c',
    tertiary: '#d5aeff',
    background: '#1b1b1d', surface: '#1b1b1d',
    'surface-dim': '#313033', 'surface-variant': '#474649',
    'on-surface': '#e3e2e6', 'on-surface-variant': '#c6c6ca',
    outline: '#8e8e93', 'outline-variant': '#474649',
    error: '#ffb4ab', 'on-error': '#690005',
    'status-pending': '#FFB347', 'status-skipped': '#FF6B6B',
    'status-taken': '#77DD77', 'status-rescheduled': '#A78BFA',
  }
};
