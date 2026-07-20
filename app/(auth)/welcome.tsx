import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { PrimaryButton, Screen } from '../../src/components/ui';
import { useT } from '../../src/i18n/i18n';
import { useTheme } from '../../src/theme/ThemeContext';

const FEATURES: Array<{ icon: keyof typeof Feather.glyphMap; key: string }> = [
  { icon: 'map-pin', key: 'welcome.f1' },
  { icon: 'calendar', key: 'welcome.f2' },
  { icon: 'star', key: 'welcome.f3' },
];

export default function Welcome() {
  const { theme } = useTheme();
  const { t } = useT();
  const router = useRouter();

  return (
    <Screen scroll={false} style={{ justifyContent: 'center' }}>
      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          letterSpacing: 5,
          textTransform: 'uppercase',
          color: theme.textSecondary,
        }}
      >
        {t('welcome.eyebrow')}
      </Text>
      <Text
        style={{
          fontSize: 52,
          fontWeight: '800',
          letterSpacing: -1.5,
          color: theme.text,
          marginTop: 4,
        }}
      >
        Me Time
      </Text>
      <Text style={{ fontSize: 16, color: theme.textSecondary, marginTop: 8 }}>
        {t('welcome.tagline')}
      </Text>

      <View style={{ gap: 14, marginTop: 36 }}>
        {FEATURES.map((f) => (
          <View key={f.icon} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name={f.icon} size={20} color={theme.iconStroke} />
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: theme.text }}>{t(f.key)}</Text>
          </View>
        ))}
      </View>

      <PrimaryButton
        title={t('welcome.getStarted')}
        onPress={() => router.push('/(auth)/register')}
        style={{ marginTop: 40 }}
      />
      <Link href="/(auth)/login" asChild>
        <Text
          style={{
            textAlign: 'center',
            marginTop: 18,
            fontSize: 15,
            color: theme.textSecondary,
          }}
        >
          {t('welcome.haveAccount')} <Text style={{ fontWeight: '700', color: theme.text }}>{t('welcome.signIn')}</Text>
        </Text>
      </Link>
    </Screen>
  );
}
