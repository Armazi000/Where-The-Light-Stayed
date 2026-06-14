// ============================================================================
// STORY TEXT — edit everything the player reads right here.
// ============================================================================
// This is the file to open when you want to change the writing. Nothing in
// here touches the 3D scene or the logic, so it's safe to rewrite freely.

// The three interactable objects, in narrative order.
export const OBJECT_IDS = ["radio", "notebook", "window"] as const;
export type ObjectId = (typeof OBJECT_IDS)[number];

// The short line shown when each object is clicked. (Placeholder copy.)
export const OBJECT_TEXT: Record<ObjectId, string> = {
  radio: "There used to be only noise here.",
  notebook: "Some things were easier to write than say.",
  window: "Then, one day, the world answered back.",
};

// Title-screen copy.
export const TITLE = "Where the Light Stayed";
export const SUBTITLE = "Scene 01 — The Empty Room";
export const START_PROMPT = "click to begin";

// Small progress label, e.g. "1 / 3". The word is editable here.
export const PROGRESS_LABEL = "remembered";

// Shown over the brightening room once all three objects have been clicked.
export const ENDING_TEXT = "And the dark did not feel empty anymore.";

// The final card shown after the room fades out.
export const COMPLETE_TEXT = "Chapter 01 Complete";
