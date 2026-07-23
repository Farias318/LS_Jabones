# Despliegue — LS Jabones

## Proveedor

- **Frontend:** GitHub Pages + GitHub Actions (SPA React/Vite). `base` de Vite configurado como `/ls-jabones/` (o el nombre real del repo).
- **Base de datos (PostgreSQL):** candidatos free-tier a evaluar al momento de desplegar — **Neon** (Postgres serverless, free tier generoso), **Supabase** (Postgres + extras) o **Railway** (Postgres + backend en el mismo lugar).
- **Backend (Express + TS):** candidatos free/barato — Render, Railway, Fly.io o Koyeb. Es un contenedor Node estándar: corre en cualquiera de estos. Definir cuando arranque la Fase 1.

> Nota heredada del brief original: los hosts gratuitos de Node suelen "dormir" la instancia (cold start de unos segundos en la primera request). Aceptable para el volumen de este negocio.

## Checklist antes de desplegar

- [ ] Variables de entorno cargadas en el proveedor (ver `.env.example`)
- [ ] Build corre sin errores en local (`npm run build`)
- [ ] Migraciones de Postgres aplicadas (Prisma/Drizzle, a definir) + datos iniciales cargados si aplica
- [ ] CORS en Express habilitado solo para el origen de GitHub Pages
- [ ] Rutas SPA en GitHub Pages resueltas (HashRouter o workaround de `404.html`)
- [ ] Dominio o subdominio configurado
- [ ] CI/CD (GitHub Actions) corriendo en cada push a main

## URL de producción

<!-- Completar cuando esté desplegado -->
