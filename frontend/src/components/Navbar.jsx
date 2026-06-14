import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
function Navbar() {
  const { user, logout } = useAuth();
const { theme, toggleTheme } = useTheme();
  return (
    <nav>
      <Link to="/">Events</Link>
      {user ? (
        <>
          <span> Welcome, {user.name}</span>
          <Link to="/my-registrations"> My Registrations</Link>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login"> Login</Link>
          <Link to="/register"> Register</Link>
        </>
      )}
      <button onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button>
    </nav>
  );
}

export default Navbar;