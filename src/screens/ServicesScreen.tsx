import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { Sheet } from '../components/Sheet';
import { Card, Chip, Field, PrimaryButton, Screen, ScreenTitle, SectionTitle } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { deleteService, fetchMyArtistRow, fetchMyServices } from '../lib/api';
import { formatDuration, formatPrice, HOUR_OPTIONS, SLOT_OPTIONS } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';
import { Service } from '../types';

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LUNCH_TIMES = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
const BREAK_MINUTES = [15, 30, 45, 60, 90];

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
  const [slotLen, setSlotLen] = useState(60); // pending selection
  const [savedSlotLen, setSavedSlotLen] = useState(60); // persisted value
  const [customOpen, setCustomOpen] = useState(false);
  const [customVal, setCustomVal] = useState('');
  const [vacOn, setVacOn] = useState(false);
  const [timeOff, setTimeOff] = useState([{ id: 'vac1', label: 'Jul 20 – Jul 27' }]);

  // Lunch break applied to every working day (same time daily)
  const [lunchBreak, setLunchBreak] = useState<{ start: string; minutes: number } | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [editServiceId, setEditServiceId] = useState<string | null>(null); // null = adding
  const [hourPicker, setHourPicker] = useState<'open' | 'close' | null>(null);
  const [showAddVac, setShowAddVac] = useState(false);
  const [showLunch, setShowLunch] = useState(false);
  const [f, setF] = useState({ name: '', price: '' });
  const [vacF, setVacF] = useState({ start: '', end: '' });
  const [lunchF, setLunchF] = useState({ start: '12:00', minutes: 30 });

  useEffect(() => {
    (async () => {
      const artist = profile ? await fetchMyArtistRow(profile.id) : null;
      if (artist) {
        setArtistId(artist.id);
        setSlotLen(artist.slot_minutes);
        setSavedSlotLen(artist.slot_minutes);
        if (!SLOT_OPTIONS.some((o) => o.minutes === artist.slot_minutes)) {
          setCustomOpen(true);
          setCustomVal(String(artist.slot_minutes));
        }
        setVacOn(artist.on_vacation);
        if (artist.open_hour) setOpenHour(artist.open_hour);
        if (artist.close_hour) setCloseHour(artist.close_hour);
        if (artist.lunch_start && artist.lunch_minutes) {
          setLunchBreak({ start: artist.lunch_start, minutes: artist.lunch_minutes });
        }
      }
      setServices(await fetchMyServices(artist?.id ?? null));
    })();
  }, [profile]);

  // Persist schedule settings so the customer booking flow can build slots.
  async function persistSchedule(patch: Record<string, unknown>) {
    if (supabase && artistId && artistId !== 'me') {
      await supabase.from('artists').update(patch).eq('id', artistId);
    }
  }

  function openAddService() {
    setEditServiceId(null);
    setF({ name: '', price: '' });
    setShowAdd(true);
  }

  function openEditService(svc: Service) {
    setEditServiceId(svc.id);
    setF({ name: svc.name, price: String(svc.price_cents / 100) });
    setShowAdd(true);
  }

  // Every service uses the artist's slot length as its duration.
  async function saveService() {
    const name = f.name.trim();
    if (!name) return;
    const price_cents = Math.round(parseFloat(f.price || '0') * 100) || 0;
    const duration_minutes = slotLen;

    if (editServiceId) {
      setServices((list) =>
        list.map((x) => (x.id === editServiceId ? { ...x, name, price_cents, duration_minutes } : x))
      );
      if (supabase && !editServiceId.startsWith('local')) {
        await supabase.from('services').update({ name, price_cents, duration_minutes }).eq('id', editServiceId);
      }
    } else {
      let created: Service = { id: `local-${Date.now()}`, artist_id: artistId, name, duration_minutes, price_cents };
      if (supabase && artistId !== 'me') {
        const { data } = await supabase
          .from('services')
          .insert({ artist_id: artistId, name, duration_minutes, price_cents })
          .select()
          .single();
        if (data) created = data as Service;
      }
      setServices((s) => [...s, created]);
    }
    setShowAdd(false);
    setEditServiceId(null);
    setF({ name: '', price: '' });
  }

  // Persist a new slot length + bring every service's duration in line with it.
  async function saveSlotLength() {
    setSavedSlotLen(slotLen);
    await persistSchedule({ slot_minutes: slotLen });
    setServices((list) => list.map((x) => ({ ...x, duration_minutes: slotLen })));
    if (supabase && artistId !== 'me') {
      await supabase.from('services').update({ duration_minutes: slotLen }).eq('artist_id', artistId);
    }
  }

  return (
    <Screen clearTabBar>
      <ScreenTitle title="Services" subtitle="What you offer and when you work" />

      <View style={{ gap: 10 }}>
        {services.map((s) => (
          <Card key={s.id} onPress={() => openEditService(s)} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{s.name}</Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>
                {formatDuration(s.duration_minutes)} · {formatPrice(s.price_cents)}
              </Text>
            </View>
            <Feather name="edit-2" size={16} color={theme.iconMuted} style={{ marginRight: 14 }} />
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
          onPress={openAddService}
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
      <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 10, marginTop: -6 }}>
        Every service uses this length. Changes apply from tomorrow.
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {SLOT_OPTIONS.map((o) => (
          <Chip
            key={o.minutes}
            label={o.label}
            selected={!customOpen && slotLen === o.minutes}
            onPress={() => {
              setCustomOpen(false);
              setSlotLen(o.minutes);
            }}
          />
        ))}
        <Chip
          label="Custom"
          selected={customOpen}
          onPress={() => {
            setCustomOpen(true);
            setCustomVal(String(slotLen));
          }}
        />
      </View>
      {customOpen ? (
        <View style={{ marginTop: 10 }}>
          <Field
            label="Custom length (minutes)"
            value={customVal}
            onChangeText={(v) => {
              const digits = v.replace(/[^0-9]/g, '');
              setCustomVal(digits);
              const n = parseInt(digits, 10);
              if (n > 0) setSlotLen(n);
            }}
            keyboardType="number-pad"
            placeholder="e.g. 75"
          />
        </View>
      ) : null}
      {slotLen !== savedSlotLen ? (
        <PrimaryButton title="Save slot length" onPress={saveSlotLength} style={{ marginTop: 12 }} />
      ) : null}

      <SectionTitle>Lunch break</SectionTitle>
      {lunchBreak ? (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Feather name="coffee" size={18} color={theme.iconStroke} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>
              {lunchBreak.start} · {lunchBreak.minutes} min
            </Text>
            <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 1 }}>Every working day</Text>
          </View>
          <Pressable
            hitSlop={8}
            onPress={() => {
              setLunchF(lunchBreak);
              setShowLunch(true);
            }}
          >
            <Feather name="edit-2" size={17} color={theme.iconStroke} />
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => {
              setLunchBreak(null);
              persistSchedule({ lunch_start: null, lunch_minutes: null });
            }}
          >
            <Feather name="x" size={18} color={theme.iconStroke} />
          </Pressable>
        </Card>
      ) : (
        <Pressable
          onPress={() => {
            setLunchF({ start: '12:00', minutes: 30 });
            setShowLunch(true);
          }}
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
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.textSecondary }}>Add lunch break</Text>
        </Pressable>
      )}

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

      {/* Add / edit service sheet */}
      <Sheet visible={showAdd} onClose={() => setShowAdd(false)}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 14 }}>
          {editServiceId ? 'Edit service' : 'Add service'}
        </Text>
        <View style={{ gap: 12 }}>
          <Field label="Service name" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} placeholder="Classic Cut" />
          <Field label="Price ($)" value={f.price} onChangeText={(v) => setF({ ...f, price: v })} placeholder="35" keyboardType="decimal-pad" />
          {/* Duration is fixed to the slot length — not chosen per service */}
          <Text style={{ fontSize: 13, color: theme.textSecondary }}>
            Duration: {formatDuration(slotLen)} (your slot length)
          </Text>
          <PrimaryButton
            title={editServiceId ? 'Save service' : 'Add service'}
            disabled={!f.name.trim()}
            onPress={saveService}
          />
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
                  if (hourPicker === 'open') {
                    setOpenHour(h);
                    persistSchedule({ open_hour: h });
                  } else {
                    setCloseHour(h);
                    persistSchedule({ close_hour: h });
                  }
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

      {/* Lunch break sheet */}
      <Sheet visible={showLunch} onClose={() => setShowLunch(false)}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 4 }}>Lunch break</Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 16 }}>
          Applied to every working day at the same time.
        </Text>

        <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: theme.textTertiary, marginBottom: 8 }}>
          Start time
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {LUNCH_TIMES.map((t) => (
            <Chip key={t} label={t} selected={lunchF.start === t} onPress={() => setLunchF((p) => ({ ...p, start: t }))} />
          ))}
        </View>

        <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: theme.textTertiary, marginBottom: 8 }}>
          Break length
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {BREAK_MINUTES.map((m) => (
            <Chip
              key={m}
              label={`${m} min`}
              selected={lunchF.minutes === m}
              onPress={() => setLunchF((p) => ({ ...p, minutes: m }))}
            />
          ))}
        </View>

        <PrimaryButton
          title="Save lunch break"
          onPress={() => {
            setLunchBreak({ start: lunchF.start, minutes: lunchF.minutes });
            persistSchedule({ lunch_start: lunchF.start, lunch_minutes: lunchF.minutes });
            setShowLunch(false);
          }}
        />
      </Sheet>
    </Screen>
  );
}
