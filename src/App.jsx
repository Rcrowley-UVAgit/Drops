import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import GroupPage from './pages/GroupPage'
import DropSubmission from './pages/DropSubmission'
import Vault from './pages/Vault'
import Profile from './pages/Profile'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#060606]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return user ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#060606]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/group/uw-lads" replace /> : <Landing />} />
      <Route path="/group/:groupId" element={<ProtectedRoute><Layout><GroupPage /></Layout></ProtectedRoute>} />
      <Route path="/group/:groupId/drop" element={<ProtectedRoute><Layout><DropSubmission /></Layout></ProtectedRoute>} />
      <Route path="/vault" element={<ProtectedRoute><Layout><Vault /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
