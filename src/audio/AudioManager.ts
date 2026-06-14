import { Howl, Howler } from "howler";

/**
 * AudioManager — a small wrapper around Howler.js for the slice.
 *
 * It can play a looping track and fade between volumes / tracks. It is written
 * to fail quietly: if an audio file is missing (none are committed yet), the
 * experience keeps running in silence instead of crashing.
 *
 * Drop real files into /public/audio and the keys below will pick them up.
 */

// The tracks the scene knows about. Add files to /public/audio to hear them.
const TRACKS = {
  // Sparse piano + soft pad ambience for The Empty Room.
  ambient: "/audio/empty-room-ambient.mp3",
  // A warmer resolution that fades in for the ending (optional).
  ending: "/audio/empty-room-ending.mp3",
} as const;

export type TrackKey = keyof typeof TRACKS;

class AudioManagerImpl {
  private howls = new Map<TrackKey, Howl>();
  private current: TrackKey | null = null;

  // Lazily create (and cache) a Howl for a track key.
  private getHowl(key: TrackKey): Howl {
    let howl = this.howls.get(key);
    if (!howl) {
      howl = new Howl({
        src: [TRACKS[key]],
        loop: true,
        volume: 0,
        html5: true, // stream long ambience instead of decoding it all up front
        onloaderror: () =>
          console.warn(
            `[AudioManager] Missing audio file "${TRACKS[key]}". Running silently.`
          ),
      });
      this.howls.set(key, howl);
    }
    return howl;
  }

  /** Start a track and fade it in. Safe to call after a user gesture. */
  play(key: TrackKey, targetVolume = 0.6, fadeMs = 2500) {
    const howl = this.getHowl(key);
    this.current = key;
    if (!howl.playing()) howl.play();
    howl.fade(howl.volume(), targetVolume, fadeMs);
  }

  /** Fade the currently playing track to a new volume. */
  fadeTo(targetVolume: number, fadeMs = 1500) {
    if (!this.current) return;
    const howl = this.getHowl(this.current);
    howl.fade(howl.volume(), targetVolume, fadeMs);
  }

  /** Crossfade from the current track to another one. */
  crossfadeTo(key: TrackKey, targetVolume = 0.6, fadeMs = 3000) {
    if (this.current === key) {
      this.fadeTo(targetVolume, fadeMs);
      return;
    }
    // Fade the old track out and remember to stop it once it's silent.
    if (this.current) {
      const prev = this.getHowl(this.current);
      prev.fade(prev.volume(), 0, fadeMs);
      window.setTimeout(() => prev.stop(), fadeMs);
    }
    this.play(key, targetVolume, fadeMs);
  }

  /** Fade everything out and stop. */
  stopAll(fadeMs = 1500) {
    this.howls.forEach((howl) => {
      howl.fade(howl.volume(), 0, fadeMs);
      window.setTimeout(() => howl.stop(), fadeMs);
    });
    this.current = null;
  }

  /** Master mute toggle for the whole experience. */
  setMuted(muted: boolean) {
    Howler.mute(muted);
  }
}

// A single shared instance — there's only ever one soundtrack playing.
export const AudioManager = new AudioManagerImpl();
