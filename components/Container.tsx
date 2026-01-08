import React from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export const Container = ({ children, style }: ContainerProps) => {
  return <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // full height
    width: '100%',
    padding: 0,
    margin: 0,
    flexGrow: 1,
    backgroundColor: '#F5F5F5', // default background
  },
});
