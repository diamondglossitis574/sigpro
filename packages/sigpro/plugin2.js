import fs from 'fs';
import path from 'path';

export default function sigproRouter() {
  const virtualModuleId = 'virtual:sigpro-routes';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  const getFiles = (dir) => {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { recursive: true })
      .filter(file => /\.(js|jsx)$/.test(file))
      .map(file => path.join(dir, file));
  };

  const pathToUrl = (pagesDir, filePath) => {
    const relative = path.relative(pagesDir, filePath)
      .replace(/\\/g, '/')
      .replace(/\.(js|jsx)$/, '')
      .replace(/\/index$/, '')
      .replace(/^index$/, '/');

    return ('/' + relative)
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
      const files = getFiles(pagesDir).sort((a, b) => b.length - a.length);

      let imports = '';
      let routeEntries = '';

      files.forEach((fullPath, i) => {
        const urlPath = pathToUrl(pagesDir, fullPath);
        const varName = `Page_${i}`;
        const importPath = fullPath.replace(/\\/g, '/');

        imports += `import ${varName} from '${importPath}';\n`;
        routeEntries += `  { path: '${urlPath}', component: ${varName} },\n`;
      });

      if (!routeEntries.includes("path: '*'")) {
        routeEntries += `  { path: '*', component: () => _h1('404') },\n`;
      }

      return `${imports}\nexport const routes = [\n${routeEntries}];`;
    }
  };
}
