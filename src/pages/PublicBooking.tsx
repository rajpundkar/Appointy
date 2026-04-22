import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Globe } from 'lucide-react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';

export default function PublicBooking() {
  const { username, eventType } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const today = startOfToday();
  const days = Array.from({ length: 30 }).map((_, i) => addDays(today, i));

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'
  ];

  return (
    <div className="public-booking-container">
      <div className="booking-card">
        <div className="booking-sidebar">
          <div className="avatar">
            {username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="booking-host">{username || 'alexdev'}</div>
          <h1 className="booking-title">{eventType || '30 Min'} Meeting</h1>
          
          <div className="booking-details">
            <div className="booking-detail-item">
              <Clock size={18} />
              <span>30 min</span>
            </div>
            <div className="booking-detail-item">
              <Globe size={18} />
              <span>Pacific Time - US & Canada</span>
            </div>
            <div className="booking-detail-item">
              <CalendarIcon size={18} />
              <span>Web conferencing details provided upon confirmation.</span>
            </div>
          </div>
        </div>
        
        <div className="booking-main">
          <div className="booking-view-container">
            <div className="calendar-section">
              <h2 className="calendar-header">Select a Date & Time</h2>
              
              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
                
                {Array.from({ length: today.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                
                {days.map((day, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedDate(day);
                      setSelectedTime(null);
                    }}
                    className={`calendar-day ${selectedDate && isSameDay(day, selectedDate) ? 'active' : ''}`}
                  >
                    {format(day, 'd')}
                  </div>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="time-section">
                <div className="time-header">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </div>
                <div className="time-slots">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {selectedTime && (
                  <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                    Next
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
