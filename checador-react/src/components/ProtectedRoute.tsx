import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

type RoleRoutes = {
  [key: string]: {
    allowedPaths: string[];
    defaultPath: string;
  }
}

const ROLE_ROUTES: RoleRoutes = {
  Administrador: {
    allowedPaths: ['/admin'],
    defaultPath: '/admin/dashboard'
  },
  Alumno: {
    allowedPaths: ['/alumno'],
    defaultPath: '/alumno/horario'
  },
  Jefe_de_Grupo: {
    allowedPaths: ['/jefe'],
    defaultPath: '/jefe/horario'
  },
  Checador: {
    allowedPaths: ['/checador'],
    defaultPath: '/checador/horario'
  },
  Maestro: {
    allowedPaths: ['/maestro'],
    defaultPath: '/maestro/horario'
  }
}

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const userRole = user.role
  const roleConfig = ROLE_ROUTES[userRole]

  if (!roleConfig) {
    return <Navigate to="/login" replace />
  }

  // Verificar si la ruta actual está permitida para el rol del usuario
  const isAllowedPath = roleConfig.allowedPaths.some(path => 
    location.pathname.startsWith(path)
  )

  if (!isAllowedPath) {
    return <Navigate to={roleConfig.defaultPath} replace />
  }

  return <Outlet />
} 