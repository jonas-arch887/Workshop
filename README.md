# Frachthub — Analyse-Workshop (Fragebogen + Analyse-Bericht)

Eine lauffähige Web-App: ein mehrstufiger Analyse-Fragebogen für Speditionen,
der am Ende einen **druckbaren Analyse-Bericht (PDF)** aus den Antworten erzeugt.
Reines HTML + React (über Babel im Browser) — **kein Build-Step, kein npm nötig**.

\---

## Schnellstart

Die App lädt React/Babel über CDN, braucht aber wegen der lokalen `.jsx`/`.css`/
Font-Dateien einen **lokalen Webserver** (nicht per Doppelklick `file://` öffnen,
sonst blockiert der Browser das Nachladen der Dateien).

```bash
# im Projektordner:
python3 -m http.server 8000
#  → http://localhost:8000/Analyse-Workshop.html

# oder mit Node:
npx serve .
```

VS Code: Erweiterung **„Live Server"** installieren → Rechtsklick auf
`Analyse-Workshop.html` → *Open with Live Server*.

\---

## Dateien

|Datei|Inhalt|
|-|-|
|`Analyse-Workshop.html`|Einstiegspunkt. Lädt React + Babel (CDN), alle Skripte und das gesamte CSS (im `<style>`-Block).|
|`wizard-schema.js`|**Inhalt** des Fragebogens: alle 11 Blöcke, Fragen, Antworttypen, bedingte Logik. `window.FH = { blocks, PRODUKTION }`. Hier Fragen ändern/ergänzen.|
|`app.jsx`|Die Wizard-App: Navigation, Felder-Rendering, Speicherung (localStorage), Priorisierung, Ergebnis-Screen, Tweaks.|
|`report.jsx`|Der **Analyse-Bericht** (hell, druckbar). Umschalter „Alle Fragen / Nur beantwortete", Button „Als PDF speichern". `window.ReportView`.|
|`tweaks-panel.jsx`|Optionales Tweak-Panel (Akzent / Hintergrund / Übergänge).|
|`colors\_and\_type.css`|Design-Tokens (Farben, Typo) + Manrope `@font-face`.|
|`assets/`|Wortmarken (SVG, schwarz/weiß) + weißes Logo-Mark.|
|`fonts/`|Manrope (selbst gehostet, .ttf).|

\---

## Der PDF-Bericht

Es gibt **keine separate PDF-Datei** — der Bericht wird live aus den Antworten
generiert. Ablauf in der App:

1. Fragebogen ausfüllen → **„Analyse absenden"**.
2. Auf dem Ergebnis-Screen **„Bericht ansehen"**.
3. Im Bericht oben umschalten zwischen **„Alle Fragen"** (vollständige
Dokumentation, unbeantwortete Fragen als *„Nicht beantwortet"*) und
**„Nur beantwortete"**.
4. **„Als PDF speichern"** öffnet den Druckdialog. Das `@media print`-CSS in
`Analyse-Workshop.html` blendet alles außer dem Bericht-Dokument aus
(A4, FrachtHub-Branding) → als PDF speichern.

Den Inhalt/Aufbau des Berichts (Layout, Texte, „Wie es weitergeht", Footer mit
Kontakt) bearbeitest du in `report.jsx`. Die Druck-Styles (`@media print`) stehen
am Ende des `<style>`-Blocks in `Analyse-Workshop.html`.

\---

## Wo was anpassen

* **Fragen ändern/hinzufügen** → `wizard-schema.js`. Jeder Block hat `fields`
oder `sections` (Problem/Lösung). Antworttypen: `text`, `textarea`, `number`,
`slider`, `yesno`, `choice`, `scale`, `multi`, `triple`.
* **Bedingte Blöcke** → Feld `condKey` (`standorte\_multi`, `produktion`); Logik
in `app.jsx` → `blockActive()`.
* **Farben / Schrift** → `colors\_and\_type.css` und der `:root`-Block in
`Analyse-Workshop.html`.
* **Bericht-Layout / Texte / PDF** → `report.jsx` + `@media print` in der HTML.
* **Versand (n8n/CRM)**: Aktuell wird nur lokal gespeichert (localStorage,
Key `fh\_workshop\_v1`) und der Bericht im Browser gedruckt. Eine echte
Übermittlung an FrachtHub/Kunde ist als TODO im Code angedeutet
(`SubmitScreen` / E-Mail-Feld) und muss serverseitig angebunden werden.

\---

## Hinweise

* Die Antworten liegen **nur im Browser** (localStorage). Kein Backend.
* `colors\_and\_type.css` referenziert `Manrope-ExtraLight.ttf` (Weight 200), die
nicht mitgeliefert ist — unkritisch (`font-display: swap`, kaum genutzt). Bei
Bedarf Datei ergänzen oder die `@font-face`-Zeile entfernen.
* React/Babel kommen per CDN; für reinen Offline-Betrieb React/ReactDOM/Babel
lokal ablegen und die `<script src>` in der HTML umbiegen.

