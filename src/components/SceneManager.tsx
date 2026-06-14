import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect } from "react";
import EmptyRoom from "../scenes/EmptyRoom";
import StoryTextOverlay from "./StoryTextOverlay";
import { useGameState } from "../state/GameState";
import { AudioManager } from "../audio/AudioManager";
import { TITLE, SUBTITLE, START_PROMPT } from "../data/story";

/**
 * SceneManager — owns the canvas and all the 2D overlays that sit on top of it.
 *
 * For this slice there is exactly one scene (The Empty Room). The manager wires
 * together: the 3D canvas, the title/start screen, the story text, the audio,
 * and the ending fade.
 */
export default function SceneManager() {
  const { started, start, ending } = useGameState();

  // Start the soundtrack once the player begins (a user gesture is required
  // before browsers will allow audio to play).
  useEffect(() => {
    if (started) AudioManager.play("ambient", 0.6, 3500);
  }, [started]);

  // When the ending begins, drift into the warmer resolution track.
  useEffect(() => {
    if (ending) AudioManager.crossfadeTo("ending", 0.55, 5000);
  }, [ending]);

  return (
    <div className="app">
      <Canvas
        className="scene-canvas"
        shadows
        camera={{ position: [0, 1.4, 4.6], fov: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#05060a"]} />
        <EmptyRoom />

        {/* Gentle, constrained camera movement — look around, but stay put. */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          target={[0, 1.4, -1]}
          minPolarAngle={Math.PI * 0.3}
          maxPolarAngle={Math.PI * 0.58}
          minAzimuthAngle={-Math.PI * 0.28}
          maxAzimuthAngle={Math.PI * 0.28}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.4}
        />
      </Canvas>

      {/* Prose fades in over the scene. */}
      <StoryTextOverlay />

      {/* Warm full-screen wash that grows during the ending. */}
      <div className={`ending-fade ${ending ? "is-active" : ""}`} />

      {/* Title / start screen. Clicking it begins the experience + audio. */}
      {!started && (
        <button className="start-screen" onClick={start}>
          <h1>{TITLE}</h1>
          <h2>{SUBTITLE}</h2>
          <span className="start-prompt">{START_PROMPT}</span>
        </button>
      )}
    </div>
  );
}
