import { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { Usuario } from '../services/supabaseService'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const [localUser, setLocalUser] = useState<Usuario | null>(null)
  const [localLoading, setLocalLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un usuario almacenado en localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        setLocalUser(userData)
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
    setLocalLoading(false)
  }, [])

  // Show loading spinner while checking auth
  if (loading || localLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Redirect to login if not authenticated
  if (!user && !localUser) {
    return <Navigate to="/" replace />
  }

  // Render child routes if authenticated
  return <Outlet />
} 