import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import ScholarshipCard from '@/components/scholarship-card';
import ScholarshipMetrics from '@/components/scholarship-metrics';
import { scholarshipService } from '@/services/scholarship.service';

interface Sponsor {
  sponsor_id: string;
  organization_name: string;
  logo_url?: string;
  email?: string;
}

interface Scholarship {
  scholarship_id: string;
  sponsor_id: string;
  status: string;
  type?: string;
  purpose?: string;
  title: string;
  total_amount: number;
  total_slot: number;
  application_deadline?: string;
  criteria: string[];
  required_documents: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
  sponsor: Sponsor;
}

export default function DiscoverPage() {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScholarships = useCallback(async () => {
    try {
      setError(null);
      const response = await scholarshipService.getAllScholarships();
      
      if (response.success && response.scholarships) {
        setScholarships(response.scholarships);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to load scholarships');
      console.error('Error fetching scholarships:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchScholarships();
  }, [fetchScholarships]);

  const handleScholarshipPress = (scholarshipId: string) => {
    // Navigate to scholarship details page
    router.push(`/scholarship/${scholarshipId}` as any);
  };

  const formatText = (text: string): string => {
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-');
  };

  const formatArrayText = (text: string): string => {
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getTags = (scholarship: Scholarship): string[] => {
    const tags: string[] = [];
    
    if (scholarship.type) {
      tags.push(formatText(scholarship.type));
    }
    
    if (scholarship.purpose) {
      tags.push(formatText(scholarship.purpose));
    }
    
    return tags;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="school" size={32} color="#3A52A6" />
          <Text style={styles.logoText}>Discover</Text>
        </View>
        <Pressable style={styles.searchButton}>
          <Ionicons name="search" size={20} color="#666" />
          <Text style={styles.searchText}>Search</Text>
        </Pressable>
      </View>

      <ScholarshipMetrics scholarships={scholarships} />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3A52A6" />
          <Text style={styles.loadingText}>Loading scholarships...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchScholarships}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : scholarships.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="document-outline" size={48} color="#C0C0C0" />
          <Text style={styles.emptyText}>No scholarships available</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3A52A6']}
              tintColor="#3A52A6"
            />
          }
        >
          {scholarships.map((scholarship) => (
            <ScholarshipCard
              key={scholarship.scholarship_id}
              scholarship_id={scholarship.scholarship_id}
              title={scholarship.title}
              imageUrl={scholarship.image_url}
              sponsorName={scholarship.sponsor?.organization_name || 'Unknown Sponsor'}
              deadline={scholarship.application_deadline}
              amount={scholarship.total_amount}
              slots={scholarship.total_slot}
              criteria={scholarship.criteria?.map(c => formatArrayText(c)) || []}
              documents={scholarship.required_documents?.map(d => formatArrayText(d)) || []}
              tags={getTags(scholarship)}
              onPress={() => handleScholarshipPress(scholarship.scholarship_id)}
            />
          ))}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 24,
    color: '#3A52A6',
    marginLeft: 8,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  searchText: {
    fontFamily: 'BreeSerif_400Regular',
    color: '#5D6673',
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 16,
    color: '#5D6673',
    marginTop: 16,
  },
  errorText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 16,
    color: '#5D6673',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 16,
    color: '#999',
    marginTop: 16,
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
    color: '#fff',
  },
  bottomPadding: {
    height: 20,
  },
});