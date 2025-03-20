import { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Paper,
  SelectChangeEvent,
  Grid
} from '@mui/material';

export default function TemarioPage() {
  const [semester, setSemester] = useState('1er semestre');
  const [subject, setSubject] = useState('NTIC');
  const [file, setFile] = useState<File | null>(null);

  const handleSemesterChange = (event: SelectChangeEvent) => {
    setSemester(event.target.value as string);
  };

  const handleSubjectChange = (event: SelectChangeEvent) => {
    setSubject(event.target.value as string);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  return (
    <Box sx={{ p: 4, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" sx={{ mr: 1 }}>Editar</Button>
        <Button variant="outlined">Agregar</Button>
      </Box>

      <Paper elevation={2} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
          Seleccione el semestre al que pertenece la materia
        </Typography>

        <FormControl fullWidth sx={{ mb: 4 }}>
          <Select
            value={semester}
            onChange={handleSemesterChange}
          >
            <MenuItem value="1er semestre">1er semestre</MenuItem>
            <MenuItem value="2do semestre">2do semestre</MenuItem>
            <MenuItem value="3er semestre">3er semestre</MenuItem>
            <MenuItem value="4to semestre">4to semestre</MenuItem>
            <MenuItem value="5to semestre">5to semestre</MenuItem>
            <MenuItem value="6to semestre">6to semestre</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
          Seleccione la materia a la que quiera ver o editar el temario
        </Typography>

        <FormControl fullWidth sx={{ mb: 4 }}>
          <Select
            value={subject}
            onChange={handleSubjectChange}
          >
            <MenuItem value="NTIC">NTIC</MenuItem>
            <MenuItem value="Matemáticas">Matemáticas</MenuItem>
            <MenuItem value="Física">Física</MenuItem>
            <MenuItem value="Química">Química</MenuItem>
            <MenuItem value="Programación">Programación</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ mb: 3 }}>
          <input
            accept="application/pdf"
            style={{ display: 'none' }}
            id="contained-button-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="contained-button-file">
            <Box 
              component="div"
              sx={{ 
                border: '1px solid #ccc', 
                p: 2, 
                borderRadius: 1, 
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              {file ? file.name : "Choose File"}
            </Box>
          </label>
        </Box>

        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item>
            <Button 
              variant="outlined" 
              color="error"
            >
              Eliminar
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary"
            >
              Ver
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
} 