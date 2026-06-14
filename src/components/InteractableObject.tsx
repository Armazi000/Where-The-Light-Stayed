import { useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, PointLight } from "three";

/**
 * InteractableObject — wraps any 3D content and makes it clickable.
 *
 * Responsibilities (kept deliberately small):
 *  - swap the cursor to a pointer on hover,
 *  - nudge its scale up slightly while hovered,
 *  - softly bob up and down so it feels alive,
 *  - emit a gentle pulsing glow as a hint until it has been clicked,
 *  - go inert once `disabled` (used during the ending sequence).
 *
 * The actual geometry (radio, notebook, window...) is passed in as children.
 */
type Props = {
  position?: [number, number, number];
  /** Once clicked, the glow hint stops and hover feedback eases off. */
  clicked: boolean;
  /** When true (e.g. during the ending) the object ignores all input. */
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

export default function InteractableObject({
  position = [0, 0, 0],
  clicked,
  disabled = false,
  onClick,
  children,
}: Props) {
  const group = useRef<Group>(null);
  const hintRef = useRef<PointLight>(null);
  const [hovered, setHovered] = useState(false);

  // Hover hint should only show when the object is still interactive.
  const interactive = !clicked && !disabled;

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;

    // Soft idle bob — barely there, just enough to avoid feeling static.
    group.current.position.y = position[1] + Math.sin(t * 1.2) * 0.015;

    // Ease the scale toward its target so hover feels smooth, not snappy.
    const target = hovered && interactive ? 1.08 : 1;
    const s = group.current.scale.x + (target - group.current.scale.x) * 0.1;
    group.current.scale.setScalar(s);

    // The hint light pulses while the object is still waiting to be found.
    if (hintRef.current) {
      const pulse = (Math.sin(t * 2) + 1) / 2; // 0..1
      hintRef.current.intensity = interactive ? 0.25 + pulse * 0.4 : 0;
    }
  });

  return (
    <group
      ref={group}
      position={position}
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Warm hint glow centered on the object. */}
      <pointLight ref={hintRef} color="#ffcaa0" distance={1.6} intensity={0} />
      {children}
    </group>
  );
}
