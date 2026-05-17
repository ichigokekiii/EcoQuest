import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';

export default function ScreenContainer({ children, style, edges = ['top', 'bottom', 'left', 'right'], useSafeArea = true }) {
  const ContainerComponent = useSafeArea ? SafeAreaView : View;
  
  return (
    <ContainerComponent style={[styles.container, style]} edges={edges}>
      {children}
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
