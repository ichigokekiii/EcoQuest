import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { spacing } from '../src/constants/theme';
import { setPendingTrashPhoto } from '../src/utils/pendingTrashPhoto';

const { width } = Dimensions.get('window');

export default function CameraScannerScreen() {
  const router = useRouter();
  const { id, sessionId } = useLocalSearchParams();
  const [capturing, setCapturing] = useState(false);

  async function handleImageResult(result) {
    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    setPendingTrashPhoto(result.assets[0]);

    router.push({
      pathname: '/trash-confirm',
      params: {
        id,
        sessionId,
        imageUri: result.assets[0].uri,
      },
    });
  }

  async function openCamera() {
    try {
      setCapturing(true);
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Camera access needed', 'Please allow camera access to take a trash photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      await handleImageResult(result);
    } catch (error) {
      Alert.alert('Camera unavailable', 'Unable to open the camera right now. Try the gallery instead.');
    } finally {
      setCapturing(false);
    }
  }

  async function openGallery() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Photo library access needed', 'Please allow photo library access to choose an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      await handleImageResult(result);
    } catch (error) {
      Alert.alert('Gallery unavailable', 'Unable to open the photo library right now.');
    }
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#111827" />
        </TouchableOpacity>

        {/* Top Right Tools */}
        <View style={styles.topRightTools}>
          <TouchableOpacity style={styles.toolButton}>
            <Feather name="zap" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Central Scanning Overlay */}
      <View style={styles.overlayContainer} pointerEvents="none">
        <View style={styles.reticle}>
          <View style={[styles.corner, styles.topLeftCorner]} />
          <View style={[styles.corner, styles.topRightCorner]} />
          <View style={[styles.corner, styles.bottomLeftCorner]} />
          <View style={[styles.corner, styles.bottomRightCorner]} />
          <Text style={styles.reticleText}>Align trash within the frame</Text>
        </View>
      </View>

      {/* Bottom Controls */}
      <SafeAreaView edges={['bottom']} style={styles.bottomControls}>
        <View style={styles.controlsRow}>
          {/* Left: Gallery */}
          <TouchableOpacity style={styles.sideButton} onPress={openGallery}>
            <Feather name="image" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Center: Snap Button */}
          <TouchableOpacity 
            style={styles.snapButtonOuter}
            onPress={openCamera}
          >
            <View style={styles.snapButtonInner} />
          </TouchableOpacity>

          {/* Right: Camera Flip */}
          <TouchableOpacity style={styles.sideButton} onPress={openCamera} disabled={capturing}>
            <Feather name="refresh-ccw" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>
          {capturing ? 'Opening camera...' : 'Use camera or choose from your gallery'}
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Camera placeholder
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightTools: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  reticle: {
    width: width * 0.75,
    height: width * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#16A34A',
  },
  topLeftCorner: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRightCorner: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeftCorner: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRightCorner: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  reticleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'absolute',
    bottom: -50,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    zIndex: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helperText: {
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: spacing.md,
    fontSize: 13,
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snapButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snapButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
});
