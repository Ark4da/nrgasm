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

const NECK_HEIGHT = 0.1;
const NECK_TOP_RADIUS = BODY_RADIUS * 0.82;
/**
 * The share of a label's height printed on the neck. Real cans carry their top
 * band ("VITAMINS + TAURINE …") up the shoulder to the lid, so the label runs on
 * over the neck: the neck's slant length out of the whole printed length, which
 * keeps the print at the same scale on both parts.
 */
const NECK_SLANT = Math.hypot(NECK_HEIGHT, BODY_RADIUS - NECK_TOP_RADIUS);
const NECK_SHARE = NECK_SLANT / (NECK_SLANT + BODY_HEIGHT);

interface Label {
  texture: Texture;
  /** True for the owner's unrolled label, false for the drawn placeholder. */
  isOwner: boolean;
  /** The label's top strip for the neck; null keeps the neck bare metal. */
  neck: Texture | null;
}

/** The owner's unrolled label when there is one, otherwise the drawn label. */
function useLabel(can: Can): Label {
  const drawn = useMemo(() => createLabelTexture(can), [can]);
  const [image, setImage] = useState<{ texture: Texture; neck: Texture } | null>(null);

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
      // The body shows the label below its top strip; the neck shows the strip
      // (v = 1 is the image's top edge)
      const neck = texture.clone();
      texture.repeat.y = 1 - NECK_SHARE;
      neck.repeat.y = NECK_SHARE;
      neck.offset.y = 1 - NECK_SHARE;
      // A clone shares the image but starts as "not uploaded yet"
      neck.needsUpdate = true;
      if (cancelled) {
        texture.dispose();
        neck.dispose();
      } else {
        setImage({ texture, neck });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [can.label]);

  useEffect(() => () => drawn.dispose(), [drawn]);
  useEffect(() => () => {
    image?.texture.dispose();
    image?.neck.dispose();
  }, [image]);

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
      {/* Neck (the label's top strip when there is one), lid, and base. Open-ended:
          the body hides its bottom, the lid its top. */}
      <mesh position={[0, top + NECK_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[NECK_TOP_RADIUS, BODY_RADIUS, NECK_HEIGHT, 64, 1, true]} />
        {/* Different keys: a material built without a map would not pick one up later */}
        {label.neck ? (
          <meshStandardMaterial key="label" map={label.neck} metalness={0.3} roughness={0.28} />
        ) : (
          <meshStandardMaterial key="metal" color={metal} metalness={0.9} roughness={0.25} />
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
