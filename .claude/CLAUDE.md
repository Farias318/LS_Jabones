# CLAUDE.md — LS Jabones

> Ver la convención general en `../../.cloud/estructura.md` (raíz del workspace `Entorno_Emprendedor`).

## Propósito del proyecto

Aplicación web full-stack de catálogo, pedidos y reservas para un emprendimiento real de jabones artesanales fabricados por la madre del usuario (sin stock: se fabrica a pedido). Pertenece al frente **freelance** del workspace (`../../.cloud/negocio.md`) — es el primer caso concreto de ese frente: un negocio chico real que necesita web + integración de pagos/mensajería, aunque la "clienta" sea familiar y no se facture el desarrollo.

Resuelve dos objetivos a la vez:
- Ayudar a la vendedora a publicar catálogo, cobrar y recibir pedidos sin fricción.
- Servir como proyecto full-stack demostrable en CV/portfolio (API REST propia, base de datos relacional, integraciones externas: WhatsApp, Mercado Pago).

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS → GitHub Pages.
- **Backend:** Node.js + Express + TypeScript → host a definir (ver `../.cloud/infra/deploy.md`).
- **Base de datos: PostgreSQL** (desvío consciente respecto al brief original que proponía MongoDB — se eligió Postgres para alinear con el objetivo de portfolio SQL del workspace y porque el dominio, productos/combos M:N/pedidos con líneas, es un caso natural de relacional). ORM aún no decidido: Prisma vs. Drizzle (ver "Contexto relevante").
- **Auth:** JWT + bcrypt (solo admin).
- **Mensajería:** Meta WhatsApp Cloud API (notificación de pedidos a la vendedora).
- **Pagos:** Mercado Pago Checkout Pro (QR dinámico para cobro presencial).
- **Validación:** Zod.

Detalle completo de arquitectura, flujos, endpoints y modelo de datos en `../docs/especificacion-tecnica.md`.

## Convenciones específicas

- Monorepo simple: `client/` (React), `server/` (Express), `shared/` (tipos y schemas Zod compartidos) — ver estructura de carpetas propuesta en `../docs/especificacion-tecnica.md` §7.
- Secretos (Postgres connection string, token Mercado Pago, token WhatsApp, JWT secret) solo en variables de entorno del backend — nunca en el repo ni en el frontend.
- Patrón de snapshot en pedidos: `order_items` guarda `name_snapshot` y `unit_price` para que un pedido histórico no se altere si el producto cambia después.

## Tareas activas

- [ ] Fase 1 — MVP: API núcleo (Express + Postgres): modelos, CRUD productos/combos, auth JWT admin, pedidos.
- [ ] Fase 2 — MVP: Frontend catálogo + carrito + envío de pedido + panel admin básico.
- [ ] Fase 3 — MVP: Notificación WhatsApp al crear un pedido (cierra el primer entregable mostrable).
- [ ] Fase 4 — posterior: Agente de marketing reactivo (plantillas + variantes + Web Share API).
- [ ] Fase 5 — posterior: Cobro con QR de Mercado Pago.
- [ ] Fase 6 — posterior: Deploy (GitHub Pages + host backend + Postgres producción).
- [ ] Fase 7 — extra: marketing con IA (API Claude), notificación al cliente, métricas de ventas.

## Contexto relevante

- **Decisión de stack (2026-07-22):** se cambió MongoDB → PostgreSQL respecto al brief original. Ver justificación en `../docs/analisis-mejoras.md`.
- **Alcance del MVP (2026-07-22):** se recortó el primer entregable a fases 1-3 (catálogo + pedido + WhatsApp). QR de pago y marketing quedan documentados pero no bloquean el primer corte.
- **ORM pendiente de decidir:** Prisma (más estándar en el ecosistema Node/TS, buena herramienta de migraciones) vs. Drizzle (más cercano a SQL puro, mejor para demostrar diseño de base de datos). Decidir al arrancar la Fase 1.
- **Gaps de producto identificados y aún no resueltos** (ver detalle en `../docs/analisis-mejoras.md`): sin noción de capacidad de fabricación, combos rotos si se desactiva un producto miembro, cliente no puede editar/cancelar un pedido enviado, costo de marketing con IA no estimado.
- No hay código todavía — este proyecto está en fase de documentación/especificación (pre-scaffold).
