import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await api.get('/my-registrations', { params: { page } });
        setRegistrations(response.data.results);
        setNextUrl(response.data.next);
        setPrevUrl(response.data.previous);
      } catch (err) {
        setError('Failed to load your registrations.');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [page]);

  if (loading) return <p>Loading your registrations...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="container">
      <Link to="/">&larr; Back to events</Link>
      <h2>My Registrations</h2>

      {registrations.length === 0 ? (
        <p>You haven't registered for any events yet.</p>
      ) : (
        <>
          <ul>
            {registrations.map((reg) => (
              <li key={reg.id}>
                <Link to={`/events/${reg.event.id}`}>
                  <strong>{reg.event.title}</strong>
                </Link>
                {' — '}
                {new Date(reg.event.date).toLocaleString()} — {reg.event.location}
                <br />
                <small>Registered on: {new Date(reg.registered_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
          <div>
            <button onClick={() => setPage((p) => p - 1)} disabled={!prevUrl}>
              Previous
            </button>
            <span> Page {page} </span>
            <button onClick={() => setPage((p) => p + 1)} disabled={!nextUrl}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default MyRegistrations;