import { NavLink } from 'react-router-dom';
import { Calendar, Clock, Link as LinkIcon, Settings } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Event Types', path: '/event-types', icon: LinkIcon },
    { name: 'Bookings', path: '/bookings', icon: Calendar },
    { name: 'Availability', path: '/availability', icon: Clock },
    { name: 'Integrations', path: '/integrations', icon: Settings },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Calendar size={24} style={{ color: 'var(--brand-accent)' }} />
        <span>Scdeuler</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
