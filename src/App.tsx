import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import FlightSearch from './pages/FlightSearch';
import FlightSelection from './pages/FlightSelection';
import BookingPage from './pages/BookingPage';
import MyTrips from './pages/Mytrips';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminFlights from './pages/AdminFlights';

function readRoleState() {
  return {
    isAuthenticated: Boolean(localStorage.getItem('access_token')),
    isAdmin:
      localStorage.getItem('is_staff') === 'true' ||
      localStorage.getItem('is_admin') === 'true',
  };
}

export default function App() {
  const [{ isAuthenticated, isAdmin }, setRoleState] = useState(readRoleState);

  useEffect(() => {
    const syncRole = () => {
      setRoleState(readRoleState());
    };
    window.addEventListener('auth-change', syncRole);
    window.addEventListener('storage', syncRole);
    return () => {
      window.removeEventListener('auth-change', syncRole);
      window.removeEventListener('storage', syncRole);
    };
  }, []);

  const homePath = !isAuthenticated ? '/login' : isAdmin ? '/admin/users' : '/search';

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="p-6">
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to={homePath} replace /> : <Login />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to={homePath} replace /> : <Register />}
            />

            <Route                                //new
              path="/admin/flights"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : isAdmin ? (
                  <AdminFlights />
                ) : (
                  <Navigate to="/search" replace />
                )
              }
            />

            <Route
              path="/admin/users"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : isAdmin ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/search" replace />
                )
              }
            />
            <Route
              path="/search"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : isAdmin ? (
                  <Navigate to="/admin/users" replace />
                ) : (
                  <FlightSearch />
                )
              }
            />
            <Route
              path="/flights/select"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : isAdmin ? (
                  <Navigate to="/admin/users" replace />
                ) : (
                  <FlightSelection />
                )
              }
            />
            <Route
              path="/book"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : isAdmin ? (
                  <Navigate to="/admin/users" replace />
                ) : (
                  <BookingPage />
                )
              }
            />
            <Route
              path="/my-trips"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : isAdmin ? (
                  <Navigate to="/admin/users" replace />
                ) : (
                  <MyTrips />
                )
              }
            />
            <Route path="*" element={<Navigate to={homePath} replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}




