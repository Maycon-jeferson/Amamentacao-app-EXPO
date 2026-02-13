import React from 'react';
import { Linking, Pressable, Text } from 'react-native';

export const ExternalLink: React.FC<{ href: string; children?: React.ReactNode }> = ({ href, children }) => (
  <Pressable onPress={() => Linking.openURL(href)}>
    <Text>{children ?? href}</Text>
  </Pressable>
);

export default ExternalLink;
