// All of Scene 01's writing lives here so the prose is easy to tweak
// without touching any 3D or component code.

// The three interactable objects, in narrative order.
export const OBJECT_IDS = ["radio", "notebook", "window"] as const;
export type ObjectId = (typeof OBJECT_IDS)[number];

// The line of text shown when each object is clicked.
export const OBJECT_TEXT: Record<ObjectId, string> = {
  radio:
    "The radio hums with a song you almost remember — static, then a melody that used to mean home.",
  notebook:
    "Your handwriting, younger. Half a sentence left unfinished, as if you always meant to come back to it.",
  window:
    "Outside, only darkness. But you keep looking, the way you always have, waiting for something to return.",
};

// The title-screen copy.
export const TITLE = "Where the Light Stayed";
export const SUBTITLE = "Scene 01 — The Empty Room";
export const START_PROMPT = "click to begin";

// Shown once all three objects have been visited.
export const ENDING_TEXT =
  "And then — far beyond the glass — a warm light. Not gone after all. Just waiting where you left it.";
