// app/(sponsor)/my-profile.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { authService, ProfileData } from '@/services/auth.service';
import * as ImagePicker from 'expo-image-picker';
import Toast from '@/components/toast'; 

export default function MySponsorProfile() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const result = await authService.getProfile();
      console.log('Profile fetch result:', result);
      
      if (result.success && result.profile) {
        console.log('Profile data:', result.profile);
        setProfileData(result.profile);
      } else {
        showToast('error', 'Error', result.message);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('error', 'Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    setToast({ visible: true, type, title, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose how you want to select your profile picture',
      [
        { text: 'Camera', onPress: () => pickImage('camera') },
        { text: 'Gallery', onPress: () => pickImage('gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      let result;
      
      if (source === 'camera') {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
          showToast('error', 'Permission Required', 'Camera permission is required to take photos');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          showToast('error', 'Permission Required', 'Gallery permission is required to select photos');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showToast('error', 'Error', 'Failed to select image');
    }
  };

  const uploadProfilePicture = async (imageUri: string) => {
    try {
      setUploadingImage(true);
      console.log('Starting profile picture upload for URI:', imageUri);
      
      const result = await authService.uploadProfilePicture(imageUri);
      console.log('Upload result:', result);
      
      if (result.success) {
        showToast('success', 'Success', 'Profile picture updated successfully');
        // Update local profile data
        if (profileData) {
          setProfileData({ ...profileData, profile_url: result.profile_url });
        }
      } else {
        console.error('Upload failed:', result.message);
        showToast('error', 'Error', result.message);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showToast('error', 'Error', 'Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const formatOrgType = (orgType: string) => {
    if (!orgType) return '';
    return orgType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />

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
          <TouchableOpacity 
            style={styles.profileCircle} 
            onPress={handleImagePicker}
            disabled={uploadingImage}
          >
            {profileData.profile_url ? (
              <Image 
                source={{ uri: profileData.profile_url }} 
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={50} color="#4A5568" />
            )}
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}

            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={12} color="#F0F7FF" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.wavyBottom} />
      </LinearGradient>

      {/* Name and Role */}
      <View style={styles.nameContainer}>
        <Text style={styles.nameText}>{profileData.organization_name || ''}</Text>
        <Text style={styles.roleText}>Sponsor</Text>
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
              <Text style={styles.infoValue}>{profileData.official_email || ''}</Text>
            </View>
          </View>

          {/* Organization Name */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="office-building" size={24} color="#3A52A6" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Organization Name</Text>
              <Text style={styles.infoValue}>{profileData.organization_name || ''}</Text>
            </View>
          </View>

          {/* Organization Type */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="private-connectivity" size={24} color="#3A52A6" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Organization Type</Text>
              <Text style={styles.infoValue}>{formatOrgType(profileData.organization_type || '') || ''}</Text>
            </View>
          </View>

          {/* Contact Number */}
          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <View style={styles.iconCircle}>
              <Ionicons name="call-outline" size={24} color="#3A52A6" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Contact Number</Text>
              <Text style={styles.infoValue}>{profileData.contact_number || ''}</Text>
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
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#F0F7FF',
    zIndex: 10,
  },
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
  },
  loadingText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 16,
    color: '#3A52A6',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 20,
  },
  errorText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3A52A6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 10,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 20,
    backgroundColor: '#3A52A6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F7FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  }
});