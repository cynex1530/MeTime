import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ProfilePhoto } from '../components/ProfilePhoto';
import { Segmented } from '../components/Segmented';
import { Field, PrimaryButton, Screen, ScreenTitle, SectionTitle } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeContext';

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

  useEffect(() => {
    setName(profile?.full_name ?? '');
    setEmail(profile?.email ?? '');
  }, [profile]);

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
