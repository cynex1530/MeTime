import { AntDesign, Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { BackButton, Field, PrimaryButton, Screen } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { useT } from '../../src/i18n/i18n';
import { useTheme } from '../../src/theme/ThemeContext';

export default function Login() {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const { t } = useT();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const err = await signIn(email.trim(), password);
    setBusy(false);
    if (err) Alert.alert(t('auth.signInFailed'), err);
    else router.replace('/');
  }

  return (
    <Screen>
      <BackButton />
      <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: theme.text }}>{t('login.title')}</Text>
      <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4, marginBottom: 24 }}>
        {t('login.subtitle')}
      </Text>

      <View style={{ gap: 12 }}>
        <Field
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Field
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry={!showPw}
          rightIcon={showPw ? 'eye-off' : 'eye'}
          onRightIconPress={() => setShowPw((v) => !v)}
        />
        <PrimaryButton title={t('login.title')} onPress={submit} loading={busy} disabled={!email || !password} />
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

      <Link href="/(auth)/register" asChild>
        <Text style={{ textAlign: 'center', marginTop: 22, fontSize: 15, color: theme.textSecondary }}>
          {t('auth.newHere')} <Text style={{ fontWeight: '700', color: theme.text }}>{t('auth.createOne')}</Text>
        </Text>
      </Link>
    </Screen>
  );
}

export function SocialButton({
  label,
  icon,
  bg,
  fg,
  border,
}: {
  label: string;
  icon: React.ReactNode;
  bg: string;
  fg: string;
  border?: string;
}) {
  const { t } = useT();
  return (
    <Pressable
      onPress={() => Alert.alert(t('auth.comingSoon'), t('auth.socialSoon'))}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: bg,
        borderWidth: border ? 1 : 0,
        borderColor: border,
        borderRadius: 18,
        paddingVertical: 15,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {icon}
      <Text style={{ fontSize: 15, fontWeight: '600', color: fg }}>{label}</Text>
    </Pressable>
  );
}
