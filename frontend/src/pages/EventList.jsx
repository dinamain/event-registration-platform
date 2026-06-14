import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events', { params: { search: searchTerm } });
        setEvents(response.data);
      } catch (err) {
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="container">
      <h2>Events</h2>

      <input
        type="text"
        placeholder="Search events..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events found.</p>
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