-- Initial-Rezepte (entsprechen lib/mock-data.ts)
-- Einmalig im Supabase SQL Editor ausführen, NACHDEM schema.sql gelaufen ist.
-- Idempotent über `on conflict (title) do nothing` würde nicht greifen, da kein Unique-Index existiert.
-- Stattdessen: vorher leeren, dann neu einfügen.

truncate table recipes restart identity cascade;

insert into recipes (
  title, description, image_url, time_minutes, portions, chopping,
  uses_stove, uses_oven, requires_multitasking, ingredient_count, pan_count,
  can_walk_away, tags, ingredients, steps, substitutions, fixes, is_active
) values
(
  'Rührei mit Toast',
  'Ein schnelles, einfaches Frühstück oder Abendessen.',
  '/image_rettich.png',
  10, 1, 'none',
  true, false, false, 4, 1,
  false,
  '{}',
  '[
    {"name":"Eier","amount":"2","unit":"Stück"},
    {"name":"Butter","amount":"1","unit":"TL"},
    {"name":"Salz","amount":"1","unit":"Prise"},
    {"name":"Toast","amount":"2","unit":"Scheiben"}
  ]'::jsonb,
  '[
    {"text":"Eier in eine Schüssel aufschlagen und mit einer Gabel verquirlen. Eine Prise Salz dazugeben."},
    {"text":"Butter in einer Pfanne bei mittlerer Hitze schmelzen lassen.","durationSeconds":60,"checkText":"Die Butter soll schmelzen, aber nicht bräunen."},
    {"text":"Eier in die Pfanne gießen."},
    {"text":"Mit einem Holzlöffel langsam rühren, bis die Eier cremig aussehen.","durationSeconds":90},
    {"text":"Pfanne vom Herd nehmen – die Eier garen durch die Restwärme fertig. Toast toasten.","isStopPoint":true},
    {"text":"Rührei auf dem Toast servieren."}
  ]'::jsonb,
  '[
    {"ingredient":"Butter","substitute":"Margarine oder ein Spritzer Öl"}
  ]'::jsonb,
  '[
    {"problem":"Eier werden zu fest","solution":"Sofort vom Herd nehmen – die Pfanne ist noch heiß genug."}
  ]'::jsonb,
  true
),
(
  'Nudeln mit Butter und Parmesan',
  'Simpel, sättigend und immer lecker.',
  '/image_rettich.png',
  15, 2, 'none',
  true, false, false, 4, 1,
  true,
  '{vegetarisch}',
  '[
    {"name":"Nudeln","amount":"200","unit":"g"},
    {"name":"Butter","amount":"2","unit":"EL"},
    {"name":"Parmesan, gerieben","amount":"4","unit":"EL"},
    {"name":"Salz","amount":"1","unit":"TL"}
  ]'::jsonb,
  '[
    {"text":"Einen Topf mit Wasser füllen und bei hoher Hitze zum Kochen bringen.","durationSeconds":300,"checkText":"Das Wasser muss sprudeln."},
    {"text":"Salz und Nudeln ins kochende Wasser geben und umrühren.","isStopPoint":true},
    {"text":"Nudeln laut Packungsanweisung kochen (meist 8–10 Minuten).","durationSeconds":480,"checkText":"Eine Nudel herausnehmen und probieren – sie soll weich sein."},
    {"text":"Nudeln in ein Sieb abgießen und abtropfen lassen."},
    {"text":"Nudeln zurück in den Topf geben. Butter und Parmesan dazugeben und alles gut umrühren."},
    {"text":"Sofort servieren und genießen."}
  ]'::jsonb,
  '[
    {"ingredient":"Parmesan","substitute":"Geriebener Gouda oder Emmentaler"},
    {"ingredient":"Butter","substitute":"Olivenöl"}
  ]'::jsonb,
  '[
    {"problem":"Nudeln kleben zusammen","solution":"Etwas mehr Butter oder Öl dazugeben und gut umrühren."},
    {"problem":"Zu fade","solution":"Mehr Salz oder etwas Zitronensaft dazugeben."}
  ]'::jsonb,
  true
),
(
  'Tomatensuppe aus der Dose',
  'Wärmend und in wenigen Minuten fertig.',
  '/image_rettich.png',
  10, 2, 'none',
  true, false, false, 2, 1,
  false,
  '{vegetarisch,weiche-speisen}',
  '[
    {"name":"Tomatensuppe (Dose oder Tetra Pak)","amount":"1","unit":"Dose"},
    {"name":"Wasser oder Milch","amount":"1","unit":"Dose (zum Auffüllen)"}
  ]'::jsonb,
  '[
    {"text":"Dosensuppe in einen Topf gießen."},
    {"text":"Eine Dose Wasser oder Milch dazugeben (die Menge steht auf der Packung). Umrühren."},
    {"text":"Bei mittlerer Hitze erwärmen und dabei gelegentlich rühren.","durationSeconds":300,"checkText":"Die Suppe soll heiß sein, aber nicht kochen."},
    {"text":"In Schüsseln gießen und mit Brot servieren."}
  ]'::jsonb,
  '[]'::jsonb,
  '[
    {"problem":"Suppe zu dick","solution":"Noch etwas Wasser dazugeben und umrühren."}
  ]'::jsonb,
  true
),
(
  'Käsebrot mit Tomate',
  'Kein Herd nötig – perfekt für jeden Tag.',
  '/image_rettich.png',
  5, 1, 'basic',
  false, false, false, 4, 0,
  true,
  '{vegetarisch,kein-herd}',
  '[
    {"name":"Brot","amount":"2","unit":"Scheiben"},
    {"name":"Butter","amount":"1","unit":"EL"},
    {"name":"Käse","amount":"2","unit":"Scheiben"},
    {"name":"Tomate","amount":"1","unit":"Stück"}
  ]'::jsonb,
  '[
    {"text":"Brot mit Butter bestreichen."},
    {"text":"Käse auf das Brot legen."},
    {"text":"Tomate in Scheiben schneiden und auf den Käse legen.","checkText":"Vorsicht beim Schneiden – Finger weghalten."},
    {"text":"Fertig! Mit etwas Salz und Pfeffer würzen nach Geschmack."}
  ]'::jsonb,
  '[
    {"ingredient":"Tomate","substitute":"Gurke oder Paprika"},
    {"ingredient":"Käse","substitute":"Aufschnitt oder Frischkäse"}
  ]'::jsonb,
  '[]'::jsonb,
  true
),
(
  'Haferbrei',
  'Ein wärmendes, nahrhaftes Frühstück.',
  '/image_rettich.png',
  10, 1, 'none',
  true, false, false, 4, 1,
  false,
  '{vegetarisch,weiche-speisen,frühstück}',
  '[
    {"name":"Haferflocken","amount":"50","unit":"g"},
    {"name":"Milch oder Wasser","amount":"200","unit":"ml"},
    {"name":"Salz","amount":"1","unit":"Prise"},
    {"name":"Honig oder Marmelade","amount":"1","unit":"TL"}
  ]'::jsonb,
  '[
    {"text":"Milch (oder Wasser) in einem kleinen Topf bei mittlerer Hitze erwärmen."},
    {"text":"Haferflocken und eine Prise Salz dazugeben und umrühren."},
    {"text":"Unter gelegentlichem Rühren ca. 3–5 Minuten köcheln lassen, bis der Brei dick wird.","durationSeconds":240},
    {"text":"In eine Schüssel geben und mit Honig oder Marmelade süßen."}
  ]'::jsonb,
  '[
    {"ingredient":"Milch","substitute":"Pflanzenmilch (Hafer, Mandel) oder Wasser"}
  ]'::jsonb,
  '[
    {"problem":"Zu dick","solution":"Noch etwas Milch oder Wasser einrühren."},
    {"problem":"Klumpen","solution":"Kräftig rühren."}
  ]'::jsonb,
  true
),
(
  'Vodka-Nudeln',
  'Cremige Tomaten-Pasta mit Parmesan und einem kleinen Schuss Vodka.',
  '/image_rettich.png',
  25, 2, 'basic',
  true, false, false, 7, 2,
  false,
  '{vegetarisch,schnell}',
  '[
    {"name":"Nudeln","amount":"200","unit":"g"},
    {"name":"Olivenöl","amount":"1","unit":"EL"},
    {"name":"Knoblauch","amount":"1","unit":"Zehe"},
    {"name":"Tomatenmark","amount":"2","unit":"EL"},
    {"name":"Vodka","amount":"3","unit":"EL"},
    {"name":"Sahne","amount":"100","unit":"ml"},
    {"name":"Parmesan, gerieben","amount":"30","unit":"g"}
  ]'::jsonb,
  '[
    {"text":"Einen Topf mit Wasser füllen und bei hoher Hitze zum Kochen bringen.","durationSeconds":300,"checkText":"Das Wasser soll sprudelnd kochen."},
    {"text":"Knoblauch schälen und sehr fein hacken.","checkText":"Wenn du unsicher bist: lieber grob hacken als zu nah an den Fingern schneiden."},
    {"text":"Salz und Nudeln ins kochende Wasser geben. Nach Packungsangabe kochen.","durationSeconds":480,"isStopPoint":true},
    {"text":"Währenddessen Olivenöl in einer Pfanne bei mittlerer Hitze erwärmen. Knoblauch kurz anbraten.","durationSeconds":60,"checkText":"Der Knoblauch soll duften, aber nicht braun werden."},
    {"text":"Tomatenmark in die Pfanne geben und 1 Minute rühren.","durationSeconds":60},
    {"text":"Vodka dazugeben und 1–2 Minuten einkochen lassen.","durationSeconds":90,"checkText":"Es soll nicht mehr stark nach Alkohol riechen."},
    {"text":"Sahne einrühren und die Sauce bei niedriger Hitze warm halten."},
    {"text":"Nudeln abgießen, dabei eine kleine Tasse Nudelwasser aufheben."},
    {"text":"Nudeln und Parmesan in die Sauce geben. Alles gut mischen. Bei Bedarf etwas Nudelwasser dazugeben, bis die Sauce cremig ist."},
    {"text":"Abschmecken und sofort servieren."}
  ]'::jsonb,
  '[
    {"ingredient":"Vodka","substitute":"Ein Spritzer Zitronensaft oder etwas Nudelwasser – dann ist es eine cremige Tomaten-Sahne-Pasta"},
    {"ingredient":"Sahne","substitute":"Kochsahne oder Hafercuisine"},
    {"ingredient":"Parmesan","substitute":"Geriebener Hartkäse oder Hefeflocken"}
  ]'::jsonb,
  '[
    {"problem":"Sauce ist zu dick","solution":"Esslöffelweise Nudelwasser einrühren."},
    {"problem":"Sauce schmeckt zu sauer","solution":"Einen kleinen Schuss Sahne oder eine Prise Zucker dazugeben."},
    {"problem":"Knoblauch wird braun","solution":"Pfanne sofort vom Herd nehmen und mit Sahne ablöschen."}
  ]'::jsonb,
  true
);
