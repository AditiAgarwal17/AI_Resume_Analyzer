import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-emerald-400">Resume</span>
          <span className="text-white">AI</span>
        </Link>
        <div className="flex items-center gap-4">
          {isAuth ? (
            <>
              <Link to="/analyzer" className="text-sm text-gray-300 hover:text-white transition">Analyze</Link>
              <Link to="/history" className="text-sm text-gray-300 hover:text-white transition">History</Link>
              <span className="text-sm text-gray-500">Hi, {user?.name?.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-300 hover:text-white transition">Login</Link>
              <Link
                to="/register"
                className="text-sm px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
