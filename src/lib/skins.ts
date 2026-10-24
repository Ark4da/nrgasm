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

/** Skin formats in the order they are preferred when a can has more than one. */
const SKIN_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

/**
 * The skin of a can, found by name in public/cans/: `<can id>.jpg` (or .jpeg,
 * .png, .webp). `files` is the list of file names kept in src/data/skinFiles.json.
 */
export function skinFor(canId: string, files: readonly string[]): string | undefined {
  for (const extension of SKIN_EXTENSIONS) {
    const file = files.find((name) => name.toLowerCase() === `${canId}.${extension}`);
    if (file) {
      return `/cans/${file}`;
    }
  }
  return undefined;
}
