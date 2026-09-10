import { useMemo, useState } from "react";

import {
  usePatients,
  type NewPatientInput,
} from "../../store/PatientContext";
import { sanitizePhone, sanitizeText } from "../../domain/textRules.mjs";

interface PatientFormProps {
  onSaved: (patientId: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
  busy?: boolean;
}

const SEX_OPTIONS = ["Female", "Male", "Other"] as const;

/**
 * Register-a-patient form. Used by the Patients page and by the New Report
 * wizard's "create new patient" step, so both paths generate the Patient ID and
 * persist the record through exactly the same code.
 */
export default function PatientForm({
  onSaved,
  onCancel,
  submitLabel = "Save Patient",
  busy = false,
}: PatientFormProps) {
  const { addPatient, previewPatientId } = usePatients();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Shown for information only. The real ID is generated at save time so it can
  // never drift or be edited (spec §6).
  const idPreview = useMemo(() => previewPatientId(), [previewPatientId]);

  const disabled = busy || saving;

  // Filter as the user types — invalid characters never enter the field, and a
  // paste is stripped rather than accepted.
  function update<K extends keyof typeof form>(key: K, value: string) {
    const clean =
      key === "phone"
        ? sanitizePhone(value)
        : key === "name" || key === "address"
          ? sanitizeText(value, "general")
          : value;
    setForm((previous) => ({ ...previous, [key]: clean }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    const name = sanitizeText(form.name, "general").trim();
    const phone = sanitizePhone(form.phone).trim();
    const age = Number(form.age);

    if (!name) return setError("Patient name is required.");
    if (!form.age || Number.isNaN(age) || age < 0 || age > 150) {
      return setError("Enter a valid age.");
    }
    if (!form.gender) return setError("Select the patient's sex.");
    if (!phone) return setError("Phone number is required.");

    const input: NewPatientInput = {
      name,
      age,
      gender: form.gender,
      phone,
      address: sanitizeText(form.address, "general").trim() || undefined,
    };

    setSaving(true);
    setError("");
    try {
      const patient = await addPatient(input);
      onSaved(patient.id);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Could not save the patient: ${saveError.message}`
          : "Could not save the patient."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="patient-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="pf-name">Name *</label>
          <input
            id="pf-name"
            type="text"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Full name"
            disabled={disabled}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="pf-age">Age *</label>
          <input
            id="pf-age"
            type="number"
            min="0"
            max="150"
            value={form.age}
            onChange={(event) => update("age", event.target.value)}
            placeholder="Years"
            disabled={disabled}
          />
        </div>

        <div className="form-group">
          <label htmlFor="pf-sex">Sex *</label>
          <select
            id="pf-sex"
            value={form.gender}
            onChange={(event) => update("gender", event.target.value)}
            disabled={disabled}
          >
            <option value="">Select</option>
            {SEX_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <label htmlFor="pf-phone">Phone Number *</label>
          <input
            id="pf-phone"
            type="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="e.g. +91 98765 43210"
            disabled={disabled}
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="pf-address">Address</label>
          <textarea
            id="pf-address"
            rows={2}
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
            placeholder="Optional"
            disabled={disabled}
          />
        </div>

        <div className="form-group full-width">
          <label>Patient ID</label>
          <div className="patient-id-preview">
            <strong>{idPreview}</strong>
            <span>Automatically generated</span>
          </div>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="modal-actions">
        {onCancel ? (
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={disabled}
          >
            Cancel
          </button>
        ) : null}
        <button type="submit" className="primary-button" disabled={disabled}>
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
