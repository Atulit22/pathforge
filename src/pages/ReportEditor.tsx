import { useEffect, useState } from "react";
import {
  Save,
  CheckCircle2,
  FileText,
  GitBranchPlus,
  Lock,
} from "lucide-react";

import { useReports } from "../store/ReportContext";
import { usePatients } from "../store/PatientContext";

interface ReportEditorProps {
  reportId: string;
  onBack: () => void;
  onOpenReport: (reportId: string) => void;
}

function ReportEditor({
  reportId,
  onBack,
  onOpenReport,
}: ReportEditorProps) {
  const { getReport, updateReport, createAmendment } = useReports();
  const { patients } = usePatients();

  const foundReport = getReport(reportId);

  const [formData, setFormData] = useState({
    specimenType: "",
    clinicalHistory: "",
    findings: "",
    diagnosis: "",
  });

  useEffect(() => {
    if (!foundReport) return;

    setFormData({
      specimenType: foundReport.specimenType ?? "",
      clinicalHistory: foundReport.clinicalHistory ?? "",
      findings: foundReport.findings ?? "",
      diagnosis: foundReport.diagnosis ?? "",
    });
  }, [foundReport]);

  if (!foundReport) {
    return (
      <div className="report-not-found">
        <h2>Report not found</h2>

        <button
          className="secondary-button"
          onClick={onBack}
        >
          Back to Worklist
        </button>
      </div>
    );
  }

  const report = foundReport;

  const patient = patients.find(
    (patient) => patient.id === report.patientId
  );

  const isFinalized = report.status === "finalized";

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    if (isFinalized) return;

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function saveChanges() {
    if (isFinalized) return;

    updateReport(report.id, {
      specimenType: formData.specimenType,
      clinicalHistory: formData.clinicalHistory,
      findings: formData.findings,
      diagnosis: formData.diagnosis,
    });

    alert("Changes saved!");
  }

  function finalizeReport() {
    if (isFinalized) return;

    updateReport(report.id, {
      specimenType: formData.specimenType,
      clinicalHistory: formData.clinicalHistory,
      findings: formData.findings,
      diagnosis: formData.diagnosis,
      status: "finalized",
      finalizedAt: new Date().toISOString(),
    });

    alert(`Report Version ${report.version} finalized!`);
  }

  function handleCreateAmendment() {
    if (!isFinalized) return;

    const amendment = createAmendment(report.id);

    if (!amendment) {
      alert("Could not create amendment.");
      return;
    }

    alert(
      `Version ${amendment.version} created as a draft amendment.`
    );

    onOpenReport(amendment.id);
  }

  return (
    <div className="report-editor-page">
      <div className="editor-topbar">
        <div>
          <button
            className="back-button"
            onClick={onBack}
          >
            ← Back to Worklist
          </button>

          <div className="report-title-row">
            <div>
              <h2>Report Editor</h2>

              <p>
                {patient?.name ?? "Unknown Patient"} ·{" "}
                {patient?.patientId ?? "Unknown ID"}
              </p>
            </div>

            <span
              className={`version-badge ${
                isFinalized ? "finalized" : "draft"
              }`}
            >
              Version {report.version}
            </span>
          </div>

          {isFinalized && (
            <div className="finalized-notice">
              <Lock size={16} />

              <span>
                This report is finalized and cannot be edited.
                Create an amendment to make changes.
              </span>
            </div>
          )}
        </div>

        <div className="editor-actions">
          {!isFinalized ? (
            <>
              <button
                className="secondary-button"
                onClick={saveChanges}
              >
                <Save size={17} />
                Save Changes
              </button>

              <button
                className="primary-button"
                onClick={finalizeReport}
              >
                <CheckCircle2 size={17} />
                Finalize Report
              </button>
            </>
          ) : (
            <button
              className="primary-button"
              onClick={handleCreateAmendment}
            >
              <GitBranchPlus size={17} />
              Create Amendment
            </button>
          )}
        </div>
      </div>

      <div
        className={`report-editor-card ${
          isFinalized ? "read-only" : ""
        }`}
      >
        <div className="editor-section">
          <div className="editor-section-title">
            <FileText size={19} />

            <div>
              <h3>Specimen Details</h3>
              <p>Basic information about the specimen</p>
            </div>
          </div>

          <div className="form-group">
            <label>Specimen Type</label>

            <input
              type="text"
              name="specimenType"
              value={formData.specimenType}
              onChange={handleChange}
              disabled={isFinalized}
            />
          </div>
        </div>

        <div className="editor-section">
          <div className="editor-section-title">
            <FileText size={19} />

            <div>
              <h3>Clinical History</h3>
              <p>Relevant patient history</p>
            </div>
          </div>

          <textarea
            name="clinicalHistory"
            value={formData.clinicalHistory}
            onChange={handleChange}
            rows={4}
            disabled={isFinalized}
          />
        </div>

        <div className="editor-section">
          <div className="editor-section-title">
            <FileText size={19} />

            <div>
              <h3>Microscopic Findings</h3>
              <p>Detailed pathology observations</p>
            </div>
          </div>

          <textarea
            name="findings"
            value={formData.findings}
            onChange={handleChange}
            rows={7}
            disabled={isFinalized}
          />
        </div>

        <div className="editor-section">
          <div className="editor-section-title">
            <FileText size={19} />

            <div>
              <h3>Diagnosis</h3>
              <p>Final pathological diagnosis</p>
            </div>
          </div>

          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            rows={5}
            disabled={isFinalized}
          />
        </div>
      </div>
    </div>
  );
}

export default ReportEditor;