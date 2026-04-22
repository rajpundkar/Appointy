import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PublicBooking from './pages/PublicBooking';
import UserProfile from './pages/UserProfile';
import Integrations from './pages/Integrations';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/event-types" replace />} />
          <Route path="event-types" element={<Dashboard />} />
          <Route path="bookings" element={<div className="page-container"><h1 className="page-title">Bookings</h1><p className="page-subtitle">View your upcoming bookings.</p></div>} />
          <Route path="availability" element={<div className="page-container"><h1 className="page-title">Availability</h1><p className="page-subtitle">Configure your times of availability.</p></div>} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="settings" element={<div className="page-container"><h1 className="page-title">Settings</h1><p className="page-subtitle">Manage your account settings.</p></div>} />
        </Route>
        
        <Route path="/:username" element={<UserProfile />} />
        <Route path="/:username/:eventType" element={<PublicBooking />} />
      </Routes>
    </Router>
  );
}

export default App;
