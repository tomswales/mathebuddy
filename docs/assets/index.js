import { subjects } from './catalog.js';

const container = document.getElementById('subjects');
const template = document.getElementById('game-card');
for (const subject of subjects) {
  const section = document.createElement('section');
  section.className = 'subject';
  const heading = document.createElement('h2');
  heading.id = subject.id;
  heading.textContent = subject.name;
  section.setAttribute('aria-labelledby', heading.id);
  const description = document.createElement('p');
  description.className = 'note';
  description.textContent = subject.description;
  const grid = document.createElement('div');
  grid.className = 'game-grid';
  for (const game of subject.games) {
    const card = template.content.cloneNode(true);
    card.querySelector('a').href = game.href;
    card.querySelector('.game-icon').textContent = game.icon;
    card.querySelector('.eyebrow').textContent = game.badge;
    card.querySelector('h3').textContent = game.title;
    card.querySelector('.game-subtitle').textContent = game.subtitle;
    card.querySelector('.game-description').textContent = game.description;
    let stars = 0;
    try {
      const progress = JSON.parse(localStorage.getItem(game.progressKey) || '{}');
      if (Number.isFinite(progress?.stars)) stars = Math.max(0, progress.stars);
    } catch {}
    card.querySelector('.game-progress').textContent = stars ? `★ ${stars} gesammelte Sterne` : 'Bereit für dein erstes Abenteuer';
    grid.append(card);
  }
  section.append(heading, description, grid);
  container.append(section);
}
