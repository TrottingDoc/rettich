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
  '{vegetarisch,frühstück,schnell,ei}',
  '[
    {"name":"Eier","amount":"2","unit":"Stück"},
    {"name":"Butter","amount":"1","unit":"TL"},
    {"name":"Salz","amount":"1","unit":"Prise"},
    {"name":"Toast","amount":"2","unit":"Scheiben"}
  ]'::jsonb,
  '[
    {"text":"Eier in eine Schüssel aufschlagen und mit einer Gabel verquirlen. Eine Prise Salz dazugeben."},
    {"text":"Butter in einer Pfanne bei mittlerer Hitze schmelzen lassen.","checkText":"Die Butter soll schmelzen, aber nicht bräunen."},
    {"text":"Eier in die Pfanne gießen."},
    {"text":"Mit einem Holzlöffel langsam rühren, bis die Eier cremig aussehen."},
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
  '{vegetarisch,pasta,käse,butter}',
  '[
    {"name":"Nudeln","amount":"200","unit":"g"},
    {"name":"Butter","amount":"2","unit":"EL"},
    {"name":"Parmesan, gerieben","amount":"4","unit":"EL"},
    {"name":"Salz","amount":"1","unit":"TL"}
  ]'::jsonb,
  '[
    {"text":"Einen Topf mit Wasser füllen und bei hoher Hitze zum Kochen bringen.","checkText":"Das Wasser muss sprudeln."},
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
  '{vegetarisch,weiche-speisen,suppe,tomate}',
  '[
    {"name":"Tomatensuppe (Dose oder Tetra Pak)","amount":"1","unit":"Dose"},
    {"name":"Wasser oder Milch","amount":"1","unit":"Dose (zum Auffüllen)"}
  ]'::jsonb,
  '[
    {"text":"Dosensuppe in einen Topf gießen."},
    {"text":"Eine Dose Wasser oder Milch dazugeben (die Menge steht auf der Packung). Umrühren."},
    {"text":"Bei mittlerer Hitze erwärmen und dabei gelegentlich rühren.","checkText":"Die Suppe soll heiß sein, aber nicht kochen."},
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
  '{vegetarisch,kein-herd,brot,käse,tomate}',
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
  '{vegetarisch,weiche-speisen,frühstück,hafer,milch}',
  '[
    {"name":"Haferflocken","amount":"50","unit":"g"},
    {"name":"Milch oder Wasser","amount":"200","unit":"ml"},
    {"name":"Salz","amount":"1","unit":"Prise"},
    {"name":"Honig oder Marmelade","amount":"1","unit":"TL"}
  ]'::jsonb,
  '[
    {"text":"Milch (oder Wasser) in einem kleinen Topf bei mittlerer Hitze erwärmen."},
    {"text":"Haferflocken und eine Prise Salz dazugeben und umrühren."},
    {"text":"Unter gelegentlichem Rühren ca. 3–5 Minuten köcheln lassen, bis der Brei dick wird."},
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
  '{vegetarisch,schnell,pasta,tomate}',
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
    {"text":"Einen Topf mit Wasser füllen und bei hoher Hitze zum Kochen bringen.","checkText":"Das Wasser soll sprudelnd kochen."},
    {"text":"Knoblauch schälen und sehr fein hacken.","checkText":"Wenn du unsicher bist: lieber grob hacken als zu nah an den Fingern schneiden."},
    {"text":"Salz und Nudeln ins kochende Wasser geben. Nach Packungsangabe kochen.","durationSeconds":480,"isStopPoint":true},
    {"text":"Währenddessen Olivenöl in einer Pfanne bei mittlerer Hitze erwärmen. Knoblauch kurz anbraten.","checkText":"Der Knoblauch soll duften, aber nicht braun werden."},
    {"text":"Tomatenmark in die Pfanne geben und 1 Minute rühren."},
    {"text":"Vodka dazugeben und 1–2 Minuten einkochen lassen.","checkText":"Es soll nicht mehr stark nach Alkohol riechen."},
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
),
(
  'Pesto Rosso',
  'Kräftiges rotes Pesto für Pasta – mit getrockneten Tomaten, gerösteten Kernen, Parmigiano und Frischkäse.',
  '/image_rettich.png',
  15, 4, 'basic',
  false, false, false, 17, 0,
  true,
  '{vegetarisch,kein-herd,schnell,sauce,tomate,pasta}',
  '[
    {"name":"Getrocknete Tomaten, rehydriert","amount":"1","unit":"Tasse"},
    {"name":"Pinienkerne, geröstet","amount":"1","unit":"EL"},
    {"name":"Sonnenblumenkerne, geröstet","amount":"1","unit":"EL"},
    {"name":"Pfeffer","amount":"1/2","unit":"TL"},
    {"name":"Olivenöl","amount":"1/4","unit":"Tasse"},
    {"name":"Geröstetes Sesamöl","amount":"1","unit":"TL"},
    {"name":"Basilikum","amount":"2","unit":"TL"},
    {"name":"Salz","amount":"1/2","unit":"TL"},
    {"name":"Rauchsalz","amount":"1/2","unit":"TL"},
    {"name":"Chiliflocken","amount":"1/4","unit":"TL"},
    {"name":"Rosmarin","amount":"5","unit":"Nadeln"},
    {"name":"Knoblauch","amount":"1","unit":"Zehe"},
    {"name":"Kapern","amount":"1","unit":"TL"},
    {"name":"Olivenöl","amount":"3","unit":"EL"},
    {"name":"Dunkler Balsamico","amount":"2","unit":"TL"},
    {"name":"Parmigiano, gerieben","amount":"3/4","unit":"Tasse"},
    {"name":"Ziegenfrischkäse","amount":"2","unit":"TL"},
    {"name":"Kuhmilch-Frischkäse","amount":"2","unit":"TL"}
  ]'::jsonb,
  '[
    {"text":"Rehydrierte Tomaten gut abtropfen lassen. Knoblauch schälen und grob zerkleinern."},
    {"text":"Tomaten, Pinienkerne, Sonnenblumenkerne, Pfeffer, 1/4 Tasse Olivenöl, Sesamöl, Basilikum, Salz, Rauchsalz, Chiliflocken, Rosmarin und Knoblauch in einen Mixer geben."},
    {"text":"Alles mixen, bis eine grobe Paste entsteht.","checkText":"Wenn der Mixer stockt, kurz stoppen und die Masse mit einem Löffel nach unten schieben."},
    {"text":"Kapern, 3 EL Olivenöl, dunklen Balsamico und Parmigiano dazugeben."},
    {"text":"Erneut mixen, bis das Pesto cremiger wird."},
    {"text":"Ziegenfrischkäse und Kuhmilch-Frischkäse dazugeben und kurz untermixen."},
    {"text":"Konsistenz prüfen. Wenn das Pesto zu fest ist, esslöffelweise Olivenöl dazugeben und nochmal kurz mixen."},
    {"text":"Abschmecken und in ein sauberes Glas füllen oder direkt mit Pasta, Brot oder Gemüse servieren."}
  ]'::jsonb,
  '[
    {"ingredient":"Pinienkerne","substitute":"Mehr Sonnenblumenkerne oder Walnüsse"},
    {"ingredient":"Parmigiano","substitute":"Parmesan oder ein anderer harter Reibekäse"},
    {"ingredient":"Ziegenfrischkäse","substitute":"Mehr Kuhmilch-Frischkäse"}
  ]'::jsonb,
  '[
    {"problem":"Pesto ist zu fest","solution":"Esslöffelweise Olivenöl dazugeben und kurz mixen."},
    {"problem":"Pesto ist zu salzig","solution":"Mehr rehydrierte Tomaten oder etwas Frischkäse untermixen."},
    {"problem":"Geschmack ist zu scharf","solution":"Mehr Frischkäse oder Parmigiano dazugeben."}
  ]'::jsonb,
  true
),
(
  'Tortellini-Hacksauce-Auflauf',
  'Deftiger Tortellini-Auflauf mit lange eingekochter Hacksauce, Feta, Frischkäse und Käsekruste.',
  '/image_rettich.png',
  90, 4, 'basic',
  true, true, true, 16, 2,
  true,
  '{auflauf,ofengericht,pasta}',
  '[
    {"name":"Zwiebel","amount":"1","unit":"Stück"},
    {"name":"Speckwürfel","amount":"1","unit":"Handvoll"},
    {"name":"Gehacktes","amount":"600","unit":"g"},
    {"name":"Paprika","amount":"1","unit":"Stück"},
    {"name":"Rauchsalz","amount":"1/2","unit":"TL"},
    {"name":"Rinderbrühe","amount":"250","unit":"ml"},
    {"name":"Tomatenmark","amount":"2","unit":"EL"},
    {"name":"Marinara-Sauce","amount":"400","unit":"ml"},
    {"name":"Sojasauce","amount":"1","unit":"EL"},
    {"name":"Chilipaste oder Chiliflocken","amount":"1","unit":"TL"},
    {"name":"Feta","amount":"1/2","unit":"Packung"},
    {"name":"Frischkäse","amount":"1/4","unit":"Packung"},
    {"name":"Salz und Pfeffer","amount":"nach","unit":"Geschmack"},
    {"name":"Saucenbinder oder Speisestärke","amount":"nach","unit":"Bedarf"},
    {"name":"Frische Tortellini","amount":"500","unit":"g"},
    {"name":"Emmentaler, Mozzarella oder Gouda","amount":"150","unit":"g"}
  ]'::jsonb,
  '[
    {"text":"Zwiebel schälen und fein würfeln. Paprika waschen, entkernen und in kleine Stücke schneiden."},
    {"text":"Speck in einer großen Pfanne oder einem Topf bei mittlerer Hitze anbraten, bis er leicht Farbe bekommt."},
    {"text":"Zwiebel dazugeben und 2–3 Minuten mitbraten.","checkText":"Die Zwiebel soll glasig werden."},
    {"text":"Gehacktes dazugeben und krümelig anbraten.","checkText":"Es sollte keine rohen rosa Stellen mehr geben."},
    {"text":"Paprika und Rauchsalz dazugeben und kurz umrühren."},
    {"text":"Rinderbrühe angießen. Tomatenmark, Marinara-Sauce, Sojasauce und Chilipaste oder Chiliflocken einrühren."},
    {"text":"Feta zerbröseln und zusammen mit Frischkäse in die Sauce rühren."},
    {"text":"Sauce bei niedriger bis mittlerer Hitze etwa 1 Stunde einkochen lassen. Gelegentlich umrühren.","isStopPoint":true,"checkText":"Die Sauce soll dicker und kräftiger werden, aber nicht anbrennen."},
    {"text":"Backofen auf 180 °C Ober-/Unterhitze vorheizen."},
    {"text":"Sauce mit Salz und Pfeffer abschmecken. Wenn sie zu dünn ist, mit etwas Saucenbinder oder angerührter Speisestärke abbinden."},
    {"text":"Frische Tortellini in eine Auflaufform geben und mit der Hacksauce vermischen."},
    {"text":"Mit geriebenem Emmentaler, Mozzarella oder Gouda bestreuen."},
    {"text":"Auflauf im Ofen backen, bis der Käse geschmolzen und leicht goldbraun ist.","checkText":"Die Tortellini sollen heiß sein und der Käse blubbern."},
    {"text":"Kurz abkühlen lassen und servieren."}
  ]'::jsonb,
  '[
    {"ingredient":"Gehacktes","substitute":"Gemischtes Hack, Rinderhack oder vegetarisches Hack"},
    {"ingredient":"Speckwürfel","substitute":"Weglassen oder durch geräucherten Tofu ersetzen"},
    {"ingredient":"Feta","substitute":"Hirtenkäse oder mehr Frischkäse"},
    {"ingredient":"Marinara-Sauce","substitute":"Passierte Tomaten mit italienischen Kräutern"}
  ]'::jsonb,
  '[
    {"problem":"Sauce ist zu dünn","solution":"Ein paar Minuten offen weiterköcheln lassen oder mit Saucenbinder abbinden."},
    {"problem":"Sauce brennt an","solution":"Hitze reduzieren und einen kleinen Schuss Brühe einrühren."},
    {"problem":"Auflauf wird oben zu dunkel","solution":"Mit Alufolie abdecken und weiterbacken, bis alles heiß ist."}
  ]'::jsonb,
  true
),
(
  'Fischfrikadellen mit Dill-Sauce',
  'Saftige Fischfrikadellen aus Seelachs mit Kartoffeln, Senf, Rettich und einer schnellen Schmand-Mayo-Sauce.',
  '/image_rettich.png',
  60, 4, 'basic',
  true, false, true, 16, 2,
  false,
  '{fisch}',
  '[
    {"name":"Seelachsfilet","amount":"500","unit":"g"},
    {"name":"Zwiebel","amount":"1","unit":"klein"},
    {"name":"Kartoffeln","amount":"2–3","unit":"Stück"},
    {"name":"Ei","amount":"1","unit":"Stück"},
    {"name":"Alte Brötchen oder Paniermehl","amount":"4–5","unit":"EL"},
    {"name":"Petersilie","amount":"1","unit":"Handvoll"},
    {"name":"Senf","amount":"1","unit":"TL"},
    {"name":"Rettich, gerieben","amount":"1","unit":"EL"},
    {"name":"Salz und Pfeffer","amount":"nach","unit":"Geschmack"},
    {"name":"Fischgewürz","amount":"nach","unit":"Geschmack"},
    {"name":"Paprikapulver","amount":"2","unit":"EL"},
    {"name":"Paniermehl zum Wenden","amount":"4","unit":"EL"},
    {"name":"Schmand","amount":"3","unit":"EL"},
    {"name":"Mayonnaise","amount":"2","unit":"EL"},
    {"name":"Dill","amount":"1","unit":"EL"},
    {"name":"Zwiebelpulver","amount":"1/4","unit":"TL"},
    {"name":"Gurke oder Kapern, fein gehackt","amount":"1","unit":"EL"},
    {"name":"Gewürzmischung aus Fenchel, Koriander, Senf, Ingwer, Kardamom und Chili","amount":"1/4","unit":"TL"}
  ]'::jsonb,
  '[
    {"text":"Kartoffeln schälen, grob würfeln und in Salzwasser weich kochen.","checkText":"Die Kartoffeln sollen sich leicht mit einer Gabel zerdrücken lassen."},
    {"text":"Zwiebel fein würfeln und in etwas Öl glasig anbraten."},
    {"text":"Seelachs in grobe Stücke schneiden und in der Küchenmaschine kurz zerkleinern.","checkText":"Nicht zu lange mixen – die Masse soll nicht komplett breiig werden."},
    {"text":"Kartoffeln abgießen und grob zerdrücken. Kurz ausdampfen lassen."},
    {"text":"Fisch, Zwiebel, Kartoffeln, Ei, Brötchen oder Paniermehl, Petersilie, Senf, Rettich, Salz, Pfeffer und Fischgewürz in einer Schüssel mischen."},
    {"text":"Die Masse 20 Minuten kaltstellen, damit sie fester wird.","isStopPoint":true},
    {"text":"Währenddessen die Sauce rühren: Schmand, Mayonnaise, Dill, Zwiebelpulver, Gurke oder Kapern und 1/4 TL Gewürzmischung verrühren. Kalt stellen."},
    {"text":"Paprikapulver und Paniermehl auf einem Teller mischen."},
    {"text":"Aus der Fischmasse Frikadellen formen und in der Paprika-Paniermehl-Mischung wenden."},
    {"text":"Frikadellen in einer Pfanne bei mittlerer Hitze von beiden Seiten goldbraun anbraten.","checkText":"Sie sollen außen knusprig und innen heiß sein."},
    {"text":"Mit der Dill-Sauce servieren."}
  ]'::jsonb,
  '[
    {"ingredient":"Seelachs","substitute":"Kabeljau oder ein anderer milder weißer Fisch"},
    {"ingredient":"Alte Brötchen","substitute":"Paniermehl"},
    {"ingredient":"Schmand","substitute":"Sauerrahm oder griechischer Joghurt"},
    {"ingredient":"Gurke","substitute":"Kapern"}
  ]'::jsonb,
  '[
    {"problem":"Masse ist zu weich","solution":"Mehr Paniermehl einarbeiten und nochmal 10 Minuten kaltstellen."},
    {"problem":"Frikadellen fallen auseinander","solution":"Kleiner formen und erst wenden, wenn die Unterseite gut gebräunt ist."},
    {"problem":"Sauce ist zu kräftig","solution":"Mehr Schmand oder Joghurt unterrühren."}
  ]'::jsonb,
  true
),
(
  'Bolognaise de David',
  'Kräftige, lange eingekochte Hackfleischsauce mit Speck, Rotwein, Milch, Tomaten und vielen Gewürzen.',
  '/image_rettich.png',
  180, 4, 'basic',
  true, false, false, 22, 1,
  true,
  '{sauce}',
  '[
    {"name":"Zwiebeln","amount":"2","unit":"große"},
    {"name":"Paprika","amount":"1","unit":"große"},
    {"name":"Speck","amount":"100","unit":"g"},
    {"name":"Olivenöl","amount":"2","unit":"EL"},
    {"name":"Butter","amount":"1","unit":"EL"},
    {"name":"Salz","amount":"1/2","unit":"TL"},
    {"name":"Pfeffer","amount":"etwas","unit":""},
    {"name":"Rinderhack","amount":"600","unit":"g"},
    {"name":"Paprikapulver","amount":"2","unit":"EL"},
    {"name":"Rauchsalz","amount":"3","unit":"Prisen"},
    {"name":"Kochsalz","amount":"1/4","unit":"TL"},
    {"name":"Knoblauchzehen","amount":"3","unit":"Stück"},
    {"name":"Rotwein","amount":"200","unit":"ml"},
    {"name":"Milch","amount":"200","unit":"ml"},
    {"name":"Tomatenmark","amount":"3","unit":"EL"},
    {"name":"Gemüsebrühe, in heißem Wasser gelöst","amount":"200","unit":"ml"},
    {"name":"Passierte Tomaten","amount":"1","unit":"Paket oder Dose"},
    {"name":"Rosmarin, gehackt","amount":"1/2","unit":"TL"},
    {"name":"Salbei","amount":"1","unit":"TL"},
    {"name":"Thymian","amount":"1","unit":"TL"},
    {"name":"Oregano","amount":"2","unit":"TL"},
    {"name":"Lorbeerblätter","amount":"2","unit":"Stück"},
    {"name":"Currypulver","amount":"3","unit":"Messerspitzen"},
    {"name":"Kreuzkümmel","amount":"2","unit":"Messerspitzen"},
    {"name":"Kümmel","amount":"3","unit":"Messerspitzen"},
    {"name":"Gewürfelte Tomaten","amount":"1","unit":"Paket oder Dose"},
    {"name":"Sojasauce","amount":"2","unit":"EL"},
    {"name":"Mondamin Saucenbinder","amount":"nach","unit":"Bedarf"}
  ]'::jsonb,
  '[
    {"text":"Zwiebeln schälen und in Würfel schneiden. Paprika waschen, entkernen und würfeln. Knoblauch fein hacken."},
    {"text":"Speck mit Olivenöl und Butter in einer großen Pfanne oder einem schweren Topf anbraten."},
    {"text":"Paprika, Zwiebeln, 1/2 TL Salz und etwas Pfeffer dazugeben und braten, bis die Zwiebeln goldene Farbe bekommen.","checkText":"Die Zwiebeln dürfen Farbe haben, sollen aber nicht schwarz werden."},
    {"text":"In der Mitte der Pfanne Platz machen. Rinderhack in die Mitte geben und mit Paprikapulver anbraten."},
    {"text":"Hack weiterbraten, bis es nicht mehr rosa ist."},
    {"text":"Rauchsalz, 1/4 TL Kochsalz und fein gehackten Knoblauch zugeben und weiter bräunen.","checkText":"Der Knoblauch soll duften, aber nicht verbrennen."},
    {"text":"Wenn das Hack ganz durchgebraten ist, Rotwein zugeben und 2 Minuten einkochen lassen."},
    {"text":"Milch zugeben und gründlich umrühren."},
    {"text":"Tomatenmark einrühren und kurz aufkochen lassen."},
    {"text":"Gelöste Gemüsebrühe und passierte Tomaten zugeben und wieder aufkochen lassen."},
    {"text":"Rosmarin, Salbei, Thymian, Oregano und Lorbeerblätter zugeben. Bei getrockneten Kräutern etwa die halbe Menge nehmen."},
    {"text":"Currypulver, Kreuzkümmel und Kümmel einrühren."},
    {"text":"Gewürfelte Tomaten und Sojasauce zugeben und alles gut umrühren."},
    {"text":"Sauce 2–3 Stunden offen oder halb offen einkochen lassen, bis fast alle Flüssigkeit verkocht ist. Gelegentlich umrühren.","isStopPoint":true,"checkText":"Die Sauce soll dick und kräftig sein. Wenn sie am Boden ansetzt, Hitze reduzieren."},
    {"text":"Lorbeerblätter entfernen. Falls noch zu viel Flüssigkeit da ist, mit etwas Mondamin Saucenbinder abbinden."},
    {"text":"Abschmecken und zu Pasta, Lasagne oder als Basis für Aufläufe verwenden."}
  ]'::jsonb,
  '[
    {"ingredient":"Rinderhack","substitute":"Gemischtes Hack oder vegetarisches Hack"},
    {"ingredient":"Rotwein","substitute":"Mehr Gemüsebrühe mit einem kleinen Schuss Balsamico"},
    {"ingredient":"Speck","substitute":"Weglassen oder geräucherten Tofu verwenden"},
    {"ingredient":"Mondamin Saucenbinder","substitute":"Speisestärke in wenig kaltem Wasser angerührt"}
  ]'::jsonb,
  '[
    {"problem":"Sauce brennt an","solution":"Hitze reduzieren, sofort umrühren und etwas Brühe oder Wasser zugeben."},
    {"problem":"Sauce ist zu dünn","solution":"Offen weiter einkochen oder mit wenig Saucenbinder abbinden."},
    {"problem":"Sauce schmeckt zu kräftig","solution":"Etwas Milch oder passierte Tomaten einrühren und kurz köcheln lassen."}
  ]'::jsonb,
  true
),
(
  'Risotto Crema di David',
  'Cremiges Risotto mit Pilzen, Salsiccia, Paprika, Milch, Brühe, Weißwein und frischen Kräutern.',
  '/image_rettich.png',
  60, 4, 'basic',
  true, false, true, 14, 2,
  false,
  '{risotto,reis}',
  '[
    {"name":"Zwiebel","amount":"1","unit":"große"},
    {"name":"Pilze","amount":"1","unit":"Schale"},
    {"name":"Salsiccia","amount":"nach","unit":"Bedarf"},
    {"name":"Rote Paprika","amount":"1","unit":"Stück"},
    {"name":"Risottoreis","amount":"250","unit":"g"},
    {"name":"Milch","amount":"2","unit":"Tassen"},
    {"name":"Hühnerbrühe","amount":"1","unit":"Glas"},
    {"name":"Weißwein","amount":"1–2","unit":"Gläser"},
    {"name":"Olivenöl","amount":"nach","unit":"Bedarf"},
    {"name":"Butter","amount":"nach","unit":"Bedarf"},
    {"name":"Knoblauch","amount":"1","unit":"Zehe"},
    {"name":"Frische Kräutermischung aus Rosmarin, Thymian und Salbei","amount":"2","unit":"EL"},
    {"name":"Chilipaste oder Sriracha","amount":"1","unit":"TL"},
    {"name":"Rauchsalz","amount":"2","unit":"Prisen"},
    {"name":"Limonen- oder Zitronensaft","amount":"1–2","unit":"EL"},
    {"name":"Salz und Pfeffer","amount":"nach","unit":"Geschmack"}
  ]'::jsonb,
  '[
    {"text":"Zwiebel schälen und fein würfeln. Pilze putzen und in dicke Scheiben schneiden. Paprika waschen, entkernen und klein würfeln. Knoblauch fein hacken."},
    {"text":"Zwiebel in Olivenöl und Butter anbraten. Eine Prise Salz dazugeben."},
    {"text":"Pilze direkt dazugeben, pfeffern und mit anbraten, bis sie Farbe bekommen.","checkText":"Die Pilze sollen gebräunt sein und nicht mehr wässrig aussehen."},
    {"text":"Pilze und Zwiebeln aus der Pfanne nehmen und für später zurückstellen.","isStopPoint":true},
    {"text":"Salsiccia in derselben Pfanne mit etwas Olivenöl und Butter anbraten. Pfeffer dazugeben."},
    {"text":"1 EL frische Kräutermischung und Knoblauch dazugeben und weiterbraten, bis alles gut Farbe annimmt.","checkText":"Der Knoblauch soll duften, aber nicht verbrennen."},
    {"text":"Salsiccia ebenfalls zu den Pilzen stellen."},
    {"text":"Paprika in derselben Pfanne kurz anbraten."},
    {"text":"Risottoreis dazugeben und 2 Minuten mit anrösten.","checkText":"Der Reis darf leicht glasig werden."},
    {"text":"Milch zugeben und bei mittlerer Hitze rühren, bis sie vom Reis aufgenommen wurde."},
    {"text":"1 EL frische Kräutermischung, Chilipaste oder Sriracha und Rauchsalz einrühren."},
    {"text":"Ein halbes Glas Hühnerbrühe zugeben und rühren, bis die Flüssigkeit aufgenommen ist."},
    {"text":"Nach Geschmack 1–2 Gläser Weißwein portionsweise zugeben und jeweils einkochen lassen."},
    {"text":"Das restliche halbe Glas Hühnerbrühe einrühren und wieder aufnehmen lassen."},
    {"text":"Limonen- oder Zitronensaft zugeben."},
    {"text":"Immer wieder etwas kochendes Wasser zugeben und rühren, bis der Reis nur noch wenig Biss hat.","checkText":"Das Risotto soll cremig sein; der Reis soll nicht hart, aber auch nicht matschig sein."},
    {"text":"Salsiccia, Pilze und Zwiebeln zurück in die Pfanne geben und unterrühren."},
    {"text":"Mit kalter Butter montieren: Butter einrühren, bis die Sauce glänzend und cremig wird."},
    {"text":"Noch 5–10 Minuten weiterkochen, bis Reis und Flüssigkeit perfekt cremig sind."},
    {"text":"Mit Salz, Pfeffer und Zitronensaft abschmecken und sofort servieren."}
  ]'::jsonb,
  '[
    {"ingredient":"Salsiccia","substitute":"Bratwurstbrät, Speckwürfel oder vegetarische Bratwurst"},
    {"ingredient":"Pilze","substitute":"Champignons, Kräuterseitlinge oder gemischte Pilze"},
    {"ingredient":"Weißwein","substitute":"Mehr Hühnerbrühe plus etwas Zitronensaft"},
    {"ingredient":"Hühnerbrühe","substitute":"Gemüsebrühe"}
  ]'::jsonb,
  '[
    {"problem":"Risotto ist zu fest","solution":"Mehr kochendes Wasser oder Brühe zugeben und weiter rühren."},
    {"problem":"Risotto ist zu flüssig","solution":"Ein paar Minuten offen weiterkochen und rühren."},
    {"problem":"Reis setzt am Boden an","solution":"Hitze reduzieren, sofort rühren und etwas Flüssigkeit zugeben."}
  ]'::jsonb,
  true
),
(
  'Sahnehering mit Pellkartoffeln',
  'Klassischer Sahnehering mit Apfel, Zwiebel, Gurke und warmen Pellkartoffeln.',
  '/image_rettich.png',
  35, 2, 'basic',
  true, false, false, 10, 1,
  true,
  '{fisch}',
  '[
    {"name":"Kartoffeln","amount":"600","unit":"g"},
    {"name":"Sahnehering","amount":"400","unit":"g"},
    {"name":"Apfel","amount":"1","unit":"Stück"},
    {"name":"Zwiebel","amount":"1","unit":"klein"},
    {"name":"Gewürzgurken","amount":"2","unit":"Stück"},
    {"name":"Schmand oder saure Sahne","amount":"2","unit":"EL"},
    {"name":"Joghurt","amount":"2","unit":"EL"},
    {"name":"Gurkenwasser","amount":"1","unit":"EL"},
    {"name":"Dill","amount":"1","unit":"EL"},
    {"name":"Salz und Pfeffer","amount":"nach","unit":"Geschmack"}
  ]'::jsonb,
  '[
    {"text":"Kartoffeln gründlich waschen und mit Schale in einen Topf geben. Mit Wasser bedecken und salzen."},
    {"text":"Kartoffeln kochen, bis sie gar sind.","checkText":"Ein Messer soll leicht hineingleiten."},
    {"text":"Währenddessen Apfel waschen, entkernen und klein würfeln. Zwiebel schälen und fein würfeln. Gewürzgurken klein schneiden."},
    {"text":"Sahnehering in eine Schüssel geben. Apfel, Zwiebel und Gurken unterheben."},
    {"text":"Schmand oder saure Sahne, Joghurt, Gurkenwasser und Dill einrühren."},
    {"text":"Mit Salz und Pfeffer abschmecken. Wenn Zeit ist, 10 Minuten ziehen lassen.","isStopPoint":true},
    {"text":"Kartoffeln abgießen und kurz ausdampfen lassen."},
    {"text":"Sahnehering mit den warmen Pellkartoffeln servieren."}
  ]'::jsonb,
  '[
    {"ingredient":"Schmand","substitute":"Saure Sahne oder Creme fraiche"},
    {"ingredient":"Joghurt","substitute":"Mehr Schmand oder saure Sahne"},
    {"ingredient":"Apfel","substitute":"Weglassen oder durch mehr Gewürzgurke ersetzen"}
  ]'::jsonb,
  '[
    {"problem":"Sauce ist zu dick","solution":"Etwas Gurkenwasser oder Joghurt einrühren."},
    {"problem":"Zu sauer","solution":"Mehr Schmand oder eine kleine Prise Zucker einrühren."},
    {"problem":"Kartoffeln sind noch hart","solution":"Weitere 5 Minuten kochen und erneut testen."}
  ]'::jsonb,
  true
),
(
  'Selbst belegte Pizza mit TK-Teig',
  'Schnelle Ofenpizza mit Pizzateig aus der Tiefkühlung, Sauce aus der Dose und deinen Lieblingsbelägen.',
  '/image_rettich.png',
  30, 2, 'basic',
  false, true, false, 7, 0,
  true,
  '{ofengericht,pizza}',
  '[
    {"name":"Pizzateig aus der Tiefkühlung","amount":"1","unit":"Packung"},
    {"name":"Pizza-Sauce","amount":"1","unit":"Dose"},
    {"name":"Geriebener Käse","amount":"150","unit":"g"},
    {"name":"Belag nach Wahl, z. B. Salami, Schinken oder Gemüse","amount":"nach","unit":"Geschmack"},
    {"name":"Olivenöl","amount":"1","unit":"TL"},
    {"name":"Oregano","amount":"1","unit":"TL"},
    {"name":"Salz und Pfeffer","amount":"nach","unit":"Geschmack"}
  ]'::jsonb,
  '[
    {"text":"Pizzateig nach Packungsangabe antauen lassen, falls nötig."},
    {"text":"Backofen nach Packungsangabe vorheizen, meist auf 220 °C Ober-/Unterhitze oder 200 °C Umluft."},
    {"text":"Backblech mit Backpapier auslegen und den Teig darauf ausrollen."},
    {"text":"Pizza-Sauce auf dem Teig verstreichen. Am Rand etwa 1 cm frei lassen."},
    {"text":"Mit Oregano, etwas Salz und Pfeffer würzen."},
    {"text":"Käse und Belag nach Wahl auf der Pizza verteilen."},
    {"text":"Optional etwas Olivenöl über den Rand träufeln."},
    {"text":"Pizza backen, bis der Rand goldbraun ist und der Käse blubbert.","checkText":"Wenn der Boden noch weich ist, 2–3 Minuten länger backen."},
    {"text":"Kurz abkühlen lassen, schneiden und servieren."}
  ]'::jsonb,
  '[
    {"ingredient":"Geriebener Käse","substitute":"Mozzarella, Gouda, Emmentaler oder veganer Reibekäse"},
    {"ingredient":"Pizza-Sauce","substitute":"Passierte Tomaten mit Oregano, Salz und Pfeffer"},
    {"ingredient":"Pizzateig aus der Tiefkühlung","substitute":"Frischer Pizzateig aus dem Kühlregal"}
  ]'::jsonb,
  '[
    {"problem":"Boden bleibt weich","solution":"Pizza ein paar Minuten länger auf der unteren Schiene backen."},
    {"problem":"Belag wird zu dunkel","solution":"Pizza auf eine tiefere Schiene schieben oder Temperatur etwas reduzieren."},
    {"problem":"Pizza ist wässrig","solution":"Wässrige Beläge wie Tomaten oder Pilze sparsamer verwenden oder vorher abtupfen."}
  ]'::jsonb,
  true
),
(
  'Gelbes Thai-Curry mit Hähnchen',
  'Mildes gelbes Curry mit fertiger Thai-Currypaste, Kokosmilch, Kartoffeln, grünen Bohnen und Reis.',
  '/image_rettich.png',
  40, 2, 'basic',
  true, false, false, 9, 2,
  false,
  '{curry,hähnchen}',
  '[
    {"name":"Jasminreis oder Basmatireis","amount":"150","unit":"g"},
    {"name":"Gelbe Thai-Currypaste","amount":"2","unit":"EL"},
    {"name":"Kokosmilch","amount":"1","unit":"Dose"},
    {"name":"Kartoffeln","amount":"300","unit":"g"},
    {"name":"Grüne Bohnen","amount":"200","unit":"g"},
    {"name":"Hähnchenbrust","amount":"250","unit":"g"},
    {"name":"Wasser oder Brühe","amount":"150","unit":"ml"},
    {"name":"Sojasauce oder Fischsauce","amount":"1","unit":"EL"},
    {"name":"Limettensaft oder Zitronensaft","amount":"1","unit":"TL"}
  ]'::jsonb,
  '[
    {"text":"Reis nach Packungsangabe waschen und kochen.","durationSeconds":900,"checkText":"Der Reis soll gar sein und noch leicht locker bleiben."},
    {"text":"Kartoffeln schälen und in kleine Würfel schneiden. Grüne Bohnen putzen und halbieren. Hähnchen in dünne Streifen schneiden."},
    {"text":"Currypaste in einem Topf bei mittlerer Hitze 1 Minute anrühren, damit sie duftet. Wenn sie ansetzt, einen kleinen Schuss Kokosmilch dazugeben."},
    {"text":"Kokosmilch und Wasser oder Brühe einrühren und aufkochen lassen."},
    {"text":"Kartoffeln dazugeben und 10 Minuten köcheln lassen.","checkText":"Die Kartoffeln sollen fast weich sein."},
    {"text":"Grüne Bohnen dazugeben und weitere 5 Minuten köcheln lassen.","checkText":"Die Bohnen sollen gar sein, aber noch etwas Biss haben."},
    {"text":"Topf vom Herd ziehen. Hähnchenstreifen in die heiße Sauce geben, gut unterrühren und mit Deckel ziehen lassen. Nicht mehr stark kochen.","isStopPoint":true,"checkText":"Das Hähnchen gart in der Resthitze und soll vollständig weiß und zart sein."},
    {"text":"Mit Sojasauce oder Fischsauce und etwas Limetten- oder Zitronensaft abschmecken."},
    {"text":"Curry mit Reis servieren."}
  ]'::jsonb,
  '[
    {"ingredient":"Hähnchenbrust","substitute":"Hähnchenschenkel ohne Knochen oder Tofu"},
    {"ingredient":"Grüne Bohnen","substitute":"Brokkoli, Zuckerschoten oder Paprika"},
    {"ingredient":"Gelbe Thai-Currypaste","substitute":"Rote Currypaste, dann vorsichtiger dosieren"}
  ]'::jsonb,
  '[
    {"problem":"Curry ist zu scharf","solution":"Mehr Kokosmilch einrühren."},
    {"problem":"Kartoffeln sind noch hart","solution":"Ein paar Minuten länger köcheln lassen, bevor das Hähnchen dazu kommt."},
    {"problem":"Hähnchen ist noch nicht gar","solution":"Topf nochmal sehr sanft erhitzen, aber nicht sprudelnd kochen lassen."}
  ]'::jsonb,
  true
),
(
  'Joghurt-Kräuter-Dressing',
  'Cremiges Dressing mit Mayo, Zitrone, Dill, Petersilie, Curry-Ketchup und Waldhonig.',
  '/image_rettich.png',
  10, 4, 'none',
  false, false, false, 13, 0,
  true,
  '{dressing,kein-herd,schnell,vegetarisch}',
  '[
    {"name":"Mayonnaise","amount":"6","unit":"EL"},
    {"name":"Zitronensaft, frisch","amount":"3","unit":"EL"},
    {"name":"Weißer Balsamicoessig","amount":"1","unit":"TL"},
    {"name":"Salz","amount":"1/2","unit":"TL"},
    {"name":"Pfeffer","amount":"1/4","unit":"TL"},
    {"name":"Dill","amount":"1","unit":"TL"},
    {"name":"Petersilie","amount":"2","unit":"TL"},
    {"name":"Curry-Ketchup","amount":"1,5","unit":"TL"},
    {"name":"Neutrales Öl","amount":"1","unit":"EL"},
    {"name":"Waldhonig","amount":"3","unit":"TL"},
    {"name":"Knoblauchpulver","amount":"1/2","unit":"TL"},
    {"name":"Zwiebelpulver","amount":"1/2","unit":"TL"},
    {"name":"Joghurt","amount":"1","unit":"EL"}
  ]'::jsonb,
  '[
    {"text":"Mayonnaise, Joghurt, Zitronensaft und weißen Balsamico in eine Schüssel geben."},
    {"text":"Salz, Pfeffer, Dill, Petersilie, Curry-Ketchup, Öl, Waldhonig, Knoblauchpulver und Zwiebelpulver dazugeben."},
    {"text":"Alles gründlich verrühren, bis das Dressing glatt und cremig ist."},
    {"text":"Abschmecken und bei Bedarf mit etwas Zitronensaft, Honig oder Salz anpassen."},
    {"text":"Bis zum Servieren kalt stellen."}
  ]'::jsonb,
  '[
    {"ingredient":"Mayonnaise","substitute":"Salatcreme oder mehr Joghurt"},
    {"ingredient":"Waldhonig","substitute":"Blütenhonig oder Ahornsirup"},
    {"ingredient":"Curry-Ketchup","substitute":"Ketchup plus eine kleine Prise Currypulver"}
  ]'::jsonb,
  '[
    {"problem":"Dressing ist zu dick","solution":"Teelöffelweise Wasser, Zitronensaft oder Joghurt einrühren."},
    {"problem":"Dressing ist zu sauer","solution":"Etwas Honig oder Mayo einrühren."},
    {"problem":"Dressing schmeckt zu kräftig","solution":"Mehr Joghurt einrühren."}
  ]'::jsonb,
  true
),
(
  'Gurkensalat mit Joghurt-Kräuter-Dressing',
  'Knackiger Gurken-Tomaten-Salat mit cremigem Joghurt-Kräuter-Dressing.',
  '/image_rettich.png',
  15, 2, 'basic',
  false, false, false, 7, 0,
  true,
  '{salat,kein-herd,schnell,vegetarisch,gemüse}',
  '[
    {"name":"Gurke","amount":"1","unit":"Stück"},
    {"name":"Tomaten","amount":"2","unit":"Stück"},
    {"name":"Rote Zwiebel","amount":"1/2","unit":"Stück"},
    {"name":"Mais","amount":"3","unit":"EL"},
    {"name":"Blattsalat oder Eisbergsalat","amount":"1","unit":"Handvoll"},
    {"name":"Joghurt-Kräuter-Dressing","amount":"3–4","unit":"EL"},
    {"name":"Salz und Pfeffer","amount":"nach","unit":"Geschmack"}
  ]'::jsonb,
  '[
    {"text":"Gurke und Tomaten waschen. Gurke in Scheiben schneiden, Tomaten würfeln."},
    {"text":"Rote Zwiebel fein schneiden. Blattsalat waschen und trocken schütteln."},
    {"text":"Gurke, Tomaten, Zwiebel, Mais und Blattsalat in eine Schüssel geben."},
    {"text":"Joghurt-Kräuter-Dressing separat zubereiten oder bereitstellen."},
    {"text":"Kurz vor dem Essen 3–4 EL Dressing unterheben."},
    {"text":"Mit Salz und Pfeffer abschmecken und sofort servieren."}
  ]'::jsonb,
  '[
    {"ingredient":"Rote Zwiebel","substitute":"Frühlingszwiebel oder weglassen"},
    {"ingredient":"Mais","substitute":"Paprika oder Radieschen"},
    {"ingredient":"Joghurt-Kräuter-Dressing","substitute":"Senf-Honig-Dressing"}
  ]'::jsonb,
  '[
    {"problem":"Salat wird wässrig","solution":"Dressing erst direkt vor dem Servieren untermischen."},
    {"problem":"Zwiebel ist zu scharf","solution":"Zwiebel kurz mit kaltem Wasser abspülen."}
  ]'::jsonb,
  true
),
(
  'Senf-Honig-Dressing',
  'Schnelles Dressing mit Dijon-Senf, Olivenöl, Apfelessig oder Zitrone, Honig und Knoblauch.',
  '/image_rettich.png',
  5, 4, 'none',
  false, false, false, 7, 0,
  true,
  '{dressing,kein-herd,schnell,vegetarisch}',
  '[
    {"name":"Dijon-Senf","amount":"2","unit":"EL"},
    {"name":"Olivenöl extra vergine","amount":"2","unit":"EL"},
    {"name":"Apfelessig oder frischer Zitronensaft","amount":"2","unit":"EL"},
    {"name":"Honig","amount":"1","unit":"EL"},
    {"name":"Knoblauchzehe, fein gerieben oder gehackt","amount":"1","unit":"klein"},
    {"name":"Meersalz","amount":"1/4","unit":"TL"},
    {"name":"Schwarzer Pfeffer","amount":"nach","unit":"Geschmack"}
  ]'::jsonb,
  '[
    {"text":"Dijon-Senf, Olivenöl, Apfelessig oder Zitronensaft und Honig in eine kleine Schüssel geben."},
    {"text":"Knoblauch, Meersalz und schwarzen Pfeffer dazugeben."},
    {"text":"Alles kräftig verrühren, bis das Dressing leicht cremig ist."},
    {"text":"Abschmecken: mehr Salz für Würze, mehr Honig für Süße oder mehr Zitrone für Frische."}
  ]'::jsonb,
  '[
    {"ingredient":"Dijon-Senf","substitute":"Mittelscharfer Senf"},
    {"ingredient":"Apfelessig","substitute":"Frischer Zitronensaft"},
    {"ingredient":"Honig","substitute":"Ahornsirup"}
  ]'::jsonb,
  '[
    {"problem":"Dressing trennt sich","solution":"Nochmals kräftig verrühren oder in einem Schraubglas schütteln."},
    {"problem":"Zu scharf vom Senf","solution":"Etwas mehr Honig und Olivenöl einrühren."}
  ]'::jsonb,
  true
),
(
  'Rucola-Apfel-Salat mit Senf-Honig-Dressing',
  'Frischer Rucola-Salat mit Apfel, Gurke, Walnüssen und Senf-Honig-Dressing.',
  '/image_rettich.png',
  15, 2, 'basic',
  false, false, false, 7, 0,
  true,
  '{salat,kein-herd,schnell,vegetarisch,gemüse}',
  '[
    {"name":"Rucola oder gemischter Blattsalat","amount":"2","unit":"Handvoll"},
    {"name":"Apfel","amount":"1","unit":"Stück"},
    {"name":"Gurke","amount":"1/2","unit":"Stück"},
    {"name":"Walnüsse","amount":"2","unit":"EL"},
    {"name":"Feta oder Ziegenkäse","amount":"50","unit":"g"},
    {"name":"Senf-Honig-Dressing","amount":"3","unit":"EL"},
    {"name":"Salz und Pfeffer","amount":"nach","unit":"Geschmack"}
  ]'::jsonb,
  '[
    {"text":"Rucola waschen und trocken schütteln."},
    {"text":"Apfel in dünne Spalten schneiden. Gurke in Scheiben schneiden."},
    {"text":"Walnüsse grob hacken. Feta oder Ziegenkäse zerbröseln."},
    {"text":"Senf-Honig-Dressing separat zubereiten oder bereitstellen."},
    {"text":"Rucola, Apfel, Gurke, Walnüsse und Käse in eine Schüssel geben."},
    {"text":"Kurz vor dem Servieren mit Dressing mischen und mit Salz und Pfeffer abschmecken."}
  ]'::jsonb,
  '[
    {"ingredient":"Rucola","substitute":"Feldsalat oder gemischter Blattsalat"},
    {"ingredient":"Walnüsse","substitute":"Sonnenblumenkerne oder Kürbiskerne"},
    {"ingredient":"Feta","substitute":"Ziegenkäse oder weglassen"}
  ]'::jsonb,
  '[
    {"problem":"Salat fällt schnell zusammen","solution":"Dressing erst kurz vor dem Essen dazugeben."},
    {"problem":"Apfel wird braun","solution":"Apfelspalten mit etwas Zitronensaft beträufeln."}
  ]'::jsonb,
  true
),
(
  'Sellerie-Schnitzel mit Jägersauce',
  'Vegetarische Sellerie-Schnitzel mit cremiger Pilz-Jägersauce, passend zu Kartoffeln, Püree oder Pommes.',
  '/image_rettich.png',
  55, 2, 'basic',
  true, false, true, 19, 3,
  false,
  '{vegetarisch,gemüse}',
  '[
    {"name":"Knollensellerie","amount":"1/2","unit":"Knolle"},
    {"name":"Mehl","amount":"4","unit":"EL"},
    {"name":"Eier","amount":"2","unit":"Stück"},
    {"name":"Paniermehl","amount":"8","unit":"EL"},
    {"name":"Salz und Pfeffer","amount":"nach","unit":"Geschmack"},
    {"name":"Öl zum Braten","amount":"nach","unit":"Bedarf"},
    {"name":"Pilze","amount":"250","unit":"g"},
    {"name":"Butter","amount":"1","unit":"EL"},
    {"name":"Gekörnte Brühe","amount":"2","unit":"TL"},
    {"name":"Kochendes Wasser","amount":"300","unit":"ml"},
    {"name":"Salbeiblätter","amount":"3","unit":"große"},
    {"name":"Rosmarin","amount":"1","unit":"kleiner Strauß"},
    {"name":"Frischer Oregano","amount":"1","unit":"großer Strauch"},
    {"name":"Thymian","amount":"1","unit":"kleines Sträußchen"},
    {"name":"Sojasauce","amount":"1","unit":"EL"},
    {"name":"Zwiebelpulver","amount":"1/2","unit":"TL"},
    {"name":"Knoblauchpulver","amount":"1/4","unit":"TL"},
    {"name":"Sahne","amount":"150–200","unit":"ml"},
    {"name":"Buko Frischkäse","amount":"1","unit":"EL"},
    {"name":"Saucenbinder","amount":"nach","unit":"Bedarf"},
    {"name":"Zuckerkulör","amount":"nach","unit":"Bedarf"}
  ]'::jsonb,
  '[
    {"text":"Sellerie schälen und in etwa 1 cm dicke Scheiben schneiden."},
    {"text":"Selleriescheiben in Salzwasser vorgaren, bis sie etwas weicher sind.","checkText":"Eine Gabel soll hineingehen, aber die Scheiben sollen noch stabil bleiben."},
    {"text":"Sellerie abgießen, trocken tupfen und mit Salz und Pfeffer würzen."},
    {"text":"Drei Teller vorbereiten: Mehl, verquirlte Eier und Paniermehl."},
    {"text":"Selleriescheiben erst in Mehl, dann in Ei und zuletzt in Paniermehl wenden."},
    {"text":"Pilze für die Jägersauce in dicke Scheiben schneiden."},
    {"text":"Pilze mit Butter bei mittel-hoher Hitze dünsten, bis austretendes Wasser verkocht ist und die Pilze leicht Farbe annehmen."},
    {"text":"Gekörnte Brühe in 300 ml kochendem Wasser lösen und durch ein Sieb zu den Pilzen geben, damit Gemüsestücke zurückbleiben."},
    {"text":"Salbei, Rosmarin, Oregano, Thymian, Pfeffer, Sojasauce, Zwiebelpulver und Knoblauchpulver zugeben."},
    {"text":"Pfanne von der Hitze nehmen und Sahne einrühren."},
    {"text":"Bei kleiner Hitze 5 Minuten ziehen lassen und regelmäßig umrühren.","checkText":"Die Sauce soll nur sanft heiß sein, nicht stark kochen."},
    {"text":"Buko einrühren, dann Saucenbinder zugeben und kurz aufkochen lassen."},
    {"text":"Mit Salz und Pfeffer abschmecken. Farbe nach Wunsch mit wenig Zuckerkulör anpassen."},
    {"text":"Sellerie-Schnitzel in Öl bei mittlerer Hitze von beiden Seiten goldbraun braten."},
    {"text":"Mit Jägersauce servieren. Dazu passen Kartoffeln, Kartoffelpüree oder Pommes."}
  ]'::jsonb,
  '[
    {"ingredient":"Knollensellerie","substitute":"Kohlrabi in dicken Scheiben"},
    {"ingredient":"Buko Frischkäse","substitute":"Normaler Frischkäse oder Creme fraiche"},
    {"ingredient":"Sahne","substitute":"Kochsahne oder Hafercuisine"},
    {"ingredient":"Frische Kräuter","substitute":"Getrocknete Kräuter, dann sparsamer dosieren"}
  ]'::jsonb,
  '[
    {"problem":"Sellerie ist noch zu hart","solution":"Scheiben vor dem Panieren ein paar Minuten länger vorkochen."},
    {"problem":"Panade fällt ab","solution":"Sellerie gut trocken tupfen und nach dem Panieren kurz liegen lassen."},
    {"problem":"Sauce ist zu dünn","solution":"Etwas mehr Saucenbinder einrühren und kurz aufkochen."},
    {"problem":"Sauce ist zu salzig","solution":"Mehr Sahne oder etwas Wasser einrühren."}
  ]'::jsonb,
  true
),
(
  'Thai Noodles mit Hähnchen',
  'Schnelle Thai-Nudeln mit Hähnchen, Paprika, Stangensellerie, Ingwer-Knoblauch und cremiger Erdnuss-Sesam-Sauce.',
  '/image_rettich.png',
  35, 4, 'basic',
  true, false, true, 17, 2,
  false,
  '{schnell,hähnchen,pasta}',
  '[
    {"name":"3-Minuten-Nudeln","amount":"5","unit":"Päckchen"},
    {"name":"Rote Paprika","amount":"1","unit":"Stück"},
    {"name":"Hähnchenbrust","amount":"400","unit":"g"},
    {"name":"Salz und Pfeffer","amount":"nach","unit":"Geschmack"},
    {"name":"Stangensellerie","amount":"3–4","unit":"Stangen"},
    {"name":"Zwiebel","amount":"1","unit":"Stück"},
    {"name":"Knoblauchzehe, püriert","amount":"1","unit":"Stück"},
    {"name":"Ingwer, püriert","amount":"2–3","unit":"cm"},
    {"name":"Sojasauce","amount":"6","unit":"EL"},
    {"name":"Fischsauce","amount":"8","unit":"Spritzer"},
    {"name":"Erdnussbutter","amount":"2–3","unit":"TL"},
    {"name":"Sesamöl","amount":"5","unit":"EL"},
    {"name":"Zitronensaft","amount":"1","unit":"Zitrone"},
    {"name":"Basilikum","amount":"1","unit":"TL"},
    {"name":"Sriracha oder rote Thai-Currypaste","amount":"1/2","unit":"TL"},
    {"name":"Sesamsamen","amount":"nach","unit":"Geschmack"},
    {"name":"Frühlingszwiebeln","amount":"nach","unit":"Geschmack"},
    {"name":"Geröstete Zwiebeln","amount":"nach","unit":"Geschmack"}
  ]'::jsonb,
  '[
    {"text":"Paprika, Stangensellerie und Zwiebel in kleine Würfel schneiden. Knoblauch und Ingwer fein reiben oder pürieren."},
    {"text":"Hähnchen in kleine Stücke schneiden und mit Salz und Pfeffer würzen."},
    {"text":"Sauce anrühren: Sojasauce, Fischsauce, Erdnussbutter, Sesamöl, Zitronensaft, Basilikum und Sriracha oder rote Thai-Currypaste gründlich verrühren."},
    {"text":"Nudeln nach Packungsangabe garen. Bei 3-Minuten-Nudeln reichen meist 3 Minuten.","durationSeconds":180,"checkText":"Die Nudeln sollen weich, aber nicht matschig sein."},
    {"text":"Hähnchen in einer großen Pfanne oder einem Wok bei mittlerer bis hoher Hitze anbraten, bis es gar ist.","checkText":"Das Hähnchen soll innen vollständig weiß sein."},
    {"text":"Zwiebel, Paprika und Stangensellerie dazugeben und 3–4 Minuten mitbraten.","checkText":"Das Gemüse soll noch etwas Biss haben."},
    {"text":"Knoblauch und Ingwer einrühren und kurz mitbraten."},
    {"text":"Nudeln und Sauce in die Pfanne geben und alles gut mischen."},
    {"text":"1–2 Minuten erhitzen, bis die Sauce die Nudeln überzieht."},
    {"text":"Mit Sesamsamen, Frühlingszwiebeln und gerösteten Zwiebeln bestreuen und servieren."}
  ]'::jsonb,
  '[
    {"ingredient":"Hähnchenbrust","substitute":"Tofu oder Garnelen"},
    {"ingredient":"Fischsauce","substitute":"Mehr Sojasauce plus etwas Limettensaft"},
    {"ingredient":"Erdnussbutter","substitute":"Cashewmus oder Tahin"},
    {"ingredient":"Stangensellerie","substitute":"Brokkoli, Zuckerschoten oder mehr Paprika"}
  ]'::jsonb,
  '[
    {"problem":"Sauce ist zu dick","solution":"Etwas heißes Nudelwasser einrühren."},
    {"problem":"Nudeln kleben","solution":"Mit etwas Sesamöl lösen und gut durchmischen."},
    {"problem":"Zu salzig","solution":"Mehr Zitronensaft, etwas Wasser oder ungewürzte Nudeln dazugeben."}
  ]'::jsonb,
  true
),
(
  'Cremige Knoblauch-Hähnchenbrust',
  'Zarte Hähnchenbrust in cremiger Knoblauch-Parmesan-Sauce mit optionalem knusprigem Bacon.',
  '/image_rettich.png',
  30, 4, 'basic',
  true, false, true, 12, 1,
  false,
  '{schnell,hähnchen}',
  '[
    {"name":"Hähnchenbrustfilets","amount":"2","unit":"Stück"},
    {"name":"Salz","amount":"2","unit":"TL"},
    {"name":"Schwarzer Pfeffer","amount":"1/2","unit":"TL"},
    {"name":"Knoblauchpulver","amount":"1","unit":"TL"},
    {"name":"Olivenöl","amount":"5","unit":"EL"},
    {"name":"Butter","amount":"2","unit":"EL"},
    {"name":"Zwiebel","amount":"1","unit":"klein"},
    {"name":"Knoblauchzehen","amount":"10–12","unit":"Stück"},
    {"name":"Hühnerbrühe","amount":"300","unit":"ml"},
    {"name":"Sahne","amount":"300","unit":"ml"},
    {"name":"Parmesan, fein gerieben","amount":"50","unit":"g"},
    {"name":"Knuspriger Bacon, optional","amount":"50","unit":"g"},
    {"name":"Petersilie, optional","amount":"2","unit":"EL"}
  ]'::jsonb,
  '[
    {"text":"Hähnchenbrustfilets waagerecht halbieren, sodass vier dünnere Stücke entstehen."},
    {"text":"Hähnchen mit Salz, Pfeffer und Knoblauchpulver würzen."},
    {"text":"Zwiebel fein würfeln. Knoblauch schälen. Etwa die Hälfte der Zehen mit der flachen Messerseite leicht andrücken."},
    {"text":"Olivenöl und 1 EL Butter in einer großen Pfanne erhitzen. Hähnchen von beiden Seiten goldbraun anbraten und garen.","checkText":"Das Hähnchen soll innen nicht mehr rosa sein."},
    {"text":"Hähnchen aus der Pfanne nehmen und warm stellen."},
    {"text":"Zwiebel in derselben Pfanne bei mittlerer Hitze weich dünsten."},
    {"text":"Restliches Öl und 1 EL Butter zugeben. Angedrückte und ganze Knoblauchzehen 2–3 Minuten sanft anbraten.","checkText":"Der Knoblauch soll duften, aber nicht dunkel werden."},
    {"text":"Hühnerbrühe angießen und den Pfannenboden lösen. Sauce etwa 5 Minuten einkochen lassen."},
    {"text":"Hitze reduzieren. Sahne einrühren und 2–3 Minuten leise köcheln lassen."},
    {"text":"Parmesan einrühren, bis er geschmolzen ist. Sauce mit Salz und Pfeffer abschmecken."},
    {"text":"Hähnchen zurück in die Pfanne legen und 2–3 Minuten in der Sauce ziehen lassen."},
    {"text":"Optional mit knusprigem Bacon und Petersilie bestreuen. Passt zu Pasta, Reis, Kartoffelpüree oder Gemüse."}
  ]'::jsonb,
  '[
    {"ingredient":"Hähnchenbrust","substitute":"Hähnchenschenkel ohne Knochen"},
    {"ingredient":"Sahne","substitute":"Kochsahne oder Cremefine"},
    {"ingredient":"Parmesan","substitute":"Grana Padano oder anderer Hartkäse"},
    {"ingredient":"Bacon","substitute":"Weglassen oder Speckwürfel verwenden"}
  ]'::jsonb,
  '[
    {"problem":"Sauce ist zu dünn","solution":"Ein paar Minuten länger sanft einkochen lassen oder mehr Parmesan einrühren."},
    {"problem":"Knoblauch wird dunkel","solution":"Hitze sofort reduzieren und mit Brühe ablöschen."},
    {"problem":"Hähnchen wird trocken","solution":"Nicht zu lange braten und am Ende nur kurz in der Sauce ziehen lassen."}
  ]'::jsonb,
  true
),
(
  'General-Tso-Blumenkohl',
  'Im Ofen gerösteter Blumenkohl in süß-scharfer General-Tso-Sauce mit Soja, Hoisin, Ingwer und Knoblauch.',
  '/image_rettich.png',
  40, 2, 'basic',
  true, true, true, 15, 2,
  false,
  '{vegetarisch,vegan,gemüse}',
  '[
    {"name":"Blumenkohlröschen","amount":"500–600","unit":"g"},
    {"name":"Rapsöl","amount":"2","unit":"EL"},
    {"name":"Speisestärke","amount":"2","unit":"EL"},
    {"name":"Sojasauce, salzarm","amount":"4","unit":"EL"},
    {"name":"Getrocknete rote Chilis","amount":"4–6","unit":"Stück"},
    {"name":"Reisessig","amount":"2","unit":"EL"},
    {"name":"Sesamöl","amount":"2","unit":"TL"},
    {"name":"Hoisin-Sauce","amount":"2","unit":"EL"},
    {"name":"Brauner Zucker","amount":"2","unit":"EL"},
    {"name":"Wasser","amount":"2","unit":"EL"},
    {"name":"Dunkle Sojasauce","amount":"1","unit":"EL"},
    {"name":"Ingwer, gerieben","amount":"1","unit":"EL"},
    {"name":"Knoblauchzehen, gerieben","amount":"4","unit":"Stück"},
    {"name":"Frisches Grün, z. B. Pak Choi oder Frühlingszwiebeln","amount":"nach","unit":"Geschmack"},
    {"name":"Gerösteter Sesam","amount":"nach","unit":"Geschmack"}
  ]'::jsonb,
  '[
    {"text":"Backofen auf 220 °C Ober-/Unterhitze vorheizen. Ein Backblech mit Backpapier auslegen."},
    {"text":"Blumenkohl in gleich große Röschen teilen."},
    {"text":"Rapsöl, 1 EL Speisestärke und 1 EL Sojasauce verrühren."},
    {"text":"Blumenkohl mit der Marinade gründlich mischen und auf dem Backblech verteilen."},
    {"text":"Blumenkohl 25–30 Minuten rösten und nach der Hälfte der Zeit wenden.","checkText":"Die Röschen sollen weich und an den Rändern goldbraun sein."},
    {"text":"Währenddessen die Sauce anrühren: 3 EL Sojasauce, Reisessig, Sesamöl, Hoisin-Sauce, braunen Zucker, Wasser, dunkle Sojasauce, Ingwer, Knoblauch und 1 TL Speisestärke glatt verrühren."},
    {"text":"Chilis in einer großen Pfanne oder einem Wok bei niedriger Hitze 1–2 Minuten anrösten.","checkText":"Sie sollen duften, aber nicht verbrennen."},
    {"text":"Sauce in die Pfanne geben und bei mittlerer Hitze aufkochen, bis sie leicht andickt."},
    {"text":"Gerösteten Blumenkohl in die Sauce geben und vorsichtig wenden, bis alles glänzend überzogen ist."},
    {"text":"Mit frischem Grün und geröstetem Sesam servieren. Dazu passen Reis, Nudeln oder gebratener Pak Choi."}
  ]'::jsonb,
  '[
    {"ingredient":"Rapsöl","substitute":"Olivenöl oder neutrales Pflanzenöl"},
    {"ingredient":"Sojasauce","substitute":"Tamari für eine glutenfreie Variante"},
    {"ingredient":"Brauner Zucker","substitute":"Honig oder Ahornsirup"},
    {"ingredient":"Hoisin-Sauce","substitute":"Mehr Sojasauce plus etwas Ahornsirup und Reisessig"},
    {"ingredient":"Speisestärke","substitute":"Tapioka- oder Pfeilwurzelstärke"}
  ]'::jsonb,
  '[
    {"problem":"Blumenkohl wird weich statt geröstet","solution":"Blech nicht überfüllen und die Röschen mit Abstand verteilen."},
    {"problem":"Sauce klumpt","solution":"Speisestärke vorher kalt mit den Saucenzutaten glatt rühren."},
    {"problem":"Zu scharf","solution":"Weniger Chilis verwenden oder die Chilis vor dem Servieren entfernen."},
    {"problem":"Sauce ist zu salzig","solution":"Etwas Wasser, Reis oder ungewürzten Blumenkohl dazugeben."}
  ]'::jsonb,
  true
),
(
  'Kartoffelrolle mit Hackfleisch und Spinat',
  'Eine herzhafte Rolle aus dünnen Kartoffelscheiben mit Parmesan, gefüllt mit Spinat-Ricotta und würzigem Hackfleisch.',
  '/image_rettich.png',
  105, 8, 'lots',
  true, true, true, 14, 3,
  false,
  '{auflauf,party,kartoffel}',
  '[
    {"name":"Kartoffeln","amount":"6","unit":"Stück"},
    {"name":"Parmesan, gerieben","amount":"220","unit":"g"},
    {"name":"Salz","amount":"3","unit":"TL"},
    {"name":"Olivenöl","amount":"4","unit":"EL"},
    {"name":"Süße Zwiebel","amount":"1","unit":"Stück"},
    {"name":"Rinderhackfleisch","amount":"450","unit":"g"},
    {"name":"Tomatenwürfel aus der Dose, abgetropft","amount":"410","unit":"g"},
    {"name":"Frische Petersilie","amount":"4","unit":"EL"},
    {"name":"Paprikapulver","amount":"1","unit":"TL"},
    {"name":"Pfeffer","amount":"1/2","unit":"TL"},
    {"name":"Spinat","amount":"240","unit":"g"},
    {"name":"Knoblauchzehen","amount":"2","unit":"Stück"},
    {"name":"Ricotta","amount":"250","unit":"g"},
    {"name":"Mozzarella, gerieben","amount":"100","unit":"g"}
  ]'::jsonb,
  '[
    {"text":"Backofen auf 180 °C Ober-/Unterhitze vorheizen. Ein Backblech mit Backpapier auslegen."},
    {"text":"Kartoffeln schälen und mit Messer oder Hobel in sehr dünne Scheiben schneiden, etwa 3 mm dick.","checkText":"Je gleichmäßiger die Scheiben sind, desto leichter lässt sich die Rolle später formen."},
    {"text":"Die Hälfte des Parmesans gleichmäßig auf dem Backpapier verteilen."},
    {"text":"Kartoffelscheiben überlappend auf den Parmesan legen, sodass ein zusammenhängendes Rechteck entsteht."},
    {"text":"Restlichen Parmesan über die Kartoffeln streuen und mit 1 TL Salz würzen."},
    {"text":"Kartoffelplatte etwa 30 Minuten backen, bis sie goldbraun, biegsam und an den Rändern leicht knusprig ist."},
    {"text":"Währenddessen 2 EL Olivenöl in einer Pfanne erhitzen. Zwiebel würfeln und bei mittlerer Hitze langsam weich und leicht karamellisiert braten."},
    {"text":"Hackfleisch zugeben und krümelig braten. Tomaten, 3 EL Petersilie, Paprikapulver, 1 TL Salz und Pfeffer einrühren. Weiterbraten, bis das Hack gar ist, dann vom Herd nehmen."},
    {"text":"In einer zweiten Pfanne 2 EL Olivenöl erhitzen. Spinat zusammenfallen lassen, dann Knoblauch und 1 TL Salz einrühren. Vom Herd nehmen."},
    {"text":"Spinatmischung mit Ricotta verrühren."},
    {"text":"Spinat-Ricotta gleichmäßig auf der gebackenen Kartoffelplatte verteilen."},
    {"text":"Hackfleischmischung darauf verteilen und mit Mozzarella bestreuen."},
    {"text":"Die Kartoffelplatte mithilfe des Backpapiers vorsichtig aufrollen. Darauf achten, dass die Füllung nicht an den Enden herausgedrückt wird."},
    {"text":"Rolle wieder auf das Backpapier setzen und weitere 15 Minuten backen, bis sie heiß ist und der Käse geschmolzen ist."},
    {"text":"Mit restlicher Petersilie bestreuen, in Scheiben schneiden und sofort servieren."}
  ]'::jsonb,
  '[
    {"ingredient":"Rinderhackfleisch","substitute":"Gemischtes Hack, vegetarisches Hack oder fein gewürfelte Pilze"},
    {"ingredient":"Ricotta","substitute":"Frischkäse oder körniger Frischkäse"},
    {"ingredient":"Mozzarella","substitute":"Gouda oder Emmentaler"},
    {"ingredient":"Spinat","substitute":"Mangold oder TK-Spinat, gut ausgedrückt"}
  ]'::jsonb,
  '[
    {"problem":"Kartoffelplatte reißt beim Rollen","solution":"Kartoffeln stärker überlappen lassen und die Platte vor dem Rollen 3–5 Minuten abkühlen lassen."},
    {"problem":"Füllung ist zu feucht","solution":"Tomaten gut abtropfen lassen und Spinat ausdrücken, bevor Ricotta dazukommt."},
    {"problem":"Rolle lässt sich schwer schneiden","solution":"Nach dem Backen 5 Minuten ruhen lassen und ein scharfes Messer verwenden."},
    {"problem":"Kartoffeln sind noch fest","solution":"Die Kartoffelplatte vor dem Füllen ein paar Minuten länger backen."}
  ]'::jsonb,
  true
);
