import {
  LayoutDashboard,
  ClipboardList,
  FilePlus2,
  Users,
  History,
  FlaskConical,
  Stethoscope,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../store/AuthContext";

/**
 * Every destination the app can navigate to. Kept here (not in a page) so the
 * router in App.tsx and any page that needs to navigate share one source.
 */
export type Page =
  | "dashboard"
  | "patients"
  | "worklist"
  | "new-report"
  | "history"
  | "test-management";

interface TopNavProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

type NavItem = {
  id: Page;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "worklist", label: "Worklist", icon: ClipboardList },
  { id: "new-report", label: "New Report", icon: FilePlus2 },
  { id: "patients", label: "Patients", icon: Users },
  { id: "history", label: "Version History", icon: History },
  {
    id: "test-management",
    label: "Test Management",
    icon: FlaskConical,
    adminOnly: true,
  },
];

export default function TopNav({ activePage, onNavigate }: TopNavProps) {
  const { isAdmin, user, logout } = useAuth();

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <header className="top-nav">
      <button
        type="button"
        className="top-nav-brand"
        onClick={() => onNavigate("dashboard")}
        title="PathForge — go to dashboard"
      >
        <span className="top-nav-brand-icon">
          <Stethoscope size={20} />
        </span>
        <span className="top-nav-brand-text">
          <strong>PathForge</strong>
          <span>Clinical Pathology</span>
        </span>
      </button>

      <nav className="top-nav-links" aria-label="Primary">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`top-nav-link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="top-nav-user">
        <span className="top-nav-identity">
          <span className="top-nav-email">
            {user?.email ?? "Signed in"}
          </span>
          <span className="top-nav-role">
            {isAdmin ? "Administrator" : "Clinical staff"}
          </span>
        </span>

        <button
          type="button"
          className="top-nav-logout"
          onClick={() => {
            void logout();
          }}
          title="Log out"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
