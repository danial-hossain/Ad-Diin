// https://vite.dev/guide/env-and-mode.html
export const secrets = {
  backendEndpoint: import.meta.env.VITE_BACKEND_ENDPOINT || 'http://127.0.0.1:8000',
};
