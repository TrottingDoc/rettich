# Supabase Setup

Diese App nutzt Supabase für **Auth** und **Datenhaltung** (alles pro User getrennt via Row-Level-Security). Alle App-Daten – Profil, Tagesvorschläge, Verlauf, Feedback, Empfehlungs-Signale – liegen nur in der DB, nicht mehr im Browser.

## Erst-Einrichtung

### 1. Schema anlegen
Im Supabase SQL Editor den Inhalt von [`schema.sql`](./schema.sql) einmalig ausführen.
Die Datei ist idempotent – erneutes Ausführen schadet nichts.

Sie legt an:
- alle Tabellen (`recipes`, `profile`, `daily_suggestions`, `feedback`, `alternative_surveys`, `recommendation_signals`)
- Row-Level-Security-Policies (jede:r User sieht nur eigene Daten; `recipes` sind global lesbar, schreibbar nur für Admins)
- Trigger, der bei jedem neuen Auth-User automatisch ein leeres Profil und einen Signal-Eintrag erzeugt

### 2. Initial-Rezepte einspielen
Einmalig [`seed-recipes.sql`](./seed-recipes.sql) im SQL Editor ausführen, um die Demo-Rezepte (Rührei, Nudeln, Tomatensuppe, Käsebrot, Haferbrei) anzulegen. Achtung: Das Skript leert die `recipes`-Tabelle vorher (`truncate`).

Danach lassen sich Rezepte über die App im `/admin`-Bereich pflegen.

### 3. Sich selbst zum Admin machen
Damit du in `/admin` Rezepte anlegen/bearbeiten/löschen kannst, brauchst du die Rolle `admin` im JWT (`app_metadata.role`).

Im Supabase Dashboard:
1. **Authentication → Users** öffnen
2. Eigenen Account auswählen
3. Unter „Raw User Meta Data → app_metadata" folgendes JSON setzen:
   ```json
   { "role": "admin" }
   ```
4. Anschließend in der App **einmal ausloggen und wieder einloggen**, damit das frische JWT die Rolle enthält.

Alternativ per SQL:
```sql
update auth.users
set raw_app_meta_data = jsonb_set(
  coalesce(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
where email = 'deine@email.de';
```

## Wer darf was?

| Daten | Lesen | Schreiben |
|---|---|---|
| `recipes` (geteilter Pool) | alle eingeloggten User | nur Admins |
| `profile` | nur eigenes | nur eigenes |
| `daily_suggestions` | nur eigene | nur eigene |
| `feedback` | nur eigenes | nur eigenes |
| `alternative_surveys` | nur eigene | nur eigene |
| `recommendation_signals` | nur eigene | nur eigene |

Durchgesetzt wird das per Postgres RLS – auch direkte API-Zugriffe können fremde Daten nicht lesen.

## Auth

Login läuft per **E-Mail und Passwort**. Nutzer legst du im Dashboard unter **Authentication → Users** an (oder per Sign-up, falls aktiviert). Erste Anmeldung legt automatisch den User in `auth.users` an, ein Trigger erzeugt sofort die zugehörige `profile`-Zeile.
