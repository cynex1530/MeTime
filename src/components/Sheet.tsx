import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { radii } from '../theme/tokens';
import { Grabber } from './ui';

/**
 * Bottom sheet: 28px top radius, drag grabber, scrim tap-to-dismiss,
 * slide-up entry over .3s with the design's spring-ish curve.
 */
export function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      translateY.setValue(Dimensions.get('window').height);
    }
  }, [visible, translateY]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={{ flex: 1, backgroundColor: theme.scrim }} onPress={onClose} />
        <Animated.View
          style={{
            transform: [{ translateY }],
            backgroundColor: theme.card,
            borderTopLeftRadius: radii.sheet,
            borderTopRightRadius: radii.sheet,
            paddingTop: 12,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 20,
            maxHeight: '88%',
          }}
        >
          <Grabber />
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Centered confirm dialog (frosted popover) used for destructive confirmations */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: theme.scrim, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <View style={{ backgroundColor: theme.popoverBg, borderRadius: 20, padding: 20, width: '100%', maxWidth: 320 }}>
          <Animated.Text style={{ fontSize: 17, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
            {title}
          </Animated.Text>
          <Animated.Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginTop: 6 }}>
            {message}
          </Animated.Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            <Pressable
              onPress={onCancel}
              style={{ flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: theme.hairlineStrong, alignItems: 'center' }}
            >
              <Animated.Text style={{ color: theme.text, fontWeight: '600' }}>Cancel</Animated.Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{ flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: theme.destructive, alignItems: 'center' }}
            >
              <Animated.Text style={{ color: '#fff', fontWeight: '700' }}>{confirmLabel}</Animated.Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
