import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { BackButton, Card, PrimaryButton, Screen } from '../../../src/components/ui';
import { useAuth } from '../../../src/hooks/useAuth';
import { finishBooking } from '../../../src/lib/api';
import { useTheme } from '../../../src/theme/ThemeContext';
import { Booking } from '../../../src/types';

export default function ReviewScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    artist: string;
    service: string;
    salon: string;
    salonId: string;
    artistId: string;
  }>();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (rating === 0) return;
    setBusy(true);
    const booking = {
      id: params.id,
      salon_id: params.salonId || null,
      artist_id: params.artistId || null,
    } as Booking;
    await finishBooking(booking, rating, comment, profile?.id ?? '');
    setBusy(false);
    // back to the bookings list, where the finished booking no longer appears
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/(customer)/bookings');
  }

  return (
    <Screen clearTabBar>
      <BackButton />
      <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: theme.text }}>Leave a review</Text>
      <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4, marginBottom: 20 }}>
        How was your appointment?
      </Text>

      {/* Who / what / where */}
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Feather name="user" size={17} color={theme.iconMuted} />
          <Text style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>{params.artist}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Feather name="scissors" size={17} color={theme.iconMuted} />
          <Text style={{ fontSize: 15, color: theme.textSecondary }}>{params.service}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Feather name="map-pin" size={17} color={theme.iconMuted} />
          <Text style={{ fontSize: 15, color: theme.textSecondary }}>{params.salon}</Text>
        </View>
      </Card>

      {/* Star rating */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 28 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setRating(n)} hitSlop={6}>
            <Ionicons
              name={n <= rating ? 'star' : 'star-outline'}
              size={42}
              color={n <= rating ? '#E8A94B' : theme.hairlineStrong}
            />
          </Pressable>
        ))}
      </View>
      <Text style={{ textAlign: 'center', fontSize: 14, color: theme.textSecondary, marginTop: 10 }}>
        {rating === 0 ? 'Tap a star to rate' : `${rating} / 5`}
      </Text>

      {/* Text review */}
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.cardBorder,
          padding: 14,
          marginTop: 24,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: theme.textTertiary, marginBottom: 6 }}>
          Your review
        </Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Share a few words about the service…"
          placeholderTextColor={theme.textFaint}
          multiline
          style={{ fontSize: 16, color: theme.text, minHeight: 90, textAlignVertical: 'top' }}
        />
      </View>

      <PrimaryButton
        title="Submit review"
        disabled={rating === 0}
        loading={busy}
        onPress={submit}
        style={{ marginTop: 24 }}
      />
    </Screen>
  );
}
