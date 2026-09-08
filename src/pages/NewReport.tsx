import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { FilePlus2, Save, FlaskConical } from "lucide-react";

import { usePatients } from "../store/PatientContext";
import { useReports, type Report, type TestResult } from "../store/ReportContext";
import { useTests } from "../store/TestContext";
import type { LaboratoryTest, TestParameter } from "../domain/types";
import { formatReferenceRange } from "../components/report/referenceRange";

/** Result-state key: unique per (test, parameter) so panels never collide. */
function resultKey(testId: string, parameterId: string): string {
  return `${testId}::${parameterId}`;
}

function distinct(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim() !== ""))];
}

export default function NewReport() {
  const { patients } = usePatients();
  const { addReport } = useReports();
  const { tests } = useTests();

  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    patientId: "",
    specimenType: "",
    clinicalHistory: "",
    diagnosis: "",
    findings: "",
  });

  const selectedTests = useMemo(
    () =>
      selectedTestIds
        .map((id) => tests.find((test) => test.id === id))
        .filter((test): test is LaboratoryTest => test !== undefined),
    [selectedTestIds, tests]
  );

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  function toggleTest(testId: string) {
    setSelectedTestIds((previous) =>
      previous.includes(testId)
        ? previous.filter((id) => id !== testId)
        : [...previous, testId]
    );

    // Drop any entered values for a test that was just removed.
    setResults((previous) => {
      if (!selectedTestIds.includes(testId)) return previous;
      const next: Record<string, string> = {};
      for (const [key, value] of Object.entries(previous)) {
        if (!key.startsWith(`${testId}::`)) next[key] = value;
      }
      return next;
    });
  }

  function handleResultChange(
    testId: string,
    parameterId: string,
    value: string
  ) {
    setResults((previous) => ({
      ...previous,
      [resultKey(testId, parameterId)]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.patientId) {
      Swal.fire("Please select a patient.");
      return;
    }
    if (selectedTests.length === 0) {
      Swal.fire("Please select at least one laboratory test.");
      return;
    }
    if (!formData.specimenType) {
      Swal.fire("Please enter the specimen type.");
      return;
    }

    // Snapshot every selected test's parameters so the report stays stable even
    // if an administrator later edits the test configuration.
    const reportTestResults: TestResult[] = selectedTests.flatMap((test) =>
      test.parameters.map((parameter) => ({
        parameterId: parameter.id,
        parameterName: parameter.name,
        testId: test.id,
        testName: test.name,
        unit: parameter.unit ?? "",
        referenceRange: parameter.referenceRange,
        value: results[resultKey(test.id, parameter.id)] ?? "",
      }))
    );

    const newReport: Report = {
      id: crypto.randomUUID(),
      patientId: formData.patientId,
      specimenType: formData.specimenType,
      clinicalHistory: formData.clinicalHistory,
      findings: formData.findings,
      diagnosis: formData.diagnosis,
      testId: selectedTests.map((test) => test.id).join(","),
      testName: selectedTests.map((test) => test.name).join(", "),
      department: distinct(selectedTests.map((test) => test.department)).join(", "),
      testResults: reportTestResults,
      status: "draft",
      version: 1,
      createdAt: new Date().toISOString(),
    };

    try {
      await addReport(newReport);
    } catch (error) {
      Swal.fire(
        error instanceof Error
          ? `Could not save the report: ${error.message}`
          : "Could not save the report."
      );
      return;
    }

    setFormData({
      patientId: "",
      specimenType: "",
      clinicalHistory: "",
      diagnosis: "",
      findings: "",
    });
    setSelectedTestIds([]);
    setResults({});

    Swal.fire("Laboratory report saved as draft!");
  }

  return (
    <div className="new-report-page">
      <div className="report-page-header">
        <div>
          <h2>Create New Report</h2>
          <p>Create a laboratory report for a patient.</p>
        </div>
      </div>

      <form className="report-form" onSubmit={handleSubmit}>
        {/* Patient */}
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

        {/* Test selection */}
        <div className="report-section">
          <div className="section-title">
            <FlaskConical size={20} />
            <div>
              <h3>Laboratory Tests</h3>
              <p>Select one or more tests to include in this report</p>
            </div>
          </div>

          {tests.length === 0 ? (
            <p className="form-hint">
              No laboratory tests configured yet. Add tests under Test Management
              first.
            </p>
          ) : (
            <div className="test-picker">
              {tests.map((test) => {
                const checked = selectedTestIds.includes(test.id);
                return (
                  <label
                    key={test.id}
                    className={`test-picker-item${checked ? " is-selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTest(test.id)}
                    />
                    <span className="test-picker-name">{test.name}</span>
                    <span className="test-picker-meta">
                      {test.department} · {test.parameters.length}{" "}
                      {test.parameters.length === 1 ? "parameter" : "parameters"}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {selectedTests.length > 0 && (
            <p className="form-hint">
              {selectedTests.length}{" "}
              {selectedTests.length === 1 ? "test" : "tests"} selected:{" "}
              {selectedTests.map((test) => test.name).join(", ")}
            </p>
          )}
        </div>

        {/* Specimen */}
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
              placeholder="e.g. Whole Blood EDTA"
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

        {/* Results — one table per selected test */}
        {selectedTests.map((test) => (
          <div
            key={test.id}
            className="report-section test-results-section"
          >
            <div className="section-title">
              <FlaskConical size={20} />
              <div>
                <h3>{test.name} — Results</h3>
                <p>
                  {test.department} · enter results for each parameter below
                </p>
              </div>
            </div>

            <ParameterEntryTable
              parameters={test.parameters}
              valueFor={(parameterId) =>
                results[resultKey(test.id, parameterId)] ?? ""
              }
              onChange={(parameterId, value) =>
                handleResultChange(test.id, parameterId, value)
              }
            />
          </div>
        ))}

        {/* Notes */}
        <div className="report-section">
          <div className="section-title">
            <FilePlus2 size={20} />
            <div>
              <h3>Report Notes</h3>
              <p>Additional findings and diagnosis</p>
            </div>
          </div>

          <div className="form-group">
            <label>Findings</label>
            <textarea
              name="findings"
              placeholder="Enter findings..."
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

interface ParameterEntryTableProps {
  parameters: TestParameter[];
  valueFor: (parameterId: string) => string;
  onChange: (parameterId: string, value: string) => void;
}

function ParameterEntryTable({
  parameters,
  valueFor,
  onChange,
}: ParameterEntryTableProps) {
  return (
    <div className="results-table-wrapper">
      <table className="results-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Result</th>
            <th>Unit</th>
            <th>Reference Range</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((parameter) => (
            <tr key={parameter.id}>
              <td className="parameter-cell">{parameter.name}</td>
              <td className="result-cell">
                <input
                  type="text"
                  placeholder="Enter result"
                  value={valueFor(parameter.id)}
                  onChange={(event) =>
                    onChange(parameter.id, event.target.value)
                  }
                />
              </td>
              <td className="unit-cell">{parameter.unit ?? "—"}</td>
              <td className="reference-cell">
                {formatReferenceRange(parameter.referenceRange)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
