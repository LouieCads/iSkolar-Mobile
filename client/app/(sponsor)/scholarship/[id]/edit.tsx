import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, TextInput, Alert, Animated, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scholarshipService } from '@/services/scholarship.service';
import Toast from '@/components/toast';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';

export default function EditScholarshipPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [totalSlot, setTotalSlot] = useState('');
  const [deadline, setDeadline] = useState('');
  const [criteria, setCriteria] = useState('');
  const [documents, setDocuments] = useState('');
  const [type, setType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [status, setStatus] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [newImageUri, setNewImageUri] = useState<string | null>(null); // Store selected image URI
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const typeDropdownRotation = useRef(new Animated.Value(0)).current;
  const typeDropdownScale = useRef(new Animated.Value(1)).current;
  const purposeDropdownRotation = useRef(new Animated.Value(0)).current;
  const purposeDropdownScale = useRef(new Animated.Value(1)).current;
  const statusDropdownRotation = useRef(new Animated.Value(0)).current;
  const statusDropdownScale = useRef(new Animated.Value(1)).current;

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
        const s = res.scholarship as any;
        setTitle(s.title || '');
        setDescription(s.description || '');
        setTotalAmount(String(s.total_amount ?? ''));
        setTotalSlot(String(s.total_slot ?? ''));
        setDeadline(s.application_deadline ? String(s.application_deadline) : '');
        setCriteria(Array.isArray(s.criteria) ? s.criteria.join(',') : '');
        setDocuments(Array.isArray(s.required_documents) ? s.required_documents.join(',') : '');
        setType(s.type || '');
        setPurpose(s.purpose || '');
        setStatus(s.status || '');
        setImageUrl(s.image_url || null);
        if (s.application_deadline) setDate(new Date(s.application_deadline));
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

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  const onSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      
      // First, upload the new image if one was selected
      if (newImageUri) {
        const upload = await scholarshipService.uploadScholarshipImage(
          String(id), 
          newImageUri
        );
        
        if (!upload.success) {
          Alert.alert('Error', upload.message || 'Failed to upload image');
          setSaving(false);
          return;
        }
      }
      
      // Then update the scholarship details
      const payload: any = {
        title,
        description,
        total_amount: totalAmount ? Number(totalAmount) : undefined,
        total_slot: totalSlot ? Number(totalSlot) : undefined,
        application_deadline: deadline || undefined,
        criteria: criteria ? criteria.split(',').map(s => s.trim()) : undefined,
        required_documents: documents ? documents.split(',').map(s => s.trim()) : undefined,
        type: type || undefined,
        purpose: purpose || undefined,
        status: status || undefined,
      };
      
      const res = await scholarshipService.updateScholarship(String(id), payload);
      if (res.success) {
        setToastType('success');
        setToastTitle('Success');
        setToastMessage('Scholarship updated successfully!');
        setToastVisible(true);
        setNewImageUri(null); // Clear the pending image
        setTimeout(() => setToastVisible(false), 3000);
      } else {
        Alert.alert('Error', res.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const typeItems = [
    { label: 'Merit-Based', value: 'merit_based' },
    { label: 'Skill-Based', value: 'skill_based' },
  ];

  const purposeItems = [
    { label: 'Allowance', value: 'allowance' },
    { label: 'Tuition', value: 'tuition' },
  ];

  const statusItems = [
    { label: 'Active', value: 'active' },
    { label: 'Closed', value: 'closed' },
    { label: 'Archive', value: 'archived' },
  ];

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDeadline(formattedDate);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const typeIconRotate = typeDropdownRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const purposeIconRotate = purposeDropdownRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const statusIconRotate = statusDropdownRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Gallery permission is required to select photos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        // Store the selected image URI to be uploaded on save
        setNewImageUri(asset.uri);
        // Show preview immediately
        setImageUrl(asset.uri);
      }
    } catch (e) {
      console.error('Image picker error:', e);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  return (
    <View style={styles.container}>
      <Toast
        visible={toastVisible}
        type={toastType}
        title={toastTitle}
        message={toastMessage}
      />
      
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#F0F7FF" />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>Edit Scholarship</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3A52A6" />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <Animated.ScrollView style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { marginBottom: 12 }]}>
            <Pressable onPress={pickImage}>
              <View style={styles.imageRow}>
                <Image
                  source={imageUrl ? { uri: imageUrl } : require('@/assets/images/iskolar-logo.png')}
                  style={styles.image}
                  defaultSource={require('@/assets/images/iskolar-logo.png')}
                />
                <Pressable style={styles.changeImageBtn} onPress={pickImage}>
                  <Ionicons name="camera" size={14} color="#F0F7FF" />
                </Pressable>
              </View>
            </Pressable>
          </View>
          <View style={styles.card}>
            <LabeledInput label="Title" value={title} onChangeText={setTitle} placeholder="Scholarship title" />
            <LabeledInput label="Description" value={description} onChangeText={setDescription} placeholder="Brief description" multiline />
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <LabeledInput label="Amount (₱)" value={totalAmount} onChangeText={setTotalAmount} keyboardType="numeric" placeholder="0.00" />
              </View>
              <View style={{ width: 10 }} />
              <View style={{ flex: 1 }}>
                <LabeledInput label="Slots" value={totalSlot} onChangeText={setTotalSlot} keyboardType="numeric" placeholder="0" />
              </View>
            </View>
            {/* Application Deadline picker */}
            <Text style={styles.label}>Application Deadline</Text>
            <Pressable style={styles.dateInputContainer} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateInputText}>{deadline ? formatDate(deadline) : 'Set application deadline'}</Text>
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            </Pressable>
            {showDatePicker && (
              <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onChangeDate} minimumDate={new Date()} />
            )}

            {/* Criteria and documents (comma-separated) */}
            <LabeledInput label="Criteria (comma-separated)" value={criteria} onChangeText={setCriteria} placeholder="example: senior_high,stem" />
            <LabeledInput label="Required Documents (comma-separated)" value={documents} onChangeText={setDocuments} placeholder="example: id,form_137" />

            {/* Dropdowns for Type, Purpose, Status */}
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Type</Text>
                <Animated.View style={{ transform: [{ scale: typeDropdownScale }] }}>
                  <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    iconStyle={styles.iconStyle}
                    containerStyle={styles.dropdownContainer}
                    itemContainerStyle={styles.itemContainer}
                    itemTextStyle={styles.itemText}
                    activeColor="#E0ECFF"
                    data={typeItems}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Select type"
                    value={type}
                    onChange={item => { setType(item.value); }}
                    renderRightIcon={() => (
                      <Animated.View style={{ transform: [{ rotate: typeIconRotate }] }}>
                        <Ionicons name="chevron-down" size={18} color="#6B7280" />
                      </Animated.View>
                    )}
                  />
                </Animated.View>
              </View>
              <View style={{ width: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Purpose</Text>
                <Animated.View style={{ transform: [{ scale: purposeDropdownScale }] }}>
                  <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    iconStyle={styles.iconStyle}
                    containerStyle={styles.dropdownContainer}
                    itemContainerStyle={styles.itemContainer}
                    itemTextStyle={styles.itemText}
                    activeColor="#E0ECFF"
                    data={purposeItems}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Select purpose"
                    value={purpose}
                    onChange={item => { setPurpose(item.value); }}
                    renderRightIcon={() => (
                      <Animated.View style={{ transform: [{ rotate: purposeIconRotate }] }}>
                        <Ionicons name="chevron-down" size={18} color="#6B7280" />
                      </Animated.View>
                    )}
                  />
                </Animated.View>
              </View>
            </View>

            <Text style={styles.label}>Status</Text>
            <Animated.View style={{ transform: [{ scale: statusDropdownScale }] }}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                containerStyle={styles.dropdownContainer}
                itemContainerStyle={styles.itemContainer}
                itemTextStyle={styles.itemText}
                activeColor="#E0ECFF"
                data={statusItems}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select status"
                value={status}
                onChange={item => { setStatus(item.value); }}
                renderRightIcon={() => (
                  <Animated.View style={{ transform: [{ rotate: statusIconRotate }] }}>
                    <Ionicons name="chevron-down" size={18} color="#6B7280" />
                  </Animated.View>
                )}
              />
            </Animated.View>
          </View>

          <Pressable style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={onSave} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#F0F7FF" /> : <>
              <Ionicons name="save-outline" size={16} color="#F0F7FF" />
              <Text style={styles.saveText}>Save Changes</Text>
            </>}
          </Pressable>
          <View style={{ height: 20 }} />
        </Animated.ScrollView>
      )}
    </View>
  );
}

function LabeledInput({ label, multiline, ...props }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholderTextColor="#9aa3af"
        {...props}
        multiline={multiline}
      />
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
  
  content: {
    padding: 16,
  },
  
  topBar: {
    height: 80,
    backgroundColor: '#3A52A6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 28,
    elevation: 2,
  },
  
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  title: {
    color: '#F0F7FF',
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 16,
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
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  
  imageRow: {
    position: 'relative',
  },
  
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
  },
  
  changeImageBtn: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: '#3A52A6',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  label: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#5D6673',
    marginBottom: 6,
    marginTop: 4,
  },
  
  input: {
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 13,
  },
  
  inputMultiline: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  
  row2: {
    flexDirection: 'row',
    gap: 8,
  },
  
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3A52A6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  
  dateInputText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#111827',
  },
  
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3A52A6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  
  placeholderStyle: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  
  selectedTextStyle: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#111827',
  },
  
  iconStyle: {
    width: 20,
    height: 20,
  },
  
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C4CBD5',
    shadowColor: '#3A52A6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 4,
  },
  
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  
  itemText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#111827',
  },
  
  saveBtn: {
    marginTop: 12,
    backgroundColor: '#EFA508',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
  },

  saveText: {
    color: '#F0F7FF',
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
  },
});