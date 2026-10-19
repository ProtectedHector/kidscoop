import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    // New React 19 rule; existing components sync localStorage/URL state in effects.
    // Kept as a warning until those components are refactored.
    rules: { 'react-hooks/set-state-in-effect': 'warn' },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'convex/_generated/**', 'public/sw.js', 'dev-backup2/**', 'next-env.d.ts'],
  },
];

export default config;
