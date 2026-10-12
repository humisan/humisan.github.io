const melody = [
  76, 0, 79, 81, 79, 76, 74, 0,
  72, 0, 74, 76, 79, 0, 76, 0,
  77, 0, 81, 84, 81, 79, 77, 0,
  76, 77, 79, 0, 76, 74, 72, 0,
  76, 0, 81, 83, 84, 83, 81, 0,
  79, 0, 76, 79, 81, 0, 76, 0,
  74, 0, 79, 81, 79, 77, 74, 0,
  76, 74, 72, 0, 79, 0, 72, 0,
];
const chords = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]];

export class GameAudio {
  private readonly context: AudioContext;
  private readonly master: GainNode;
  private readonly music: GainNode;
  private timer: ReturnType<typeof setInterval> | undefined;
  private generation = 0;
  private enabled = true;

  constructor(volume: number) {
    if (typeof window.AudioContext !== 'function') throw new Error('Web Audio is unavailable');
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.music = this.context.createGain();
    this.music.connect(this.master);
    this.master.connect(this.context.destination);
    this.setVolume(volume);
  }

  setVolume(volume: number) {
    const safeVolume = Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : .35;
    this.master.gain.setTargetAtTime(this.enabled ? safeVolume : 0, this.context.currentTime, .025);
  }

  setEnabled(enabled: boolean, volume: number) {
    this.enabled = enabled;
    this.setVolume(volume);
    if (!enabled) this.stopMusic();
  }

  private tone(midi: number, when: number, duration: number, level: number, type: OscillatorType, destination: AudioNode) {
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    filter.type = 'lowpass';
    filter.frequency.value = type === 'square' ? 2200 : 3800;
    envelope.gain.setValueAtTime(.0001, when);
    envelope.gain.exponentialRampToValueAtTime(level, when + .008);
    envelope.gain.exponentialRampToValueAtTime(.0001, when + duration);
    oscillator.connect(filter).connect(envelope).connect(destination);
    oscillator.onended = () => { oscillator.disconnect(); filter.disconnect(); envelope.disconnect(); };
    oscillator.start(when);
    oscillator.stop(when + duration + .01);
  }

  async startMusic() {
    this.stopMusic();
    if (!this.enabled || this.context.state === 'closed') return;
    const generation = this.generation;
    await this.context.resume();
    if (generation !== this.generation || !this.enabled) return;
    if (this.context.state !== 'running') throw new Error('Audio playback was blocked');
    this.music.gain.setTargetAtTime(1, this.context.currentTime, .05);
    const eighth = 60 / 112 / 2;
    let step = 0;
    let next = this.context.currentTime + .04;
    const schedule = () => {
      if (this.context.state !== 'running') return;
      if (next < this.context.currentTime - .2) next = this.context.currentTime + .04;
      while (next < this.context.currentTime + .12) {
        const chord = chords[Math.floor(step / 16) % chords.length];
        const note = melody[step % melody.length];
        if (note) this.tone(note, next, .23, .10, 'square', this.music);
        if (step % 2 === 0) this.tone(chord[0] - 12, next, .28, .09, 'triangle', this.music);
        if (step % 8 === 0) for (const note of chord) this.tone(note, next, 1.25, .017, 'sine', this.music);
        if (step % 4 === 0) this.tone(36, next, .09, .07, 'sine', this.music);
        if (step % 2 === 1) this.tone(96, next, .035, .015, 'triangle', this.music);
        step++;
        next += eighth;
      }
    };
    schedule();
    this.timer = setInterval(schedule, 25);
  }

  stopMusic() {
    this.generation++;
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
    if (this.context.state !== 'closed') this.music.gain.setTargetAtTime(0, this.context.currentTime, .03);
  }

  catch() {
    if (!this.enabled || this.context.state !== 'running') return;
    const now = this.context.currentTime;
    this.tone(84, now, .09, .15, 'triangle', this.master);
    this.tone(91, now + .045, .16, .11, 'sine', this.master);
  }

  countdown() {
    if (!this.enabled || this.context.state !== 'running') return;
    this.tone(79, this.context.currentTime, .07, .08, 'triangle', this.master);
  }

  finish() {
    if (!this.enabled || this.context.state !== 'running') return;
    const now = this.context.currentTime;
    [72, 76, 79, 84].forEach((note, index) => this.tone(note, now + index * .095, .25, .1, 'triangle', this.master));
  }

  dispose() {
    this.stopMusic();
    if (this.context.state !== 'closed') void this.context.close().catch(() => {
      // The page may already be releasing its audio context.
    });
  }
}
