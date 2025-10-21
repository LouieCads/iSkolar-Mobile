import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export default function LoadingScreen({ 
  title = 'Signing in', 
  subtitle = 'Please wait...' 
}: LoadingScreenProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500, // 1.5 seconds for smooth, fast loading
      easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Smooth easing curve
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View style={{ width: progressWidth, height: '100%' }}>
              <LinearGradient
                colors={['#3A52A6', '#607EF2', '#EFA508']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.progressBarFill}
              />
            </Animated.View>
          </View>
        </View>

        <Text style={styles.loadingText}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 24,
    color: '#3A52A6',
    marginBottom: 15,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBarBackground: {
    width: '100%',
    height: 15,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3A52A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 20,
  },
  loadingText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
    color: '#718096',
    marginTop: 5,
    textAlign: 'center',
  },
});