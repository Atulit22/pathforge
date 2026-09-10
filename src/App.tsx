import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import TopNav, { type Page } from "./components/layout/TopNav";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Worklist from "./pages/Worklist";
import NewReport from "./pages/NewReport";
import VersionHistory from "./pages/VersionHistory";
import TestManagement from "./pages/TestManagement";
import ReportEditor from "./pages/ReportEditor";
import LoginPage from "./pages/LoginPage";

import { useAuth } from "./store/AuthContext";

function App() {
  const { isLoggedIn, isAdmin } = useAuth();

  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  function handleNavigate(page: Page) {
    setSelectedReportId(null);
    setActivePage(page);
  }

  function handleSelectReport(reportId: string) {
    setSelectedReportId(reportId);
  }

  function renderPage() {
    // A selected report takes over the workspace with its own editor chrome.
    if (selectedReportId) {
      return (
        <ReportEditor
          reportId={selectedReportId}
          onBack={() => {
            setSelectedReportId(null);
            setActivePage("worklist");
          }}
          onOpenReport={(reportId) => setSelectedReportId(reportId)}
        />
      );
    }

    switch (activePage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "patients":
        return <Patients />;
      case "worklist":
        return <Worklist onSelectReport={handleSelectReport} />;
      case "new-report":
        return <NewReport onOpenReport={handleSelectReport} />;
      case "history":
        return <VersionHistory onSelectReport={handleSelectReport} />;
      case "test-management":
        // Admin-only page — an employee reaching this route falls back to the
        // dashboard rather than seeing Test Management.
        return isAdmin ? (
          <TestManagement />
        ) : (
          <Dashboard onNavigate={handleNavigate} />
        );
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  }

  // Every screen except the dashboard and the report editor (which has its own
  // "Back to Worklist") gets an explicit way back to the dashboard, since the
  // header no longer carries page navigation.
  const showBackToDashboard =
    !selectedReportId && activePage !== "dashboard";

  return (
    <div className="app-shell">
      <TopNav onNavigate={handleNavigate} />

      <main className="main-content">
        <div className="page-content">
          {showBackToDashboard && (
            <button
              type="button"
              className="back-to-dashboard"
              onClick={() => handleNavigate("dashboard")}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          )}
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
