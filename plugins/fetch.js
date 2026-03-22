/**
 * SigPro Fetch Plugin
 * Adds reactive data fetching capabilities to the SigPro instance.
 * @param {SigPro} $ - The SigPro core instance.
 */
export const Fetch = ($) => {
  /**
   * Performs a reactive asynchronous fetch request.
   * @param {string} url - The URL of the resource to fetch.
   * @param {RequestInit} [options] - Optional settings for the fetch request (method, headers, body, etc.).
   * @returns {{ $data: Function, $loading: Function, $error: Function }} 
   * An object containing reactive signals for the response data, loading state, and error message.
   * * @example
   * const { $data, $loading, $error } = $.fetch('https://api.example.com/users');
   * return div([
   * () => $loading() ? "Loading..." : ul($data().map(user => li(user.name))),
   * () => $error() && span({ class: 'text-red' }, $error())
   * ]);
   */
  _fetch = (url, options = {}) => {
    const $data = $(null);
    const $loading = $(true);
    const $error = $(null);

    fetch(url, options)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(json => $data(json))
      .catch(err => {
        console.error("[SigPro Fetch Error]:", err);
        $error(err.message);
      })
      .finally(() => $loading(false));

    return { $data, $loading, $error };
  };
};