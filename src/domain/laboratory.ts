// ========================================
// PATHFORGE LABORATORY DOMAIN TYPES
// ========================================

// ----------------------------------------
// USER ROLES
// ----------------------------------------

export type UserRole = "admin" | "employee";

// ----------------------------------------
// RESULT TYPES
// ----------------------------------------

export type ResultType =
  | "number"
  | "text"
  | "positive_negative"
  | "custom";

// ----------------------------------------
// REFERENCE RANGE
// ----------------------------------------

export interface ReferenceRange {
  min?: number;
  max?: number;
  text?: string;
}

// ----------------------------------------
// TEST PARAMETER
// ----------------------------------------

export interface TestParameter {
  id: string;
  name: string;

  resultType: ResultType;

  unit?: string;

  referenceRange?: ReferenceRange;

  symbol?: "<" | ">" | "<=" | ">=" | "=";

  required: boolean;
}

// ----------------------------------------
// LABORATORY TEST
// ----------------------------------------

export interface LabTest {
  id: string;

  name: string;

  department: string;

  specimen?: string;

  parameters: TestParameter[];

  createdAt: string;

  updatedAt?: string;
}

// ----------------------------------------
// PATIENT PARAMETER RESULT
// ----------------------------------------

export interface ParameterResult {
  parameterId: string;

  value: string;

  enteredAt: string;

  enteredBy?: string;
}

// ----------------------------------------
// PATIENT TEST RESULT
// ----------------------------------------

export interface PatientTestResult {
  id: string;

  patientId: string;

  testId: string;

  results: ParameterResult[];

  status: "draft" | "completed" | "verified";

  createdAt: string;

  updatedAt?: string;
}

// ----------------------------------------
// USER
// ----------------------------------------

export interface User {
  id: string;

  name: string;

  role: UserRole;
}