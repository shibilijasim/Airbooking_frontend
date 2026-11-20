import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAuthSession, readAuthState } from '../utils/auth';

const NAV_LINK_CLASS = 'font-medium text-gray-700 hover:text-blue-600';

export default function Navbar() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(readAuthState);

  useEffect(() => {
    const syncAuth = () => setAuth(readAuthState());
    window.addEventListener('auth-change', syncAuth);
    window.addEventListener('storage', syncAuth);
    return () => {
      window.removeEventListener('auth-change', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const handleLogout = () => {
    setAuth(clearAuthSession());
    navigate('/login', { replace: true });
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            to={auth.isAdmin ? '/admin/users' : '/search'}
            className="text-xl font-bold text-blue-600"
          >
            AirBooking
          </Link>

          <div className="flex items-center gap-6">
            {auth.isAuthenticated ? (
              <>
                {auth.isAdmin ? (
                  <>
                    <Link to="/admin/users" className={NAV_LINK_CLASS}>
                      User Approvals
                    </Link>
                    <Link to="/admin/flights" className={NAV_LINK_CLASS}>
                      Flight Management
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/search" className={NAV_LINK_CLASS}>
                      Flight Search
                    </Link>
                    <Link to="/my-trips" className={NAV_LINK_CLASS}>
                      My Trips
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={NAV_LINK_CLASS}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}