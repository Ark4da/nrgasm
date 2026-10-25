import {
  createContext,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from 'react';
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

/** Shared between the DOM handlers (writers) and the frame loop (reader). */
interface Drag {
  active: boolean;
  /** Turn collected since the last frame, in radians. */
  pending: number;
  /** Speed the can keeps after a flick, in radians per second. */
  velocity: number;
}

const DRAG_SPEED = 0.012; // radians per pixel
const KEY_STEP = 0.35; // radians per arrow-key press

interface SpinningCanProps {
  can: Can;
  reducedMotion: boolean;
  /** Stand still with the middle of the label (the logo) facing the camera. */
  still?: boolean;
  dragRef?: RefObject<Drag>;
}

function SpinningCan({ can, reducedMotion, still = false, dragRef }: SpinningCanProps) {
  const shared = use(SharedContext);
  const camera = useRef<Camera>(null);
  const spin = useRef<Group>(null);
  // Reduced motion: a still can, label turned three-quarters to the camera
  const [angle] = useState(() => {
    if (still) return LABEL_FRONT;
    return reducedMotion ? LABEL_FRONT + 0.4 : startAngle(can.id);
  });

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
    const group = spin.current;
    if (!group) return;
    if (dragRef) {
      const state = dragRef.current;
      group.rotation.y += state.pending;
      state.pending = 0;
      if (state.active) return;
      // After a flick, ease back from the flick speed to the idle spin
      const idle = reducedMotion ? 0 : SPIN_SPEED;
      state.velocity += (idle - state.velocity) * Math.min(1, delta * 2.5);
      group.rotation.y += state.velocity * delta;
      return;
    }
    if (!reducedMotion && !still) {
      group.rotation.y += delta * SPIN_SPEED;
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
  /** Let the visitor turn the can by dragging or with the arrow keys. */
  interactive?: boolean;
  /** Do not spin: the logo faces the camera. Ignored when interactive. */
  still?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** A can spinning inside this element's box, drawn by CatalogCanvas. */
export function CanView({ can, reducedMotion, interactive = false, still = false, className, style }: CanViewProps) {
  // A ref, not state: the handlers and the frame loop change it without re-rendering
  const drag = useRef<Drag>({ active: false, pending: 0, velocity: reducedMotion ? 0 : SPIN_SPEED });
  const last = useRef({ x: 0, time: 0 });

  if (!interactive) {
    return (
      <View className={className} style={style}>
        <SpinningCan can={can} reducedMotion={reducedMotion} still={still} />
      </View>
    );
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current.active = true;
    drag.current.velocity = 0;
    last.current = { x: event.clientX, time: event.timeStamp };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state.active) return;
    const turn = (event.clientX - last.current.x) * DRAG_SPEED;
    const seconds = Math.max(0.001, (event.timeStamp - last.current.time) / 1000);
    state.pending += turn;
    // Reduced motion: the can follows the finger but does not keep spinning
    state.velocity = reducedMotion ? 0 : turn / seconds;
    last.current = { x: event.clientX, time: event.timeStamp };
  }

  function onPointerUp() {
    drag.current.active = false;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      drag.current.pending += event.key === 'ArrowLeft' ? -KEY_STEP : KEY_STEP;
    }
  }

  // The handlers sit on a wrapper: View's props do not take DOM attributes
  return (
    <div
      className={`${className ?? ''} ${styles.grab}`}
      style={style}
      tabIndex={0}
      role="img"
      aria-label={`${can.name} can. Drag, or use the arrow keys, to turn it.`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <View className={styles.fill}>
        <SpinningCan can={can} reducedMotion={reducedMotion} dragRef={drag} />
      </View>
    </div>
  );
}
