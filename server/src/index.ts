import { sql } from 'drizzle-orm';
import { db } from './db/index.js';

/*
  Smoke test de la Fase 1 (ver ROADMAP-BACKEND-ADMIN.md): solo confirma que la
  conexión a Postgres funciona y que las tablas de la migración existen. La API
  real (Express + endpoints) arranca en la Fase 3.
*/
async function main() {
  const result = await db.execute(sql`select now() as now, current_database() as db`);
  console.log('Conexión a Postgres OK ✓');
  console.log(result.rows[0]);

  const tables = await db.execute(sql`
    select table_name from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `);
  console.log('Tablas encontradas:', tables.rows.map((r) => r.table_name));

  process.exit(0);
}

main().catch((err) => {
  console.error('Error conectando a Postgres:', err.message);
  process.exit(1);
});
