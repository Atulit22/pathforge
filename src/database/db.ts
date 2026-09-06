import Database from "@tauri-apps/plugin-sql";

let database: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (database) {
    return database;
  }

  database = await Database.load("sqlite:pathforge.db");

  await initializeDatabase(database);

  return database;
}

async function initializeDatabase(db: Database): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      created_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      specimen_type TEXT NOT NULL,
      clinical_history TEXT,
      findings TEXT,
      diagnosis TEXT,
      status TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      parent_report_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);
}