import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'

import LoginPage         from './pages/LoginPage'
import AdminLayout       from './pages/admin/AdminLayout'
import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminSurat        from './pages/admin/AdminSurat'
import AdminInputSurat   from './pages/admin/AdminInputSurat'
import AdminRekap        from './pages/admin/AdminRekap'
import AdminPegawai      from './pages/admin/AdminPegawai'
import AdminProfil       from './pages/admin/AdminProfil'
import AdminUsers        from './pages/admin/AdminUsers'
import AdminCetakSurat   from './pages/admin/AdminCetakSurat'
import BidangLayout      from './pages/bidang/BidangLayout'
import BidangDashboard   from './pages/bidang/BidangDashboard'
import BidangSurat       from './pages/bidang/BidangSurat'
import BidangProfil      from './pages/bidang/BidangProfil'
import NotFound          from './pages/NotFound'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/bidang" replace />
  return children
}

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-stone-400 font-medium">Memuat...</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <Loader />

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to={user.role === 'admin' ? '/admin' : '/bidang'} replace /> : <LoginPage />
      } />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index              element={<AdminDashboard />} />
        <Route path="surat"       element={<AdminSurat />} />
        <Route path="surat/input" element={<AdminInputSurat />} />
        <Route path="surat/edit/:id"   element={<AdminInputSurat />} />
        <Route path="surat/cetak/:id"  element={<AdminCetakSurat />} />
        <Route path="rekap"       element={<AdminRekap />} />
        <Route path="pegawai"     element={<AdminPegawai />} />
        <Route path="profil"      element={<AdminProfil />} />
        <Route path="users"       element={<AdminUsers />} />
      </Route>

      {/* Bidang */}
      <Route path="/bidang" element={<ProtectedRoute><BidangLayout /></ProtectedRoute>}>
        <Route index          element={<BidangDashboard />} />
        <Route path="surat"   element={<BidangSurat />} />
        <Route path="profil"  element={<BidangProfil />} />
      </Route>

      <Route path="/" element={
        user ? <Navigate to={user.role === 'admin' ? '/admin' : '/bidang'} replace /> : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px', borderRadius: '12px' },
          success: { iconTheme: { primary: '#CA8A04', secondary: '#FEF9C3' } },
        }}
      />
    </AuthProvider>
  )
}
