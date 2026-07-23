# Análisis y esquema de mejoras — LS Jabones

> Este documento es un esquema para decidir próximos pasos, no un compromiso de implementación. Se
> escribió antes de tocar código, validando el brief técnico original (`DOCUMENTACION_PROYECTO.md` v2)
> a nivel aplicación y a nivel de convención del workspace.

## Diagnóstico del estado actual

### Fortalezas del brief original

- **Alcance de producto claro**: objetivos y roles bien definidos (vendedora/cliente), features núcleo
  acotadas al caso real ("sin stock, todo a pedido").
- **3 flujos bien detallados** con diagramas: pedido → notificación WhatsApp, cobro presencial con QR
  de Mercado Pago, y agente de marketing reactivo.
- **Buenas prácticas ya previstas antes de escribir código**:
  - Snapshot de nombre/precio en las líneas de pedido (`order_items.name_snapshot` /
    `unit_price`) — un pedido histórico no se rompe si el producto cambia después.
  - `NotificationService` con interfaz genérica, desacoplado de WhatsApp Cloud API como proveedor
    concreto — cambiar de proveedor no toca el resto del código.
  - Reglas de seguridad explícitas desde el diseño: secretos solo en env vars del backend, bcrypt,
    JWT con expiración, helmet, validación Zod en todo input.
- **Costo consciente**: todo el stack elegido tiene capa gratuita para el volumen de un emprendimiento
  chico (Mercado Pago solo cobra comisión por venta real).
- **Fases de desarrollo ya escalonadas**, con entregable concreto por fase — buena base para planificar
  el orden de trabajo.

### Debilidades / riesgos identificados

1. **Stack de base de datos no alineado con el objetivo del workspace.** El brief original elegía
   MongoDB Atlas. El objetivo declarado de `Entorno_Emprendedor` es mostrar Node/TS + SQL — la
   fortaleza real del desarrollador es diseño de bases de datos relacionales. Este dominio (productos,
   combos en relación M:N, pedidos con líneas) es además un caso natural de modelo relacional.
   `.cloud/estructura.md` exige justificar por escrito cualquier desvío del stack SQL por defecto, y
   el brief original no traía esa justificación.
   → **Resuelto**: se cambia a PostgreSQL (ver `especificacion-tecnica.md` §5 para el esquema
   relacional). ORM (Prisma vs. Drizzle) queda como decisión abierta para el arranque de la Fase 1.
2. **Las 7 fases se documentaban como un plan integral**, sin marcar cuál es el verdadero "primer
   entregable mostrable" frente a diferenciadores más ambiciosos. Para un emprendimiento real con
   fabricación manual, conviene tener algo andando pronto y validarlo con uso real antes de invertir en
   las partes más costosas de construir.
   → **Resuelto**: MVP recortado a fases 1-3 (catálogo + pedido + notificación WhatsApp). QR de pago y
   agente de marketing quedan documentados como fases 4-5, no bloqueantes.
3. **Sin noción de "capacidad de fabricación".** El estado `en_fabricacion` asume que la vendedora
   puede absorber cualquier volumen de pedidos entrantes. Al ser fabricación manual (jabones a pedido),
   una tanda de pedidos simultáneos puede saturarla. No hay campo de tiempo estimado de entrega ni
   límite de pedidos concurrentes. **Pendiente de resolver** — no bloquea el MVP, pero es un riesgo de
   negocio real, no solo técnico.
4. **Combos sin regla ante un producto desactivado.** El brief no definía qué pasa si se desactiva
   (`active: false`) un producto que integra un combo activo — podía quedar un combo "roto" visible en
   el catálogo público. **Resuelto a nivel de esquema**: `combo_items.product_id` usa
   `ON DELETE RESTRICT` para impedir borrar el producto mientras el combo lo referencie; queda
   pendiente definir la regla de UX para el caso de *desactivar* (no borrar) ese producto.
5. **Cliente no puede editar ni cancelar un pedido ya enviado.** Un cliente que se equivocó en el
   pedido no tiene forma de corregirlo sin contactar directo a la vendedora. Aceptable como fuera de
   alcance del MVP, pero queda anotado en vez de omitido silenciosamente.
6. **Costo de la fase de marketing con IA no estimado.** La Fase 7 menciona "generación con IA (API de
   Claude)" sin costo aproximado por request, lo cual rompe el "costo $0" declarado en el resumen para
   CV una vez que esa fase se implemente. Al ser fase "extra", no bloquea nada hoy, pero hay que
   presupuestarlo antes de activarla.
7. **Rate limiting mencionado sin granularidad.** El brief anota "rate limiting en `POST /api/orders`"
   sin especificar si es por IP, por teléfono, o ambos. Detalle menor a definir en la Fase 1.

### Gaps estructurales (ya resueltos por esta reestructuración)

- El proyecto no seguía la convención obligatoria de `_template/` (faltaban `.claude/`, `.cloud/`,
  `docs/`, `README.md`, `.gitignore`) — todo el contenido vivía en un único archivo suelto.
- No estaba inicializado como repositorio git independiente.
- No estaba sumado a los índices raíz del workspace (`README.md` y `.cloud/roadmap.md`).

## Esquema priorizado de mejoras

### Tier 1 — decisiones de diseño, ya resueltas en esta sesión

1. Cambiar MongoDB → PostgreSQL, con esquema relacional documentado (`especificacion-tecnica.md` §5).
2. Recortar el primer entregable a fases 1-3 (MVP: catálogo + pedido + WhatsApp).
3. Encajar el proyecto como el primer caso concreto del frente freelance del workspace.
4. Reestructurar la documentación a la convención `_template/` y sumar el proyecto a los índices raíz.

### Tier 2 — a resolver antes o durante la Fase 1 (bajo esfuerzo)

5. Elegir ORM (Prisma vs. Drizzle) y dejarlo anotado en `.claude/CLAUDE.md`.
6. Definir la regla de UX para combos cuando se desactiva (no borra) un producto miembro.
7. Definir granularidad del rate limiting en `POST /api/orders`.

### Tier 3 — mejoras de producto a evaluar después del MVP

8. Noción de "capacidad de fabricación" (tiempo estimado de entrega, límite de pedidos simultáneos)
   para proteger a la vendedora de sobrecarga.
9. Edición/cancelación de pedido por parte del cliente dentro de una ventana corta de tiempo.
10. Estimar costo real de la Fase 7 (marketing con IA) antes de activarla.
11. Dashboard simple de métricas (pedidos por semana, perfume más vendido) — buen diferencial de
    portfolio y útil para la vendedora a la hora de decidir qué producir más.

## Cómo seguir

Este esquema queda anotado en `../.cloud/business/roadmap.md` (sección "Próximo") y en las tareas
activas de `../.claude/CLAUDE.md`. La ejecución de cada tier se coordina en conversaciones futuras — el
código de la aplicación (Fase 1 en adelante) arranca recién después de que esta documentación quede
asentada.
