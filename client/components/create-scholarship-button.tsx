import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CreateScholarshipButtonProps {
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  iconColor?: string;
  backgroundColor?: string;
  bottom?: number;
  right?: number;
  size?: number;
}

export default function CreateScholarshipButton({
  onPress,
  iconName = 'add',
  iconSize = 25,
  iconColor = '#F0F7FF',
  backgroundColor = '#EFA508',
  bottom = 68,
  right = 14,
  size = 54,
}: CreateScholarshipButtonProps) {
  return (
    <Pressable
      style={[
        styles.createScholarshipButton,
        {
          bottom,
          right,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons name={iconName} size={iconSize} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  createScholarshipButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});