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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  SelectChangeEvent,
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import { gruposService, materiasService, usuariosService, horariosService, Grupo, Materia, Usuario, HorarioMaestro } from '../services/supabaseService';

// Estructura para los datos del horario
interface HorarioData {
  dia: string;
  hora: string;
  materia: string;
  maestro: string;
  asistencia: boolean;
  horarioId?: number;
}

// Horas y días para el horario
const HORAS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
               '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// Función para mostrar la hora en formato legible
const formatHora = (hora: string) => {
  return `${hora} - ${parseInt(hora.split(':')[0]) + 1}:00`;
};

export default function HorarioPage() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedGrupo, setSelectedGrupo] = useState<string>('');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [horarioData, setHorarioData] = useState<Map<string, HorarioData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [maestros, setMaestros] = useState<Usuario[]>([]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGrupoChange = (event: SelectChangeEvent) => {
    setSelectedGrupo(event.target.value);
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  // Cargar los grupos al iniciar
  useEffect(() => {
    const fetchGrupos = async () => {
      setLoading(true);
      try {
        const data = await gruposService.getAll();
        setGrupos(data);
      } catch (err: any) {
        setError('Error al cargar grupos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchMaterias = async () => {
      try {
        const data = await materiasService.getAll();
        setMaterias(data);
      } catch (err: any) {
        setError('Error al cargar materias: ' + err.message);
      }
    };

    const fetchMaestros = async () => {
      try {
        const data = await usuariosService.getAll();
        // Filtrar solo maestros
        const maestrosData = data.filter(u => u.role === 'Maestro');
        setMaestros(maestrosData);
      } catch (err: any) {
        setError('Error al cargar maestros: ' + err.message);
      }
    };

    fetchGrupos();
    fetchMaterias();
    fetchMaestros();
  }, []);

  // Cargar el horario cuando se selecciona un grupo
  useEffect(() => {
    if (!selectedGrupo) return;

    const fetchHorario = async () => {
      setLoading(true);
      try {
        const data = await horariosService.getAll();
        
        // Filtrar los horarios del grupo seleccionado
        const horarios = data.filter((h: HorarioMaestro) => h.grupo_id === Number(selectedGrupo));
        
        // Crear el mapa de horarios
        const horarioMap = new Map<string, HorarioData>();
        
        // Log para depuración
        console.log("Horarios del grupo:", horarios);
        console.log("Materias disponibles:", materias);
        console.log("Maestros disponibles:", maestros);
        
        // Inicializar todas las celdas del horario
        DIAS.forEach(dia => {
          HORAS.forEach(hora => {
            const key = `${dia}-${hora}`;
            horarioMap.set(key, {
              dia,
              hora,
              materia: '',
              maestro: '',
              asistencia: false
            });
          });
        });
        
        // Llenar con los datos existentes
        horarios.forEach((horario: HorarioMaestro) => {
          const materia = materias.find(m => m.id === horario.materia_id);
          const maestro = maestros.find(m => m.id === horario.maestro_id);
          
          console.log(`Procesando horario: Día=${horario.dia}, Hora=${horario.hora}, Materia ID=${horario.materia_id}, Maestro ID=${horario.maestro_id}`);
          console.log(`Materia encontrada:`, materia);
          console.log(`Maestro encontrado:`, maestro);
          
          if (materia && maestro && horario.dia && horario.hora) {
            const key = `${horario.dia}-${horario.hora}`;
            console.log(`Agregando horario a la celda ${key}`);
            
            horarioMap.set(key, {
              dia: horario.dia,
              hora: horario.hora,
              materia: materia.name || '',
              maestro: maestro.name,
              asistencia: horario.asistencia || false,
              horarioId: horario.id
            });
          } else {
            console.warn(`No se pudo asociar el horario: 
              Materia: ${materia ? 'Sí' : 'No'}, 
              Maestro: ${maestro ? 'Sí' : 'No'}, 
              Día: ${horario.dia ? 'Sí' : 'No'}, 
              Hora: ${horario.hora ? 'Sí' : 'No'}`);
          }
        });
        
        // Log del mapa final
        console.log("Mapa de horarios final:");
        horarioMap.forEach((value, key) => {
          if (value.materia) {
            console.log(`${key}: ${value.materia} - ${value.maestro} (${value.asistencia ? 'Presente' : 'Ausente'})`);
          }
        });
        
        setHorarioData(horarioMap);
        setSuccess('Horario cargado correctamente');
      } catch (err: any) {
        console.error("Error cargando horarios:", err);
        setError('Error al cargar horario: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHorario();
  }, [selectedGrupo, materias, maestros]);

  const handleToggleAsistencia = async (dia: string, hora: string) => {
    const key = `${dia}-${hora}`;
    const horario = horarioData.get(key);
    
    if (!horario || !horario.horarioId) return;
    
    setLoading(true);
    try {
      const updatedHorario: Partial<HorarioMaestro> = {
        asistencia: !horario.asistencia
      };
      
      await horariosService.update(horario.horarioId, updatedHorario);
      
      // Actualizar el estado local
      const newHorarioData = new Map(horarioData);
      newHorarioData.set(key, {
        ...horario,
        asistencia: !horario.asistencia
      });
      
      setHorarioData(newHorarioData);
      setSuccess('Asistencia actualizada correctamente');
    } catch (err: any) {
      setError('Error al actualizar asistencia: ' + err.message);
    } finally {
      setLoading(false);
    }
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
          <Tab label="Ver" />
          <Tab label="Agregar" component={Link} to="/admin/horario/add" />
        </Tabs>
      </Paper>

      <Typography variant="h4" gutterBottom align="center">
        Horario de Clases
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Grupo</InputLabel>
            <Select
              value={selectedGrupo}
              label="Grupo"
              onChange={handleGrupoChange}
              disabled={loading}
            >
              {grupos.map((grupo) => (
                <MenuItem key={grupo.id} value={grupo.id?.toString() || ''}>
                  {grupo.name} - {grupo.classroom} ({grupo.building})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {selectedGrupo && !loading && (
        <>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Hora</TableCell>
                  {DIAS.map((dia) => (
                    <TableCell key={dia} align="center" sx={{ fontWeight: 'bold', color: 'white' }}>{dia}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {HORAS.map((hora) => (
                  <TableRow key={hora} hover>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>{formatHora(hora)}</TableCell>
                    {DIAS.map((dia) => {
                      const key = `${dia}-${hora}`;
                      const celda = horarioData.get(key);
                      
                      return (
                        <TableCell 
                          key={key} 
                          align="center" 
                          sx={{ 
                            position: 'relative',
                            bgcolor: celda?.materia ? 'rgba(200, 230, 255, 0.2)' : 'inherit',
                            padding: '16px',
                            border: celda?.materia ? '1px solid #e0e0e0' : 'inherit'
                          }}
                        >
                          {celda?.materia ? (
                            <>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {celda.materia}
                              </Typography>
                              <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                {celda.maestro}
                              </Typography>
                              {celda.maestro && (
                                <Button
                                  variant={celda.asistencia ? "contained" : "outlined"}
                                  color={celda.asistencia ? "success" : "error"}
                                  size="small"
                                  onClick={() => handleToggleAsistencia(dia, hora)}
                                  sx={{ mt: 1 }}
                                >
                                  {celda.asistencia ? "Presente" : "Ausente"}
                                </Button>
                              )}
                            </>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              Sin clase
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Estadísticas
            </Typography>
            <Typography variant="body2">
              {
                (() => {
                  let total = 0;
                  let presentes = 0;
                  
                  horarioData.forEach(celda => {
                    if (celda.materia) {
                      total++;
                      if (celda.asistencia) presentes++;
                    }
                  });
                  
                  return `Clases totales: ${total}, Asistencias: ${presentes}, Ausencias: ${total - presentes}`;
                })()
              }
            </Typography>
          </Box>
        </>
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