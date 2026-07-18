import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTheme } from '../theme/ThemeContext';

/**
 * Swipe-to-reveal actions row (artist/owner Schedule + manager Team).
 * - Swipe RIGHT reveals a dark "Edit" action on the left (when onEdit given).
 * - Swipe LEFT reveals a red "Delete" action on the right.
 * Both actions share the same size/shape and sit flush under the row.
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

  const action = (
    side: 'left' | 'right',
    icon: keyof typeof Feather.glyphMap,
    label: string,
    bg: string,
    fg: string,
    onPressAction: () => void
  ) => (
    <Pressable
      onPress={() => {
        ref.current?.close();
        onPressAction();
      }}
      style={{
        width: 108,
        backgroundColor: bg,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginLeft: side === 'right' ? 10 : 0,
        marginRight: side === 'left' ? 10 : 0,
      }}
    >
      <Feather name={icon} size={18} color={fg} />
      <Text style={{ color: fg, fontSize: 14, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );

  return (
    <Swipeable
      ref={ref}
      overshootLeft={false}
      overshootRight={false}
      leftThreshold={40}
      rightThreshold={40}
      renderLeftActions={
        onEdit ? () => action('left', 'edit-2', 'Edit', theme.inkSurface, theme.onInk, onEdit) : undefined
      }
      renderRightActions={() => action('right', 'trash-2', 'Delete', theme.destructive, '#fff', onDelete)}
    >
      <Pressable onPress={onPress} disabled={!onPress}>
        {children}
      </Pressable>
    </Swipeable>
  );
}
