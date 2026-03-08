import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { GroupsProvider, useGroups } from './context/GroupsContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import GroupPage from './pages/GroupPage'
import DropSubmission from './pages/DropSubmission'
import Vault from './pages/Vault'
import Profile from './pages/Profile'
import InstallPrompt from './components/InstallPrompt'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--terracotta)' }} />
      </div>
    )
  }
  return user ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  const { user, loading } = useAuth()
  const { groups = [] } = useGroups()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--terracotta)' }} />
      </div>
    )
  }

  const defaultGroup = groups[0]?.id || 'uw-lads'

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <Navigate to={`/group/${defaultGroup}`} replace /> : <Landing />} />
        <Route path="/group/:groupId" element={<ProtectedRoute><Layout><GroupPage /></Layout></ProtectedRoute>} />
        <Route path="/group/:groupId/drop" element={<ProtectedRoute><Layout><DropSubmission /></Layout></ProtectedRoute>} />
        <Route path="/vault" element={<ProtectedRoute><Layout><Vault /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <InstallPrompt />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GroupsProvider>
          <AppRoutes />
        </GroupsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
