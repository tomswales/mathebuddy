// Shared runtime for all games. All other assets are served from docs/.
let LitElement, html;
try {
  ({ LitElement, html } = await import('https://cdn.jsdelivr.net/npm/lit@3.3.1/+esm'));
} catch (error) {
  const loading = document.getElementById('loading');
  if (loading) loading.textContent = 'Das Spiel konnte nicht geladen werden. Prüfe deine Internetverbindung und lade die Seite erneut.';
  throw error;
}
export { html };
export const ready = () => document.getElementById('loading')?.remove();

export function readProgress(key, fallback = {}) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
  catch { return fallback; }
}
export function writeProgress(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export class GameApp extends LitElement {
  // Light DOM lets every game and the index use the same stylesheet.
  createRenderRoot() { return this; }
  focusHeading() {
    this.updateComplete.then(() => this.querySelector('h1,h2')?.focus());
  }
  tone() {
    if (!this.sound) return;
    try {
      this.audio ??= new (window.AudioContext || window.webkitAudioContext)();
      this.audio.resume().catch(() => {});
      const oscillator = this.audio.createOscillator();
      const gain = this.audio.createGain();
      const now = this.audio.currentTime;
      oscillator.connect(gain);
      gain.connect(this.audio.destination);
      oscillator.frequency.setValueAtTime(660, now);
      oscillator.frequency.setValueAtTime(880, now + .1);
      gain.gain.setValueAtTime(.06, now);
      gain.gain.exponentialRampToValueAtTime(.001, now + .25);
      oscillator.start();
      oscillator.stop(now + .26);
    } catch {}
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.audio?.close();
  }
}
