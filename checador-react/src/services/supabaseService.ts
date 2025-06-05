import { supabase } from '../lib/supabase';

export type UserRole = 
  | 'Alumno' 
  | 'Jefe_de_Grupo' 
  | 'Checador'
  | 'Maestro' 
  | 'Administrador';

export interface Usuario {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  numero_cuenta?: string;
}

export interface Grupo {
  id?: number;
  name: string;
  classroom?: string;
  building?: string;
  jefe_nocuenta?: string;
  carrera_id?: number;
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
  semestres?: number;
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

export interface Edificio {
  id?: number;
  facultad: string;
  nombre?: string;
}

export interface Asistencia {
  id: number;
  horario_id: number;
  fecha: string;
  asistencia: 'Asistió' | 'Falta' | 'Retardo';
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
      .insert({
        name: grupo.name,
        classroom: grupo.classroom,
        building: grupo.building,
        jefe_nocuenta: grupo.jefe_nocuenta,
        carrera_id: grupo.carrera_id
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as Grupo;
  },

  async update(id: number, grupo: Grupo): Promise<Grupo> {
    console.log('Datos recibidos para actualizar:', grupo);
    
    const updateData = {
      name: grupo.name,
      classroom: grupo.classroom || null,
      building: grupo.building,
      jefe_nocuenta: grupo.jefe_nocuenta || null,
      carrera_id: grupo.carrera_id || null
    };

    console.log('Datos a enviar a la base de datos:', updateData);

    const { data, error } = await supabase
      .from('grupo')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error en update grupo:', error);
      throw error;
    }
    
    console.log('Respuesta de la base de datos:', data);
    return data;
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
  },

  async getByCarrera(carreraId: number): Promise<Grupo[]> {
    const { data, error } = await supabase
      .from('grupo')
      .select('*')
      .eq('carrera_id', carreraId);
    
    if (error) throw new Error(error.message);
    return data as Grupo[];
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
      .select('*')
      .order('nombre');
    
    if (error) {
      console.error('Error en getAll carreras:', error);
      throw new Error(error.message);
    }
    return data;
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

export const authService = {
  async ejecutarInsercionAutomatica() {
    const { data, error } = await supabase
      .rpc('insertar_asistencia_auto');
    
    if (error) throw new Error(error.message);
    return data;
  }
};

export const edificiosService = {
  async getAll(): Promise<Edificio[]> {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('No hay sesión activa');
    }

    const user = JSON.parse(userStr);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const { data, error } = await supabase
      .from('edificios')
      .select('*')
      .order('facultad', { ascending: true });
    
    if (error) {
      console.error('Error en getAll edificios:', error);
      throw new Error(error.message);
    }
    return data as Edificio[];
  },

  async create(edificio: Edificio): Promise<Edificio> {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('No hay sesión activa');
    }

    const user = JSON.parse(userStr);
    if (!user || user.role !== 'Administrador') {
      throw new Error('No tiene permisos para crear edificios');
    }

    const { data, error } = await supabase
      .from('edificios')
      .insert(edificio)
      .select()
      .single();
    
    if (error) {
      console.error('Error en create edificio:', error);
      throw new Error(error.message);
    }
    return data as Edificio;
  },

  async update(id: number, edificio: Edificio): Promise<Edificio> {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('No hay sesión activa');
    }

    const user = JSON.parse(userStr);
    if (!user || user.role !== 'Administrador') {
      throw new Error('No tiene permisos para actualizar edificios');
    }

    const { data, error } = await supabase
      .from('edificios')
      .update(edificio)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error en update edificio:', error);
      throw error;
    }
    return data;
  },

  async delete(id: number): Promise<void> {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('No hay sesión activa');
    }

    const user = JSON.parse(userStr);
    if (!user || user.role !== 'Administrador') {
      throw new Error('No tiene permisos para eliminar edificios');
    }

    const { error } = await supabase
      .from('edificios')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error en delete edificio:', error);
      throw new Error(error.message);
    }
  }
};

export const asistenciasService = {
  async getAsistenciasChecador(horarioId: number): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencia_checador')
      .select('*')
      .eq('horario_id', horarioId);
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getAsistenciasJefe(horarioId: number): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencia_jefe')
      .select('*')
      .eq('horario_id', horarioId);
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getAsistenciasMaestro(horarioId: number): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencia_maestro')
      .select('*')
      .eq('horario_id', horarioId);
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getAsistenciasChecadorPorRango(maestroId: string, fechaInicio: string, fechaFin: string): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencia_checador')
      .select('*')
      .eq('maestro_id', maestroId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getAsistenciasJefePorRango(maestroId: string, fechaInicio: string, fechaFin: string): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencia_jefe')
      .select('*')
      .eq('maestro_id', maestroId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getAsistenciasMaestroPorRango(maestroId: string, fechaInicio: string, fechaFin: string): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencia_maestro')
      .select('*')
      .eq('maestro_id', maestroId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getAsistenciasPorRango(maestroId: string, fechaInicio: string, fechaFin: string) {
    try {
      // Primero obtenemos los horarios del maestro
      const { data: horarios, error: horarioError } = await supabase
        .from('horario-maestro')
        .select(`
          id,
          hora,
          dia,
          materia_id,
          grupo_id,
          grupo:grupo (
            name,
            classroom,
            building
          ),
          materia:materias (
            name
          )
        `)
        .eq('maestro_id', maestroId);

      if (horarioError) throw horarioError;
      if (!horarios?.length) return { horarios: [], asistencias: { checador: [], jefe: [], maestro: [] } };

      const horarioIds = horarios.map(h => h.id);

      // Obtenemos todas las asistencias en paralelo
      const [checadorData, jefeData, maestroData] = await Promise.all([
        supabase
          .from('asistencia_checador')
          .select('*')
          .in('horario_id', horarioIds)
          .gte('fecha', fechaInicio)
          .lte('fecha', fechaFin),
        supabase
          .from('asistencia_jefe')
          .select('*')
          .in('horario_id', horarioIds)
          .gte('fecha', fechaInicio)
          .lte('fecha', fechaFin),
        supabase
          .from('asistencia_maestro')
          .select('*')
          .in('horario_id', horarioIds)
          .gte('fecha', fechaInicio)
          .lte('fecha', fechaFin)
      ]);

      if (checadorData.error) throw checadorData.error;
      if (jefeData.error) throw jefeData.error;
      if (maestroData.error) throw maestroData.error;

      return {
        horarios: horarios.map(h => ({
          ...h,
          grupoInfo: h.grupo ? `${h.grupo.name} (${h.grupo.classroom} - ${h.grupo.building})` : 'No asignado',
          materiaNombre: h.materia?.name || 'No asignada'
        })),
        asistencias: {
          checador: checadorData.data || [],
          jefe: jefeData.data || [],
          maestro: maestroData.data || []
        }
      };
    } catch (error) {
      console.error('Error en getAsistenciasPorRango:', error);
      throw error;
    }
  }
}; 