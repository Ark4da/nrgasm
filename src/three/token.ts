/** Reads a design token from tokens.css, so the 3D code follows the design system too. */
export function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
