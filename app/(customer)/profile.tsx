import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ProfilePhoto } from '../../src/components/ProfilePhoto';
import { Segmented } from '../../src/components/Segmented';
import { Field, PrimaryButton, Screen, ScreenTitle, SectionTitle } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { LANGUAGES, useT } from '../../src/i18n/i18n';
import { useTheme } from '../../src/theme/ThemeContext';

export default function CustomerProfile() {
  const { theme, isDark, setDark } = useTheme();
  const { profile, signOut, updateProfile } = useAuth();
  const { t, lang, setLang } = useT();
  const router = useRouter();

  const [name, setName] = useState(profile?.full_name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');

  useEffect(() => {
    setName(profile?.full_name ?? '');
    setEmail(profile?.email ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile]);

  const dirty =
    name !== (profile?.full_name ?? '') ||
    email !== (profile?.email ?? '') ||
    phone !== (profile?.phone ?? '');

  return (
    <Screen clearTabBar>
      <ScreenTitle title={t('profile.title')} />
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <ProfilePhoto
          uri={profile?.avatar_url}
          userId={profile?.id ?? 'me'}
          size={110}
          shape="circle"
          caption={t('photo.add')}
          showReplace={false}
          onChange={(avatar_url) => updateProfile({ avatar_url })}
        />
      </View>

      <View style={{ gap: 12 }}>
        <Field label={t('auth.fullName')} value={name} onChangeText={setName} autoCapitalize="words" />
        <Field label={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Field label={t('profile.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+1 555 0100" />
        {dirty ? (
          <PrimaryButton
            title={t('common.saveChanges')}
            onPress={() => updateProfile({ full_name: name, email, phone: phone || null })}
          />
        ) : null}
      </View>

      <SectionTitle>{t('profile.appearance')}</SectionTitle>
      <Segmented
        options={[
          { value: 'light', label: t('profile.light') },
          { value: 'dark', label: t('profile.dark') },
        ]}
        value={isDark ? 'dark' : 'light'}
        onChange={(v) => setDark(v === 'dark')}
      />

      <SectionTitle>{t('profile.language')}</SectionTitle>
      <Segmented
        options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
        value={lang}
        onChange={setLang}
      />

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
