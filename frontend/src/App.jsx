import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExamPage from './pages/ExamPage';
import Results from './pages/Results';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateExam from './pages/admin/CreateExam';
import ManageExam from './pages/admin/ManageExam';
import ExamSubmissions from './pages/admin/ExamSubmissions';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} /> : <Register />} />

        {/* Student Routes */}
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="STUDENT"><Dashboard /></ProtectedRoute>} />
        <Route path="/exam/:examId" element={<ProtectedRoute requiredRole="STUDENT"><ExamPage /></ProtectedRoute>} />
        <Route path="/results/:examId" element={<ProtectedRoute><Results /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/create-exam" element={<ProtectedRoute requiredRole="ADMIN"><CreateExam /></ProtectedRoute>} />
        <Route path="/admin/exam/:id" element={<ProtectedRoute requiredRole="ADMIN"><ManageExam /></ProtectedRoute>} />
        <Route path="/admin/exam/:id/submissions" element={<ProtectedRoute requiredRole="ADMIN"><ExamSubmissions /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
