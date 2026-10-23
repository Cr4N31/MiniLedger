export type ThemeMode = "light" | "dark";

export const themes = {
  light: {
    background: "#F4EBDD",
    surface: "#FFF9F0",
    surfaceMuted: "#E8DDCE",
    ink: "#28241F",
    muted: "#756B61",
    border: "#DED2C2",
    primary: "#8B3D32",
    primaryPressed: "#702F3B",
    accent: "#315B46",
    accentSurface: "#DCE7DA",
    danger: "#8B303B",
    dangerSurface: "#F0D9D7",
    warning: "#98633C",
    shadow: "#39281D",
  },
  dark: {
    background: "#181614",
    surface: "#24211F",
    surfaceMuted: "#302A27",
    ink: "#F4EBDD",
    muted: "#B7A99A",
    border: "#403833",
    primary: "#D9826D",
    primaryPressed: "#E7A18F",
    accent: "#9AB59A",
    accentSurface: "#283A2E",
    danger: "#F19A9A",
    dangerSurface: "#49282B",
    warning: "#E0B184",
    shadow: "#000000",
  },
} as const;

export const typography = {
  display: "Georgia",
  body: "System",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  section: 40,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export type ThemeColors = (typeof themes)[ThemeMode];

export const Colors = {
  light: {
    ...themes.light,
    backgroundElement: themes.light.surfaceMuted,
    text: themes.light.ink,
  },
  dark: {
    ...themes.dark,
    backgroundElement: themes.dark.surfaceMuted,
    text: themes.dark.ink,
  },
} as const;
