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
  // ================================
  // PATIENTS
  // ================================

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

  // ================================
  // REPORTS
  // ================================

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
      finalized_at TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // ================================
  // TEST PANELS
  // Example:
  // Liver Function Test
  // Kidney Function Test
  // CBC
  // ================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS test_panels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  // ================================
  // LABORATORY TESTS
  // Example:
  // ALT, AST, Hemoglobin, Creatinine
  // ================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS laboratory_tests (
      id TEXT PRIMARY KEY,
      panel_id TEXT NOT NULL,
      name TEXT NOT NULL,
      unit TEXT,
      reference_range TEXT,
      symbol TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      FOREIGN KEY (panel_id) REFERENCES test_panels(id)
    )
  `);

  // ================================
  // TEST RESULTS
  // Employee enters ONLY result_value
  // ================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS test_results (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      test_id TEXT NOT NULL,
      result_value TEXT NOT NULL,
      created_at TEXT NOT NULL,
      created_by TEXT,

      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (test_id) REFERENCES laboratory_tests(id)
    )
  `);
}