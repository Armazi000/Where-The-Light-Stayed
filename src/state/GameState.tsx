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
import {
  OBJECT_IDS,
  OBJECT_TEXT,
  ENDING_TEXT,
  type ObjectId,
} from "../data/story";

// ============================================================================
// ENDING TIMING — tweak the pacing of the finale here.
// ============================================================================
// How long to wait after the 3rd click before the ending sequence begins.
const ENDING_START_DELAY_MS = 1400;
// How long the lit "ending" moment lasts before the room fades to the
// "Chapter 01 Complete" card. Make this longer for a slower, calmer finish.
const ENDING_TO_COMPLETE_MS = 7000;
// How long a normal object's line stays on screen before fading away.
const OBJECT_TEXT_DURATION_MS = 7000;

/**
 * A tiny, beginner-friendly state system for Scene 01.
 *
 * It tracks:
 *  - `started`     : has the player clicked "begin"? (needed to start audio)
 *  - `clickedIds`  : which objects have been clicked (each counts once)
 *  - `clickedCount`: how many so far, for the "1 / 3" progress display
 *  - `warmth`      : 0..1, how warm/bright the room should feel
 *  - `activeText`  : the line currently shown in the overlay
 *  - `ending`      : the lit finale is playing (clicking is disabled)
 *  - `complete`    : the room has faded out; show the completion card
 *
 * No external state library — just React context + a few useState hooks.
 */
type GameState = {
  started: boolean;
  start: () => void;

  clickedIds: ObjectId[];
  clickedCount: number;
  totalObjects: number;
  isClicked: (id: ObjectId) => boolean;
  clickObject: (id: ObjectId) => void;
  allClicked: boolean;

  warmth: number;
  activeText: string | null;
  ending: boolean;
  complete: boolean;
};

const GameStateContext = createContext<GameState | null>(null);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [started, setStarted] = useState(false);
  const [clickedIds, setClickedIds] = useState<ObjectId[]>([]);
  const [activeText, setActiveText] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [complete, setComplete] = useState(false);

  // Holds the timer that auto-hides an object's line, so we can cancel it.
  const hideTimer = useRef<number | null>(null);

  const start = useCallback(() => setStarted(true), []);

  const isClicked = useCallback(
    (id: ObjectId) => clickedIds.includes(id),
    [clickedIds]
  );

  const clickObject = useCallback(
    (id: ObjectId) => {
      // Once the finale has begun, objects can no longer be clicked.
      setEnding((isEnding) => {
        if (!isEnding) {
          setClickedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
          setActiveText(OBJECT_TEXT[id]);

          // Auto-hide the line after a beat so the room can breathe again.
          if (hideTimer.current) window.clearTimeout(hideTimer.current);
          hideTimer.current = window.setTimeout(
            () => setActiveText(null),
            OBJECT_TEXT_DURATION_MS
          );
        }
        return isEnding; // never changes `ending` here, just reads it safely
      });
    },
    []
  );

  const clickedCount = clickedIds.length;
  const totalObjects = OBJECT_IDS.length;
  const allClicked = clickedCount === totalObjects;
  // Warmth ramps up with each object, reaching full at 3/3 and during the end.
  const warmth = clickedCount / totalObjects;

  // Step 1 of the finale: once everything is seen, begin the ending sequence.
  useEffect(() => {
    if (!allClicked) return;
    const t = window.setTimeout(() => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      setEnding(true);
      setActiveText(ENDING_TEXT);
    }, ENDING_START_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [allClicked]);

  // Step 2 of the finale: after the lit moment, fade the room to the card.
  useEffect(() => {
    if (!ending) return;
    const t = window.setTimeout(() => {
      setActiveText(null);
      setComplete(true);
    }, ENDING_TO_COMPLETE_MS);
    return () => window.clearTimeout(t);
  }, [ending]);

  const value = useMemo<GameState>(
    () => ({
      started,
      start,
      clickedIds,
      clickedCount,
      totalObjects,
      isClicked,
      clickObject,
      allClicked,
      warmth,
      activeText,
      ending,
      complete,
    }),
    [
      started,
      start,
      clickedIds,
      clickedCount,
      totalObjects,
      isClicked,
      clickObject,
      allClicked,
      warmth,
      activeText,
      ending,
      complete,
    ]
  );

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

// Convenience hook so components can read state without importing the context.
export function useGameState(): GameState {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error("useGameState must be used inside <GameStateProvider>");
  return ctx;
}
