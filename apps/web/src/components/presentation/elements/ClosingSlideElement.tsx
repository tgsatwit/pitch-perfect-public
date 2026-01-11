import React from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import { Html } from 'react-konva-utils';

interface ClosingSlideElementProps {
  data: {
    title?: string;
    subtitle?: string;
    summary?: string;
    callToAction?: string;
    contactInfo?: string;
    bullets?: string[];
    thankYouText?: string;
  };
  width: number;
  height: number;
  theme?: 'light' | 'dark';
}

export const ClosingSlideElement: React.FC<ClosingSlideElementProps> = ({ 
  data, 
  width, 
  height,
  theme = 'light'
}) => {
  const {
    title = 'Thank You',
    subtitle = 'Next Steps',
    summary = 'We appreciate the opportunity to present our solution.',
    callToAction = 'Schedule a follow-up meeting to discuss implementation details.',
    contactInfo = 'contact@financialbank.com | (555) 123-4567',
    bullets = ['Review proposal', 'Provide feedback', 'Schedule implementation discussion'],
    thankYouText = 'Thank You'
  } = data;
  
  // Theme-based styling
  const colors = theme === 'light' 
    ? {
        background: '#ffffff',
        title: '#2c5282',
        subtitle: '#4a5568',
        text: '#1a202c',
        ctaBackground: '#ebf4ff',
        ctaBorder: '#4299e1',
        ctaText: '#2b6cb0',
        bulletColor: '#4299e1',
        contactBg: '#f7fafc'
      }
    : {
        background: '#1a202c',
        title: '#90cdf4',
        subtitle: '#e2e8f0',
        text: '#f7fafc',
        ctaBackground: '#2d3748',
        ctaBorder: '#4299e1',
        ctaText: '#90cdf4',
        bulletColor: '#4299e1',
        contactBg: '#2d3748'
      };
  
  // Use HTML rendering for complex layout
  return (
    <Html
      transform
      divProps={{
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${width}px`,
          height: `${height}px`,
        },
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          fontFamily: 'Arial, sans-serif',
          color: colors.text,
          backgroundColor: colors.background,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Thank You Banner */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          <h1 style={{ 
            color: colors.title, 
            fontSize: '2.5rem', 
            margin: '0 0 10px 0',
            fontWeight: 'bold',
          }}>
            {thankYouText}
          </h1>
          <h2 style={{ 
            color: colors.subtitle, 
            fontSize: '1.5rem', 
            margin: 0,
            fontWeight: 'normal',
          }}>
            {subtitle}
          </h2>
        </div>
        
        {/* Summary */}
        <div
          style={{
            margin: '0 auto 20px auto',
            maxWidth: '80%',
            textAlign: 'center',
            fontSize: '1rem',
            lineHeight: '1.6',
          }}
        >
          {summary}
        </div>
        
        {/* Next Steps Bullets */}
        <div
          style={{
            margin: '0 auto 30px auto',
            maxWidth: '70%',
          }}
        >
          <h3 style={{ 
            color: colors.subtitle, 
            fontSize: '1.2rem', 
            marginBottom: '10px',
          }}>
            Next Steps:
          </h3>
          <ul style={{ 
            listStyleType: 'none', 
            padding: 0,
            margin: 0,
          }}>
            {bullets.map((bullet, index) => (
              <li 
                key={`bullet-${index}`}
                style={{
                  padding: '5px 0 5px 25px',
                  position: 'relative',
                  margin: '5px 0',
                }}
              >
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: '7px',
                  width: '12px',
                  height: '12px',
                  backgroundColor: colors.bulletColor,
                  borderRadius: '50%',
                }}></span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Call to Action Box */}
        <div
          style={{
            backgroundColor: colors.ctaBackground,
            border: `1px solid ${colors.ctaBorder}`,
            borderRadius: '4px',
            padding: '15px 20px',
            textAlign: 'center',
            margin: '0 auto 30px auto',
            maxWidth: '80%',
          }}
        >
          <p style={{
            color: colors.ctaText,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            margin: 0,
          }}>
            {callToAction}
          </p>
        </div>
        
        {/* Contact Information */}
        <div
          style={{
            backgroundColor: colors.contactBg,
            padding: '10px 15px',
            borderRadius: '4px',
            textAlign: 'center',
            marginTop: 'auto',
            fontSize: '0.9rem',
          }}
        >
          {contactInfo}
        </div>
      </div>
    </Html>
  );
};

// Konva-compatible version for direct rendering on canvas
export const CanvasClosingSlideElement: React.FC<ClosingSlideElementProps> = ({ 
  data, 
  width, 
  height,
  theme = 'light'
}) => {
  const {
    title = 'Thank You',
    subtitle = 'Next Steps',
    summary = 'We appreciate the opportunity to present our solution.',
    callToAction = 'Schedule a follow-up meeting to discuss implementation details.',
    contactInfo = 'contact@financialbank.com | (555) 123-4567',
    bullets = ['Review proposal', 'Provide feedback', 'Schedule implementation discussion'],
    thankYouText = 'Thank You'
  } = data;
  
  // Theme-based styling
  const colors = theme === 'light' 
    ? {
        background: '#ffffff',
        title: '#2c5282',
        subtitle: '#4a5568',
        text: '#1a202c',
        ctaBackground: '#ebf4ff',
        ctaBorder: '#4299e1',
        ctaText: '#2b6cb0',
        bulletColor: '#4299e1',
        contactBg: '#f7fafc'
      }
    : {
        background: '#1a202c',
        title: '#90cdf4',
        subtitle: '#e2e8f0',
        text: '#f7fafc',
        ctaBackground: '#2d3748',
        ctaBorder: '#4299e1',
        ctaText: '#90cdf4',
        bulletColor: '#4299e1',
        contactBg: '#2d3748'
      };
  
  return (
    <Group>
      {/* Background */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={colors.background}
      />
      
      {/* Thank You Title */}
      <Text
        x={width / 2}
        y={40}
        text={thankYouText}
        fontSize={32}
        fontStyle="bold"
        fill={colors.title}
        align="center"
        width={width}
        offsetX={width / 2}
      />
      
      {/* Subtitle */}
      <Text
        x={width / 2}
        y={80}
        text={subtitle}
        fontSize={24}
        fill={colors.subtitle}
        align="center"
        width={width}
        offsetX={width / 2}
      />
      
      {/* Summary */}
      <Text
        x={width / 2}
        y={130}
        text={summary}
        fontSize={16}
        fill={colors.text}
        align="center"
        width={width * 0.8}
        offsetX={(width * 0.8) / 2}
      />
      
      {/* Next Steps Title */}
      <Text
        x={width * 0.15}
        y={180}
        text="Next Steps:"
        fontSize={18}
        fontStyle="bold"
        fill={colors.subtitle}
      />
      
      {/* Bullet Points */}
      {bullets.map((bullet, index) => (
        <Group key={`bullet-group-${index}`}>
          <Circle
            x={width * 0.16}
            y={220 + index * 30}
            radius={6}
            fill={colors.bulletColor}
          />
          <Text
            x={width * 0.18}
            y={214 + index * 30}
            text={bullet}
            fontSize={16}
            fill={colors.text}
            width={width * 0.7}
          />
        </Group>
      ))}
      
      {/* Call to Action Background */}
      <Rect
        x={width * 0.1}
        y={330}
        width={width * 0.8}
        height={60}
        fill={colors.ctaBackground}
        stroke={colors.ctaBorder}
        strokeWidth={1}
        cornerRadius={4}
      />
      
      {/* Call to Action Text */}
      <Text
        x={width / 2}
        y={350}
        text={callToAction}
        fontSize={18}
        fontStyle="bold"
        fill={colors.ctaText}
        align="center"
        width={width * 0.75}
        offsetX={(width * 0.75) / 2}
      />
      
      {/* Contact Information Background */}
      <Rect
        x={width * 0.1}
        y={height - 50}
        width={width * 0.8}
        height={40}
        fill={colors.contactBg}
        cornerRadius={4}
      />
      
      {/* Contact Information */}
      <Text
        x={width / 2}
        y={height - 36}
        text={contactInfo}
        fontSize={14}
        fill={colors.text}
        align="center"
        width={width * 0.75}
        offsetX={(width * 0.75) / 2}
      />
    </Group>
  );
}; 