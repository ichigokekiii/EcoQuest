import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../src/constants/theme';
import Button from '../src/components/Button';

const { width } = Dimensions.get('window');

const OrbitingBubble = ({ radius, angleOffset, duration, value, label, isGreen }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1, 
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const currentAngle = rotation.value + angleOffset;
    const rad = (currentAngle * Math.PI) / 180;
    
    return {
      transform: [
        { translateX: radius * Math.cos(rad) },
        { translateY: radius * Math.sin(rad) },
      ],
    };
  });

  return (
    <Animated.View style={[styles.bubbleContainer, isGreen && styles.bubbleGreen, animatedStyle]}>
      <Text style={[styles.bubbleValue, isGreen && styles.bubbleTextGreen]}>{value}</Text>
      <Text style={[styles.bubbleLabel, isGreen && styles.bubbleTextGreen]}>{label}</Text>
    </Animated.View>
  );
};

const OrbitingSystem = () => {
  return (
    <View style={styles.orbitSystem}>
      {/* Rings */}
      <View style={[styles.ring, { width: 220, height: 220, borderRadius: 110 }]} />
      <View style={[styles.ring, { width: 320, height: 320, borderRadius: 160 }]} />

      {/* Center Circle */}
      <View style={styles.centerCircle}>
        <Image 
          source={require('../assets/ecoquest/ecoquest.svg')} 
          style={styles.centerLogo} 
          contentFit="contain" 
        />
      </View>

      {/* Orbiting Data Bubbles */}
      <OrbitingBubble radius={110} angleOffset={-45} duration={15000} value="1.2K+" label="Warriors" isGreen={false} />
      <OrbitingBubble radius={160} angleOffset={135} duration={20000} value="18K" label="Items Cleaned" isGreen={false} />
      <OrbitingBubble radius={160} angleOffset={20} duration={20000} value="42" label="Routes" isGreen={true} />
    </View>
  );
};

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLogoContainer}>
          <Image 
            source={require('../assets/ecoquest/ecoquest.svg')} 
            style={styles.headerLogo} 
            contentFit="contain" 
          />
        </View>
        <Text style={styles.headerTitle}>Eco Quest</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.animationWrapper}>
          <OrbitingSystem />
        </View>

        <View style={styles.textSection}>
          <Text style={styles.title}>Clean the World,{'\n'}Earn Rewards</Text>
          <Text style={styles.subtitle}>
            Join real-world cleanup missions.{'\n'}Collect trash, earn points, redeem rewards.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button 
            title="Get Started →" 
            onPress={() => router.push('/register')} 
            style={styles.primaryBtn}
          />
          <Button 
            title="Sign In" 
            variant="outline"
            onPress={() => router.push('/login')} 
            style={styles.secondaryBtn}
            textStyle={{ color: colors.textDark }}
          />
          <Text style={styles.termsText}>
            By continuing you agree to our Terms & Privacy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerLogoContainer: {
    marginRight: spacing.sm,
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  animationWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    zIndex: 1,
  },
  orbitSystem: {
    width: 320,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  centerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#F0FDF4', // Very pale green
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  centerLogo: {
    width: 60,
    height: 60,
  },
  centerText: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
  bubbleContainer: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  bubbleGreen: {
    backgroundColor: '#16A34A',
  },
  bubbleValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  bubbleLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  bubbleTextGreen: {
    color: '#FFFFFF',
  },
  textSection: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    zIndex: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  primaryBtn: {
    backgroundColor: '#16A34A',
    marginBottom: spacing.md,
    borderRadius: 12,
    paddingVertical: 16,
  },
  secondaryBtn: {
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: spacing.lg,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
  },
});
