import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getDatabase } from "../database/db";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  patientId: string;
}

interface PatientContextType {
  patients: Patient[];
  addPatient: (patient: Patient) => Promise<void>;
  loading: boolean;
}

const PatientContext = createContext<PatientContextType | undefined>(
  undefined
);

export function PatientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      const db = await getDatabase();

      const rows = await db.select<
        {
          id: string;
          patient_id: string;
          name: string;
          age: number;
          gender: string;
        }[]
      >(
        `
        SELECT id, patient_id, name, age, gender
        FROM patients
        ORDER BY created_at DESC
        `
      );

      const loadedPatients: Patient[] = rows.map((row) => ({
        id: row.id,
        patientId: row.patient_id,
        name: row.name,
        age: row.age,
        gender: row.gender,
      }));

      setPatients(loadedPatients);
    } catch (error) {
      console.error("Failed to load patients:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addPatient(patient: Patient): Promise<void> {
    try {
      const db = await getDatabase();

      await db.execute(
        `
        INSERT INTO patients (
          id,
          patient_id,
          name,
          age,
          gender,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          patient.id,
          patient.patientId,
          patient.name,
          patient.age,
          patient.gender,
          new Date().toISOString(),
        ]
      );

      setPatients((previous) => [patient, ...previous]);
    } catch (error) {
      console.error("Failed to save patient:", error);
      throw error;
    }
  }

  return (
    <PatientContext.Provider
      value={{
        patients,
        addPatient,
        loading,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients(): PatientContextType {
  const context = useContext(PatientContext);

  if (!context) {
    throw new Error(
      "usePatients must be used inside PatientProvider"
    );
  }

  return context;
}