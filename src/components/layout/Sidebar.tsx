import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FilePlus2,
  History,
  Settings,
  Stethoscope,
} from "lucide-react";

export type Page =
  | "dashboard"
  | "patients"
  | "worklist"
  | "new-report"
  | "history"
  | "settings";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navigation = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "patients" as Page, label: "Patients", icon: Users },
  { id: "worklist" as Page, label: "Report Worklist", icon: ClipboardList },
  { id: "new-report" as Page, label: "New Report", icon: FilePlus2 },
  { id: "history" as Page, label: "Version History", icon: History },
];

export default function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Stethoscope size={22} />
        </div>

        <div>
          <h1>PathForge</h1>
          <span>Clinical Pathology</span>
        </div>
      </div>

      <nav className="navigation">
        <p className="nav-label">WORKSPACE</p>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
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

        <div className="nav-divider" />

        <button
          className={`nav-item ${
            activePage === "settings" ? "active" : ""
          }`}
          onClick={() => onNavigate("settings")}
        >
          <Settings size={19} />
          <span>Settings</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="status-dot" />
        <div>
          <strong>Local Workspace</strong>
          <span>Ready to work</span>
        </div>
      </div>
    </aside>
  );
}