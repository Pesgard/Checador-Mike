import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  user: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Intentar autenticación con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      // Si hay error de autenticación, intentar con la tabla usuarios
      if (authError) {
        // Buscar usuario por email y contraseña en la tabla usuarios
        const { data: dbUser, error: dbError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single()

        if (dbError || !dbUser) {
          return { error: { message: 'Credenciales inválidas' } }
        }

        // Si encontramos el usuario en la tabla, simular sesión
        localStorage.setItem('user', JSON.stringify(dbUser))
        setUser(dbUser)
        return { error: null }
      }

      // Si la autenticación con Supabase Auth fue exitosa
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        return { error: { message: 'No se encontró información del usuario' } }
      }

      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { error: null }

      // Redirigir según el rol
      switch (userData.role) {
        case 'Administrador':
          navigate('/admin')
          break
        case 'Maestro':
          navigate('/maestro/horario')
          break
        case 'Checador':
          navigate('/checador')
          break
        case 'Jefe_de_Grupo':
          navigate('/jefe/horario')
          break
        case 'Alumno':
          navigate('/alumno/horario')
          break
        default:
          throw new Error('Rol no válido')
      }
    } catch (error: any) {
      console.error('Error en signIn:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('user')
      setUser(null)
      navigate('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
} 