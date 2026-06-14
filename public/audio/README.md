# Audio

Drop the soundtrack files here. The game looks for these names:

| Key       | File                        | Used for                                   |
| --------- | --------------------------- | ------------------------------------------ |
| `ambient` | `empty-room-ambient.mp3`    | Sparse piano + soft pad loop for the room. |
| `ending`  | `empty-room-ending.mp3`     | Warmer resolution that fades in at the end.|

The game runs fine **without** these files — `AudioManager` fails quietly and
the experience just plays in silence. Add the `.mp3`s and they'll be picked up
automatically (see `src/audio/AudioManager.ts`).
