import React from 'react';
import { View, ViewProps } from 'react-native';

export const ThemedView: React.FC<ViewProps> = ({ children, style, ...props }) => (
  <View {...props} style={style}>{children}</View>
);

export default ThemedView;
