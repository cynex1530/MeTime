import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { Sheet } from '../components/Sheet';
import { Card, Chip, Field, PrimaryButton, Screen, ScreenTitle, SectionTitle } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { deleteService, fetchMyArtistRow, fetchMyServices, upsertService } from '../lib/api';
import { formatDuration, formatPrice, HOUR_OPTIONS, SLOT_OPTIONS } from '../lib/format';
import { useTheme } from '../theme/ThemeContext';
import { Service } from '../types';

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ServicesScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [artistId, setArtistId] = useState<string>('me');
  const [services, setServices] = useState<Service[]>([]);
  const [workDays, setWorkDays] = useState<Record<string, boolean>>({
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false,
  });
  const [openHour, setOpenHour] = useState('09:00');
  const [closeHour, setCloseHour] = useState('18:00');
  const [slotLen, setSlotLen] = useState(60);
  const [vacOn, setVacOn] = useState(false);
  const [timeOff, setTimeOff] = useState([{ id: 'vac1', label: 'Jul 20 – Jul 27' }]);

  const [showAdd, setShowAdd] = useState(false);
  const [hourPicker, setHourPicker] = useState<'open' | 'close' | null>(null);
  const [showAddVac, setShowAddVac] = useState(false);
  const [f, setF] = useState({ name: '', price: '', dur: '45' });
  const [vacF, setVacF] = useState({ start: '', end: '' });

  useEffect(() => {
    (async () => {
      const artist = profile ? await fetchMyArtistRow(profile.id) : null;
      if (artist) {
        setArtistId(artist.id);
        setSlotLen(artist.slot_minutes);
        setVacOn(artist.on_vacation);
      }
      setServices(await fetchMyServices(artist?.id ?? null));
    })();
  }, [profile]);

  function addService() {
    const priceCents = Math.round(parseFloat(f.price || '0') * 100) || 0;
    const dur = parseInt(f.dur, 10) || 45;
    const svc: Service = {
      id: `local-${Date.now()}`,
      artist_id: artistId,
      name: f.name.trim(),
      duration_minutes: dur,
      price_cents: priceCents,
    };
    if (!svc.name) return;
    setServices((s) => [...s, svc]);
    upsertService(svc);
    setShowAdd(false);
    setF({ name: '', price: '', dur: '45' });
  }

  return (
    <Screen clearTabBar>
      <ScreenTitle title="Services" subtitle="What you offer and when you work" />

      <View style={{ gap: 10 }}>
        {services.map((s) => (
          <Card key={s.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{s.name}</Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>
                {formatDuration(s.duration_minutes)} · {formatPrice(s.price_cents)}
              </Text>
            </View>
            <Pressable
              hitSlop={10}
              onPress={() => {
                deleteService(s.id);
                setServices((list) => list.filter((x) => x.id !== s.id));
              }}
            >
              <Feather name="x" size={18} color={theme.iconStroke} />
            </Pressable>
          </Card>
        ))}
        {/* dashed add-service tile */}
        <Pressable
          onPress={() => setShowAdd(true)}
          style={{
            borderRadius: 16,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: theme.hairlineStrong,
            paddingVertical: 18,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Feather name="plus" size={18} color={theme.iconStroke} />
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.textSecondary }}>Add service</Text>
        </Pressable>
      </View>

      <SectionTitle>Working days</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {DAY_ORDER.map((d) => (
          <Chip
            key={d}
            label={d}
            selected={!!workDays[d]}
            onPress={() => setWorkDays((w) => ({ ...w, [d]: !w[d] }))}
          />
        ))}
      </View>

      <SectionTitle>Hours</SectionTitle>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {(
          [
            { key: 'open' as const, label: 'OPENS', value: openHour },
            { key: 'close' as const, label: 'CLOSES', value: closeHour },
          ]
        ).map((h) => (
          <Card key={h.key} onPress={() => setHourPicker(h.key)} style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, color: theme.textTertiary }}>
              {h.label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>{h.value}</Text>
              <Feather name="chevron-down" size={16} color={theme.iconMuted} />
            </View>
          </Card>
        ))}
      </View>

      <SectionTitle>Slot length</SectionTitle>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {SLOT_OPTIONS.map((o) => (
          <Chip key={o.minutes} label={o.label} selected={slotLen === o.minutes} onPress={() => setSlotLen(o.minutes)} />
        ))}
      </View>

      <SectionTitle>Time off</SectionTitle>
      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>Vacation mode</Text>
        <Switch
          value={vacOn}
          onValueChange={setVacOn}
          trackColor={{ true: theme.inkSurface, false: undefined }}
        />
      </Card>
      <View style={{ gap: 10, marginTop: 10 }}>
        {timeOff.map((v) => (
          <Card key={v.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Feather name="calendar" size={18} color={theme.iconStroke} />
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: theme.text }}>{v.label}</Text>
            <Pressable hitSlop={10} onPress={() => setTimeOff((t) => t.filter((x) => x.id !== v.id))}>
              <Feather name="x" size={18} color={theme.iconStroke} />
            </Pressable>
          </Card>
        ))}
        {/* surface-styled CTA: matches the Start/End field containers in both themes */}
        <Pressable
          onPress={() => setShowAddVac(true)}
          style={({ pressed }) => ({
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            borderRadius: 18,
            paddingVertical: 17,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>Add time off</Text>
        </Pressable>
      </View>

      {/* Add service sheet */}
      <Sheet visible={showAdd} onClose={() => setShowAdd(false)}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 14 }}>Add service</Text>
        <View style={{ gap: 12 }}>
          <Field label="Service name" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} placeholder="Classic Cut" />
          <Field label="Price ($)" value={f.price} onChangeText={(v) => setF({ ...f, price: v })} placeholder="35" keyboardType="decimal-pad" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {SLOT_OPTIONS.map((o) => (
              <Chip key={o.minutes} label={o.label} selected={f.dur === String(o.minutes)} onPress={() => setF({ ...f, dur: String(o.minutes) })} />
            ))}
          </View>
          <PrimaryButton title="Add service" disabled={!f.name.trim()} onPress={addService} />
        </View>
      </Sheet>

      {/* Hour picker sheet */}
      <Sheet visible={hourPicker !== null} onClose={() => setHourPicker(null)}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 14 }}>
          {hourPicker === 'open' ? 'Opens at' : 'Closes at'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 10 }}>
          {HOUR_OPTIONS.map((h) => {
            const sel = (hourPicker === 'open' ? openHour : closeHour) === h;
            return (
              <Pressable
                key={h}
                onPress={() => {
                  if (hourPicker === 'open') setOpenHour(h);
                  else setCloseHour(h);
                  setHourPicker(null);
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: sel ? theme.inkSurface : theme.bg,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: sel ? theme.onInk : theme.text }}>{h}</Text>
              </Pressable>
            );
          })}
        </View>
      </Sheet>

      {/* Add time off sheet */}
      <Sheet visible={showAddVac} onClose={() => setShowAddVac(false)}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 14 }}>Add time off</Text>
        <View style={{ gap: 12 }}>
          <Field label="Start" value={vacF.start} onChangeText={(v) => setVacF({ ...vacF, start: v })} placeholder="Jul 20" />
          <Field label="End" value={vacF.end} onChangeText={(v) => setVacF({ ...vacF, end: v })} placeholder="Jul 27" />
          <PrimaryButton
            title="Add time off"
            disabled={!vacF.start || !vacF.end}
            onPress={() => {
              setTimeOff((t) => [...t, { id: `vac-${Date.now()}`, label: `${vacF.start} – ${vacF.end}` }]);
              setShowAddVac(false);
              setVacF({ start: '', end: '' });
            }}
          />
        </View>
      </Sheet>
    </Screen>
  );
}
