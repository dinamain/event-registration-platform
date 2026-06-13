import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
      } catch (err) {
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="container">
      <h2>Events</h2>
      {events.length === 0 ? (
        <p>No events available.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <Link to={`/events/${event.id}`}>
                <strong>{event.title}</strong>
              </Link>
              {' — '}
              {new Date(event.date).toLocaleString()} — {event.location}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EventList;