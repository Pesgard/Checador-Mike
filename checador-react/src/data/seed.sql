-- Datos de ejemplo para carreras
INSERT INTO carreras (nombre, semestres) VALUES
('Ingeniería en Sistemas Computacionales', 9),
('Ingeniería Industrial', 9),
('Ingeniería Mecatrónica', 9),
('Ingeniería Civil', 9),
('Ingeniería Química', 9);

-- Datos de ejemplo para edificios
INSERT INTO edificios (facultad, nombre) VALUES
('Ingeniería', 'Edificio A'),
('Ingeniería', 'Edificio B'),
('Ingeniería', 'Edificio C'),
('Ingeniería', 'Edificio D'),
('Ingeniería', 'Edificio E');

-- Datos de ejemplo para usuarios (maestros)
INSERT INTO usuarios (name, email, password, role) VALUES
('Dr. Juan Pérez', 'juan.perez@example.com', 'password123', 'Maestro'),
('Dra. María García', 'maria.garcia@example.com', 'password123', 'Maestro'),
('Dr. Carlos López', 'carlos.lopez@example.com', 'password123', 'Maestro'),
('Dra. Ana Martínez', 'ana.martinez@example.com', 'password123', 'Maestro'),
('Dr. Roberto Sánchez', 'roberto.sanchez@example.com', 'password123', 'Maestro');

-- Datos de ejemplo para usuarios (alumnos)
INSERT INTO usuarios (name, email, password, role, numero_cuenta) VALUES
('Luis Hernández', 'luis.hernandez@example.com', 'password123', 'Alumno', '2023001'),
('Laura Torres', 'laura.torres@example.com', 'password123', 'Alumno', '2023002'),
('Miguel Rodríguez', 'miguel.rodriguez@example.com', 'password123', 'Alumno', '2023003'),
('Sofía Vargas', 'sofia.vargas@example.com', 'password123', 'Alumno', '2023004'),
('Diego Morales', 'diego.morales@example.com', 'password123', 'Alumno', '2023005');

-- Datos de ejemplo para grupos
INSERT INTO grupo (name, classroom, building, jefe_nocuenta, carrera_id) VALUES
('ISC-1A', 'A101', 'Edificio A', '2023001', 1),
('ISC-1B', 'A102', 'Edificio A', '2023002', 1),
('IND-1A', 'B101', 'Edificio B', '2023003', 2),
('IMT-1A', 'C101', 'Edificio C', '2023004', 3),
('ICV-1A', 'D101', 'Edificio D', '2023005', 4);

-- Datos de ejemplo para materias
INSERT INTO materias (name, semestre, carrera_id) VALUES
('Programación I', 1, 1),
('Cálculo Diferencial', 1, 1),
('Física I', 1, 1),
('Programación II', 2, 1),
('Cálculo Integral', 2, 1),
('Física II', 2, 1),
('Estructuras de Datos', 3, 1),
('Bases de Datos', 3, 1),
('Sistemas Operativos', 4, 1),
('Redes de Computadoras', 4, 1);

-- Datos de ejemplo para horarios de maestros
INSERT INTO "horario-maestro" (maestro_id, materia_id, grupo_id, dia, hora, asistencia) VALUES
(1, 1, 1, 'Lunes', '07:00-09:00', true),
(1, 2, 1, 'Martes', '07:00-09:00', true),
(2, 3, 1, 'Miércoles', '07:00-09:00', true),
(2, 4, 2, 'Jueves', '07:00-09:00', true),
(3, 5, 2, 'Viernes', '07:00-09:00', true);

-- Datos de ejemplo para asistencias
INSERT INTO asistencias (horario_id, fecha, asistencia) VALUES
(1, '2024-03-18', 'Asistió'),
(1, '2024-03-19', 'Retardo'),
(2, '2024-03-18', 'Asistió'),
(2, '2024-03-19', 'Falta'),
(3, '2024-03-18', 'Asistió'); 