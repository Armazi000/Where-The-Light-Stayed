import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect } from "react";
import EmptyRoom from "../scenes/EmptyRoom";
import StoryTextOverlay from "./StoryTextOverlay";
import { useGameState } from "../state/GameState";
import { AudioManager } from "../audio/AudioManager";
import {
  TITLE,
  SUBTITLE,
  START_PROMPT,
  PROGRESS_LABEL,
  COMPLETE_TEXT,
} from "../data/story";

/**
 * SceneManager — owns the canvas and all the 2D overlays that sit on top of it.
 *
 * For this slice there is exactly one scene (The Empty Room). The manager wires
 * together: the 3D canvas + camera controls, the title/start screen, the
 * progress counter, the story text, the audio, and the ending/complete fades.
 */
export default function SceneManager() {
  const {
    started,
    start,
    clickedCount,
    totalObjects,
    ending,
    complete,
  } = useGameState();

  // Fade the background music in once the player begins (browsers require a
  // user gesture before audio is allowed to play).
  useEffect(() => {
    if (started) AudioManager.play("ambient", 3500);
  }, [started]);

  // Play the interaction sound each time a new object is clicked.
  useEffect(() => {
    if (clickedCount > 0) AudioManager.playClick();
  }, [clickedCount]);

  // During the ending: fade in the swell layer and duck the ambient under it.
  useEffect(() => {
    if (ending) {
      AudioManager.play("swell", 5000);
      AudioManager.fadeTo("ambient", 0.35, 5000);
    }
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

        {/* Gentle, constrained camera movement — look around, but stay put.
            Disabled during the ending so the CameraRig can take over. */}
        <OrbitControls
          enabled={!ending}
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

      {/* Progress counter, e.g. "1 / 3 remembered". Hidden before start and
          once the ending begins. */}
      {started && !ending && (
        <div className="progress">
          {clickedCount} / {totalObjects} {PROGRESS_LABEL}
        </div>
      )}

      {/* Prose fades in over the scene. */}
      <StoryTextOverlay />

      {/* Warm full-screen wash that grows during the ending. */}
      <div className={`ending-fade ${ending ? "is-active" : ""}`} />

      {/* Fade-to-black + completion card once the room has finished. */}
      <div className={`complete-screen ${complete ? "is-active" : ""}`}>
        <h2>{COMPLETE_TEXT}</h2>
      </div>

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
