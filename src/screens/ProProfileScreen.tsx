import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ProfilePhoto } from '../components/ProfilePhoto';
import { Segmented } from '../components/Segmented';
import { Card, Field, PrimaryButton, Screen, ScreenTitle, SectionTitle } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { assignSelfToSalon, fetchMyArtistRow, fetchMyLocations } from '../lib/api';
import { useTheme } from '../theme/ThemeContext';
import { Salon } from '../types';

/**
 * Shared Profile screen for artist + manager roles.
 * Discovery photo (portrait 3:4), editable fields, dirty-state Save button,
 * sun/moon theme pill, and the red Log out button at the very bottom.
 */
export function ProProfileScreen() {
  const { theme, isDark, setDark } = useTheme();
  const { profile, signOut, updateProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(profile?.full_name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Manager-only: which of their salons they personally work at
  const isManager = profile?.role === 'manager';
  const [salons, setSalons] = useState<Salon[]>([]);
  const [assignedId, setAssignedId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  useEffect(() => {
    setName(profile?.full_name ?? '');
    setEmail(profile?.email ?? '');
  }, [profile]);

  useEffect(() => {
    if (!isManager || !profile) return;
    (async () => {
      const [locs, artistRow] = await Promise.all([
        fetchMyLocations(profile.id),
        fetchMyArtistRow(profile.id),
      ]);
      setSalons(locs);
      setAssignedId(artistRow?.salon_id ?? null);
    })();
  }, [isManager, profile]);

  const assignedName = salons.find((s) => s.id === assignedId)?.name ?? 'No salon selected';

  async function assignTo(salonId: string) {
    setAssignedId(salonId);
    setAssignOpen(false);
    if (profile) await assignSelfToSalon(profile.id, salonId, name || profile.full_name, email || profile.email);
  }

  const dirty = name !== (profile?.full_name ?? '') || email !== (profile?.email ?? '') || password.length > 0;

  return (
    <Screen clearTabBar>
      <ScreenTitle title="My profile" subtitle="What customers see when they book you" />

      <View style={{ alignItems: 'center' }}>
        <ProfilePhoto
          uri={profile?.avatar_url}
          userId={profile?.id ?? 'me'}
          shape="portrait"
          size={210}
          caption="Discovery photo"
          onChange={(avatar_url) => updateProfile({ avatar_url })}
        />
      </View>

      <View style={{ gap: 12, marginTop: 20 }}>
        <Field label="Display name" value={name} onChangeText={setName} autoCapitalize="words" />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Field
          label="Reset password"
          value={password}
          onChangeText={setPassword}
          placeholder="New password"
          secureTextEntry={!showPw}
          rightIcon={showPw ? 'eye-off' : 'eye'}
          onRightIconPress={() => setShowPw((v) => !v)}
        />
        {dirty ? (
          <PrimaryButton
            title="Save changes"
            onPress={() => {
              updateProfile({ full_name: name, email });
              setPassword('');
            }}
          />
        ) : null}
      </View>

      {isManager ? (
        <>
          <SectionTitle>Assigned salon</SectionTitle>
          <Card
            onPress={() => salons.length > 0 && setAssignOpen((v) => !v)}
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    color: theme.textTertiary,
                  }}
                >
                  Assigned to
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginTop: 3 }}>
                  {assignedName}
                </Text>
              </View>
              <Feather name={assignOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.iconMuted} />
            </View>
            {assignOpen
              ? salons.map((s, i) => (
                  <Pressable
                    key={s.id}
                    onPress={() => assignTo(s.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderTopWidth: 1,
                      borderTopColor: theme.hairline,
                    }}
                  >
                    <Text style={{ fontSize: 16, color: theme.text }}>{s.name}</Text>
                    {assignedId === s.id ? <Feather name="check" size={18} color={theme.iconStroke} /> : null}
                  </Pressable>
                ))
              : null}
          </Card>
          {salons.length === 0 ? (
            <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 8 }}>
              Add a location first to assign yourself to it.
            </Text>
          ) : null}
        </>
      ) : null}

      <SectionTitle>Appearance</SectionTitle>
      <Segmented
        options={[
          { value: 'light', label: '☀  Light' },
          { value: 'dark', label: '☾  Dark' },
        ]}
        value={isDark ? 'dark' : 'light'}
        onChange={(v) => setDark(v === 'dark')}
      />

      {/* Log out — red text + red border, bottom of the screen, both themes */}
      <Pressable
        onPress={async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        }}
        style={({ pressed }) => ({
          marginTop: 32,
          backgroundColor: theme.card,
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: theme.destructiveBorder,
          paddingVertical: 16,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Feather name="log-out" size={17} color={theme.destructive} />
        <Text style={{ color: theme.destructive, fontSize: 16, fontWeight: '700' }}>Log out</Text>
      </Pressable>
    </Screen>
  );
}
