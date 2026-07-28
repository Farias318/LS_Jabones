# Roadmap — Backend (PostgreSQL) + Panel Admin

> Documento de trabajo, no un compromiso de fechas. Se ejecuta en fases, cada una en su propia
> conversación/sesión, siguiendo el orden de este documento.

## 1. Objetivo

Hoy `LS_Jabones` es 100% frontend estático (GitHub Pages): el catálogo sale de mocks en
`client/src/data/`, y el checkout (`client/src/pages/Cart.tsx`) arma un link de Mercado Pago o un
mensaje de WhatsApp **enteramente en el navegador del cliente** — nada se guarda en ningún lado. La
vendedora (mi mamá) no tiene forma de ver qué pedidos entraron ni de saber quién pagó.

Este roadmap agrega un backend con PostgreSQL y un panel de administración (usuario único: la
vendedora) para que pueda:

1. Ver un listado de los clientes que hicieron encargos.
2. Ver quién pagó, y si pagó el total o dejó una seña.
3. Marcar el estado de cada venta — por ejemplo: seña por transferencia (Mercado Pago) + resto en
   efectivo al entregar el producto.

**Qué NO cambia:** el catálogo visual, el diseño, "armá tu combo" y el checkout con los dos botones
("Pagar ahora" / "Encargar por WhatsApp") siguen exactamente igual. El backend solo agrega **registro
y visibilidad** para la vendedora — no toca la experiencia del cliente.

## 2. La limitación central: no hay confirmación automática de pago

El botón "Pagar ahora" usa el link personal de Mercado Pago ("Tu Link", ver
`client/src/config/checkout.ts`). Ese tipo de link **no tiene webhook ni API**: Mercado Pago no nos
avisa cuándo ni si alguien pagó. Eso solo existe con **Checkout Pro** (preferencias de pago creadas
por un backend + webhook de confirmación) — una integración bastante más grande, ya documentada como
Fase 5 en `docs/especificacion-tecnica.md`, y **no bloqueante** para este roadmap.

Por eso, en esta primera versión, la conciliación de pagos es **manual**: la vendedora revisa su
propia app de Mercado Pago (o el efectivo recibido en mano) y carga en el panel qué recibió por cada
pedido — monto y método. Un mismo pedido puede tener varios pagos parciales (ej. $4.000 por
transferencia + $4.500 en efectivo al entregar), así que el modelo de datos permite **varios registros
de pago por pedido**, no un único flag "pagado sí/no".

> Mejora futura opcional (no necesaria ahora): migrar de "Tu Link" a Checkout Pro para automatizar la
> confirmación. Se anota acá para no perderla de vista, pero no es parte de este roadmap.

## 3. Esquema de datos

Reutiliza las tablas ya documentadas en [`docs/especificacion-tecnica.md`](docs/especificacion-tecnica.md)
§5: `products`, `combos`, `combo_items`, `orders`, `order_items`, `users`. Se agregan dos cosas:

### 3.1 Tabla nueva: `order_payments`

```sql
CREATE TABLE order_payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method        TEXT NOT NULL,   -- 'mercado_pago_link' | 'efectivo' | 'transferencia' | 'otro'
  amount        NUMERIC(10,2) NOT NULL,
  note          TEXT,            -- ej: "seña por MP, resto en efectivo al entregar"
  registered_by TEXT NOT NULL,   -- admin que lo cargó (por ahora siempre la vendedora)
  paid_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

El estado de pago del pedido (`sin_pago` / `seña` / `pagado_completo`) se **calcula**, comparando
`SUM(order_payments.amount)` contra `orders.total` — no se guarda como un campo fijo, para que nunca
quede desincronizado del detalle real de pagos cargados.

### 3.2 Campo nuevo en `orders`: `intent`

```sql
ALTER TABLE orders ADD COLUMN intent TEXT NOT NULL DEFAULT 'whatsapp';
-- 'pago_directo' (vino del botón "Pagar ahora") | 'whatsapp' (vino de "Encargar por WhatsApp")
```

Le dice a la vendedora qué esperar: si el pedido vino por "pago directo", debería aparecer una
transferencia a confirmar; si vino por WhatsApp, va a coordinar por chat.

### 3.3 Listado de clientes (pedido #1 del usuario)

En esta v1 se arma **agrupando pedidos por teléfono** (no hace falta una tabla `customers` separada
todavía — menos piezas móviles, y el teléfono ya es el identificador natural del cliente en este
negocio). Queda anotado como mejora futura si más adelante se quiere historial/notas por cliente entre
visitas (por ejemplo, para fidelización).

## 4. Fases de implementación

Cada fase es una sesión de trabajo separada. No se arranca la fase N+1 sin haber probado la fase N.

1. **Setup local** — Postgres local (o Docker), instalar Drizzle + `drizzle-kit`, definir el schema en
   TypeScript, generar y correr la primera migración (todas las tablas de arriba + las ya
   documentadas).
2. **Seed** — script que migra `client/src/data/products.mock.ts` y `combos.mock.ts` a filas reales
   insertadas en la base, para no perder el catálogo ya armado a mano.
3. **API núcleo** — `GET /api/products`, `GET /api/combos` (públicos), `POST /api/orders` (lo va a
   llamar el checkout del frontend).
4. **Auth admin** — `POST /api/auth/login` (bcrypt + JWT). Un único usuario admin (la vendedora),
   seedeado a mano con la contraseña que ella elija — no hay registro público de admins.
5. **Endpoints admin** (protegidos por JWT) — `GET /api/orders` (con filtros por estado de pago /
   fabricación), `PATCH /api/orders/:id/status` (estado de fabricación), `POST /api/orders/:id/payments`
   (cargar un pago manual), `GET /api/orders/:id` (detalle con todos sus pagos).
6. **Conectar el frontend actual**:
   - `useProducts.ts` pasa de mock a `fetch` real — mismo shape de datos, cambio mínimo (ya está
     comentado en el propio hook que este día iba a llegar).
   - `Cart.tsx` hace `POST /api/orders` **antes** de abrir el link de Mercado Pago o WhatsApp. Si la
     llamada falla (ej. el backend está dormido por cold start), el flujo sigue igual para no romper
     la experiencia del cliente — solo se pierde ese registro puntual.
7. **Panel admin (frontend nuevo)** — login + ruta protegida `/admin`. Tabla de pedidos con: cliente,
   teléfono, items, total, estado de pago (calculado), estado de fabricación. Acción "cargar pago"
   (monto + método + nota) y selector de estado de fabricación.
8. **Deploy** — migrar el schema a **Neon** (Postgres free tier), desplegar el backend a **Render**
   (free tier), configurar CORS solo para el origen de GitHub Pages, y apuntar el frontend
   (`VITE_API_URL`) al backend ya desplegado.

## 5. ¿Es viable sin costo?

Sí, en todas las etapas:

| Pieza | Costo | Nota |
|---|---|---|
| Postgres local | $0 | Sin límites, sin depender de internet — ideal para desarrollar las fases 1-7. |
| Neon (Postgres free tier) | $0 | Alcanza de sobra para el volumen de este negocio. |
| Render (API free tier) | $0 | Tiene *cold start* (la instancia "duerme" tras inactividad, la primera request tarda unos segundos) — aceptable para este caso, ya documentado en `.cloud/infra/deploy.md`. |
| Mercado Pago | $0 | Mientras se use el link personal ("Tu Link") no hay integración que pagar. La comisión por venta solo aplicaría si en el futuro se migra a Checkout Pro. |

## 6. Decisiones ya tomadas

- **ORM: Drizzle** — más cercano a SQL puro que Prisma, mejor vidriera de diseño de base de datos para
  portfolio (a costa de algo más de código manual en migraciones/queries).
- **Postgres local primero** — se desarrolla y prueba todo en local; recién se migra a Neon cuando el
  backend esté validado (Fase 8).

## 7. Próximo paso

Arrancar por la **Fase 1** (setup local + schema Drizzle) en una conversación dedicada.

---

## 8. (Futuro — NO arrancar todavía) Automatizar confirmación de pagos vía webhook de Mercado Pago

> ⏸️ **SALTEAR este ítem cuando retomemos el roadmap.** Depende de que las Fases 1-8 ya estén
> funcionando en producción (backend desplegado, panel admin operativo con conciliación manual
> probada). No es la Fase 9 del plan activo — es una mejora posterior, documentada acá para no
> perderla, pero fuera de alcance hasta que el resto esté andando con uso real.

### Qué resuelve

Hoy la conciliación de pagos por Mercado Pago es 100% manual (ver sección 2). Esta fase la
automatiza — el efectivo entregado en persona **sigue siendo manual siempre**, no depende de esto.

### Qué implica

1. Cuenta de developer en Mercado Pago (aplicación + access token) vinculada a la cuenta de la
   vendedora.
2. El backend genera una **preferencia de pago por pedido** (Checkout Pro) en vez de usar el link fijo
   de "Tu Link" — "Pagar ahora" pasa a ser un link dinámico, con el total exacto de ese pedido y una
   referencia (`external_reference`) a nuestro `orders.id`.
3. Endpoint público nuevo `POST /api/payments/webhook`: recibe la notificación de MP, valida la firma
   (no confiar en el payload a ciegas), vuelve a consultar el pago contra la API de MP, y si está
   aprobado inserta automáticamente una fila en `order_payments` (`method='mercado_pago'`,
   `registered_by='webhook'`).
4. Requiere que el backend ya tenga URL pública (no se puede probar 100% en local sin un túnel tipo
   ngrok) — por eso conviene hacerlo después del deploy (Fase 8), no antes.
5. Columnas nuevas: `orders.mp_preference_id`, `order_payments.mp_payment_id` (único, para no duplicar
   el mismo pago si el webhook llega más de una vez).
6. Manejo de los estados intermedios de MP (`pending` / `approved` / `rejected`) — decidir qué hacer
   con cada uno.

### Por qué no ahora

Empuja el deploy a ser un prerrequisito temprano (el webhook necesita URL pública) y suma piezas
(validación de firma, idempotencia) que no aportan nada hasta que el resto del sistema esté probado
con conciliación manual. Es la mejora natural una vez que eso esté validado con uso real.

### Resultado para la vendedora

El efectivo se sigue cargando a mano (inevitable). Los pagos por Mercado Pago se van a reflejar solos,
sin que tenga que revisar su app y cargar cada uno manualmente.
