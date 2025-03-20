import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material'

// Components
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './components/AdminDashboard'
import TemarioPage from './components/TemarioPage'
import UsuariosPage from './components/UsuariosPage'
import GruposPage from './components/GruposPage'
import HorarioPage from './components/HorarioPage'
import MateriasPage from './components/MateriasPage'
import CarrerasPage from './components/CarrerasPage'
import HorariosPage from './components/HorariosPage'
import './App.css'

// Crear un tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#4285F4',
    },
    secondary: {
      main: '#454646',
    },
    background: {
      default: '#F2F3F8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="app-container">
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public route */}
              <Route path="/" element={<Login />} />
              
              {/* Protected admin routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/horario" element={<HorarioPage />} />
                  <Route path="/admin/horarios" element={<HorariosPage />} />
                  <Route path="/admin/grupos" element={<GruposPage />} />
                  <Route path="/admin/usuarios" element={<UsuariosPage />} />
                  <Route path="/admin/materias" element={<MateriasPage />} />
                  <Route path="/admin/carreras" element={<CarrerasPage />} />
                  <Route path="/admin/temarios" element={<TemarioPage />} />
                </Route>
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<div>Página no encontrada</div>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  )
}

export default App
