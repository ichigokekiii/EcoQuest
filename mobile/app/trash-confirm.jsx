import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { spacing, radius } from '../src/constants/theme';
import CategorySuggestionCard from '../src/components/CategorySuggestionCard';
import { analyzeTrashPhoto, confirmTrash, getRouteSessionById, getTrashCategories } from '../src/services/api';
import { clearPendingTrashPhoto, getPendingTrashPhoto } from '../src/utils/pendingTrashPhoto';

const HIGH_CONFIDENCE_THRESHOLD = 0.7;

function findCategoryById(categories, categoryId) {
  return categories.find((category) => category.id === categoryId) || null;
}

export default function TrashConfirmScreen() {
  const router = useRouter();
  const { id, sessionId, imageUri } = useLocalSearchParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiUserFeedback, setAiUserFeedback] = useState(null);
  const [analysisSource, setAnalysisSource] = useState(null);
  const [itemNumber, setItemNumber] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [canFinishRoute, setCanFinishRoute] = useState(false);
  const [photoAsset] = useState(() => getPendingTrashPhoto());

  const displayImageUri = imageUri || photoAsset?.uri;

  useEffect(() => {
    let isMounted = true;

    async function loadCategoriesAndSuggestion() {
      try {
        setCategoriesLoading(true);
        setAnalyzeError(false);

        const [categoriesResponse, sessionResponse] = await Promise.all([
          getTrashCategories(),
          sessionId ? getRouteSessionById(sessionId).catch(() => null) : Promise.resolve(null),
        ]);
        const activeCategories = categoriesResponse.categories || [];

        if (!isMounted) {
          return;
        }

        setCategories(activeCategories);
        setSelectedCategory((currentCategory) => currentCategory || activeCategories[0] || null);

        const approvedTrashCount = sessionResponse?.session?.approvedTrashCount ?? 0;
        setItemNumber(approvedTrashCount + 1);
        setCategoriesLoading(false);

        if (!sessionId || !displayImageUri) {
          return;
        }

        setAnalyzing(true);
        const analysisResponse = await analyzeTrashPhoto({
          sessionId,
          imageUri: displayImageUri,
          imageFileName: photoAsset?.fileName || null,
          imageMimeType: photoAsset?.mimeType || null,
          imageBase64: photoAsset?.base64 || null,
        });

        if (!isMounted) {
          return;
        }

        const suggestion = analysisResponse.suggestion || null;
        setAiSuggestion(suggestion);
        setAnalysisSource(analysisResponse.analysisSource || null);

        if (__DEV__) {
          console.log('[EcoQuest AI]', {
            analysisSource: analysisResponse.analysisSource,
            suggestedCategoryId: suggestion?.suggestedCategoryId,
            confidence: suggestion?.confidence,
            reason: suggestion?.reason,
          });
        }

        if (
          suggestion?.suggestedCategoryId &&
          !suggestion.needsReview &&
          (suggestion.confidence ?? 0) >= HIGH_CONFIDENCE_THRESHOLD
        ) {
          const suggestedCategory = findCategoryById(activeCategories, suggestion.suggestedCategoryId);

          if (suggestedCategory) {
            setSelectedCategory(suggestedCategory);
          }
        }
      } catch (error) {
        console.log('Error loading trash categories or AI suggestion:', error);
        if (isMounted) {
          setCategoriesLoading(false);
          setAnalyzeError(true);
        }
      } finally {
        if (isMounted) {
          setAnalyzing(false);
        }
      }
    }

    loadCategoriesAndSuggestion();

    return () => {
      isMounted = false;
    };
  }, [displayImageUri, photoAsset?.base64, photoAsset?.fileName, photoAsset?.mimeType, sessionId]);

  function applySuggestion() {
    const suggestedCategory = findCategoryById(categories, aiSuggestion?.suggestedCategoryId);

    if (suggestedCategory) {
      setSelectedCategory(suggestedCategory);
    }
  }

  function handleCorrectFeedback() {
    setAiUserFeedback('correct');
    applySuggestion();
  }

  function handleWrongFeedback() {
    setAiUserFeedback('wrong');

    if (selectedCategory?.id === aiSuggestion?.suggestedCategoryId) {
      const fallbackCategory =
        categories.find((category) => category.id !== aiSuggestion?.suggestedCategoryId) || null;
      setSelectedCategory(fallbackCategory);
    }
  }

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  async function handleSubmit() {
    if (!sessionId) {
      Alert.alert('Missing session', 'Start a route session before submitting trash.');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Choose a category', 'Please select an active trash category before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await confirmTrash(
        sessionId,
        selectedCategory.id,
        quantity,
        displayImageUri,
        selectedCategory.name,
        {
          imageBase64: photoAsset?.base64 || null,
          imageMimeType: photoAsset?.mimeType || null,
          imageFileName: photoAsset?.fileName || null,
          aiSuggestedCategoryId: aiSuggestion?.suggestedCategoryId || null,
          aiSuggestedCategoryName: aiSuggestion?.suggestedCategoryName || null,
          aiConfidence: aiSuggestion?.confidence ?? null,
          aiReason: aiSuggestion?.reason || null,
          aiNeedsReview: Boolean(aiSuggestion?.needsReview),
          aiDetectedObject: aiSuggestion?.detectedObject || null,
          aiDetectedMaterial: aiSuggestion?.detectedMaterial || null,
          aiUserFeedback: aiUserFeedback || null,
        }
      );

      const pointsPreview = quantity * 5;
      setPointsEarned(pointsPreview);
      setCanFinishRoute(Boolean(response.canFinish));
      clearPendingTrashPhoto();
      setSuccessModalVisible(true);
    } catch (error) {
      console.log('Error confirming trash:', error);
      Alert.alert(
        'Submission failed',
        error.response?.data?.message || 'Unable to save this trash submission right now.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() =>
            router.replace(
              id
                ? { pathname: '/active-route', params: { id, sessionId, refresh: Date.now().toString() } }
                : '/active-route'
            )
          }
        >
          <Feather name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Trash</Text>
        <Text style={styles.itemText}>{itemNumber ? `Item #${itemNumber}` : ''}</Text>
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
            source={{
              uri:
                displayImageUri ||
                'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=1000&auto=format&fit=crop',
            }}
            style={styles.photo}
          />
          <View style={styles.photoCheckmark}>
            <Feather name="check" size={16} color="#FFFFFF" />
          </View>
        </View>

        <CategorySuggestionCard
          loading={analyzing}
          error={analyzeError}
          suggestion={aiSuggestion}
          feedback={aiUserFeedback}
          analysisSource={analysisSource}
          onCorrect={handleCorrectFeedback}
          onWrong={handleWrongFeedback}
        />

        {/* Trash Category */}
        <Text style={styles.sectionTitle}>Trash Category</Text>
        {categoriesLoading ? (
          <View style={styles.loadingCategories}>
            <ActivityIndicator color="#16A34A" />
            <Text style={styles.loadingCategoriesText}>Loading active categories...</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, selectedCategory?.id === cat.id && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory?.id === cat.id && styles.categoryTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

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
          style={[styles.submitButton, (!selectedCategory || submitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!selectedCategory || submitting}
        >
          <Feather name="check" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit Trash'}</Text>
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
            <Text style={styles.modalTitle}>Submission Received</Text>
            <View style={styles.pointsRow}>
              <Feather name="clock" size={18} color="#D97706" />
              <Text style={styles.pointsText}>{quantity} item{quantity === 1 ? '' : 's'} pending review</Text>
            </View>
            <Text style={styles.statusText}>
              {canFinishRoute
                ? 'Your approved count already meets the route requirement. This new submission is still waiting for admin review.'
                : `This trash photo is now waiting for admin review. Up to ${pointsEarned} points can be awarded after approval, and only approved items count toward route completion.`}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setSuccessModalVisible(false);
                router.replace(
                  id
                    ? {
                        pathname: '/active-route',
                        params: { id, sessionId, refresh: Date.now().toString() },
                      }
                    : '/active-route'
                );
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
  loadingCategories: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  loadingCategoriesText: {
    color: '#6B7280',
    marginLeft: spacing.sm,
    fontWeight: '600',
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
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
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
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  pointsText: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '800',
  },
  statusText: {
    color: '#6B7280',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
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
