import { supabase } from '../lib/supabase';

// Interfaces para los tipos de datos
export interface Usuario {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: 'Alumno' | 'Jefe de grupo' | 'Coordinador' | 'Maestro' | 'Administrador';
  numero_cuenta?: string;
}

export interface Grupo {
  id?: number;
  name: string;
  classroom: string;
  building: string;
}

export interface Materia {
  id?: number;
  name: string;
  semestre: number;
  carrera_id: number;
}

export interface Carrera {
  id?: number;
  nombre: string;
  semestres: number;
}

export interface HorarioMaestro {
  id?: number;
  maestro_id: number;
  materia_id: number;
  grupo_id: number;
  dia: string;
  hora: string;
  asistencia: boolean;
}

// Servicios CRUD para usuarios
export const usuariosService = {
  async getAll(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data as Usuario[];
  },

  async getById(id: number): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data as Usuario;
  },

  async create(usuario: Usuario): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        name: usuario.name,
        email: usuario.email,
        password: usuario.password,
        role: usuario.role,
        numero_cuenta: usuario.numero_cuenta
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as Usuario;
  },

  async update(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .update(usuario)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as Usuario;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }
};

// Servicios CRUD para grupos
export const gruposService = {
  async getAll(): Promise<Grupo[]> {
    const { data, error } = await supabase
      .from('grupo')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data as Grupo[];
  },

  async getById(id: number): Promise<Grupo | null> {
    const { data, error } = await supabase
      .from('grupo')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data as Grupo;
  },

  async create(grupo: Grupo): Promise<Grupo> {
    const { data, error } = await supabase
      .from('grupo')
      .insert(grupo)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as Grupo;
  },

  async update(id: number, grupo: Partial<Grupo>): Promise<Grupo> {
    const { data, error } = await supabase
      .from('grupo')
      .update(grupo)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as Grupo;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('grupo')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  },

  async getClassrooms(): Promise<string[]> {
    const { data, error } = await supabase
      .from('grupo')
      .select('classroom');
    
    if (error) throw new Error(error.message);
    
    // Obtener valores únicos
    const classrooms = data.map(item => item.classroom);
    return [...new Set(classrooms)];
  },

  async getBuildings(): Promise<string[]> {
    const { data, error } = await supabase
      .from('grupo')
      .select('building');
    
    if (error) throw new Error(error.message);
    
    // Obtener valores únicos
    const buildings = data.map(item => item.building);
    return [...new Set(buildings)];
  }
};

// Servicios CRUD para materias
export const materiasService = {
  async getAll(): Promise<Materia[]> {
    const { data, error } = await supabase
      .from('materias')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data as Materia[];
  },

  async getBySemestre(semestre: number): Promise<Materia[]> {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .eq('semestre', semestre);
    
    if (error) throw new Error(error.message);
    return data as Materia[];
  },

  async getByCarrera(carreraId: number): Promise<Materia[]> {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .eq('carrera_id', carreraId);
    
    if (error) throw new Error(error.message);
    return data as Materia[];
  },

  async getBySemestreAndCarrera(semestre: number, carreraId: number): Promise<Materia[]> {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .eq('semestre', semestre)
      .eq('carrera_id', carreraId);
    
    if (error) throw new Error(error.message);
    return data as Materia[];
  },

  async getById(id: number): Promise<Materia | null> {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data as Materia;
  },

  async create(materia: Materia): Promise<Materia> {
    const { data, error } = await supabase
      .from('materias')
      .insert(materia)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as Materia;
  },

  async update(id: number, materia: Partial<Materia>): Promise<Materia> {
    const { data, error } = await supabase
      .from('materias')
      .update(materia)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as Materia;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('materias')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }
};

// Servicios CRUD para carreras
export const carrerasService = {
  async getAll(): Promise<Carrera[]> {
    const { data, error } = await supabase
      .from('carreras')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data as Carrera[];
  },

  async getById(id: number): Promise<Carrera | null> {
    const { data, error } = await supabase
      .from('carreras')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data as Carrera;
  },

  async create(carrera: Carrera): Promise<Carrera> {
    const { data, error } = await supabase
      .from('carreras')
      .insert(carrera)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as Carrera;
  },

  async update(id: number, carrera: Partial<Carrera>): Promise<Carrera> {
    const { data, error } = await supabase
      .from('carreras')
      .update(carrera)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as Carrera;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('carreras')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }
};

// Servicios CRUD para horarios de maestros
export const horariosService = {
  async getAll(): Promise<HorarioMaestro[]> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data as HorarioMaestro[];
  },

  async getById(id: number): Promise<HorarioMaestro | null> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data as HorarioMaestro;
  },

  async getByMaestro(maestroId: number): Promise<HorarioMaestro[]> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .select('*')
      .eq('maestro_id', maestroId);
    
    if (error) throw new Error(error.message);
    return data as HorarioMaestro[];
  },

  async getByGrupo(grupoId: number): Promise<HorarioMaestro[]> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .select('*')
      .eq('grupo_id', grupoId);
    
    if (error) throw new Error(error.message);
    return data as HorarioMaestro[];
  },

  async create(horario: HorarioMaestro): Promise<HorarioMaestro> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .insert(horario)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as HorarioMaestro;
  },

  async update(id: number, horario: Partial<HorarioMaestro>): Promise<HorarioMaestro> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .update(horario)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as HorarioMaestro;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('horario-maestro')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  },
  
  async registrarAsistencia(id: number, asistio: boolean): Promise<HorarioMaestro> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .update({ asistencia: asistio })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as HorarioMaestro;
  }
}; 