import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import MyRegistrations from './pages/MyRegistrations';
import { ThemeProvider } from './context/ThemeContext';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute>
                <MyRegistrations />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={
  <AdminRoute><AdminDashboard /></AdminRoute>
} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;