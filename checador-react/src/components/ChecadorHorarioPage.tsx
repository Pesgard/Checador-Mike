import { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  SelectChangeEvent,
  Paper
} from '@mui/material';

export default function ChecadorHorarioPage() {
  // Mismo código que JefeHorarioPage pero con título diferente
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Checador de Asistencia
      </Typography>
      
      {/* Resto del código igual que JefeHorarioPage */}
    </Box>
  );
} 