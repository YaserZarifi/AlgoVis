import type { Storyboard } from "@algovis/schema";

/**
 * Maps a value onto MIDI C3..C5, two octaves (§15). The payoff is that a sorted array becomes an
 * ascending scale — you hear the algorithm finish.
 */
export function valueToMidi(value: number, min: number, max: number): number {
  if (max === min) return 48;
  return 48 + Math.round(((value - min) / (max - min)) * 24);
}

/**
 * Renders the storyboard's audio events offline and returns a WAV buffer for ffmpeg to mux.
 * Never played through a live audio context (§15).
 */
export function renderAudio(_storyboard: Storyboard): Promise<Uint8Array> {
  throw new Error("not implemented: renderAudio (Phase 7)");
}
