import React from 'react';
import { Text, TextProps } from 'react-native';

export const ThemedText: React.FC<TextProps & { type?: string }> = ({ children, style, ...props }) => (
  <Text {...props} style={style}>{children}</Text>
);

export default ThemedText;
