import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
      } catch (err) {
        setError('Failed to load event.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    setMessage('');

    try {
      await api.post(`/events/${id}/register`);
      setMessage('Successfully registered!');
    } catch (err) {
      if (err.response && err.response.data) {
        setMessage(err.response.data.detail || 'Registration failed.');
      } else {
        setMessage('Something went wrong.');
      }
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <p>Loading event...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!event) return <p>Event not found.</p>;

  return (
    <div className="container">
      <Link to="/">&larr; Back to events</Link>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
      <p><strong>Location:</strong> {event.location}</p>
      {event.latitude && event.longitude && (
  <MapContainer
    center={[event.latitude, event.longitude]}
    zoom={13}
    style={{ height: '300px', width: '100%', marginTop: '1rem', borderRadius: '8px' }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
    <Marker position={[event.latitude, event.longitude]}>
      <Popup>{event.title}</Popup>
    </Marker>
  </MapContainer>
)}
      <button className="btn" onClick={handleRegister} disabled={registering}>
  {registering ? 'Registering...' : 'Register for this event'}
</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default EventDetail;