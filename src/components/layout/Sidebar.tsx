import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FilePlus2,
  History,
  Stethoscope,
  FlaskConical,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../store/AuthContext";

export type Page =
  | "dashboard"
  | "patients"
  | "worklist"
  | "new-report"
  | "history"
  | "test-management";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navigation = [
  {
    id: "dashboard" as Page,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "patients" as Page,
    label: "Patients",
    icon: Users,
  },
  {
    id: "worklist" as Page,
    label: "Report Worklist",
    icon: ClipboardList,
  },
  {
    id: "new-report" as Page,
    label: "New Report",
    icon: FilePlus2,
  },
  {
    id: "history" as Page,
    label: "Version History",
    icon: History,
  },
];

export default function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
  const { isAdmin, logout, user } = useAuth();

  return (
    <aside className="sidebar">
      {/* BRAND */}
      <div className="brand">
        <div className="brand-icon">
          <Stethoscope size={22} />
        </div>

        <div>
          <h1>PathForge</h1>
          <span>Clinical Pathology</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="navigation">
        <p className="nav-label">WORKSPACE</p>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* ADMIN ONLY */}
        {isAdmin && (
          <>
            <div className="nav-divider" />

            <p className="nav-label">CATALOG</p>

            <button
              type="button"
              className={`nav-item ${
                activePage === "test-management"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onNavigate("test-management")
              }
            >
              <FlaskConical size={19} />
              <span>Test Management</span>
            </button>

            <div className="nav-divider" />
          </>
        )}
      </nav>

      {/* FOOTER */}
      <div className="sidebar-bottom">
        <div className="sidebar-footer">
          <div className="status-dot" />

          <div>
            <strong>
              {user?.email || "Signed in"}
            </strong>

            <span>
              {isAdmin
                ? "Administrator"
                : "Clinical Workspace"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={logout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}