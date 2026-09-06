import { useState } from "react";
import { FilePlus2, Save } from "lucide-react";
import { usePatients } from "../store/PatientContext";
import { useReports, type Report } from "../store/ReportContext";

export default function NewReport() {
  const { patients } = usePatients();
  const { addReport } = useReports();

  const [formData, setFormData] = useState({
    patientId: "",
    specimenType: "",
    clinicalHistory: "",
    diagnosis: "",
    findings: "",
  });

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.patientId || !formData.specimenType) {
      alert("Please select a patient and enter the specimen type.");
      return;
    }

    const newReport: Report = {
      id: crypto.randomUUID(),
      patientId: formData.patientId,
      specimenType: formData.specimenType,
      clinicalHistory: formData.clinicalHistory,
      findings: formData.findings,
      diagnosis: formData.diagnosis,

      status: "draft",

      // Every newly created report starts at Version 1
      version: 1,

      createdAt: new Date().toISOString(),
    };

    addReport(newReport);

    setFormData({
      patientId: "",
      specimenType: "",
      clinicalHistory: "",
      diagnosis: "",
      findings: "",
    });

    alert("Report saved as draft!");
  }

  return (
    <div className="new-report-page">
      <div className="report-page-header">
        <div>
          <h2>Create New Report</h2>
          <p>Create a pathology report for a patient.</p>
        </div>
      </div>

      <form className="report-form" onSubmit={handleSubmit}>
        <div className="report-section">
          <div className="section-title">
            <FilePlus2 size={20} />

            <div>
              <h3>Patient Information</h3>
              <p>Select the patient for this report</p>
            </div>
          </div>

          <div className="form-group">
            <label>Select Patient</label>

            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
            >
              <option value="">Select a patient</option>

              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} — {patient.patientId}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="report-section">
          <div className="section-title">
            <FilePlus2 size={20} />

            <div>
              <h3>Specimen Details</h3>
              <p>Enter specimen and clinical information</p>
            </div>
          </div>

          <div className="form-group">
            <label>Specimen Type</label>

            <input
              type="text"
              name="specimenType"
              placeholder="e.g. Breast biopsy"
              value={formData.specimenType}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Clinical History</label>

            <textarea
              name="clinicalHistory"
              placeholder="Enter relevant clinical history..."
              value={formData.clinicalHistory}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>

        <div className="report-section">
          <div className="section-title">
            <FilePlus2 size={20} />

            <div>
              <h3>Pathology Report</h3>
              <p>Enter diagnostic findings</p>
            </div>
          </div>

          <div className="form-group">
            <label>Findings</label>

            <textarea
              name="findings"
              placeholder="Enter microscopic findings..."
              value={formData.findings}
              onChange={handleChange}
              rows={6}
            />
          </div>

          <div className="form-group">
            <label>Diagnosis</label>

            <textarea
              name="diagnosis"
              placeholder="Enter final diagnosis..."
              value={formData.diagnosis}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>

        <div className="report-actions">
          <button type="submit" className="primary-button">
            <Save size={18} />
            Save Draft
          </button>
        </div>
      </form>
    </div>
  );
}