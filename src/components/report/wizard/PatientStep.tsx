import { useMemo, useState } from "react";
import { Search, UserPlus, UserCheck } from "lucide-react";

import { usePatients } from "../../../store/PatientContext";
import PatientForm from "../../patients/PatientForm";

interface PatientStepProps {
  selectedPatientId: string;
  onSelect: (patientId: string) => void;
}

type Mode = "existing" | "new";

export default function PatientStep({
  selectedPatientId,
  onSelect,
}: PatientStepProps) {
  const { patients } = usePatients();
  const [mode, setMode] = useState<Mode>(
    patients.length > 0 ? "existing" : "new"
  );
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!query) return patients.slice(0, 8);
    return patients
      .filter((patient) =>
        `${patient.name} ${patient.patientId} ${patient.phone}`
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 12);
  }, [patients, query]);

  const selected = patients.find((patient) => patient.id === selectedPatientId);

  return (
    <div className="wizard-panel">
      <h2>Patient</h2>
      <p className="wizard-panel-hint">
        Choose an existing patient, or register a new one. A report always
        belongs to a patient.
      </p>

      <div className="choice-row">
        <button
          type="button"
          className={`choice-card${mode === "existing" ? " is-selected" : ""}`}
          onClick={() => setMode("existing")}
        >
          <UserCheck size={18} />
          <span>
            <strong>Use an existing patient</strong>
            Search by name, Patient ID or phone
          </span>
        </button>

        <button
          type="button"
          className={`choice-card${mode === "new" ? " is-selected" : ""}`}
          onClick={() => setMode("new")}
        >
          <UserPlus size={18} />
          <span>
            <strong>Create a new patient</strong>
            Patient ID is generated automatically
          </span>
        </button>
      </div>

      {mode === "existing" ? (
        <div className="existing-patient">
          <div className="patients-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search patients…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
            />
          </div>

          {patients.length === 0 ? (
            <p className="form-hint">
              No patients yet — switch to “Create a new patient”.
            </p>
          ) : (
            <ul className="patient-pick-list">
              {matches.map((patient) => (
                <li key={patient.id}>
                  <button
                    type="button"
                    className={`patient-pick${
                      patient.id === selectedPatientId ? " is-selected" : ""
                    }`}
                    onClick={() => onSelect(patient.id)}
                  >
                    <span className="patient-pick-name">{patient.name}</span>
                    <span className="patient-pick-meta">
                      {patient.patientId} · {patient.age}y · {patient.gender}
                      {patient.phone ? ` · ${patient.phone}` : ""}
                    </span>
                  </button>
                </li>
              ))}
              {matches.length === 0 ? (
                <li className="form-hint">No patient matches “{search}”.</li>
              ) : null}
            </ul>
          )}

          {selected ? (
            <p className="selection-confirm">
              Selected: <strong>{selected.name}</strong> ({selected.patientId})
            </p>
          ) : null}
        </div>
      ) : (
        <div className="new-patient">
          <PatientForm
            submitLabel="Save patient & continue"
            onSaved={(patientId) => {
              onSelect(patientId);
              setMode("existing");
            }}
          />
        </div>
      )}
    </div>
  );
}
