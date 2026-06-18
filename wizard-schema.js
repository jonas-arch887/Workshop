/* =========================================================
   FrachtHub Analyse-Workshop — Inhalts-Schema (Abschnitt 4 der MD)
   Wortlaut & Reihenfolge der Fragen 1:1 übernommen.
   window.FH = { blocks, taetigkeitOptions, ... }
   ========================================================= */
(function () {
  // Tätigkeitsbereich — steuert Block 9 (Produktion × Logistik)
  const PRODUKTION = "Produktion mit eigener Logistikabteilung";

  const blocks = [
    /* ---------------- BLOCK 1 — Kontext ---------------- */
    {
      id: "b1",
      num: 1,
      kicker: "Unternehmen & Struktur",
      title: "Erst der Kontext.",
      intro:
        "Kurzer Abgleich vorab: Das ist nur ein kleiner Setup-Block ohne Bewertung. So stellen wir sicher, dass wir im Workshop alle die gleiche Ausgangsbasis haben.",
      fields: [
        { id: "unternehmen", type: "text", label: "Unternehmensname", placeholder: "z. B. Müller Spedition GmbH" },
        { id: "ansprechpartner", type: "text", label: "Ansprechpartner", placeholder: "z. B. Anna Berg" },
        {
          id: "taetigkeit", type: "multi", label: "Tätigkeitsbereich",
          help: "Mehrfachauswahl möglich.",
          options: [
            "Sammelgut",
            "Teil-/Komplettladung (LTL/FTL)",
            "Lagerlogistik/Kontraktlogistik",
            PRODUKTION,
            "Sonstiges",
          ],
          otherOn: "Sonstiges", otherLabel: "Was genau?",
        },
        { id: "standorte", type: "number", half: true, label: "Anzahl Standorte", min: 1, suffix: "Standorte" },
        { id: "mitarbeiter_gesamt", type: "number", half: true, label: "Mitarbeiter gesamt", suffix: "Personen" },
        { id: "mitarbeiter_dispo", type: "number", half: true, label: "davon in Disposition / Verwaltung", suffix: "Personen" },
        { id: "fuhrpark_eigene", type: "number", half: true, label: "Eigene Fahrzeuge", suffix: "Fahrzeuge" },
        { id: "subunternehmer", type: "slider", label: "Anteil Subunternehmer", min: 0, max: 100, suffix: "%" },
        { id: "kundenbranchen", type: "textarea", label: "Wichtigste Kundenbranchen / Auftragsschwerpunkt", placeholder: "z. B. Automotive-Zulieferer, Lebensmittel, Baustoffe …" },
      ],
    },

    /* ---------------- BLOCK 2 — Dispo ---------------- */
    {
      id: "b2",
      num: 2,
      kicker: "Dispo, Tourenplanung & Kapazität",
      title: "Wie Touren entstehen.",
      intro: "Wie eure Touren aktuell entstehen und wie viel Potenzial ihr dabei auf der Straße liegen lasst.",
      area: "Dispo, Tourenplanung & Kapazitätsauslastung",
      module: "Automatische Tourenplanung & Kapazitäts­ausgleich",
      sections: [
        {
          label: "Problem", fields: [
            { id: "b2_q1", type: "scale", label: "Wie oft kam es in den letzten 3 Monaten vor, dass ein LKW eine Tour mit deutlich unter 80 % Auslastung (Tonnage/Lademeter) gefahren ist?", options: ["Nie", "Selten", "Mehrmals pro Monat", "Wöchentlich"] },
            { id: "b2_q2", type: "textarea", label: "Was passiert, wenn euch kurzfristig eine Fracht abspringt? Wie läuft die Suche nach Ersatz bei euch ab und wie viel Zeit geht dabei im Schnitt verloren?" },
            { id: "b2_q3", type: "number", label: "Wie viele Stunden verbringt eure Dispo täglich mit der manuellen Tourenplanung und den ganzen Anpassungen?", suffix: "Std/Tag" },
          ],
        },
        {
          label: "Lösung", fields: [
            { id: "b2_q4", type: "yesno", label: "Nutzt ihr ein System, das Touren automatisch nach Kapazitätslogik (max. Gewicht/Lademeter) und geografischer Nähe zusammenstellt?" },
            { id: "b2_q5", type: "choice", label: "Kennt ihr eure Selbstkosten pro km bzw. pro Tour genau, oder basiert die Preiskalkulation eher auf Erfahrungswerten?", options: ["Genau bekannt", "Erfahrungswerte"] },
            { id: "b2_q6", type: "yesno", label: "Gibt es bei euch eine automatische Frühwarnung bei Tour-Verzögerungen oder erfährt der Kunde das erst auf Nachfrage?" },
          ],
        },
      ],
    },

    /* ---------------- BLOCK 3 — Standortübergreifend (cond) ---------------- */
    {
      id: "b3",
      num: 3,
      kicker: "Standortübergreifende Kommunikation",
      title: "Wie Standorte voneinander wissen.",
      intro: "Wie eure Standorte erfahren, wo gerade Kapazität frei ist und wo Ladung wartet.",
      area: "Standortübergreifende Kommunikation",
      module: "Kapazitäts- & Leerfahrten-Ausgleich (intern)",
      condKey: "standorte_multi",
      condNote: "Wird angezeigt, weil ihr mehr als einen Standort betreibt.",
      sections: [
        {
          label: "Problem", fields: [
            { id: "b3_q1", type: "textarea", label: "Wie läuft aktuell die Kommunikation zwischen euren Standorten ab?", placeholder: "z. B. Telefon, E-Mail, WhatsApp …" },
            { id: "b3_q2", type: "scale", label: "Wie oft kam es schon vor, dass ein Standort eine passende Rückfracht für einen anderen gehabt hätte, man davon aber gar nichts oder einfach zu spät erfahren hat?", options: ["Nie", "Selten", "Häufig"] },
            { id: "b3_q3", type: "text", label: "Wenn ein Standort eine Anfrage an die Kollegen stellt, wie viel Zeit vergeht dann im Schnitt bis zur Rückmeldung?", placeholder: "z. B. ca. 4 Stunden" },
          ],
        },
        {
          label: "Lösung", fields: [
            { id: "b3_q4", type: "yesno", label: "Gibt es ein zentrales System, in dem alle Standorte ihre freien Kapazitäten in Echtzeit sehen können?" },
            { id: "b3_q5", type: "choice", label: "Werden standortübergreifende Anfragen dokumentiert und nachverfolgt, oder laufen sie informell über persönliche Kontakte?", options: ["Dokumentiert", "Informell"] },
          ],
        },
      ],
    },

    /* ---------------- BLOCK 4 — Auftragsabwicklung ---------------- */
    {
      id: "b4",
      num: 4,
      kicker: "Auftragsabwicklung & Dokumente",
      title: "Vom Auftrag bis zum Dokument.",
      intro: "Wie aus einem eingehenden Auftrag die fertigen Dokumente auf dem Display eurer Fahrer werden.",
      area: "Auftragsabwicklung & Dokumente",
      module: "Dokumentenverarbeitung & Lieferscheine",
      sections: [
        {
          label: "Problem", fields: [
            { id: "b4_q1", type: "textarea", label: "Wie läuft die Erstellung und Ausgabe von Lieferscheinen und Frachtbriefen aktuell ab? Läuft das bei euch noch auf Papier oder schon komplett digital?" },
            { id: "b4_q2", type: "text", label: "Wie viel Zeit geht pro Auftrag fürs Erfassen/Übertragen von Dokumenten (Frachtbrief, Rechnung, Zollpapiere) in eure Systeme verloren?", placeholder: "z. B. 15 Min/Auftrag oder 2 Std/Tag" },
            { id: "b4_q3", type: "scale", label: "Wie oft kommt es zu Verzögerungen am Hof, weil Fahrer auf Papierdokumente warten müssen?", options: ["Nie", "Selten", "Häufig", "Täglich"] },
          ],
        },
        {
          label: "Lösung", fields: [
            { id: "b4_q4", type: "choice", label: "Werden Dokumente (Frachtbrief, Rechnung etc.) automatisch zwischen euren Systemen (TMS/ERP, Buchhaltung) übertragen, oder manuell mehrfach eingegeben?", options: ["Automatisch", "Manuell"] },
            { id: "b4_q5", type: "choice", label: "Erhalten eure Fahrer Dokumente digital (App/Scanner), oder läuft das über Papier?", options: ["Digital", "Papier", "Gemischt"] },
          ],
        },
      ],
    },

    /* ---------------- BLOCK 5 — Kunden-Kommunikation ---------------- */
    {
      id: "b5",
      num: 5,
      kicker: "Kunden-Kommunikation & Follow-up",
      title: "Wie schnell der Kunde Antwort bekommt.",
      intro: "Ein Blick auf die Reaktionszeit: Wie schnell reagiert ihr auf Anfragen und wie verlässlich läuft das anschließende Nachfassen?",
      area: "Kunden-Kommunikation & Follow-up",
      module: "E-Mail-Triage & Follow-up-Automation",
      sections: [
        {
          label: "Problem", fields: [
            { id: "b5_q1", type: "text", label: "Wie viele E-Mails mit Statusanfragen („Wo ist meine Sendung?“, „Wann kommt das an?“) bekommt ihr ungefähr pro Tag oder Woche?", placeholder: "z. B. ca. 30 / Tag" },
            { id: "b5_q2", type: "text", label: "Wie lange dauert es im Schnitt, bis eine Anfrage oder ein Angebot beantwortet wird?", placeholder: "z. B. ca. 6 Stunden" },
            { id: "b5_q3", type: "scale", label: "Wie oft passiert es, dass bei einem offenen Angebot kein Follow-up erfolgt und der Kunde dann nichts mehr von euch hört?", options: ["Nie", "Selten", "Häufig"] },
          ],
        },
        {
          label: "Lösung", fields: [
            { id: "b5_q4", type: "yesno", label: "Gibt es eine automatische Erstantwort oder Kategorisierung für eingehende Anfragen?" },
            { id: "b5_q5", type: "choice", label: "Läuft das Follow-up bei offenen Angeboten strukturiert/automatisiert, oder müssen einzelne Mitarbeiter daran denken?", options: ["Strukturiert", "Liegt bei Mitarbeitern"] },
          ],
        },
      ],
    },

    /* ---------------- BLOCK 6 — IT-Systeme ---------------- */
    {
      id: "b6",
      num: 6,
      kicker: "IT-Systeme & Schnittstellen",
      title: "Ob eure Systeme miteinander reden.",
      intro: "Sprechen eure Systeme eigentlich miteinander oder arbeiten sie eher nebeneinander her?",
      area: "IT-Systeme & Schnittstellen",
      module: "Schnittstellen & KPI-Dashboards",
      sections: [
        {
          label: "Problem", fields: [
            { id: "b6_q1", type: "textarea", label: "Welche Software-Systeme nutzt ihr aktuell (TMS/ERP, Buchhaltung, CRM, Microsoft 365 etc.), und wie gut tauschen die Daten miteinander aus?" },
            { id: "b6_q2", type: "number", label: "Wie viel Zeit verbringt euer Team insgesamt pro Woche damit, Daten manuell zwischen Systemen zu übertragen oder abzugleichen?", suffix: "Std/Woche" },
            { id: "b6_q3", type: "choice", label: "Wie aktuell sind eure KPI-Auswertungen wie Umsatz und Auslastung? Habt ihr die Zahlen täglich parat oder werden sie erst am Monatsende mühsam zusammengetragen?", options: ["Echtzeit / täglich", "Wöchentlich", "Monatlich"] },
          ],
        },
        {
          label: "Lösung", fields: [
            { id: "b6_q4", type: "choice", label: "Sind eure wichtigsten Systeme (TMS/ERP, Microsoft 365, Buchhaltung) miteinander verbunden, oder arbeitet ihr mit Insellösungen?", options: ["Verbunden", "Insellösungen"] },
            { id: "b6_q5", type: "choice", label: "Habt ihr ein automatisiertes Dashboard/Reporting für eure wichtigsten Kennzahlen, oder wird das manuell in Excel zusammengestellt?", options: ["Automatisiert", "Manuell in Excel"] },
          ],
        },
      ],
    },

    /* ---------------- BLOCK 7 — Team & Wissen ---------------- */
    {
      id: "b7",
      num: 7,
      kicker: "Team, Wissen & Onboarding",
      title: "Was passiert, wenn Wissen ausfällt.",
      intro: "Was passiert, wenn das Wissen einzelner Köpfe gerade nicht da ist?",
      area: "Team, Wissen & Onboarding",
      module: "Wissensdokumentation & Vertretung",
      sections: [
        {
          label: "Problem", fields: [
            { id: "b7_q1", type: "textarea", label: "Wenn ein erfahrener Mitarbeiter wie ein Disponent krank wird oder in den Urlaub geht, läuft das Geschäft dann bei euch ganz normal weiter oder entstehen sofort spürbare Lücken?" },
            { id: "b7_q2", type: "text", label: "Wie lange dauert es im Schnitt, bis ein neuer Mitarbeiter in Disposition/Verwaltung eigenständig arbeiten kann?", placeholder: "z. B. ca. 3 Monate" },
            { id: "b7_q3", type: "scale", label: "Wie oft werden Mitarbeiter pro Tag durch Rückfragen von Kollegen unterbrochen, die eigentlich woanders dokumentiert sein könnten?", options: ["Selten", "Mehrmals täglich", "Ständig"] },
          ],
        },
        {
          label: "Lösung", fields: [
            { id: "b7_q4", type: "yesno", label: "Gibt es eine zentrale Dokumentation für wiederkehrende Abläufe (Wiki, Handbuch o. ä.), die jeder einsehen kann?" },
            { id: "b7_q5", type: "choice", label: "Werden neue Kollegen nach einem festen Plan eingearbeitet oder läuft das eher so ab, dass man direkt in die Praxis geworfen wird und den anderen über die Schulter schaut?", options: ["Strukturiert", "Praxis"] },
          ],
        },
      ],
    },

    /* ---------------- BLOCK 8 — Reklamationen ---------------- */
    {
      id: "b8",
      num: 8,
      kicker: "Reklamationen & Qualität",
      title: "Aus Reklamationen lernen.",
      intro: "Wie aus Reklamationen echte Lehren gezogen werden oder das wertvolle Feedback am Ende eben doch einfach verpufft.",
      area: "Reklamationen & Qualität",
      module: "Reklamations- & Schadensbearbeitung",
      sections: [
        {
          label: "Problem", fields: [
            { id: "b8_q1", type: "textarea", label: "Wie viele Reklamationen/Schadensmeldungen bearbeitet ihr durchschnittlich pro Monat, und wie läuft das aktuell ab (wer erfasst, wer leitet weiter)?" },
            { id: "b8_q2", type: "number", label: "Wie lange dauert es im Schnitt von der Meldung einer Reklamation bis zur Klärung?", suffix: "Tage" },
            { id: "b8_q3", type: "scale", label: "Wie oft kommt es vor, dass die gleiche Art von Reklamation immer wieder auftaucht, ohne dass die Ursache behoben wird?", options: ["Nie", "Selten", "Häufig"] },
          ],
        },
        {
          label: "Lösung", fields: [
            { id: "b8_q4", type: "choice", label: "Erfasst ihr Reklamationen und Schadensfälle systematisch nach klaren Kriterien wie Ursache und Häufigkeit oder reagiert ihr eher spontan und von Fall zu Fall?", options: ["Systematisch", "Spontan"] },
            { id: "b8_q5", type: "yesno", label: "Gibt es einen automatisierten Workflow, der Reklamationen direkt an die richtige Stelle/Person weiterleitet?" },
          ],
        },
      ],
    },

    /* ---------------- BLOCK 9 — Produktion × Logistik (cond) ---------------- */
    {
      id: "b9",
      num: 9,
      kicker: "Produktion × Logistik",
      title: "Wo Produktion und Versand den Takt verlieren.",
      intro: "Wo Produktion und Versand den gemeinsamen Takt verlieren.",
      area: "Produktion × Logistik",
      module: "Schnittstellen & interne Eskalation",
      condKey: "produktion",
      condNote: "Wird angezeigt, weil ihr eine eigene Logistikabteilung in der Produktion betreibt.",
      sections: [
        {
          label: "Problem", fields: [
            { id: "b9_q1", type: "textarea", label: "Der Informationsfluss zwischen Produktion und Versand: Läuft die Fertigmeldung automatisch über euer System oder per manuellem Zuruf?" },
            { id: "b9_q2", type: "scale", label: "Wie oft verzögert sich die Versandplanung, weil Infos aus der Produktion zu spät bei der Logistik ankommen?", options: ["Nie", "Selten", "Häufig"] },
            { id: "b9_q3", type: "choice", label: "Wie läuft der Abgleich zwischen dem Wareneingang von euren Lieferanten und dem Lagerbestand im ERP ab? Geht das schon automatisch oder müsst ihr das noch manuell eintragen?", options: ["Automatisch", "Manuell"] },
          ],
        },
        {
          label: "Lösung", fields: [
            { id: "b9_q4", type: "choice", label: "Sind Produktionsplanung und Logistik/Versand in einem gemeinsamen System verbunden, oder laufen das getrennte Tools/Abteilungen?", options: ["Verbunden", "Getrennt"] },
            { id: "b9_q5", type: "yesno", label: "Gibt es eine automatische Benachrichtigung an die Logistik, sobald ein Produktionsauftrag fertiggestellt ist?" },
          ],
        },
      ],
    },

    /* ---------------- BLOCK 10 — Ziele ---------------- */
    {
      id: "b10",
      num: 10,
      kicker: "Ziele & Ambitionen",
      title: "Wohin ihr wollt.",
      intro: "Ein Blick auf eure Ziele: Wo soll die Reise hingehen und welche Hürden stehen euch heute noch im Weg?",
      fields: [
        { id: "b10_q1", type: "textarea", label: "Was ist euer wichtigstes geschäftliches Ziel für die nächsten 6–12 Monate?", placeholder: "z. B. Wachstum, neue Standorte, höhere Marge, Digitalisierung …" },
        { id: "b10_q2", type: "choice", label: "Wo steht ihr aktuell auf dem Weg zu diesem Ziel?", options: ["Ganz am Anfang", "Mittendrin", "Kurz vor dem Ziel"] },
        { id: "b10_q3", type: "textarea", label: "Was ist aktuell die größte Bremse, die euch davon abhält, dieses Ziel zu erreichen?" },
        { id: "b10_q4", type: "textarea", label: "Wer ist neben dir an Entscheidungen über neue Tools/Prozesse typischerweise beteiligt?", placeholder: "z. B. Geschäftsführung, IT, Standortleiter …" },
      ],
    },

    /* ---------------- BLOCK 11 — Abschluss ---------------- */
    {
      id: "b11",
      num: 11,
      kicker: "Abschluss",
      title: "Die größten Hebel.",
      intro: "Die drei Dinge, die am meisten Zeit und Geld kosten.",
      fields: [
        { id: "b11_zeit", type: "triple", label: "Eure Top 3 Zeitfresser im Tagesgeschäft", placeholders: ["Zeitfresser 1", "Zeitfresser 2", "Zeitfresser 3"] },
        { id: "b11_kosten", type: "triple", label: "Eure Top 3 Kostentreiber, die ihr gerne reduzieren würdet", placeholders: ["Kostentreiber 1", "Kostentreiber 2", "Kostentreiber 3"] },
        { id: "b11_motiv", type: "textarea", label: "Was hat euch dazu bewegt, euch mit KI / Automatisierung zu beschäftigen?" },
      ],
    },
  ];

  window.FH = { blocks, PRODUKTION };
})();
