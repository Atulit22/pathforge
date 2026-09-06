import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <Search size={18} />
          <input placeholder="Search patients or reports..." />
        </div>

        <button className="icon-button">
          <Bell size={20} />
        </button>

        <div className="user-avatar">DR</div>
      </div>
    </header>
  );
}