import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfilePhoto } from '../components/ProfilePhoto';
import { Segmented } from '../components/Segmented';
import { Card, Field, PrimaryButton, Screen, ScreenTitle, SectionTitle } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { LANGUAGES, useT } from '../i18n/i18n';
import { assignSelfToSalon, fetchMyArtistRow, fetchMyLocations } from '../lib/api';
import { useTheme } from '../theme/ThemeContext';
import { Salon } from '../types';

/**
 * Shared Profile screen for artist + manager roles.
 * Discovery photo (portrait 3:4), editable fields, dirty-state Save button,
 * sun/moon theme pill, and the red Log out button at the very bottom.
 */
export function ProProfileScreen() {
  const { theme, isDark } = useTheme();
  const { profile, signOut, updateProfile } = useAuth();
  const { t, lang, setLang } = useT();
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

  const assignedName = salons.find((s) => s.id === assignedId)?.name ?? t('profile.noSalon');

  async function assignTo(salonId: string) {
    setAssignedId(salonId);
    setAssignOpen(false);
    if (profile) await assignSelfToSalon(profile.id, salonId, name || profile.full_name, email || profile.email);
  }

  const dirty = name !== (profile?.full_name ?? '') || email !== (profile?.email ?? '') || password.length > 0;

  return (
    <Screen clearTabBar>
      <ScreenTitle title={t('profile.myProfile')} subtitle={t('profile.proSubtitle')} />

      <View style={{ alignItems: 'center' }}>
        <ProfilePhoto
          uri={profile?.avatar_url}
          userId={profile?.id ?? 'me'}
          shape="portrait"
          size={210}
          caption={t('profile.discoveryPhoto')}
          onChange={(avatar_url) => updateProfile({ avatar_url })}
        />
      </View>

      <View style={{ gap: 12, marginTop: 20 }}>
        <Field label={t('profile.displayName')} value={name} onChangeText={setName} autoCapitalize="words" />
        <Field label={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Field
          label={t('profile.resetPassword')}
          value={password}
          onChangeText={setPassword}
          placeholder={t('profile.newPassword')}
          secureTextEntry={!showPw}
          rightIcon={showPw ? 'eye-off' : 'eye'}
          onRightIconPress={() => setShowPw((v) => !v)}
        />
        {dirty ? (
          <PrimaryButton
            title={t('common.saveChanges')}
            onPress={() => {
              updateProfile({ full_name: name, email });
              setPassword('');
            }}
          />
        ) : null}
      </View>

      {/* Dashboard — personal stats. In dark theme use a lighter fill + border
          so it separates from the near-black background. */}
      <Pressable
        onPress={() => router.push('/dashboard')}
        style={({ pressed }) => ({
          marginTop: 16,
          backgroundColor: isDark ? '#4c4e55' : theme.inkSurface,
          borderRadius: 18,
          borderWidth: isDark ? 1 : 0,
          borderColor: theme.cardBorder,
          paddingVertical: 18,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Feather name="bar-chart-2" size={20} color="#ffffff" />
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: '#ffffff' }}>{t('profile.dashboard')}</Text>
        <Feather name="chevron-right" size={20} color="#ffffff" />
      </Pressable>

      {/* Salon Dashboard — salon-wide analytics (purple), owners only */}
      {isManager ? (
        <Pressable onPress={() => router.push('/salon-dashboard')} style={({ pressed }) => ({ marginTop: 12, opacity: pressed ? 0.9 : 1 })}>
          <LinearGradient
            colors={['#7B6CF0', '#6C5CE7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 18, paddingVertical: 18, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }}
          >
            <Feather name="grid" size={20} color="#fff" />
            <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: '#fff' }}>{t('profile.salonDashboard')}</Text>
            <Feather name="chevron-right" size={20} color="#fff" />
          </LinearGradient>
        </Pressable>
      ) : null}

      {isManager ? (
        <>
          <SectionTitle>{t('profile.assignedSalon')}</SectionTitle>
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
                  {t('profile.assignedTo')}
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
              {t('profile.addLocationFirst')}
            </Text>
          ) : null}
        </>
      ) : null}

      <SectionTitle>{t('profile.language')}</SectionTitle>
      <Segmented
        options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
        value={lang}
        onChange={setLang}
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
        <Text style={{ color: theme.destructive, fontSize: 16, fontWeight: '700' }}>{t('common.logout')}</Text>
      </Pressable>
    </Screen>
  );
}
