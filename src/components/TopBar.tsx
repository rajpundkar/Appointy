import { Bell, HelpCircle } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="user-menu">
        <button className="btn-icon">
          <HelpCircle size={20} />
        </button>
        <button className="btn-icon">
          <Bell size={20} />
        </button>
        <div className="user-avatar">A</div>
        <span>Alex Dev</span>
      </div>
    </header>
  );
}
