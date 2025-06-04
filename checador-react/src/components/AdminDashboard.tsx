import { Box, Typography, Grid, Paper, Button, Divider, Card, CardContent, CardActionArea, CircularProgress, useTheme } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Dashboard as DashboardIcon, 
  Groups as GroupsIcon, 
  Person as PersonIcon, 
  MenuBook as BookIcon, 
  School as SchoolIcon,
  CalendarMonth as CalendarIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Business as BuildingIcon
} from '@mui/icons-material'
import { 
  usuariosService, 
  gruposService, 
  materiasService, 
  carrerasService,
  horariosService,
  Usuario,
  Grupo,
  Materia,
  Carrera,
  HorarioMaestro
} from '../services/supabaseService'

// Componente para las tarjetas de estadísticas
const StatCard = ({ title, value, icon, color }: { title: string, value: number | string, icon: React.ReactNode, color: string }) => {
  const theme = useTheme()
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        boxShadow: 3,
        backgroundColor: 'background.paper',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box 
            sx={{ 
              backgroundColor: color,
              borderRadius: '50%',
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', textAlign: 'center', mt: 2 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

// Componente para los botones de acceso rápido
const QuickAccessButton = ({ title, icon, path }: { title: string, icon: React.ReactNode, path: string }) => {
  const navigate = useNavigate()
  const theme = useTheme()
  
  return (
    <Card sx={{ 
      height: '100%',
      backgroundColor: 'background.paper'
    }}>
      <CardActionArea 
        onClick={() => navigate(path)}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(121, 134, 203, 0.15)'
          }
        }}
      >
        <Box sx={{ fontSize: 40, mb: 1 }}>
          {icon}
        </Box>
        <Typography variant="subtitle1" component="div" sx={{ textAlign: 'center' }}>
          {title}
        </Typography>
      </CardActionArea>
    </Card>
  )
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    usuarios: 0,
    maestros: 0,
    alumnos: 0,
    grupos: 0,
    materias: 0,
    carreras: 0,
    horarios: 0
  })
  const [userName, setUserName] = useState('Administrador')
  const theme = useTheme()

  // Cargar datos para las estadísticas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Obtener datos del usuario actual
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            const userData = JSON.parse(userStr) as Usuario
            if (userData?.name) {
              setUserName(userData.name)
            }
          } catch (e) {
            console.error('Error parsing user data', e)
          }
        }
        
        // Cargar datos para estadísticas
        const [usuarios, grupos, materias, carreras, horarios] = await Promise.all([
          usuariosService.getAll(),
          gruposService.getAll(),
          materiasService.getAll(),
          carrerasService.getAll(),
          horariosService.getAll()
        ])
        
        // Actualizar estadísticas
        setStats({
          usuarios: usuarios.length,
          maestros: usuarios.filter(u => u.role === 'Maestro').length,
          alumnos: usuarios.filter(u => u.role === 'Alumno').length,
          grupos: grupos.length,
          materias: materias.length,
          carreras: carreras.length,
          horarios: horarios.length
        })
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Accesos rápidos
  const quickAccessItems = [
    { title: 'Gestión de Horarios', icon: <CalendarIcon color="primary" />, path: '/admin/horarios' },
    { title: 'Consulta de Horarios', icon: <CalendarIcon color="primary" />, path: '/admin/horario' },
    { title: 'Usuarios', icon: <PersonIcon color="primary" />, path: '/admin/usuarios' },
    { title: 'Grupos', icon: <GroupsIcon color="primary" />, path: '/admin/grupos' },
    { title: 'Materias', icon: <BookIcon color="primary" />, path: '/admin/materias' },
    { title: 'Carreras', icon: <SchoolIcon color="primary" />, path: '/admin/carreras' },
    { title: 'Edificios', icon: <BuildingIcon color="primary" />, path: '/admin/edificios' },
    { title: 'Consulta de Asistencias', icon: <AssignmentIcon color="primary" />, path: '/admin/consulta-asistencias' }
  ]

  return (
    <Box sx={{ 
      p: 3, 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      backgroundColor: 'background.default'
    }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
          Panel de Administración
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bienvenido, {userName}. Aquí tienes un resumen del sistema.
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
          {/* Estadísticas */}
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
            Estadísticas del Sistema
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Usuarios" 
                value={stats.usuarios} 
                icon={<PersonIcon sx={{ color: 'white' }} />} 
                color={theme.palette.primary.main} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Maestros" 
                value={stats.maestros} 
                icon={<PersonIcon sx={{ color: 'white' }} />} 
                color={theme.palette.secondary.main} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Grupos" 
                value={stats.grupos} 
                icon={<GroupsIcon sx={{ color: 'white' }} />} 
                color={theme.palette.success.main} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Materias" 
                value={stats.materias} 
                icon={<BookIcon sx={{ color: 'white' }} />} 
                color={theme.palette.info.main} 
              />
            </Grid>
          </Grid>
          
          {/* Accesos rápidos */}
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
            Accesos Rápidos
          </Typography>
          <Grid container spacing={3}>
            {quickAccessItems.map((item, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <QuickAccessButton 
                  title={item.title} 
                  icon={item.icon} 
                  path={item.path} 
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  )
}