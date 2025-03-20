import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Tabs,
  Tab,
  SelectChangeEvent,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Usuario, usuariosService } from '../services/supabaseService';

export default function UsuariosPage() {
  const [tabValue, setTabValue] = useState(0);
  const [accountNumber, setAccountNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('Alumno');
  const [searchAccount, setSearchAccount] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  useEffect(() => {
    // Cargar la lista de usuarios al iniciar
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await usuariosService.getAll();
        setUsuarios(data);
      } catch (err: any) {
        setError('Error al cargar usuarios: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Limpiar formulario al cambiar de tab
    if (newValue === 1) {
      clearForm();
    }
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value);
  };

  const clearForm = () => {
    setAccountNumber('');
    setUserName('');
    setEmail('');
    setPassword('');
    setRole('Alumno');
    setSearchAccount('');
    setSelectedUser(null);
  };

  const handleSearch = async () => {
    if (!searchAccount) {
      setError('Por favor ingrese un número de cuenta para buscar');
      return;
    }

    setLoading(true);
    try {
      // Buscar el usuario por ID
      const userId = Number(searchAccount);
      const user = await usuariosService.getById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      // Llenar el formulario con los datos del usuario
      setSelectedUser(user);
      setAccountNumber(user.id?.toString() || '');
      setUserName(user.name);
      setEmail(user.email || '');
      setPassword(user.password || '');
      setRole(user.role || 'Alumno');
      
      setSuccess('Usuario encontrado');
    } catch (err: any) {
      setError('Error al buscar usuario: ' + err.message);
      clearForm();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedUser) {
      setError('Primero debe buscar un usuario');
      return;
    }

    if (!userName || !email) {
      setError('Por favor complete al menos el nombre y el correo electrónico');
      return;
    }

    setLoading(true);
    try {
      const updatedUser: Partial<Usuario> = {
        name: userName,
        email,
        role: role as 'Alumno' | 'Jefe de grupo' | 'Coordinador' | 'Maestro' | 'Administrador',
      };
      
      // Solo actualizar la contraseña si se modificó
      if (password && password !== '********') {
        updatedUser.password = password;
      }
      
      await usuariosService.update(Number(accountNumber), updatedUser);
      setSuccess('Usuario actualizado correctamente');
    } catch (err: any) {
      setError('Error al guardar usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) {
      setError('Primero debe buscar un usuario');
      return;
    }

    if (!window.confirm('¿Está seguro de eliminar este usuario?')) {
      return;
    }

    setLoading(true);
    try {
      await usuariosService.delete(Number(accountNumber));
      setSuccess('Usuario eliminado correctamente');
      clearForm();
    } catch (err: any) {
      setError('Error al eliminar usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!userName || !email || !password) {
      setError('Por favor complete el nombre, correo electrónico y contraseña');
      return;
    }

    setLoading(true);
    try {
      const newUser: Usuario = {
        name: userName,
        email,
        password,
        role: role as 'Alumno' | 'Jefe de grupo' | 'Coordinador' | 'Maestro' | 'Administrador',
      };
      
      await usuariosService.create(newUser);
      setSuccess('Usuario creado correctamente');
      clearForm();
    } catch (err: any) {
      setError('Error al crear usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ mb: 3, borderRadius: 1, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Editar" />
          <Tab label="Añadir" />
        </Tabs>
      </Paper>

      {tabValue === 0 ? (
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom align="center">
            Para poder ver o editar un usuario es necesario contar con un numero de cuenta
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4, mt: 2 }}>
            <Grid item xs>
              <TextField
                fullWidth
                label="Número de cuenta"
                type="number"
                value={searchAccount}
                onChange={(e) => setSearchAccount(e.target.value)}
              />
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                onClick={handleSearch}
                sx={{ height: '100%' }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Buscar'}
              </Button>
            </Grid>
          </Grid>

          <Typography variant="h5" gutterBottom align="center">
            Datos del usuario
          </Typography>

          <Box component="form" sx={{ mt: 3 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Número de cuenta"
              type="number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              disabled={true} // No permitir cambiar el ID
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Nombre del usuario"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={!selectedUser}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!selectedUser}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!selectedUser}
              helperText="Deje en blanco para mantener la misma contraseña"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Rol del usuario</InputLabel>
              <Select
                value={role}
                label="Rol del usuario"
                onChange={handleRoleChange}
                disabled={!selectedUser}
              >
                <MenuItem value="Alumno">Alumno</MenuItem>
                <MenuItem value="Jefe de grupo">Jefe de grupo</MenuItem>
                <MenuItem value="Coordinador">Coordinador</MenuItem>
                <MenuItem value="Maestro">Maestro</MenuItem>
                <MenuItem value="Administrador">Administrador</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
              <Button 
                variant="outlined" 
                color="error"
                onClick={handleDelete}
                disabled={!selectedUser || loading}
              >
                Eliminar
              </Button>
              <Button 
                variant="contained"
                onClick={handleSave}
                disabled={!selectedUser || loading}
              >
                Guardar
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom align="center">
            Agregar nuevo usuario
          </Typography>

          <Box component="form" sx={{ mt: 3 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Nombre del usuario"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Rol del usuario</InputLabel>
              <Select
                value={role}
                label="Rol del usuario"
                onChange={handleRoleChange}
              >
                <MenuItem value="Alumno">Alumno</MenuItem>
                <MenuItem value="Jefe de grupo">Jefe de grupo</MenuItem>
                <MenuItem value="Coordinador">Coordinador</MenuItem>
                <MenuItem value="Maestro">Maestro</MenuItem>
                <MenuItem value="Administrador">Administrador</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              fullWidth
              variant="contained"
              onClick={handleAddUser}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Crear usuario'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Alertas de éxito y error */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
} 