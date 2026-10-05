// Add a subject/game here and create its page under docs/games/.
export const subjects = [
  {
    id: 'mathematik',
    name: 'Mathematik',
    description: 'Rechnen, Wörter verstehen und Zusammenhänge entdecken.',
    games: [
      {
        title: 'Mathe-Wörter',
        subtitle: 'Wörter verstehen. Mathe knacken!',
        description: 'Entdecke die vier Rechenarten, ordne Wörterkarten und lerne die Namen der Zahlen kennen.',
        icon: '+ − × ÷',
        badge: 'Wörter & Rechenarten',
        href: './games/mathe-woerter.html',
        progressKey: 'mathe-woerter-v1',
      },
      {
        title: 'Einmaleins',
        subtitle: 'Kleine Zahlen. Große Fortschritte!',
        description: 'Übe die Reihen von 1 bis 10 mit zufälligen Aufgaben. Mit jedem Level wächst die Herausforderung.',
        icon: '7 × 8',
        badge: '5 Level · 1 bis 10',
        href: './games/einmaleins.html',
        progressKey: 'einmaleins-v1',
      },
    ],
  },
];
