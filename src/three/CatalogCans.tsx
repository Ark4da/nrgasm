import { createContext, use, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, View } from '@react-three/drei';
import { PMREMGenerator, type Group, type PerspectiveCamera as Camera, type Texture } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Can } from '../types/can';
import { BODY_RADIUS, CAN_HEIGHT, CanMesh, LABEL_FRONT } from './CanMesh';
import { token } from './token';
import styles from './CatalogCans.module.css';

// Spinning cans for the catalog. A page of cards would need one WebGL
// context per card, and browsers allow only about 16, so instead there is
// one canvas over the whole window (CatalogCanvas) and every card holds a
// View: an empty div the canvas draws that card's can into.
// Views that are scrolled out of sight are not drawn at all.

const SPIN_SPEED = 0.7; // radians per second
const FOV = 30;
const TILT = 0.14; // lean the top towards the camera so the lid shows
const MARGIN = 1.1; // empty space around the can, as a factor

interface Shared {
  /** Studio reflections for the metal, built once for every can. */
  environment: Texture;
  metal: string;
  accent: string;
}

const SharedContext = createContext<Shared | null>(null);

function Port() {
  const gl = useThree((state) => state.gl);

  const environment = useMemo(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const texture = generator.fromScene(room, 0.04).texture;
    room.dispose();
    generator.dispose();
    return texture;
  }, [gl]);
  useEffect(() => () => environment.dispose(), [environment]);

  // Read once: the colors are tokens, the 3D scene just borrows them.
  const [colors] = useState(() => ({ metal: token('--can-rim'), accent: token('--color-accent') }));
  const shared = useMemo(() => ({ environment, ...colors }), [environment, colors]);

  return (
    <SharedContext value={shared}>
      <View.Port />
    </SharedContext>
  );
}

/** The one canvas. Mount it once on a page that shows CanViews. */
export function CatalogCanvas() {
  return (
    <div className={styles.layer} aria-hidden="true">
      {/* The canvas only draws; clicks go through to the cards below */}
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
        <Port />
      </Canvas>
    </div>
  );
}

/** A start angle per can, so the grid does not spin in lockstep. */
function startAngle(id: string): number {
  let sum = 0;
  for (const char of id) {
    sum += char.charCodeAt(0);
  }
  return LABEL_FRONT + ((sum % 100) / 100) * Math.PI * 2;
}

interface SpinningCanProps {
  can: Can;
  reducedMotion: boolean;
}

function SpinningCan({ can, reducedMotion }: SpinningCanProps) {
  const shared = use(SharedContext);
  const camera = useRef<Camera>(null);
  const spin = useRef<Group>(null);
  // Reduced motion: a still can, label turned three-quarters to the camera
  const [angle] = useState(() => (reducedMotion ? LABEL_FRONT + 0.4 : startAngle(can.id)));

  useFrame((_, delta) => {
    const cam = camera.current;
    if (cam) {
      // Move back just far enough that the whole can fits the card, tall or narrow
      const tan = Math.tan((cam.fov * Math.PI) / 360);
      const fitHeight = CAN_HEIGHT / 2 / tan;
      const fitWidth = BODY_RADIUS / (tan * cam.aspect);
      const z = Math.max(fitHeight, fitWidth) * MARGIN + BODY_RADIUS;
      if (cam.position.z !== z) {
        cam.position.z = z;
      }
    }
    if (spin.current && !reducedMotion) {
      spin.current.rotation.y += delta * SPIN_SPEED;
    }
  });

  return (
    <>
      {/* Each View has its own scene; give it the shared reflections */}
      {shared && <primitive object={shared.environment} attach="environment" />}
      <PerspectiveCamera ref={camera} makeDefault fov={FOV} position={[0, 0, 7]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      {/* Acid-green rim light from behind */}
      {shared && <pointLight position={[0, 0.4, -1.6]} color={shared.accent} intensity={6} distance={4} />}
      <group rotation={[TILT, 0, 0]}>
        <group ref={spin} rotation={[0, angle, 0]}>
          <CanMesh can={can} metal={shared?.metal ?? ''} />
        </group>
      </group>
    </>
  );
}

interface CanViewProps {
  can: Can;
  reducedMotion: boolean;
  className?: string;
  style?: CSSProperties;
}

/** A can spinning inside this element's box, drawn by CatalogCanvas. */
export function CanView({ can, reducedMotion, className, style }: CanViewProps) {
  return (
    <View className={className} style={style}>
      <SpinningCan can={can} reducedMotion={reducedMotion} />
    </View>
  );
}
