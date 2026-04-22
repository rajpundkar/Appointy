import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Calendar, Plus, Check } from 'lucide-react';

export default function Integrations() {
  const [isConnected, setIsConnected] = useState(false);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Google Auth Success:', tokenResponse);
      setIsConnected(true);
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">Connect your favorite apps and calendar to automate scheduling.</p>
        </div>
      </div>

      <div className="integration-card">
        <div className="integration-icon-wrapper">
          <Calendar size={32} style={{ color: 'var(--brand-accent)' }} />
        </div>
        <div className="integration-info">
          <h3 className="integration-title">Google Calendar</h3>
          <p className="integration-desc">Check for conflicts and add events to your Google Calendar.</p>
        </div>
        <div className="integration-action">
          {isConnected ? (
            <button className="btn btn-outline" style={{ color: '#16a34a', borderColor: '#16a34a' }}>
              <Check size={18} />
              Connected
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => login()}>
              <Plus size={18} />
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
