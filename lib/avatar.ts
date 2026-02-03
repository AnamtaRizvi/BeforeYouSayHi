const DICEBEAR_BASE = "https://api.dicebear.com/7.x/personas";
const BG = "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf";

export function getAvatarUrl(profileId: string, size?: number): string {
  const params = new URLSearchParams({
    seed: profileId,
    backgroundColor: BG,
  });
  if (size != null) {
    params.set("size", String(size));
  }
  return `${DICEBEAR_BASE}/png?${params.toString()}`;
}

export function getAvatarUrlSvg(profileId: string): string {
  return `${DICEBEAR_BASE}/svg?seed=${encodeURIComponent(profileId)}&backgroundColor=${BG}`;
}
