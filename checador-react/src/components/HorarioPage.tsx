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
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
  alpha,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import { gruposService, materiasService, usuariosService, horariosService, carrerasService, Grupo, Materia, Usuario, HorarioMaestro, Carrera } from '../services/supabaseService';

// Custom theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5', // Indigo
      light: '#757de8',
      dark: '#002984',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057', // Pink
      light: '#ff5983',
      dark: '#bb002f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1E1E1E',   // Dark paper background
    },
    text: {
      primary: '#FFFFFF',  // White text for dark mode
      secondary: '#B0B0B0', // Light gray for secondary text
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
    h4: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          backgroundColor: '#1E1E1E',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
        },
        head: {
          fontWeight: 700,
          color: '#FFFFFF',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s',
            '&:hover': {
              boxShadow: '0 0 0 2px rgba(121, 134, 203, 0.3)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(121, 134, 203, 0.4)',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          padding: '14px 16px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(121, 134, 203, 0.2)',
          },
          '&:hover': {
            backgroundColor: 'rgba(121, 134, 203, 0.1)',
          },
        },
      },
    },
  },
});

// Estructura para los datos del horario
interface HorarioData {
  dia: string;
  hora: string;
  materia: string;
  maestro: string;
  asistencia: boolean;
  horarioId?: number;
  aula?: string;
  edificio?: string;
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
  const [selectedCarreraFilter, setSelectedCarreraFilter] = useState<string>('');
  const [selectedGrupo, setSelectedGrupo] = useState<string>('');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [horarioData, setHorarioData] = useState<Map<string, HorarioData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [maestros, setMaestros] = useState<Usuario[]>([]);
  const [selectedMaestro, setSelectedMaestro] = useState<string>('');
  const [horarios, setHorarios] = useState<HorarioMaestro[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);

  const handleChangeGrupo = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrupo(event.target.value);
    setSelectedMaestro('');
  };

  const handleChangeMaestro = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMaestro(event.target.value);
    setSelectedGrupo('');
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

    const fetchData = async () => {
      setLoading(true);
      try {
        const [usuariosData, materiasData, horariosData, carrerasData] = await Promise.all([
          usuariosService.getAll(),
          materiasService.getAll(),
          horariosService.getAll(),
          carrerasService.getAll()
        ]);

        const maestrosData = usuariosData.filter(usuario => usuario.role === 'Maestro');
        setMaestros(maestrosData);
        setMaterias(materiasData);
        setHorarios(horariosData);
        setCarreras(carrerasData);
        console.log("Horarios cargados:", horariosData);
      } catch (err: any) {
        console.error("Error al cargar datos:", err);
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchGrupos();
    fetchMaterias();
    fetchMaestros();
    fetchData();
  }, []);

  // Actualizar el useEffect para el grupo
  useEffect(() => {
    if (!selectedGrupo) return;

    const fetchHorarioGrupo = async () => {
      setLoading(true);
      try {
        const data = await horariosService.getAll();
        const horariosGrupo = data.filter(h => h.grupo_id.toString() === selectedGrupo);
        
        const horarioMap = new Map<string, HorarioData>();
        
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
        
        horariosGrupo.forEach((horario: HorarioMaestro) => {
          const materia = materias.find(m => m.id === horario.materia_id);
          const maestro = maestros.find(m => m.id === horario.maestro_id);
          const grupo = grupos.find(g => g.id === horario.grupo_id);
          
          if (materia && maestro && grupo && horario.dia && horario.hora) {
            const key = `${horario.dia}-${horario.hora}`;
            horarioMap.set(key, {
              dia: horario.dia,
              hora: horario.hora,
              materia: materia.name,
              maestro: maestro.name,
              asistencia: horario.asistencia || false,
              horarioId: horario.id,
              aula: grupo.classroom,
              edificio: grupo.building
            });
          }
        });
        
        setHorarioData(horarioMap);
        setSuccess('Horario del grupo cargado correctamente');
      } catch (err: any) {
        console.error("Error cargando horarios del grupo:", err);
        setError('Error al cargar horario del grupo: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHorarioGrupo();
  }, [selectedGrupo, materias, maestros, grupos]);

  // Actualizar el useEffect para el maestro
  useEffect(() => {
    if (!selectedMaestro) return;

    const fetchHorarioMaestro = async () => {
      setLoading(true);
      try {
        const data = await horariosService.getAll();
        const horariosMaestro = data.filter(h => h.maestro_id.toString() === selectedMaestro);
        
        const horarioMap = new Map<string, HorarioData>();
        
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
        
        horariosMaestro.forEach((horario: HorarioMaestro) => {
          const materia = materias.find(m => m.id === horario.materia_id);
          const grupo = grupos.find(g => g.id === horario.grupo_id);
          
          if (materia && grupo && horario.dia && horario.hora) {
            const key = `${horario.dia}-${horario.hora}`;
            horarioMap.set(key, {
              dia: horario.dia,
              hora: horario.hora,
              materia: materia.name,
              maestro: grupo.name,
              asistencia: horario.asistencia || false,
              horarioId: horario.id,
              aula: grupo.classroom,
              edificio: grupo.building
            });
          }
        });
        
        setHorarioData(horarioMap);
        setSuccess('Horario del maestro cargado correctamente');
      } catch (err: any) {
        console.error("Error cargando horarios del maestro:", err);
        setError('Error al cargar horario del maestro: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHorarioMaestro();
  }, [selectedMaestro, materias, grupos]);

  // Limpiar horarioData cuando se cambia de selección
  useEffect(() => {
    if (selectedGrupo) {
      setSelectedMaestro('');
    } else if (selectedMaestro) {
      setSelectedGrupo('');
    }
    setHorarioData(new Map());
  }, [selectedGrupo, selectedMaestro]);

  // Filtrar horarios por maestro
  const filteredHorarios = selectedMaestro
    ? horarios.filter(horario => horario.maestro_id.toString() === selectedMaestro)
    : [];

  // Función para obtener el nombre de la materia
  const getMateriaNombre = (materiaId: number) => {
    const materia = materias.find(m => m.id === materiaId);
    return materia ? materia.name : 'Materia no encontrada';
  };

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

  // Función para obtener el rango de horas necesarias
  const getHorasNecesarias = (horarioMap: Map<string, HorarioData>): string[] => {
    let horasConClase = new Set<string>();
    
    // Recolectar todas las horas que tienen clases
    horarioMap.forEach((value) => {
      if (value.materia) {
        horasConClase.add(value.hora);
      }
    });

    // Convertir a array y ordenar
    const horasOrdenadas = Array.from(horasConClase).sort((a, b) => {
      return parseInt(a.split(':')[0]) - parseInt(b.split(':')[0]);
    });

    if (horasOrdenadas.length === 0) return HORAS;

    // Obtener la primera y última hora
    const primeraHora = parseInt(horasOrdenadas[0].split(':')[0]);
    const ultimaHora = parseInt(horasOrdenadas[horasOrdenadas.length - 1].split(':')[0]);

    // Crear array con el rango completo de horas
    return HORAS.filter(hora => {
      const horaActual = parseInt(hora.split(':')[0]);
      return horaActual >= primeraHora && horaActual <= ultimaHora;
    });
  };

  // Función para obtener grupos filtrados por carrera
  const getGruposFiltrados = () => {
    if (!selectedCarreraFilter) return [];
    return grupos.filter(grupo => grupo.carrera_id?.toString() === selectedCarreraFilter);
  };

  // Modificar el useEffect para limpiar la selección de grupo cuando cambia la carrera
  useEffect(() => {
    setSelectedGrupo('');
  }, [selectedCarreraFilter]);

  // Modificar renderHorarioTable para usar nuevos estilos
  const renderHorarioTable = () => {
    // Obtener el grupo seleccionado para mostrar su información
    const grupoSeleccionado = selectedGrupo ? grupos.find(g => g.id?.toString() === selectedGrupo) : null;

    return (
      <TableContainer 
        component={Paper} 
        sx={{ 
          mb: 4,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'background.paper',
        }}
      >
        {/* Agregar encabezado con información del grupo si estamos en vista de grupo */}
        {selectedGrupo && grupoSeleccionado && (
          <Box sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}>
            <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
              Aula: {grupoSeleccionado.classroom} - Edificio: {grupoSeleccionado.building}
            </Typography>
          </Box>
        )}
        
        <Table>
          <TableHead>
            <TableRow sx={{ 
              backgroundImage: 'linear-gradient(to right, #3f51b5, #757de8)', 
            }}>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                color: 'white',
                borderBottom: 'none',
              }}>Hora</TableCell>
              {DIAS.map((dia) => (
                <TableCell 
                  key={dia} 
                  align="center" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: 'white',
                    borderBottom: 'none',
                  }}
                >
                  {dia}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {getHorasNecesarias(horarioData).map((hora, index) => (
              <TableRow 
                key={hora} 
                hover 
                sx={{
                  backgroundColor: index % 2 === 0 ? 'rgba(121, 134, 203, 0.05)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(121, 134, 203, 0.1)',
                  }
                }}
              >
                <TableCell 
                  component="th" 
                  scope="row" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'primary.light',
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                  }}
                >
                  {formatHora(hora)}
                </TableCell>
                {DIAS.map((dia) => {
                  const key = `${dia}-${hora}`;
                  const celda = horarioData.get(key);
                  
                  return (
                    <TableCell 
                      key={key} 
                      align="center" 
                      sx={{ 
                        position: 'relative',
                        bgcolor: celda?.materia ? 'rgba(121, 134, 203, 0.15)' : 'inherit',
                        padding: '16px',
                        border: celda?.materia ? `1px solid rgba(121, 134, 203, 0.3)` : 'inherit',
                        borderRadius: celda?.materia ? '6px' : '0',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: celda?.materia ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                        }
                      }}
                    >
                      {celda?.materia ? (
                        <>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 'bold', 
                            color: 'primary.light',
                          }}>
                            {celda.materia}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ 
                            color: 'secondary.light',
                            fontWeight: 500,
                          }}>
                            {celda.maestro}
                          </Typography>
                          {/* Mostrar aula y edificio solo en vista de maestros */}
                          {selectedMaestro && (
                            <Typography variant="caption" display="block" sx={{
                              mt: 0.5,
                              p: 0.5,
                              bgcolor: 'rgba(30, 30, 30, 0.7)',
                              borderRadius: '4px',
                              color: 'text.secondary',
                            }}>
                              Aula: {celda.aula} - Edificio: {celda.edificio}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
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
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        p: 3, 
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            borderRadius: 2, 
            mb: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            align="center"
            sx={{ 
              mb: 4, 
              color: 'primary.dark',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '4px',
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '2px',
              }
            }}
          >
            Horario de Clases
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="carrera-label">Carrera</InputLabel>
                <Select
                  labelId="carrera-label"
                  value={selectedCarreraFilter}
                  label="Carrera"
                  onChange={(e) => setSelectedCarreraFilter(e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="">
                    <em>Seleccione una carrera</em>
                  </MenuItem>
                  {carreras.map((carrera) => (
                    <MenuItem key={carrera.id} value={carrera.id.toString()}>
                      {carrera.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="grupo-label">Grupo</InputLabel>
                <Select
                  labelId="grupo-label"
                  value={selectedGrupo}
                  label="Grupo"
                  onChange={handleChangeGrupo}
                  disabled={loading || !selectedCarreraFilter}
                >
                  <MenuItem value="">
                    <em>Seleccione un grupo</em>
                  </MenuItem>
                  {getGruposFiltrados().map((grupo) => (
                    <MenuItem key={grupo.id} value={grupo.id?.toString() || ''}>
                      {grupo.name} - {grupo.classroom} ({grupo.building})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="maestro-label">Seleccionar Maestro</InputLabel>
                <Select
                  labelId="maestro-label"
                  value={selectedMaestro}
                  label="Seleccionar Maestro"
                  onChange={handleChangeMaestro}
                >
                  <MenuItem value="">
                    <em>Seleccione un maestro</em>
                  </MenuItem>
                  {maestros.map((maestro) => (
                    <MenuItem key={maestro.id} value={maestro.id?.toString()}>
                      {maestro.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          )}

          {(selectedGrupo || selectedMaestro) && !loading && renderHorarioTable()}
        </Paper>

        {/* Alertas de éxito y error */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseAlert} 
            severity="error" 
            sx={{ 
              width: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        </Snackbar>

        <Snackbar 
          open={!!success} 
          autoHideDuration={6000} 
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseAlert} 
            severity="success" 
            sx={{ 
              width: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              borderRadius: 2,
            }}
          >
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}