interface ClinicalDetails {
  clinicalHistory: string;
  findings: string;
  diagnosis: string;
}

interface ClinicalStepProps {
  value: ClinicalDetails;
  onChange: (next: Partial<ClinicalDetails>) => void;
}

export default function ClinicalStep({ value, onChange }: ClinicalStepProps) {
  return (
    <div className="wizard-panel">
      <h2>Clinical details</h2>
      <p className="wizard-panel-hint">
        Narrative sections of the report. All optional for a draft; findings and
        diagnosis are required before a report can be finalized.
      </p>

      <div className="wizard-field">
        <label htmlFor="cd-history">Clinical History</label>
        <textarea
          id="cd-history"
          rows={3}
          value={value.clinicalHistory}
          onChange={(event) =>
            onChange({ clinicalHistory: event.target.value })
          }
          placeholder="Relevant history provided with the request…"
        />
      </div>

      <div className="wizard-field">
        <label htmlFor="cd-findings">Findings / Microscopic Findings</label>
        <textarea
          id="cd-findings"
          rows={5}
          value={value.findings}
          onChange={(event) => onChange({ findings: event.target.value })}
          placeholder="Gross and microscopic findings…"
        />
      </div>

      <div className="wizard-field">
        <label htmlFor="cd-diagnosis">Diagnosis</label>
        <textarea
          id="cd-diagnosis"
          rows={3}
          value={value.diagnosis}
          onChange={(event) => onChange({ diagnosis: event.target.value })}
          placeholder="Final impression / diagnosis…"
        />
      </div>
    </div>
  );
}

export type { ClinicalDetails };
