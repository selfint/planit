import { C as a } from './CourseTable-TMkINQyF.js';
import './indexeddb-Ba_KKj-k.js';
const t = { title: 'Components/CourseTable' },
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
  render: () => CourseTable(),
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
  render: () => CourseTable(),
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
export { r as Dark, e as Default, n as __namedExportsOrder, t as default };
