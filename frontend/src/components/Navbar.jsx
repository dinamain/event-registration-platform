import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

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
    </nav>
  );
}

export default Navbar;