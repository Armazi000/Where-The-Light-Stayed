import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import {
  AmbientLight,
  Color,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  Vector3,
} from "three";
import InteractableObject from "../components/InteractableObject";
import { useGameState } from "../state/GameState";

// ============================================================================
// OBJECT POSITIONS — move the radio / notebook / window here ([x, y, z]).
// ============================================================================
const POSITIONS = {
  radio: [1.4, 0.72, -1.8] as [number, number, number],
  notebook: [-1.5, 0.52, -1.0] as [number, number, number],
  window: [0, 1.7, -2.98] as [number, number, number],
};

/**
 * Scene 01 — The Empty Room.
 *
 * A dark, half-finished bedroom floating in fog. Three things can be touched:
 * a radio, a notebook, and the window. The room starts cold and lonely; each
 * object clicked warms it a little. Once all three are seen, a warm light grows
 * beyond the glass and the camera drifts toward it.
 */
export default function EmptyRoom() {
  const { isClicked, clickObject, warmth, ending } = useGameState();

  return (
    <>
      {/* Soft fog swallows the edges of the room into the dark. */}
      <fog attach="fog" args={["#070811", 4, 12]} />

      {/* Lighting that warms up with progress and blooms during the ending. */}
      <WarmLighting warmth={warmth} ending={ending} />

      {/* The room shell, furniture, and the world beyond the window. */}
      <RoomShell />
      <Bed />
      <Nightstand />

      {/* The three interactable objects (disabled once the ending begins). */}
      <Radio
        clicked={isClicked("radio")}
        disabled={ending}
        onClick={() => clickObject("radio")}
      />
      <Notebook
        clicked={isClicked("notebook")}
        disabled={ending}
        onClick={() => clickObject("notebook")}
      />
      <WindowObject
        clicked={isClicked("window")}
        disabled={ending}
        onClick={() => clickObject("window")}
      />

      {/* The light beyond the glass — grows once everything has been seen. */}
      <WindowExterior warmth={warmth} ending={ending} />

      {/* Camera gently focuses toward the window during the ending. */}
      <CameraRig active={ending} />

      {/* Slow, drifting dust caught in the light. */}
      <Sparkles
        count={120}
        scale={[6, 4, 4]}
        position={[0, 1.6, -0.5]}
        size={2}
        speed={0.18}
        opacity={0.5}
        color="#ffe9c8"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Lighting — drives the emotional warm-up                            */
/* ------------------------------------------------------------------ */

// Cold/lonely color at the start, warm/golden by the end.
const COLD = new Color("#5566aa");
const WARM = new Color("#ffd2a0");

function WarmLighting({ warmth, ending }: { warmth: number; ending: boolean }) {
  const ambient = useRef<AmbientLight>(null);
  const fill = useRef<PointLight>(null);
  // Reusable color so we don't allocate one every frame.
  const tmp = useMemo(() => new Color(), []);

  useFrame((_, delta) => {
    // Frame-rate-independent smoothing toward the targets.
    const k = 1 - Math.pow(0.05, delta);
    // 0..1 warmth, pushed to full during the ending.
    const w = ending ? 1 : warmth;

    if (ambient.current) {
      const targetIntensity = 0.12 + w * 0.45 + (ending ? 0.25 : 0);
      ambient.current.intensity = MathUtils.lerp(
        ambient.current.intensity,
        targetIntensity,
        k
      );
      tmp.copy(COLD).lerp(WARM, w);
      ambient.current.color.lerp(tmp, k);
    }

    if (fill.current) {
      const targetIntensity = w * 2.4 + (ending ? 2.5 : 0);
      fill.current.intensity = MathUtils.lerp(
        fill.current.intensity,
        targetIntensity,
        k
      );
    }
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.12} color="#5566aa" />
      {/* A faint warm glow far away — present from the start, like a memory. */}
      <pointLight position={[-5, 3, -6]} intensity={6} distance={14} color="#ffc38a" />
      {/* Cool moonlight skimming the room. */}
      <directionalLight position={[3, 5, 2]} intensity={0.25} color="#9fb4ff" />
      {/* Warm fill that grows with the player's progress. */}
      <pointLight ref={fill} position={[0, 2.2, -0.5]} intensity={0} distance={9} color="#ffcaa0" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Camera rig — gentle focus toward the window during the ending      */
/* ------------------------------------------------------------------ */

function CameraRig({ active }: { active: boolean }) {
  const { camera } = useThree();
  // Where the camera drifts to, and what it looks at (the window/light).
  const destination = useMemo(() => new Vector3(0, 1.6, 1.6), []);
  const lookAt = useMemo(() => new Vector3(0, 1.7, -4), []);

  useFrame((_, delta) => {
    if (!active) return; // OrbitControls owns the camera until the ending
    const k = 1 - Math.pow(0.3, delta); // slow, gentle drift
    camera.position.lerp(destination, k);
    camera.lookAt(lookAt);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/* Room shell                                                          */
/* ------------------------------------------------------------------ */

// Shared muted material for the architecture.
function wallMaterial() {
  return <meshStandardMaterial color="#1a1c26" roughness={0.95} metalness={0.0} />;
}

function RoomShell() {
  // The back wall is built from four slabs framing a centered window hole,
  // so we can actually see "outside" through the opening.
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 7]} />
        <meshStandardMaterial color="#15161f" roughness={1} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-3, 1.75, -1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5, 3.5]} />
        {wallMaterial()}
      </mesh>

      {/* Back wall, framed around a window hole centered at (0, 1.7). */}
      {/* below window */}
      <mesh position={[0, 0.45, -3]}>
        <planeGeometry args={[6, 0.9]} />
        {wallMaterial()}
      </mesh>
      {/* above window */}
      <mesh position={[0, 2.85, -3]}>
        <planeGeometry args={[6, 1.3]} />
        {wallMaterial()}
      </mesh>
      {/* left of window */}
      <mesh position={[-2.05, 1.7, -3]}>
        <planeGeometry args={[1.9, 1.6]} />
        {wallMaterial()}
      </mesh>
      {/* right of window */}
      <mesh position={[2.05, 1.7, -3]}>
        <planeGeometry args={[1.9, 1.6]} />
        {wallMaterial()}
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Furniture                                                          */
/* ------------------------------------------------------------------ */

function Bed() {
  return (
    <group position={[-1.6, 0, -1.4]}>
      {/* mattress */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.6, 0.3, 2.2]} />
        <meshStandardMaterial color="#23252f" roughness={0.9} />
      </mesh>
      {/* pillow */}
      <mesh position={[0, 0.55, -0.8]}>
        <boxGeometry args={[1.2, 0.18, 0.5]} />
        <meshStandardMaterial color="#3a3d49" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Nightstand() {
  return (
    <mesh position={[1.4, 0.3, -1.8]}>
      <boxGeometry args={[0.7, 0.6, 0.7]} />
      <meshStandardMaterial color="#26222a" roughness={0.9} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Interactable objects                                               */
/* ------------------------------------------------------------------ */

type ObjProps = { clicked: boolean; disabled: boolean; onClick: () => void };

// 1. Radio — sits on the nightstand.
function Radio({ clicked, disabled, onClick }: ObjProps) {
  return (
    <InteractableObject
      position={POSITIONS.radio}
      clicked={clicked}
      disabled={disabled}
      onClick={onClick}
    >
      {/* body */}
      <mesh>
        <boxGeometry args={[0.5, 0.28, 0.25]} />
        <meshStandardMaterial
          color="#6b4a2f"
          roughness={0.6}
          emissive={clicked ? "#000000" : "#2a1500"}
        />
      </mesh>
      {/* speaker grille */}
      <mesh position={[-0.1, 0, 0.13]}>
        <circleGeometry args={[0.08, 24]} />
        <meshStandardMaterial color="#2a2018" roughness={0.8} />
      </mesh>
      {/* tuning dial — glows faintly, like it's still on */}
      <mesh position={[0.15, 0.02, 0.13]}>
        <circleGeometry args={[0.03, 16]} />
        <meshStandardMaterial color="#ffc58a" emissive="#ff9a3c" emissiveIntensity={1.5} />
      </mesh>
    </InteractableObject>
  );
}

// 2. Notebook — lies open on the bed.
function Notebook({ clicked, disabled, onClick }: ObjProps) {
  return (
    <InteractableObject
      position={POSITIONS.notebook}
      clicked={clicked}
      disabled={disabled}
      onClick={onClick}
    >
      <group rotation={[-Math.PI / 2, 0, 0.3]}>
        {/* cover / pages */}
        <mesh>
          <boxGeometry args={[0.42, 0.55, 0.04]} />
          <meshStandardMaterial color="#d9cdb0" roughness={0.85} />
        </mesh>
        {/* spine */}
        <mesh position={[0, 0, 0.021]}>
          <boxGeometry args={[0.42, 0.04, 0.01]} />
          <meshStandardMaterial color="#8a3b3b" roughness={0.7} />
        </mesh>
      </group>
    </InteractableObject>
  );
}

// 3. Window — the frame in the back wall is itself the clickable object.
function WindowObject({ clicked, disabled, onClick }: ObjProps) {
  return (
    <InteractableObject
      position={POSITIONS.window}
      clicked={clicked}
      disabled={disabled}
      onClick={onClick}
    >
      <group>
        {/* frame: four thin bars around the opening */}
        <mesh position={[0, 0.82, 0]}>
          <boxGeometry args={[2.3, 0.12, 0.12]} />
          <meshStandardMaterial color="#33363f" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.82, 0]}>
          <boxGeometry args={[2.3, 0.12, 0.12]} />
          <meshStandardMaterial color="#33363f" roughness={0.8} />
        </mesh>
        <mesh position={[-1.15, 0, 0]}>
          <boxGeometry args={[0.12, 1.6, 0.12]} />
          <meshStandardMaterial color="#33363f" roughness={0.8} />
        </mesh>
        <mesh position={[1.15, 0, 0]}>
          <boxGeometry args={[0.12, 1.6, 0.12]} />
          <meshStandardMaterial color="#33363f" roughness={0.8} />
        </mesh>
        {/* central mullion */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.08, 1.6, 0.1]} />
          <meshStandardMaterial color="#33363f" roughness={0.8} />
        </mesh>
      </group>
    </InteractableObject>
  );
}

/* ------------------------------------------------------------------ */
/* The world beyond the window                                        */
/* ------------------------------------------------------------------ */

// A sky plane + a light behind the window that both warm up: a touch with
// general progress, then fully during the ending.
function WindowExterior({ warmth, ending }: { warmth: number; ending: boolean }) {
  const sky = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);

  useFrame((_, delta) => {
    const k = 1 - Math.pow(0.001, delta);
    const w = ending ? 1 : warmth * 0.25; // hint of light early, full at the end

    if (sky.current) {
      const mat = sky.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = MathUtils.lerp(mat.emissiveIntensity, w * 1.6, k);
    }
    if (light.current) {
      light.current.intensity = MathUtils.lerp(light.current.intensity, w * 18, k);
    }
  });

  return (
    <group position={[0, 1.7, -4]}>
      {/* Distant sky seen through the glass — dark blue, warming to gold. */}
      <mesh ref={sky}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial
          color="#0a1024"
          emissive="#ffb866"
          emissiveIntensity={0}
          roughness={1}
        />
      </mesh>
      {/* The warm light itself, pouring back into the room. */}
      <pointLight ref={light} position={[0, 0, 0.5]} intensity={0} distance={12} color="#ffc070" />
    </group>
  );
}
