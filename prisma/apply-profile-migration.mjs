import Database from "better-sqlite3";

const db = new Database("prisma/dev.db");
const columns = new Set(
  db
    .prepare("PRAGMA table_info('User')")
    .all()
    .map((column) => column.name)
);

function addColumn(name, sql) {
  if (!columns.has(name)) {
    db.exec(sql);
  }
}

addColumn("age", 'ALTER TABLE "User" ADD COLUMN "age" INTEGER');
addColumn("district", 'ALTER TABLE "User" ADD COLUMN "district" TEXT');
addColumn("occupation", 'ALTER TABLE "User" ADD COLUMN "occupation" TEXT');
addColumn(
  "interests",
  'ALTER TABLE "User" ADD COLUMN "interests" TEXT NOT NULL DEFAULT \'[]\''
);
addColumn(
  "goals",
  'ALTER TABLE "User" ADD COLUMN "goals" TEXT NOT NULL DEFAULT \'[]\''
);

db.close();
console.log("Profile columns ready");
