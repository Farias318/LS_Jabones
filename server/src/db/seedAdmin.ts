import bcrypt from 'bcrypt';
import { db } from './index.js';
import { users } from './schema.js';

/*
  Fase 4 del roadmap (ROADMAP-BACKEND-ADMIN.md): no hay registro público de admins,
  así que el único usuario (la vendedora) se crea/actualiza a mano corriendo este
  script, tomando los datos de server/.env (ADMIN_EMAIL/ADMIN_PASSWORD/ADMIN_NOTIFY_PHONE).
  Es idempotente: si el email ya existe, actualiza el hash y el teléfono.
*/
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const notifyPhone = process.env.ADMIN_NOTIFY_PHONE;

  if (!email || !password || !notifyPhone) {
    throw new Error('Faltan ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NOTIFY_PHONE en server/.env');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db
    .insert(users)
    .values({ email, passwordHash, notifyPhone })
    .onConflictDoUpdate({ target: users.email, set: { passwordHash, notifyPhone } });

  console.log(`Admin listo ✓ (${email})`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Error seedeando admin:', err);
  process.exit(1);
});
