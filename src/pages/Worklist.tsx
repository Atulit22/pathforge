import { useState } from "react";
import {
  Search,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useReports } from "../store/ReportContext";
import { usePatients } from "../store/PatientContext";

interface WorklistProps {
  onSelectReport: (reportId: string) => void;
}

export default function Worklist({
  onSelectReport,
}: WorklistProps) {
  const { reports } = useReports();
  const { patients } = usePatients();
  const [search, setSearch] = useState("");

  const filteredReports = reports.filter((report) => {
    const patient = patients.find(
      (patient) => patient.id === report.patientId
    );

    const patientName = patient?.name ?? "";
    const patientCode = patient?.patientId ?? "";

    return `${patientName} ${patientCode} ${report.specimenType}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  function getPatientName(patientId: string) {
    const patient = patients.find(
      (patient) => patient.id === patientId
    );

    return patient?.name ?? "Unknown Patient";
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  return (
    <div className="worklist-page">
      <div className="page-toolbar">
        <div className="patients-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="worklist-card">
        <div className="worklist-card-header">
          <div>
            <h3>Active Reports</h3>
            <p>{filteredReports.length} reports in your worklist</p>
          </div>
        </div>

        <div className="worklist-table">
          <div className="worklist-table-header">
            <span>Patient</span>
            <span>Specimen</span>
            <span>Status</span>
            <span>Created</span>
            <span></span>
          </div>

          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <button
                type="button"
                className="worklist-row"
                key={report.id}
                onClick={() => onSelectReport(report.id)}
              >
                <div className="report-patient">
                  <div className="report-avatar">
                    <FileText size={17} />
                  </div>

                  <strong>{getPatientName(report.patientId)}</strong>
                </div>

                <span>{report.specimenType}</span>

                <span>
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
                </span>

                <span>{formatDate(report.createdAt)}</span>

                <ChevronRight
                  size={19}
                  className="worklist-arrow"
                />
              </button>
            ))
          ) : (
            <div className="worklist-empty">
              <FileText size={42} />
              <h3>No reports yet</h3>
              <p>
                Create a new pathology report and save it as a draft.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}