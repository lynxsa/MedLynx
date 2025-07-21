import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Theme Mode Types
export type ThemeMode = 'light' | 'dark';

// Enhanced Color Palette Interface
export interface ColorPalette {
  // Primary Brand Colors (LYNX Palette)
  primary: string;            // LYNXPurple: "#3726a6"
  primaryLight: string;       // LYNXLight: "#a096e7" (can be used as a lighter variant or secondary)
  primaryDark: string;        // A darker shade of LYNXPurple, or LYNXPurple itself if no darker variant needed.

  secondary: string;          // LYNXLight: "#a096e7" or LYNXMauve: "#E0B0FF"
  secondaryLight: string;     // Lighter shade of secondary
  secondaryDark: string;      // Darker shade of secondary

  accent: string;             // LYNXMauve: "#E0B0FF" or LYNXHelio: "#DF73FF" (for CTAs, highlights)
  accentLight: string;        // Lighter accent
  accentDark: string;         // Darker accent

  // Background Colors (Solid Colors Only)
  background: string;         // LYNXLightLavendar: "#F3E5F5" or LYNXLavender: "#E6E6FA" for light theme
  backgroundSecondary: string;  // Slightly different solid for secondary background areas
  backgroundTertiary: string;   // Another solid for tertiary background areas
  backgroundModal: string;      // Solid color for modal backgrounds

  // Surface Colors (Solid Colors Only - for elements on top of backgrounds)
  surface: string;            // Could be same as background or a slightly offset solid color
  surfaceSecondary: string;
  surfaceElevated: string;    // For elements that need to appear elevated, but still solid

  // Text Colors (Ensure High Contrast)
  text: string;               // Alias for textPrimary for backward compatibility
  textPrimary: string;
  textPrimarySecondary: string; // Alternative primary text color
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textOnPrimary: string;      // Text on LYNXPurple buttons (likely white or very light)
  textOnSecondary: string;    // Text on secondary colored elements
  textOnAccent: string;       // Text on accent colored elements
  textOnSurface: string;      // General text on surfaces
  placeholder: string;
  inputText: string;

  // Glassmorphism Colors (Subtle & Readable)
  glass: {
    background: string;       // Subtle, semi-transparent solid color based on LYNX palette
    border: string;           // Subtle border for glass elements
    // shadow: string;        // Shadow for glass elements (ensure subtlety) - consider removing if too noisy
    // backdrop: string;      // If needed for specific glass effects, ensure solid/subtle
  };

  // Utility Colors
  white: string;              // Pure white: "#FFFFFF"
  black: string;              // Pure black or near-black for text/elements if needed
  success: string;            // Standard success green, ensure it fits LYNX palette
  warning: string;            // Standard warning yellow/orange
  error: string;              // Standard error red
  info: string;               // Standard info blue or a LYNX palette neutral

  // Shadow Colors (Subtle, for depth if not using glass borders exclusively)
  shadow: {
    light: string;
    medium: string;
    heavy: string;
    // colored: string;       // Consider removing if not fitting the subtle/solid aesthetic
  };

  // Card and Component Specific Colors (Solid Backgrounds)
  card: {
    background: string;       // Solid color, possibly surface or a LYNX neutral
    border: string;           // LYNXThistle: "#D8BFD8" or similar for subtle borders
    // shadow: string;        // Subtle shadow for cards
  };
  cardSecondary: string;      // Solid color for secondary card types
  cardDisabled: string;       // Solid color for disabled cards
  border: string;             // General border color (e.g., LYNXThistle)
  inputBackground: string;    // Solid color for text inputs
  buttonSecondaryBackground: string; // Solid background for secondary buttons
  buttonDisabledBackground: string;
  buttonDisabledText: string;

  // Tab bar colors (Solid Backgrounds)
  tabBar: {
    background: string;
    activeBackground: string; // Can be a slightly different solid or same as bg with active tint
    activeTint: string;       // LYNXPurple or LYNXHelio
    inactiveTint: string;
    border: string;           // Subtle border for tab bar
  };

  // Health-focused Colors (Harmonized with LYNX Palette)
  healthGreen: string;
  healthRed: string;
  healthYellow: string;
  healthBlue: string;

  // Specific LYNX Palette Colors (direct access if needed, though semantic is preferred)
  LYNXPurple: string;
  LYNXLight: string;
  LYNXLavender: string;
  LYNXThistle: string;
  LYNXMauve: string;
  LYNXLightLavender: string; // Corrected typo: Lavendar -> Lavender
  LYNXHelio: string;
}

// LYNX Palette Definition
const LYNX_COLORS = {
  LYNXPurple: "#3726a6",
  LYNXLight: "#a096e7",
  LYNXLavender: "#E6E6FA",
  LYNXThistle: "#D8BFD8",
  LYNXMauve: "#E0B0FF",
  LYNXLightLavender: "#F3E5F5", // Corrected typo: Lavendar -> Lavender
  LYNXHelio: "#DF73FF",
  PureWhite: "#FFFFFF",
  NearBlack: "#1C1C1E", // For dark theme text or light theme primary text
  DarkerPurple: "#2A1B80", // Example darker shade for LYNXPurple
  LighterLavender: "#F7F5FF", // Even lighter for backgrounds
  DarkBackground: "#0A0518", // Much darker purple for dark theme background
  DarkSurface: "#150C2E",   // Darker purple for dark theme surfaces
  DarkText: "#F0F0F0",      // Light text for dark backgrounds
  DarkTextSecondary: "#B0A8D9", // Muted light text
};

// Light Theme Colors (LYNX Palette)
export const LightThemeColors: ColorPalette = {
  // LYNX Palette Direct Access
  LYNXPurple: LYNX_COLORS.LYNXPurple,
  LYNXLight: LYNX_COLORS.LYNXLight,
  LYNXLavender: LYNX_COLORS.LYNXLavender,
  LYNXThistle: LYNX_COLORS.LYNXThistle,
  LYNXMauve: LYNX_COLORS.LYNXMauve,
  LYNXLightLavender: LYNX_COLORS.LYNXLightLavender, // Corrected typo
  LYNXHelio: LYNX_COLORS.LYNXHelio,

  // Semantic Mapping
  primary: "#7C3AED", // Modern purple primary
  primaryLight: "#8B5CF6", // Light purple variant
  primaryDark: "#5B21B6", // Dark purple variant

  secondary: "#A855F7", // Purple secondary
  secondaryLight: "#C084FC", // Lighter purple
  secondaryDark: "#9333EA", // Darker purple secondary

  accent: "#DDD6FE", // Light purple accent
  accentLight: "#EDE9FE", // Very light purple
  accentDark: "#C4B5FD", // Medium purple accent

  background: LYNX_COLORS.PureWhite, // Pure white background like CareHub
  backgroundSecondary: LYNX_COLORS.LYNXLightLavender, // Very subtle lavender tint 
  backgroundTertiary: LYNX_COLORS.LYNXLavender, // Slightly more tinted
  backgroundModal: LYNX_COLORS.PureWhite,

  surface: LYNX_COLORS.PureWhite, // Cards and surfaces
  surfaceSecondary: LYNX_COLORS.LYNXLightLavender, // Corrected typo
  surfaceElevated: LYNX_COLORS.PureWhite, // With subtle shadow for elevation

  text: LYNX_COLORS.NearBlack, // Alias for textPrimary for backward compatibility
  textPrimary: LYNX_COLORS.NearBlack, // High contrast on light backgrounds
  textPrimarySecondary: "#2C2C2C", // Alternative primary text color - slightly lighter than NearBlack
  textSecondary: "#4A4A4A", // Dark gray
  textTertiary: "#757575", // Medium gray
  textDisabled: "#BDBDBD", // Light gray
  textOnPrimary: LYNX_COLORS.PureWhite,
  textOnSecondary: LYNX_COLORS.NearBlack, // If secondary is light
  textOnAccent: LYNX_COLORS.NearBlack,   // If accent is light, or white if accent is dark
  textOnSurface: LYNX_COLORS.NearBlack,
  placeholder: "#A0A0A0",
  inputText: LYNX_COLORS.NearBlack,

  glass: { // Subtle glass for cards, ensure text readability
    background: "rgba(243, 229, 245, 0.75)", // Semi-transparent LYNXLightLavender (color name updated), increased opacity slightly for readability
    border: "rgba(216, 191, 216, 0.6)",    // Semi-transparent LYNXThistle, increased opacity slightly
  },

  white: LYNX_COLORS.PureWhite,
  black: LYNX_COLORS.NearBlack,
  success: "#28A745", // Standard success green
  warning: "#FFC107", // Standard warning yellow
  error: "#DC3545",   // Standard error red
  info: "#17A2B8",    // Standard info blue

  shadow: { // Subtle shadows
    light: "rgba(0, 0, 0, 0.05)",
    medium: "rgba(0, 0, 0, 0.08)",
    heavy: "rgba(0, 0, 0, 0.12)",
  },

  card: {
    background: LYNX_COLORS.PureWhite, // Solid white cards
    border: LYNX_COLORS.LYNXThistle,   // Subtle thistle border
    // shadow: "rgba(0, 0, 0, 0.05)", // Optional subtle shadow
  },
  cardSecondary: LYNX_COLORS.LYNXLightLavender, // Corrected typo
  cardDisabled: "#EEEEEE",
  border: LYNX_COLORS.LYNXThistle,
  inputBackground: LYNX_COLORS.LYNXLavender, // Solid background for inputs
  buttonSecondaryBackground: LYNX_COLORS.LYNXLavender,
  buttonDisabledBackground: "#E0E0E0",
  buttonDisabledText: "#A0A0A0",

  tabBar: {
    background: LYNX_COLORS.PureWhite, // Solid white tab bar
    activeBackground: "#F3F4F6", // Light gray active background
    activeTint: "#7C3AED", // Purple active tint
    inactiveTint: "#757575", // Medium gray
    border: "#A855F7", // Purple border
  },

  // Health-focused Colors (Harmonized with LYNX Palette)
  healthGreen: "#3E9A70", // Muted SeaGreen, LYNX-friendly
  healthRed: "#D9534F",   // Softened, slightly desaturated red
  healthYellow: "#F0AD4E", // Softer orange-yellow
  healthBlue: "#5BC0DE",   // Info blue, leaning towards LYNX coolness

};

// Dark Theme Colors (LYNX Palette)
export const DarkThemeColors: ColorPalette = {
  // LYNX Palette Direct Access
  LYNXPurple: LYNX_COLORS.LYNXPurple,
  LYNXLight: LYNX_COLORS.LYNXLight,
  LYNXLavender: LYNX_COLORS.LYNXLavender,
  LYNXThistle: LYNX_COLORS.LYNXThistle,
  LYNXMauve: LYNX_COLORS.LYNXMauve,
  LYNXLightLavender: LYNX_COLORS.LYNXLightLavender, // Corrected typo
  LYNXHelio: LYNX_COLORS.LYNXHelio,

  // Semantic Mapping
  primary: LYNX_COLORS.LYNXLight, // Lighter purple for primary in dark mode for better contrast
  primaryLight: LYNX_COLORS.LYNXLavender,
  primaryDark: LYNX_COLORS.LYNXPurple,

  secondary: LYNX_COLORS.LYNXMauve, // Mauve as secondary
  secondaryLight: LYNX_COLORS.LYNXHelio, // Helio as lighter mauve/secondary variant
  secondaryDark: "#C080DF", // Darker Mauve

  accent: LYNX_COLORS.LYNXHelio, // Helio as main accent
  accentLight: "#F090FF", // Lighter Helio
  accentDark: LYNX_COLORS.LYNXMauve, // Mauve as darker Helio

  background: LYNX_COLORS.DarkBackground, //"#120C27" Deep purple/near black
  backgroundSecondary: LYNX_COLORS.DarkSurface, //"#1A1138" Slightly lighter
  backgroundTertiary: "#0F0920", // Even darker for depth if needed
  backgroundModal: LYNX_COLORS.DarkSurface,

  surface: LYNX_COLORS.DarkSurface, // Cards and surfaces
  surfaceSecondary: "#231A45", // Slightly different dark surface
  surfaceElevated: LYNX_COLORS.DarkSurface, // With subtle shadow/border for elevation

  text: LYNX_COLORS.DarkText, // Alias for textPrimary for backward compatibility
  textPrimary: LYNX_COLORS.DarkText, //"#F0F0F0" Light gray/off-white
  textPrimarySecondary: "#E0E0E0", // Alternative primary text color - slightly dimmer than DarkText
  textSecondary: LYNX_COLORS.DarkTextSecondary, //"#B0A8D9" Muted light purple/gray
  textTertiary: "#8A80B3", // Darker muted purple/gray
  textDisabled: "#6A6093",
  textOnPrimary: LYNX_COLORS.NearBlack, // Dark text on LYNXLight
  textOnSecondary: LYNX_COLORS.NearBlack, // Dark text on LYNXMauve
  textOnAccent: LYNX_COLORS.NearBlack,    // Dark text on LYNXHelio
  textOnSurface: LYNX_COLORS.DarkText,
  placeholder: "#7A70A3",
  inputText: LYNX_COLORS.DarkText,

  glass: { // Subtle glass for cards in dark mode
    background: "rgba(26, 17, 56, 0.8)", // Semi-transparent DarkSurface, increased opacity slightly
    border: "rgba(160, 150, 231, 0.35)",   // Semi-transparent LYNXLight (border for glass), increased opacity slightly
  },

  white: LYNX_COLORS.PureWhite,
  black: LYNX_COLORS.NearBlack,
  success: "#208837", // Darker success green
  warning: "#D9A406", // Darker warning yellow
  error: "#B82B3A",   // Darker error red
  info: "#138496",    // Darker info blue

  shadow: { // Shadows are less prominent in dark mode, can be more subtle or rely on borders
    light: "rgba(0, 0, 0, 0.15)",
    medium: "rgba(0, 0, 0, 0.25)",
    heavy: "rgba(0, 0, 0, 0.35)",
  },

  card: {
    background: LYNX_COLORS.DarkSurface, // Solid dark surface for cards
    border: LYNX_COLORS.LYNXLight,       // LYNXLight as a contrasting border
    // shadow: "rgba(0, 0, 0, 0.1)",    // Optional subtle shadow
  },
  cardSecondary: "#231A45",
  cardDisabled: "#2A2050",
  border: LYNX_COLORS.LYNXLight, // LYNXLight or a muted variant for general borders
  inputBackground: "#231A45", // Solid dark background for inputs
  buttonSecondaryBackground: "#231A45",
  buttonDisabledBackground: "#2A2050",
  buttonDisabledText: "#6A6093",

  tabBar: {
    background: LYNX_COLORS.DarkBackground, // Solid dark tab bar
    activeBackground: LYNX_COLORS.DarkSurface, // Subtle active bg
    activeTint: LYNX_COLORS.LYNXHelio, // Bright accent for active tab
    inactiveTint: LYNX_COLORS.DarkTextSecondary, // Muted for inactive
    border: LYNX_COLORS.DarkSurface, // Or a very subtle lighter border
  },

  // Health-focused Colors (Harmonized with LYNX Palette - Dark Theme)
  healthGreen: "#2F7B5A",  // Darker, muted SeaGreen
  healthRed: "#B4423F",    // Darker, desaturated red
  healthYellow: "#D08C3D", // Darker, softer orange-yellow
  healthBlue: "#46A8C2",   // Darker info blue, LYNX-friendly
};


// Gradient Definitions
// IMPORTANT: Gradients should be used sparingly and primarily for non-background elements
// such as small accents, button fills, or specific decorative states.
// The primary design principle is "Solid Backgrounds Only" for main UI elements like screen backgrounds,
// cards, and large containers to ensure optimal readability and a clean, professional aesthetic.
// If considering a gradient for a background, evaluate if a solid color or subtle texture would be more appropriate.
export interface GradientPalette { // Added export
  primary: readonly [string, string];
  secondary: readonly [string, string];
  accent: readonly [string, string];
  // ... other gradients if needed, ensure they are not for backgrounds
  glassButton?: readonly [string, string]; // Example for a glass button fill
}

export const LightGradients: GradientPalette = {
  primary: [LightThemeColors.primaryLight, LightThemeColors.primary] as const,
  secondary: [LightThemeColors.secondaryLight, LightThemeColors.secondary] as const,
  accent: [LightThemeColors.accentLight, LightThemeColors.accent] as const,
  glassButton: ["rgba(220, 210, 250, 0.8)", "rgba(200, 190, 240, 0.6)"] as const, // Example
};

export const DarkGradients: GradientPalette = {
  primary: [DarkThemeColors.primaryLight, DarkThemeColors.primary] as const,
  secondary: [DarkThemeColors.secondaryLight, DarkThemeColors.secondary] as const,
  accent: [DarkThemeColors.accentLight, DarkThemeColors.accent] as const,
  glassButton: ["rgba(40, 30, 70, 0.8)", "rgba(60, 50, 90, 0.6)"] as const, // Example
};

// Typography (same for both themes, unless LYNX specific fonts are introduced)
export const Typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// Spacing (same for both themes)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Screen Dimensions
export const ScreenDimensions = {
  width,
  height,
  isSmallScreen: width < 375,
  isMediumScreen: width >= 375 && width < 414,
  isLargeScreen: width >= 414,
};

// Animation Durations
export const AnimationDurations = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

// Theme Interface
export interface Theme {
  mode: ThemeMode;
  colors: ColorPalette;
  gradients: GradientPalette; // Keep for non-background uses or remove if fully disallowed
  typography: typeof Typography;
  spacing: typeof Spacing;
  screen: typeof ScreenDimensions;
  animation: typeof AnimationDurations;
  glass: { // Styles for glass components
    card: any;
    cardLarge: any;
    button?: any; // Optional glass button style
  };
  components: { // Styles for common components
    header: any;
    card: any; // Default solid card
    button: any; // Default solid button
  };
}

// Create Glass Styles based on LYNX colors (Subtle & Readable)
const createGlassStyles = (colors: ColorPalette) => ({
  card: {
    backgroundColor: colors.glass.background, // LYNX-based semi-transparent solid
    borderRadius: 16, // Consistent with iOS feel
    borderWidth: 1.5, // Slightly thicker for better definition if needed
    borderColor: colors.glass.border, // Subtle LYNX-based border
    // iOS-like subtle shadow for depth if desired, otherwise border might be enough
    shadowColor: colors.shadow.light, // Very subtle shadow
    shadowOffset: { width: 0, height: 2 }, // Adjusted for a bit more depth
    shadowOpacity: 0.12, // Very subtle, slightly increased
    shadowRadius: 4,    // Soft blur, slightly increased
    elevation: 4,       // Android fallback, slightly increased
  },
  cardLarge: {
    backgroundColor: colors.glass.background,
    borderRadius: 20,
    borderWidth: 1.5, // Slightly thicker
    borderColor: colors.glass.border,
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 3 }, // Adjusted
    shadowOpacity: 0.18, // Slightly increased
    shadowRadius: 6,    // Slightly increased
    elevation: 6,       // Slightly increased
  },
  // Optional: Glass button style if needed for specific CTAs and allowed
  button: {
    backgroundColor: colors.glass.background, // More opaque for readability
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
     shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  }
});

// Create Component Styles based on LYNX colors (Solid Backgrounds, iOS Feel)
const createComponentStyles = (colors: ColorPalette, glassStyles: ReturnType<typeof createGlassStyles>, themeMode: ThemeMode) => ({
  header: { // Example for a top navigation bar
    height: 56, // Typical iOS nav bar height
    backgroundColor: themeMode === 'light' ? colors.surface : colors.surfaceSecondary, // Solid, often slightly off-main-bg
    borderBottomWidth: themeMode === 'light' ? 1 : 0, // Subtle separator for light mode
    borderBottomColor: colors.border,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // For title and buttons
    shadowColor: colors.shadow.light, // Very subtle shadow for elevation
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: themeMode === 'light' ? 0.1 : 0, // No shadow or very subtle for dark
    shadowRadius: 0, // Flat look, or minimal blur
    elevation: themeMode === 'light' ? 2 : 0,
  },
  card: { // Default solid card
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    backgroundColor: colors.card.background, // Solid LYNX color
    borderRadius: 12, // Rounded corners, iOS style
    borderWidth: 1,
    borderColor: colors.card.border, // Subtle LYNX border
    // shadowColor: colors.shadow.light, // Subtle shadow for depth
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    // elevation: 2,
  },
  button: { // Default solid button styles
    primary: {
      backgroundColor: colors.primary, // LYNXPurple or LYNXLight (dark mode)
      borderRadius: 10, // iOS like rounded corners
      paddingVertical: Spacing.md - 2,
      paddingHorizontal: Spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      // shadowColor: colors.shadow.medium, // Subtle shadow for buttons
      // shadowOffset: { width: 0, height: 2 },
      // shadowOpacity: 0.15,
      // shadowRadius: 3,
      // elevation: 3,
    },
    secondary: {
      backgroundColor: colors.buttonSecondaryBackground, // LYNX palette secondary button bg
      borderRadius: 10,
      paddingVertical: Spacing.md - 2,
      paddingHorizontal: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.primary, // Border with primary color
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: {
      backgroundColor: colors.buttonDisabledBackground,
      borderRadius: 10,
      paddingVertical: Spacing.md - 2,
      paddingHorizontal: Spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // If glass buttons are used, they can be defined here or use glassStyles.button
    glass: glassStyles.button ? {
      ...glassStyles.button // Spread if defined
    } : undefined,
  },
});

// Create Light Theme with LYNX Palette
export const createLightTheme = (): Theme => {
  const glassStyles = createGlassStyles(LightThemeColors);
  const componentStyles = createComponentStyles(LightThemeColors, glassStyles, 'light');
  
  return {
    mode: 'light',
    colors: LightThemeColors,
    gradients: LightGradients, // Review usage
    typography: Typography,
    spacing: Spacing,
    screen: ScreenDimensions,
    animation: AnimationDurations,
    glass: glassStyles,
    components: componentStyles,
  };
};

// Create Dark Theme with LYNX Palette
export const createDarkTheme = (): Theme => {
  const glassStyles = createGlassStyles(DarkThemeColors);
  const componentStyles = createComponentStyles(DarkThemeColors, glassStyles, 'dark');
  
  return {
    mode: 'dark',
    colors: DarkThemeColors,
    gradients: DarkGradients, // Review usage
    typography: Typography,
    spacing: Spacing,
    screen: ScreenDimensions,
    animation: AnimationDurations,
    glass: glassStyles,
    components: componentStyles,
  };
};

// Default themes
export const LightTheme = createLightTheme();
export const DarkTheme = createDarkTheme();

// Theme utilities
export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'dark' ? DarkTheme : LightTheme;
};

// Make sure ThemeMode is exported if not already
// export type ThemeMode = 'light' | 'dark'; // Already at the top

export default {
  Light: LightTheme,
  Dark: DarkTheme,
  getTheme,
  LYNX_COLORS, // Exporting LYNX_COLORS for direct use if absolutely necessary
};
