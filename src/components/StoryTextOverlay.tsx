import { useGameState } from "../state/GameState";

/**
 * StoryTextOverlay — the single line of prose that fades in over the 3D scene.
 *
 * It simply mirrors `activeText` from the game state. When there is text it
 * fades in; when the text clears it fades out. During the ending the closing
 * line is styled a touch warmer.
 */
export default function StoryTextOverlay() {
  const { activeText, ending } = useGameState();

  return (
    <div
      className={`story-text ${activeText ? "is-visible" : ""} ${
        ending ? "is-ending" : ""
      }`}
      aria-live="polite"
    >
      <p>{activeText}</p>
    </div>
  );
}
