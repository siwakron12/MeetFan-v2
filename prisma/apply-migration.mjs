import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const root = process.cwd();
const dbPath = path.join(root, "prisma", "dev.db");
const migrationPath = path.join(
  root,
  "prisma",
  "migrations",
  "20260615174000_init",
  "migration.sql"
);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

if (fs.existsSync(dbPath)) {
  console.log(`Database already exists at ${dbPath}`);
  process.exit(0);
}

const db = new Database(dbPath);
const migrationSql = fs.readFileSync(migrationPath, "utf8");

db.exec("PRAGMA foreign_keys = ON;");
db.exec(migrationSql);
db.close();

console.log(`Applied migration to ${dbPath}`);
