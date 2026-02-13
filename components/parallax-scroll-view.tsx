import React from 'react';
import { ScrollView, View, ViewProps } from 'react-native';

const ParallaxScrollView: React.FC<ViewProps & { headerBackgroundColor?: any; headerImage?: React.ReactNode }> = ({ children }) => {
  return (
    <ScrollView>
      <View>{children}</View>
    </ScrollView>
  );
};

export default ParallaxScrollView;
