import { useState } from "react";
import { Plus, Search, Users, X } from "lucide-react";
import { usePatients, type Patient } from "../store/PatientContext";
import Swal from "sweetalert2";
import PageHeading from "../components/layout/PageHeading";

export default function Patients() {
  const { patients, addPatient, loading } = usePatients();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    patientId: "",
  });

  const filteredPatients = patients.filter((patient) =>
    `${patient.name} ${patient.patientId}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.age ||
      !formData.gender ||
      !formData.patientId.trim()
    ) {
      Swal.fire("Please select a patient.");;
      return;
    }

    const newPatient: Patient = {
      id: crypto.randomUUID(),
      name: formData.name.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      patientId: formData.patientId.trim(),
    };

    try {
      setIsSaving(true);

      await addPatient(newPatient);

      setFormData({
        name: "",
        age: "",
        gender: "",
        patientId: "",
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save patient:", error);

      Swal.fire(
        `Failed to save patient. Check the console for details.`
      );
    } finally {
      setIsSaving(false);
    }
  }

  function closeModal() {
    if (isSaving) return;

    setIsModalOpen(false);

    setFormData({
      name: "",
      age: "",
      gender: "",
      patientId: "",
    });
  }

  return (
    <div className="patients-page">
      <PageHeading
        title="Patients"
        subtitle="Search patient records or add a new patient."
      />

      <div className="page-toolbar">
        <div className="patients-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          className="primary-button"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          Add Patient
        </button>
      </div>

      <div className="patients-card">
        <div className="patients-card-header">
          <div>
            <h3>Patients</h3>

            <p>
              {loading
                ? "Loading patients..."
                : `${filteredPatients.length} patient records`}
            </p>
          </div>
        </div>

        <div className="patients-table">
          <div className="table-header">
            <span>Patient</span>
            <span>Patient ID</span>
            <span>Age</span>
            <span>Gender</span>
          </div>

          {loading ? (
            <div className="no-results">
              <p>Loading patients...</p>
            </div>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <div className="table-row" key={patient.id}>
                <div className="patient-name">
                  <div className="patient-avatar">
                    <Users size={17} />
                  </div>

                  <strong>{patient.name}</strong>
                </div>

                <span>{patient.patientId}</span>
                <span>{patient.age}</span>
                <span>{patient.gender}</span>
              </div>
            ))
          ) : (
            <div className="no-results">
              <Users size={35} />
              <h3>No patients found</h3>
              <p>Add your first patient record.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={closeModal}
        >
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
                onClick={closeModal}
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Full Name</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter patient's full name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label>Patient ID</label>

                  <input
                    type="text"
                    name="patientId"
                    placeholder="e.g. PF-1003"
                    value={formData.patientId}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label>Age</label>

                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    min="0"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Gender</label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={isSaving}
                  >
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSaving}
                >
                  <Plus size={18} />

                  {isSaving
                    ? "Saving..."
                    : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}