import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transfer from './pages/Transfer'
import History from './pages/History'
import Admin from './pages/Admin'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/transfer"  element={<PrivateRoute><Transfer /></PrivateRoute>} />
          <Route path="/history"   element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/admin"     element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  )
}
