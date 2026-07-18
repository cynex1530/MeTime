/**
 * Booking slot generation from an artist's schedule config.
 *
 * A day is filled from open → close in `slotMinutes` steps. Any slot that
 * overlaps the lunch break is marked unavailable.
 *
 * e.g. 09:00–18:00 @ 60 min → 9 slots; @ 30 min → 18 slots. A 12:00 lunch of
 * 30 min blocks the 12:00 slot.
 */

export type Slot = { time: string; available: boolean };

export function parseHM(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function toHM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function generateDaySlots(
  open = '09:00',
  close = '18:00',
  slotMinutes = 60,
  lunchStart?: string | null,
  lunchMinutes?: number | null
): Slot[] {
  const start = parseHM(open);
  const end = parseHM(close);
  if (!(slotMinutes > 0) || end <= start) return [];

  const lunchA = lunchStart ? parseHM(lunchStart) : null;
  const lunchB = lunchA != null && lunchMinutes ? lunchA + lunchMinutes : null;

  const slots: Slot[] = [];
  for (let t = start; t + slotMinutes <= end; t += slotMinutes) {
    const overlapsLunch = lunchA != null && lunchB != null && t < lunchB && t + slotMinutes > lunchA;
    slots.push({ time: toHM(t), available: !overlapsLunch });
  }
  return slots;
}
