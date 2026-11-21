class AudioEngine {
  private audioCtx: AudioContext | null = null;
  public speechEnabled: boolean = true;
  public soundEffectsEnabled: boolean = true;

  private initCtx() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public play8Bit(type: 'win' | 'err' | 'step' | 'pop') {
    if (!this.soundEffectsEnabled) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'win') {
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        freqs.forEach((f, i) => {
          osc.frequency.setValueAtTime(f, now + i * 0.09);
          gain.gain.setValueAtTime(0.12, now + i * 0.09);
        });
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'err') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(140, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'step') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(587.33, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {
      // AudioContext might be blocked until user gesture, ignore silently
    }
  }

  private femaleVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices() {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const voices = window.speechSynthesis.getVoices();
      this.femaleVoice = this.pickKindFemaleVoice(voices);
    } catch {
      // Ignore in environments where SpeechSynthesis is restricted
    }
  }

  private pickKindFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    // Spanish voices
    const spanishVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));
    if (spanishVoices.length === 0) {
      // Fallback if no specific Spanish locale is tagged
      return voices.find(v => v.lang && v.lang.toLowerCase().includes('es')) || null;
    }

    // Explicit female voice names in Spanish across Windows, macOS, iOS, Android, and Chrome
    const femaleVoicePatterns = [
      /helena/i,
      /laura/i,
      /sabina/i,
      /dalia/i,
      /paloma/i,
      /elvira/i,
      /monica|mónica/i,
      /paulina/i,
      /lucia|lucía/i,
      /sofia|sofía/i,
      /penelope|penélope/i,
      /francisca/i,
      /rosa/i,
      /victoria/i,
      /conchita/i,
      /camila/i,
      /salma/i,
      /carmen/i,
      /alba/i,
      /mia/i,
      /lupe/i,
      /valeria/i,
      /catalina/i,
      /soledad/i,
      /google español/i,
      /female/i,
      /mujer/i,
      /femenin/i,
      /natural/i
    ];

    const maleVoicePattern = /jorge|diego|pablo|carlos|enrique|miguel|raul|raúl|alvaro|álvaro|gonzalo|mateo|manuel|julio|javier|fernando|david|male|hombre/i;

    // 1. Try to find a recognized kind female voice in Spanish
    for (const pattern of femaleVoicePatterns) {
      const match = spanishVoices.find(v => pattern.test(v.name));
      if (match) return match;
    }

    // 2. Try to find any Spanish voice that does NOT match a known male name
    const nonMaleSpanish = spanishVoices.find(v => !maleVoicePattern.test(v.name));
    if (nonMaleSpanish) return nonMaleSpanish;

    // 3. Fallback to the first available Spanish voice
    return spanishVoices[0];
  }

  public hablar(text: string) {
    if (!this.speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();

      // Ensure the name "Rachel" is pronounced with its English phonetic sound ("Réichel") by Spanish TTS engines
      const spokenText = text.replace(/\bRachel\b/gi, 'Réichel');

      const utterance = new SpeechSynthesisUtterance(spokenText);

      // Re-check voices in case they loaded lazily
      if (!this.femaleVoice) {
        this.loadVoices();
      }

      if (this.femaleVoice) {
        utterance.voice = this.femaleVoice;
        utterance.lang = this.femaleVoice.lang || 'es-ES';
      } else {
        utterance.lang = 'es-ES';
      }

      // Voice modulation for a warm, gentle, kind female tone (profesora / Canelita amable)
      // Pitch: 1.18 provides a sweet, melodic, natural feminine warmth without distortion
      // Rate: 0.96 provides a calm, clear, encouraging teaching pace
      utterance.pitch = 1.18;
      utterance.rate = 0.96;
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis may fail in certain browser modes
    }
  }

  public stopHablar() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audio = new AudioEngine();
