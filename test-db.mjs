import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

try {
  // Test tagged template
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log("Tables:", tables.map(r => r.table_name));

  // Test the cast approach used in db.ts query()
  const castSql = sql as unknown as (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;
  const result = await castSql("SELECT 1 as num", []);
  console.log("Cast query result:", result);

  console.log("ALL OK");
} catch (err) {
  console.error("ERROR:", err);
}
