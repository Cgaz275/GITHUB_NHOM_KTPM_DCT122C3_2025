import fs from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { getEnabledTheme } from '../../../lib/util/getEnabledTheme.js';

const defaultAdminTailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: '#008060',
        secondary: '#111213',
        surface: '#111213',
        onSurface: '#111213',
        interactive: '#2c6ecb',
        critical: '#d72c0d',
        warning: '#FFC453',
        highlight: '#5BCDDA',
        success: '#008060',
        decorative: '#FFC96B',
        border: '#8c9196',
        background: '#f6f6f7fc',
        icon: '#5c5f62',
        divider: '#e1e3e5',
        textSubdued: '#6d7175'
      },
      boxShadow: {
        DEFAULT: '0 0 0 1px rgba(63,63,68,.05),0 1px 3px 0 rgba(63,63,68,.15)'
      }
    }
  },
  variants: {
    extend: {
      borderWidth: ['first', 'last'],
      margin: ['first', 'last'],
      padding: ['first', 'last']
    }
  }
};

const defaultFrontStoreTailwindConfig = {
  theme: {
    extend: {
      colors: {
        white: '#ffffff',
        primary: '#008060',
        secondary: '#111213',
        surface: '#111213',
        onSurface: '#111213',
        interactive: '#2c6ecb',
        critical: '#fa4545',
        warning: '#FFC453',
        highlight: '#5BCDDA',
        success: '#008060',
        decorative: '#FFC96B',
        border: '#8c9196',
        icon: '#5c5f62',
        divider: '#e1e3e5',
        textSubdued: '#737373',
        button: '#008060'
      },
      boxShadow: {
        DEFAULT: '0 0 0 1px rgba(63,63,68,.05),0 1px 3px 0 rgba(63,63,68,.15)'
      }
    }
  },
  variants: {
    extend: {
      borderWidth: ['first', 'last'],
      margin: ['first', 'last'],
      padding: ['first', 'last']
    }
  }
};

export async function getTailwindConfig(isAdmin = false) {
  const defaultConfig = isAdmin
    ? defaultAdminTailwindConfig
    : defaultFrontStoreTailwindConfig;

  let tailwindConfig = {};
  if (!isAdmin) {
    // Get the current theme
    const theme = getEnabledTheme();
    if (
      theme &&
      fs.existsSync(join(theme.path, 'dist', 'tailwind.config.js'))
    ) {
      tailwindConfig = await import(
        pathToFileURL(join(theme.path, 'dist', 'tailwind.config.js'))
      );
    }
  }
  // Merge defaultTailwindConfig with tailwindConfigJs
  const mergedTailwindConfig = Object.assign(
    defaultConfig,
    tailwindConfig.default || {}
  );

  return mergedTailwindConfig;
}
