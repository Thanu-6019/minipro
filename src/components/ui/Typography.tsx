import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { theme } from '@/theme';

type TypographyVariant = keyof typeof theme.typography;

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  children: React.ReactNode;
  color?: string;
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body-md',
  children,
  style,
  color = theme.colors['on-surface'],
  align = 'left',
  weight,
  ...props
}) => {
  const typographyStyle = theme.typography[variant];
  
  const fontWeight = weight ?? typographyStyle.fontWeight;
    const letterSpacing = 'letterSpacing' in typographyStyle ? typographyStyle.letterSpacing : 0;
    
    return (
      <Text
        style={[
          {
            fontFamily: 'Inter',
            fontSize: typographyStyle.fontSize,
            lineHeight: typographyStyle.lineHeight,
            fontWeight: fontWeight as TextStyle['fontWeight'],
            letterSpacing,
            color,
            textAlign: align,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </Text>
    );
};
