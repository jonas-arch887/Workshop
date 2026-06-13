# Frachthub Workshop — Offene Punkte

## Texte & Buttons
- [ ] Texte durchgehen und anpassen (Intro, Ergebnis-Screen, Bericht)
- [ ] Buttons prüfen und ggf. umbenennen / umgestalten

## Intro-Screen Animation
- [ ] LKW-Animation auf der Übersichtsseite anpassen (RouteMotif in `app.jsx`)

## PDF-Erstellung
- [ ] PDF-Generierung verbessern (aktuell nur Browser-Druckdialog via `window.print()`)
- [ ] Layout und Styles für den PDF-Export optimieren

## Datenbank (Supabase)
- [ ] Supabase-Projekt anlegen / Tabelle für Workshop-Antworten definieren
- [ ] Antworten beim Absenden in Supabase speichern (statt nur localStorage)
- [ ] Abruf der gespeicherten Antworten im Supabase-Dashboard möglich

## Security
- [ ] Sicherheitscheck der gesamten App (Input-Validierung, XSS, Datenweitergabe)

## Webhook & n8n
- [ ] Webhook-Endpoint in n8n anlegen
- [ ] Beim Absenden (ResultScreen) Formulardaten per POST an Webhook schicken
- [ ] n8n Workflow bauen: Daten empfangen → PDF erzeugen → per E-Mail versenden
