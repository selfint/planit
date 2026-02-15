import { D as a } from './DegreePicker-BI0M4dZA.js';
import './indexeddb-Ba_KKj-k.js';
const o = { title: 'Components/DegreePicker' },
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
  render: () => DegreePicker(),
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
  render: () => DegreePicker(),
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
const n = ['Default', 'Dark'];
export { r as Dark, e as Default, n as __namedExportsOrder, o as default };
