import { Clock, Copy, MoreHorizontal } from 'lucide-react';

interface EventCardProps {
  title: string;
  duration: number;
  slug: string;
  active: boolean;
}

export default function EventCard({ title, duration, slug, active }: EventCardProps) {
  return (
    <div className="event-card">
      <div className="event-card-header">
        <h3 className="event-title">{title}</h3>
        <label className="switch">
          <input type="checkbox" defaultChecked={active} />
          <span className="slider round"></span>
        </label>
      </div>
      <div className="event-url">
        scdeuler.com/alexdev/<span>{slug}</span>
      </div>
      <div className="event-meta">
        <div className="meta-item">
          <Clock size={16} />
          <span>{duration}m</span>
        </div>
        <div style={{ flex: 1 }}></div>
        <button className="btn-icon" title="Copy link">
          <Copy size={16} />
        </button>
        <button className="btn-icon" title="More options">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
