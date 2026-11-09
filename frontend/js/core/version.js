/* The deployed version, stamped into the page by the server ("dev" when running locally). */
const stamp = document.querySelector('meta[name="build"]');
export const BUILD = stamp && stamp.content && !stamp.content.startsWith('__') ? stamp.content : 'dev';
