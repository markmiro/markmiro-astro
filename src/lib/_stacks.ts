type Tag =
  | "build"
  | "web3"
  | "lint"
  | "format"
  | "git"
  | "css"
  | "env"
  | "react"
  | "test";

export type StackItem = {
  alias?: string;
  name: string;
  tags: Tag[];
  npm?: string;
  docs?: string;
  site?: string;
  git?: string;
};

type LangKey =
  | "html"
  | "css"
  | "js"
  | "jsx"
  | "ts"
  | "yaml"
  | "mdx"
  | "pug"
  | "sass"
  | "solidity";

type AppToolsKey =
  | "figma"
  | "notion"
  | "linear"
  | "kap"
  | "ezgif"
  | "convertkit";

type MiscKey = "firebase" | "postgres" | "prisma";

type HostingKey =
  | "pinata"
  | "ghPages"
  | "firestore"
  | "googleCloud"
  | "cloudflare"
  | "railway"
  | "vercel"
  | "s3"
  | "polygon"
  | "optimism"
  | "arbitrum";

type PkgKey =
  | "react"
  | "axios"
  | "chroma"
  | "datGui"
  | "dateFns"
  | "ethers"
  | "faker"
  | "gifJs"
  | "lodash"
  | "nextAuth"
  | "ramda"
  | "statisticsJs"
  | "superJson"
  | "handlebars"
  | "commitlint"
  | "husky"
  | "prettier"
  | "reactTable"
  | "reactBeautifulDnd"
  | "reactLaag"
  | "reachRouter"
  | "framerMotion"
  | "tachyons"
  | "tailwindCss"
  | "chakraUi"
  | "emotion"
  | "styledComponents"
  | "rollup"
  | "gulp"
  | "webpack"
  | "cypress"
  | "jest"
  | "reactTestingLibrary";

type EnvKey =
  // packages
  | "createReactApp"
  | "astro"
  | "gatsby"
  | "electron"
  | "hardhat"
  | "next"
  // package managers
  | "npm"
  | "pnpm"
  | "yarn"
  // misc
  | "chromeExtensionsApi";

export const language: Record<LangKey, StackItem> = {
  html: { name: "HTML", tags: [] },
  css: { name: "CSS", tags: [] },
  js: { name: "JavaScript", tags: [] },
  jsx: {
    name: "JSX",
    docs: "https://reactjs.org/docs/introducing-jsx.html",
    tags: [],
  },
  ts: { name: "TypeScript", site: "https://www.typescriptlang.org", tags: [] },
  yaml: { name: "YAML", site: "https://yaml.org/", tags: [] },
  mdx: {
    name: "MDX",
    tags: [],
    docs: "https://mdxjs.com/docs/using-mdx",
    git: "https://github.com/mdx-js/mdx",
  },
  pug: {
    name: "Pug",
    alias: "jade",
    tags: [],
    site: "https://pugjs.org/api/getting-started.html",
    git: "https://github.com/pugjs/pug",
  },
  sass: { name: "Sass", tags: [], docs: "https://sass-lang.com/guide" },
  solidity: { name: "Solidity", tags: [] },
};

export const appsTools: Record<AppToolsKey, StackItem> = {
  figma: { name: "Figma", site: "https://www.figma.com", tags: [] },
  notion: { name: "Notion", site: "https://www.notion.so", tags: [] },
  linear: { name: "Linear", site: "https://linear.app", tags: [] },
  kap: { name: "Kap", site: "https://getkap.co", tags: [] },
  ezgif: { name: "EZGIF", site: "https://ezgif.com", tags: [] },
  convertkit: { name: "ConvertKit", site: "https://convertkit.com/", tags: [] },
};

export const hosting: Record<HostingKey, StackItem> = {
  pinata: { name: "Pinata", site: "https://www.pinata.cloud", tags: ["web3"] },
  ghPages: { name: "GitHub Pages", site: "https://pages.github.com", tags: [] },
  firestore: {
    name: "Firestore Database",
    site: "https://firebase.google.com",
    tags: [],
  },
  googleCloud: {
    name: "Google Cloud",
    site: "https://cloud.google.com",
    tags: [],
  },
  cloudflare: {
    name: "Cloudflare",
    site: "https://www.cloudflare.com",
    tags: [],
  },
  railway: { name: "Railway", site: "https://railway.app", tags: [] },
  vercel: { name: "Vercel", site: "https://vercel.com", tags: [] },
  s3: { name: "Amazon S3", site: "https://aws.amazon.com/s3", tags: [] },
  polygon: {
    name: "Polygon",
    site: "https://www.polygon.technology",
    tags: ["web3"],
  },
  optimism: {
    name: "Optimism",
    site: "https://www.optimism.io/",
    tags: ["web3"],
  },
  arbitrum: { name: "Arbitrum", site: "https://arbitrum.io", tags: ["web3"] },
};

export const misc: Record<MiscKey, StackItem> = {
  // aws: { name: "AWS", tags: [] },
  firebase: { name: "Firebase", site: "https://firebase.google.com", tags: [] },
  postgres: { name: "Postgres", site: "https://www.postgresql.org", tags: [] },
  prisma: { name: "Prisma", site: "https://www.prisma.io", tags: [] },
};

export const pkg: Record<PkgKey, StackItem> = {
  react: {
    name: "React",
    npm: "https://www.npmjs.com/package/react",
    git: "https://github.com/facebook/react",
    tags: [],
  },
  axios: {
    name: "Axios",
    npm: "https://www.npmjs.com/package/axios",
    git: "https://github.com/axios/axios",
    tags: [],
  },
  chroma: {
    name: "Chroma.js",
    npm: "https://www.npmjs.com/package/chroma-js",
    git: "https://github.com/gka/chroma.js",
    tags: [],
  },
  datGui: {
    name: "Dat GUI",
    git: "https://github.com/dataarts/dat.gui",
    tags: [],
  },
  dateFns: {
    name: "date-fns",
    npm: "https://www.npmjs.com/package/date-fns",
    git: "https://github.com/date-fns/date-fns",
    tags: [],
  },
  ethers: {
    name: "Ethers",
    npm: "https://www.npmjs.com/package/ethers",
    git: "https://github.com/ethers-io/ethers.js",
    tags: [],
  },
  faker: {
    name: "Faker.js",
    npm: "https://www.npmjs.com/package/@faker-js/faker",
    git: "https://github.com/faker-js/faker",
    tags: [],
  },
  gifJs: {
    name: "GIF.js",
    npm: "https://www.npmjs.com/package/gif.js",
    git: "https://github.com/jnordberg/gif.js",
    tags: [],
  },
  lodash: {
    name: "Lodash",
    npm: "https://www.npmjs.com/package/lodash",
    git: "https://github.com/lodash/lodash",
    tags: [],
  },
  nextAuth: {
    name: "NextAuth",
    npm: "https://www.npmjs.com/package/next-auth",
    git: "https://github.com/nextauthjs/next-auth",
    tags: [],
  },
  ramda: {
    name: "Ramda.js",
    npm: "https://www.npmjs.com/package/ramda",
    git: "https://github.com/ramda/ramda",
    tags: [],
  },
  statisticsJs: {
    name: "statistics.js",
    git: "https://github.com/thisancog/statistics.js",
    tags: [],
  },
  superJson: {
    name: "Superjson",
    npm: "https://www.npmjs.com/package/superjson",
    git: "https://github.com/blitz-js/superjson",
    tags: [],
  },
  handlebars: {
    name: "Handlebars",
    npm: "https://www.npmjs.com/package/handlebars",
    tags: [],
    git: "https://github.com/handlebars-lang/handlebars.js",
    docs: "https://handlebarsjs.com/guide",
  },
  // react
  reactTable: {
    name: "React Table",
    npm: "https://www.npmjs.com/package/@tanstack/react-table",
    git: "https://github.com/TanStack/table",
    tags: ["react"],
  },
  reactBeautifulDnd: {
    name: "React Beautiful DnD",
    npm: "https://www.npmjs.com/package/react-beautiful-dnd",
    git: "https://github.com/atlassian/react-beautiful-dnd",
    tags: ["react"],
  },
  reactLaag: {
    name: "React Laag",
    npm: "https://www.npmjs.com/package/react-laag",
    git: "https://github.com/everweij/react-laag",
    tags: ["react"],
  },
  reachRouter: {
    name: "Reach Router",
    npm: "https://www.npmjs.com/package/@reach/router",
    git: "https://github.com/reach/router",
    tags: ["react"],
  },
  framerMotion: {
    name: "Framer Motion",
    npm: "https://www.npmjs.com/package/framer-motion",
    git: "https://github.com/framer/motion",
    tags: ["react"],
  },
  // css
  tachyons: {
    name: "Tachyons CSS",
    npm: "https://www.npmjs.com/package/tachyons",
    git: "https://github.com/tachyons-css/tachyons",
    tags: ["css"],
  },
  tailwindCss: {
    name: "Tailwind CSS",
    npm: "https://www.npmjs.com/package/tailwind",
    git: "https://github.com/tailwindlabs/tailwindcss",
    tags: ["css"],
  },
  chakraUi: {
    name: "Chakra UI",
    npm: "https://www.npmjs.com/package/@chakra-ui/react",
    git: "https://github.com/chakra-ui/chakra-ui",
    tags: ["css", "react"],
  },
  emotion: {
    name: "Emotion",
    npm: "https://www.npmjs.com/package/@emotion/react",
    git: "https://github.com/emotion-js/emotion",
    tags: ["css", "react"],
  },
  styledComponents: {
    name: "Styled Components",
    npm: "htps://www.npmjs.com/package/styled-components",
    git: "https://github.com/styled-components/styled-components",
    tags: ["css", "react"],
  },
  // build
  rollup: {
    name: "Rollup",
    npm: "https://www.npmjs.com/package/rollup",
    git: "https://github.com/rollup/rollup",
    tags: ["build"],
  },
  gulp: {
    name: "Gulp",
    npm: "https://www.npmjs.com/package/gulp",
    git: "https://github.com/gulpjs/gulp",
    tags: ["build"],
  },
  webpack: {
    name: "Webpack",
    npm: "https://www.npmjs.com/package/webpack",
    git: "https://github.com/webpack/webpack",
    tags: ["build"],
  },
  // misc
  commitlint: {
    name: "Commitlint",
    npm: "https://www.npmjs.com/package/commitlint",
    git: "https://github.com/conventional-changelog/commitlint",
    tags: ["lint"],
  },
  husky: {
    name: "Husky",
    npm: "https://www.npmjs.com/package/husky",
    git: "https://github.com/typicode/husky",
    tags: ["git"],
  },
  prettier: {
    name: "Prettier",
    npm: "https://www.npmjs.com/package/prettier",
    git: "https://github.com/prettier/prettier",
    tags: ["format"],
  },
  cypress: {
    name: "Cypress",
    npm: "https://www.npmjs.com/package/cypress",
    git: "https://github.com/cypress-io/cypress",
    tags: ["test"],
  },
  jest: {
    name: "Jest",
    npm: "https://www.npmjs.com/package/jest",
    git: "https://github.com/facebook/jest",
    tags: ["test"],
  },
  reactTestingLibrary: {
    name: "React Testing Library",
    npm: "https://www.npmjs.com/package/@testing-library/react",
    git: "https://github.com/testing-library/react-testing-library",
    tags: ["test", "react"],
  },
};

export const env: Record<EnvKey, StackItem> = {
  // package managers
  npm: { name: "NPM", site: "https://www.npmjs.com", tags: [] },
  pnpm: { name: "PNPM", site: "https://pnpm.io", tags: [] },
  yarn: { name: "Yarn", site: "https://yarnpkg.com", tags: [] },
  // packages
  createReactApp: {
    name: "Create React App",
    // This npm page is bare
    // npm: "https://www.npmjs.com/package/create-react-app",
    site: "https://create-react-app.dev",
    tags: ["env", "react"],
  },
  astro: { name: "Astro", site: "https://astro.build", tags: ["env"] },
  gatsby: {
    name: "Gatsby",
    npm: "https://www.npmjs.com/package/gatsby",
    site: "https://www.gatsbyjs.com",
    tags: ["env", "react"],
  },
  electron: {
    name: "Electron.js",
    npm: "https://www.npmjs.com/package/electron",
    site: "https://www.electronjs.org",
    tags: ["env"],
  },
  hardhat: {
    name: "Hardhat",
    npm: "https://www.npmjs.com/package/hardhat",
    site: "https://hardhat.org",
    tags: ["env", "web3"],
  },
  next: {
    name: "Next.js",
    npm: "https://www.npmjs.com/package/next",
    site: "https://nextjs.org",
    tags: ["env", "react"],
  },
  // misc
  chromeExtensionsApi: {
    name: "Chrome Extensions API",
    docs: "https://developer.chrome.com/docs/extensions",
    tags: [],
  },
};

export type StackKey =
  | LangKey
  | AppToolsKey
  | MiscKey
  | HostingKey
  | PkgKey
  | EnvKey;
