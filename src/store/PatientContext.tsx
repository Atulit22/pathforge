import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getDatabase } from "../database/db";
import { nextPatientId } from "../domain/patientId.mjs";

export interface Patient {
  id: string;
  /** Human-facing identifier, `PF-YYYYMMDD-NNN`, generated once at registration. */
  patientId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  address?: string;
}

/** Fields the user supplies when registering a patient. */
export type NewPatientInput = Omit<Patient, "id" | "patientId">;

interface PatientContextType {
  patients: Patient[];
  loading: boolean;
  /** Register a patient. The Patient ID is generated here, never by the caller. */
  addPatient: (input: NewPatientInput) => Promise<Patient>;
  getPatient: (id: string) => Patient | undefined;
  /** Preview the next Patient ID (for display before the form is submitted). */
  previewPatientId: () => string;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadPatients();
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
          phone: string | null;
          address: string | null;
        }[]
      >(
        `
        SELECT id, patient_id, name, age, gender, phone, address
        FROM patients
        ORDER BY created_at DESC
        `
      );

      setPatients(
        rows.map((row) => ({
          id: row.id,
          patientId: row.patient_id,
          name: row.name,
          age: row.age,
          gender: row.gender,
          phone: row.phone ?? "",
          address: row.address ?? undefined,
        }))
      );
    } catch (error) {
      console.error("Failed to load patients:", error);
    } finally {
      setLoading(false);
    }
  }

  const previewPatientId = useCallback(
    () => nextPatientId(patients.map((patient) => patient.patientId)),
    [patients]
  );

  const addPatient = useCallback(
    async (input: NewPatientInput): Promise<Patient> => {
      const patient: Patient = {
        id: crypto.randomUUID(),
        patientId: nextPatientId(patients.map((existing) => existing.patientId)),
        name: input.name,
        age: input.age,
        gender: input.gender,
        phone: input.phone,
        address: input.address,
      };

      try {
        const db = await getDatabase();
        await db.execute(
          `
          INSERT INTO patients (
            id, patient_id, name, age, gender, phone, address, created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [
            patient.id,
            patient.patientId,
            patient.name,
            patient.age,
            patient.gender,
            patient.phone,
            patient.address ?? null,
            new Date().toISOString(),
          ]
        );

        setPatients((previous) => [patient, ...previous]);
        return patient;
      } catch (error) {
        console.error("Failed to save patient:", error);
        throw error;
      }
    },
    [patients]
  );

  const getPatient = useCallback(
    (id: string) => patients.find((patient) => patient.id === id),
    [patients]
  );

  const value = useMemo(
    () => ({
      patients,
      loading,
      addPatient,
      getPatient,
      previewPatientId,
    }),
    [patients, loading, addPatient, getPatient, previewPatientId]
  );

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
}

export function usePatients(): PatientContextType {
  const context = useContext(PatientContext);

  if (!context) {
    throw new Error("usePatients must be used inside PatientProvider");
  }

  return context;
}
