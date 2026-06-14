import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { OBJECT_IDS, OBJECT_TEXT, ENDING_TEXT, type ObjectId } from "../data/story";

/**
 * A tiny, beginner-friendly state system.
 *
 * It tracks:
 *  - whether the player has started (used to begin audio on a user gesture),
 *  - which objects have been clicked,
 *  - the line of text currently on screen,
 *  - whether the ending has been triggered (all objects clicked).
 *
 * No external state library — just React context + a couple of useState hooks.
 */
type GameState = {
  started: boolean;
  start: () => void;

  clickedIds: ObjectId[];
  isClicked: (id: ObjectId) => boolean;
  clickObject: (id: ObjectId) => void;
  allClicked: boolean;

  activeText: string | null;
  ending: boolean;
};

const GameStateContext = createContext<GameState | null>(null);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [started, setStarted] = useState(false);
  const [clickedIds, setClickedIds] = useState<ObjectId[]>([]);
  const [activeText, setActiveText] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);

  // Holds the timeout that auto-hides an object's text so we can cancel it.
  const hideTimer = useRef<number | null>(null);

  const start = useCallback(() => setStarted(true), []);

  const isClicked = useCallback(
    (id: ObjectId) => clickedIds.includes(id),
    [clickedIds]
  );

  const clickObject = useCallback((id: ObjectId) => {
    // Record the click (ignore repeats) and surface its line of text.
    setClickedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveText(OBJECT_TEXT[id]);

    // Auto-hide the fragment after a beat so the room can breathe again.
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setActiveText(null), 7000);
  }, []);

  const allClicked = clickedIds.length === OBJECT_IDS.length;

  // When everything has been seen, move into the ending: the warm light grows
  // outside and the closing line stays on screen.
  useEffect(() => {
    if (!allClicked) return;

    const enter = window.setTimeout(() => {
      setEnding(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      setActiveText(ENDING_TEXT);
    }, 1200);

    return () => window.clearTimeout(enter);
  }, [allClicked]);

  const value = useMemo<GameState>(
    () => ({
      started,
      start,
      clickedIds,
      isClicked,
      clickObject,
      allClicked,
      activeText,
      ending,
    }),
    [started, start, clickedIds, isClicked, clickObject, allClicked, activeText, ending]
  );

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

// Convenience hook so components can read state without importing the context.
export function useGameState(): GameState {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error("useGameState must be used inside <GameStateProvider>");
  return ctx;
}
