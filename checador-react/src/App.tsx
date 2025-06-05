import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from 'date-fns/locale'

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
import JefeHorarioPage from './components/JefeHorarioPage'
import ChecadorHorarioPage from './components/ChecadorHorarioPage'
import JefeLayout from './components/JefeLayout'
import BuscarMaestroPage from './components/BuscarMaestroPage'
import MaestroLayout from './layouts/MaestroLayout'
import MaestroHorarioPage from './components/MaestroHorarioPage'
import ChecadorLayout from './components/ChecadorLayout'
import AlumnoLayout from './components/AlumnoLayout'
import AlumnoHorarioPage from './components/AlumnoHorarioPage'
import EdificiosPage from './components/EdificiosPage'
import ConsultaAsistenciasPage from './components/ConsultaAsistenciasPage'
import './App.css'

// Crear un tema personalizado
const theme = createTheme({
  palette: {
    mode: 'dark', // Establecer modo oscuro por defecto
    primary: {
      main: '#7986CB', // Versión más clara del azul índigo para modo oscuro
      light: '#9FA8DA',
      dark: '#5C6BC0',
    },
    secondary: {
      main: '#FF80AB', // Versión más clara del rosa para modo oscuro
      light: '#FF99BC',
      dark: '#F06292',
    },
    background: {
      default: '#121212', // Color de fondo oscuro estándar
      paper: '#1E1E1E',   // Color de fondo para componentes de papel
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
    error: {
      main: '#F44336',
    },
    warning: {
      main: '#FF9800',
    },
    info: {
      main: '#2196F3',
    },
    success: {
      main: '#4CAF50',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
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
                    <Route path="/admin/checador-horario" element={<ChecadorHorarioPage />} />
                    <Route path="/admin/edificios" element={<EdificiosPage />} />
                    <Route path="/admin/consulta-asistencias" element={<ConsultaAsistenciasPage />} />
                  </Route>
                </Route>
                
                {/* Rutas de Jefe de Grupo */}
                <Route element={<JefeLayout />}>
                  <Route path="/jefe/horario" element={<JefeHorarioPage />} />
                  <Route path="/jefe/buscar" element={<BuscarMaestroPage />} />
                </Route>

                {/* Rutas de Maestro */}
                <Route element={<MaestroLayout />}>
                  <Route path="/maestro/horario" element={<MaestroHorarioPage />} />
                </Route>
                
                {/* Rutas de Checador */}
                <Route path="/checador" element={<ChecadorLayout />}>
                  <Route index element={<ChecadorHorarioPage />} />
                </Route>
                
                {/* Rutas de Alumno */}
                <Route element={<AlumnoLayout />}>
                  <Route path="/alumno/horario" element={<AlumnoHorarioPage />} />
                </Route>
                
                {/* Catch-all route */}
                <Route path="*" element={<div>Página no encontrada</div>} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
