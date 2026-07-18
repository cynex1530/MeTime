import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ProfilePhoto } from '../../src/components/ProfilePhoto';
import { Segmented } from '../../src/components/Segmented';
import { Field, PrimaryButton, Screen, ScreenTitle, SectionTitle } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/theme/ThemeContext';

export default function CustomerProfile() {
  const { theme, isDark, setDark } = useTheme();
  const { profile, signOut, updateProfile } = useAuth();
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
      <ScreenTitle title="Profile" />
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <ProfilePhoto
          uri={profile?.avatar_url}
          userId={profile?.id ?? 'me'}
          size={110}
          shape="circle"
          caption="Add photo"
          onChange={(avatar_url) => updateProfile({ avatar_url })}
        />
      </View>

      <View style={{ gap: 12 }}>
        <Field label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+1 555 0100" />
        {dirty ? (
          <PrimaryButton
            title="Save changes"
            onPress={() => updateProfile({ full_name: name, email, phone: phone || null })}
          />
        ) : null}
      </View>

      <SectionTitle>Appearance</SectionTitle>
      <Segmented
        options={[
          { value: 'light', label: '☀  Light' },
          { value: 'dark', label: '☾  Dark' },
        ]}
        value={isDark ? 'dark' : 'light'}
        onChange={(v) => setDark(v === 'dark')}
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
        <Text style={{ color: theme.destructive, fontSize: 16, fontWeight: '700' }}>Log out</Text>
      </Pressable>
    </Screen>
  );
}
