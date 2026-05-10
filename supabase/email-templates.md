# Supabase E-Mail-Templates

Die Magic-Link-Mail wird im gehosteten Supabase-Projekt unter
**Authentication -> Email Templates -> Magic Link** gepflegt.

## Magic Link

Subject:

```text
Dein Anmelde-Link für Rett:ich
```

Body:

Nutze den Inhalt aus [`templates/magic_link.html`](./templates/magic_link.html).

Die Vorlage erklärt, dass die E-Mail durch einen Login-Versuch in der Rett:ich App ausgelöst wurde, und nutzt `{{ .ConfirmationURL }}` als Anmelde-Link.
