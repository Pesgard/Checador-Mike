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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { gruposService, usuariosService, Grupo, Usuario } from '../services/supabaseService';
import EditIcon from '@mui/icons-material/Edit';

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [jefes, setJefes] = useState<Usuario[]>([]);
  const [aulas, setAulas] = useState<string[]>([]);
  const [edificios, setEdificios] = useState<string[]>([]);

  const [selectedGroup, setSelectedGroup] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [newBuilding, setNewBuilding] = useState('');
  const [selectedJefe, setSelectedJefe] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingGroup, setEditingGroup] = useState<Grupo | null>(null);
  const [editName, setEditName] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editBuilding, setEditBuilding] = useState('');
  const [editJefe, setEditJefe] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gruposData, aulasData, edificiosData, usuariosData] = await Promise.all([
          gruposService.getAll(),
          gruposService.getClassrooms(),
          gruposService.getBuildings(),
          usuariosService.getAll()
        ]);

        setGrupos(gruposData);
        setAulas(aulasData);
        setEdificios(edificiosData);
        
        console.log('Todos los usuarios:', usuariosData);
        const jefesDeGrupo = usuariosData.filter(user => user.role === 'Jefe_de_Grupo');
        console.log('Jefes de grupo filtrados:', jefesDeGrupo);
        
        setJefes(jefesDeGrupo);
      } catch (err: any) {
        console.error('Error completo:', err);
        setError('Error al cargar datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log('Estado actual de jefes:', jefes);
  }, [jefes]);

  const handleAddGroup = async () => {
    if (!newGroup) {
      setError('Por favor ingrese un nombre de grupo');
      return;
    }

    setLoading(true);
    try {
      const nuevoGrupo: Grupo = {
        name: newGroup,
        classroom: selectedRoom || undefined,
        building: selectedBuilding || undefined,
        jefe_nocuenta: selectedJefe || undefined
      };

      await gruposService.create(nuevoGrupo);
      const gruposActualizados = await gruposService.getAll();
      setGrupos(gruposActualizados);
      setNewGroup('');
      setSelectedRoom('');
      setSelectedBuilding('');
      setSelectedJefe('');
      setSuccess('Grupo creado exitosamente');
    } catch (err: any) {
      setError('Error al crear grupo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (grupo: Grupo) => {
    setEditingGroup(grupo);
    setEditName(grupo.name);
    setEditRoom(grupo.classroom || '');
    setEditBuilding(grupo.building || '');
    setEditJefe(grupo.jefe_nocuenta || '');
  };

  const handleCloseEdit = () => {
    setEditingGroup(null);
    setEditName('');
    setEditRoom('');
    setEditBuilding('');
    setEditJefe('');
  };

  const handleSaveEdit = async () => {
    if (!editingGroup || !editName) {
      setError('Por favor complete los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const grupoActualizado: Grupo = {
        ...editingGroup,
        name: editName,
        classroom: editRoom || undefined,
        building: editBuilding || undefined,
        jefe_nocuenta: editJefe || undefined
      };

      await gruposService.update(editingGroup.id!, grupoActualizado);
      const gruposActualizados = await gruposService.getAll();
      setGrupos(gruposActualizados);
      setSuccess('Grupo actualizado exitosamente');
      handleCloseEdit();
    } catch (err: any) {
      setError('Error al actualizar grupo: ' + err.message);
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
      <Typography variant="h4" gutterBottom>
        Gestión de Grupos
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Grupos Existentes
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Aula</TableCell>
                    <TableCell>Edificio</TableCell>
                    <TableCell>Jefe de Grupo</TableCell>
                    <TableCell>Editar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grupos.map((grupo) => (
                    <TableRow key={grupo.id}>
                      <TableCell>{grupo.name}</TableCell>
                      <TableCell>{grupo.classroom || '-'}</TableCell>
                      <TableCell>{grupo.building || '-'}</TableCell>
                      <TableCell>{grupo.jefe_nocuenta || '-'}</TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => handleEditClick(grupo)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Agregar Nuevo Grupo
            </Typography>
            
            <TextField
              fullWidth
              label="Nombre del Grupo"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Aula"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              margin="normal"
              placeholder="Ejemplo: 301"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Edificio</InputLabel>
              <Select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                label="Edificio"
              >
                <MenuItem value="">
                  <em>Ninguno</em>
                </MenuItem>
                {edificios.map((edificio) => (
                  <MenuItem key={edificio} value={edificio}>
                    {edificio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Jefe de Grupo</InputLabel>
              <Select
                value={selectedJefe}
                onChange={(e) => setSelectedJefe(e.target.value)}
                label="Jefe de Grupo"
              >
                <MenuItem value="">
                  <em>Ninguno</em>
                </MenuItem>
                {jefes.map((jefe) => (
                  <MenuItem key={jefe.id} value={jefe.numero_cuenta || ''}>
                    {jefe.name} - {jefe.numero_cuenta}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              fullWidth
              variant="contained"
              onClick={handleAddGroup}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Agregar Grupo
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={!!editingGroup} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Grupo</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre del Grupo"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Aula"
            value={editRoom}
            onChange={(e) => setEditRoom(e.target.value)}
            margin="normal"
            placeholder="Ejemplo: 301"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Edificio</InputLabel>
            <Select
              value={editBuilding}
              onChange={(e) => setEditBuilding(e.target.value)}
              label="Edificio"
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {edificios.map((edificio) => (
                <MenuItem key={edificio} value={edificio}>
                  {edificio}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Jefe de Grupo</InputLabel>
            <Select
              value={editJefe}
              onChange={(e) => setEditJefe(e.target.value)}
              label="Jefe de Grupo"
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {jefes.map((jefe) => (
                <MenuItem key={jefe.id} value={jefe.numero_cuenta}>
                  {jefe.name} - {jefe.numero_cuenta}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancelar</Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
            disabled={loading}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}