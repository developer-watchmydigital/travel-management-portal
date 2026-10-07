import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

let client: postgres.Sql | null = null;
let dbInstance: PostgresJsDatabase<typeof schema> | null = null;

if (connectionString) {
  try {
    const isAwsRds = connectionString.includes("rds.amazonaws.com") || connectionString.includes("amazonaws.com") || connectionString.includes("sslmode=require");
    
    client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: isAwsRds ? { rejectUnauthorized: false } : undefined,
    });

    dbInstance = drizzle(client, { schema });
  } catch (err) {
    console.error("Drizzle PostgreSQL client initialization failed:", err);
  }
}

export const db = dbInstance;
export { schema };

export function isDbConnected(): boolean {
  return dbInstance !== null;
}
