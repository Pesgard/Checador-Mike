import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { supabase } from '../lib/supabase';
import { SelectChangeEvent } from '@mui/material';

interface HorarioData {
  dia: string;
  hora: string;
  materia: string;
  grupo: string;
  aula?: string;
  edificio?: string;
  asistencia: 'pendiente' | 'presente' | 'ausente';
  horarioId?: number;
}

interface Maestro {
  id: string;
  name: string;
}

const DIAS_COMPLETOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HORAS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

const formatHora = (hora: string) => {
  return hora;
};

export default function ChecadorHorarioPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [horarioData, setHorarioData] = useState<Map<string, HorarioData>>(new Map());
  const [diaActual, setDiaActual] = useState<string>('');
  const [horasNecesarias, setHorasNecesarias] = useState<string[]>([]);
  const [maestros, setMaestros] = useState<Maestro[]>([]);
  const [selectedMaestro, setSelectedMaestro] = useState<string>('todos');

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getToday = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  // Inicializar selectedDate con la fecha actual local
  const [selectedDate, setSelectedDate] = useState<string>(getToday());

  useEffect(() => {
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const diaSemana = selectedDateObj.getDay();
    const diaActualNombre = DIAS_COMPLETOS[diaSemana];
    
    setDiaActual(diaActualNombre);
    cargarHorarios(diaActualNombre, selectedDate);
  }, [selectedDate]);

  // Cargar lista de maestros
  useEffect(() => {
    const fetchMaestros = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, name')
          .eq('role', 'Maestro')
          .order('name');

        if (error) throw error;
        setMaestros(data || []);
      } catch (error: any) {
        console.error('Error al cargar maestros:', error);
        setError('Error al cargar lista de maestros');
      }
    };

    fetchMaestros();
  }, []);

  const cargarHorarios = async (dia: string, fecha: string) => {
    try {
      setLoading(true);

      // Obtener horarios
      let query = supabase
        .from('horario-maestro')
        .select(`
          id,
          hora,
          dia,
          materia:materias!inner(name),
          grupo:grupo!inner(name, classroom, building),
          maestro:usuarios!inner(id, name)
        `)
        .eq('dia', dia);

      if (selectedMaestro !== 'todos') {
        query = query.eq('maestro_id', selectedMaestro);
      }

      const { data: horarios, error: horariosError } = await query;

      if (horariosError) throw horariosError;

      // Obtener las asistencias registradas de la tabla asistencia_checador
      const { data: asistencias, error: asistenciasError } = await supabase
        .from('asistencia_checador')
        .select('*')
        .eq('fecha', fecha)
        .in('horario_id', horarios?.map(h => h.id) || []);

      if (asistenciasError) throw asistenciasError;

      // Calcular el rango de horas necesario
      if (horarios && horarios.length > 0) {
        const horas = horarios.map(h => h.hora);
        const horaMin = Math.min(...horas.map(h => parseInt(h.split(':')[0])));
        const horaMax = Math.max(...horas.map(h => parseInt(h.split(':')[0])));
        
        const horasRango = HORAS.filter(h => {
          const hora = parseInt(h.split(':')[0]);
          return hora >= horaMin && hora <= horaMax;
        });
        
        setHorasNecesarias(horasRango);
      } else {
        setHorasNecesarias([]);
      }

      const horarioMap = new Map<string, HorarioData>();

      // Inicializar el mapa con las horas necesarias
      horasNecesarias.forEach(hora => {
        const key = `${dia}-${hora}`;
        horarioMap.set(key, {
          dia,
          hora,
          materia: '',
          grupo: '',
          asistencia: 'pendiente'
        });
      });

      // Llenar el mapa con los horarios reales
      horarios?.forEach(horario => {
        const asistenciaHoy = asistencias?.find(a => a.horario_id === horario.id);
        const key = `${horario.dia}-${horario.hora}`;
        
        horarioMap.set(key, {
          dia: horario.dia,
          hora: horario.hora,
          materia: horario.materia.name,
          grupo: `${horario.grupo.name} - ${horario.maestro.name}`,
          aula: horario.grupo.classroom,
          edificio: horario.grupo.building,
          asistencia: asistenciaHoy?.asistencia || 'pendiente',
          horarioId: horario.id
        });
      });

      setHorarioData(horarioMap);
    } catch (error: any) {
      console.error('Error completo:', error);
      setError('Error al cargar horario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAsistencia = async (dia: string, hora: string, nuevoEstado: 'pendiente' | 'presente' | 'ausente') => {
    const key = `${dia}-${hora}`;
    const horario = horarioData.get(key);
    
    if (!horario?.horarioId) return;

    try {
      setLoading(true);
      
      // Buscar si ya existe un registro en asistencia_checador
      const { data: existingRecord, error: searchError } = await supabase
        .from('asistencia_checador')
        .select('*')
        .eq('horario_id', horario.horarioId)
        .eq('fecha', selectedDate)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
      }

      let updateError;
      if (existingRecord) {
        // Actualizar registro existente
        const { error } = await supabase
          .from('asistencia_checador')
          .update({ asistencia: nuevoEstado })
          .eq('id', existingRecord.id);
        updateError = error;
      } else {
        // Crear nuevo registro
        const { error } = await supabase
          .from('asistencia_checador')
          .insert({
            horario_id: horario.horarioId,
            fecha: selectedDate,
            asistencia: nuevoEstado
          });
        updateError = error;
      }

      if (updateError) throw updateError;

      const newHorarioData = new Map(horarioData);
      newHorarioData.set(key, {
        ...horario,
        asistencia: nuevoEstado
      });
      
      setHorarioData(newHorarioData);
      setSuccess(`Asistencia actualizada a: ${nuevoEstado}`);
    } catch (error: any) {
      setError('Error al actualizar asistencia: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  const handleHoyClick = () => {
    setSelectedDate(getToday());
  };

  // Manejar cambio de maestro seleccionado
  const handleMaestroChange = (event: SelectChangeEvent) => {
    setSelectedMaestro(event.target.value);
    cargarHorarios(diaActual, selectedDate);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Control de Asistencia
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center' }}>
        <TextField
          type="date"
          label="Seleccionar fecha"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ width: 200 }}
        />
        <Button 
          variant="contained" 
          onClick={handleHoyClick}
        >
          HOY
        </Button>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por Maestro</InputLabel>
          <Select
            value={selectedMaestro}
            onChange={handleMaestroChange}
            label="Filtrar por Maestro"
          >
            <MenuItem value="todos">Todos los maestros</MenuItem>
            {maestros.map((maestro) => (
              <MenuItem key={maestro.id} value={maestro.id}>
                {maestro.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ maxWidth: '100%', overflow: 'auto' }}>
          <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                    Hora
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                    {diaActual}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {horasNecesarias.map((hora) => {
                  const key = `${diaActual}-${hora}`;
                  const horario = horarioData.get(key);
                  
                  return (
                    <TableRow key={hora} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {formatHora(hora)}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: horario?.materia ? 'rgba(200, 230, 255, 0.2)' : 'inherit',
                          border: '1px solid rgba(224, 224, 224, 1)'
                        }}
                      >
                        {horario?.materia ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {horario.materia}
                            </Typography>
                            <Typography variant="caption">
                              {horario.grupo}
                            </Typography>
                            {horario.aula && (
                              <Typography variant="caption" color="text.secondary">
                                Aula: {horario.aula}
                                {horario.edificio && ` - Edificio: ${horario.edificio}`}
                              </Typography>
                            )}
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: horario.asistencia === 'presente' ? 'success.main' : 
                                      horario.asistencia === 'ausente' ? 'error.main' : 
                                      'warning.main',
                                fontWeight: 'bold'
                              }}
                            >
                              Estado: {horario.asistencia.charAt(0).toUpperCase() + horario.asistencia.slice(1)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                              <Button
                                size="small"
                                variant={horario.asistencia === 'presente' ? "contained" : "outlined"}
                                onClick={() => handleToggleAsistencia(diaActual, hora, 'presente')}
                                color="success"
                              >
                                Presente
                              </Button>
                              <Button
                                size="small"
                                variant={horario.asistencia === 'ausente' ? "contained" : "outlined"}
                                onClick={() => handleToggleAsistencia(diaActual, hora, 'ausente')}
                                color="error"
                              >
                                Ausente
                              </Button>
                              <Button
                                size="small"
                                variant={horario.asistencia === 'pendiente' ? "contained" : "outlined"}
                                onClick={() => handleToggleAsistencia(diaActual, hora, 'pendiente')}
                                color="warning"
                              >
                                Pendiente
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            Sin clase
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

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