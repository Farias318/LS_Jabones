// VITE_API_URL se define en el build de producción (Fase 8 del roadmap, apunta a
// Render). En desarrollo, sin la variable definida, cae al backend local.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
