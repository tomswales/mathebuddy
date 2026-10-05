import { GameApp, html, ready, readProgress, writeProgress } from '../assets/game.js';
import { LEVELS, ROUND_SIZE, automaticLevel, makeRound, parseAnswer, hintFor } from './einmaleins-model.mjs';

const STORAGE_KEY = 'einmaleins-v1';
class TimesTableApp extends GameApp {
  static properties = {
    screen: { state: true }, stars: { state: true }, sound: { state: true },
    manual: { state: true }, level: { state: true }, index: { state: true },
    solved: { state: true }, feedback: { state: true }, earned: { state: true },
    firsts: { state: true }, attempts: { state: true }, resetPending: { state: true },
  };
  constructor() {
    super();
    const saved = readProgress(STORAGE_KEY);
    this.stars = Number.isFinite(saved.stars) ? Math.max(0, Math.floor(saved.stars)) : 0;
    this.sound = saved.sound === true;
    this.manual = 0;
    this.screen = 'home';
    this.resetPending = false;
  }
  save() { writeProgress(STORAGE_KEY, { stars: this.stars, sound: this.sound }); }
  go(screen) { this.screen = screen; this.resetPending = false; this.focusHeading(); }
  toggleSound() { this.sound = !this.sound; this.save(); }
  start() {
    this.level = this.manual || automaticLevel(this.stars);
    this.round = makeRound(this.level);
    this.index = 0;
    this.earned = 0;
    this.firsts = 0;
    this.screen = 'play';
    this.prepareQuestion();
  }
  prepareQuestion() {
    this.solved = false;
    this.feedback = '';
    this.attempts = 0;
    this.updateComplete.then(() => {
      const input = this.querySelector('input');
      if (input) { input.value = ''; input.focus(); }
    });
  }
  next() {
    if (!this.solved) return;
    if (this.index + 1 === ROUND_SIZE) { this.go('done'); return; }
    this.index++;
    this.prepareQuestion();
  }
  answer(event) {
    event.preventDefault();
    if (this.solved) return;
    const input = this.querySelector('input');
    const value = parseAnswer(input.value);
    const q = this.round[this.index];
    if (value === null) {
      this.feedback = 'Gib eine ganze Zahl von 1 bis 100 ein.';
    } else if (value === q.answer) {
      this.solved = true;
      this.earned++;
      this.stars++;
      if (this.attempts === 0) this.firsts++;
      this.feedback = `${q.a} × ${q.b} = ${q.product}. Gut gemacht!`;
      this.save();
      this.tone();
      this.updateComplete.then(() => this.querySelector('#next-question')?.focus());
      return;
    } else {
      this.attempts++;
      this.feedback = this.attempts > 1 ? hintFor(q) : 'Noch nicht ganz. Nimm dir Zeit und rechne noch einmal.';
    }
    this.updateComplete.then(() => { input.focus(); input.select(); });
  }
  reset() {
    this.stars = 0;
    this.manual = 0;
    this.save();
    this.go('home');
  }
  render() {
    return html`<main>
      <header><a class="brand" href="../index.html" aria-label="Zur Spieleübersicht">← Mathebuddy</a><span class="pill" aria-label="${this.stars} Sterne">★ ${this.stars}</span></header>
      ${this.screen === 'home' ? this.home() : this.screen === 'levels' ? this.levels() : this.screen === 'play' ? this.play() : this.done()}
    </main>`;
  }
  home() {
    const level = this.manual || automaticLevel(this.stars);
    return html`<section class="hero">
      <div class="eyebrow">Mathematik · Reihen von 1 bis 10</div>
      <h1 tabindex="-1">Einmaleins</h1>
      <p>Kleine Zahlen. Große Fortschritte!</p>
      <div class="symbols" aria-hidden="true"><span>2</span><span>×</span><span>5</span><span>=</span></div>
    </section>
    <button class="primary" @click=${() => this.start()}>Spielen →</button>
    <p class="homeinfo">Level ${level} · ${LEVELS[level - 1].title}<br><span class="note">10 zufällige Aufgaben pro Runde. Du darfst es immer noch einmal probieren.</span></p>
    <div class="row"><button @click=${() => this.go('levels')}>Level wählen</button><button aria-pressed=${this.sound} @click=${() => this.toggleSound()}>Ton ${this.sound ? 'an' : 'aus'}</button></div>
    <section class="panel"><h2>Schritt für Schritt</h2><p>Starte mit einfachen Reihen. Danach kommen neue Reihen und knifflige Lückenaufgaben dazu.</p><p class="note">Jede gelöste Aufgabe gibt einen Stern. Nach jeweils 20 Sternen steigt dein automatisches Level – bis Level 5. Alle Level sind jederzeit offen.</p></section>`;
  }
  levels() {
    return html`<button @click=${() => this.go('home')}>← Startseite</button>
    <h1 tabindex="-1">Deine Herausforderung</h1><p>Wähle ein Level oder wachse mit deinen Sternen.</p>
    <div class="level-list" role="group" aria-label="Level auswählen">
      <button class="level-card" aria-pressed=${this.manual === 0} @click=${() => this.manual = 0}><strong>Automatisch · Level ${automaticLevel(this.stars)}</strong><small>Nach jeweils 20 Sternen wird es ein bisschen schwieriger.</small></button>
      ${LEVELS.map((level, i) => html`<button class="level-card" aria-pressed=${this.manual === i + 1} @click=${() => this.manual = i + 1}><strong>${i + 1} · ${level.title}</strong><small>${level.description}</small></button>`)}
    </div>
    <button class="primary secondary" @click=${() => this.start()}>Runde starten →</button>
    <section class="panel"><h2>Deine Sterne</h2><p class="note">Dein Fortschritt bleibt in diesem Browser gespeichert, wenn das möglich ist.</p>
      ${this.resetPending ? html`<div role="group" aria-label="Neustart bestätigen"><p role="alert">Möchtest du deine Einmaleins-Sterne löschen und bei Level 1 beginnen?</p><button class="secondary" @click=${() => this.reset()}>Ja, von vorne anfangen</button><button class="secondary" @click=${() => { this.resetPending = false; this.updateComplete.then(() => this.querySelector('#reset-progress')?.focus()); }}>Abbrechen</button></div>` : html`<button id="reset-progress" class="secondary" @click=${() => this.resetPending = true}>Von vorne anfangen</button>`}
    </section>`;
  }
  play() {
    const q = this.round[this.index];
    const expression = `${q.hole === 'a' ? '?' : q.a} × ${q.hole === 'b' ? '?' : q.b} = ${q.hole === 'product' ? '?' : q.product}`;
    return html`<div class="row"><button @click=${() => this.go('home')}>⌂ Startseite</button><button aria-pressed=${this.sound} @click=${() => this.toggleSound()}>Ton ${this.sound ? 'an' : 'aus'}</button></div>
      <p class="small">Aufgabe ${this.index + 1} von ${ROUND_SIZE} · Level ${this.level} · ★ ${this.earned}</p>
      <progress max=${ROUND_SIZE} value=${this.index + (this.solved ? 1 : 0)} aria-label="Fortschritt der Runde"></progress>
      <section class="panel question">
        <div class="eyebrow">${q.hole === 'product' ? 'Rechne aus' : 'Finde den fehlenden Faktor'}</div>
        <h2 tabindex="-1">${q.hole === 'product' ? 'Wie viel ist das?' : 'Welche Zahl fehlt?'}</h2>
        <div class="bigword times-equation" aria-label=${expression.replace('×', 'mal').replace('=', 'gleich').replace('?', 'gesuchte Zahl')}><span>${expression}</span></div>
        <form class="answer-form" @submit=${event => this.answer(event)} novalidate>
          <label class="answer-label" for="answer">Deine Antwort<input id="answer" class="answer-input" type="text" inputmode="numeric" autocomplete="off" maxlength="3" ?disabled=${this.solved} aria-describedby="answer-feedback"></label>
          <button class="primary" type="submit" ?disabled=${this.solved}>Prüfen ✓</button>
        </form>
        <div id="answer-feedback" class="feedback" role="status" aria-live="polite" aria-atomic="true">
          ${this.feedback ? html`<strong>${this.solved ? '✓ Richtig!' : '↻ Versuche es noch einmal.'}</strong><p>${this.feedback}</p>` : html`<span class="note">Gib die fehlende Zahl ein und tippe auf „Prüfen“.</span>`}
        </div>
        ${this.solved ? html`<button id="next-question" class="primary" @click=${() => this.next()}>${this.index + 1 === ROUND_SIZE ? 'Runde abschließen' : 'Weiter →'}</button>` : ''}
      </section>`;
  }
  done() {
    const nextLevel = this.manual || automaticLevel(this.stars);
    return html`<div class="celebrate" aria-hidden="true">🌟</div><h1 tabindex="-1">Einmaleins geschafft!</h1>
      <section class="panel round-result"><h2>★ ${this.earned} neue Sterne</h2><p>Du hast alle ${ROUND_SIZE} Aufgaben gelöst – ${this.firsts} davon beim ersten Versuch.</p><p>Mit jedem Versuch wirst du sicherer.</p>${nextLevel > this.level ? html`<p><strong>Level ${nextLevel} erreicht!</strong><br>In der nächsten Runde warten neue Herausforderungen.</p>` : html`<p class="note">Deine nächste Runde: Level ${nextLevel} · ${LEVELS[nextLevel - 1].title}</p>`}</section>
      <button class="primary" @click=${() => this.start()}>Noch eine Runde →</button><button class="secondary" @click=${() => this.go('home')}>Startseite</button>`;
  }
}
customElements.define('einmaleins-app', TimesTableApp);
ready();
