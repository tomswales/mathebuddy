# Mathebuddy

Static learning games deployed by GitHub Pages from `docs/`. No build step is required. The interface is in German.

- `index.html`: subject and game index.
- `assets/catalog.js`: subject groups, game descriptions, links, and progress keys.
- `assets/styles.css`: shared responsive styles for the index and all games.
- `assets/game.js`: shared Lit runtime, light-DOM game base, progress storage, focus and sound helpers.
- `games/mathe-woerter.html`: the original vocabulary game. Its `mathe-woerter-v1` saved progress is preserved.
- `games/einmaleins.html`: times tables with ten random questions per round, five levels, retry hints, and independent `einmaleins-v1` progress.
- `games/einmaleins-model.mjs`: framework-independent question generation and difficulty rules.

## Preview and test

From the repository root:

```sh
python3 -m http.server 8000 --directory docs
node --test docs/tests/*.test.mjs
```

Open `http://localhost:8000`. Games load the existing pinned Lit 3.3.1 dependency from jsDelivr, so they need an internet connection. The index has no external dependency. Progress is saved locally when browser storage is available.

## Add another subject or game

1. Create a page and module in `games/`. Use a relative stylesheet link to `../assets/styles.css` and import `GameApp`, `html`, and `ready` from `../assets/game.js`.
2. Extend `GameApp` for shared styling, optional sound, and heading focus. Call `ready()` after registering the component. Give each game a unique progress key and use `readProgress` / `writeProgress` for resilient browser storage.
3. Add a game entry to `assets/catalog.js`. Add another subject object there to group games for another subject area. The index renders subject groups automatically.
4. Use relative links throughout so the site works under GitHub Pages repository subpaths.

## Einmaleins levels

| Level | Challenge |
| --- | --- |
| 1 | Tables 1, 2, 5, 10; second factor 1–5 |
| 2 | Tables 1, 2, 5, 10; second factor 1–10 |
| 3 | Adds tables 3, 4, 6; second factor 1–10 |
| 4 | All tables 1–10 |
| 5 | All tables, with a mixture of missing products and missing factors |

Every round covers each table available at its level and avoids repeated ordered number pairs. Each solved question earns one star, including after retries. Automatic difficulty increases every 20 stars, up to level 5; any level can also be chosen manually. A level stays fixed during a round.
