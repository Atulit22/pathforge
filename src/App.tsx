import { useState } from "react";

import Sidebar, {
  type Page,
} from "./components/layout/Sidebar";

import Header from "./components/layout/Header";

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
  // ========================================
  // AUTHENTICATION
  // ========================================

  const { isLoggedIn } = useAuth();

  // ========================================
  // APP NAVIGATION STATE
  // ========================================

  const [activePage, setActivePage] =
    useState<Page>("dashboard");

  const [selectedReportId, setSelectedReportId] =
    useState<string | null>(null);

  // ========================================
  // LOGIN SCREEN
  // ========================================

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  // ========================================
  // NAVIGATION
  // ========================================

  function handleNavigate(page: Page) {
    setSelectedReportId(null);
    setActivePage(page);
  }

  // ========================================
  // REPORT SELECTION
  // ========================================

  function handleSelectReport(reportId: string) {
    setSelectedReportId(reportId);
  }

  // ========================================
  // PAGE INFORMATION
  // ========================================

  function getPageInfo() {
    switch (activePage) {
      case "dashboard":
        return {
          title: "Dashboard",
          subtitle:
            "Overview of your pathology workspace",
        };

      case "patients":
        return {
          title: "Patients",
          subtitle:
            "Manage patient records",
        };

      case "worklist":
        return {
          title: "Report Worklist",
          subtitle:
            "View and manage active reports",
        };

      case "new-report":
        return {
          title: "New Report",
          subtitle:
            "Create a new pathology report",
        };

      case "history":
        return {
          title: "Version History",
          subtitle:
            "Track report versions and amendments",
        };

      case "test-management":
        return {
          title: "Test Management",
          subtitle:
            "Manage laboratory tests and parameters",
        };

      default:
        return {
          title: "PathForge",
          subtitle:
            "Clinical Pathology Workspace",
        };
    }
  }

  // ========================================
  // PAGE RENDERING
  // ========================================

  function renderPage() {
    // Open Report Editor when a report is selected
    if (selectedReportId) {
      return (
        <ReportEditor
          reportId={selectedReportId}
          onBack={() => {
            setSelectedReportId(null);
            setActivePage("worklist");
          }}
          onOpenReport={(reportId) => {
            setSelectedReportId(reportId);
          }}
        />
      );
    }

    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            onNavigate={handleNavigate}
          />
        );

      case "patients":
        return <Patients />;

      case "worklist":
        return (
          <Worklist
            onSelectReport={handleSelectReport}
          />
        );

      case "new-report":
        return <NewReport />;

      case "history":
        return (
          <VersionHistory
            onSelectReport={handleSelectReport}
          />
        );

      case "test-management":
        return <TestManagement />;

      default:
        return (
          <Dashboard
            onNavigate={handleNavigate}
          />
        );
    }
  }

  // ========================================
  // CURRENT PAGE
  // ========================================

  const pageInfo = getPageInfo();

  // ========================================
  // MAIN APPLICATION
  // ========================================

  return (
    <div className="app-shell">

      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      <main className="main-content">

        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
        />

        <div className="page-content">
          {renderPage()}
        </div>

      </main>

    </div>
  );
}

export default App;
