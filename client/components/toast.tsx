import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { MaterialIcons } from '@expo/vector-icons';

interface ToastProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
}

export default function Toast({ visible, type, title, message }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 0, translateX: 500 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: 500 }}
          transition={{
            type: 'spring',
            stiffness: 2000,
            damping: 100,
          }}
          style={[
            styles.toastWrapper,
            { backgroundColor: type === 'success' ? '#31D0AA' : '#EF4444' }
          ]}
        >
          <View style={styles.toastContent}>
            <View style={styles.iconContainer}>
              {type === 'success' ? (
                <MaterialIcons name="check-circle" size={23} color="#31D0AA" />
              ) : (
                <MaterialIcons name="error" size={23} color="#EF4444" />
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>
          </View>
        </MotiView>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 325,
    height: 55,
    borderRadius: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 320,
    height: 55,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
    opacity: 0.8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 14,
    color: '#111827',
  },
  message: {
    fontFamily: 'BreeSerif_400Regular',
    fontSize: 12,
    color: '#111827',
    opacity: 0.85,
  },
});