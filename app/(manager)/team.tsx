import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AvatarSlot } from '../../src/components/ImageSlot';
import { ConfirmDialog, Sheet } from '../../src/components/Sheet';
import { SwipeRow } from '../../src/components/SwipeRow';
import { Card, Field, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { fetchMyLocations, fetchMyTeam } from '../../src/lib/api';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeContext';
import { Artist, Salon } from '../../src/types';

export default function Team() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [locs, setLocs] = useState<Salon[]>([]);
  const [team, setTeam] = useState<Artist[]>([]);

  // add-artist sheet
  const [showAdd, setShowAdd] = useState(false);
  const [addF, setAddF] = useState({ name: '', email: '', password: '' });
  const [addLocId, setAddLocId] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState(false);

  // artist detail sheet
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailPw, setDetailPw] = useState('');
  const [showDetailAssign, setShowDetailAssign] = useState(false);

  // confirm delete
  const [delId, setDelId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const myLocs = await fetchMyLocations(profile.id);
      setLocs(myLocs);
      setTeam(await fetchMyTeam(myLocs.map((l) => l.id)));
    })();
  }, [profile]);

  const locName = (id: string | null) =>
    locs.find((l) => l.id === id)?.name ?? locs[0]?.name ?? 'No location';
  const detail = team.find((a) => a.id === detailId);
  const multiLoc = locs.length > 1;

  async function addArtist() {
    if (!addF.name.trim()) return;
    const salonId = addLocId ?? locs[0]?.id;
    if (!salonId) return;
    const local: Artist = {
      id: `local-${Date.now()}`,
      salon_id: salonId,
      profile_id: null,
      display_name: addF.name.trim(),
      title: 'Artist',
      bio: null,
      email: addF.email.trim() || null,
      years_experience: 0,
      rating: 0,
      photo_url: null,
      slot_minutes: 60,
      on_vacation: false,
    };
    if (supabase && !salonId.startsWith('l')) {
      // NOTE: the temp password itself must be provisioned server-side
      // (Supabase admin invite / edge function) — the row links by email.
      const { data } = await supabase
        .from('artists')
        .insert({ salon_id: salonId, display_name: local.display_name, email: local.email, title: local.title })
        .select()
        .single();
      setTeam((t) => [...t, (data as Artist) ?? local]);
    } else {
      setTeam((t) => [...t, local]);
    }
    setShowAdd(false);
    setAddF({ name: '', email: '', password: '' });
  }

  async function reassign(artistId: string, salonId: string) {
    setTeam((t) => t.map((a) => (a.id === artistId ? { ...a, salon_id: salonId } : a)));
    if (supabase && !artistId.startsWith('local') && !artistId.startsWith('ma')) {
      await supabase.from('artists').update({ salon_id: salonId }).eq('id', artistId);
    }
  }

  async function removeArtist(id: string) {
    setTeam((t) => t.filter((a) => a.id !== id));
    if (supabase && !id.startsWith('local') && !id.startsWith('ma')) {
      await supabase.from('artists').update({ is_active: false }).eq('id', id);
    }
  }

  /** Inline expanding "Assign to" location selector, per the handoff */
  const AssignSelector = ({
    value,
    expanded,
    onToggle,
    onSelect,
  }: {
    value: string | null;
    expanded: boolean;
    onToggle: () => void;
    onSelect: (id: string) => void;
  }) => (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.cardBorder,
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPress={multiLoc ? onToggle : undefined}
        style={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: theme.textTertiary }}>
          Assign to
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>{locName(value)}</Text>
          {multiLoc ? <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={theme.iconMuted} /> : null}
        </View>
      </Pressable>
      {expanded
        ? locs.map((l, i) => (
            <Pressable
              key={l.id}
              onPress={() => onSelect(l.id)}
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
              <Text style={{ fontSize: 16, color: theme.text }}>{l.name}</Text>
              {(value ?? locs[0]?.id) === l.id ? <Feather name="check" size={18} color={theme.iconStroke} /> : null}
            </Pressable>
          ))
        : null}
    </View>
  );

  return (
    <Screen clearTabBar>
      <ScreenTitle title="Team" subtitle="Swipe an artist to remove them" />
      <View style={{ gap: 12 }}>
        {team.map((a) => (
          <SwipeRow
            key={a.id}
            onPress={() => {
              setDetailId(a.id);
              setDetailPw('');
              setShowDetailAssign(false);
            }}
            onDelete={() => setDelId(a.id)}
          >
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <AvatarSlot uri={a.photo_url} size={52} name={a.display_name} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{a.display_name}</Text>
                <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>
                  {a.title} · {locName(a.salon_id)}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={theme.iconMuted} />
            </Card>
          </SwipeRow>
        ))}

        <Pressable
          onPress={() => {
            setShowAdd(true);
            setShowAssign(false);
            setAddLocId(locs[0]?.id ?? null);
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
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.textSecondary }}>Add artist</Text>
        </Pressable>
      </View>

      {/* Add artist sheet */}
      <Sheet visible={showAdd} onClose={() => setShowAdd(false)}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 14 }}>Add artist</Text>
        <View style={{ gap: 12 }}>
          <Field label="Full name" value={addF.name} onChangeText={(v) => setAddF({ ...addF, name: v })} placeholder="Danny Kim" autoCapitalize="words" />
          <Field label="Email" value={addF.email} onChangeText={(v) => setAddF({ ...addF, email: v })} placeholder="danny@salon.com" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Temp password" value={addF.password} onChangeText={(v) => setAddF({ ...addF, password: v })} placeholder="They change it on first login" secureTextEntry />
          <AssignSelector
            value={addLocId}
            expanded={showAssign}
            onToggle={() => setShowAssign((v) => !v)}
            onSelect={(id) => {
              setAddLocId(id);
              setShowAssign(false);
            }}
          />
          <PrimaryButton title="Add artist" disabled={!addF.name.trim()} onPress={addArtist} />
        </View>
      </Sheet>

      {/* Artist detail sheet */}
      <Sheet visible={detailId !== null} onClose={() => setDetailId(null)}>
        <View style={{ alignItems: 'center', marginBottom: 14 }}>
          <AvatarSlot uri={detail?.photo_url} size={72} name={detail?.display_name} />
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginTop: 10 }}>
            {detail?.display_name}
          </Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>{detail?.title}</Text>
        </View>
        <View style={{ gap: 12 }}>
          <Field label="Email" value={detail?.email ?? ''} editable={false} />
          <AssignSelector
            value={detail?.salon_id ?? null}
            expanded={showDetailAssign}
            onToggle={() => setShowDetailAssign((v) => !v)}
            onSelect={(id) => {
              if (detail) reassign(detail.id, id);
              setShowDetailAssign(false);
            }}
          />
          <Field
            label="Reset password"
            value={detailPw}
            onChangeText={setDetailPw}
            placeholder="New temp password"
            secureTextEntry
          />
          <PrimaryButton
            title="Save"
            disabled={detailPw.length > 0 && detailPw.length < 8}
            onPress={() => setDetailId(null)}
          />
        </View>
      </Sheet>

      {/* Confirm delete */}
      <ConfirmDialog
        visible={delId !== null}
        title="Remove artist?"
        message={`${team.find((a) => a.id === delId)?.display_name ?? 'This artist'} will be removed from your team.`}
        confirmLabel="Delete"
        onCancel={() => setDelId(null)}
        onConfirm={() => {
          if (delId) removeArtist(delId);
          setDelId(null);
        }}
      />
    </Screen>
  );
}
