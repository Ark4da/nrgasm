import { describe, expect, it } from 'vitest';
import { skinFor, skinUrl } from './skins';

describe('skinUrl', () => {
  it('points a skin at the storage bucket', () => {
    expect(skinUrl('/cans/mango-loco.jpg', 'https://x.supabase.co/storage/v1/object/public/cans/')).toBe(
      'https://x.supabase.co/storage/v1/object/public/cans/mango-loco.jpg',
    );
    expect(skinUrl('/cans/mango-loco.jpg', 'https://x.supabase.co/storage/v1/object/public/cans')).toBe(
      'https://x.supabase.co/storage/v1/object/public/cans/mango-loco.jpg',
    );
  });

  it('keeps the local path without a base', () => {
    expect(skinUrl('/cans/mango-loco.jpg', undefined)).toBe('/cans/mango-loco.jpg');
    expect(skinUrl('/cans/mango-loco.jpg', '')).toBe('/cans/mango-loco.jpg');
  });
});

describe('skinFor', () => {
  const files = ['assault.jpg', 'vanilla-shot.png', 'khaotic.webp', 'notes.txt', 'mango-loco-old.jpg'];

  it('finds the skin named after the can id', () => {
    expect(skinFor('assault', files)).toBe('/cans/assault.jpg');
  });

  it('accepts png and webp too', () => {
    expect(skinFor('vanilla-shot', files)).toBe('/cans/vanilla-shot.png');
    expect(skinFor('khaotic', files)).toBe('/cans/khaotic.webp');
  });

  it('prefers jpg when there are several', () => {
    expect(skinFor('assault', ['assault.png', 'assault.jpg'])).toBe('/cans/assault.jpg');
  });

  it('matches the whole id only, and ignores case in the extension', () => {
    expect(skinFor('mango-loco', files)).toBeUndefined();
    expect(skinFor('ripper', ['ripper.JPG'])).toBe('/cans/ripper.JPG');
  });

  it('returns undefined without a file', () => {
    expect(skinFor('bfc', files)).toBeUndefined();
  });
});
