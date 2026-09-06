import {
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { usePatients } from "../store/PatientContext";
import { useReports } from "../store/ReportContext";
import type { Page } from "../components/layout/Sidebar";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({
  onNavigate,
}: DashboardProps) {
  const { patients } = usePatients();
  const { reports } = useReports();

  const draftReports = reports.filter(
    (report) => report.status === "draft"
  );

  const finalizedReports = reports.filter(
    (report) => report.status === "finalized"
  );

  const recentReports = [...reports]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  function getPatientName(patientId: string) {
    const patient = patients.find(
      (patient) => patient.id === patientId
    );

    return patient?.name ?? "Unknown Patient";
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <h2>Welcome back</h2>
          <p>Here's what's happening in your pathology workspace.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => onNavigate("new-report")}
        >
          <Plus size={18} />
          Create Report
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={22} />
          </div>

          <div>
            <p>Total Patients</p>
            <h2>{patients.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={22} />
          </div>

          <div>
            <p>Draft Reports</p>
            <h2>{draftReports.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <p>Finalized</p>
            <h2>{finalizedReports.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <AlertCircle size={22} />
          </div>

          <div>
            <p>Needs Attention</p>
            <h2>{draftReports.length}</h2>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card recent-reports-card">
          <div className="dashboard-card-header">
            <div>
              <h3>Recent Reports</h3>
              <p>Your latest pathology reports</p>
            </div>

            <button
              className="view-all-button"
              onClick={() => onNavigate("worklist")}
            >
              View all
              <ArrowRight size={16} />
            </button>
          </div>

          {recentReports.length > 0 ? (
            <div className="recent-report-list">
              {recentReports.map((report) => (
                <div
                  className="recent-report-item"
                  key={report.id}
                >
                  <div className="recent-report-icon">
                    <FileText size={18} />
                  </div>

                  <div className="recent-report-info">
                    <strong>
                      {getPatientName(report.patientId)}
                    </strong>

                    <span>{report.specimenType}</span>
                  </div>

                  <span
                    className={`dashboard-status ${report.status}`}
                  >
                    {report.status === "draft"
                      ? "Draft"
                      : "Finalized"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <FileText size={36} />
              <p>No reports created yet.</p>

              <button
                className="secondary-button"
                onClick={() => onNavigate("new-report")}
              >
                Create your first report
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-card quick-actions-card">
          <div className="dashboard-card-header">
            <div>
              <h3>Quick Actions</h3>
              <p>Common workspace actions</p>
            </div>
          </div>

          <div className="quick-actions">
            <button
              className="quick-action"
              onClick={() => onNavigate("new-report")}
            >
              <Plus size={19} />

              <div>
                <strong>Create Report</strong>
                <span>Start a new pathology report</span>
              </div>
            </button>

            <button
              className="quick-action"
              onClick={() => onNavigate("patients")}
            >
              <Users size={19} />

              <div>
                <strong>Manage Patients</strong>
                <span>View and add patient records</span>
              </div>
            </button>

            <button
              className="quick-action"
              onClick={() => onNavigate("worklist")}
            >
              <FileText size={19} />

              <div>
                <strong>Open Worklist</strong>
                <span>Continue working on reports</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}