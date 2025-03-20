import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  TextField,
  CircularProgress
} from '@mui/material';
import { materiasService, carrerasService, Materia, Carrera } from '../services/supabaseService';

export default function MateriasPage() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [newSubject, setNewSubject] = useState('');
  const [selectedCarrera, setSelectedCarrera] = useState<string>('');
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar carreras
        const carrerasData = await carrerasService.getAll();
        setCarreras(carrerasData);
        
        if (carrerasData.length > 0) {
          setSelectedCarrera(carrerasData[0].id?.toString() || '');
        }
        
        // Cargar materias por semestre
        await loadMateriasBySemestre(selectedSemester);
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadMateriasBySemestre = async (semestre: string) => {
    try {
      const materiasData = await materiasService.getBySemestre(Number(semestre));
      setMaterias(materiasData);
      
      if (materiasData.length > 0) {
        setSelectedSubject(materiasData[0].id?.toString() || '');
      } else {
        setSelectedSubject('');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar materias por semestre');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSemesterChange = async (event: SelectChangeEvent) => {
    const semestre = event.target.value;
    setSelectedSemester(semestre);
    await loadMateriasBySemestre(semestre);
  };

  const handleSubjectChange = (event: SelectChangeEvent) => {
    setSelectedSubject(event.target.value);
  };

  const handleCarreraChange = (event: SelectChangeEvent) => {
    setSelectedCarrera(event.target.value);
  };

  const handleSave = async () => {
    if (!selectedSubject) {
      setError('Debe seleccionar una materia');
      return;
    }

    setLoading(true);
    try {
      const materiaId = Number(selectedSubject);
      const materia = materias.find(m => m.id === materiaId);
      
      if (!materia) {
        throw new Error('Materia no encontrada');
      }
      
      await materiasService.update(materiaId, {
        semestre: Number(selectedSemester),
        carrera_id: selectedCarrera ? Number(selectedCarrera) : 1
      });
      
      setSuccess('Materia actualizada correctamente');
      await loadMateriasBySemestre(selectedSemester);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la materia');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSubject) {
      setError('Debe seleccionar una materia');
      return;
    }

    setLoading(true);
    try {
      await materiasService.delete(Number(selectedSubject));
      setSuccess('Materia eliminada correctamente');
      await loadMateriasBySemestre(selectedSemester);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la materia');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMateria = async () => {
    if (!newSubject) {
      setError('Debe ingresar un nombre para la materia');
      return;
    }

    if (!selectedSemester) {
      setError('Debe seleccionar un semestre');
      return;
    }

    setLoading(true);
    try {
      await materiasService.create({
        name: newSubject,
        semestre: Number(selectedSemester),
        carrera_id: selectedCarrera ? Number(selectedCarrera) : 1
      });
      
      setSuccess('Materia agregada correctamente');
      setNewSubject('');
      await loadMateriasBySemestre(selectedSemester);
    } catch (err: any) {
      setError(err.message || 'Error al agregar la materia');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  // Generar opciones para los semestres (1-9)
  const semestres = Array.from({ length: 9 }, (_, i) => (i + 1).toString());

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
          <Tab label="Agregar" />
        </Tabs>
      </Paper>

      {tabValue === 0 ? (
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
            Seleccione el semestre al que pertenece la materia
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Semestre</InputLabel>
            <Select
              value={selectedSemester}
              label="Semestre"
              onChange={handleSemesterChange}
            >
              {semestres.map((semestre) => (
                <MenuItem key={semestre} value={semestre}>
                  {semestre}° semestre
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h5" gutterBottom align="center" sx={{ mt: 4, mb: 3 }}>
            Seleccione la materia que desea editar
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Materia</InputLabel>
            <Select
              value={selectedSubject}
              label="Materia"
              onChange={handleSubjectChange}
              disabled={materias.length === 0}
            >
              {materias.map((materia) => (
                <MenuItem key={materia.id} value={materia.id?.toString()}>
                  {materia.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Carrera</InputLabel>
            <Select
              value={selectedCarrera}
              label="Carrera"
              onChange={handleCarreraChange}
              disabled={carreras.length === 0}
            >
              {carreras.map((carrera) => (
                <MenuItem key={carrera.id} value={carrera.id?.toString()}>
                  {carrera.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container justifyContent="flex-end" spacing={2} sx={{ mt: 4 }}>
            <Grid item>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={selectedSubject === '' || loading}
              >
                Eliminar
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={selectedSubject === '' || loading}
              >
                Guardar
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
            Agregar nueva materia
          </Typography>

          <TextField
            fullWidth
            margin="normal"
            label="Nombre de la materia"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Semestre</InputLabel>
            <Select
              value={selectedSemester}
              label="Semestre"
              onChange={handleSemesterChange}
            >
              {semestres.map((semestre) => (
                <MenuItem key={semestre} value={semestre}>
                  {semestre}° semestre
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Carrera</InputLabel>
            <Select
              value={selectedCarrera}
              label="Carrera"
              onChange={handleCarreraChange}
              disabled={carreras.length === 0}
            >
              {carreras.map((carrera) => (
                <MenuItem key={carrera.id} value={carrera.id?.toString()}>
                  {carrera.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            onClick={handleAddMateria}
            disabled={!newSubject || loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Agregar materia'}
          </Button>
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