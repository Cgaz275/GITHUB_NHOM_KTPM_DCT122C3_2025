import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coreModules = [
  {
    name: 'base',
    resolve: path.resolve(__dirname, '../../modules/base'),
    path: path.resolve(__dirname, '../../modules/base')
  },
  {
    name: 'auth',
    resolve: path.resolve(__dirname, '../../modules/auth'),
    path: path.resolve(__dirname, '../../modules/auth')
  },
  {
    name: 'cms',
    resolve: path.resolve(__dirname, '../../modules/cms'),
    path: path.resolve(__dirname, '../../modules/cms')
  },
  {
    name: 'graphql',
    resolve: path.resolve(__dirname, '../../modules/graphql'),
    path: path.resolve(__dirname, '../../modules/graphql')
  },
  {
    name: 'setting',
    resolve: path.resolve(__dirname, '../../modules/setting'),
    path: path.resolve(__dirname, '../../modules/setting')
  }
];

export function loadModule(path) {
  return readdirSync(path, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => ({
      name: dirent.name,
      path: path.resolve(path, dirent.name)
    }));
}

export function getCoreModules() {
  return coreModules;
}
