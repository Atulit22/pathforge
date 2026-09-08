import { FlaskConical } from "lucide-react";

import type { TestResult } from "../../store/ReportContext";
import { formatReferenceRange } from "./referenceRange";
import { groupResultsByTest } from "./groupResults";

interface ResultsTableProps {
  results: TestResult[];
  disabled: boolean;
  onResultChange: (testId: string, parameterId: string, value: string) => void;
}

/** Editable laboratory-results grid, one sub-table per test in the report. */
export default function ResultsTable({
  results,
  disabled,
  onResultChange,
}: ResultsTableProps) {
  if (results.length === 0) return null;

  const groups = groupResultsByTest(results);

  return (
    <div className="editor-section test-results-section">
      <div className="editor-section-title">
        <FlaskConical size={19} />

        <div>
          <h3>Laboratory Results</h3>
          <p>
            {groups.length === 1
              ? groups[0].testName || "Selected laboratory test"
              : `${groups.length} tests`}
          </p>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.key} className="results-test-group">
          {groups.length > 1 && group.testName && (
            <h4 className="results-test-heading">{group.testName}</h4>
          )}

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
                {group.results.map((result) => (
                  <tr key={`${result.testId}::${result.parameterId}`}>
                    <td className="parameter-cell">{result.parameterName}</td>
                    <td className="result-cell">
                      <input
                        aria-label={`${result.parameterName} result`}
                        type="text"
                        value={result.value}
                        onChange={(event) =>
                          onResultChange(
                            result.testId,
                            result.parameterId,
                            event.target.value
                          )
                        }
                        disabled={disabled}
                      />
                    </td>
                    <td className="unit-cell">{result.unit || "—"}</td>
                    <td className="reference-cell">
                      {formatReferenceRange(result.referenceRange)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
