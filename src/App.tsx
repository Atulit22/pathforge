import { useState } from "react";
import Sidebar, { type Page } from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import NewReport from "./pages/NewReport";
import Worklist from "./pages/Worklist";
import ReportEditor from "./pages/ReportEditor";
import VersionHistory from "./pages/VersionHistory";

const pageDetails: Record<Page, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Overview of your pathology workspace",
  },
  patients: {
    title: "Patients",
    subtitle: "Manage patient records",
  },
  worklist: {
    title: "Report Worklist",
    subtitle: "View and manage active reports",
  },
  "new-report": {
    title: "New Report",
    subtitle: "Create a new pathology report",
  },
  history: {
    title: "Version History",
    subtitle: "Review report versions and amendments",
  },
  settings: {
    title: "Settings",
    subtitle: "Configure your PathForge workspace",
  },
};

function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");

  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    null
  );

  const currentPage = pageDetails[activePage];

  function openReport(reportId: string) {
    setSelectedReportId(reportId);
    setActivePage("worklist");
  }

  function goBackToWorklist() {
    setSelectedReportId(null);
    setActivePage("worklist");
  }

  function handleNavigation(page: Page) {
    setActivePage(page);
    setSelectedReportId(null);
  }

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigation}
      />

      <main className="main-content">
        <Header
          title={currentPage.title}
          subtitle={currentPage.subtitle}
        />

        <section className="page-content">
          {activePage === "dashboard" && (
            <Dashboard onNavigate={handleNavigation} />
          )}

          {activePage === "patients" && <Patients />}

          {activePage === "new-report" && <NewReport />}

          {activePage === "worklist" &&
            (selectedReportId ? (
              <ReportEditor
                reportId={selectedReportId}
                onBack={goBackToWorklist}
                onOpenReport={openReport}
              />
            ) : (
              <Worklist onSelectReport={openReport} />
            ))}

          {activePage === "history" && (
            <VersionHistory
              onSelectReport={openReport}
            />
          )}

          {activePage === "settings" && (
            <div className="placeholder-card">
              <h3>Settings</h3>
              <p>
                Settings and workspace configuration will be available here.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;