# LS Jabones — Especificación técnica (v3, PostgreSQL)

> Aplicación web full-stack de catálogo, pedidos y reservas para un emprendimiento de jabones artesanales, con notificaciones automáticas por WhatsApp y agente de marketing.
> Migrado desde el brief original (`DOCUMENTACION_PROYECTO.md` v2) a la convención de `Entorno_Emprendedor` y actualizado a PostgreSQL — ver el porqué del cambio en [`analisis-mejoras.md`](analisis-mejoras.md).

---

## 1. Resumen del proyecto

Aplicación tipo **catálogo + encargos** (sin stock: los jabones se fabrican a pedido), con backend propio.

**Objetivos:**
- Ayudar a la vendedora a publicar, cobrar y recibir pedidos sin fricción.
- Servir como proyecto full-stack demostrable en CV/portfolio (backend real: API REST, base de datos relacional, integraciones externas).

**Perfiles de uso:**

| Perfil | Qué hace |
|---|---|
| **Vendedora (admin)** | Gestiona catálogo y combos, ve/gestiona pedidos, genera QR de cobro (Mercado Pago), comparte publicaciones generadas por el agente de marketing. |
| **Cliente** | Navega el catálogo, arma su selección y envía un **pedido/reserva** con sus datos. No requiere registrarse. |

**Funcionalidades núcleo:**

1. Catálogo de jabones y **combos** (nombre, perfume, foto, precio, descripción, atributos).
2. Carrito de selección múltiple → genera un pedido/reserva.
3. **Notificación automática por WhatsApp a la vendedora** cada vez que entra un pedido desde la web (vía Meta WhatsApp Cloud API).
4. Panel admin de pedidos con estados (pendiente → en fabricación → listo → entregado).
5. **Agente de marketing reactivo**: genera la descripción/publicación en base al producto o combo exactamente seleccionado, y la comparte a estados de WhatsApp / historias de Instagram desde la app.
6. Cobro presencial con **QR de Mercado Pago** generado por el backend.
7. Autenticación: solo el usuario admin accede a gestión y marketing.

**Alcance del MVP (decisión tomada, ver `analisis-mejoras.md`):** el primer entregable mostrable son las funcionalidades 1-3 (catálogo, pedido, notificación WhatsApp) — Fases 1-3 de la sección 8. Las funcionalidades 5-6 (marketing, QR de pago) son fases posteriores, no bloqueantes.

---

## 2. Stack tecnológico

| Capa | Tecnología | Rol |
|---|---|---|
| Frontend | **React 18 + Vite + TypeScript** | SPA estática → GitHub Pages. |
| Estilos | **Tailwind CSS** | UI responsive, uso principal en celular. |
| Backend | **Node.js + Express + TypeScript** | API REST propia. |
| ORM | **A definir: Prisma o Drizzle** | Sobre PostgreSQL. Prisma = más estándar en el ecosistema y mejor tooling de migraciones; Drizzle = más cercano a SQL puro, mejor vidriera de diseño de base de datos. Decidir al arrancar la Fase 1. |
| Base de datos | **PostgreSQL** (free tier: Neon, Supabase o Railway) | Productos, combos, pedidos, plantillas, usuarios. Cambiado desde MongoDB del brief original — ver justificación en `analisis-mejoras.md`. |
| Auth | **JWT** (access token) + bcrypt | Login del admin. Suma conceptos de seguridad al CV. |
| Mensajería | **Meta WhatsApp Cloud API** | Notificación de pedidos a la vendedora. Gratis para este volumen. |
| Pagos | **Mercado Pago Checkout Pro** (SDK Node) | El backend crea la preferencia; el front muestra la URL como QR (`qrcode.react`). |
| Compartir | **Web Share API** | Compartir texto/imagen al menú nativo del celular (WhatsApp/Instagram). |
| Validación | **Zod** | Validación de requests en la API (y tipos compartidos con el front). |
| Deploy front | GitHub Pages + GitHub Actions | Ya definido. |
| Deploy back | **A definir por el desarrollador** | Candidatos con capa gratuita/barata: Render, Railway, Fly.io, Koyeb. La API es un contenedor Node estándar: corre en cualquiera. |

> **Regla de oro:** los secretos (token de Mercado Pago, token de WhatsApp, JWT secret, connection string de Postgres) viven **solo en variables de entorno del backend**. Nunca en el repositorio ni en el frontend.

---

## 3. Arquitectura

```
┌──────────────────────┐
│    GitHub Pages      │  React SPA
│  (catálogo, carrito, │
│   panel admin)       │
└──────────┬───────────┘
           │ HTTPS (fetch → REST)
┌──────────▼───────────┐
│   API Express + TS   │  (host a definir)
│  ├── /api/products   │
│  ├── /api/combos     │
│  ├── /api/orders     │──────► PostgreSQL (Prisma/Drizzle)
│  ├── /api/auth       │
│  ├── /api/payments   │──────► Mercado Pago (preferencia → URL de pago)
│  └── /api/marketing  │
│                      │
│  OrderService        │
│   └─ al crear pedido ├──────► Meta WhatsApp Cloud API
│      dispara notif.  │        → mensaje al WhatsApp de la vendedora
└──────────────────────┘
```

### Flujo 1 — Pedido de un cliente (con notificación)
1. Cliente arma el carrito y completa nombre + teléfono.
2. `POST /api/orders` → se valida (Zod) y se guarda en Postgres (estado `pendiente`).
3. El `NotificationService` envía por WhatsApp Cloud API un mensaje a la vendedora:
   > 🧼 *Nuevo pedido #A1B2*
   > Juana — 11-5555-5555
   > 2× Jabón de lavanda, 1× Combo relax
   > Total estimado: $8.500
4. La vendedora lo ve también en el panel admin y va cambiando el estado.
5. (Opcional) Al pasar a `listo`, se puede notificar al cliente con un link `wa.me` prearmado.

### Flujo 2 — Cobro presencial con QR
1. La vendedora arma el carrito en su celular y toca **Cobrar**.
2. `POST /api/payments/preference` → el backend (SDK de Mercado Pago) crea la preferencia y devuelve el `init_point`.
3. El front lo muestra como **QR a pantalla completa**; el cliente escanea y paga.
4. `POST /api/payments/webhook` recibe la confirmación de Mercado Pago y marca el pedido como `pagado`.

### Flujo 3 — Agente de marketing reactivo
1. En el panel admin, la vendedora selecciona **un producto o un conjunto/combo**.
2. `POST /api/marketing/generate` recibe los IDs seleccionados.
3. El agente arma la publicación **en base a los datos reales de lo seleccionado**:
   - **Un producto** → usa sus atributos (perfume, beneficios, precio) sobre una plantilla con variables.
   - **Varios productos / combo** → descripción integradora: nombra cada jabón, arma narrativa de conjunto y usa el precio de combo si existe.
   - Motor en dos niveles: **plantillas + variables** (fase inicial, costo cero) y **generación con IA** (API de Claude, fase posterior — ver costo estimado pendiente en `analisis-mejoras.md`) usando un system prompt de "vendedor" con los datos del producto inyectados.
4. El front muestra 2-3 variantes; ella elige, edita si quiere, y toca **Compartir** → Web Share API → estados de WhatsApp o historias de Instagram.
5. (Extra) Generación de **imagen promocional** con canvas: foto del producto + precio + logo, compartible como imagen de historia.

---

## 4. API — Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/products` | — | Catálogo activo (público). |
| POST/PUT/DELETE | `/api/products/:id` | admin | ABM de productos. |
| GET | `/api/combos` | — | Combos activos. |
| POST/PUT/DELETE | `/api/combos/:id` | admin | ABM de combos. |
| POST | `/api/orders` | — | Crear pedido (cliente). Dispara notificación WhatsApp. |
| GET | `/api/orders` | admin | Listar pedidos con filtros por estado. |
| PATCH | `/api/orders/:id/status` | admin | Cambiar estado del pedido. |
| POST | `/api/auth/login` | — | Login admin → JWT. |
| POST | `/api/payments/preference` | admin | Crear preferencia MP → URL para QR. |
| POST | `/api/payments/webhook` | firma MP | Confirmación de pago. |
| POST | `/api/marketing/generate` | admin | Generar publicación para producto(s)/combo. |
| GET/POST | `/api/marketing/templates` | admin | Gestión de plantillas. |

---

## 5. Modelo de datos (PostgreSQL — relacional)

> Cambiado desde el modelo Mongoose del brief original. Esquema conceptual (DDL simplificado); el ORM definitivo (Prisma o Drizzle) generará las migraciones reales.

```sql
-- products
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,             -- "Jabón de lavanda"
  perfume      TEXT NOT NULL,             -- aroma, filtrable
  description  TEXT,
  attributes   TEXT[],                    -- ["relajante", "piel sensible", "vegano"]
  price        NUMERIC(10,2) NOT NULL,
  image_url    TEXT,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- combos
CREATE TABLE combos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,             -- "Combo relax"
  combo_price  NUMERIC(10,2) NOT NULL,    -- precio especial del conjunto
  description  TEXT,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- combo_items: tabla puente M:N entre combos y products
CREATE TABLE combo_items (
  combo_id     UUID NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity     INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (combo_id, product_id)
);
-- ON DELETE RESTRICT en product_id: evita borrar un producto que integra un
-- combo activo sin decidir antes qué pasa con ese combo (gap señalado en
-- analisis-mejoras.md — antes el brief no definía esta regla).

-- orders
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT NOT NULL UNIQUE,     -- corto y legible: "A1B2"
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_notes   TEXT,
  total            NUMERIC(10,2) NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pendiente',
                     -- 'pendiente' | 'en_fabricacion' | 'listo' | 'entregado' | 'cancelado'
  payment_status   TEXT NOT NULL DEFAULT 'sin_pago',  -- 'sin_pago' | 'pagado'
  mp_preference_id TEXT,
  notified_at      TIMESTAMPTZ,               -- cuándo se envió el WhatsApp a la vendedora
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- order_items: líneas de pedido, con snapshot de nombre/precio
CREATE TABLE order_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ref_type       TEXT NOT NULL,              -- 'product' | 'combo'
  ref_id         UUID NOT NULL,
  name_snapshot  TEXT NOT NULL,
  unit_price     NUMERIC(10,2) NOT NULL,
  quantity       INTEGER NOT NULL DEFAULT 1
);
-- name_snapshot/unit_price: si el producto/combo cambia después, el pedido
-- histórico no se altera.

-- marketing_templates
CREATE TABLE marketing_templates (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title     TEXT NOT NULL,        -- "Lanzamiento", "Combo promo", "Recordatorio"
  scope     TEXT NOT NULL,        -- 'single' | 'multi'
  template  TEXT NOT NULL         -- "✨ {nombre} con aroma a {perfume}... ${precio}"
);

-- users (admin)
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'admin',
  notify_phone   TEXT NOT NULL    -- WhatsApp donde recibe los pedidos
);
```

---

## 6. Notificaciones — Meta WhatsApp Cloud API

- Se crea una app en **Meta for Developers** (tipo Business) con el producto WhatsApp habilitado.
- Meta da un **número de prueba gratuito** y hasta 5 destinatarios verificados → perfecto para desarrollo (el número de la vendedora se agrega como destinatario).
- El backend envía con un simple `POST` a `graph.facebook.com/v20.0/{phone_number_id}/messages` usando el token en env.
- Mensajes iniciados por la empresa requieren **plantillas aprobadas** (message templates); se registra una plantilla `nuevo_pedido` con variables (código, cliente, items, total).
- Costo: el volumen de un emprendimiento entra holgado en el nivel gratuito.
- **Diseño desacoplado:** `NotificationService` con interfaz genérica (`send(to, payload)`), implementación `WhatsAppCloudProvider`. Si mañana cambia el proveedor (Twilio, etc.), solo se cambia la implementación.
- La notificación se envía **después** de persistir el pedido y nunca debe romper el flujo: si falla, el pedido queda guardado y se loguea el error (campo `notified_at` vacío → reintentable).

---

## 7. Estructura de carpetas

Monorepo simple con dos paquetes:

```
LS_Jabones/
├── client/                      # React + Vite + TS  → GitHub Pages
│   ├── src/
│   │   ├── components/
│   │   │   ├── catalog/         # ProductCard, ProductGrid, PerfumeFilter
│   │   │   ├── cart/            # CartDrawer, CartItem, CartSummary
│   │   │   ├── payment/         # QrDisplay, PaymentStatus
│   │   │   ├── marketing/       # ProductPicker, MessageVariants, ShareButton
│   │   │   └── ui/              # Button, Modal, Input
│   │   ├── pages/
│   │   │   ├── Home.tsx         # catálogo público
│   │   │   ├── Cart.tsx
│   │   │   ├── OrderConfirm.tsx
│   │   │   └── admin/           # Login, Dashboard, Products, Combos,
│   │   │                        # Orders, Checkout (QR), Marketing
│   │   ├── hooks/               # useCart, useAuth, useProducts
│   │   ├── services/api.ts      # cliente fetch hacia la API
│   │   └── types/               # importa tipos compartidos
│   └── vite.config.ts           # base = '/ls-jabones/'
│
├── server/                      # Express + TS  → host a definir
│   ├── src/
│   │   ├── config/              # env, conexión a Postgres
│   │   ├── db/                  # esquema/migraciones (Prisma o Drizzle) + queries
│   │   ├── routes/              # products, combos, orders, auth,
│   │   │                        # payments, marketing
│   │   ├── controllers/         # 1 por recurso: valida (Zod) y responde
│   │   ├── services/
│   │   │   ├── order.service.ts
│   │   │   ├── notification/    # interfaz + WhatsAppCloudProvider
│   │   │   ├── payment.service.ts   # SDK Mercado Pago
│   │   │   └── marketing/       # motor de plantillas (+ IA opcional)
│   │   ├── middleware/          # auth JWT, errores, rate limit
│   │   └── app.ts / index.ts
│   ├── .env.example             # ver ../../.cloud/infra/.env.example
│   └── Dockerfile               # despliegue portable a cualquier host
│
├── shared/                      # tipos y schemas Zod compartidos
├── .github/workflows/deploy.yml # build client → GitHub Pages
└── README.md
```

---

## 8. Fases de desarrollo

| Fase | Alcance | Entregable | Prioridad |
|---|---|---|---|
| **1 — API núcleo** | Express + Postgres: modelos, CRUD productos/combos, auth JWT admin, pedidos. Probado con REST client. | API funcionando en local. | **MVP** |
| **2 — Frontend catálogo + pedidos** | Catálogo, carrito, envío de pedido, confirmación. Panel admin: login, ABM, lista de pedidos. | App usable end-to-end en local. | **MVP** |
| **3 — Notificación WhatsApp** | App en Meta, plantilla `nuevo_pedido`, NotificationService. | Pedido web → WhatsApp a la vendedora. **Cierra el primer entregable mostrable.** | **MVP** |
| **4 — Agente de marketing** | Motor de plantillas reactivo (producto/combo), variantes, Web Share API, imagen canvas. | Botón "Compartir" funcionando desde el celular. | Posterior |
| **5 — Pagos** | Preferencia MP + QR + webhook. | Cobro presencial con QR dinámico. | Posterior |
| **6 — Deploy** | GitHub Pages (client) + host elegido (server) + Postgres producción. CORS, env, dominio. | App online. | Posterior |
| **7 — Extras** | Marketing con IA (API Claude), notificación al cliente, métricas de ventas. | Mejoras incrementales. | Extra |

---

## 9. Consideraciones técnicas

- **CORS:** habilitar en Express solo el origen de GitHub Pages.
- **Rutas SPA en GitHub Pages:** usar HashRouter o el workaround de `404.html`.
- **Cold starts:** los hosts gratuitos de Node suelen dormir la instancia; la primera request tarda unos segundos. Aceptable para este caso; evaluar al elegir host.
- **Rate limiting** en `POST /api/orders` para evitar spam de pedidos.
- **Códigos de pedido cortos** (ej. `A1B2`) para que sea fácil referirlos por WhatsApp.
- **Seguridad:** bcrypt para el password, JWT con expiración, helmet, validación Zod en todo input.
- **Integridad de combos:** `combo_items.product_id` usa `ON DELETE RESTRICT` — no se puede borrar un producto mientras integre un combo activo (evita combos "rotos" en el catálogo público). Queda pendiente decidir la regla de UX cuando se quiera desactivar ese producto (¿desactivar el combo también? ¿avisar a la vendedora?).

## 10. Resumen de lenguajes y tecnologías (para CV)

**TypeScript** (front y back) · **React + Vite** · **Tailwind CSS** · **Node.js + Express** · **PostgreSQL** (Prisma o Drizzle) · **JWT/bcrypt** · **Zod** · **Meta WhatsApp Cloud API** · **Mercado Pago SDK** · **Docker** · **GitHub Actions**

Costo del MVP: **$0** salvo el host del backend (a investigar) — Postgres free tier (Neon/Supabase), WhatsApp Cloud API y GitHub Pages son gratuitos; Mercado Pago cobra solo comisión por venta.
