import {
  History,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useReports } from "../store/ReportContext";
import { usePatients } from "../store/PatientContext";

interface VersionHistoryProps {
  onSelectReport: (reportId: string) => void;
}

export default function VersionHistory({
  onSelectReport,
}: VersionHistoryProps) {
  const { reports } = useReports();
  const { patients } = usePatients();

  function getPatientName(patientId: string) {
    const patient = patients.find(
      (patient) => patient.id === patientId
    );

    return patient?.name ?? "Unknown Patient";
  }

  function formatDate(date?: string) {
    if (!date) return "—";

    return new Date(date).toLocaleString();
  }

  const versionedReports = [...reports].sort((a, b) => {
    return (
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
    );
  });

  return (
    <div className="version-history-page">
      <div className="version-history-header">
        <div>
          <h2>Version History</h2>
          <p>
            Track report versions, amendments, and finalized records.
          </p>
        </div>
      </div>

      <div className="version-history-card">
        <div className="version-history-card-header">
          <div>
            <h3>Report Versions</h3>
            <p>
              {versionedReports.length} version
              {versionedReports.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
        </div>

        {versionedReports.length > 0 ? (
          <div className="version-list">
            {versionedReports.map((report) => (
              <div
                className="version-item"
                key={report.id}
              >
                <div className="version-icon">
                  <History size={19} />
                </div>

                <div className="version-main">
                  <div className="version-title-row">
                    <div>
                      <h3>
                        {getPatientName(report.patientId)}
                      </h3>

                      <p>
                        {report.specimenType || "No specimen type"}
                      </p>
                    </div>

                    <div className="version-badges">
                      <span className="version-number">
                        Version {report.version}
                      </span>

                      {report.status === "draft" ? (
                        <span className="status-badge draft">
                          <Clock size={14} />
                          Draft
                        </span>
                      ) : (
                        <span className="status-badge finalized">
                          <CheckCircle2 size={14} />
                          Finalized
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="version-meta">
                    <span>
                      <FileText size={14} />
                      Created {formatDate(report.createdAt)}
                    </span>

                    {report.supersedesReportId && (
                      <span className="amendment-label">
                        Amendment of previous version
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="version-open-button"
                  onClick={() => onSelectReport(report.id)}
                  title="Open report"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="version-history-empty">
            <History size={42} />
            <h3>No version history yet</h3>
            <p>
              Report versions and amendments will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}