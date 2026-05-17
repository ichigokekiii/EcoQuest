import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { spacing, radius } from '../src/constants/theme';

const CATEGORIES = ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'Mixed', 'Hazardous'];

export default function TrashConfirmScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('Plastic');
  const [quantity, setQuantity] = useState(1);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace(id ? { pathname: '/active-route', params: { id } } : '/active-route')}
        >
          <Feather name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Trash</Text>
        <Text style={styles.itemText}>Item #8</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Captured Photo */}
        <Text style={styles.sectionTitle}>Captured Photo</Text>
        <View style={styles.photoContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=1000&auto=format&fit=crop' }} 
            style={styles.photo}
          />
          <View style={styles.photoCheckmark}>
            <Feather name="check" size={16} color="#FFFFFF" />
          </View>
        </View>

        {/* Trash Category */}
        <Text style={styles.sectionTitle}>Trash Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat}
              style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quantity */}
        <Text style={styles.sectionTitle}>Quantity</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={[styles.qtyButtonOutline, quantity <= 1 && styles.qtyButtonDisabled]} 
            onPress={decrementQuantity}
            disabled={quantity <= 1}
          >
            <Feather name="minus" size={20} color={quantity <= 1 ? '#D1D5DB' : '#111827'} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyButtonFilled} onPress={incrementQuantity}>
            <Feather name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={() => setSuccessModalVisible(true)}
        >
          <Feather name="check" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.submitButtonText}>Submit Trash</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.retakeButton} onPress={() => router.back()}>
          <Text style={styles.retakeButtonText}>Retake Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isSuccessModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconContainer}>
              <Feather name="check" size={40} color="#16A34A" />
            </View>
            <Text style={styles.modalTitle}>Trash Confirmed!</Text>
            <Text style={styles.modalSubtitle}>+50 pts added to your total</Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setSuccessModalVisible(false);
                router.replace(id ? { pathname: '/active-route', params: { id } } : '/active-route');
              }}
            >
              <Text style={styles.modalButtonText}>Return to Route</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 200, // Extra padding to completely clear the tall bottom action bar
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: spacing.md,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoCheckmark: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  categoriesScroll: {
    marginBottom: spacing.xl,
    marginHorizontal: -spacing.xl, // Allow scrolling to screen edge
  },
  categoriesContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButtonOutline: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F3F4F6',
  },
  qtyText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginHorizontal: spacing.lg,
  },
  qtyButtonFilled: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
  },
  submitButton: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  retakeButton: {
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7', // Light green bg
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: spacing.xl,
  },
  modalButton: {
    backgroundColor: '#16A34A',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
