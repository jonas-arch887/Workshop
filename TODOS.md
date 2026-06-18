# Frachthub Workshop — Offene Punkte

## Texte & Buttons
- [x] Texte durchgehen und anpassen (Intro, Ergebnis-Screen, Bericht)
- [x] Texte in report.jsx angleichen (PDF-Bericht: "Wie es weitergeht"-Schritte, Lead-Texte)
- [x] Buttons prüfen und ggf. umbenennen / umgestalten

## Report Download
- [x] Report-Download / PDF-Versand per E-Mail einrichten (n8n Workflow, Gotenberg, Gmail)

## Webhook & n8n
- [x] Webhook-Endpoint in n8n anlegen
- [x] n8n Workflow bauen: Daten empfangen → PDF erzeugen → per E-Mail versenden
- [ ] Frontend: Beim Absenden (ResultScreen) Formulardaten per POST an Webhook schicken

## Text Check
- [ ] Gesamten Flow einmal durchgehen und alle Texte final abnehmen

## Intro-Screen Animation
- [x] LKW-Animation auf der Übersichtsseite anpassen (RouteMotif in `app.jsx`)

## PDF-Erstellung
- [x] PDF-Generierung verbessern (via Gotenberg + n8n, kein Browser-Druckdialog mehr)
- [x] PDF-Download Funktion entfernen — alles läuft über den Report-Versand per Mail

## Datenbank (Supabase)
- [ ] Supabase-Projekt anlegen / Tabelle für Workshop-Antworten definieren
- [ ] Antworten beim Absenden in Supabase speichern (statt nur localStorage)
- [ ] Abruf der gespeicherten Antworten im Supabase-Dashboard möglich

## Security
- [ ] Sicherheitscheck der gesamten App (Input-Validierung, XSS, Datenweitergabe)
