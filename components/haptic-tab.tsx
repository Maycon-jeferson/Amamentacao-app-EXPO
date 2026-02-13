import React from 'react';
import { Pressable, Text, View } from 'react-native';

const HapticTab = (props: any) => {
  const { children } = props;
  return (
    <Pressable {...props}>
      <View>
        <Text>{children}</Text>
      </View>
    </Pressable>
  );
};

export { HapticTab };
export default HapticTab;
