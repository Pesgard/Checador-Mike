import { useState, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { Usuario } from '../services/supabaseService'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const [localUser, setLocalUser] = useState<Usuario | null>(null)
  const [localLoading, setLocalLoading] = useState(true)
  const location = useLocation()

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

  const currentUser = user || localUser
  if (!currentUser) {
    return <Navigate to="/" replace />
  }

  // Verificar que el usuario acceda solo a las rutas de su rol
  const path = location.pathname
  const userRole = currentUser.role

  if (
    (userRole === 'Administrador' && !path.startsWith('/admin')) ||
    (userRole === 'Maestro' && !path.startsWith('/maestro')) ||
    (userRole === 'Checador' && !path.startsWith('/checador')) ||
    (userRole === 'Jefe_de_Grupo' && !path.startsWith('/jefe'))
  ) {
    // Redirigir al usuario a su ruta correspondiente
    const defaultRoutes: Record<string, string> = {
      'Administrador': '/admin',
      'Maestro': '/maestro/horario',
      'Checador': '/checador',
      'Jefe_de_Grupo': '/jefe/horario'
    }
    return <Navigate to={defaultRoutes[userRole] || '/'} replace />
  }

  // Render child routes if authenticated
  return <Outlet />
} 