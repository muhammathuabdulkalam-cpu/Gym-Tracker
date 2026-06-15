import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import WeightTracker from './pages/WeightTracker';
import FoodTracker from './pages/FoodTracker';
import Auth from './pages/Auth/Auth';
import Onboarding from './pages/Onboarding';
import Workouts from './pages/Workouts';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import AnimatedBackground from './components/AnimatedBackground';

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden selection:bg-primary/30 selection:text-white relative flex flex-col h-screen">
      <ToastContainer
        theme="dark"
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
        toastStyle={{ fontSize: '14px', borderRadius: '16px', backdropFilter: 'blur(20px)', background: 'rgba(20,20,30,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}
      />
      <AnimatedBackground />
      {user && <NavBar />}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10 pb-24 lg:pb-12 min-h-[calc(100vh-80px)] md:flex-1 md:overflow-y-auto mobile-scroll-fix">
        <Routes>
          <Route path="/login" element={!user ? <Auth /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Auth /> : <Navigate to="/" />} />
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
          <Route path="/onboarding" element={user ? <Onboarding /> : <Navigate to="/login" />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/weight" element={<ProtectedRoute><WeightTracker /></ProtectedRoute>} />
          <Route path="/food" element={<ProtectedRoute><FoodTracker /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          {/* Legacy redirect */}
          <Route path="/track" element={<Navigate to="/weight" />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

