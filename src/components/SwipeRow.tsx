import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useT } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';

/**
 * Swipe-to-reveal actions row (artist/owner Schedule + manager Team).
 * - Swipe RIGHT reveals a dark "Edit" action on the left (icon then label).
 * - Swipe LEFT reveals a red "Delete" action on the right (label then icon).
 * Both fill the row height and sit flush behind it, matching the design.
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
  const { t } = useT();
  const ref = React.useRef<Swipeable>(null);

  const leftEdit = () => (
    // full-height wrapper guarantees the block matches the row height
    <View style={{ justifyContent: 'center', marginRight: 10 }}>
      <Pressable
        onPress={() => {
          ref.current?.close();
          onEdit?.();
        }}
        style={{
          flex: 1,
          width: 118,
          backgroundColor: theme.inkSurface,
          borderRadius: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Feather name="edit-2" size={18} color={theme.onInk} />
        <Text style={{ color: theme.onInk, fontSize: 15, fontWeight: '700' }}>{t('common.edit')}</Text>
      </Pressable>
    </View>
  );

  const rightDelete = () => (
    <View style={{ justifyContent: 'center', marginLeft: 10 }}>
      <Pressable
        onPress={() => {
          ref.current?.close();
          onDelete();
        }}
        style={{
          flex: 1,
          width: 118,
          backgroundColor: theme.destructive,
          borderRadius: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{t('common.delete')}</Text>
        <Feather name="trash-2" size={18} color="#fff" />
      </Pressable>
    </View>
  );

  return (
    <Swipeable
      ref={ref}
      overshootLeft={false}
      overshootRight={false}
      leftThreshold={40}
      rightThreshold={40}
      renderLeftActions={onEdit ? leftEdit : undefined}
      renderRightActions={rightDelete}
    >
      <Pressable onPress={onPress} disabled={!onPress}>
        {children}
      </Pressable>
    </Swipeable>
  );
}
