import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Link,
  Alert,
  Paper,
  Avatar
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { authService } from '../services/supabaseService'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Por favor ingrese su correo y contraseña')
      return
    }

    try {
      setError(null)
      setLoading(true)
      
      // Primero intentamos autenticar con Supabase Auth
      const { error: authError } = await signIn(email, password)
      
      if (authError) {
        // Si falla la autenticación con Supabase Auth, intentamos con la tabla de usuarios
        try {
          // Buscar usuario por email y contraseña
          const { data: usuario, error: dbError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();
          
          if (dbError || !usuario) {
            throw new Error('Credenciales inválidas');
          }
          
          // Simular sesión con el usuario encontrado
          localStorage.setItem('user', JSON.stringify(usuario));
          
          // Redireccionar según el rol
          switch(usuario.role) {
            case 'Jefe_de_Grupo':
              navigate('/jefe/horario')
              break
            case 'Administrador':
            default:
              navigate('/admin')
              break
          }
          return;
        } catch (dbErr: any) {
          setError('Email o contraseña incorrectos');
          return;
        }
      }
      
      // Si la autenticación con Supabase Auth fue exitosa, obtener el rol
      const { data: userData, error: roleError } = await supabase
        .from('usuarios')
        .select('role')
        .eq('email', email)
        .single();
      
      if (roleError || !userData) {
        throw new Error('No se encontró información del usuario');
      }

      // Redireccionar según el rol
      switch(userData.role) {
        case 'Jefe_de_Grupo':
          navigate('/jefe/horario')
          break
        case 'Administrador':
        default:
          navigate('/admin')
          break
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        bgcolor: '#F2F3F8'
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper 
          elevation={3} 
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          
          <Typography component="h1" variant="h5" mb={2}>
            Checador Login
          </Typography>
          
          <Box 
            component="img" 
            src="/vision2025.jpeg" 
            alt="Logo" 
            sx={{ 
              height: 110, 
              mb: 3,
              maxWidth: '100%'
            }} 
          />
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, borderRadius: '20px', py: 1.2 }}
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Acceder'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Link href="#" variant="body2">
                Olvidé mi contraseña
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
} 