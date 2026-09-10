import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/admin'

export type StaffRole = 'ADMIN' | 'STAFF' | 'OPERACOES' | 'COMERCIAL'

export async function requireStaffUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      error: 'Não autenticado',
      status: 401 as const,
      user: null,
      staff: null,
      isBootstrap: false,
    }
  }

  const service = createServiceClient()
  const client = service || supabase

  const { data: staff } = await client
    .from('staff_members')
    .select('id, role, active, email, full_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!staff) {
    const { count } = await client
      .from('staff_members')
      .select('id', { count: 'exact', head: true })
    if ((count || 0) === 0) {
      return {
        error: null,
        status: 200 as const,
        user,
        staff: null,
        isBootstrap: true,
      }
    }
    return {
      error: 'Sem perfil de staff. Pede a um ADMIN para te adicionar.',
      status: 403 as const,
      user,
      staff: null,
      isBootstrap: false,
    }
  }

  if (!staff.active) {
    return {
      error: 'Conta desativada.',
      status: 403 as const,
      user,
      staff,
      isBootstrap: false,
    }
  }

  return {
    error: null,
    status: 200 as const,
    user,
    staff,
    isBootstrap: false,
  }
}

export async function requireAdminUser() {
  const auth = await requireStaffUser()
  if (auth.error || !auth.user) return auth

  const service = createServiceClient()
  const client = service || (await createClient())

  const { data: staff } = await client
    .from('staff_members')
    .select('id, role, active, email, full_name')
    .eq('user_id', auth.user.id)
    .maybeSingle()

  // Bootstrap: se ainda não há staff na BD, o primeiro autenticado pode administrar
  if (!staff) {
    const { count } = await client
      .from('staff_members')
      .select('id', { count: 'exact', head: true })
    if ((count || 0) === 0) {
      return {
        error: null,
        status: 200 as const,
        user: auth.user,
        staff: null,
        isBootstrap: true,
      }
    }
    return {
      error: 'Sem perfil de staff. Pede a um ADMIN para te adicionar.',
      status: 403 as const,
      user: auth.user,
      staff: null,
      isBootstrap: false,
    }
  }

  if (!staff.active) {
    return {
      error: 'Conta desativada.',
      status: 403 as const,
      user: auth.user,
      staff,
      isBootstrap: false,
    }
  }

  if (staff.role !== 'ADMIN') {
    return {
      error: 'Apenas ADMIN pode gerir definições sensíveis.',
      status: 403 as const,
      user: auth.user,
      staff,
      isBootstrap: false,
    }
  }

  return {
    error: null,
    status: 200 as const,
    user: auth.user,
    staff,
    isBootstrap: false,
  }
}

export function maskSecret(value: string | null | undefined) {
  if (!value) return ''
  if (value.length <= 8) return '••••••••'
  return `${value.slice(0, 4)}••••${value.slice(-4)}`
}
