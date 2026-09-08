import {
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
        <div className="role-switcher">
          {isAdmin ? (
            <Shield size={18} />
          ) : (
            <UserRound size={18} />
          )}

          <span className="role-display">
            {isAdmin ? "Administrator" : "Employee"}
          </span>
        </div>

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
