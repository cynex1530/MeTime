import { AntDesign } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Segmented } from '../../src/components/Segmented';
import { BackButton, Field, PrimaryButton, Screen } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { useT } from '../../src/i18n/i18n';
import { useTheme } from '../../src/theme/ThemeContext';
import { UserRole } from '../../src/types';
import { SocialButton } from './login';

export default function Register() {
  const { theme } = useTheme();
  const { signUp } = useAuth();
  const { t } = useT();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<UserRole>('customer');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const err = await signUp(name.trim(), email.trim(), password, role);
    setBusy(false);
    if (err) Alert.alert(t('auth.signUpFailed'), err);
    else router.replace('/');
  }

  return (
    <Screen>
      <BackButton />
      <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: theme.text }}>
        {t('register.title')}
      </Text>
      <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4, marginBottom: 24 }}>
        {t('register.subtitle')}
      </Text>

      <View style={{ gap: 12 }}>
        <Field label={t('auth.fullName')} value={name} onChangeText={setName} placeholder="Alex Morgan" autoCapitalize="words" />
        <Field
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          placeholder="8+ characters"
          secureTextEntry={!showPw}
          rightIcon={showPw ? 'eye-off' : 'eye'}
          onRightIconPress={() => setShowPw((v) => !v)}
        />

        <Text
          style={{
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: theme.textTertiary,
            marginTop: 6,
          }}
        >
          {t('auth.iamA')}
        </Text>
        <Segmented<UserRole>
          options={[
            { value: 'customer', label: t('role.customer') },
            { value: 'artist', label: t('role.artist') },
            { value: 'manager', label: t('role.manager') },
          ]}
          value={role}
          onChange={setRole}
        />

        <PrimaryButton
          title={t('auth.createAccount')}
          onPress={submit}
          loading={busy}
          disabled={!name || !email || password.length < 8}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.hairline }} />
        <Text style={{ fontSize: 13, color: theme.textFaint }}>{t('auth.or')}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.hairline }} />
      </View>

      <View style={{ gap: 10 }}>
        <SocialButton
          label={t('auth.google')}
          icon={<AntDesign name="google" size={18} color="#4285F4" />}
          bg={theme.card}
          fg={theme.text}
          border={theme.cardBorder}
        />
        <SocialButton
          label={t('auth.apple')}
          icon={<AntDesign name="apple" size={18} color="#fff" />}
          bg="#1c1c1e"
          fg="#ffffff"
        />
      </View>

      <Link href="/(auth)/login" asChild>
        <Text style={{ textAlign: 'center', marginTop: 22, fontSize: 15, color: theme.textSecondary }}>
          {t('welcome.haveAccount')} <Text style={{ fontWeight: '700', color: theme.text }}>{t('welcome.signIn')}</Text>
        </Text>
      </Link>
    </Screen>
  );
}
