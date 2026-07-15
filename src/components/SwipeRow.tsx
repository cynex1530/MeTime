import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTheme } from '../theme/ThemeContext';

/**
 * Swipe-to-reveal delete row (artist Schedule + manager Team).
 * Dragging left reveals a full-word red "Delete" action (~112px) on the right.
 */
export function SwipeRow({
  children,
  onDelete,
  onPress,
}: {
  children: React.ReactNode;
  onDelete: () => void;
  onPress?: () => void;
}) {
  const { theme } = useTheme();
  const ref = React.useRef<Swipeable>(null);

  return (
    <Swipeable
      ref={ref}
      overshootRight={false}
      rightThreshold={40}
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
