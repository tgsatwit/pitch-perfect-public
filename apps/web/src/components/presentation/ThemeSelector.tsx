import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ThemeOption {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  headingFont: string;
  bodyFont: string;
}

export interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
  onFontChange: (fontType: 'heading' | 'body', font: string) => void;
}

// Banking-specific theme presets
const THEMES: ThemeOption[] = [
  {
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
  {
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
  {
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
  {
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
  {
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
  {
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
];

const FONTS = {
  heading: [
    'Montserrat',
    'Georgia',
    'Poppins',
    'Playfair Display',
    'Raleway',
    'Times New Roman',
    'Arial',
    'Helvetica'
  ],
  body: [
    'Inter', 
    'Lato', 
    'Open Sans', 
    'Roboto', 
    'Nunito', 
    'Source Sans Pro',
    'Arial',
    'Georgia'
  ]
};

export function ThemeSelector({ currentTheme, onThemeChange, onFontChange }: ThemeSelectorProps) {
  const selectedTheme = THEMES.find(theme => theme.id === currentTheme) || THEMES[0];
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Theme Options</h3>
      
      {/* Theme select */}
      <RadioGroup 
        value={currentTheme} 
        onValueChange={onThemeChange}
        className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto"
      >
        {THEMES.map((theme) => (
          <div key={theme.id} className="flex items-center space-x-2">
            <RadioGroupItem value={theme.id} id={`theme-${theme.id}`} />
            <Label htmlFor={`theme-${theme.id}`} className="cursor-pointer flex items-center">
              <div 
                className="w-6 h-6 rounded mr-2" 
                style={{ background: theme.primary }} 
              />
              <span className="flex-1">{theme.name}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        {/* Color preview */}
        <div className="col-span-2 flex justify-between gap-1 mb-2">
          <div 
            className="w-8 h-8 rounded-full border" 
            style={{ background: selectedTheme.primary }} 
            title="Primary"
          />
          <div 
            className="w-8 h-8 rounded-full border" 
            style={{ background: selectedTheme.secondary }} 
            title="Secondary"
          />
          <div 
            className="w-8 h-8 rounded-full border" 
            style={{ background: selectedTheme.accent }} 
            title="Accent"
          />
          <div 
            className="w-8 h-8 rounded-full border" 
            style={{ background: selectedTheme.background }} 
            title="Background"
          />
          <div 
            className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs"
            style={{ background: selectedTheme.background, color: selectedTheme.text }} 
            title="Text"
          >
            T
          </div>
        </div>
        
        {/* Font selectors */}
        <div className="col-span-2 space-y-2">
          <div>
            <Label htmlFor="heading-font" className="mb-1 block text-xs">Heading Font</Label>
            <Select 
              value={selectedTheme.headingFont} 
              onValueChange={(value) => onFontChange('heading', value)}
            >
              <SelectTrigger id="heading-font">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.heading.map(font => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="body-font" className="mb-1 block text-xs">Body Font</Label>
            <Select 
              value={selectedTheme.bodyFont} 
              onValueChange={(value) => onFontChange('body', value)}
            >
              <SelectTrigger id="body-font">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.body.map(font => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
} 