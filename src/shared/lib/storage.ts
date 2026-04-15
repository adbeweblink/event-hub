import { supabase } from "./supabase";

/** Upload a file to a Supabase Storage bucket and return the public URL */
export async function uploadToStorage(bucket: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type });

  if (error) {
    console.error("[Storage] Upload failed:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Upload a file to venue-images bucket */
export async function uploadVenueImage(file: File): Promise<string | null> {
  return uploadToStorage("venue-images", file);
}
