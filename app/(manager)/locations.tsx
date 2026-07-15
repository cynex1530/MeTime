import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ImageSlot } from '../../src/components/ImageSlot';
import { Segmented } from '../../src/components/Segmented';
import { Sheet } from '../../src/components/Sheet';
import { Card, Chip, Field, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { fetchMyLocations } from '../../src/lib/api';
import { SUB_SERVICES } from '../../src/lib/sampleData';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeContext';
import { Audience, Salon } from '../../src/types';

const AUDIENCE_LABEL: Record<Audience, string> = { him: 'Him', her: 'Her', both: 'Anyone' };

type LocForm = { name: string; area: string; desc: string; cat: Audience; subs: string[] };
const emptyForm: LocForm = { name: '', area: '', desc: '', cat: 'both', subs: [] };

export default function Locations() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [locs, setLocs] = useState<Salon[]>([]);
  const [editId, setEditId] = useState<string | null>(null); // null = closed, '' = new
  const [f, setF] = useState<LocForm>(emptyForm);

  useEffect(() => {
    if (profile) fetchMyLocations(profile.id).then(setLocs);
  }, [profile]);

  function openEdit(loc?: Salon) {
    if (loc) {
      setF({
        name: loc.name,
        area: loc.area ?? '',
        desc: loc.description ?? '',
        cat: loc.audience,
        subs: loc.sub_services ?? [],
      });
      setEditId(loc.id);
    } else {
      setF(emptyForm);
      setEditId('');
    }
  }

  async function save() {
    if (!f.name.trim() || !profile) return;
    const patch = {
      name: f.name.trim(),
      area: f.area.trim() || null,
      description: f.desc.trim() || null,
      audience: f.cat,
      sub_services: f.subs,
    };
    if (editId) {
      setLocs((ls) => ls.map((l) => (l.id === editId ? { ...l, ...patch } as Salon : l)));
      if (supabase) await supabase.from('salons').update(patch).eq('id', editId);
    } else {
      const local: Salon = {
        id: `local-${Date.now()}`,
        owner_id: profile.id,
        city: profile.city,
        cover_image_url: null,
        rating: 0,
        reviews_count: 0,
        tag: null,
        ...patch,
      } as Salon;
      if (supabase) {
        const { data } = await supabase
          .from('salons')
          .insert({ ...patch, owner_id: profile.id, city: profile.city })
          .select()
          .single();
        setLocs((ls) => [...ls, (data as Salon) ?? local]);
      } else {
        setLocs((ls) => [...ls, local]);
      }
    }
    setEditId(null);
  }

  return (
    <Screen clearTabBar>
      <ScreenTitle title="Locations" subtitle="Manage your salons" />
      <View style={{ gap: 14 }}>
        {locs.map((l) => (
          <Card key={l.id} onPress={() => openEdit(l)} style={{ padding: 12 }}>
            <ImageSlot uri={l.cover_image_url} aspectRatio={16 / 9} radius={14} caption={l.name} />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: theme.text }}>{l.name}</Text>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 999,
                  backgroundColor: theme.bg,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textSecondary }}>
                  {AUDIENCE_LABEL[l.audience]}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>{l.area}</Text>
            {l.description ? (
              <Text numberOfLines={2} style={{ fontSize: 14, color: theme.textSecondary, marginTop: 6 }}>
                {l.description}
              </Text>
            ) : null}
            {l.sub_services?.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {l.sub_services.map((s) => (
                  <View
                    key={s}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: theme.hairlineStrong,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary }}>{s}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
        ))}

        <Pressable
          onPress={() => openEdit()}
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
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.textSecondary }}>Add location</Text>
        </Pressable>
      </View>

      {/* Add / edit location sheet */}
      <Sheet visible={editId !== null} onClose={() => setEditId(null)}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 14 }}>
          {editId ? 'Edit location' : 'Add location'}
        </Text>
        <View style={{ gap: 12 }}>
          <Field label="Name" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} placeholder="Fade & Co." />
          <Field label="Area" value={f.area} onChangeText={(v) => setF({ ...f, area: v })} placeholder="Downtown · SF" />
          <Field
            label="Description"
            value={f.desc}
            onChangeText={(v) => setF({ ...f, desc: v })}
            placeholder="What makes this place special?"
            multiline
          />
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: theme.textTertiary, marginTop: 4 }}>
            Audience
          </Text>
          <Segmented<Audience>
            options={[
              { value: 'him', label: 'Him' },
              { value: 'her', label: 'Her' },
              { value: 'both', label: 'Anyone' },
            ]}
            value={f.cat}
            onChange={(cat) => setF({ ...f, cat })}
          />
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: theme.textTertiary, marginTop: 4 }}>
            Sub-services
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SUB_SERVICES.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={f.subs.includes(s)}
                onPress={() =>
                  setF({ ...f, subs: f.subs.includes(s) ? f.subs.filter((x) => x !== s) : [...f.subs, s] })
                }
              />
            ))}
          </View>
          <PrimaryButton title={editId ? 'Save location' : 'Add location'} disabled={!f.name.trim()} onPress={save} />
        </View>
      </Sheet>
    </Screen>
  );
}
