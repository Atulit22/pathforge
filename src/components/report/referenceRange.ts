export interface ReferenceRangeLike {
  min?: number;
  max?: number;
  text?: string;
}

/**
 * Human-readable reference range for a lab result, shared by the report editor
 * table and the printable report. Returns an em dash when nothing is set.
 */
export function formatReferenceRange(
  referenceRange: ReferenceRangeLike | undefined
): string {
  if (!referenceRange) return "—";
  if (referenceRange.text) return referenceRange.text;

  const values = [referenceRange.min, referenceRange.max].filter(
    (value): value is number => value !== undefined
  );

  return values.length > 0 ? values.join(" – ") : "—";
}
