import type { ReportContent } from "./types";

export interface ResolvedPayloadEntry {
  field_id: string;
  display: string;
  source_catalog_version: string;
  value: unknown;
}

export type ResolvedPayload = Record<string, ResolvedPayloadEntry>;

const DEFAULT_CATALOG_VERSION = "prototype-v1";

/**
 * Converts the React/UI report content into the stable domain payload
 * consumed by the PathForge domain service.
 *
 * This function preserves the entered clinical values as resolved snapshots.
 */
export function toResolvedPayload(
  content: ReportContent,
  catalogVersion = DEFAULT_CATALOG_VERSION
): ResolvedPayload {
  const payload: ResolvedPayload = {
    specimens: {
      field_id: "specimens",
      display: "Specimens",
      source_catalog_version: catalogVersion,
      value: content.specimens.map((specimen) => ({
        id: specimen.id,
        type: specimen.type,
        ...(specimen.site ? { site: specimen.site } : {}),
        ...(specimen.description
          ? { description: specimen.description }
          : {}),
      })),
    },

    findings: {
      field_id: "findings",
      display: "Microscopic Findings",
      source_catalog_version: catalogVersion,
      value: content.findings,
    },

    diagnosis: {
      field_id: "diagnosis",
      display: "Diagnosis",
      source_catalog_version: catalogVersion,
      value: content.diagnosis,
    },
  };

  if (content.clinicalHistory?.text) {
    payload.clinical_history = {
      field_id: "clinical_history",
      display: "Clinical History",
      source_catalog_version: catalogVersion,
      value: content.clinicalHistory.text,
    };
  }

  if (content.comments) {
    payload.comments = {
      field_id: "comments",
      display: "Comments",
      source_catalog_version: catalogVersion,
      value: content.comments,
    };
  }

  return payload;
}