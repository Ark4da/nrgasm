/**
 * Where a can's skin is served from. In production the skins live in a
 * Supabase Storage bucket (`base`); without a base they stay in public/cans/.
 */
export function skinUrl(path: string, base: string | undefined): string {
  if (!base) {
    return path;
  }
  const file = path.replace(/^\/?cans\//, '');
  return `${base.replace(/\/+$/, '')}/${file}`;
}
