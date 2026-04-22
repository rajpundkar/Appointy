import { Link, useParams } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';

export default function UserProfile() {
  const { username } = useParams();

  const events = [
    { title: '15 Min Meeting', duration: 15, slug: '15min' },
    { title: '30 Min Meeting', duration: 30, slug: '30min' },
    { title: '60 Min Meeting', duration: 60, slug: '60min' },
  ];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h1 className="profile-name">{username}</h1>
        <p className="profile-bio">Welcome to my scheduling page. Please follow the instructions to add an event to my calendar.</p>
      </div>

      <div className="profile-events-card">
        {events.map((event, index) => (
          <Link 
            to={`/${username}/${event.slug}`} 
            key={event.slug}
            className={`profile-event-item ${index !== events.length - 1 ? 'border-b' : ''}`}
          >
            <div className="profile-event-info">
              <h3 className="profile-event-title">{event.title}</h3>
              <div className="profile-event-meta">
                <Clock size={16} />
                <span>{event.duration}m</span>
              </div>
            </div>
            <div className="profile-event-arrow">
              <ChevronRight size={20} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
