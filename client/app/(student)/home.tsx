import { View, Text, Image, Pressable, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { authService } from '@/services/auth.service'; // ✅ import your authService

export default function HomePage() {
  const router = useRouter();
  
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.removeToken(); 
      router.replace('/login'); 
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#3A52A6" />
        </Pressable>
      </View>

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
        <Image 
          source={require('../../assets/images/iskolar.png')} 
          style={styles.image}
        />
      </Animated.View>

      {/* Welcome */}
      <Animated.View style={{ opacity: textOpacity }}>
        <Text style={styles.title}>Welcome Student</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
    paddingTop: 75,
    paddingBottom: 65,
    paddingHorizontal: 50,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 150,
  },
  backButton: {
    position: 'absolute',
    top: -10,
    left: -15,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
  },
  title: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 30,
    textAlign: 'center',
    color: '#3A52A6',
    lineHeight: 28,
  },
});
