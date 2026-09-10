import { Save, X } from "lucide-react";
import { sanitizeText } from "../../domain/textRules.mjs";

const g = (value: string) => sanitizeText(value, "general");

export interface TestDraft {
  name: string;
  department: string;
  specimen: string;
}

interface AddTestFormProps {
  value: TestDraft;
  departments: string[];
  onChange: (next: TestDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}

/** Controlled "add laboratory test" form card. State stays with the parent. */
export default function AddTestForm({
  value,
  departments,
  onChange,
  onCancel,
  onSave,
}: AddTestFormProps) {
  return (
    <div className="admin-form-card">
      <div className="admin-form-header">
        <h3>Add New Laboratory Test</h3>

        <button className="icon-button" onClick={onCancel}>
          <X size={18} />
        </button>
      </div>

      <div className="admin-form-grid">
        <div className="form-group">
          <label>Test Name</label>
          <input
            type="text"
            placeholder="e.g. Liver Function Test"
            value={value.name}
            onChange={(event) =>
              onChange({ ...value, name: g(event.target.value) })
            }
          />
        </div>

        <div className="form-group">
          <label>Department</label>
          <input
            type="text"
            list="department-options"
            placeholder="e.g. Biochemistry"
            value={value.department}
            onChange={(event) =>
              onChange({ ...value, department: g(event.target.value) })
            }
          />

          <datalist id="department-options">
            {departments.map((department) => (
              <option key={department} value={department} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label>Specimen</label>
          <input
            type="text"
            placeholder="e.g. Serum"
            value={value.specimen}
            onChange={(event) =>
              onChange({ ...value, specimen: g(event.target.value) })
            }
          />
        </div>
      </div>

      <div className="report-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>

        <button type="button" className="primary-button" onClick={onSave}>
          <Save size={18} />
          Save Test
        </button>
      </div>
    </div>
  );
}
