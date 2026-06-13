/* =========================================================
   FrachtHub Analyse-Workshop — Analyse-Bericht (hell, druckbar)
   Wird aus den Antworten generiert; im echten Stack als PDF
   per n8n an den Kunden + Benachrichtigung an FrachtHub.
   Exports: window.ReportView, window.fhFormatAnswer
   ========================================================= */
(function () {
  const { useEffect, useState } = React;

  function fhFormatAnswer(field, answers) {
    if (field.type === "triple") {
      const vals = (field.placeholders || []).map((_, i) => answers[field.id + "_" + i]).filter((v) => v && String(v).trim());
      return vals.length ? vals : null;
    }
    if (field.type === "multi") {
      let arr = answers[field.id] || [];
      if (!arr.length) return null;
      if (field.otherOn && arr.includes(field.otherOn) && answers[field.id + "_other"]) {
        arr = arr.map((o) => (o === field.otherOn ? field.otherOn + ": " + answers[field.id + "_other"] : o));
      }
      return arr.join(" · ");
    }
    const v = answers[field.id];
    if (v == null || String(v).trim() === "") return null;
    if (field.type === "slider") return v + (field.suffix || "");
    if (field.type === "number" && field.suffix) return v + " " + field.suffix;
    return String(v);
  }

  function blockFields(block) {
    if (block.fields) return block.fields.map((f) => ({ field: f, group: null }));
    const out = [];
    (block.sections || []).forEach((s) => s.fields.forEach((f) => out.push({ field: f, group: s.label })));
    return out;
  }

  function AnsweredBlock({ block, answers, showAll }) {
    let rows = blockFields(block)
      .map(({ field, group }) => ({ field, group, val: fhFormatAnswer(field, answers) }));
    if (!showAll) rows = rows.filter((r) => r.val != null);
    if (rows.length === 0) return null;
    return (
      <section className="report-block">
        <div className="report-block-head">
          <span className="report-block-num">{String(block.num).padStart(2, "0")}</span>
          <h3>{block.kicker}</h3>
        </div>
        <div className="report-qa">
          {rows.map((r, i) => (
            <div className="report-row" key={i}>
              <div className="report-q">{r.group && <span className={"report-tag report-tag--" + (r.group === "Problem" ? "p" : "l")}>{r.group}</span>}{r.field.label}</div>
              {r.val == null
                ? <div className="report-a report-a--empty">Nicht beantwortet</div>
                : Array.isArray(r.val)
                ? <ul className="report-a-list">{r.val.map((x, j) => <li key={j}>{x}</li>)}</ul>
                : <div className="report-a">{r.val}</div>}
            </div>
          ))}
        </div>
      </section>
    );
  }

  function ReportView({ blocks, answers, ranking, themes, email, onClose }) {
    const [showAll, setShowAll] = useState(true);
    useEffect(() => {
      const onKey = (e) => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const top = ranking.map((id, i) => ({ ...themes.find((x) => x.id === id), pos: i + 1 })).filter((x) => x.area);
    const date = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
    const firma = answers.unternehmen || "—";
    const person = answers.ansprechpartner || "";

    return (
      <div className="report">
        <div className="report-toolbar">
          <button className="rbtn rbtn--ghost" onClick={onClose}>← Zurück</button>
          <div className="report-toggle">
            <button className={showAll ? "is-on" : ""} onClick={() => setShowAll(true)}>Alle Fragen</button>
            <button className={!showAll ? "is-on" : ""} onClick={() => setShowAll(false)}>Nur beantwortete</button>
          </div>
          <button className="rbtn rbtn--primary" onClick={() => window.print()}>Als PDF speichern</button>
        </div>

        <div className="report-scroll">
          <div className="report-doc">
            <header className="report-head">
              <img className="report-logo" src="assets/wordmark-horizontal-black.svg" alt="FrachtHub" />
              <div className="report-head-meta">
                <div className="report-doc-type">Prozess-Analyse</div>
                <div className="report-date">{date}</div>
              </div>
            </header>

            <div className="report-hero">
              <div className="report-eyebrow">Analyse-Bericht zur Workshop-Vorbereitung</div>
              <h1>{firma}</h1>
              {person && <div className="report-person">{person}</div>}
              <p className="report-lead">{showAll
                ? "Diese Dokumentation hält alle Fragen der Prozess-Analyse samt euren Antworten fest — eine vollständige Grundlage für den gemeinsamen Workshop und euer Nachschlagewerk darüber, wo aktuell die größten Hebel liegen."
                : "Diese Zusammenfassung bündelt eure beantworteten Fragen aus der Prozess-Analyse. Sie ist die Grundlage für den gemeinsamen Workshop — und euer Überblick darüber, wo aktuell die größten Hebel liegen."}</p>
            </div>

            {top.length > 0 && (
              <div className="report-prio">
                <div className="report-prio-h">Eure Prioritäten</div>
                <div className="report-prio-grid">
                  {top.map((tp) => (
                    <div className="report-prio-item" key={tp.id}>
                      <span className="report-prio-num">{tp.pos}</span>
                      <div>
                        <div className="report-prio-area">{tp.area}</div>
                        <div className="report-prio-mod">Passender Ansatz · {tp.module}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="report-body">
              {blocks.map((b) => <AnsweredBlock key={b.id} block={b} answers={answers} showAll={showAll} />)}
            </div>

            <div className="report-next">
              <div className="report-next-h">Wie es weitergeht</div>
              <ol>
                <li><strong>Sichtung.</strong> Wir gehen eure Antworten als gelernte Speditionskaufleute durch — mit Blick aufs Tagesgeschäft, nicht nur aufs Tool.</li>
                <li><strong>Workshop.</strong> 90 Minuten, in denen wir die Top-Themen schärfen und die ein bis zwei größten Hebel festlegen.</li>
                <li><strong>Umsetzungsplan.</strong> Konkrete nächste Schritte. Die 1.500 € für den Workshop werden voll auf die Umsetzung angerechnet.</li>
              </ol>
            </div>

            <footer className="report-foot">
              <div className="report-foot-l">
                <div className="report-foot-name">Jonas Flucke</div>
                <div className="report-foot-role">Gründer &amp; Geschäftsführer · FrachtHub</div>
              </div>
              <div className="report-foot-r">
                <div>jonas.flucke@frachthub.com</div>
                <div>+49 176 43648192 · frachthub.com</div>
              </div>
            </footer>
            {email && <div className="report-sentto">Wird gesendet an: {email}</div>}
          </div>
        </div>
      </div>
    );
  }

  window.fhFormatAnswer = fhFormatAnswer;
  window.ReportView = ReportView;
})();
