/**
 * Google Places Autocomplete (Places API — New).
 *
 * Requires EXPO_PUBLIC_GOOGLE_PLACES_KEY. Without it the feature is simply off
 * and the address field behaves as a plain text input.
 *
 * Setup:
 *  1. Google Cloud console → create/select a project, enable billing.
 *  2. Enable "Places API (New)".
 *  3. Create an API key, then add EXPO_PUBLIC_GOOGLE_PLACES_KEY=... to .env.
 */
const KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

export const placesEnabled = !!KEY;

export type PlaceSuggestion = { placeId: string; primary: string; secondary: string; full: string };
export type PlaceDetails = { address: string; lat: number | null; lng: number | null };

export async function searchPlaces(input: string): Promise<PlaceSuggestion[]> {
  if (!KEY || input.trim().length < 3) return [];
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY },
      body: JSON.stringify({ input }),
    });
    const json = await res.json();
    return (json.suggestions ?? [])
      .filter((s: any) => s.placePrediction)
      .map((s: any) => {
        const p = s.placePrediction;
        return {
          placeId: p.placeId,
          primary: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
          secondary: p.structuredFormat?.secondaryText?.text ?? '',
          full: p.text?.text ?? '',
        };
      });
  } catch {
    return [];
  }
}

export async function placeDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'formattedAddress,location,displayName' },
    });
    const json = await res.json();
    return {
      address: json.formattedAddress ?? json.displayName?.text ?? '',
      lat: json.location?.latitude ?? null,
      lng: json.location?.longitude ?? null,
    };
  } catch {
    return null;
  }
}
