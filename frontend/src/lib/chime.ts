// Two-tone WebAudio chime for new wild-animal detections. Browsers block audio
// until a user gesture, so the context is unlocked on the first pointerdown and
// any failure degrades to a silent no-op — sound must never break the dashboard.

let ctx: AudioContext | null = null;

export function unlockAudio(): void {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    // no WebAudio available — chime stays a no-op
  }
}

export function playWildAlertChime(): void {
  try {
    if (!ctx) return;
    const audio = ctx;
    if (audio.state === "suspended") void audio.resume();
    const now = audio.currentTime;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    gain.connect(audio.destination);
    [880, 1318.5].forEach((freq, i) => {
      const osc = audio.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      osc.connect(gain);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.4);
    });
  } catch {
    // never break the dashboard over sound
  }
}
