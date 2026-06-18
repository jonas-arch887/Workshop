/* =========================================================
   FrachtHub Analyse-Workshop — App (React)
   Daten-getriebener Wizard, dunkles Erlebnis.
   ========================================================= */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "leuchtend",
  "background": "glow",
  "transition": "zoom"
} /*EDITMODE-END*/;

const STORE_KEY = "fh_workshop_v1";

/* ---------- persistence ---------- */
function loadState() {
  try {return JSON.parse(localStorage.getItem(STORE_KEY)) || null;}
  catch {return null;}
}
function saveState(data) {
  try {localStorage.setItem(STORE_KEY, JSON.stringify(data));} catch {}
}

/* ---------- supabase save ---------- */
async function saveToSupabase(userId, answers, ranking, email, status) {
  if (!window.supabaseClient || !userId) return;
  const { error } = await window.supabaseClient.from("workshop_submissions").upsert({
    user_id: userId,
    status,
    email: email || null,
    unternehmen: answers.unternehmen || null,
    ansprechpartner: answers.ansprechpartner || null,
    ranking,
    answers,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (error) console.error("[FH] Supabase Speichern fehlgeschlagen:", error.message || "unbekannter Fehler");
}

/* ---------- conditional logic ---------- */
function blockActive(b, answers) {
  if (b.condKey === "standorte_multi") return Number(answers.standorte) >= 2;
  if (b.condKey === "produktion") return (answers.taetigkeit || []).includes(window.FH.PRODUKTION);
  return true;
}
function activeBlocks(answers) {
  return window.FH.blocks.filter((b) => blockActive(b, answers));
}

/* ---------- field-level helpers ---------- */
function fieldIds(block) {
  const out = [];
  const collect = (f) => {
    if (f.type === "triple") {(f.placeholders || [0, 1, 2]).forEach((_, i) => out.push(f.id + "_" + i));} else
    out.push(f.id);
    if (f.otherOn) out.push(f.id + "_other");
  };
  (block.fields || []).forEach(collect);
  (block.sections || []).forEach((s) => s.fields.forEach(collect));
  return out;
}
function isAnswered(v) {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  return String(v).trim() !== "";
}
function blockProgress(block, answers) {
  const ids = fieldIds(block).filter((id) => !id.endsWith("_other"));
  const done = ids.filter((id) => isAnswered(answers[id])).length;
  return { done, total: ids.length };
}

/* =========================================================
   ROUTE MOTIF (Von → Nach)
   ========================================================= */
function RouteMotif({ progress = 0.5, animated = false }) {
  return (
    <svg className={"route-motif" + (animated ? " is-animated" : "")} viewBox="0 0 240 40" fill="none" aria-hidden="true" style={{ "--route-len": Math.round(208 * progress) }}>
      <line x1="16" y1="20" x2="224" y2="20" className="route-base" />
      <line x1="16" y1="20" x2={16 + 208 * progress} y2="20" className="route-fill" />
      <circle cx="16" cy="20" r="5" className="route-dot start" />
      <circle cx="224" cy="20" r="5" className="route-dot end" />
      <g className="route-truck" style={{ transform: `translateX(${208 * progress - 4}px)` }}>
        <rect x="6" y="11" width="14" height="11" rx="2" />
        <rect x="20" y="14" width="7" height="8" rx="1.5" />
        <circle cx="11" cy="24" r="2.4" />
        <circle cx="23" cy="24" r="2.4" />
      </g>
    </svg>);

}

/* =========================================================
   FIELD CONTROLS
   ========================================================= */
function FieldShell({ field, idx, children }) {
  return (
    <div className={"field" + (field.half ? " field--half" : "")}>
      <label className="field-label">
        {idx != null && <span className="field-num">{idx}</span>}
        <span>{field.label}</span>
      </label>
      {field.help && <p className="field-help">{field.help}</p>}
      {children}
    </div>);

}

function Segmented({ options, value, onChange, name }) {
  return (
    <div className="seg" role="radiogroup">
      {options.map((opt) =>
      <button
        key={opt}
        type="button"
        role="radio"
        aria-checked={value === opt}
        className={"seg-btn" + (value === opt ? " is-on" : "")}
        onClick={() => onChange(value === opt ? "" : opt)}>
        
          {opt}
        </button>
      )}
    </div>);

}

function FieldRenderer({ field, idx, answers, set }) {
  const v = answers[field.id];

  if (field.type === "text") {
    return (
      <FieldShell field={field} idx={idx}>
        <input className="inp" type="text" value={v || ""} placeholder={field.placeholder || ""} onChange={(e) => set(field.id, e.target.value)} />
      </FieldShell>);

  }
  if (field.type === "textarea") {
    return (
      <FieldShell field={field} idx={idx}>
        <textarea className="inp inp--area" rows={3} value={v || ""} placeholder={field.placeholder || ""} onChange={(e) => set(field.id, e.target.value)} />
      </FieldShell>);

  }
  if (field.type === "number") {
    return (
      <FieldShell field={field} idx={idx}>
        <div className="inp-wrap">
          <input className="inp inp--num" type="number" inputMode="numeric" min={field.min} value={v ?? ""} placeholder="—" onChange={(e) => set(field.id, e.target.value)} />
          {field.suffix && <span className="inp-suffix">{field.suffix}</span>}
        </div>
      </FieldShell>);

  }
  if (field.type === "slider") {
    const val = v === undefined || v === "" ? field.min : Number(v);
    return (
      <FieldShell field={field} idx={idx}>
        <div className="slider">
          <input type="range" min={field.min} max={field.max} value={val} style={{ "--p": (val - field.min) / (field.max - field.min) * 100 + "%" }} onChange={(e) => set(field.id, e.target.value)} />
          <div className="slider-val">{val}<span>{field.suffix}</span></div>
        </div>
      </FieldShell>);

  }
  if (field.type === "yesno") {
    return (
      <FieldShell field={field} idx={idx}>
        <Segmented options={["Ja", "Nein"]} value={v || ""} onChange={(x) => set(field.id, x)} />
      </FieldShell>);

  }
  if (field.type === "scale" || field.type === "choice") {
    return (
      <FieldShell field={field} idx={idx}>
        <Segmented options={field.options} value={v || ""} onChange={(x) => set(field.id, x)} />
      </FieldShell>);

  }
  if (field.type === "multi") {
    const arr = v || [];
    const toggle = (opt) => {
      const next = arr.includes(opt) ? arr.filter((o) => o !== opt) : [...arr, opt];
      set(field.id, next);
    };
    const showOther = field.otherOn && arr.includes(field.otherOn);
    return (
      <FieldShell field={field} idx={idx}>
        <div className="chips">
          {field.options.map((opt) =>
          <button key={opt} type="button" className={"chip" + (arr.includes(opt) ? " is-on" : "")} onClick={() => toggle(opt)}>
              <span className="chip-tick" />{opt}
            </button>
          )}
        </div>
        {showOther &&
        <input className="inp inp--other" type="text" placeholder={field.otherLabel || "Bitte ergänzen"} value={answers[field.id + "_other"] || ""} onChange={(e) => set(field.id + "_other", e.target.value)} />
        }
      </FieldShell>);

  }
  if (field.type === "triple") {
    return (
      <FieldShell field={field} idx={idx}>
        <div className="triple">
          {field.placeholders.map((ph, i) =>
          <div className="triple-row" key={i}>
              <span className="triple-rank">{i + 1}</span>
              <input className="inp" type="text" placeholder={ph} value={answers[field.id + "_" + i] || ""} onChange={(e) => set(field.id + "_" + i, e.target.value)} />
            </div>
          )}
        </div>
      </FieldShell>);

  }
  return null;
}

/* =========================================================
   BLOCK SCREEN
   ========================================================= */
function BlockScreen({ block, answers, set }) {
  let counter = 0;
  return (
    <div className="screen">
      <header className="screen-head">
        <div className="kicker">
          <span className="kicker-dot" />Block {block.num} · {block.kicker}
        </div>
        <h1 className="screen-title">{block.title}</h1>
        <p className="screen-intro">{block.intro}</p>
        {block.condNote && <div className="cond-note">{block.condNote}</div>}
      </header>

      {block.fields &&
      <div className="fields">
          {block.fields.map((f) => {counter++;return <FieldRenderer key={f.id} field={f} idx={counter} answers={answers} set={set} />;})}
        </div>
      }

      {block.sections && block.sections.map((sec) =>
      <section className="qsection" key={sec.label}>
          <div className={"qsection-tag qsection-tag--" + sec.label.toLowerCase()}>{sec.label === "Problem" ? "Wie es heute läuft" : "Was möglich wäre"}</div>
          <div className="fields">
            {sec.fields.map((f) => {counter++;return <FieldRenderer key={f.id} field={f} idx={counter} answers={answers} set={set} />;})}
          </div>
        </section>
      )}
    </div>);

}

/* =========================================================
   INTRO SCREEN
   ========================================================= */
function IntroScreen({ onStart, hasProgress, userProfile }) {
  const firstName = userProfile?.name ? userProfile.name.split(" ")[0] : null;
  const firma = userProfile?.firma || null;
  return (
    <div className="screen screen--intro">
      <div className="intro-eyebrow">FRACHTHUB · Analyse-Workshop</div>
      <h1 className="intro-title">{firstName ? `Hallo ${firstName},` : "Bevor wir uns zusammensetzen,"}<br /><em>{firstName ? "schön, dass ihr dabei seid." : "schauen wir genau hin."}</em></h1>
      <p className="intro-lead" style={{ textAlign: "justify" }}>Dieser Fragebogen ist die Vorbereitung für euren Analyse-Workshop. Ihr geht einmal strukturiert durch eure Prozesse von der Dispo bis zur Reklamation. Im Workshop steigen wir dann nicht bei Null ein, sondern direkt dort, wo es bei euch wirklich hakt.

      </p>
      <RouteMotif progress={0.62} animated />
      <div className="intro-meta">
        <div className="meta-item"><div className="meta-k">20–30 Min</div><div className="meta-v">Bearbeitungszeit, in Etappen möglich</div></div>
        <div className="meta-item"><div className="meta-k">Automatisch gespeichert</div><div className="meta-v">Pausieren und später weitermachen</div></div>
        <div className="meta-item"><div className="meta-k">12 Themenblöcke</div><div className="meta-v">Nur die, die zu euch passen</div></div>
      </div>
      <div className="intro-actions">
        <button className="btn btn--primary btn--lg" onClick={onStart}>
          {hasProgress ? "Weiter ausfüllen" : "Analyse starten"}<span className="btn-arrow">→</span>
        </button>
      </div>
      <p className="intro-fine">Keine Wertung der Fragen. Je ehrlicher und detaillierter die Antworten, desto umfangreicher der Workshop.</p>
    </div>);

}

/* =========================================================
   RANKING SCREEN (Block 12)
   ========================================================= */
function RankingScreen({ themes, ranking, setRanking }) {
  const toggle = (id) => {
    if (ranking.includes(id)) setRanking(ranking.filter((x) => x !== id));else
    if (ranking.length < 3) setRanking([...ranking, id]);
  };
  return (
    <div className="screen">
      <header className="screen-head">
        <div className="kicker"><span className="kicker-dot" />Block 12 · Priorisierung</div>
        <h1 className="screen-title">Wo drückt der Schuh am meisten?</h1>
        <p className="screen-intro">Ihr seid jetzt alle Bereiche durchgegangen. Wählt bitte die <strong>drei Themen</strong> aus, die für euch aktuell am wichtigsten sind, und bringt sie direkt in die richtige Reihenfolge nach Dringlichkeit.</p>
      </header>
      <div className="rank-hint">
        <span className={"rank-slot" + (ranking[0] ? " is-filled" : "")}>1</span>
        <span className={"rank-slot" + (ranking[1] ? " is-filled" : "")}>2</span>
        <span className={"rank-slot" + (ranking[2] ? " is-filled" : "")}>3</span>
        <span className="rank-hint-txt">{ranking.length}/3 gewählt — antippen zum Setzen</span>
      </div>
      <div className="rank-list">
        {themes.map((t) => {
          const pos = ranking.indexOf(t.id);
          return (
            <button key={t.id} type="button" className={"rank-card" + (pos > -1 ? " is-ranked" : "")} onClick={() => toggle(t.id)} disabled={pos === -1 && ranking.length >= 3}>
              <span className={"rank-badge" + (pos > -1 ? " is-on" : "")}>{pos > -1 ? pos + 1 : ""}</span>
              <span className="rank-area">{t.area}</span>
              <span className="rank-mod">{t.module}</span>
            </button>);

        })}
      </div>
    </div>);

}

/* =========================================================
   SUBMIT + RESULT
   ========================================================= */
function SubmitScreen() {
  return (
    <div className="screen screen--submit">
      <RouteMotif progress={1} animated />
      <h2 className="submit-title">Wird übermittelt …</h2>
      <p className="submit-sub">Eure Antworten landen verschlüsselt bei Frachthub. Ihr entscheidet, wo eure Daten liegen.</p>
    </div>);

}

function ResultScreen({ themes, ranking, answers, email, setEmail, onReport, onEdit, onReset }) {
  const [emailError, setEmailError] = useState(false);
  const top = ranking.map((id, i) => ({ ...themes.find((t) => t.id === id), pos: i + 1 })).filter((t) => t.area);
  const firma = answers.unternehmen ? answers.unternehmen : "euch";
  function handleReport() {
    if (!email || !email.trim()) { setEmailError(true); return; }
    setEmailError(false);
    onReport();
  }
  return (
    <div className="screen screen--result">
      <div className="result-check">
        <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div className="intro-eyebrow">Analyse abgeschlossen</div>
      <h1 className="intro-title result-title">Danke, das ist eine<br /><em>Starke Grundlage.</em></h1>
      <p className="intro-lead">Wir haben alles, um den Workshop für {firma} gezielt vorzubereiten. Hier ist, worauf wir uns zuerst konzentrieren werden.</p>

      <div className="result-block">
        <div className="result-block-h">Eure Prioritäten</div>
        {top.length === 0 && <p className="result-empty">Es wurden keine Schwerpunkte priorisiert — wir gehen die Bereiche im Workshop gemeinsam durch.</p>}
        <div className="prio-list">
          {top.map((t) =>
          <div className="prio-row" key={t.id}>
              <span className="prio-num">{t.pos}</span>
              <div className="prio-body">
                <div className="prio-area">{t.area}</div>
                <div className="prio-mod"><span className="prio-mod-dot" />Passender Ansatz: {t.module}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="result-block result-report">
        <div className="result-block-h">Euer Analyse-Bericht</div>
        <p className="result-report-lead">Ich habe eure Antworten zu einem Bericht zusammengefasst, damit ihr alle Prioritäten und passende Ansätze direkt auf einen Blick habt. Trag bitte kurz eure E-Mail-Adresse ein, dann schicke ich euch den Bericht direkt als PDF zu.</p>
        <div className="result-mailrow">
          <input className={`inp${emailError ? ' inp--error' : ''}`} type="email" placeholder="name@firma.de" value={email} onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(false); }} />
          <button className="btn btn--primary" onClick={handleReport}>Bericht ansehen<span className="btn-arrow">→</span></button>
        </div>
        {emailError && <p className="result-mail-error">Bitte E-Mail-Adresse eintragen — der Bericht kann sonst nicht zugestellt werden.</p>}
        <p className="result-mailnote">Beim Absenden schicke ich den Bericht automatisch an diese Adresse. Eine Kopie geht dabei auch direkt an mich.</p>
      </div>

      <div className="result-block">
        <div className="result-block-h">Was als Nächstes passiert</div>
        <ol className="steps-list">
          <li><span className="steps-n">1</span><div><strong>Ich schaue mir eure Antworten und Probleme jetzt genau an,</strong> mache mir meine Gedanken und arbeite konkrete Punkte für euch aus. Dabei fange ich direkt mit den Themen an, die aktuell die höchste Priorität für euch haben.</div></li>
          <li><span className="steps-n">2</span><div><strong>Ich melde mich in den nächsten Tagen mit einem Terminvorschlag bei euch.</strong> In einem neuen, 90-minütigen Termin präsentiere ich euch meine konkreten Ausarbeitungen und wir legen gemeinsam die ein bis zwei größten Hebel fest.</div></li>
          <li><span className="steps-n">3</span><div><strong>Ihr bekommt einen konkreten Umsetzungsplan.</strong> Die 1.000€ für den Workshop werden voll auf die Umsetzung angerechnet.</div></li>
        </ol>
      </div>

      <div className="result-actions">
        <button className="btn btn--ghost" onClick={onEdit}>Antworten ansehen</button>
        <button className="btn btn--ghostlight" onClick={onReset}>Neu starten</button>
      </div>
      <p className="intro-fine">Ich habe eure Antworten gesichert. Ihr habt jederzeit die Möglichkeit, zurückzugehen und eure Punkte zu ergänzen.</p>
    </div>);

}

/* =========================================================
   APP
   ========================================================= */
function App() {
  const restored = useRef(loadState());
  const userId = useRef(null);
  const [authState, setAuthState] = useState("loading"); // "loading" | "ok" | "none"
  const [userProfile, setUserProfile] = useState(null);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [answers, setAnswers] = useState(() => restored.current && restored.current.answers || {});
  const [ranking, setRanking] = useState(() => restored.current && restored.current.ranking || []);
  const [stepId, setStepId] = useState(() => restored.current && restored.current.stepId || "intro");
  const [email, setEmail] = useState(() => restored.current && restored.current.email || "");
  const [showReport, setShowReport] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const mainRef = useRef(null);

  const aBlocks = useMemo(() => activeBlocks(answers), [answers]);
  const themes = useMemo(() => aBlocks.filter((b) => b.area).map((b) => ({ id: b.id, area: b.area, module: b.module })), [aBlocks]);

  // ordered content steps: blocks + ranking
  const steps = useMemo(() => [...aBlocks.map((b) => b.id), "b12"], [aBlocks]);

  // Auth-Check beim Start
  useEffect(() => {
    // Dev-Bypass: nur lokal UND nur wenn in config.js explizit aktiviert.
    // Production-Builds liefern config.js mit devAuthBypass nicht aus → Bypass greift nie.
    const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (isLocal && window.FH_CONFIG && window.FH_CONFIG.devAuthBypass === true) {
      userId.current = "dev-local";
      setUserProfile({ name: "Jonas Flucke", firma: "FrachtHub" });
      setAuthState("ok");
      return;
    }
    if (!window.supabaseClient) { setAuthState("none"); return; }
    async function initAuth() {
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      if (!user) { setAuthState("none"); return; }
      userId.current = user.id;
      const { data: profile } = await window.supabaseClient
        .from("profiles").select("*").eq("id", user.id).single();
      setUserProfile(profile);
      setAuthState("ok");
    }
    initAuth();
    const { data: { subscription } } = window.supabaseClient.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") initAuth();
      if (event === "SIGNED_OUT") { setAuthState("none"); userId.current = null; setUserProfile(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // theme tweaks → root attributes
  useEffect(() => {
    const r = document.documentElement;
    r.setAttribute("data-accent", t.accent);
    r.setAttribute("data-bg", t.background);
    r.setAttribute("data-transition", t.transition);
  }, [t.accent, t.background, t.transition]);

  // persistence (localStorage + Supabase in_progress)
  useEffect(() => {
    saveState({ answers, ranking, email, stepId: stepId === "done" ? "intro" : stepId });
    setSaved(true);
    const id = setTimeout(() => setSaved(false), 1400);
    // Zwischenspeicherung in Supabase bei Schrittwechsel (nicht im Intro oder Done-State)
    if (stepId !== "intro" && stepId !== "done") {
      saveToSupabase(userId.current, answers, ranking, email, "in_progress");
    }
    return () => clearTimeout(id);
  }, [answers, ranking, stepId]);

  // keep ranking valid if a theme becomes inactive
  useEffect(() => {
    const ids = themes.map((x) => x.id);
    setRanking((r) => r.filter((x) => ids.includes(x)));
  }, [themes]);

  // clamp stepId if it points to an inactive block
  useEffect(() => {
    if (stepId === "intro" || stepId === "done") return;
    if (!steps.includes(stepId)) setStepId(steps[steps.length - 1] || "intro");
  }, [steps, stepId]);

  const set = useCallback((id, value) => setAnswers((a) => ({ ...a, [id]: value })), []);

  const idx = steps.indexOf(stepId);
  const scrollTop = () => {if (mainRef.current) mainRef.current.scrollTop = 0;};

  const goNext = () => {
    if (stepId === "intro") {setStepId(steps[0]);scrollTop();return;}
    if (idx < steps.length - 1) {setStepId(steps[idx + 1]);scrollTop();} else
    {// submit
      setSubmitting(true);
      saveToSupabase(userId.current, answers, ranking, email, "completed");
      setTimeout(() => {setSubmitting(false);setStepId("done");scrollTop();}, 1700);
    }
  };
  const goBack = () => {
    if (stepId === "done") {setStepId("b12");scrollTop();return;}
    if (stepId === "intro") return;
    if (idx <= 0) {setStepId("intro");scrollTop();} else
    {setStepId(steps[idx - 1]);scrollTop();}
  };
  const goTo = (id) => {setStepId(id);scrollTop();};
  const reset = () => {
    if (!confirm("Wirklich neu starten? Alle Antworten werden gelöscht.")) return;
    setAnswers({});setRanking([]);setStepId("intro");setEmail("");setShowReport(false);
    try {localStorage.removeItem(STORE_KEY);} catch {}
  };

  const totalBlocks = steps.length; // active blocks + ranking
  const currentBlockNo = idx + 1; // 1-based when in a step
  const onIntro = stepId === "intro";
  const onDone = stepId === "done";

  const currentBlock = window.FH.blocks.find((b) => b.id === stepId);

  /* ----- rail items ----- */
  const railItems = aBlocks.map((b) => ({ id: b.id, label: b.kicker, num: b.num, prog: blockProgress(b, answers) }));

  if (authState === "loading") return (
    <div className="auth-gate">
      <img src="assets/wordmark-horizontal-white.svg" alt="FrachtHub" className="auth-gate-logo" />
      <p className="auth-gate-text">Einen Moment …</p>
    </div>
  );

  if (authState === "none") return (
    <div className="auth-gate">
      <img src="assets/wordmark-horizontal-white.svg" alt="FrachtHub" className="auth-gate-logo" />
      <h1 className="auth-gate-title">Kein Zugang</h1>
      <p className="auth-gate-text">Bitte nutze deinen persönlichen Einladungslink.<br />Falls du keinen erhalten hast, melde dich bei FrachtHub.</p>
    </div>
  );

  return (
    <div className="app">
      {/* progress bar */}
      <div className="topbar">
        <div className="topbar-fill" style={{ width: onDone ? "100%" : onIntro ? "0%" : `${currentBlockNo / totalBlocks * 100}%` }} />
      </div>

      <div className="layout">
        {/* RAIL */}
        <aside className="rail">
          <div className="rail-top">
            <img className="rail-logo" src="assets/wordmark-horizontal-white.svg" alt="FrachtHub" />
            <div className="rail-sub">Analyse-Workshop</div>
          </div>

          <nav className="rail-nav">
            <button className={"rail-item rail-item--intro" + (onIntro ? " is-active" : "")} onClick={() => goTo("intro")}>
              <span className="rail-tick" />Übersicht
            </button>
            {railItems.map((it) => {
              const active = stepId === it.id;
              const reached = steps.indexOf(it.id) <= idx && !onIntro;
              const complete = it.prog.done >= it.prog.total && it.prog.total > 0;
              return (
                <button key={it.id} className={"rail-item" + (active ? " is-active" : "") + (reached ? " is-reached" : "")} onClick={() => goTo(it.id)}>
                  <span className={"rail-tick" + (complete ? " is-complete" : "") + (active ? " is-current" : "")}>
                    {complete ? "✓" : ""}
                  </span>
                  <span className="rail-label">{it.label}</span>
                  {it.prog.total > 0 && <span className="rail-prog">{it.prog.done}/{it.prog.total}</span>}
                </button>);

            })}
            <button className={"rail-item rail-item--final" + (stepId === "b12" || onDone ? " is-active" : "")} onClick={() => goTo("b12")}>
              <span className="rail-tick" />Priorisierung
            </button>
          </nav>

          <div className="rail-foot">
            <div className={"save-pill" + (saved ? " is-on" : "")}><span className="save-dot" />{saved ? "Gespeichert" : "Automatisch gespeichert"}</div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main" ref={mainRef}>
          <div className="main-inner">
            {/* mobile mini-progress */}
            {!onIntro && !onDone &&
            <div className="mobile-prog">
                <span>{currentBlock ? `Block ${currentBlock.num}` : "Priorisierung"}</span>
                <span className="mobile-prog-count">{currentBlockNo} / {totalBlocks}</span>
              </div>
            }

            <div className="screen-wrap" key={stepId}>
              {submitting ? <SubmitScreen /> :
              onIntro ? <IntroScreen onStart={goNext} hasProgress={Object.keys(answers).length > 0} userProfile={userProfile} /> :
              onDone ? <ResultScreen themes={themes} ranking={ranking} answers={answers} email={email} setEmail={setEmail} onReport={() => setShowReport(true)} onEdit={() => goTo(steps[0])} onReset={reset} /> :
              stepId === "b12" ? <RankingScreen themes={themes} ranking={ranking} setRanking={setRanking} /> :
              currentBlock ? <BlockScreen block={currentBlock} answers={answers} set={set} /> :
              null}
            </div>

            {/* footer nav */}
            {!onIntro && !onDone && !submitting &&
            <footer className="navbar">
                <button className="btn btn--ghost" onClick={goBack}>← Zurück</button>
                <div className="navbar-mid">{currentBlockNo} von {totalBlocks}</div>
                <button className="btn btn--primary" onClick={goNext}>
                  {stepId === "b12" ? "Analyse absenden" : "Weiter"}<span className="btn-arrow">→</span>
                </button>
              </footer>
            }
          </div>
        </main>
      </div>

      {/* TWEAKS */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Akzent-Intensität" />
        <TweakRadio label="Petrol" value={t.accent} options={["dezent", "leuchtend"]} onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Hintergrund" />
        <TweakRadio label="Stil" value={t.background} options={["ink", "glow", "textur"]} onChange={(v) => setTweak("background", v)} />
        <TweakSection label="Übergänge" />
        <TweakRadio label="Animation" value={t.transition} options={["slide", "fade", "zoom"]} onChange={(v) => setTweak("transition", v)} />
      </TweaksPanel>

      {showReport && <window.ReportView blocks={aBlocks} answers={answers} ranking={ranking} themes={themes} email={email} onClose={() => setShowReport(false)} />}
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);