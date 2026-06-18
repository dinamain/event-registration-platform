import { useState, useEffect } from 'react';
import api from '../api/axios';

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '',latitude: '', longitude: '' });
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fetchEvents = async () => {
    try {
      const res = await api.get('/events', { params: { page_size: 100 } });
      setEvents(res.data.results || res.data);
    } catch (err) {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', date: '', location: '' });
    setEditingId(null);
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      date: event.date.slice(0, 16),
      location: event.location,
      latitude: event.latitude ?? '',
    longitude: event.longitude ?? '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/admin/events/${id}`);
      fetchEvents();
    } catch (err) {
      setError('Failed to delete event.');
    }
  };
  
const handleGenerateDescription = async () => {
  if (!form.title) {
    setError('Enter a title first.');
    return;
  }
  setGenerating(true);
  setError('');
  try {
    const res = await api.post('/admin/generate-description', {
      title: form.title,
      location: form.location,
    });
    setForm({ ...form, description: res.data.description });
  } catch (err) {
  if (err.response?.status === 429) {
    setError('AI generation rate limit reached. Please try again later.');
  } else {
    setError('AI generation failed.');
  }
} finally {
    setGenerating(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/admin/events/${editingId}`, form);
      } else {
        await api.post('/admin/events', form);
      }
      resetForm();
      fetchEvents();
    } catch (err) {
      setError('Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Event' : 'Create Event'}</h3>
        <div>
          <label>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
  <div>
  <label>Description</label>
  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
  <button type="button" className="btn" onClick={handleGenerateDescription} disabled={generating}>
    {generating ? 'Generating...' : '✨ Generate with AI'}
  </button>
</div>
        <div>
          <label>Date</label>
          <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div>
          <label>Location</label>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        </div>
        <div>
        <label>Latitude (optional)</label>
        <input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
      </div>
      <div>
        <label>Longitude (optional)</label>
        <input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
      </div>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
        {editingId && <button type="button" className="btn" onClick={resetForm}>Cancel</button>}
      </form>

      <h3>All Events</h3>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <strong>{event.title}</strong> — {new Date(event.date).toLocaleString()} — {event.location}
            <div>
              <button className="btn" onClick={() => handleEdit(event)}>Edit</button>
              <button onClick={() => handleDelete(event.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;