import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Platform, Animated, Modal } from 'react-native';
import { useState, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';

export default function CreateScholarshipPage() {
  const [type, setType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [totalSlot, setTotalSlot] = useState('');
  const [deadline, setDeadline] = useState('');
  const [criteria, setCriteria] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [criteriaInput, setCriteriaInput] = useState('');
  const [documentsInput, setDocumentsInput] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [tempDescription, setTempDescription] = useState('');

  const typeDropdownRotation = useRef(new Animated.Value(0)).current;
  const typeDropdownScale = useRef(new Animated.Value(1)).current;
  const purposeDropdownRotation = useRef(new Animated.Value(0)).current;
  const purposeDropdownScale = useRef(new Animated.Value(1)).current;

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isPurposeDropdownOpen, setIsPurposeDropdownOpen] = useState(false);

  const typeItems = [
    { label: 'Merit-Based', value: 'merit_based' },
    { label: 'Skill-Based', value: 'skill_based' },
  ];

  const purposeItems = [
    { label: 'Allowance', value: 'allowance' },
    { label: 'Tuition', value: 'tuition' },
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const animateDropdown = (rotation: Animated.Value, scale: Animated.Value, isOpen: boolean) => {
    Animated.parallel([
      Animated.spring(rotation, {
        toValue: isOpen ? 1 : 0,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
      Animated.spring(scale, {
        toValue: isOpen ? 1.02 : 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      })
    ]).start();
  };

  const handleTypeDropdownFocus = () => {
    setIsTypeDropdownOpen(true);
    animateDropdown(typeDropdownRotation, typeDropdownScale, true);
  };

  const handleTypeDropdownBlur = () => {
    setIsTypeDropdownOpen(false);
    animateDropdown(typeDropdownRotation, typeDropdownScale, false);
  };

  const handlePurposeDropdownFocus = () => {
    setIsPurposeDropdownOpen(true);
    animateDropdown(purposeDropdownRotation, purposeDropdownScale, true);
  };

  const handlePurposeDropdownBlur = () => {
    setIsPurposeDropdownOpen(false);
    animateDropdown(purposeDropdownRotation, purposeDropdownScale, false);
  };

  const typeIconRotate = typeDropdownRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const purposeIconRotate = purposeDropdownRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const openDescriptionModal = () => {
    setTempDescription(description);
    setShowDescriptionModal(true);
  };

  const saveDescription = () => {
    setDescription(tempDescription);
    setShowDescriptionModal(false);
  };

  const cancelDescription = () => {
    setTempDescription(description);
    setShowDescriptionModal(false);
  };

  const addCriterion = () => {
    const trimmedInput = criteriaInput.trim();
    if (trimmedInput) {
      setCriteria(prevCriteria => [...prevCriteria, trimmedInput]);
      setCriteriaInput('');
    }
  };

  const removeCriterion = (index: number) => {
    setCriteria(prevCriteria => prevCriteria.filter((_, i) => i !== index));
  };

  const addDocument = () => {
    const trimmedInput = documentsInput.trim();
    if (trimmedInput) {
      setDocuments(prevDocuments => [...prevDocuments, trimmedInput]);
      setDocumentsInput('');
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prevDocuments => prevDocuments.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="school" size={24} color="#3A52A6" />
        <Text style={styles.headerText}>Create Scholarship</Text>
        <Pressable style={styles.searchButton}>
          <MaterialIcons name="search" size={20} color="#8B9CB5" />
          <Text style={styles.searchText}>Search</Text>
        </Pressable>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Upload Area */}
        <View style={styles.uploadContainer}>
          <View style={styles.uploadBox}>
            <MaterialIcons name="file-upload" size={48} color="#5B7BA6" />
            <Text style={styles.uploadText}>Drag and drop an image or click to select</Text>
          </View>
        </View>

        {/* Dropdowns */}
        <View style={styles.row}>
          <View style={styles.dropdownWrapper}>
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
                onChange={item => {
                  setType(item.value);
                  handleTypeDropdownBlur();
                }}
                onFocus={handleTypeDropdownFocus}
                onBlur={handleTypeDropdownBlur}
                renderRightIcon={() => (
                  <Animated.View style={{ transform: [{ rotate: typeIconRotate }] }}>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#6B7280" />
                  </Animated.View>
                )}
              />
            </Animated.View>
          </View>

          <View style={styles.dropdownWrapper}>
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
                onChange={item => {
                  setPurpose(item.value);
                  handlePurposeDropdownBlur();
                }}
                onFocus={handlePurposeDropdownFocus}
                onBlur={handlePurposeDropdownBlur}
                renderRightIcon={() => (
                  <Animated.View style={{ transform: [{ rotate: purposeIconRotate }] }}>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#6B7280" />
                  </Animated.View>
                )}
              />
            </Animated.View>
          </View>
        </View>

        {/* Title */}
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.inputTitle}
            value={title}
            onChangeText={setTitle}
            placeholder="Scholarship Title"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Pressable style={styles.addDescriptionButton} onPress={openDescriptionModal}>
            <MaterialIcons name="menu" size={16} color="#8B9CB5" />
            <Text style={styles.addDescriptionText}>
              {description ? 'Edit Description' : 'Add Description'}
            </Text>
          </Pressable>
          {description && (
            <Text style={styles.descriptionPreview} numberOfLines={1}>
              {description}
            </Text>
          )}
        </View>

        {/* Total Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Total Amount</Text>
          <TextInput
            style={styles.input}
            value={totalAmount}
            onChangeText={setTotalAmount}
            placeholder="Enter total amount"
            placeholderTextColor="#A0AEC0"
            keyboardType="numeric"
          />
        </View>

        {/* Total Slot */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Total Slot</Text>
          <TextInput
            style={styles.input}
            value={totalSlot}
            onChangeText={setTotalSlot}
            placeholder="Enter total slot"
            placeholderTextColor="#A0AEC0"
            keyboardType="numeric"
          />
        </View>

        {/* Application Deadline */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Application Deadline</Text>
          <Pressable 
            style={styles.dateInputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={18} color="#6B7280" />
            <Text style={[styles.dateInputText, !deadline && styles.placeholderText]}>
              {deadline ? formatDate(deadline) : 'Set application deadline'}
            </Text>
          </Pressable>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDate}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Criteria */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Criteria</Text>
          <View style={styles.arrayInputContainer}>
            <TextInput
              style={styles.arrayInput}
              value={criteriaInput}
              onChangeText={setCriteriaInput}
              placeholder="Enter eligibility criterion"
              placeholderTextColor="#A0AEC0"
              onSubmitEditing={addCriterion}
              returnKeyType="done"
            />
            <Pressable style={styles.addButton} onPress={addCriterion}>
              <MaterialIcons name="add" size={20} color="#F0F7FF" />
            </Pressable>
          </View>
          {criteria.length > 0 && (
            <View style={styles.tagsContainer}>
              {criteria.map((criterion, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>{criterion}</Text>
                  <Pressable onPress={() => removeCriterion(index)}>
                    <MaterialIcons name="close" size={14} color="#111827" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Required Documents */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Required Documents</Text>
          <View style={styles.arrayInputContainer}>
            <TextInput
              style={styles.arrayInput}
              value={documentsInput}
              onChangeText={setDocumentsInput}
              placeholder="Enter required document"
              placeholderTextColor="#A0AEC0"
              onSubmitEditing={addDocument}
              returnKeyType="done"
            />
            <Pressable style={styles.addButton} onPress={addDocument}>
              <MaterialIcons name="add" size={20} color="#F0F7FF" />
            </Pressable>
          </View>
          {documents.length > 0 && (
            <View style={styles.tagsContainer}>
              {documents.map((document, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>{document}</Text>
                  <Pressable onPress={() => removeDocument(index)}>
                    <MaterialIcons name="close" size={14} color="#111827" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Create Button */}
        <Pressable style={styles.createButton}>
          <Text style={styles.createButtonText}>Create Scholarship</Text>
        </Pressable>
      </ScrollView>

      {/* Description Modal */}
      <Modal
        visible={showDescriptionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDescription}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scholarship Description</Text>
              <Pressable onPress={cancelDescription}>
                <MaterialIcons name="close" size={24} color="#4A5568" />
              </Pressable>
            </View>
            
            <TextInput
              style={styles.modalTextArea}
              value={tempDescription}
              onChangeText={setTempDescription}
              placeholder="Enter detailed description of the scholarship program, its objectives, and what it offers to students..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancelButton} onPress={cancelDescription}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSaveButton} onPress={saveDescription}>
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    backgroundColor: '#F0F7FF',
    gap: 8,
  },
  headerText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 18,
    color: '#3A52A6',
    flex: 1,
    fontWeight: '600',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#5D6673',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 55,
  },
  uploadContainer: {
    borderWidth: 2,
    borderColor: '#3A52A6',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 60,
    marginBottom: 18,
    backgroundColor: 'transparent',
    opacity: 0.8,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#3A52A6',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  uploadText: {
    fontFamily: 'BreeSerif_400Regular',
    marginTop: 12,
    fontSize: 12,
    color: '#3A52A6',
    opacity: 0.7,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  dropdownWrapper: {
    flex: 1,
  },
  dropdown: {
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C4CBD5',
    paddingVertical: 10,
    paddingHorizontal: 14,
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
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C4CBD5',
    shadowColor: '#3A52A6',
    shadowOffset: { width: 0, height: 4 },
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
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#4A5568',
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    fontFamily: 'BreeSerif_400Regular',
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#C4CBD5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    color: '#111827',
  },
  inputTitle: {
    backgroundColor: 'transparent',
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 26,
    color: '#111827',
    paddingBottom: 8,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  addDescriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(93, 102, 115, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  addDescriptionText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  descriptionPreview: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
    marginLeft: 2,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#C4CBD5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dateInputText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  createButton: {
    backgroundColor: '#EFA508',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  createButtonText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
    fontWeight: '600',
    color: '#F0F7FF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 18,
    color: '#3A52A6',
    fontWeight: '600',
  },
  modalTextArea: {
    fontFamily: 'BreeSerif_400Regular',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C4CBD5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    color: '#111827',
    height: 200,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C4CBD5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
    color: '#4A5568',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#3A52A6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
    color: '#F0F7FF',
    fontWeight: '600',
  },
  arrayInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  arrayInput: {
    flex: 1,
    fontFamily: 'BreeSerif_400Regular',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C4CBD5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3A52A6',
    borderRadius: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0ECFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  tagText: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#3A52A6',
    flexShrink: 1,
  },
});