import SceneManager from "./components/SceneManager";
import { GameStateProvider } from "./state/GameState";

/**
 * App — the whole experience.
 *
 * It wraps the single scene in the game-state provider and hands off to
 * SceneManager. No routing, no menus: one room, one quiet story.
 */
export default function App() {
  return (
    <GameStateProvider>
      <SceneManager />
    </GameStateProvider>
  );
}
