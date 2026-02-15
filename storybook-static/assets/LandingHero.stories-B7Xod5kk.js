import { L as a } from './LandingHero-C9LvJAbw.js';
const s = { title: 'Pages/Landing/LandingHero' },
    e = { render: () => a(), globals: { theme: 'light' } },
    r = {
        render: () => a(),
        globals: { theme: 'dark' },
        parameters: { backgrounds: { default: 'dark' } },
    };
e.parameters = {
    ...e.parameters,
    docs: {
        ...e.parameters?.docs,
        source: {
            originalSource: `{
  render: () => LandingHero(),
  globals: {
    theme: 'light'
  }
}`,
            ...e.parameters?.docs?.source,
        },
    },
};
r.parameters = {
    ...r.parameters,
    docs: {
        ...r.parameters?.docs,
        source: {
            originalSource: `{
  render: () => LandingHero(),
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,
            ...r.parameters?.docs?.source,
        },
    },
};
const o = ['Default', 'Dark'];
export { r as Dark, e as Default, o as __namedExportsOrder, s as default };
