import { Howl, Howler } from "howler";

// ============================================================================
// AUDIO FILES — point these at your real files when you have them.
// ============================================================================
// Drop files into /public/audio and keep these paths in sync. The game runs
// fine if a file is missing: AudioManager just logs a warning and stays silent.
//
//   loop:   true  = background music / ambience that repeats
//           false = one-shot sound effect (the click)
//   volume: the level this track fades up to (0..1)
const TRACKS = {
  // Background music — sparse piano + soft pad. Fades in when the game starts.
  ambient: { src: "/audio/empty-room-ambient.mp3", loop: true, volume: 0.6 },
  // Ending swell — a second music layer that fades in OVER the ambient during
  // the finale (it does not replace it).
  swell: { src: "/audio/empty-room-swell.mp3", loop: true, volume: 0.55 },
  // Interaction sound — played once each time an object is clicked.
  click: { src: "/audio/click.mp3", loop: false, volume: 0.5 },
} as const;

export type TrackKey = keyof typeof TRACKS;

class AudioManagerImpl {
  private howls = new Map<TrackKey, Howl>();

  // Lazily create (and cache) a Howl for a track key.
  private getHowl(key: TrackKey): Howl {
    let howl = this.howls.get(key);
    if (!howl) {
      const cfg = TRACKS[key];
      howl = new Howl({
        src: [cfg.src],
        loop: cfg.loop,
        volume: 0,
        html5: cfg.loop, // stream long loops; decode short SFX in memory
        onloaderror: () =>
          console.warn(
            `[AudioManager] Missing audio file "${cfg.src}". Running silently.`
          ),
      });
      this.howls.set(key, howl);
    }
    return howl;
  }

  /** Start a looping track and fade it in. Call after a user gesture. */
  play(key: TrackKey, fadeMs = 2500) {
    const howl = this.getHowl(key);
    if (!howl.playing()) howl.play();
    howl.fade(howl.volume(), TRACKS[key].volume, fadeMs);
  }

  /** Fade a track to a new volume (e.g. duck the ambient under the swell). */
  fadeTo(key: TrackKey, targetVolume: number, fadeMs = 1500) {
    const howl = this.getHowl(key);
    howl.fade(howl.volume(), targetVolume, fadeMs);
  }

  /** Play the one-shot interaction sound from the start. */
  playClick() {
    const howl = this.getHowl("click");
    howl.volume(TRACKS.click.volume);
    howl.play();
  }

  /** Fade everything out and stop. */
  stopAll(fadeMs = 1500) {
    this.howls.forEach((howl) => {
      howl.fade(howl.volume(), 0, fadeMs);
      window.setTimeout(() => howl.stop(), fadeMs);
    });
  }

  /** Master mute toggle for the whole experience. */
  setMuted(muted: boolean) {
    Howler.mute(muted);
  }
}

// A single shared instance — there's only ever one soundtrack playing.
export const AudioManager = new AudioManagerImpl();
