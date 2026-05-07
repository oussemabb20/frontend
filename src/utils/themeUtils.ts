/**
 * THEME UTILITIES
 * 
 * Helper functions to generate theme-aware styles using CSS variables.
 * These utilities ensure consistent layout across themes by only affecting colors.
 */

/**
 * Get border style with consistent width across themes
 * @param variant - The border variant (primary, secondary, focus, etc.)
 * @returns CSS border string with consistent 1px width
 */
export const getBorder = (variant: 'primary' | 'secondary' | 'focus' | 'error' | 'success' = 'primary'): string => {
  const colorMap = {
    primary: 'var(--border-primary)',
    secondary: 'var(--border-secondary)',
    focus: 'var(--border-focus)',
    error: 'var(--border-error)',
    success: 'var(--border-success)',
  };
  
  return `1px solid ${colorMap[variant]}`;
};

/**
 * Get background gradient
 * @param variant - The gradient variant
 * @returns CSS gradient string
 */
export const getGradient = (variant: 'navbar' | 'sidenav' | 'card' | 'surface' | 'primary' | 'info'): string => {
  const gradientMap = {
    navbar: 'var(--gradient-navbar)',
    sidenav: 'var(--gradient-sidenav)',
    card: 'var(--gradient-card)',
    surface: 'var(--gradient-surface)',
    primary: 'var(--gradient-primary)',
    info: 'var(--gradient-info)',
  };
  
  return gradientMap[variant];
};

/**
 * Get box shadow
 * @param size - The shadow size
 * @returns CSS box-shadow string
 */
export const getShadow = (size: 'sm' | 'md' | 'lg' | 'xl' | 'focus' = 'md'): string => {
  const shadowMap = {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    focus: 'var(--shadow-focus)',
  };
  
  return shadowMap[size];
};

/**
 * Get text color
 * @param variant - The text color variant
 * @returns CSS color string
 */
export const getTextColor = (variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary'): string => {
  const colorMap = {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    tertiary: 'var(--text-tertiary)',
    inverse: 'var(--text-inverse)',
  };
  
  return colorMap[variant];
};

/**
 * Get background color
 * @param variant - The background color variant
 * @returns CSS color string
 */
export const getBackgroundColor = (variant: 'primary' | 'secondary' | 'tertiary' | 'surface' | 'elevated' | 'overlay' = 'primary'): string => {
  const colorMap = {
    primary: 'var(--bg-primary)',
    secondary: 'var(--bg-secondary)',
    tertiary: 'var(--bg-tertiary)',
    surface: 'var(--bg-surface)',
    elevated: 'var(--bg-elevated)',
    overlay: 'var(--bg-overlay)',
  };
  
  return colorMap[variant];
};

/**
 * Get brand color
 * @param variant - The brand color variant
 * @param hover - Whether to get the hover variant
 * @returns CSS color string
 */
export const getBrandColor = (
  variant: 'primary' | 'info' | 'success' | 'warning' | 'error',
  hover: boolean = false
): string => {
  const colorMap = {
    primary: hover ? 'var(--color-primary-hover)' : 'var(--color-primary)',
    info: hover ? 'var(--color-info-hover)' : 'var(--color-info)',
    success: hover ? 'var(--color-success-hover)' : 'var(--color-success)',
    warning: hover ? 'var(--color-warning-hover)' : 'var(--color-warning)',
    error: hover ? 'var(--color-error-hover)' : 'var(--color-error)',
  };
  
  return colorMap[variant];
};

/**
 * Get input styles with consistent layout
 * @returns Object with input style properties
 */
export const getInputStyles = () => ({
  backgroundColor: 'var(--input-bg)',
  color: 'var(--input-text)',
  border: '1px solid var(--input-border)',
  '&:hover': {
    borderColor: 'var(--input-border-hover)',
  },
  '&.Mui-focused': {
    borderColor: 'var(--input-border-focus)',
    borderWidth: '2px',
  },
});

/**
 * Get card styles with consistent layout
 * @returns Object with card style properties
 */
export const getCardStyles = () => ({
  background: getGradient('card'),
  border: getBorder('primary'),
  boxShadow: getShadow('md'),
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-lg)',
});

/**
 * Get surface styles (for panels, containers, etc.)
 * @returns Object with surface style properties
 */
export const getSurfaceStyles = () => ({
  background: getGradient('surface'),
  border: getBorder('secondary'),
  boxShadow: getShadow('sm'),
  borderRadius: 'var(--radius-lg)',
});

/**
 * Get button styles with consistent layout
 * @param variant - The button variant
 * @returns Object with button style properties
 */
export const getButtonStyles = (variant: 'primary' | 'secondary' | 'outlined' = 'primary') => {
  const baseStyles = {
    padding: '10px 20px',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-semibold)',
    borderRadius: 'var(--radius-md)',
    transition: 'var(--transition-base)',
  };

  const variantStyles = {
    primary: {
      background: getBrandColor('primary'),
      color: getTextColor('inverse'),
      border: 'none',
      boxShadow: getShadow('sm'),
      '&:hover': {
        background: getBrandColor('primary', true),
        boxShadow: getShadow('md'),
      },
    },
    secondary: {
      background: getBackgroundColor('tertiary'),
      color: getTextColor('primary'),
      border: getBorder('primary'),
      '&:hover': {
        background: getBackgroundColor('elevated'),
      },
    },
    outlined: {
      background: 'transparent',
      color: getBrandColor('primary'),
      border: getBorder('primary'),
      '&:hover': {
        background: getBackgroundColor('tertiary'),
      },
    },
  };

  return {
    ...baseStyles,
    ...variantStyles[variant],
  };
};

/**
 * Get table styles with consistent layout
 * @returns Object with table style properties
 */
export const getTableStyles = () => ({
  border: getBorder('primary'),
  background: getBackgroundColor('surface'),
  '& .MuiTableHead-root': {
    backgroundColor: getBackgroundColor('tertiary'),
    '& .MuiTableCell-root': {
      color: getTextColor('primary'),
      fontWeight: 'var(--font-weight-bold)',
      borderBottom: getBorder('secondary'),
    },
  },
  '& .MuiTableBody-root': {
    '& .MuiTableCell-root': {
      color: getTextColor('primary'),
      borderBottom: getBorder('secondary'),
    },
    '& .MuiTableRow-root:hover': {
      backgroundColor: getBackgroundColor('tertiary'),
    },
  },
});

/**
 * Get consistent spacing value
 * @param size - The spacing size
 * @returns CSS spacing value
 */
export const getSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'): string => {
  const spacingMap = {
    xs: 'var(--space-xs)',
    sm: 'var(--space-sm)',
    md: 'var(--space-md)',
    lg: 'var(--space-lg)',
    xl: 'var(--space-xl)',
    '2xl': 'var(--space-2xl)',
  };
  
  return spacingMap[size];
};

/**
 * Get consistent border radius
 * @param size - The radius size
 * @returns CSS border-radius value
 */
export const getBorderRadius = (size: 'sm' | 'md' | 'lg' | 'xl' | 'full'): string => {
  const radiusMap = {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    full: 'var(--radius-full)',
  };
  
  return radiusMap[size];
};

/**
 * Get consistent font size
 * @param size - The font size
 * @returns CSS font-size value
 */
export const getFontSize = (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'): string => {
  const sizeMap = {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
    '4xl': 'var(--font-size-4xl)',
  };
  
  return sizeMap[size];
};

/**
 * Get consistent font weight
 * @param weight - The font weight
 * @returns CSS font-weight value
 */
export const getFontWeight = (weight: 'normal' | 'medium' | 'semibold' | 'bold'): string => {
  const weightMap = {
    normal: 'var(--font-weight-normal)',
    medium: 'var(--font-weight-medium)',
    semibold: 'var(--font-weight-semibold)',
    bold: 'var(--font-weight-bold)',
  };
  
  return weightMap[weight];
};
