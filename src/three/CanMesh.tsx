import { useEffect, useMemo, useState } from 'react';
import { RepeatWrapping, SRGBColorSpace, TextureLoader, type Texture } from 'three';
import type { Can } from '../types/can';
import { createLabelTexture } from './labelTexture';

// One 3D can (body, neck, lid, base), shared by the home ring and the catalog.

export const BODY_RADIUS = 0.33;
export const BODY_HEIGHT = 1.5;
/** From the bottom of the base to the top of the lid. */
export const CAN_HEIGHT = BODY_HEIGHT + 0.205;
/** The turn that brings the middle of a label to the camera. */
export const LABEL_FRONT = -Math.PI / 2;

/** Average color of the label's top edge, so the neck continues the paint instead of bare metal. */
function topEdgeColor(image: CanvasImageSource & { width: number; height: number }): string | null {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 4;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, image.width, Math.max(1, image.height * 0.02), 0, 0, 64, 4);
  const data = ctx.getImageData(0, 0, 64, 4).data;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  const count = data.length / 4;
  return `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`;
}

interface Label {
  texture: Texture;
  /** True for the owner's unrolled label, false for the drawn placeholder. */
  isOwner: boolean;
  /** Paint color for the neck; null keeps it bare metal. */
  neck: string | null;
}

/** The owner's unrolled label when there is one, otherwise the drawn label. */
function useLabel(can: Can): Label {
  const drawn = useMemo(() => createLabelTexture(can), [can]);
  const [image, setImage] = useState<{ texture: Texture; neck: string | null } | null>(null);

  useEffect(() => {
    if (!can.label) {
      return;
    }
    let cancelled = false;
    new TextureLoader().load(can.label, (texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 8;
      // The drawn label faces the camera at u = 0.25 (see LABEL_FRONT);
      // shift the owner's label so its middle, the front, lands there too.
      texture.wrapS = RepeatWrapping;
      texture.offset.x = 0.25;
      if (cancelled) {
        texture.dispose();
      } else {
        setImage({ texture, neck: topEdgeColor(texture.image as HTMLImageElement) });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [can.label]);

  useEffect(() => () => drawn.dispose(), [drawn]);
  useEffect(() => () => image?.texture.dispose(), [image]);

  return image ? { ...image, isOwner: true } : { texture: drawn, isOwner: false, neck: null };
}

interface CanMeshProps {
  can: Can;
  /** Color of the bare aluminium parts, read from a token. */
  metal: string;
}

export function CanMesh({ can, metal }: CanMeshProps) {
  const label = useLabel(can);
  const top = BODY_HEIGHT / 2;

  return (
    <>
      {/* Body with the label. A printed label is glossy paint, less metal than the bare aluminium. */}
      <mesh>
        <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS, BODY_HEIGHT, 64, 1, true]} />
        <meshStandardMaterial
          map={label.texture}
          metalness={label.isOwner ? 0.3 : 0.55}
          roughness={label.isOwner ? 0.28 : 0.32}
        />
      </mesh>
      {/* Neck (painted like the label's top edge when there is one), lid, and base */}
      <mesh position={[0, top + 0.05, 0]}>
        <cylinderGeometry args={[BODY_RADIUS * 0.82, BODY_RADIUS, 0.1, 64]} />
        {label.neck ? (
          <meshStandardMaterial color={label.neck} metalness={0.3} roughness={0.28} />
        ) : (
          <meshStandardMaterial color={metal} metalness={0.9} roughness={0.25} />
        )}
      </mesh>
      <mesh position={[0, top + 0.11, 0]}>
        <cylinderGeometry args={[BODY_RADIUS * 0.84, BODY_RADIUS * 0.84, 0.03, 64]} />
        <meshStandardMaterial color={metal} metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[0, -top - 0.04, 0]}>
        <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS * 0.86, 0.08, 64]} />
        <meshStandardMaterial color={metal} metalness={0.9} roughness={0.3} />
      </mesh>
    </>
  );
}
