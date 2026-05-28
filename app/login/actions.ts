'use server'

import { redirect } from 'next/navigation'
import { getLoginErrorMessage } from '@/lib/auth-errors'
import { createClient } from '@/lib/supabase/server'

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ error: string } | void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      error:
        'Supabase ist nicht konfiguriert. Lege .env.local an (siehe .env.example) und starte den Dev-Server neu.',
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    return { error: getLoginErrorMessage(error) }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.' }
  }

  const { data: profile } = await supabase
    .from('profile')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .maybeSingle()

  redirect(profile?.onboarding_completed ? '/' : '/onboarding')
}
