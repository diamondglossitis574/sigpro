// plugins/router.js
export const Router = ($) => {
  
  $.router = (routes) => {
    const sPath = $(window.location.hash.replace(/^#/, "") || "/");
    window.addEventListener("hashchange", () => sPath(window.location.hash.replace(/^#/, "") || "/"));

    return div([
      () => {
        const current = sPath();
        const route = routes.find(r => {
          const rP = r.path.split('/').filter(Boolean);
          const cP = current.split('/').filter(Boolean);
          if (rP.length !== cP.length) return false;
          return rP.every((part, i) => part.startsWith(':') || part === cP[i]);
        }) || routes.find(r => r.path === "*");

        if (!route) return h1("404 - Not Found");

        // --- LA MEJORA AQUÍ ---
        const result = typeof route.component === 'function' ? route.component() : route.component;

        // Si el componente es una Promesa (Lazy Loading de Vite), esperamos
        if (result instanceof Promise) {
          const $lazyNode = $(span("Cargando página..."));
          result.then(m => {
            // Si el módulo tiene un .default (export default), lo usamos
            const comp = typeof m === 'function' ? m() : (m.default ? m.default() : m);
            $lazyNode(comp);
          });
          return () => $lazyNode();
        }

        return result instanceof Node ? result : span(String(result));
      }
    ]);
  };

  $.router.go = (path) => {
    window.location.hash = path.startsWith('/') ? path : `/${path}`;
  };

  window._router = $.router;
};