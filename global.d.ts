declare module '@react-native-async-storage/async-storage';
declare module 'react-native-calendars';

// Simple shims for components or packages that may not have types installed yet
declare module '@expo/image' {
  const _a: any;
  export = _a;
}
