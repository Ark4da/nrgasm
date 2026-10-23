import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import type { Can, CanId } from '../types/can';
import { CanMesh, LABEL_FRONT } from './CanMesh';
import { token } from './token';

// The home page's carousel: cans stand in a ring that turns slowly.
// Hovering or focusing a can's name turns that can to the front.

const RING_RADIUS = 1.45;
const SPIN_SPEED = 0.18; // radians per second

export interface CanSceneProps {
  cans: Can[];
  /** Stop the idle spin (pointer over the stage, keyboard focus inside it). */
  paused: boolean;
  /** Turn this can to the front. */
  activeId: CanId | null;
  reducedMotion: boolean;
  onSelect: (id: CanId) => void;
  onHover: (id: CanId | null) => void;
}

interface CanModelProps {
  can: Can;
  angle: number;
  highlighted: boolean;
  reducedMotion: boolean;
  metal: string;
  onSelect: (id: CanId) => void;
  onHover: (id: CanId | null) => void;
}

function CanModel({ can, angle, highlighted, reducedMotion, metal, onSelect, onHover }: CanModelProps) {
  const ref = useRef<Group>(null);

  // Ease the scale towards its target every frame
  useFrame((_, delta) => {
    if (!ref.current) return;
    const target = highlighted ? 1.12 : 1;
    const next = reducedMotion ? target : MathUtils.damp(ref.current.scale.x, target, 8, delta);
    ref.current.scale.setScalar(next);
  });

  const x = Math.sin(angle) * RING_RADIUS;
  const z = Math.cos(angle) * RING_RADIUS;

  return (
    <group
      ref={ref}
      position={[x, 0, z]}
      // Turned so each can's label faces out of the ring
      rotation={[0, angle + LABEL_FRONT, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(can.id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover(can.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = '';
      }}
    >
      <CanMesh can={can} metal={metal} />
    </group>
  );
}

interface RingProps extends CanSceneProps {
  metal: string;
}

function Ring({ cans, paused, activeId, reducedMotion, onSelect, onHover, metal }: RingProps) {
  const ref = useRef<Group>(null);
  const step = (Math.PI * 2) / cans.length;
  const activeIndex = cans.findIndex((can) => can.id === activeId);
  const invalidate = useThree((state) => state.invalidate);

  // With frameloop "demand" (reduced motion) a frame is drawn only when asked
  useEffect(() => {
    invalidate();
  }, [activeId, invalidate]);

  useFrame((_, delta) => {
    const ring = ref.current;
    if (!ring) return;

    if (activeIndex >= 0) {
      // Shortest turn that brings the active can to the front (angle 0)
      const target = -activeIndex * step;
      const diff = Math.atan2(Math.sin(target - ring.rotation.y), Math.cos(target - ring.rotation.y));
      ring.rotation.y = reducedMotion ? target : ring.rotation.y + diff * Math.min(1, delta * 6);
    } else if (!paused && !reducedMotion) {
      ring.rotation.y += delta * SPIN_SPEED;
    }
  });

  return (
    <group ref={ref}>
      {cans.map((can, index) => (
        <CanModel
          key={can.id}
          can={can}
          angle={index * step}
          highlighted={can.id === activeId}
          reducedMotion={reducedMotion}
          metal={metal}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </group>
  );
}

/** Narrow canvases (phones) move the camera back so the whole ring fits. */
function FitCamera() {
  useFrame(({ camera, size }) => {
    const aspect = size.width / size.height;
    const z = aspect < 1.2 ? 5.8 + (1.2 - aspect) * 4 : 5.8;
    if (camera.position.z !== z) {
      camera.position.z = z;
    }
  });
  return null;
}

export default function CanScene(props: CanSceneProps) {
  // Read once: the colors are tokens, the 3D scene just borrows them.
  const [colors] = useState(() => ({
    metal: token('--can-rim'),
    accent: token('--color-accent'),
    shadow: token('--color-bg'),
  }));

  // Hovering a can sets a pointer cursor; never leave it behind
  useEffect(() => () => {
    document.body.style.cursor = '';
  }, []);

  return (
    <Canvas
      // Reduced motion: render only when something changes
      frameloop={props.reducedMotion ? 'demand' : 'always'}
      dpr={[1, 2]}
      camera={{ position: [0, 0.7, 5.8], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <FitCamera />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      {/* Acid-green rim light from behind */}
      <pointLight position={[0, 0.6, -2.6]} color={colors.accent} intensity={14} distance={6} />

      <group position={[0, -0.05, -0.6]}>
        <Ring {...props} metal={colors.metal} />
      </group>

      <ContactShadows position={[0, -0.95, -0.6]} opacity={0.55} scale={6} blur={2.6} far={2} color={colors.shadow} />

      {/* Studio reflections built from light panels, no HDR download needed */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.2} position={[0, 3, 2]} scale={[6, 1.2, 1]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="rect" intensity={1.4} position={[-4, 0.5, 1]} scale={[1, 4, 1]} rotation={[0, Math.PI / 2, 0]} />
        <Lightformer form="rect" intensity={1} position={[4, 0.5, 1]} scale={[1, 4, 1]} rotation={[0, -Math.PI / 2, 0]} />
        <Lightformer form="ring" color={colors.accent} intensity={1.5} position={[0, 0.5, -4]} scale={2.4} />
      </Environment>
    </Canvas>
  );
}
