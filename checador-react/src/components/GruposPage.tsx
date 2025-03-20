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
  SelectChangeEvent,
  Snackbar,
  Alert
} from '@mui/material';
import { gruposService, Grupo } from '../services/supabaseService';

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [aulas, setAulas] = useState<string[]>([]);
  const [edificios, setEdificios] = useState<string[]>([]);

  const [selectedGroup, setSelectedGroup] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [newBuilding, setNewBuilding] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const gruposData = await gruposService.getAll();
        setGrupos(gruposData);

        if (gruposData.length > 0) {
          setSelectedGroup(gruposData[0].id?.toString() || '');
        }

        const aulasData = await gruposService.getClassrooms();
        setAulas(aulasData as string[]);
        if (aulasData.length > 0) {
          setSelectedRoom(aulasData[0]);
        }

        const edificiosData = await gruposService.getBuildings();
        setEdificios(edificiosData as string[]);
        if (edificiosData.length > 0) {
          setSelectedBuilding(edificiosData[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGroupChange = (event: SelectChangeEvent) => {
    setSelectedGroup(event.target.value);
  };

  const handleRoomChange = (event: SelectChangeEvent) => {
    setSelectedRoom(event.target.value);
  };

  const handleBuildingChange = (event: SelectChangeEvent) => {
    setSelectedBuilding(event.target.value);
  };

  const handleAddGroup = async () => {
    if (!newGroup) {
      setError('Debe ingresar un número de grupo');
      return;
    }

    setLoading(true);
    try {
      await gruposService.create({ 
        name: newGroup,
        classroom: '',
        building: ''
      });
      setSuccess('Grupo agregado correctamente');
      setNewGroup('');
      
      // Recargar grupos
      const gruposData = await gruposService.getAll();
      setGrupos(gruposData);
    } catch (err: any) {
      setError(err.message || 'Error al agregar grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) {
      setError('Debe seleccionar un grupo');
      return;
    }

    setLoading(true);
    try {
      await gruposService.delete(Number(selectedGroup));
      setSuccess('Grupo eliminado correctamente');
      
      // Recargar grupos
      const gruposData = await gruposService.getAll();
      setGrupos(gruposData);
      if (gruposData.length > 0) {
        setSelectedGroup(gruposData[0].id?.toString() || '');
      } else {
        setSelectedGroup('');
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async () => {
    if (!newRoom) {
      setError('Debe ingresar un nombre de aula');
      return;
    }

    if (!selectedGroup) {
      setError('Debe seleccionar un grupo para asignarle un aula');
      return;
    }

    setLoading(true);
    try {
      await gruposService.update(Number(selectedGroup), { classroom: newRoom });
      setSuccess('Aula agregada correctamente');
      setNewRoom('');
      
      // Recargar aulas
      const aulasData = await gruposService.getClassrooms();
      setAulas(aulasData as string[]);
    } catch (err: any) {
      setError(err.message || 'Error al agregar aula');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBuilding = async () => {
    if (!newBuilding) {
      setError('Debe ingresar un nombre de edificio');
      return;
    }

    if (!selectedGroup) {
      setError('Debe seleccionar un grupo para asignarle un edificio');
      return;
    }

    setLoading(true);
    try {
      await gruposService.update(Number(selectedGroup), { building: newBuilding });
      setSuccess('Edificio agregado correctamente');
      setNewBuilding('');
      
      // Recargar edificios
      const edificiosData = await gruposService.getBuildings();
      setEdificios(edificiosData as string[]);
    } catch (err: any) {
      setError(err.message || 'Error al agregar edificio');
    } finally {
      setLoading(false);
    }
  };

  // Asignar aula a un grupo existente
  const handleAssignRoom = async () => {
    if (!selectedGroup || !selectedRoom) {
      setError('Debe seleccionar un grupo y un aula');
      return;
    }

    setLoading(true);
    try {
      await gruposService.update(Number(selectedGroup), { classroom: selectedRoom });
      setSuccess('Aula asignada correctamente');
    } catch (err: any) {
      setError(err.message || 'Error al asignar aula');
    } finally {
      setLoading(false);
    }
  };

  // Asignar edificio a un grupo existente
  const handleAssignBuilding = async () => {
    if (!selectedGroup || !selectedBuilding) {
      setError('Debe seleccionar un grupo y un edificio');
      return;
    }

    setLoading(true);
    try {
      await gruposService.update(Number(selectedGroup), { building: selectedBuilding });
      setSuccess('Edificio asignado correctamente');
    } catch (err: any) {
      setError(err.message || 'Error al asignar edificio');
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
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        {/* Sección de Grupos */}
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
          Seleccione un grupo para modificar o agregue uno nuevo
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Grupo</InputLabel>
          <Select
            value={selectedGroup}
            label="Grupo"
            onChange={handleGroupChange}
            disabled={grupos.length === 0}
          >
            {grupos.map((grupo) => (
              <MenuItem key={grupo.id} value={grupo.id?.toString()}>
                {grupo.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          margin="normal"
          label="Grupo nuevo"
          type="text"
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value)}
        />

        <Grid container justifyContent="flex-end" spacing={2} sx={{ mt: 1, mb: 4 }}>
          <Grid item>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteGroup}
              disabled={!selectedGroup || loading}
            >
              Eliminar
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={handleAddGroup}
              disabled={!newGroup || loading}
            >
              Agregar
            </Button>
          </Grid>
        </Grid>

        {/* Sección de Aulas */}
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
          Seleccione un aula o agregue una nueva
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Aula</InputLabel>
          <Select
            value={selectedRoom}
            label="Aula"
            onChange={handleRoomChange}
            disabled={aulas.length === 0}
          >
            {aulas.map((aula) => (
              <MenuItem key={aula} value={aula}>
                {aula}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button 
          variant="contained"
          onClick={handleAssignRoom}
          disabled={!selectedGroup || !selectedRoom || loading}
          sx={{ mt: 1, mb: 2 }}
          fullWidth
        >
          Asignar aula al grupo seleccionado
        </Button>

        <TextField
          fullWidth
          margin="normal"
          label="Aula nueva"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
        />

        <Grid container justifyContent="flex-end" spacing={2} sx={{ mt: 1, mb: 4 }}>
          <Grid item>
            <Button
              variant="contained"
              onClick={handleAddRoom}
              disabled={!newRoom || loading}
            >
              Agregar
            </Button>
          </Grid>
        </Grid>

        {/* Sección de Edificios */}
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
          Seleccione un edificio o agregue uno nuevo
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Edificio</InputLabel>
          <Select
            value={selectedBuilding}
            label="Edificio"
            onChange={handleBuildingChange}
            disabled={edificios.length === 0}
          >
            {edificios.map((edificio) => (
              <MenuItem key={edificio} value={edificio}>
                {edificio}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button 
          variant="contained"
          onClick={handleAssignBuilding}
          disabled={!selectedGroup || !selectedBuilding || loading}
          sx={{ mt: 1, mb: 2 }}
          fullWidth
        >
          Asignar edificio al grupo seleccionado
        </Button>

        <TextField
          fullWidth
          margin="normal"
          label="Edificio nuevo"
          value={newBuilding}
          onChange={(e) => setNewBuilding(e.target.value)}
        />

        <Grid container justifyContent="flex-end" spacing={2} sx={{ mt: 1, mb: 2 }}>
          <Grid item>
            <Button
              variant="contained"
              onClick={handleAddBuilding}
              disabled={!newBuilding || loading}
            >
              Agregar
            </Button>
          </Grid>
        </Grid>
      </Paper>

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