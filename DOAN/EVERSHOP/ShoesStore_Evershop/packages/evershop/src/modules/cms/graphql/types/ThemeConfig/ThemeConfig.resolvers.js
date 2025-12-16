import { getConfig } from '../../../../../lib/util/getConfig.js';

const defaultThemeConfig = {
  logo: {
    alt: undefined,
    src: undefined,
    width: undefined,
    height: undefined
  },
  headTags: {
    links: [],
    metas: [],
    scripts: [],
    bases: []
  },
  copyRight: '© 2022 Evershop. All Rights Reserved.'
};

export default {
  Query: {
    themeConfig: () => getConfig('themeConfig') || defaultThemeConfig
  }
};
