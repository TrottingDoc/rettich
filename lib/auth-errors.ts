export function getLoginErrorMessage(error: {
  code?: string
  status?: number
  message?: string
  name?: string
}) {
  const message = error.message?.toLowerCase() ?? ''
  const name = error.name?.toLowerCase() ?? ''

  if (
    message.includes('fetch failed') ||
    message.includes('network') ||
    message.includes('enotfound') ||
    name.includes('authretryablefetcherror')
  ) {
    return 'Verbindung zu Supabase fehlgeschlagen. Prüfe NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (Projekt im Dashboard noch aktiv?).'
  }

  if (message.includes('invalid login credentials')) {
    return 'E-Mail oder Passwort stimmt nicht.'
  }

  if (message.includes('email not confirmed')) {
    return 'Dieses Konto ist noch nicht bestätigt.'
  }

  if (process.env.NODE_ENV === 'development' && error.message) {
    return `Anmeldung fehlgeschlagen: ${error.message}`
  }

  return 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.'
}
