import fs from 'fs';
import path from 'path';

export default function sigproRouter() {
  const virtualModuleId = 'virtual:sigpro-routes';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  const getFiles = (dir) => {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { recursive: true })
      .filter(file => /\.(js|jsx)$/.test(file) && !path.basename(file).startsWith('_'))
      .map(file => path.resolve(dir, file));
  };

  const pathToUrl = (pagesDir, filePath) => {
    let relative = path.relative(pagesDir, filePath)
      .replace(/\\/g, '/')
      .replace(/\.(js|jsx)$/, '')
      .replace(/\/index$/, '')
      .replace(/^index$/, '');

    let url = '/' + relative;
    
    return url
      .replace(/\/+/g, '/')
      .replace(/\[\.\.\.([^\]]+)\]/g, '*')
      .replace(/\[([^\]]+)\]/g, ':$1')
      .replace(/\/$/, '') || '/';
  };

  return {
    name: 'sigpro-router',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) return;

      const pagesDir = path.resolve(process.cwd(), 'src/pages');
      const files = getFiles(pagesDir).sort((a, b) => {
        const urlA = pathToUrl(pagesDir, a);
        const urlB = pathToUrl(pagesDir, b);
        if (urlA.includes(':') && !urlB.includes(':')) return 1;
        if (!urlA.includes(':') && urlB.includes(':')) return -1;
        return urlB.length - urlA.length;
      });

      let routeEntries = '';

      files.forEach((fullPath) => {
        const urlPath = pathToUrl(pagesDir, fullPath);
        const importPath = fullPath.replace(/\\/g, '/');
        routeEntries += `  { path: '${urlPath}', component: () => import('${importPath}') },\n`;
      });

      if (!routeEntries.includes("path: '*'")) {
        routeEntries += `  { path: '*', component: () => span('404 - Not Found') },\n`;
      }

      return `export const routes = [\n${routeEntries}];`;
    }
  };
}