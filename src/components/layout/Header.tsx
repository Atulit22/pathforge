import {
  Bell,
  Search,
  Shield,
  UserRound,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../store/AuthContext";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({
  title,
  subtitle,
}: HeaderProps) {
  const {
    role,
    isAdmin,
    logout,
  } = useAuth();

  return (
    <header className="header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search patients or reports..."
          />
        </div>

        <div className="role-switcher">
          {isAdmin ? (
            <Shield size={18} />
          ) : (
            <UserRound size={18} />
          )}

          <span className="role-display">
            {role === "admin"
              ? "Administrator"
              : "Employee"}
          </span>
        </div>

        <button
          className="icon-button"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>

        <div className="user-avatar">
          {isAdmin ? "AD" : "EM"}
        </div>

        <button
          className="logout-button"
          type="button"
          onClick={logout}
          title="Logout"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}