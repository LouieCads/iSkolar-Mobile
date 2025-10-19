import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';

export default function ProfileSetupPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role as 'student' | 'sponsor';

  // Student fields
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Sponsor fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);

    const formattedDate = currentDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    setDateOfBirth(formattedDate);
  };

  const isFormValid = () => {
    if (role === 'student') {
      return fullName && gender && dateOfBirth && contactNumber;
    } else {
      return orgName && orgType && officialEmail && contactNumber;
    }
  };

  const handleComplete = () => {
    if (isFormValid()) {
      // Handle form submission
      console.log('Profile setup complete');
      // Navigate to next screen
    }
  };

  const genderItems = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
  ];

  const orgTypeItems = [
    { label: 'Non-profit', value: 'Non-profit' },
    { label: 'Private Company', value: 'Private Company' },
    { label: 'Government Agency', value: 'Government Agency' },
    { label: 'Educational Institution', value: 'Educational Institution' },
    { label: 'Foundation', value: 'Foundation' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={22} color="#3A52A6" />
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to iSkolar</Text>
        <Text style={styles.subtitle}>
          {role === 'student' 
            ? 'Complete your profile to get started' 
            : 'Set up your organization profile'}
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {role === 'student' ? (
          <>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <RNPickerSelect
                onValueChange={(value) => setGender(value)}
                items={genderItems}
                placeholder={{
                  label: 'Select gender',
                  value: null,
                  color: '#9CA3AF',
                }}
                style={pickerSelectStyles}
                value={gender}
                useNativeAndroidPickerStyle={false}
                Icon={() => (
                  <MaterialIcons name="arrow-drop-down" size={24} color="#3A52A6" />
                )}
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <Pressable onPress={() => setShowDatePicker(true)}>
                <TextInput
                  style={styles.input}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#9CA3AF"
                  value={dateOfBirth}
                  editable={false}
                />
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Contact Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter contact number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={contactNumber}
                onChangeText={setContactNumber}
              />
            </View>
          </>
        ) : (
          <>
            {/* Organization Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Organization Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter organization name"
                placeholderTextColor="#9CA3AF"
                value={orgName}
                onChangeText={setOrgName}
              />
            </View>

            {/* Organization Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Organization Type</Text>
              <RNPickerSelect
                onValueChange={(value) => setOrgType(value)}
                items={orgTypeItems}
                placeholder={{
                  label: 'Select organization type',
                  value: null,
                  color: '#9CA3AF',
                }}
                style={pickerSelectStyles}
                value={orgType}
                useNativeAndroidPickerStyle={false}
                Icon={() => (
                  <MaterialIcons name="arrow-drop-down" size={24} color="#3A52A6" />
                )}
              />
            </View>

            {/* Official Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Official Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter official email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={officialEmail}
                onChangeText={setOfficialEmail}
              />
            </View>

            {/* Contact Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter contact number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={contactNumber}
                onChangeText={setContactNumber}
              />
            </View>
          </>
        )}
      </View>

      {/* Button */}
      <Pressable 
        style={[styles.button, !isFormValid() && styles.buttonDisabled]} 
        disabled={!isFormValid()}
        onPress={handleComplete}
      >
        <Text style={styles.buttonText}>Complete</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 55,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 32,
    color: '#3A52A6',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 16,
    color: '#3A52A6',
    textAlign: 'center',
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#4A5568',
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C4CBD5',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#111827',
  },
  button: {
    backgroundColor: '#3A52A6',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#AEB5C2',
  },
  buttonText: {
    color: '#F0F7FF',
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C4CBD5',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#111827',
    paddingRight: 30,
  },
  inputAndroid: {
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C4CBD5',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#111827',
    paddingRight: 30,
  },
  iconContainer: {
    top: 10,
    right: 12,
  },
  placeholder: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'BreeSerif_400Regular',
  },
});