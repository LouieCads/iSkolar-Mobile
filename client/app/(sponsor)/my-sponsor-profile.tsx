// app/(student)/my-profile.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { authService } from '@/services/auth.service'; 

export default function MySponsorProfile() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userData = {
    name: 'iSkolar',
    role: 'Sponsor',
    organizationName: 'iSkolar',
    organizationType: 'Private Company',
    officialEmail: 'iskolar@gmail.com',
    contactNumber: '09665640148',
  };

  const handleLogout = async () => {
    try {
      await authService.removeToken();
      setShowLogoutModal(false);
      router.replace('/login'); 
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#31D0AA', '#31D0AA', '#89FFE3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Profile</Text>
        
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <View style={styles.profileCircle}>
            <Ionicons name="person" size={50} color="#4A5568" />
          </View>
        </View>

        <View style={styles.wavyBottom} />
      </LinearGradient>

      {/* Name and Role */}
      <View style={styles.nameContainer}>
        <Text style={styles.nameText}>{userData.name}</Text>
        <Text style={styles.roleText}>{userData.role}</Text>
      </View>

      {/* Organization Information Card */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ORGANIZATION INFORMATION</Text>

          {/* Official Email */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={24} color="#3A52A6" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Official Email</Text>
              <Text style={styles.infoValue}>{userData.officialEmail}</Text>
            </View>
          </View>

          {/* Organization Name */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="office-building" size={24} color="#3A52A6" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Organization Name</Text>
              <Text style={styles.infoValue}>{userData.organizationName}</Text>
            </View>
          </View>

          {/* Organization Type */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="private-connectivity" size={24} color="#3A52A6" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Organization Type</Text>
              <Text style={styles.infoValue}>{userData.organizationType}</Text>
            </View>
          </View>

          {/* Contact Number */}
          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <View style={styles.iconCircle}>
              <Ionicons name="call-outline" size={24} color="#3A52A6" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Contact Number</Text>
              <Text style={styles.infoValue}>{userData.contactNumber}</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color="#F0F7FF" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}> 
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out of your account?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  header: {
    height: 215,
    paddingTop: 65,
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 32,
    color: '#F0F7FF',
  },
  profileImageContainer: {
    position: 'absolute',
    bottom: -20,
    zIndex: 10,
  },
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  wavyBottom: {
    position: 'absolute',
    bottom: -165,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#F0F7FF',
    borderTopLeftRadius: 900,
    borderTopRightRadius: 900,
    transform: [{ scaleX: 1.7 }],
  },
  nameContainer: {
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 16,
  },
  nameText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 24,
    color: '#111827',
    fontWeight: '600',
  },
  roleText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 16,
    color: '#718096',
    marginTop: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
    color: '#111827',
    opacity: 0.75,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  lastInfoRow: {
    marginBottom: 0,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#111827',
    opacity: 0.50,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 24,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButtonText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#F0F7FF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 8,
  },
  modalMessage: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(202, 205, 210, 1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmButtonText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});