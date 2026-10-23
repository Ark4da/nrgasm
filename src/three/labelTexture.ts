import { CanvasTexture, SRGBColorSpace } from 'three';
import type { Can } from '../types/can';
import { token } from './token';

// The 3D can's label, drawn on a 2D canvas: the same three parts as the CSS
// placeholder (aluminium, flavor band, dark name label), repeated twice
// around the can so it reads from the front and the back.

const WIDTH = 1024;
const HEIGHT = 736; // about the body's circumference : height ratio

export function createLabelTexture(can: Can): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  // Brushed aluminium: a flat base with faint vertical streaks
  ctx.fillStyle = token('--can-metal-soft');
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.globalAlpha = 0.08;
  for (let y = 0; y < HEIGHT; y += 3) {
    ctx.fillStyle = y % 2 === 0 ? token('--can-metal-light') : token('--can-metal-mid');
    ctx.fillRect(0, y, WIDTH, 1);
  }
  ctx.globalAlpha = 1;

  // Flavor band across the middle
  const bandHeight = HEIGHT * 0.3;
  const bandTop = (HEIGHT - bandHeight) / 2;
  ctx.fillStyle = can.flavorColor;
  ctx.fillRect(0, bandTop, WIDTH, bandHeight);

  // Dark name labels, one per half of the can
  const name = can.name.toUpperCase();
  ctx.font = `500 34px ${token('--font-mono')}`;
  ctx.letterSpacing = '4px';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textWidth = Math.min(ctx.measureText(name).width, WIDTH / 2 - 80);
  const padX = 22;
  const labelHeight = 62;

  for (const centerX of [WIDTH / 4, (WIDTH * 3) / 4]) {
    ctx.fillStyle = token('--color-bg');
    ctx.beginPath();
    ctx.roundRect(centerX - textWidth / 2 - padX, HEIGHT / 2 - labelHeight / 2, textWidth + padX * 2, labelHeight, 8);
    ctx.fill();
    ctx.fillStyle = token('--color-text-secondary');
    ctx.fillText(name, centerX, HEIGHT / 2 + 2, WIDTH / 2 - 80);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
