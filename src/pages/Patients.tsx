import { useState } from "react";
import { Plus, Search, Users, X } from "lucide-react";
import { usePatients } from "../store/PatientContext";
import PageHeading from "../components/layout/PageHeading";
import PatientForm from "../components/patients/PatientForm";

export default function Patients() {
  const { patients, loading } = usePatients();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const query = search.trim().toLowerCase();
  const filteredPatients = query
    ? patients.filter((patient) =>
        `${patient.name} ${patient.patientId} ${patient.phone}`
          .toLowerCase()
          .includes(query)
      )
    : patients;

  return (
    <div className="patients-page">
      <PageHeading
        title="Patients"
        subtitle="Search patient records or register a new patient."
        actions={
          <button
            className="primary-button"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            Add Patient
          </button>
        }
      />

      <div className="page-toolbar">
        <div className="patients-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, Patient ID or phone…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="patients-card">
        <div className="patients-card-header">
          <div>
            <h3>Patients</h3>
            <p>
              {loading
                ? "Loading patients…"
                : `${filteredPatients.length} patient ${
                    filteredPatients.length === 1 ? "record" : "records"
                  }`}
            </p>
          </div>
        </div>

        <div className="patients-table">
          <div className="table-header patients-row">
            <span>Patient</span>
            <span>Patient ID</span>
            <span>Age</span>
            <span>Sex</span>
            <span>Phone</span>
          </div>

          {loading ? (
            <div className="no-results">
              <p>Loading patients…</p>
            </div>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <div className="table-row patients-row" key={patient.id}>
                <div className="patient-name">
                  <div className="patient-avatar">
                    <Users size={17} />
                  </div>
                  <strong>{patient.name}</strong>
                </div>
                <span>{patient.patientId}</span>
                <span>{patient.age}</span>
                <span>{patient.gender}</span>
                <span>{patient.phone || "—"}</span>
              </div>
            ))
          ) : (
            <div className="no-results">
              <Users size={35} />
              <h3>No patients found</h3>
              <p>
                {query
                  ? "No patient matches your search."
                  : "Add your first patient record."}
              </p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="patient-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Add Patient</h2>
                <p>Create a new patient record</p>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <PatientForm
              onSaved={() => setIsModalOpen(false)}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
