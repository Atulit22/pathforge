import { Save } from "lucide-react";
import { sanitizeText } from "../../domain/textRules.mjs";

const g = (value: string) => sanitizeText(value, "general");

export interface ParameterDraft {
  name: string;
  type: "number" | "text";
  unit: string;
  min: string;
  max: string;
  referenceText: string;
}

interface AddParameterFormProps {
  value: ParameterDraft;
  onChange: (next: ParameterDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}

/** Controlled "add parameter" form shown under an expanded test. */
export default function AddParameterForm({
  value,
  onChange,
  onCancel,
  onSave,
}: AddParameterFormProps) {
  return (
    <div className="parameter-form">
      <h4>New Parameter</h4>

      <div className="parameter-form-grid">
        <div className="form-group">
          <label>Parameter Name</label>
          <input
            placeholder="e.g. ALT"
            value={value.name}
            onChange={(event) =>
              onChange({ ...value, name: g(event.target.value) })
            }
          />
        </div>

        <div className="form-group">
          <label>Result Type</label>
          <select
            value={value.type}
            onChange={(event) =>
              onChange({
                ...value,
                type: event.target.value as "number" | "text",
              })
            }
          >
            <option value="number">Number</option>
            <option value="text">Text</option>
          </select>
        </div>

        <div className="form-group">
          <label>Unit</label>
          <input
            placeholder="e.g. U/L"
            value={value.unit}
            onChange={(event) =>
              onChange({ ...value, unit: g(event.target.value) })
            }
          />
        </div>

        <div className="form-group">
          <label>Minimum Reference</label>
          <input
            type="number"
            value={value.min}
            onChange={(event) =>
              onChange({ ...value, min: event.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Maximum Reference</label>
          <input
            type="number"
            value={value.max}
            onChange={(event) =>
              onChange({ ...value, max: event.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Text Reference</label>
          <input
            placeholder="e.g. Negative"
            value={value.referenceText}
            onChange={(event) =>
              onChange({ ...value, referenceText: g(event.target.value) })
            }
          />
        </div>
      </div>

      <div className="report-actions">
        <button className="secondary-button" onClick={onCancel}>
          Cancel
        </button>

        <button className="primary-button" onClick={onSave}>
          <Save size={16} />
          Add Parameter
        </button>
      </div>
    </div>
  );
}
