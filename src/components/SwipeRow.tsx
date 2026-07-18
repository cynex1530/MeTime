import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTheme } from '../theme/ThemeContext';

/**
 * Swipe-to-reveal actions row (artist Schedule + manager Team).
 * - Swipe RIGHT reveals a dark "Edit" action on the left (when onEdit given).
 * - Swipe LEFT reveals a full-word red "Delete" action (~112px) on the right.
 */
export function SwipeRow({
  children,
  onDelete,
  onEdit,
  onPress,
}: {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit?: () => void;
  onPress?: () => void;
}) {
  const { theme } = useTheme();
  const ref = React.useRef<Swipeable>(null);

  return (
    <Swipeable
      ref={ref}
      overshootLeft={false}
      overshootRight={false}
      leftThreshold={40}
      rightThreshold={40}
      renderLeftActions={
        onEdit
          ? () => (
              <Pressable
                onPress={() => {
                  ref.current?.close();
                  onEdit();
                }}
                style={{
                  width: 112,
                  marginRight: 10,
                  borderRadius: 16,
                  backgroundColor: theme.inkSurface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                <Feather name="edit-2" size={18} color={theme.onInk} />
                <Text style={{ color: theme.onInk, fontSize: 14, fontWeight: '700' }}>Edit</Text>
              </Pressable>
            )
          : undefined
      }
      renderRightActions={() => (
        <Pressable
          onPress={() => {
            ref.current?.close();
            onDelete();
          }}
          style={{
            width: 112,
            marginLeft: 10,
            borderRadius: 16,
            backgroundColor: theme.destructive,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Feather name="trash-2" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Delete</Text>
        </Pressable>
      )}
    >
      <Pressable onPress={onPress} disabled={!onPress}>
        <View>{children}</View>
      </Pressable>
    </Swipeable>
  );
}
