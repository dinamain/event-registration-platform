import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events', { params: { search: searchTerm, page } });
        setEvents(response.data.results);
        setCount(response.data.count);
        setNextUrl(response.data.next);
        setPrevUrl(response.data.previous);
      } catch (err) {
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, page]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="container">
      <h2>Events</h2>

      <input
        type="text"
        placeholder="Search events..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setPage(1);
        }}
      />

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <>
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
          <div>
            <button onClick={() => setPage((p) => p - 1)} disabled={!prevUrl}>
              Previous
            </button>
            <span> Page {page} ({count} total) </span>
            <button onClick={() => setPage((p) => p + 1)} disabled={!nextUrl}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default EventList;