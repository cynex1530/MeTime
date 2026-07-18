import { supabase } from './supabase';

/**
 * Best-effort upload of a local image to the public `media` bucket.
 * Returns the public URL, or null when there's no backend or the upload fails
 * (the caller then keeps the local file URI, which still displays on-device).
 */
export async function uploadImage(localUri: string, userId: string, folder = 'avatars'): Promise<string | null> {
  if (!supabase) return null;
  try {
    const resp = await fetch(localUri);
    const arrayBuffer = await resp.arrayBuffer();
    const ext = (localUri.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
    const path = `${folder}/${userId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, arrayBuffer, {
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      upsert: true,
    });
    if (error) return null;
    return supabase.storage.from('media').getPublicUrl(path).data.publicUrl ?? null;
  } catch {
    return null;
  }
}
