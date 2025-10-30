// UI-related types

export interface ThemeButtonStyle {
  background: string;
  border: string;
  borderRadius: string;
  color: string;
  fontFamily: string;
  textTransform?: 'none' | 'lowercase' | 'uppercase';
  letterSpacing?: string;
  fontWeight?: string | number;
  fontSize?: string;
  textShadow: string;
  boxShadow: string;
  textDecoration?: string;
  textUnderlineOffset?: string;
  padding?: string;
  minHeight?: string;
  lineHeight?: string;
  borderLeft?: string;
  paddingLeft?: string;
  position?: 'relative';
  opacity?: number;
  cursor?: string;
  outline?: string;
}

export interface ThemePanelStyle {
  background: string;
  border: string;
  borderRadius: string;
  boxShadow: string;
  backdropFilter: string;
  backgroundImage?: string;
  backgroundSize?: string;
}

export interface ThemeHeaderStyle {
  background: string;
  border: string;
  borderRadius: string;
  color: string;
  fontFamily: string;
  fontWeight: string | number;
  letterSpacing: string;
  textShadow: string;
  boxShadow: string;
  padding?: string;
  marginBottom?: string;
  textTransform?: 'none' | 'lowercase' | 'uppercase';
  fontSize?: string;
}

export interface Theme {
  name: string;
  panel: ThemePanelStyle;
  header: ThemeHeaderStyle;
  button: (active: boolean, type?: string) => ThemeButtonStyle;
  clear: ThemeButtonStyle;
  autoButton: (active: boolean, enabled: boolean) => ThemeButtonStyle;
  optionButton: (active: boolean) => ThemeButtonStyle;
}

export interface PanelPosition {
  x: number;
  y: number;
}

export interface PanelDimensions {
  width: number;
  height: number;
}
