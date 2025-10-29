import { View, Text, StyleSheet } from 'react-native';

interface Scholarship {
  status: string;
  total_slot: number;
  total_amount: number;
}

interface ScholarshipMetricsProps {
  scholarships: Scholarship[];
}

export default function ScholarshipMetrics({ scholarships }: ScholarshipMetricsProps) {
  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `₱${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₱${(value / 1000).toFixed(1)}K`;
    }
    return `₱${value.toLocaleString()}`;
  };

  const metrics = {
    active: scholarships.filter(s => s.status === 'active').length,
    totalSlots: scholarships.reduce((sum, s) => sum + s.total_slot, 0),
    totalValue: scholarships.reduce((sum, s) => sum + (s.total_amount * s.total_slot), 0)
  };

  return (
    <View style={styles.metricsContainer}>
      <View style={styles.metItem}>
        <View style={[styles.metDot, { backgroundColor: '#31D0AA' }]} />
        <Text style={styles.metLabel}>Active</Text>
        <Text style={styles.metValue}>{metrics.active}</Text>
      </View>
      <View style={styles.metItem}>
        <View style={[styles.metDot, { backgroundColor: '#607EF2' }]} />
        <Text style={styles.metLabel}>Slots</Text>
        <Text style={styles.metValue}>{metrics.totalSlots.toLocaleString()}</Text>
      </View>
      <View style={styles.metItem}>
        <View style={[styles.metDot, { backgroundColor: '#FF6B6B' }]} />
        <Text style={styles.metLabel}>Value</Text>
        <Text style={styles.metValue}>{formatValue(metrics.totalValue)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metricsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metLabel: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#5D6673',
  },
  metValue: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#111827',
    fontWeight: 'bold',
  },
});