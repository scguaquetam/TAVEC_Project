import { useEffect, useState } from 'react';

const STORAGE_KEY = 'tavecc-harbor-passport-react-v2';
const pages = ['sources', 'draft', 'review', 'compliance', 'passport'];
const pageLabels = { sources: 'Source files', draft: 'AI draft', review: 'Human review', compliance: 'Compliance', passport: 'Trust Passport' };

const paths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  file: '<path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v6h5M9 13h6M9 17h6"/>',
  spark: '<path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2ZM19 18l.5 1.5L21 20l-1.5.5L19 22l-.5-1.5L17 20l1.5-.5L19 18Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  shield: '<path d="M12 2 4 5v6c0 5.2 3.2 8.8 8 11 4.8-2.2 8-5.8 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  edit: '<path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20ZM14 7l3 3"/>',
  x: '<path d="M5 5 19 19M19 5 5 19"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 16v4h16v-4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  alert: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5m0 4h.01"/>',
  comment: '<path d="M20 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-3-.5L3 21l1.5-5.5a9 9 0 0 1-0.5-3A8.5 8.5 0 1 1 20 11.5Z"/>',
  download: '<path d="M12 3v13m-5-5 5 5 5-5M4 19v2h16v-2"/>',
  reset: '<path d="M3 11a9 9 0 1 1 2 6M3 4v7h7"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
};

function Icon({ name, size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: paths[name] }} />;
}

const claims = [
  { id: 'cause', num: '01', tag: 'Key finding', title: 'Root cause of the sales decline', ai: 'The 18% sales decline from May to September was primarily driven by reduced marketing spend, which lowered customer demand across the US and Germany.', correction: 'The 18% sales decline was primarily driven by supplier delays and stockouts of top-selling products. Marketing spend changed, but the available evidence does not support it as the main cause.', cited: 'Sales workbook + marketing spend' },
  { id: 'trend', num: '02', tag: 'Supporting fact', title: 'Sales performance', ai: 'Harbor Home Goods sales declined 18% between May and September across its 40 stores in the US and Germany.', correction: 'Harbor Home Goods sales declined 18% between May and September across its 40 stores in the US and Germany.', cited: 'Monthly sales workbook' },
  { id: 'action', num: '03', tag: 'Recommendation', title: 'Recommended next action', ai: 'Increase paid marketing investment by 20% next quarter to recover lost demand and reverse the sales trend.', correction: 'Prioritize supplier reliability and replenish top-selling products. Validate on-shelf availability before considering additional marketing investment.', cited: 'Draft analysis' },
];

const sources = [
  { name: 'Monthly sales.xlsx', subtitle: 'Sales figures · May–September', kind: 'file' },
  { name: 'Marketing spend.xlsx', subtitle: 'Campaign spending by month', kind: 'file' },
  { name: 'Inventory status.xlsx', subtitle: 'Product availability records', kind: 'file' },
  { name: 'Supplier update.eml', subtitle: 'Supplier correspondence · September 8', kind: 'mail' },
];

const checks = [
  { title: 'Evidence traceability', desc: 'Material claims link to the reviewed source files.' },
  { title: 'Human correction documented', desc: 'The root cause and recommendation show the human decision.' },
  { title: 'AI limitations disclosed', desc: 'The client copy states the missed source and risk of a wrong conclusion.' },
  { title: 'Accountable approver assigned', desc: 'A named professional signs the final recommendation.' },
];

function freshState() {
  return { page: 'sources', selected: 'cause', decisions: {}, edits: {}, comments: {}, evidenceMarked: false, reviewer: 'Sebas', compliance: [false, false, false, false], signedAt: null, signer: 'Saday', uploads: [] };
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return stored && pages.includes(stored.page) ? { ...freshState(), ...stored } : freshState();
  } catch { return freshState(); }
}

function PageIntro({ eyebrow, title, description, action }) {
  return <div className="page-intro"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="intro-actions">{action}</div>}</div>;
}

function Sidebar({ state, reviewed, navigate }) {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark">N<span>✦</span></div><div><strong>THE NEXUS 5</strong><small>CONSULTING GROUP</small></div></div>
    <div className="workspace-label">WORKSPACE</div>
    <div className="workspace-card"><div className="workspace-avatar">H</div><div><strong>Harbor Home Goods</strong><small>Client case · 2026</small></div><Icon name="down" size={15} /></div>
    <div className="nav-heading">WORKFLOW</div>
    <nav aria-label="Workflow">{pages.map((page, i) => <button key={page} type="button" className={`nav-item ${state.page === page ? 'active' : ''}`} aria-current={state.page === page ? 'page' : undefined} onClick={() => navigate(page)}><span className="nav-icon"><Icon name={['grid', 'spark', 'edit', 'shield', 'file'][i]} /></span><span>{pageLabels[page]}</span>{page === 'review' && <span className="nav-count">{reviewed}/3</span>}</button>)}</nav>
    <div className="sidebar-bottom"><div className="sidebar-divider" /><div className="mission"><div className="mission-icon"><Icon name="shield" /></div><div><strong>AI drafts. Humans decide.</strong><span>Clients see the proof.</span></div></div></div>
  </aside>;
}

function StepBar({ page, navigate }) {
  const active = pages.indexOf(page);
  return <div className="stepbar">{pages.map((item, i) => <FragmentStep key={item} item={item} i={i} active={active} navigate={navigate} />)}</div>;
}

function FragmentStep({ item, i, active, navigate }) {
  return <><button type="button" className={`step ${i === active ? 'current' : ''} ${i < active ? 'done' : ''}`} onClick={() => navigate(item)}><span className="step-dot">{i < active ? <Icon name="check" size={13} /> : String(i + 1).padStart(2, '0')}</span><span>{pageLabels[item]}</span></button>{i < 4 && <span className="step-line" />}</>;
}

function PresenterBanner({ state }) {
  let moment = '01 / 03';
  let message = 'AI produces a confident first answer.';
  if (state.page === 'review') { moment = '02 / 03'; message = state.evidenceMarked ? 'The email changes the diagnosis.' : 'A consultant checks the source material.'; }
  if (state.page === 'passport') { moment = '03 / 03'; message = 'Clients can see how the advice was verified.'; }
  if (state.page === 'compliance') { moment = '03 / 03'; message = 'A second human signs off before release.'; }
  if (state.page === 'sources') { moment = 'PREP / SOURCES'; message = 'Four client sources enter the review.'; }
  return <div className="presenter-banner"><span>MOMENT {moment}</span><strong>{message}</strong></div>;
}

function Sources({ state, upload, navigate, toast }) {
  return <>
    <PageIntro eyebrow="01 / INPUTS" title="Source files" description="The client materials available for the first-pass analysis." action={<><label className="button button-primary upload-label"><Icon name="upload" size={17} /> Add files<input type="file" multiple hidden onChange={upload} /></label></>} />
    <div className="metric-grid"><div className="metric-card"><span>Case data</span><strong>40 <small>stores</small></strong><p>Across the US and Germany</p></div><div className="metric-card"><span>Sales movement</span><strong className="negative">−18%</strong><p>May through September</p></div><div className="metric-card"><span>Materials supplied</span><strong>4 <small>sources</small></strong><p>For AI and human review</p></div></div>
    <div className="section-head"><div><h2>Harbor data room</h2><p>Files supplied for this case.</p></div><span className="subtle-pill">4 case sources</span></div>
    <div className="source-list">{sources.map((source, i) => <button key={source.name} type="button" className="source-row" onClick={() => toast(i === 3 ? 'This source is available during human review.' : 'This source is part of the Harbor case.')}><span className="source-icon"><Icon name={source.kind} size={20} /></span><span className="source-main"><strong>{source.name}</strong><small>{source.subtitle}</small></span><span className="source-state"><Icon name="check" size={14} /> Available</span><span className="row-chevron"><Icon name="arrow" size={17} /></span></button>)}{state.uploads.map((file, i) => <div className="source-row uploaded" key={`${file.name}-${i}`}><span className="source-icon"><Icon name="file" size={20} /></span><span className="source-main"><strong>{file.name}</strong><small>Added locally · {file.size}</small></span><span className="source-state">Local file</span></div>)}</div>
    <div className="info-strip"><Icon name="lock" size={17} /> Files added here stay in this browser. Automated analysis of new uploads is not connected yet.</div>
    <div className="bottom-next"><div><strong>Next: examine the AI draft</strong><span>See the initial explanation before the human review.</span></div><button className="button button-outline" onClick={() => navigate('draft')}>View AI draft <Icon name="arrow" size={17} /></button></div>
  </>;
}

function Draft({ navigate }) {
  return <>
    <PageIntro eyebrow="02 / AI OUTPUT" title="AI draft report" description="A first-pass assessment prepared from the Harbor case materials." />
    <div className="draft-disclosure"><Icon name="spark" size={18} /><span>AI-generated first pass · Human review required before client delivery</span></div>
    <div className="report-paper"><div className="report-meta"><span>THE NEXUS 5 / CLIENT ANALYSIS</span><span>DRAFT · NOT FOR CLIENT DISTRIBUTION</span></div><div className="report-heading"><div><div className="eyebrow">Harbor Home Goods</div><h2>Sales decline assessment</h2><p>May–September 2026 · US and Germany</p></div><div className="draft-stamp">AI DRAFT<br /><small>Human review required</small></div></div>
      <div className="report-summary"><span>EXECUTIVE SUMMARY</span><p>Sales fell 18% during the period. The draft attributes this decline to lower marketing investment and recommends increasing paid spend.</p></div>
      {claims.map((claim) => <section className="report-section" key={claim.id}><div className="report-section-num">{claim.num}</div><div><h3>{claim.title}</h3><p>{claim.ai}</p><div className="citation"><Icon name="file" size={14} /> {claim.cited}</div></div></section>)}
    </div>
    <div className="bottom-next"><div><strong>Human review starts here</strong><span>Inspect claims and supporting materials before a recommendation is issued.</span></div><button className="button button-primary" onClick={() => navigate('review')}>Review the report <Icon name="arrow" size={17} /></button></div>
  </>;
}

function Review({ state, setState, reviewed, openEmail, navigate, toast }) {
  const claim = claims.find((item) => item.id === state.selected) || claims[0];
  const status = (id) => state.decisions[id] || 'pending';
  const currentText = (item) => status(item.id) === 'revised' ? state.edits[item.id] || item.correction : item.ai;
  const [editing, setEditing] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [replacement, setReplacement] = useState('');
  const [note, setNote] = useState('');

  function select(id) { setState((s) => ({ ...s, selected: id })); setEditing(false); setCommenting(false); }
  function startCorrection() { setReplacement(state.edits[claim.id] || (state.evidenceMarked ? claim.correction : '')); setNote(state.comments[claim.id] || ''); setEditing(true); setCommenting(false); }
  function saveCorrection() {
    if (!replacement.trim()) { toast('Add replacement text first.'); return; }
    setState((s) => ({ ...s, edits: { ...s.edits, [claim.id]: replacement.trim() }, comments: { ...s.comments, [claim.id]: note.trim() }, decisions: { ...s.decisions, [claim.id]: 'revised' }, signedAt: null }));
    setEditing(false); toast('Human correction saved to the review trail.');
  }
  function accept() { setState((s) => ({ ...s, decisions: { ...s.decisions, [claim.id]: 'accepted' }, signedAt: null })); setEditing(false); toast('Section accepted.'); }
  function saveNote() { setState((s) => ({ ...s, comments: { ...s.comments, [claim.id]: note.trim() } })); setCommenting(false); toast('Reviewer note saved.'); }

  return <>
    <PageIntro eyebrow="03 / HUMAN DECISION" title="Review the report" description="Inspect each claim like a change request: accept it or document a correction." action={<div className="review-progress"><Icon name="check" size={16} /> <strong>{reviewed} of 3</strong> sections reviewed</div>} />
    <div className="review-layout"><div className="review-main"><div className="pane-title"><div><h2>AI report sections</h2><p>Select a section to inspect its claim.</p></div><span className="subtle-pill">3 findings</span></div>
      {claims.map((item) => <button type="button" key={item.id} className={`claim-card ${state.selected === item.id ? 'selected' : ''}`} onClick={() => select(item.id)}><div className="claim-top"><span className="claim-number">{item.num}</span><span className="claim-tag">{item.tag}</span><span className={`status status-${status(item.id)}`}>{status(item.id) === 'pending' ? 'Needs review' : status(item.id) === 'accepted' ? 'Accepted' : 'Revised'}</span></div><h3>{item.title}</h3><p>{currentText(item)}</p><div className="claim-foot"><span><Icon name="file" size={14} /> AI cited: {item.cited}</span>{state.comments[item.id] && <span><Icon name="comment" size={14} /> 1 comment</span>}</div></button>)}
      <div className="reviewer-row"><label htmlFor="reviewer-name">Reviewed by</label><input id="reviewer-name" aria-label="Reviewer name" value={state.reviewer} maxLength={50} onChange={(e) => setState((s) => ({ ...s, reviewer: e.target.value, signedAt: null }))} /><span>Changes are saved in this browser.</span></div>
    </div><div className="review-aside"><div className="pane-title"><div><h2>Review detail</h2><p>Section {claim.num} · {claim.tag}</p></div><Icon name="dots" size={20} /></div>
      <div className="detail-card"><div className="detail-label">AI ASSERTION <span className="red-dot" /></div><div className="diff-old">{claim.ai}</div>
        {status(claim.id) === 'revised' && <><div className="detail-label green-label">HUMAN CORRECTION <span className="green-dot" /></div><div className="diff-new">{currentText(claim)}</div></>}
        {state.comments[claim.id] && <div className="saved-comment"><div><Icon name="comment" size={15} /> REVIEWER NOTE</div><p>{state.comments[claim.id]}</p></div>}
        <div className="detail-actions"><button className="button button-soft" onClick={accept} disabled={status(claim.id) === 'accepted'}><Icon name="check" size={16} /> {status(claim.id) === 'accepted' ? 'Accepted' : 'Accept section'}</button><button className="button button-danger" onClick={startCorrection}><Icon name="edit" size={16} /> {status(claim.id) === 'revised' ? 'Edit correction' : 'Reject & correct'}</button></div>
        <button className="text-action" onClick={() => { setNote(state.comments[claim.id] || ''); setCommenting(true); setEditing(false); }}><Icon name="comment" size={15} /> {state.comments[claim.id] ? 'Edit reviewer note' : 'Add reviewer note'}</button>
        {editing && <div className="editor"><label htmlFor="correction-text">Replacement text</label><textarea id="correction-text" rows={5} value={replacement} onChange={(e) => setReplacement(e.target.value)} placeholder="Write the supported finding." /><label htmlFor="correction-note">Why this changed</label><textarea id="correction-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Point to the evidence and explain the decision." /><div className="editor-actions"><button className="button button-primary" onClick={saveCorrection}>Save correction</button><button className="button button-plain" onClick={() => setEditing(false)}>Cancel</button></div></div>}
        {commenting && <div className="editor"><label htmlFor="comment-text">Reviewer note</label><textarea id="comment-text" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add context for the audit trail." /><div className="editor-actions"><button className="button button-primary" onClick={saveNote}>Save note</button><button className="button button-plain" onClick={() => setCommenting(false)}>Cancel</button></div></div>}
      </div>
      <div className={`evidence-card ${state.evidenceMarked ? 'evidence-found' : ''}`}><div className="evidence-head"><div className="evidence-icon"><Icon name="mail" size={18} /></div><div><strong>{state.evidenceMarked ? 'New evidence added' : 'Supporting source'}</strong><span>Supplier correspondence · September 8</span></div>{!state.evidenceMarked && <span className="attention-dot" />}</div><p>{state.evidenceMarked ? 'Shipment delays left top-selling products out of stock in both markets.' : 'Open the original message to verify the draft against the source.'}</p><button className="evidence-link" onClick={openEmail}>{state.evidenceMarked ? 'Reopen supplier email' : 'Open supplier email'} <Icon name="arrow" size={16} /></button>{state.evidenceMarked && <div className="evidence-marked"><Icon name="check" size={14} /> Added to human review trail</div>}</div>
    </div></div>
    <div className="bottom-next"><div><strong>{reviewed === 3 ? 'Review complete' : 'Resolve all three sections'}</strong><span>{reviewed === 3 ? 'Move to compliance sign-off.' : 'Each finding needs a human decision before sign-off.'}</span></div><button className={`button ${reviewed === 3 ? 'button-primary' : 'button-outline'}`} onClick={() => navigate('compliance')}>Compliance check <Icon name="arrow" size={17} /></button></div>
  </>;
}

function Compliance({ state, setState, reviewed, canSign, sign, navigate }) {
  return <>
    <PageIntro eyebrow="04 / GOVERNANCE" title="Compliance sign-off" description="A second human verifies that the final advice is supported and accountable." />
    <div className="compliance-grid"><div className="compliance-panel"><div className="section-head"><div><h2>Release checklist</h2><p>Confirm every control before issuing the Passport.</p></div><span className="subtle-pill">{state.compliance.filter(Boolean).length}/4 complete</span></div>
      {checks.map((check, i) => <label key={check.title} className={`check-row ${state.compliance[i] ? 'checked' : ''}`}><input type="checkbox" checked={state.compliance[i]} onChange={(e) => setState((s) => ({ ...s, compliance: s.compliance.map((item, index) => index === i ? e.target.checked : item), signedAt: null }))} /><span className="custom-check"><Icon name="check" size={14} /></span><span><strong>{check.title}</strong><small>{check.desc}</small></span></label>)}
      <div className="signer-field"><label htmlFor="signer-name">Compliance approver</label><input id="signer-name" value={state.signer} maxLength={50} onChange={(e) => setState((s) => ({ ...s, signer: e.target.value, signedAt: null }))} /></div>
      {!state.evidenceMarked && <div className="gate-message"><Icon name="mail" size={17} /> Complete source review and add material evidence to the trail.</div>}
      {!(state.decisions.cause === 'revised' && state.decisions.action === 'revised') && <div className="gate-message"><Icon name="alert" size={17} /> Correct the root cause and recommendation before signing.</div>}
      {reviewed < 3 && <div className="gate-message"><Icon name="clock" size={17} /> {3 - reviewed} report section{3 - reviewed === 1 ? '' : 's'} still need a decision.</div>}
      <button className="button button-primary sign-button" disabled={!canSign} onClick={sign}><Icon name="shield" size={18} /> Sign off and issue Passport</button>
    </div><div className="compliance-side"><div className="policy-card"><div className="policy-icon"><Icon name="shield" size={22} /></div><h3>AI drafts.<br />Humans decide.</h3><p>Nothing goes to a client without a named reviewer and compliance approval.</p><div className="policy-divider" /><div className="policy-step"><span>01</span><div><strong>Consultant review</strong><small>{reviewed} of 3 findings decided</small></div>{reviewed === 3 ? <Icon name="check" size={16} /> : <Icon name="clock" size={16} />}</div><div className="policy-step"><span>02</span><div><strong>Compliance approval</strong><small>{state.signedAt ? `Signed by ${state.signer}` : 'Pending sign-off'}</small></div>{state.signedAt ? <Icon name="check" size={16} /> : <Icon name="clock" size={16} />}</div><div className="policy-step"><span>03</span><div><strong>Client Passport</strong><small>Proof of the review trail</small></div>{state.signedAt ? <Icon name="check" size={16} /> : <Icon name="clock" size={16} />}</div><button className="button button-outline policy-back" onClick={() => navigate('review')}>Back to human review</button></div></div></div>
  </>;
}

function Passport({ state, reviewed }) {
  const signed = Boolean(state.signedAt);
  const decision = state.decisions.cause === 'revised' ? state.edits.cause : 'Pending human correction';
  const recommendation = state.decisions.action === 'revised' ? state.edits.action : 'Pending human review';
  return <>
    <PageIntro eyebrow="05 / CLIENT TRANSPARENCY" title="AI Trust Passport" description="A client-facing record of the AI contribution, source trail, limits, and named human approval." action={signed && <button className="button button-outline print-btn" onClick={() => window.print()}><Icon name="download" size={17} /> Print / save PDF</button>} />
    <div className={`passport-status ${signed ? 'issued' : ''}`}><Icon name={signed ? 'check' : 'clock'} size={18} /><div><strong>{signed ? 'Passport issued' : 'Awaiting sign-off'}</strong><span>{signed ? 'Ready to accompany the client report.' : 'Complete human review and compliance before client delivery.'}</span></div>{signed && <span className="passport-id">ATP–HHG–2026–01</span>}</div>
    {!signed ? <div className="passport-locked"><Icon name="shield" size={29} /><h2>Client copy is awaiting approval</h2><p>The Passport becomes available after the consultant review and compliance sign-off.</p></div> : <article className="passport-paper"><div className="passport-top"><div className="passport-logo"><span className="passport-symbol">✦</span><span>THE NEXUS 5<br /><small>CONSULTING GROUP</small></span></div><span className="passport-document">AI TRUST PASSPORT<br /><small>CLIENT COPY</small></span></div>
      <div className="passport-title"><div><div className="eyebrow">HARBOR HOME GOODS / SEPTEMBER 2026</div><h2>The recommendation,<br /><em>with a clear review trail.</em></h2></div><div className="seal"><Icon name="shield" size={31} /><span>HUMAN<br />VERIFIED</span></div></div>
      <div className="passport-purpose">This Passport records how AI assisted the analysis and how people checked the final recommendation.</div>
      <div className="passport-grid"><div><span className="mini-label">AI TOOL & ROLE</span><strong>Prototype draft generator</strong><p>No live AI model is connected. The prepared draft proposed an initial analysis; people reviewed and approved the client advice.</p></div><div><span className="mini-label">DATA SOURCES</span><strong>4 Harbor case sources</strong><p>Monthly sales, marketing spend, inventory status, and supplier correspondence. The initial draft cited the first three; human review added the email.</p></div></div>
      <div className="passport-risk"><span className="mini-label">LIMITATION & RISK</span><p>The draft did not use the supplier email. Its marketing explanation could have led to an ineffective spending decision. All material findings therefore required human source review.</p></div>
      <div className="passport-change"><div className="mini-label">THE MATERIAL CHANGE</div><div className="change-cols"><div><span className="change-tag ai-tag">AI DRAFT</span><p>{claims[0].ai}</p></div><div><span className="change-tag human-tag">HUMAN DECISION</span><p>{decision}</p></div></div><div className="change-note"><Icon name="mail" size={16} /> Supplier email, Sep 8: late shipments left top products out of stock.</div></div>
      <div className="passport-final"><div className="mini-label">{signed ? 'FINAL RECOMMENDATION' : 'RECOMMENDATION STATUS'}</div><p>{recommendation}</p></div>
      <div className="passport-signatures"><div><span className="mini-label">HUMAN REVIEWER</span><strong>{state.reviewer.trim() || 'Pending'}</strong><small>Verified findings and corrected the draft</small></div><div><span className="mini-label">COMPLIANCE APPROVER</span><strong>{signed ? state.signer.trim() : 'Pending sign-off'}</strong><small>{signed ? new Date(state.signedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Release checklist incomplete'}</small></div><div><span className="mini-label">VALIDATION RECORD</span><strong>{reviewed} / 3 findings</strong><small>Decisions and reviewer notes retained</small></div></div>
      <div className="passport-footer"><strong>AI drafts. Humans decide. Clients see the proof.</strong><span>AI Trust Passport · Harbor Home Goods</span></div>
    </article>}
  </>;
}

function EmailModal({ close, useEvidence, presenterMode }) {
  useEffect(() => { const onKey = (event) => { if (event.key === 'Escape') close(); }; document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey); }, [close]);
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}><div className="email-modal" role="dialog" aria-modal="true" aria-labelledby="email-title"><div className="email-toolbar"><span><Icon name="mail" size={18} /> SOURCE DOCUMENT · 04/04</span><button className="icon-button" onClick={close} aria-label="Close email"><Icon name="x" size={20} /></button></div><div className="email-content">{presenterMode && <div className="email-focus-caption">The source changes the diagnosis.</div>}<div className="email-subject"><div className="eyebrow">SUPPLIER UPDATE</div><h2 id="email-title">Shipment delay affecting top sellers</h2></div><div className="email-headers"><div><span>From</span><strong>Maya Chen · Northline Suppliers</strong></div><div><span>To</span><strong>Harbor merchandising team</strong></div><div><span>Date</span><strong>September 8, 2026</strong></div></div><div className="email-body"><p>Hi team,</p><p>We need to confirm that the late August shipment of your top-selling home storage and kitchen lines is delayed. Several high-volume SKUs have been <mark>out of stock across US and German stores since mid-August</mark>.</p><p>The delay is on our side. We now expect replenishment in late September. Please factor this into the recent sales decline before changing demand-generation plans.</p><p>Best,<br />Maya</p></div><div className="email-actions"><button className="button button-primary" onClick={useEvidence}><Icon name="check" size={17} /> Add to review trail</button><button className="button button-outline" onClick={close}>Close</button></div></div></div></div>;
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [emailOpen, setEmailOpen] = useState(false);
  const [toastText, setToastText] = useState('');
  const [presenterMode, setPresenterMode] = useState(() => new URLSearchParams(window.location.search).has('presenter'));
  const [menuOpen, setMenuOpen] = useState(false);
  const reviewed = claims.filter((claim) => state.decisions[claim.id] && state.decisions[claim.id] !== 'pending').length;
  const canSign = reviewed === 3 && state.evidenceMarked && state.decisions.cause === 'revised' && state.decisions.action === 'revised' && state.compliance.every(Boolean) && state.reviewer.trim() && state.signer.trim();

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); document.title = `${pageLabels[state.page]} · AI Trust Passport`; }, [state]);
  useEffect(() => { if (!toastText) return; const timer = setTimeout(() => setToastText(''), 3200); return () => clearTimeout(timer); }, [toastText]);
  function toast(message) { setToastText(message); }
  function navigate(page) { if (!pages.includes(page)) return; setState((s) => ({ ...s, page })); setEmailOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function reset() { setState(freshState()); setEmailOpen(false); setMenuOpen(false); toast('Case reset to its starting state.'); window.scrollTo(0, 0); }
  function upload(event) { const files = Array.from(event.target.files || []).map((file) => ({ name: file.name, size: file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB` })); setState((s) => ({ ...s, uploads: [...s.uploads, ...files] })); if (files.length) toast(`${files.length} file${files.length === 1 ? '' : 's'} added locally.`); event.target.value = ''; }
  function useEvidence() { setState((s) => ({ ...s, page: 'review', selected: 'cause', evidenceMarked: true, signedAt: null })); setEmailOpen(false); toast('Supplier email added to the human review trail.'); }
  function sign() { if (!canSign) return; setState((s) => ({ ...s, signedAt: new Date().toISOString(), page: 'passport' })); window.scrollTo(0, 0); toast('Passport issued with human and compliance approval.'); }

  return <><div className={`shell ${presenterMode ? 'presentation-mode' : ''}`}><Sidebar state={state} reviewed={reviewed} navigate={navigate} /><div className="main-shell"><header className="topbar"><div className="breadcrumb">Client workspace <span>/</span> Harbor Home Goods <span>/</span> <strong>{pageLabels[state.page]}</strong></div><div className="top-actions"><button className={`presenter-toggle ${presenterMode ? 'is-on' : ''}`} onClick={() => setPresenterMode((value) => !value)} aria-pressed={presenterMode}>{presenterMode ? 'Focus view on' : 'Focus view'}</button><div className="account-menu"><button className="top-avatar" title="Workspace options" aria-label="Workspace options" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{(state.reviewer.trim() || 'S').slice(0, 1).toUpperCase()}</button>{menuOpen && <div className="account-popover"><span>WORKSPACE OPTIONS</span><button onClick={reset}><Icon name="reset" size={15} /> Reset case</button></div>}</div></div></header><main className="main-content"><StepBar page={state.page} navigate={navigate} />{presenterMode && <PresenterBanner state={state} />}
    {state.page === 'sources' && <Sources state={state} upload={upload} navigate={navigate} toast={toast} />}
    {state.page === 'draft' && <Draft navigate={navigate} />}
    {state.page === 'review' && <Review state={state} setState={setState} reviewed={reviewed} openEmail={() => setEmailOpen(true)} navigate={navigate} toast={toast} />}
    {state.page === 'compliance' && <Compliance state={state} setState={setState} reviewed={reviewed} canSign={canSign} sign={sign} navigate={navigate} />}
    {state.page === 'passport' && <Passport state={state} reviewed={reviewed} />}
  </main></div></div>{emailOpen && <EmailModal close={() => setEmailOpen(false)} useEvidence={useEvidence} presenterMode={presenterMode} />}<div className={`toast ${toastText ? 'visible' : ''}`} role="status" aria-live="polite">{toastText}</div></>;
}
