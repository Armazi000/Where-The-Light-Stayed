# Audio

Drop the soundtrack files here. The game looks for these names (defined in
`src/audio/AudioManager.ts`):

| Key       | File                      | Loop | Used for                                          |
| --------- | ------------------------- | ---- | ------------------------------------------------- |
| `ambient` | `empty-room-ambient.mp3`  | yes  | Background music — sparse piano + pad, fades in.  |
| `swell`   | `empty-room-swell.mp3`    | yes  | Ending swell layered over the ambient at the end. |
| `click`   | `click.mp3`               | no   | One-shot sound played when an object is clicked.  |

The game runs fine **without** these files — `AudioManager` fails quietly and
the experience plays in silence. Add the `.mp3`s and they're picked up
automatically. To rename or repath them, edit the `TRACKS` map in
`src/audio/AudioManager.ts`.
