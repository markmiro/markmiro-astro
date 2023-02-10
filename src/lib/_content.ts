export type Experiment = {
  title: string;
  emoji?: string;
  description?: string;
  date?: string;
  draft?: boolean;
  source?: string;
  primaryLink?: string;
  primaryLinkText?: string;
};

export const allExperiments: Experiment[] = [
  // Editing nodes is not so easy, and maybe buggy?
  // {
  //   title: "Runkit GraphQL",
  //   description: "A D3.js graph connection visualizer for RunKit.",
  //   emoji: "🕸️",
  //   date: "Mar 4, 2019",
  //   source: "https://github.com/markmiro/runkit-graph",
  //   primaryLink: "https://runkit.com/markmiro/5c7dca0db1bae100122ee7a9",
  //   primaryLinkText: "View on RunKit",
  // },
  {
    title: "Wrapping Carousel",
    description:
      "An instructional article on how to create a wrapping carousel.",
    emoji: "🎠",
    primaryLink: "https://observablehq.com/@markmiro/wrapping-carousel-math",
    primaryLinkText: "View on Observable",
    date: "Aug 27, 2018",
  },
  {
    title: "Canvas animation framework (using classes)",
    description:
      "A framework for creating animations with the HTML5 Canvas API.",
    emoji: "🎨",
    primaryLink:
      "https://codesandbox.io/s/canvas-framework-using-classes-33enk8",
    primaryLinkText: "View on CodeSandbox",
  },
  // TODO: unclear why this one's valuable
  // {
  //   title: "Nested tree performance playground",
  //   description:
  //     "A framework for creating animations with the HTML5 Canvas API.",
  //   emoji: "🪆",
  //   primaryLink:
  //     "https://codesandbox.io/s/react-tree-reducer-example-redux-60r3p",
  //   primaryLinkText: "View on CodeSandbox",
  //   // reducer example:
  //   // https://codesandbox.io/s/react-tree-reducer-example-wroi5?file=/src/App.js
  //   // reducer example memo:
  //   // https://codesandbox.io/s/react-tree-reducer-example-memo-ozmdx?file=/src/App.js
  // },
  // TODO: unclear what's valuable about this one
  // {
  //   title: "Image zoomer",
  //   description: "Image modal view that shows images in full view.",
  //   emoji: "🖼️",
  //   primaryLink: "https://jlkx4.csb.app",
  //   primaryLinkText: "View on CodeSandbox",
  // },
  {
    title: "Minesweeper",
    description: "A minesweeper game.",
    emoji: "💣",
    primaryLink: "https://codepen.io/markmiro/full/YOaoYp",
    primaryLinkText: "View on CodeSandbox",
  },
  {
    // TODO: add instruction to tell user to keep mouse over.
    title: "Fireworks",
    description: "A fireworks animation.",
    emoji: "🎆",
    primaryLink: "https://codepen.io/markmiro/full/mwKMvZ",
    primaryLinkText: "View on CodePen",
  },
  {
    // TODO: add instruction to move mouse over.
    title: "3D Card",
    description: "A card with a simulated 3D hover effect.",
    emoji: "🃏",
    primaryLink: "https://codepen.io/markmiro/full/wbqMPa",
    primaryLinkText: "View on CodePen",
  },
  {
    title: "Tooltip",
    emoji: "💬",
    description: "A tooltip component built with plain CSS and JS.",
    primaryLink: "https://codepen.io/markmiro/full/RYLbZx",
    primaryLinkText: "View on CodePen",
  },
  {
    title: "Fixed content inside scrollable window",
    emoji: "📜",
    primaryLink: "https://codepen.io/markmiro/full/ZmEbeo",
    primaryLinkText: "View on CodePen",
  },
  {
    title: "React-like library implemented in 70 lines (with example apps)",
    emoji: "⚛️",
    primaryLink: "https://codesandbox.io/s/987kj26rzw",
    primaryLinkText: "View on CodeSandbox",
  },
  {
    title: "macOS Terminal Window",
    emoji: "🪟",
    primaryLink: "https://codepen.io/markmiro/full/zJEvod",
    primaryLinkText: "View on CodePen",
  },
  // {
  //   title: 'Split view',
  //   emoji: '🎭',
  //   // TODO: codesandbox doesn't load this one
  //   primaryLink: 'https://codesandbox.io/s/7ywkjkqj96',
  //   primaryLinkText: "View on CodeSandbox",
  // }
];

export const reference = [
  {
    title: "Columns menu like in macOS Finder",
    url: "https://codesandbox.io/s/columns-menu-xmzjj0",
  },
  {
    title: "Canvas animaton starter (text bounce)",
    url: "https://codesandbox.io/s/canvas-multiple-text-bounce-lwv5kd?file=/src/index.ts",
  },
  {
    title: "Minimal carousel",
    url: "https://codesandbox.io/s/slide-show-ph4nr",
  },
  {
    title: "Combining Redux reducers",
    url: "https://codesandbox.io/s/combining-reducers-5sp9k",
  },
  // {
  //   title: 'Nested Redux Reducers',
  //   url: 'https://codesandbox.io/s/nested-reducers-50v0d',
  // }
  {
    title: "Full bleed image with grid",
    url: "https://codepen.io/markmiro/pen/jOzBgJe",
  },
  {
    title: "Full bleed image with sidebar",
    url: "https://codepen.io/markmiro/pen/ZExKzGg",
  },
  {
    title: "Responsive auto-collapsing nav column",
    url: "https://codepen.io/markmiro/pen/XWZvKPr",
  },
  {
    title: "Timeline",
    url: "https://codepen.io/markmiro/pen/VwMRJxy",
  },
  {
    title: "Brutalist toggle",
    url: "https://codepen.io/markmiro/pen/gdEJZr",
  },
  {
    title: "Todo with undo",
    url: "https://codesandbox.io/s/todo-with-undo-lj33wh",
  },
];
