/**
 * Mixtape playlist.
 *
 * Swap in the real songs by editing this list only. Each entry needs a title,
 * an artist, and a src. src can be a file in public/ (for example
 * "/audio/mixtape/your-song.mp3") or an absolute URL. cover is optional; when
 * present it sits in the middle of the record.
 *
 * Keep new files near -18 LUFS integrated, true peak -1.5 dBTP, so one song
 * doesn't jump in volume. iOS ignores audio.volume, and the player uses one
 * fixed gain for the whole list. A short local file is the reliable choice.
 * A remote URL has to allow CORS.
 *
 * The three tracks below are short excerpts for trying the player. Replace
 * them when the real list is ready.
 */

export type MixtapeTrack = {
  title: string;
  artist: string;
  src: string;
  cover?: string;
};

export const mixtape: MixtapeTrack[] = [
  {
    // HoliznaCC0 — Tokyo Sunset. CC0 1.0.
    // https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/tokyo-sunset-lofi-peaceful-soft/
    title: "Tokyo Sunset",
    artist: "HoliznaCC0",
    src: "/audio/mixtape/tokyo-sunset.mp3",
  },
  {
    // HoliznaCC0 — Cosmic Waves. CC0 1.0.
    // https://archive.org/details/holizna-cc-0-cosmic-waves
    title: "Cosmic Waves",
    artist: "HoliznaCC0",
    src: "/audio/mixtape/cosmic-waves.mp3",
  },
  {
    // HoliznaCC0 — DreamScape. CC0 1.0.
    // https://archive.org/details/holizna-cc-0-cosmic-waves
    title: "DreamScape",
    artist: "HoliznaCC0",
    src: "/audio/mixtape/dreamscape.mp3",
  },
];
