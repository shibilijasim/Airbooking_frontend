// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import FlightSearch from './pages/FlightSearch';
// import AdminDashboard from './pages/AdminDashboard';
import FlightDetail from './pages/FlightSearch';
// import MyTrips from './pages/Mytrips';
// import BookingPage from './pages/BookingPage';
// import FlightSelection from './pages/FlightSelection';

// import AdminDashboard from './pages/AdminDashboard';
// import FlightSearch from './pages/FlightSearch';
// import FlightSelection from './pages/FlightSelection';
// import BookingPage from './pages/BookingPage';
// import MyTrips from './pages/Mytrips';

// // Mock auth check (replace with real context state)
// const isAuthenticated = () => !!localStorage.getItem('access_token');
// // const isAdmin = () => localStorage.getItem('is_admin') === 'true';
// const isAdmin = localStorage.getItem('is_staff') === 'true';

// export default function App() {
//   return (
//     <Router>
//       <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
//         <Navbar />
//         <main className="container mx-auto px-4 py-8">
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
            
//             {/* User Routes */}
//             <Route path="/search" element={isAuthenticated() ? <FlightSearch /> : <Navigate to="/login" />} />
//             {/* <Route path="/book" element={<BookingPage />} />
//             <Route path="/my-trips" element={isAuthenticated() ? <MyTrips /> : <Navigate to="/login" />} />
//             <Route path="/flights/:flightNumber" element={isAuthenticated() ? <FlightDetail /> : <Navigate to="/login" />} /> */}
//             <Route path="/flights/select" element={<FlightSelection />} />
//             <Route path="/book" element={<BookingPage />} />
//             <Route path="/my-trips" element={<MyTrips />} />
            
//             {/* Admin Routes */}
//             {/* <Route path="/admin" element={isAdmin() ? <AdminDashboard /> : <Navigate to="/search" />} /> */}

//             <Routes>
//               <Route
//                 path="/admin/users"
//                 element={isAdmin ? <AdminDashboard /> : <Navigate to="/search" replace />}
//               />
//               <Route
//                 path="/search"
//                 element={isAdmin ? <Navigate to="/admin/users" replace /> : <FlightSearch />}
//               />
//               <Route
//                 path="/flights/select"
//                 element={isAdmin ? <Navigate to="/admin/users" replace /> : <FlightSelection />}
//               />
//               <Route
//                 path="/book"
//                 element={isAdmin ? <Navigate to="/admin/users" replace /> : <BookingPage />}
//               />
//               <Route
//                 path="/my-trips"
//                 element={isAdmin ? <Navigate to="/admin/users" replace /> : <MyTrips />}
//               />
//             </Routes>
            
//             <Route path="*" element={<Navigate to="/search" />} />
//           </Routes>
//         </main>
//       </div>
//     </Router>
//   );
// }


// import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import AdminDashboard from './pages/AdminDashboard';
// import FlightSearch from './pages/FlightSearch';
// import FlightSelection from './pages/FlightSelection';
// import BookingPage from './pages/BookingPage';
// import MyTrips from './pages/Mytrips';
// import Login from './pages/Login';

// export default function App() {
//   const isAdmin = localStorage.getItem('is_staff') === 'true';

//   return (
//     <BrowserRouter>
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <main className="p-6">
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route
//               path="/admin/users"
//               element={isAdmin ? <AdminDashboard /> : <Navigate to="/search" replace />}
//             />
//             <Route
//               path="/search"
//               element={isAdmin ? <Navigate to="/admin/users" replace /> : <FlightSearch />}
//             />
//             <Route
//               path="/flights/select"
//               element={isAdmin ? <Navigate to="/admin/users" replace /> : <FlightSelection />}
//             />
//             <Route
//               path="/book"
//               element={isAdmin ? <Navigate to="/admin/users" replace /> : <BookingPage />}
//             />
//             <Route
//               path="/my-trips"
//               element={isAdmin ? <Navigate to="/admin/users" replace /> : <MyTrips />}
//             />
//             <Route
//               path="*"
//               element={<Navigate to={isAdmin ? '/admin/users' : '/search'} replace />}
//             />
//           </Routes>
//         </main>
//       </div>
//     </BrowserRouter>
//   );
// }




// import { useEffect, useState } from 'react';
// import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import AdminDashboard from './pages/AdminDashboard';
// import FlightSearch from './pages/FlightSearch';
// import FlightSelection from './pages/FlightSelection';
// import BookingPage from './pages/BookingPage';
// import MyTrips from './pages/Mytrips';
// import Login from './pages/Login';

// function readRoleState() {
//   return {
//     isAuthenticated: Boolean(localStorage.getItem('access_token')),
//     isAdmin:
//       localStorage.getItem('is_staff') === 'true' ||
//       localStorage.getItem('is_admin') === 'true',
//   };
// }

// export default function App() {
//   const [{ isAuthenticated, isAdmin }, setRoleState] = useState(readRoleState);

//   useEffect(() => {
//     const syncRole = () => {
//       setRoleState(readRoleState());
//     };
//     window.addEventListener('auth-change', syncRole);
//     window.addEventListener('storage', syncRole);
//     return () => {
//       window.removeEventListener('auth-change', syncRole);
//       window.removeEventListener('storage', syncRole);
//     };
//   }, []);

//   const homePath = !isAuthenticated ? '/login' : isAdmin ? '/admin/users' : '/search';

//   return (
//     <BrowserRouter>
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <main className="p-6">
//           <Routes>
//             <Route
//               path="/login"
//               element={isAuthenticated ? <Navigate to={homePath} replace /> : <Login />}
//             />
//             <Route
//               path="/admin/users"
//               element={
//                 !isAuthenticated ? (
//                   <Navigate to="/login" replace />
//                 ) : isAdmin ? (
//                   <AdminDashboard />
//                 ) : (
//                   <Navigate to="/search" replace />
//                 )
//               }
//             />
//             <Route
//               path="/search"
//               element={
//                 !isAuthenticated ? (
//                   <Navigate to="/login" replace />
//                 ) : isAdmin ? (
//                   <Navigate to="/admin/users" replace />
//                 ) : (
//                   <FlightSearch />
//                 )
//               }
//             />
//             <Route
//               path="/flights/select"
//               element={
//                 !isAuthenticated ? (
//                   <Navigate to="/login" replace />
//                 ) : isAdmin ? (
//                   <Navigate to="/admin/users" replace />
//                 ) : (
//                   <FlightSelection />
//                 )
//               }
//             />
//             <Route
//               path="/book"
//               element={
//                 !isAuthenticated ? (
//                   <Navigate to="/login" replace />
//                 ) : isAdmin ? (
//                   <Navigate to="/admin/users" replace />
//                 ) : (
//                   <BookingPage />
//                 )
//               }
//             />
//             <Route
//               path="/my-trips"
//               element={
//                 !isAuthenticated ? (
//                   <Navigate to="/login" replace />
//                 ) : isAdmin ? (
//                   <Navigate to="/admin/users" replace />
//                 ) : (
//                   <MyTrips />
//                 )
//               }
//             />
//             <Route path="*" element={<Navigate to={homePath} replace />} />
//           </Routes>
//         </main>
//       </div>
//     </BrowserRouter>
//   );
// }


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




