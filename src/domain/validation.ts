import type {
  ReportContent,
  ValidationError,
  ValidationResult,
} from "./types";

// ================================
// PATHFORGE CLINICAL VALIDATION
// ================================

export function validateReport(
  content: ReportContent
): ValidationResult {
  const errors: ValidationError[] = [];

  // ----------------
  // SPECIMEN CHECK
  // ----------------

  if (content.specimens.length === 0) {
    errors.push({
      field: "specimens",
      code: "SPECIMEN_REQUIRED",
      message: "At least one specimen is required.",
    });
  }

  content.specimens.forEach((specimen, index) => {
    if (!specimen.type.trim()) {
      errors.push({
        field: `specimens.${index}.type`,
        code: "SPECIMEN_TYPE_REQUIRED",
        message: `Specimen ${index + 1} must have a type.`,
      });
    }
  });

  // ----------------
  // CLINICAL HISTORY
  // ----------------

  if (
    content.clinicalHistory &&
    content.clinicalHistory.text.length > 5000
  ) {
    errors.push({
      field: "clinicalHistory",
      code: "CLINICAL_HISTORY_TOO_LONG",
      message: "Clinical history cannot exceed 5000 characters.",
    });
  }

  // ----------------
  // FINDINGS CHECK
  // ----------------

  if (!content.findings.trim()) {
    errors.push({
      field: "findings",
      code: "FINDINGS_REQUIRED",
      message: "Microscopic findings are required.",
    });
  }

  // ----------------
  // DIAGNOSIS CHECK
  // ----------------

  if (!content.diagnosis.trim()) {
    errors.push({
      field: "diagnosis",
      code: "DIAGNOSIS_REQUIRED",
      message: "Diagnosis is required.",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}