import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function UserHeadingMarker() {
  return (
    <View style={styles.container}>
      <View style={styles.accuracyRing} />
      <View style={styles.triangleWrap}>
        <View style={styles.triangleOutline} />
        <View style={styles.triangleFill} />
      </View>
    </View>
  );
}

const TRIANGLE_HEIGHT = 24;
const TRIANGLE_HALF_WIDTH = 13;

const styles = StyleSheet.create({
  container: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyRing: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(22, 163, 74, 0.18)',
  },
  triangleWrap: {
    width: TRIANGLE_HALF_WIDTH * 2,
    height: TRIANGLE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triangleOutline: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: TRIANGLE_HALF_WIDTH + 2,
    borderRightWidth: TRIANGLE_HALF_WIDTH + 2,
    borderBottomWidth: TRIANGLE_HEIGHT + 3,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  triangleFill: {
    position: 'absolute',
    top: 2,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: TRIANGLE_HALF_WIDTH,
    borderRightWidth: TRIANGLE_HALF_WIDTH,
    borderBottomWidth: TRIANGLE_HEIGHT,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#16A34A',
  },
});
