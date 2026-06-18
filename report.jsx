/* =========================================================
   FrachtHub Analyse-Workshop — Analyse-Bericht
   Lädt die GitHub-Vorlage und füllt Platzhalter mit echten Daten.
   Exports: window.ReportView, window.fhFormatAnswer
   ========================================================= */
(function () {
  const { useEffect, useState } = React;

  const TEMPLATE_URL = 'https://raw.githubusercontent.com/jonas-arch887/Frachthub-Vorlagen-ffentlich-/main/Analyse-Bericht.html';

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

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

  function buildHtml(templateHtml, blocks, answers, ranking, themes, showAll) {
    const date = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
    const firma = answers.unternehmen || '—';
    const person = answers.ansprechpartner || '';

    const top = ranking
      .map((id, i) => ({ ...themes.find(x => x.id === id), pos: i + 1 }))
      .filter(x => x.area);

    const prioHtml = top.map(tp => `
      <div class="prio-item">
        <div class="prio-num">${esc(String(tp.pos))}</div>
        <div class="prio-area">${esc(tp.area)}</div>
        <div class="prio-module">${esc(tp.module)}</div>
      </div>
    `).join('');

    const antwortHtml = blocks.map(b => {
      const rows = blockFields(b)
        .map(({ field }) => {
          const val = fhFormatAnswer(field, answers);
          if (!showAll && val == null) return '';
          let answerHtml;
          if (val == null) {
            answerHtml = '<div class="qa-answer qa-answer--empty">Nicht beantwortet</div>';
          } else if (Array.isArray(val)) {
            answerHtml = `<div class="qa-answer">${val.map(v => esc(v)).join('<br>')}</div>`;
          } else {
            answerHtml = `<div class="qa-answer">${esc(String(val))}</div>`;
          }
          return `
            <div class="qa-row">
              <div class="qa-question">${esc(field.label)}</div>
              ${answerHtml}
            </div>
          `;
        })
        .filter(Boolean)
        .join('');

      if (!rows) return '';

      return `
        <div class="block">
          <div class="block-header">
            <div class="block-num">${String(b.num).padStart(2, '0')}</div>
            <div class="block-title">${esc(b.kicker)}</div>
          </div>
          <div class="qa-list">${rows}</div>
        </div>
      `;
    }).filter(Boolean).join('');

    return templateHtml
      .replace('{{DATUM}}', esc(date))
      .replace('{{FIRMA}}', esc(firma))
      .replace('{{PERSON}}', esc(person))
      .replace('{{PRIORITAETEN}}', prioHtml)
      .replace('{{ANTWORTEN}}', antwortHtml);
  }

  function ReportView({ blocks, answers, ranking, themes, email, onClose }) {
    const [showAll, setShowAll] = useState(true);
    const [sendState, setSendState] = useState('idle');
    const [templateHtml, setTemplateHtml] = useState('');
    const [iframeContent, setIframeContent] = useState('');

    useEffect(() => {
      const onKey = (e) => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    useEffect(() => {
      fetch(TEMPLATE_URL)
        .then(r => r.text())
        .then(html => setTemplateHtml(html))
        .catch(err => console.error('[FH] Template laden fehlgeschlagen:', err));
    }, []);

    useEffect(() => {
      if (!templateHtml) return;
      setIframeContent(buildHtml(templateHtml, blocks, answers, ranking, themes, showAll));
    }, [templateHtml, showAll]);

    async function handleSend() {
      setSendState('sending');
      try {
        const cfg = window.FH_CONFIG || {};
        const priorities = ranking
          .map((id, i) => ({ ...themes.find(x => x.id === id), pos: i + 1 }))
          .filter(t => t.area)
          .map(t => ({ pos: t.pos, area: t.area, module: t.module }));

        const blocksPayload = blocks
          .map(b => {
            const rows = blockFields(b)
              .map(({ field }) => {
                const val = fhFormatAnswer(field, answers);
                const value = val == null ? null : (Array.isArray(val) ? val.join(' · ') : String(val));
                return { label: field.label, value };
              })
              .filter(q => showAll || q.value !== null);
            return { num: b.num, kicker: b.kicker, qa: rows };
          })
          .filter(b => b.qa.length > 0);

        const payload = {
          email: email.trim(),
          firma: answers.unternehmen || '',
          person: answers.ansprechpartner || '',
          priorities,
          blocks: blocksPayload
        };

        const headers = { 'Content-Type': 'application/json' };
        if (cfg.webhookSecret) headers['X-Frachthub-Key'] = cfg.webhookSecret;

        const res = await fetch(cfg.webhookUrl || 'https://n8n.frachthub.com/webhook/workshop-analyse', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setSendState('done');
      } catch (e) {
        console.error('[FH] Webhook Fehler:', e);
        setSendState('error');
      }
    }

    return (
      <div className="report">
        <div className="report-toolbar">
          <button className="rbtn rbtn--ghost" onClick={onClose}>← Zurück</button>
          <div className="report-toggle">
            <button className={showAll ? "is-on" : ""} onClick={() => setShowAll(true)}>Alle Fragen</button>
            <button className={!showAll ? "is-on" : ""} onClick={() => setShowAll(false)}>Nur beantwortete</button>
          </div>
          <div className="report-send-wrap">
            {sendState === 'done'
              ? <button className="rbtn rbtn--success" disabled>✓ Bericht wird zugestellt</button>
              : sendState === 'sending'
              ? <button className="rbtn rbtn--primary" disabled>Wird gesendet…</button>
              : sendState === 'error'
              ? <button className="rbtn rbtn--primary" onClick={handleSend}>Erneut versuchen</button>
              : <button className="rbtn rbtn--primary" onClick={handleSend}>Bericht senden</button>
            }
            {sendState === 'error' && <div className="report-send-error">Versand fehlgeschlagen — bitte erneut versuchen.</div>}
          </div>
        </div>
        {iframeContent
          ? <iframe className="report-frame" srcDoc={iframeContent} title="Analyse-Bericht" sandbox="" />
          : <div className="report-frame-loading">Vorlage wird geladen…</div>
        }
      </div>
    );
  }

  window.fhFormatAnswer = fhFormatAnswer;
  window.ReportView = ReportView;
})();
