import React from 'react';
import { SlideData, Theme, SlideTheme } from './types';

// Banking-specific theme presets - same as in ThemeSelector
const THEMES: {[key: string]: Theme} = {
  professional: {
    id: 'professional',
    name: 'Professional',
    primary: '#1a365d',
    secondary: '#2c5282',
    accent: '#3182ce',
    background: '#ffffff',
    text: '#2d3748',
    headingFont: 'Montserrat',
    bodyFont: 'Inter'
  },
  conservative: {
    id: 'conservative',
    name: 'Conservative Blue',
    primary: '#0f3460',
    secondary: '#1a508b',
    accent: '#3498db',
    background: '#f8fafc',
    text: '#1a202c',
    headingFont: 'Georgia',
    bodyFont: 'Lato'
  },
  modern: {
    id: 'modern',
    name: 'Modern Corporate',
    primary: '#2c3e50',
    secondary: '#34495e',
    accent: '#3498db',
    background: '#ecf0f1',
    text: '#2c3e50',
    headingFont: 'Poppins',
    bodyFont: 'Open Sans'
  },
  wealth: {
    id: 'wealth',
    name: 'Wealth Management',
    primary: '#2d3436',
    secondary: '#636e72',
    accent: '#b8860b',
    background: '#f9f9f9',
    text: '#2d3436',
    headingFont: 'Playfair Display',
    bodyFont: 'Roboto'
  },
  premium: {
    id: 'premium',
    name: 'Premium Banking',
    primary: '#2c2c54',
    secondary: '#474787',
    accent: '#706fd3',
    background: '#f7f7f7',
    text: '#2c2c54',
    headingFont: 'Montserrat',
    bodyFont: 'Nunito'
  },
  'tech-finance': {
    id: 'tech-finance',
    name: 'Fintech',
    primary: '#2f3542',
    secondary: '#57606f',
    accent: '#5352ed',
    background: '#f1f2f6',
    text: '#2f3542',
    headingFont: 'Raleway',
    bodyFont: 'Source Sans Pro'
  }
};

interface ThemeApplierProps {
  slide: SlideData;
  children: React.ReactNode;
}

export function getThemeStyles(slideTheme?: SlideTheme): Theme {
  if (!slideTheme) {
    return THEMES.professional; // Default theme
  }
  
  // Get base theme
  const baseTheme = THEMES[slideTheme.themeId] || THEMES.professional;
  
  // Apply any custom overrides
  return {
    ...baseTheme,
    ...(slideTheme.customColors ? {
      primary: slideTheme.customColors.primary || baseTheme.primary,
      secondary: slideTheme.customColors.secondary || baseTheme.secondary,
      accent: slideTheme.customColors.accent || baseTheme.accent,
      background: slideTheme.customColors.background || baseTheme.background,
      text: slideTheme.customColors.text || baseTheme.text,
    } : {}),
    ...(slideTheme.customFonts ? {
      headingFont: slideTheme.customFonts.heading || baseTheme.headingFont,
      bodyFont: slideTheme.customFonts.body || baseTheme.bodyFont,
    } : {})
  };
}

export function ThemeApplier({ slide, children }: ThemeApplierProps) {
  const theme = getThemeStyles(slide.theme);
  
  return (
    <div
      style={{
        '--theme-primary': theme.primary,
        '--theme-secondary': theme.secondary,
        '--theme-accent': theme.accent,
        '--theme-background': theme.background,
        '--theme-text': theme.text,
        '--theme-heading-font': theme.headingFont,
        '--theme-body-font': theme.bodyFont
      } as React.CSSProperties}
      className="theme-container"
    >
      {children}
    </div>
  );
}

export default ThemeApplier; 