import { describe, expect, it } from 'vitest';
import { skinUrl } from './skins';

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
