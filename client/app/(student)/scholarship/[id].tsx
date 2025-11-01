import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/header';
import { scholarshipService } from '@/services/scholarship.service';

export default function ScholarshipDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scholarship, setScholarship] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      setLoading(true);
      const res = await scholarshipService.getScholarshipById(String(id));
      if (res.success && res.scholarship) {
        setScholarship(res.scholarship);
      } else {
        setError(res.message);
      }
    } catch (e) {
      setError('Failed to load scholarship');
    } finally {
      setLoading(false);
      animateIn();
    }
  }, [id, animateIn]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const amountPerScholar = scholarship?.total_slot > 0 
    ? scholarship.total_amount / scholarship.total_slot 
    : scholarship?.total_amount;

  const formatAmount = (value?: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (typeof num !== 'number' || isNaN(num)) return '₱ 0.00';
    return `₱ ${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Scholarship Details"
        showSearch={false}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3A52A6" />
          <Text style={styles.loadingText}>Loading details…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <Animated.ScrollView
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.metricSingle}>
            <Text style={styles.metricLabel}>Status</Text>
            <Text style={[styles.metricValue, { color: '#31D0AA' }]}>{scholarship?.status || ''}</Text>
          </View>

          {/* Hero/Image Card */}
          <View style={styles.heroCard}>
            <Image
              source={scholarship?.image_url ? { uri: scholarship.image_url } : require('@/assets/images/iskolar-logo.png')}
              style={styles.heroImage}
              defaultSource={require('@/assets/images/iskolar-logo.png')}
            />
          </View>

          {/* Title & Meta */}
          <View style={styles.card}>
            <Text style={styles.titleText}>{scholarship?.title}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="business-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{scholarship?.sponsor?.organization_name || 'Unknown Sponsor'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{formatDate(scholarship?.application_deadline)}</Text>
            </View>
          </View>

          {/* Metrics Row */}
          <View style={styles.row}> 
            <View style={[styles.metricBox, { borderColor: '#31D0AA' }]}>
              <Text style={styles.metricLabel}>Amount</Text>
              <Text style={[styles.metricValue, { color: '#31D0AA' }]}>{formatAmount(amountPerScholar)}</Text>
              <Text style={styles.perScholar}>per scholar</Text>
            </View>
            <View style={[styles.metricBox, { borderColor: '#607EF2' }]}>
              <Text style={styles.metricLabel}>Slots</Text>
              <Text style={[styles.metricValue, { color: '#607EF2' }]}>{scholarship?.total_slot}</Text>
              <Text style={styles.perScholar}>scholars</Text>
            </View>
          </View>

          {/* Description */}
          {scholarship?.description ? (
            <View style={styles.card}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.bodyText}>{scholarship.description}</Text>
            </View>
          ) : null}

          {/* Criteria */}
          {Array.isArray(scholarship?.criteria) && scholarship.criteria.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.label}>Criteria</Text>
              <View style={styles.tagsContainer}>
                {scholarship.criteria.map((c: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{c.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Required Documents */}
          {Array.isArray(scholarship?.required_documents) && scholarship.required_documents.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.label}>Required Documents</Text>
              <View style={styles.tagsContainer}>
                {scholarship.required_documents.map((d: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{d.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </Animated.ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
    paddingBottom: 28,
  },
  
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
  },
  
  loadingText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 16,
    color: '#5D6673',
    marginTop: 14,
  },
  
  errorText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 16,
    color: 'rgba(93, 102, 115, 1)',
    marginTop: 14,
    textAlign: 'center',
  },
  
  retryButton: {
    backgroundColor: '#3A52A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  
  retryButtonText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 16,
    color: '#F0F7FF',
  },
  
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    elevation: 2,
  },
  
  heroImage: {
    width: '100%',
    aspectRatio: 1 / 1,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
    resizeMode: 'cover',
  },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    marginTop: 12,
  },
  
  titleText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
  },
  
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  
  metaText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  
  metricSingle: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  
  row: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  
  metricBox: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  
  metricLabel: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#5D6673',
  },
  
  metricValue: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
    marginTop: 4,
  },
  
  perScholar: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 11,
    color: '#666',
  },
  
  label: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#5D6673',
    marginBottom: 6,
  },
  
  bodyText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12.5,
    color: '#111827',
  },
  
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  tag: {
    backgroundColor: '#E0ECFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  
  tagText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#3A52A6',
  },
});