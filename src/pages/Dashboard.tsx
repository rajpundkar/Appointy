import { Plus } from 'lucide-react';
import EventCard from '../components/EventCard';

export default function Dashboard() {
  const events = [
    { title: '15 Min Meeting', duration: 15, slug: '15min', active: true },
    { title: '30 Min Meeting', duration: 30, slug: '30min', active: true },
    { title: 'Secret Project Sync', duration: 60, slug: 'secret-sync', active: false },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Types</h1>
          <p className="page-subtitle">Create events to share for people to book on your calendar.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          New Event Type
        </button>
      </div>

      <div className="event-grid">
        {events.map((event) => (
          <EventCard key={event.slug} {...event} />
        ))}
      </div>
    </div>
  );
}
