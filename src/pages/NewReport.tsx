import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

import { useReports, type Report, type TestResult } from "../store/ReportContext";
import { useTests } from "../store/TestContext";
import type { LaboratoryTest } from "../domain/types";

import Stepper from "../components/report/wizard/Stepper";
import PatientStep from "../components/report/wizard/PatientStep";
import TestSpecimenStep from "../components/report/wizard/TestSpecimenStep";
import ResultsStep, { resultKey } from "../components/report/wizard/ResultsStep";
import ClinicalStep, {
  type ClinicalDetails,
} from "../components/report/wizard/ClinicalStep";
import ReviewStep from "../components/report/wizard/ReviewStep";

interface NewReportProps {
  onOpenReport: (reportId: string) => void;
}

const STEPS = [
  "Patient",
  "Test & specimen",
  "Results",
  "Clinical details",
  "Review",
];

function distinct(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim() !== ""))];
}

export default function NewReport({ onOpenReport }: NewReportProps) {
  const { addReport } = useReports();
  const { tests } = useTests();

  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [saving, setSaving] = useState(false);

  const [patientId, setPatientId] = useState("");
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [specimenType, setSpecimenType] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [clinical, setClinical] = useState<ClinicalDetails>({
    clinicalHistory: "",
    findings: "",
    diagnosis: "",
  });

  const selectedTests = useMemo(
    () =>
      selectedTestIds
        .map((id) => tests.find((test) => test.id === id))
        .filter((test): test is LaboratoryTest => test !== undefined),
    [selectedTestIds, tests]
  );

  const stepValid = [
    patientId !== "",
    selectedTests.length > 0 && specimenType.trim() !== "",
    true,
    true,
    true,
  ];

  const canSave = stepValid[0] && stepValid[1];

  function goTo(next: number) {
    setStep(next);
    setFurthest((current) => Math.max(current, next));
  }

  function next() {
    if (step < STEPS.length - 1 && stepValid[step]) goTo(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function buildReport(): Report {
    const testResults: TestResult[] = selectedTests.flatMap((test) =>
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

    return {
      id: crypto.randomUUID(),
      patientId,
      specimenType: specimenType.trim(),
      clinicalHistory: clinical.clinicalHistory,
      findings: clinical.findings,
      diagnosis: clinical.diagnosis,
      testId: selectedTests.map((test) => test.id).join(","),
      testName: selectedTests.map((test) => test.name).join(", "),
      department: distinct(
        selectedTests.map((test) => test.department)
      ).join(", "),
      testResults,
      status: "draft",
      version: 1,
      createdAt: new Date().toISOString(),
    };
  }

  async function save(proceed: boolean) {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const draft = await addReport(buildReport());
      if (proceed && draft) {
        onOpenReport(draft.id);
        return;
      }
      await Swal.fire({
        icon: "success",
        title: "Draft saved",
        text: "The report is in your worklist.",
        timer: 1600,
        showConfirmButton: false,
      });
      resetWizard();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Could not save the report",
        text: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSaving(false);
    }
  }

  function resetWizard() {
    setStep(0);
    setFurthest(0);
    setPatientId("");
    setSelectedTestIds([]);
    setSpecimenType("");
    setResults({});
    setClinical({ clinicalHistory: "", findings: "", diagnosis: "" });
  }

  return (
    <div className="wizard-page">
      <div className="wizard-header">
        <div>
          <h1>New Report</h1>
          <p>Follow the steps to create a pathology report.</p>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => void save(false)}
          disabled={!canSave || saving}
          title={
            canSave
              ? "Save the current progress as a draft"
              : "Choose a patient, at least one test and a specimen first"
          }
        >
          <Save size={16} />
          Save as Draft
        </button>
      </div>

      <Stepper
        steps={STEPS}
        current={step}
        furthest={furthest}
        onJump={setStep}
      />

      <div className="wizard-body">
        {step === 0 && (
          <PatientStep
            selectedPatientId={patientId}
            onSelect={(id) => {
              setPatientId(id);
              setFurthest((current) => Math.max(current, 1));
            }}
          />
        )}

        {step === 1 && (
          <TestSpecimenStep
            selectedTestIds={selectedTestIds}
            specimenType={specimenType}
            onChangeTests={setSelectedTestIds}
            onChangeSpecimen={setSpecimenType}
          />
        )}

        {step === 2 && (
          <ResultsStep
            selectedTestIds={selectedTestIds}
            results={results}
            onChange={(key, value) =>
              setResults((previous) => ({ ...previous, [key]: value }))
            }
          />
        )}

        {step === 3 && (
          <ClinicalStep
            value={clinical}
            onChange={(patch) =>
              setClinical((previous) => ({ ...previous, ...patch }))
            }
          />
        )}

        {step === 4 && (
          <ReviewStep
            patientId={patientId}
            selectedTestIds={selectedTestIds}
            specimenType={specimenType}
            results={results}
            clinical={clinical}
          />
        )}
      </div>

      <div className="wizard-nav">
        <button
          type="button"
          className="secondary-button"
          onClick={back}
          disabled={step === 0 || saving}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className="primary-button"
            onClick={next}
            disabled={!stepValid[step] || saving}
          >
            Next
            <ArrowRight size={16} />
          </button>
        ) : (
          <div className="wizard-nav-final">
            <button
              type="button"
              className="secondary-button"
              onClick={() => void save(false)}
              disabled={!canSave || saving}
            >
              <Save size={16} />
              Save as Draft
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => void save(true)}
              disabled={!canSave || saving}
            >
              Save &amp; Proceed to Finalize
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
