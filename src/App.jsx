import { useState, useEffect, useCallback } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --bg:#080d0b; --bg2:#0f1510; --card:#131c14; --card2:#182018; --border:#1e2b20;
    --green:#2ecc71; --green2:#27ae60; --green-dim:rgba(46,204,113,0.12);
    --orange:#f39c12; --orange2:#e67e22; --orange-dim:rgba(243,156,18,0.12);
    --red:#e74c3c; --red-dim:rgba(231,76,60,0.12); --blue:#3498db; --blue-dim:rgba(52,152,219,0.12);
    --text:#dff0e0; --text2:#7a9a80; --text3:#4a6450;
    --font-display:'Bebas Neue',sans-serif; --font-body:'DM Sans',sans-serif;
    --font-mono:'JetBrains Mono',monospace;
    --radius:12px; --radius-lg:20px; --radius-xl:28px;
    --shadow:0 4px 24px rgba(0,0,0,0.5); --shadow-sm:0 2px 8px rgba(0,0,0,0.3);
  }
  html { scroll-behavior:smooth; }
  body { background:var(--bg); color:var(--text); font-family:var(--font-body); -webkit-tap-highlight-color:transparent; overscroll-behavior:none; }
  .app { min-height:100vh; }
  input,select,textarea,button { font-family:var(--font-body); }

  /* AUTH */
  .auth-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:1.5rem; background:var(--bg); position:relative; overflow:hidden; }
  .auth-orb1 { position:absolute; width:600px; height:600px; background:radial-gradient(circle,rgba(46,204,113,0.09),transparent 70%); top:-150px; left:-150px; pointer-events:none; animation:orbFloat1 9s ease-in-out infinite; border-radius:50%; }
  .auth-orb2 { position:absolute; width:500px; height:500px; background:radial-gradient(circle,rgba(243,156,18,0.07),transparent 70%); bottom:-100px; right:-100px; pointer-events:none; animation:orbFloat2 11s ease-in-out infinite; border-radius:50%; }
  @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(40px,30px) scale(1.05);} }
  @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-30px,40px) scale(1.08);} }
  .auth-box { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-xl); padding:2.5rem 2rem; width:100%; max-width:440px; position:relative; z-index:1; box-shadow:var(--shadow); }
  .auth-logo { font-family:var(--font-display); font-size:3.5rem; letter-spacing:0.05em; background:linear-gradient(135deg,var(--green) 30%,var(--orange) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; text-align:center; line-height:1; margin-bottom:0.1rem; }
  .auth-subtitle { text-align:center; font-size:0.72rem; color:var(--text3); letter-spacing:0.25em; text-transform:uppercase; margin-bottom:2rem; margin-top:0.2rem; }
  .auth-tabs { display:flex; background:var(--bg2); border-radius:var(--radius); padding:4px; margin-bottom:1.75rem; gap:4px; }
  .auth-tab { flex:1; padding:0.6rem; border-radius:8px; text-align:center; font-size:0.85rem; font-weight:600; cursor:pointer; color:var(--text2); transition:all 0.2s; }
  .auth-tab.active { background:var(--card2); color:var(--text); }
  .auth-error { background:var(--red-dim); border:1px solid rgba(231,76,60,0.3); color:var(--red); padding:0.75rem 1rem; border-radius:var(--radius); font-size:0.85rem; margin-bottom:1rem; }
  .auth-success { background:var(--green-dim); border:1px solid rgba(46,204,113,0.3); color:var(--green); padding:0.75rem 1rem; border-radius:var(--radius); font-size:0.85rem; margin-bottom:1rem; }
  .auth-switch { text-align:center; font-size:0.85rem; color:var(--text2); margin-top:1.25rem; }
  .auth-switch span { color:var(--green); cursor:pointer; font-weight:600; }
  .role-selector { display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem; margin-bottom:1rem; }
  .role-opt { padding:0.75rem 0.5rem; border-radius:var(--radius); border:1px solid var(--border); text-align:center; cursor:pointer; font-size:0.8rem; color:var(--text2); transition:all 0.2s; }
  .role-opt.sel-aluno { border-color:var(--green); background:var(--green-dim); color:var(--green); }
  .role-opt.sel-treinador { border-color:var(--orange); background:var(--orange-dim); color:var(--orange); }
  .role-opt.sel-nutri { border-color:var(--blue); background:rgba(52,152,219,0.1); color:var(--blue); }
  .role-opt-icon { font-size:1.5rem; margin-bottom:0.25rem; }
  .demo-box { margin-top:1.5rem; padding:1rem; background:var(--bg2); border-radius:var(--radius); font-size:0.78rem; color:var(--text3); line-height:1.9; }
  .demo-box b { color:var(--text2); }

  /* SHELL */
  .shell { display:flex; min-height:100vh; }
  .sidebar { width:240px; min-height:100vh; background:var(--card); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:1.5rem 1rem; position:sticky; top:0; height:100vh; overflow-y:auto; }
  .sidebar-logo { font-family:var(--font-display); font-size:2rem; letter-spacing:0.05em; background:linear-gradient(135deg,var(--green),var(--orange)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; padding:0 0.5rem; margin-bottom:0.1rem; }
  .sidebar-name { padding:0 0.5rem; font-size:0.9rem; font-weight:600; color:var(--text); }
  .sidebar-role { padding:0 0.5rem; font-size:0.7rem; color:var(--text3); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:1.5rem; }
  .nav-section { margin-bottom:1.5rem; }
  .nav-label { font-size:0.65rem; color:var(--text3); letter-spacing:0.2em; text-transform:uppercase; padding:0 0.5rem; margin-bottom:0.5rem; }
  .nav-item { display:flex; align-items:center; gap:0.75rem; padding:0.65rem 0.75rem; border-radius:var(--radius); cursor:pointer; font-size:0.9rem; color:var(--text2); border:1px solid transparent; margin-bottom:2px; transition:all 0.2s; }
  .nav-item:hover { background:var(--bg2); color:var(--text); }
  .nav-item.active { background:var(--green-dim); color:var(--green); border-color:rgba(46,204,113,0.2); font-weight:700; }
  .nav-item.active.orange { background:var(--orange-dim); color:var(--orange); border-color:rgba(243,156,18,0.2); }
  .nav-item.active.blue { background:rgba(52,152,219,0.1); color:var(--blue); border-color:rgba(52,152,219,0.2); }
  .nav-icon { font-size:1.1rem; width:20px; text-align:center; }
  .sidebar-footer { margin-top:auto; padding-top:1rem; border-top:1px solid var(--border); }
  .logout-btn { display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:var(--text3); cursor:pointer; padding:0.6rem 0.75rem; border-radius:var(--radius); width:100%; transition:all 0.18s; background:none; border:none; }
  .logout-btn:hover { color:var(--red); background:var(--red-dim); }
  .main { flex:1; overflow-y:auto; background:var(--bg); }
  .page { padding:2rem; max-width:960px; margin:0 auto; }
  .page-header { margin-bottom:1.75rem; padding-bottom:1.25rem; border-bottom:1px solid var(--border); }
  .page-title { font-family:var(--font-display); font-size:2.5rem; letter-spacing:0.05em; line-height:1; }
  .page-sub { color:var(--text2); font-size:0.9rem; margin-top:0.25rem; margin-bottom:2rem; }

  /* CARDS */
  .card { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:1.5rem; margin-bottom:1.5rem; }
  .card-title { font-family:var(--font-display); font-size:1.3rem; letter-spacing:0.05em; margin-bottom:1rem; }
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
  .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
  .stat-tile { background:var(--card2); border:1px solid var(--border); border-radius:var(--radius); padding:1.25rem; }
  .stat-label { font-size:0.75rem; color:var(--text3); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:0.25rem; }
  .stat-value { font-family:var(--font-display); font-size:2.2rem; letter-spacing:0.05em; line-height:1; }
  .stat-unit { font-size:0.8rem; color:var(--text2); }
  .green{color:var(--green);} .orange{color:var(--orange);} .blue{color:var(--blue);} .red{color:var(--red);}

  /* PROGRESS */
  .prog-wrap { margin-bottom:1rem; }
  .prog-hdr { display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.85rem; }
  .prog-track { height:8px; background:var(--border); border-radius:999px; overflow:hidden; }
  .prog-fill { height:100%; border-radius:999px; transition:width 0.5s; }
  .prog-fill.green { background:linear-gradient(90deg,var(--green2),var(--green)); }
  .prog-fill.blue { background:linear-gradient(90deg,#2980b9,var(--blue)); }
  .prog-fill.orange { background:linear-gradient(90deg,var(--orange2),var(--orange)); }

  /* FORM */
  .form-group { margin-bottom:1rem; }
  .form-label { display:block; font-size:0.8rem; color:var(--text2); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:0.4rem; }
  .form-input,.form-select,.form-textarea { width:100%; background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); color:var(--text); font-family:var(--font-body); font-size:0.95rem; padding:0.75rem 1rem; outline:none; transition:border-color 0.2s; }
  .form-input:focus,.form-select:focus,.form-textarea:focus { border-color:var(--green); }
  .form-textarea { resize:vertical; min-height:80px; }
  .form-select option { background:var(--card); }

  /* BUTTONS */
  .btn { display:inline-flex; align-items:center; gap:0.5rem; padding:0.75rem 1.5rem; border-radius:var(--radius); font-family:var(--font-body); font-size:0.9rem; font-weight:600; cursor:pointer; border:none; transition:all 0.2s; }
  .btn-primary { background:var(--green); color:#0a0f0d; }
  .btn-primary:hover { background:var(--green2); transform:translateY(-1px); }
  .btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
  .btn-orange { background:var(--orange); color:#0a0f0d; }
  .btn-orange:hover { background:var(--orange2); }
  .btn-blue { background:var(--blue); color:#fff; }
  .btn-blue:hover { background:#2980b9; }
  .btn-ghost { background:transparent; color:var(--text2); border:1px solid var(--border); }
  .btn-ghost:hover { border-color:var(--text2); color:var(--text); }
  .btn-green-out { background:transparent; color:var(--green); border:1px solid var(--green); }
  .btn-green-out:hover { background:var(--green-dim); }
  .btn-sm { padding:0.5rem 1rem; font-size:0.8rem; }
  .btn-full { width:100%; justify-content:center; }

  /* ALERTS */
  .alert { padding:0.85rem 1rem; border-radius:var(--radius); font-size:0.85rem; margin-bottom:1rem; }
  .alert-success { background:var(--green-dim); color:var(--green); border:1px solid rgba(46,204,113,0.3); }
  .alert-warn { background:var(--orange-dim); color:var(--orange); border:1px solid rgba(243,156,18,0.3); }
  .alert-info { background:rgba(52,152,219,0.1); color:var(--blue); border:1px solid rgba(52,152,219,0.3); }
  .alert-danger { background:var(--red-dim); color:var(--red); border:1px solid rgba(231,76,60,0.3); }

  /* CHECK */
  .check-item { display:flex; align-items:center; gap:0.75rem; padding:0.75rem; border-radius:var(--radius); cursor:pointer; font-size:0.9rem; transition:background 0.2s; }
  .check-item:hover { background:var(--card2); }
  .check-box { width:20px; height:20px; border:2px solid var(--border); border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:0.75rem; transition:all 0.2s; }
  .check-box.checked { background:var(--green); border-color:var(--green); color:#0a0f0d; }
  .check-box.checked-orange { background:var(--orange); border-color:var(--orange); color:#0a0f0d; }

  /* TAGS */
  .tag { display:inline-flex; align-items:center; padding:0.3rem 0.75rem; border-radius:999px; font-size:0.75rem; font-weight:600; }
  .tag-green { background:var(--green-dim); color:var(--green); }
  .tag-orange { background:var(--orange-dim); color:var(--orange); }
  .tag-red { background:var(--red-dim); color:var(--red); }
  .tag-blue { background:rgba(52,152,219,0.15); color:var(--blue); }

  /* QUICK BTNS */
  .quick-btns { display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:1rem; }
  .quick-btn { background:var(--card2); border:1px solid var(--border); border-radius:var(--radius); padding:0.75rem 1rem; cursor:pointer; font-size:0.85rem; color:var(--text2); display:flex; flex-direction:column; align-items:center; gap:0.25rem; min-width:80px; transition:all 0.2s; }
  .quick-btn:hover { border-color:var(--green); color:var(--green); }
  .quick-btn-icon { font-size:1.5rem; }

  /* PAIN */
  .pain-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.5rem; }
  .muscle-btn { padding:0.5rem; border-radius:var(--radius); background:var(--card2); border:1px solid var(--border); font-size:0.75rem; text-align:center; cursor:pointer; color:var(--text2); transition:all 0.2s; }
  .muscle-btn.selected { background:var(--red-dim); border-color:var(--red); color:var(--red); }

  /* MEAL */
  .meal-item { display:flex; align-items:center; justify-content:space-between; padding:0.75rem; background:var(--card2); border-radius:var(--radius); margin-bottom:0.5rem; }
  .meal-time { font-family:var(--font-mono); font-size:0.75rem; color:var(--text3); }

  /* COMP */
  .comp-card { background:var(--card2); border:1px solid var(--border); border-radius:var(--radius); padding:1rem; margin-bottom:0.75rem; display:flex; align-items:center; gap:1rem; }
  .comp-date { text-align:center; min-width:50px; font-family:var(--font-display); line-height:1.1; }
  .comp-date-day { font-size:1.8rem; color:var(--orange); }
  .comp-date-month { font-size:0.7rem; color:var(--text3); text-transform:uppercase; }

  /* TOGGLE */
  .toggle-wrap { display:flex; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap; }
  .toggle-btn { padding:0.5rem 1rem; border-radius:999px; font-size:0.85rem; font-weight:600; cursor:pointer; border:1px solid var(--border); background:transparent; color:var(--text2); transition:all 0.2s; }
  .toggle-btn.active-green { background:var(--green-dim); border-color:var(--green); color:var(--green); }
  .toggle-btn.active-orange { background:var(--orange-dim); border-color:var(--orange); color:var(--orange); }
  .toggle-btn.active-blue { background:rgba(52,152,219,0.15); border-color:var(--blue); color:var(--blue); }

  /* ALUNO ROW */
  .aluno-row { display:flex; align-items:center; gap:1rem; padding:0.85rem; border-radius:var(--radius); border-bottom:1px solid var(--border); cursor:pointer; transition:background 0.2s; }
  .aluno-row:hover { background:var(--card2); }
  .aluno-avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.95rem; font-weight:700; flex-shrink:0; background:var(--green-dim); color:var(--green); font-family:var(--font-display); }

  /* STARS */
  .stars { display:flex; gap:0.25rem; }

  /* SPINNER */
  .spinner { width:20px; height:20px; border:2px solid var(--border); border-top-color:var(--green); border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* CÓDIGO */
  .codigo-box { background:var(--bg2); border:2px dashed var(--border); border-radius:var(--radius-lg); padding:1.5rem; text-align:center; margin-bottom:1rem; }
  .codigo-val { font-family:var(--font-mono); font-size:2.2rem; letter-spacing:0.3em; color:var(--green); font-weight:700; margin:0.5rem 0; }
  .codigo-label { font-size:0.75rem; color:var(--text3); letter-spacing:0.15em; text-transform:uppercase; }

  /* SAÚDE STATUS */
  .saude-status-box { border-radius:var(--radius-lg); padding:1.25rem; margin-bottom:0.75rem; display:flex; align-items:center; gap:1rem; }
  .saude-status-box.doente { background:var(--red-dim); border:1px solid rgba(231,76,60,0.4); }
  .saude-status-box.dor { background:var(--orange-dim); border:1px solid rgba(243,156,18,0.4); }
  .saude-status-box.bem { background:var(--green-dim); border:1px solid rgba(46,204,113,0.4); }
  .saude-status-icon { font-size:2.5rem; flex-shrink:0; }
  .saude-status-titulo { font-family:var(--font-display); font-size:1.4rem; letter-spacing:0.05em; }
  .saude-status-dias { font-size:0.85rem; margin-top:0.15rem; }

  /* DIÁRIO */
  .diario-section { background:var(--bg2); border-radius:var(--radius); padding:1rem; margin-bottom:0.75rem; }
  .diario-label { font-size:0.7rem; color:var(--text3); text-transform:uppercase; letter-spacing:0.15em; margin-bottom:0.5rem; }
  .diario-val { font-size:0.9rem; color:var(--text); }

  /* VÍNCULO */
  .vinc-input-wrap { display:flex; gap:0.75rem; align-items:flex-end; }
  .vinc-resultado { background:var(--green-dim); border:1px solid rgba(46,204,113,0.3); border-radius:var(--radius); padding:0.85rem 1rem; display:flex; align-items:center; gap:0.75rem; margin-top:0.75rem; }
  .vinc-avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:700; flex-shrink:0; font-family:var(--font-display); background:var(--border); }

  /* SEMANA DE TREINO */
  .week-tabs { display:flex; gap:0.4rem; margin-bottom:1.5rem; flex-wrap:wrap; }
  .week-tab { padding:0.5rem 1rem; border-radius:999px; font-size:0.82rem; font-weight:700; cursor:pointer; border:1px solid var(--border); background:transparent; color:var(--text2); transition:all 0.2s; font-family:var(--font-display); letter-spacing:0.05em; }
  .week-tab.active { background:var(--green-dim); border-color:var(--green); color:var(--green); }
  .week-tab.done { background:var(--card2); border-color:var(--green2); color:var(--green2); }
  .week-tab.active.orange { background:var(--orange-dim); border-color:var(--orange); color:var(--orange); }

  .treino-card { background:var(--card2); border:1px solid var(--border); border-radius:var(--radius-lg); padding:1.25rem; margin-bottom:1rem; }
  .treino-card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
  .treino-nome { font-family:var(--font-display); font-size:1.5rem; letter-spacing:0.05em; }
  .treino-periodo { font-size:0.75rem; color:var(--text3); }
  .treino-modalidade { display:inline-flex; align-items:center; gap:0.4rem; padding:0.3rem 0.75rem; border-radius:999px; font-size:0.75rem; font-weight:600; }

  .ex-item { display:flex; align-items:center; gap:0.75rem; padding:0.65rem 0.75rem; border-radius:var(--radius); cursor:pointer; transition:background 0.2s; border-bottom:1px solid var(--border); }
  .ex-item:last-child { border-bottom:none; }
  .ex-item:hover { background:var(--bg2); }
  .ex-item.done-ex { opacity:0.6; }
  .ex-nome { font-weight:600; font-size:0.9rem; flex:1; }
  .ex-info { font-size:0.78rem; color:var(--text2); }

  /* REFEIÇÃO CHECKBOX */
  .refeicao-item { display:flex; align-items:center; gap:1rem; padding:0.85rem; border-radius:var(--radius-lg); margin-bottom:0.5rem; border:1px solid var(--border); transition:all 0.2s; cursor:pointer; }
  .refeicao-item:hover { background:var(--card2); }
  .refeicao-item.comido { background:var(--green-dim); border-color:rgba(46,204,113,0.3); }
  .refeicao-hora { font-family:var(--font-mono); font-size:0.8rem; color:var(--text3); min-width:45px; }
  .refeicao-info { flex:1; }
  .refeicao-nome { font-weight:600; font-size:0.9rem; margin-bottom:0.15rem; }
  .refeicao-itens { font-size:0.78rem; color:var(--text2); }
  .refeicao-kcal { font-size:0.8rem; font-weight:600; color:var(--green); flex-shrink:0; }

  /* ALUNO SELECTOR */
  .aluno-sel-wrap { display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.5rem; }
  .aluno-sel-btn { display:flex; align-items:center; gap:0.5rem; padding:0.5rem 0.85rem; border-radius:999px; border:1px solid var(--border); background:transparent; color:var(--text2); cursor:pointer; font-size:0.85rem; font-family:var(--font-body); transition:all 0.2s; }
  .aluno-sel-btn:hover { border-color:var(--green); color:var(--green); }
  .aluno-sel-btn.sel { background:var(--green-dim); border-color:var(--green); color:var(--green); }
  .aluno-sel-btn.sel-orange { background:var(--orange-dim); border-color:var(--orange); color:var(--orange); }
  .aluno-sel-btn.sel-blue { background:rgba(52,152,219,0.15); border-color:var(--blue); color:var(--blue); }
  .aluno-sel-avatar { width:24px; height:24px; border-radius:50%; background:var(--border); display:flex; align-items:center; justify-content:center; font-size:0.65rem; font-weight:700; font-family:var(--font-display); }

  /* PERÍODO */
  .periodo-card { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:1rem; margin-bottom:1rem; }
  .periodo-badge { display:inline-flex; align-items:center; gap:0.4rem; padding:0.3rem 0.75rem; border-radius:999px; font-size:0.78rem; font-weight:700; background:var(--green-dim); color:var(--green); font-family:var(--font-mono); }

  /* MOBILE NAV BAR */
  .mobile-nav {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: var(--card);
    border-top: 1px solid var(--border);
    z-index: 100;
    padding: 0.4rem 0 calc(0.4rem + env(safe-area-inset-bottom));
  }
  .mobile-nav-items { display: flex; justify-content: space-around; align-items: center; }
  .mobile-nav-item {
    display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
    padding: 0.4rem 0.75rem; border-radius: var(--radius); cursor: pointer;
    transition: all 0.2s; flex: 1; max-width: 80px;
    background: none; border: none; color: var(--text3);
  }
  .mobile-nav-item.active { color: var(--green); }
  .mobile-nav-item.active.orange { color: var(--orange); }
  .mobile-nav-item.active.blue { color: var(--blue); }
  .mobile-nav-icon { font-size: 1.35rem; line-height: 1; }
  .mobile-nav-label { font-size: 0.58rem; font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; line-height: 1; }
  .mobile-nav-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; margin-top: 2px; }


  /* TOAST */
  @keyframes slideIn { from{transform:translateX(120%);opacity:0;} to{transform:translateX(0);opacity:1;} }

  /* EMPTY STATE */
  .empty-state { text-align:center; padding:3rem 1rem; color:var(--text3); }
  .empty-icon { font-size:3.5rem; margin-bottom:0.75rem; }
  .empty-title { font-family:var(--font-display); font-size:1.5rem; color:var(--text2); margin-bottom:0.5rem; letter-spacing:0.05em; }
  .empty-desc { font-size:0.85rem; line-height:1.7; }

  /* IMC */
  .stat-sub { font-size:0.72rem; color:var(--text3); margin-top:0.2rem; }

  @media(max-width:768px){
    .sidebar { display:none; }
    .mobile-nav { display:block; }
    .main { padding-bottom: 70px; }
    .grid-2,.grid-4 { grid-template-columns:1fr 1fr; }
    .pain-grid { grid-template-columns:repeat(3,1fr); }
    .grid-3 { grid-template-columns:1fr 1fr; }
    .page { padding: 1.25rem 1rem; }
    .page-title { font-size: 2rem; }
    .auth-box { padding: 1.75rem 1.25rem; }
  }
`;

// ============================================================
// TOAST SYSTEM
// ============================================================
function Toast({msg,type,onClose}){
  useEffect(()=>{const t=setTimeout(onClose,3800);return()=>clearTimeout(t);},[]);
  const icons={success:"✅",warn:"⚠️",error:"❌"};
  const borders={success:"rgba(46,204,113,0.4)",warn:"rgba(243,156,18,0.4)",error:"rgba(231,76,60,0.4)"};
  return(
    <div style={{position:"fixed",top:"1.25rem",right:"1.25rem",background:"var(--card)",border:`1px solid ${borders[type]||borders.success}`,borderRadius:"var(--radius-lg)",padding:"0.85rem 1.1rem",display:"flex",alignItems:"center",gap:"0.75rem",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:9999,fontSize:"0.88rem",maxWidth:"320px",animation:"slideInRight 0.3s cubic-bezier(.34,1.56,.64,1)",backdropFilter:"blur(8px)"}}>
      <span style={{fontSize:"1.1rem"}}>{icons[type]||icons.success}</span>
      <span style={{flex:1,lineHeight:1.4}}>{msg}</span>
      <span style={{cursor:"pointer",opacity:0.4,fontSize:"1.1rem",flexShrink:0,lineHeight:1}} onClick={onClose}>✕</span>
    </div>
  );
}
function useToast(){
  const [toast,setToast]=useState(null);
  const show=useCallback((msg,type="success")=>setToast({msg,type,id:Date.now()}),[]);
  const hide=useCallback(()=>setToast(null),[]);
  const ToastEl=toast?<Toast key={toast.id} msg={toast.msg} type={toast.type} onClose={hide}/>:null;
  return{show,ToastEl};
}


// ============================================================
// HELPERS
// ============================================================
function getGreeting(){const h=new Date().getHours();if(h<12)return"BOM DIA";if(h<18)return"BOA TARDE";return"BOA NOITE";}
function getDateStr(){return new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).replace(/^\w/,c=>c.toUpperCase());}
function firstName(n){return n?n.trim().split(" ")[0].toUpperCase():"";}
function initials(n){if(!n)return"?";const p=n.trim().split(" ");return p.length>=2?(p[0][0]+p[p.length-1][0]).toUpperCase():p[0][0].toUpperCase();}
function diffDays(d){if(!d)return 0;return Math.max(Math.floor((Date.now()-new Date(d).getTime())/(864e5)),0);}
function pluralDia(n){return n===1?"dia":"dias";}
function calcIMC(peso,altura){if(!peso||!altura)return null;const imc=Number(peso)/((Number(altura)/100)**2);return{val:imc.toFixed(1),cat:imc<18.5?"Abaixo do peso":imc<25?"Normal":imc<30?"Sobrepeso":"Obesidade"};}
function gerarCodigo(seed){const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let r="",s=seed%999999;for(let i=0;i<6;i++){r+=c[s%c.length];s=Math.floor(s/c.length)+7;}return r.slice(0,6);}
function addMonths(date,n){const d=new Date(date);d.setMonth(d.getMonth()+n);return d;}
function fmtDate(d){return new Date(d).toLocaleDateString("pt-BR");}

const TIPO_ICONS={descanso:"😴",academia:"🏋️",corrida:"🏃",natacao:"🏊",luta:"🥊",ciclismo:"🚴",funcional:"⚡",caminhada:"🚶",yoga:"🧘",treino:"🏋️"};
const DIAS_SEMANA=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
const MODALIDADES=[{v:"musculacao",l:"💪 Musculação"},{v:"corrida",l:"🏃 Corrida"},{v:"natacao",l:"🏊 Natação"},{v:"luta",l:"🥊 Luta / Artes Marciais"},{v:"ciclismo",l:"🚴 Ciclismo"},{v:"caminhada",l:"🚶 Caminhada"},{v:"funcional",l:"⚡ Funcional"}];
const MUSCLES=["Ombro D","Ombro E","Bíceps D","Bíceps E","Tríceps D","Tríceps E","Peitoral","Costas","Lombar","Abdômen","Glúteo","Quadríceps D","Quadríceps E","Panturrilha D","Panturrilha E","Isquio"];

// ============================================================
// LOCAL DB
// ============================================================
const DB={
  getUsers:()=>JSON.parse(localStorage.getItem("tf_users")||"[]"),
  saveUsers:u=>localStorage.setItem("tf_users",JSON.stringify(u)),
  getSession:()=>JSON.parse(localStorage.getItem("tf_session")||"null"),
  saveSession:u=>localStorage.setItem("tf_session",JSON.stringify(u)),
  clearSession:()=>localStorage.removeItem("tf_session"),
  register(nome,email,senha,role){
    const users=this.getUsers();
    if(users.find(u=>u.email.toLowerCase()===email.toLowerCase()))return{ok:false,msg:"Email já cadastrado."};
    const user={id:Date.now(),nome,email:email.toLowerCase(),senha,role};
    users.push(user);this.saveUsers(users);return{ok:true,user};
  },
  login(email,senha){
    const user=this.getUsers().find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.senha===senha);
    if(!user)return{ok:false,msg:"Email ou senha incorretos."};
    return{ok:true,user};
  },
  getUserByCodigo(c){return this.getUsers().find(u=>gerarCodigo(u.id)===c.toUpperCase())||null;},
  getUserById(id){return this.getUsers().find(u=>u.id===id)||null;},
  getVinculos:()=>JSON.parse(localStorage.getItem("tf_vinculos")||"[]"),
  saveVinculos:v=>localStorage.setItem("tf_vinculos",JSON.stringify(v)),
  getVinculoAluno(id){return this.getVinculos().find(v=>v.alunoId===id)||null;},
  setVinculoAluno(alunoId,treinadorId,nutriId){
    const vs=this.getVinculos().filter(v=>v.alunoId!==alunoId);
    vs.push({alunoId,treinadorId:treinadorId||null,nutriId:nutriId||null});
    this.saveVinculos(vs);
  },
  getAlunosDe(profId){
    const ids=this.getVinculos().filter(v=>v.treinadorId===profId||v.nutriId===profId).map(v=>v.alunoId);
    return this.getUsers().filter(u=>ids.includes(u.id));
  },
  getData:(k,uid)=>JSON.parse(localStorage.getItem(`tf_${k}_${uid}`)||"null"),
  getAllKeys:(uid)=>Object.keys(localStorage).filter(k=>k.startsWith(`tf_`)&&k.endsWith(`_${uid}`)),
  clearUserData:(uid)=>{Object.keys(localStorage).filter(k=>k.includes(`_${uid}`)).forEach(k=>localStorage.removeItem(k));},
  setData:(k,uid,val)=>localStorage.setItem(`tf_${k}_${uid}`,JSON.stringify(val)),
};

// ============================================================
// AUTH
// ============================================================
function AuthScreen({onLogin}){
  const [tab,setTab]=useState("login");
  const [role,setRole]=useState("aluno");
  const [nome,setNome]=useState("");
  const [email,setEmail]=useState("");
  const [senha,setSenha]=useState("");
  const [confirma,setConfirma]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const [showSenha,setShowSenha]=useState(false);
  function handleLogin(e){e.preventDefault();setError("");setLoading(true);setTimeout(()=>{const res=DB.login(email,senha);setLoading(false);if(!res.ok){setError(res.msg);return;}DB.saveSession(res.user);onLogin(res.user);},500);}
  function handleRegister(e){e.preventDefault();setError("");setSuccess("");if(!nome.trim()){setError("Informe seu nome.");return;}if(senha.length<6){setError("Senha: mínimo 6 caracteres.");return;}if(senha!==confirma){setError("Senhas não conferem.");return;}setLoading(true);setTimeout(()=>{const res=DB.register(nome.trim(),email,senha,role);setLoading(false);if(!res.ok){setError(res.msg);return;}setSuccess("Conta criada! Faça login.");setTab("login");setNome("");setSenha("");setConfirma("");},500);}
  return(
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">TrioFit</div>
        <div className="auth-subtitle">Aluno • Treinador • Nutricionista</div>
        <div className="auth-tabs">
          <div className={`auth-tab ${tab==="login"?"active":""}`} onClick={()=>{setTab("login");setError("");setSuccess("");}}>Entrar</div>
          <div className={`auth-tab ${tab==="register"?"active":""}`} onClick={()=>{setTab("register");setError("");setSuccess("");}}>Criar conta</div>
        </div>
        {error&&<div className="auth-error">⚠️ {error}</div>}
        {success&&<div className="auth-success">✅ {success}</div>}
        {tab==="login"?(
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" autoCapitalize="none"/>
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <div style={{position:"relative"}}>
                <input className="form-input" type={showSenha?"text":"password"} placeholder="••••••••" value={senha} onChange={e=>setSenha(e.target.value)} required style={{paddingRight:"3rem"}} autoComplete="current-password"/>
                <button type="button" onClick={()=>setShowSenha(p=>!p)} style={{position:"absolute",right:"0.75rem",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--text3)",fontSize:"1rem",cursor:"pointer",lineHeight:1,padding:"0.25rem"}}>{showSenha?"🙈":"👁️"}</button>
              </div>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{marginTop:"0.25rem"}}>
              {loading?<><span className="spinner"/> Entrando...</>:"Entrar"}
            </button>
          </form>
        ):(
          <form onSubmit={handleRegister}>
            <div className="form-group"><label className="form-label">Você é...</label>
              <div className="role-selector">
                {[["aluno","🏃","Aluno"],["treinador","🏋️","Treinador"],["nutri","🥗","Nutricionista"]].map(([v,icon,lbl])=>(
                  <div key={v} className={`role-opt ${role===v?`sel-${v}`:""}`} onClick={()=>setRole(v)}><div className="role-opt-icon">{icon}</div><div>{lbl}</div></div>
                ))}
              </div>
            </div>
            <div className="form-group"><label className="form-label">Nome completo</label><input className="form-input" type="text" placeholder="Seu nome" value={nome} onChange={e=>setNome(e.target.value)} required/></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <div className="form-group"><label className="form-label">Senha</label><input className="form-input" type="password" placeholder="Mínimo 6 caracteres" value={senha} onChange={e=>setSenha(e.target.value)} required/></div>
            <div className="form-group"><label className="form-label">Confirmar senha</label><input className="form-input" type="password" placeholder="Repita a senha" value={confirma} onChange={e=>setConfirma(e.target.value)} required/></div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>{loading?<><span className="spinner"/> Criando...</>:"Criar conta grátis"}}</button>
          </form>
        )}
        <div className="auth-switch">{tab==="login"?<>Não tem conta? <span onClick={()=>{setTab("register");setError("");}}>Cadastre-se grátis</span></>:<>Já tem conta? <span onClick={()=>{setTab("login");setError("");}}>Entrar</span></>}</div>
        <div className="demo-box"><b>🔑 Contas demo:</b><br/>aluno@demo.com • 123456<br/>treinador@demo.com • 123456<br/>nutri@demo.com • 123456</div>
      </div>
    </div>
  );
}

// ============================================================
// SHELL
// ============================================================
function Shell({user,onLogout,nav,active,setActive,accent,children}){
  const roleLabel={aluno:"Aluno",treinador:"Treinador",nutri:"Nutricionista"}[user.role];

  // Flat list of all nav items for mobile bar (max 5)
  const allItems = nav.flatMap(s=>s.items);
  // Pick primary items + logout for mobile
  const mobileItems = allItems.slice(0, 4);

  return(
    <div className="shell">
      {/* SIDEBAR — desktop */}
      <div className="sidebar">
        <div style={{fontFamily:"var(--font-display)",fontSize:"2rem",letterSpacing:"0.05em",background:"linear-gradient(135deg,var(--green),var(--orange))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",padding:"0 0.5rem",marginBottom:"0.1rem"}}>TrioFit</div>
        <div style={{margin:"0.75rem 0 1.5rem",padding:"0.75rem",background:"var(--card2)",borderRadius:"var(--radius)",border:"1px solid var(--border)",display:"flex",alignItems:"center",gap:"0.65rem"}}>
          <div style={{width:"34px",height:"34px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-display)",fontSize:"0.85rem",fontWeight:700,flexShrink:0,background:{aluno:"var(--green-dim)",treinador:"var(--orange-dim)",nutri:"var(--blue-dim)"}[user.role],color:{aluno:"var(--green)",treinador:"var(--orange)",nutri:"var(--blue)"}[user.role]}}>{initials(user.nome)}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:"0.85rem",fontWeight:700,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.nome}</div>
            <div style={{fontSize:"0.63rem",color:"var(--text3)",letterSpacing:"0.12em",textTransform:"uppercase"}}>{roleLabel}</div>
          </div>
        </div>
        {nav.map(s=>(
          <div key={s.section} className="nav-section">
            <div className="nav-label">{s.section}</div>
            {s.items.map(it=>(
              <div key={it.id} className={`nav-item ${active===it.id?`active ${accent}`:""}`} onClick={()=>setActive(it.id)}>
                <span className="nav-icon">{it.icon}</span>{it.label}
              </div>
            ))}
          </div>
        ))}
        <div className="sidebar-footer"><div className="logout-btn" onClick={onLogout}>🚪 Sair da conta</div></div>
      </div>

      {/* MAIN */}
      <div className="main">{children}</div>

      {/* BOTTOM NAV — mobile */}
      <nav className="mobile-nav">
        <div className="mobile-nav-items">
          {mobileItems.map(it=>(
            <button key={it.id} className={`mobile-nav-item ${active===it.id?`active ${accent}`:""}`} onClick={()=>setActive(it.id)}>
              <span className="mobile-nav-icon">{it.icon}</span>
              <span className="mobile-nav-label">{it.label.split(" ")[0]}</span>
              {active===it.id&&<div className="mobile-nav-dot"/>}
            </button>
          ))}
          {/* Mais / overflow se tiver mais de 4 itens */}
          {allItems.length > 4 && (
            <button className={`mobile-nav-item ${allItems.slice(4).some(i=>i.id===active)?`active ${accent}`:""}`}
              onClick={()=>{
                // Cycle through overflow items
                const overflow=allItems.slice(4);
                const cur=overflow.findIndex(i=>i.id===active);
                setActive(overflow[(cur+1)%overflow.length].id);
              }}>
              <span className="mobile-nav-icon">☰</span>
              <span className="mobile-nav-label">Mais</span>
              {allItems.slice(4).some(i=>i.id===active)&&<div className="mobile-nav-dot"/>}
            </button>
          )}
          {/* Logout */}
          <button className="mobile-nav-item" onClick={onLogout} style={{color:"var(--text3)"}}>
            <span className="mobile-nav-icon">🚪</span>
            <span className="mobile-nav-label">Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function CodigoProfissional({user}){
  const codigo=gerarCodigo(user.id);
  const [copiado,setCopiado]=useState(false);
  function copiar(){navigator.clipboard&&navigator.clipboard.writeText(codigo);setCopiado(true);setTimeout(()=>setCopiado(false),2000);}
  return(
    <div className="codigo-box">
      <div className="codigo-label">Seu código — passe para seus {user.role==="treinador"?"alunos":"pacientes"}</div>
      <div className="codigo-val">{codigo}</div>
      <button className="btn btn-green-out btn-sm" onClick={copiar}>{copiado?"✅ Copiado!":"📋 Copiar código"}</button>
    </div>
  );
}

function VinculoPorCodigo({label,tipo,atual,onVincular}){
  const [codigo,setCodigo]=useState("");
  const [encontrado,setEncontrado]=useState(null);
  const [erro,setErro]=useState("");
  function buscar(){setErro("");setEncontrado(null);if(codigo.trim().length<6){setErro("Digite os 6 caracteres.");return;}const u=DB.getUserByCodigo(codigo.trim());if(!u){setErro("Código não encontrado.");return;}if(u.role!==tipo){setErro(`Este código é de um ${u.role}, não de um ${label.toLowerCase()}.`);return;}setEncontrado(u);}
  function confirmar(){if(encontrado)onVincular(encontrado);setCodigo("");setEncontrado(null);}
  const cor=tipo==="treinador"?"var(--orange)":tipo==="nutri"?"var(--blue)":"var(--green)";
  return(
    <div>
      {atual&&(
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.85rem",background:"var(--card2)",borderRadius:"var(--radius)",marginBottom:"1rem",border:"1px solid var(--border)"}}>
          <div className="vinc-avatar" style={{background:tipo==="treinador"?"var(--orange-dim)":"rgba(52,152,219,0.15)",color:cor}}>{initials(atual.nome)}</div>
          <div style={{flex:1}}><div style={{fontWeight:600}}>{atual.nome}</div><div style={{fontSize:"0.78rem",color:"var(--text2)"}}>Código: {gerarCodigo(atual.id)}</div></div>
          <span className="tag" style={{background:tipo==="treinador"?"var(--orange-dim)":"rgba(52,152,219,0.1)",color:cor}}>✓ Vinculado</span>
        </div>
      )}
      <div className="form-group">
        <label className="form-label">Código do {label}</label>
        <div className="vinc-input-wrap">
          <input className="form-input" placeholder="Ex: AB3X7K" value={codigo} onChange={e=>setCodigo(e.target.value.toUpperCase())} maxLength={6} style={{fontFamily:"var(--font-mono)",fontSize:"1.1rem",letterSpacing:"0.2em"}}/>
          <button className="btn btn-ghost" onClick={buscar}>Buscar</button>
        </div>
        {erro&&<div style={{color:"var(--red)",fontSize:"0.82rem",marginTop:"0.4rem"}}>⚠️ {erro}</div>}
      </div>
      {encontrado&&(
        <div className="vinc-resultado">
          <div className="vinc-avatar" style={{background:tipo==="treinador"?"var(--orange-dim)":"rgba(52,152,219,0.15)",color:cor}}>{initials(encontrado.nome)}</div>
          <div style={{flex:1}}><div style={{fontWeight:600}}>{encontrado.nome}</div><div style={{fontSize:"0.8rem",color:"var(--text2)"}}>{label} encontrado!</div></div>
          <button className="btn btn-primary btn-sm" onClick={confirmar}>Vincular ✓</button>
        </div>
      )}
    </div>
  );
}

function SaudeStatusCard({status,onRecuperado,onDorRecuperado,soLeitura}){
  const diasDoente=status.doente_desde?diffDays(status.doente_desde):0;
  return(
    <div>
      {status.doente&&(
        <div className="saude-status-box doente">
          <div className="saude-status-icon">🤒</div>
          <div style={{flex:1}}>
            <div className="saude-status-titulo" style={{color:"var(--red)"}}>{diasDoente} {pluralDia(diasDoente)} doente/gripado</div>
            {status.sintomas&&<div className="saude-status-dias" style={{color:"var(--red)"}}>{status.sintomas}</div>}
            {!soLeitura&&<button className="btn btn-sm" style={{marginTop:"0.75rem",background:"var(--red)",color:"#fff"}} onClick={onRecuperado}>✅ Estou recuperado!</button>}
          </div>
        </div>
      )}
      {status.dores&&status.dores.map((d,i)=>(
        <div key={i} className="saude-status-box dor">
          <div className="saude-status-icon">🔴</div>
          <div style={{flex:1}}>
            <div className="saude-status-titulo" style={{color:"var(--orange)"}}>Dor — {d.musculo}</div>
            <div className="saude-status-dias" style={{color:"var(--orange)"}}>{diffDays(d.desde)} {pluralDia(diffDays(d.desde))} com dor{d.intensidade?` • ${d.intensidade}/10`:""}</div>
            {!soLeitura&&<button className="btn btn-sm" style={{marginTop:"0.75rem",background:"var(--orange)",color:"#0a0f0d"}} onClick={()=>onDorRecuperado(i)}>✅ Recuperado</button>}
          </div>
        </div>
      ))}
      {!status.doente&&(!status.dores||status.dores.length===0)&&(
        <div className="saude-status-box bem">
          <div className="saude-status-icon">💪</div>
          <div style={{flex:1}}><div className="saude-status-titulo" style={{color:"var(--green)"}}>Saudável</div><div className="saude-status-dias" style={{color:"var(--green)"}}>Nenhuma ocorrência registrada</div></div>
        </div>
      )}
    </div>
  );
}

// Seletor de aluno para prof — seleção única, clique no mesmo deseleciona
function AlunoSelector({alunos,selecionado,onSelect,accentClass}){
  if(alunos.length===0)return null;
  return(
    <div>
      <div style={{fontSize:"0.8rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.75rem"}}>Selecionar aluno / paciente</div>
      <div className="aluno-sel-wrap">
        {alunos.map(a=>(
          <button key={a.id} className={`aluno-sel-btn ${selecionado?.id===a.id?accentClass:""}`}
            onClick={()=>onSelect(selecionado?.id===a.id ? null : a)}>
            <div className="aluno-sel-avatar">{initials(a.nome)}</div>
            {a.nome.split(" ")[0]}
          </button>
        ))}
      </div>
    </div>
  );
}

// Badge de período do plano
function PeriodoBadge({plano}){
  if(!plano||!plano.inicio)return null;
  const fim=new Date(plano.fim);
  const hoje=new Date();
  const ativo=hoje<=fim;
  const diasRestantes=Math.max(Math.ceil((fim-hoje)/(864e5)),0);
  return(
    <div className="periodo-card">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.5rem"}}>
        <div>
          <div style={{fontSize:"0.75rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.3rem"}}>Vigência do plano</div>
          <div style={{fontWeight:600,fontSize:"0.9rem"}}>{fmtDate(plano.inicio)} → {fmtDate(plano.fim)}</div>
          <div style={{fontSize:"0.8rem",color:"var(--text2)",marginTop:"0.15rem"}}>{plano.duracao} {plano.duracao===1?"mês":"meses"} • {plano.nome}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.3rem"}}>
          <span className="periodo-badge" style={{background:ativo?"var(--green-dim)":"var(--red-dim)",color:ativo?"var(--green)":"var(--red)"}}>
            {ativo?`✓ Ativo — ${diasRestantes}d restantes`:"⚠️ Expirado"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ALUNO — MINHA EQUIPE
// ============================================================
function AlunoVinculo({user,showToast}){
  const [vinculo,setVinculo]=useState(()=>DB.getVinculoAluno(user.id)||{});
  const treinador=vinculo.treinadorId?DB.getUserById(vinculo.treinadorId):null;
  const nutri=vinculo.nutriId?DB.getUserById(vinculo.nutriId):null;
  function vincT(u){const n={...vinculo,treinadorId:u.id};DB.setVinculoAluno(user.id,n.treinadorId,n.nutriId);setVinculo(n);showToast&&showToast(`✅ Treinador ${u.nome.split(" ")[0]} vinculado!`);}
  function vincN(u){const n={...vinculo,nutriId:u.id};DB.setVinculoAluno(user.id,n.treinadorId,n.nutriId);setVinculo(n);showToast&&showToast(`✅ Nutricionista ${u.nome.split(" ")[0]} vinculada!`);}
  function desT(){const n={...vinculo,treinadorId:null};DB.setVinculoAluno(user.id,null,n.nutriId);setVinculo(n);showToast&&showToast("Treinador desvinculado.","warn");}
  function desN(){const n={...vinculo,nutriId:null};DB.setVinculoAluno(user.id,n.treinadorId,null);setVinculo(n);showToast&&showToast("Nutricionista desvinculada.","warn");}
  return(
    <div className="page">
      <div className="page-title green">MINHA EQUIPE</div>
      <div className="page-sub">Use o código de 6 letras do seu profissional para se conectar</div>
      {ok&&<div className="alert alert-success">✅ {ok}</div>}
      <div className="alert alert-info">🔐 Peça o código para seu treinador e nutricionista. Só quem tem o código pode se vincular — suas informações ficam protegidas.</div>
      <div className="card"><div className="card-title">🏋️ TREINADOR</div><VinculoPorCodigo label="Treinador" tipo="treinador" atual={treinador} onVincular={vincT}/>{treinador&&<button className="btn btn-ghost btn-sm" style={{marginTop:"0.5rem",color:"var(--red)"}} onClick={desT}>Desvincular</button>}</div>
      <div className="card"><div className="card-title">🥗 NUTRICIONISTA</div><VinculoPorCodigo label="Nutricionista" tipo="nutri" atual={nutri} onVincular={vincN}/>{nutri&&<button className="btn btn-ghost btn-sm" style={{marginTop:"0.5rem",color:"var(--red)"}} onClick={desN}>Desvincular</button>}</div>
    </div>
  );
}

// ============================================================
// ALUNO — SEMANA DE TREINOS
// ============================================================
function AlunoTreinos({user,showToast}){
  const planoTreino=DB.getData("plano_treino_aluno",user.id);
  const [diaAtivo,setDiaAtivo]=useState(0);
  const [checked,setChecked]=useState(()=>DB.getData("treino_check_hoje",user.id)||{});
  const savedAval=DB.getData("treino_avaliacao",user.id)||{};
  const [rating,setRating]=useState(savedAval.rating||0);
  const [feedback,setFeedback]=useState(savedAval.feedback||"");

  // Determina o dia atual da semana (0=seg)
  const hoje=new Date().getDay();
  const diaHoje=hoje===0?6:hoje-1;

  useEffect(()=>setDiaAtivo(diaHoje),[]);

  function toggleEx(diaIdx,exIdx){
    const key=`${diaIdx}_${exIdx}`;
    const novo={...checked,[key]:!checked[key]};
    setChecked(novo);
    DB.setData("treino_check_hoje",user.id,novo);
  }

  function salvarAvaliacao(){
    DB.setData("treino_avaliacao",user.id,{rating,feedback,data:new Date().toISOString()});
  }

  if(!planoTreino||!planoTreino.dias){
    return(
      <div className="page">
        <div className="page-title green">TREINOS</div>
        <div className="page-sub">Semana completa de treinos</div>
        <div className="card">
          <div className="card-title">📋 AGUARDANDO PLANO</div>
          <div style={{color:"var(--text2)",fontSize:"0.9rem",lineHeight:1.7}}>Seu treinador ainda não enviou um plano de treino.<br/>Assim que ele criar e atribuir a você, aparecerá aqui com todos os dias da semana.</div>
        </div>
      </div>
    );
  }

  const {dias,nome,modalidade,inicio,fim,duracao}=planoTreino;
  const diaInfo=dias[diaAtivo];
  const modLabel=MODALIDADES.find(m=>m.v===modalidade)?.l||modalidade;

  return(
    <div className="page">
      <div className="page-title green">TREINOS</div>
      <div className="page-sub">Semana completa — clique no dia para ver os exercícios</div>
      {ok&&<div className="alert alert-success">✅ Avaliação salva!</div>}

      <PeriodoBadge plano={planoTreino}/>

      {/* ABAS DOS DIAS */}
      <div className="week-tabs">
        {dias.map((d,i)=>{
          const temEx=d.exercicios&&d.exercicios.length>0;
          const feitos=d.exercicios?d.exercicios.filter((_,j)=>checked[`${i}_${j}`]).length:0;
          const todos=d.exercicios?d.exercicios.length:0;
          const completo=temEx&&feitos===todos;
          return(
            <button key={i} className={`week-tab ${diaAtivo===i?(d.tipo==="descanso"?"active orange":"active"):(completo?"done":"")}`} onClick={()=>setDiaAtivo(i)}>
              {DIAS_SEMANA[i].slice(0,3)}
              {completo&&" ✓"}
            </button>
          );
        })}
      </div>

      {/* TREINO DO DIA */}
      {diaInfo.tipo==="descanso"?(
        <div className="treino-card" style={{textAlign:"center",padding:"2.5rem"}}>
          <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>😴</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"1.8rem",color:"var(--orange)",letterSpacing:"0.05em"}}>DIA DE DESCANSO</div>
          <div style={{color:"var(--text2)",fontSize:"0.9rem",marginTop:"0.5rem"}}>{DIAS_SEMANA[diaAtivo]} — recuperação é parte do treino!</div>
        </div>
      ):(
        <div className="treino-card">
          <div className="treino-card-header">
            <div>
              <div className="treino-nome">{diaInfo.nome||`Treino ${diaAtivo+1}`}</div>
              <div className="treino-periodo">{DIAS_SEMANA[diaAtivo]} • {modLabel}</div>
            </div>
            {diaInfo.exercicios&&(
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:"1.8rem",color:"var(--green)"}}>
                  {diaInfo.exercicios.filter((_,j)=>checked[`${diaAtivo}_${j}`]).length}/{diaInfo.exercicios.length}
                </div>
                <div style={{fontSize:"0.7rem",color:"var(--text3)"}}>exercícios</div>
              </div>
            )}
          </div>

          {diaInfo.obs&&<div style={{background:"rgba(52,152,219,0.1)",border:"1px solid rgba(52,152,219,0.2)",borderRadius:"var(--radius)",padding:"0.75rem",fontSize:"0.85rem",color:"var(--blue)",marginBottom:"1rem"}}>📌 {diaInfo.obs}</div>}

          {diaInfo.exercicios&&diaInfo.exercicios.length>0?(
            <>
              <div className="prog-wrap">
                <div className="prog-hdr"><span>Progresso</span><span className="green">{diaInfo.exercicios.filter((_,j)=>checked[`${diaAtivo}_${j}`]).length}/{diaInfo.exercicios.length}</span></div>
                <div className="prog-track"><div className="prog-fill green" style={{width:`${(diaInfo.exercicios.filter((_,j)=>checked[`${diaAtivo}_${j}`]).length/diaInfo.exercicios.length)*100}%`}}/></div>
              </div>
              {diaInfo.exercicios.map((ex,j)=>(
                <div key={j} className={`ex-item ${checked[`${diaAtivo}_${j}`]?"done-ex":""}`} onClick={()=>toggleEx(diaAtivo,j)}>
                  <div className={`check-box ${checked[`${diaAtivo}_${j}`]?"checked":""}`}>{checked[`${diaAtivo}_${j}`]&&"✓"}</div>
                  <div style={{flex:1}}>
                    <div className="ex-nome" style={{textDecoration:checked[`${diaAtivo}_${j}`]?"line-through":"none"}}>{ex.nome}</div>
                    <div className="ex-info">{ex.series&&`${ex.series} séries`}{ex.reps&&` × ${ex.reps}`}{ex.carga&&` • ${ex.carga}`}{ex.duracao&&` • ${ex.duracao}`}</div>
                  </div>
                </div>
              ))}
            </>
          ):<div style={{color:"var(--text3)",fontSize:"0.85rem",padding:"1rem 0"}}>Nenhum exercício cadastrado para este dia.</div>}
        </div>
      )}

      {/* AVALIAÇÃO */}
      {diaInfo.tipo!=="descanso"&&(
        <div className="card">
          <div className="card-title">⭐ AVALIAR TREINO DE HOJE</div>
          <div className="form-group">
            <label className="form-label">Nota geral</label>
            <div className="stars">{[1,2,3,4,5].map(s=><div key={s} style={{fontSize:"2rem",cursor:"pointer",color:s<=rating?"var(--orange)":"var(--border)"}} onClick={()=>setRating(s)}>★</div>)}</div>
          </div>
          <div className="form-group"><label className="form-label">Feedback para o treinador</label><textarea className="form-textarea" placeholder="Como foi o treino? Dificuldades? Observações?" value={feedback} onChange={e=>setFeedback(e.target.value)}/></div>
          <button className="btn btn-primary btn-full" onClick={salvarAvaliacao}>✅ Registrar avaliação</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ALUNO — ALIMENTAÇÃO (checkbox)
// ============================================================
function AlunoAlimentacao({user,showToast}){
  const planoAlim=DB.getData("plano_alim_aluno",user.id);
  const [comido,setComido]=useState(()=>DB.getData("alim_check_hoje",user.id)||{});
  const [obs,setObs]=useState(()=>DB.getData("alim_obs_hoje",user.id)||"");

  function toggleRefeicao(i){
    const novo={...comido,[i]:!comido[i]};
    setComido(novo);
    DB.setData("alim_check_hoje",user.id,novo);
  }
  function salvarObs(){
    DB.setData("alim_obs_hoje",user.id,obs);
    showToast&&showToast("Observação salva! Sua nutricionista vai ver.");
  }

  const refeicoes=planoAlim?.refeicoes||[
    {h:"07:00",r:"Café da manhã",i:"3 ovos + pão integral + banana + café",k:480},
    {h:"10:00",r:"Lanche manhã",i:"Iogurte grego + castanhas",k:280},
    {h:"12:30",r:"Almoço",i:"Frango grelhado + arroz integral + salada",k:580},
    {h:"16:00",r:"Pré-treino",i:"Batata doce + whey",k:320},
    {h:"19:00",r:"Pós-treino",i:"Tilápia + arroz + brócolis",k:450},
    {h:"21:30",r:"Ceia",i:"Cottage + pasta de amendoim",k:220},
  ];

  const totalPrescrito=refeicoes.reduce((s,r)=>s+r.k,0);
  const totalComido=refeicoes.filter((_,i)=>comido[i]).reduce((s,r)=>s+r.k,0);
  const qtdComido=Object.values(comido).filter(Boolean).length;

  return(
    <div className="page">
      <div className="page-header">
        <div className="page-title green">ALIMENTAÇÃO</div>
        <div className="page-sub">Marque o que você já comeu hoje</div>
      </div>

      {planoAlim&&<PeriodoBadge plano={planoAlim}/>}

      <div className="grid-2" style={{marginBottom:"1.5rem"}}>
        <div className="stat-tile">
          <div className="stat-label">Refeições feitas</div>
          <div className="stat-value green">{qtdComido}<span className="stat-unit">/{refeicoes.length}</span></div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Kcal consumidas</div>
          <div className="stat-value orange">{totalComido}<span className="stat-unit">/{totalPrescrito}</span></div>
        </div>
      </div>

      <div className="prog-wrap" style={{marginBottom:"1.5rem"}}>
        <div className="prog-hdr"><span>Progresso do dia</span><span className="green">{Math.round((qtdComido/refeicoes.length)*100)}%</span></div>
        <div className="prog-track"><div className="prog-fill green" style={{width:`${(qtdComido/refeicoes.length)*100}%`}}/></div>
      </div>

      <div className="card">
        <div className="card-title">🥗 REFEIÇÕES DO DIA — marque o que comeu</div>
        {refeicoes.map((r,i)=>(
          <div key={i} className={`refeicao-item ${comido[i]?"comido":""}`} onClick={()=>toggleRefeicao(i)}>
            <div className={`check-box ${comido[i]?"checked":""}`} style={{width:"24px",height:"24px",borderRadius:"8px"}}>{comido[i]&&"✓"}</div>
            <div className="refeicao-hora">{r.h}</div>
            <div className="refeicao-info">
              <div className="refeicao-nome" style={{textDecoration:comido[i]?"line-through":"none"}}>{r.r}</div>
              <div className="refeicao-itens">{r.i}</div>
            </div>
            <div className="refeicao-kcal">{r.k}kcal</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">📝 OBSERVAÇÕES PARA A NUTRICIONISTA</div>
        <textarea className="form-textarea" placeholder="Substituições, dificuldades, como se sentiu..." value={obs} onChange={e=>setObs(e.target.value)}/>
        <button className="btn btn-primary" style={{marginTop:"0.75rem"}} onClick={salvarObs}>💾 Salvar observação</button>
      </div>
    </div>
  );
}

// ============================================================
// ALUNO — HIDRATAÇÃO
// ============================================================
function AlunoHidratacao({user,showToast}){
  const [ml,setMl]=useState(()=>DB.getData("agua_hoje",user.id)||0);
  const [meta,setMeta]=useState(()=>DB.getData("meta_agua",user.id)||3000);
  const [novaMeta,setNovaMeta]=useState(meta);
  const pct=Math.min((ml/meta)*100,100);
  function add(q){
    const n=Math.min(ml+q,9999);
    setMl(n);
    DB.setData("agua_hoje",user.id,n);
    if(n>=meta&&ml<meta)showToast&&showToast("🎉 Meta de hidratação atingida!");
  }
  function salvarMeta(){
    const n=Math.max(Number(novaMeta)||3000,500);
    setMeta(n);setNovaMeta(n);
    DB.setData("meta_agua",user.id,n);
    showToast&&showToast(`Meta atualizada: ${(n/1000).toFixed(1)}L por dia`);
  }
  const hist=DB.getData("agua_hist",user.id)||Array(7).fill(0);
  return(
    <div className="page">
      <div className="page-header">
        <div className="page-title green">HIDRATAÇÃO</div>
        <div className="page-sub">{getDateStr()}</div>
      </div>
      <div className="card" style={{textAlign:"center"}}>
        <div style={{fontSize:"5rem",fontFamily:"var(--font-display)",color:"var(--blue)",lineHeight:1}}>{(ml/1000).toFixed(1)}</div>
        <div style={{fontSize:"1.2rem",color:"var(--text2)",marginBottom:"1.5rem"}}>litros de {(meta/1000).toFixed(1)}L</div>
        <div className="prog-track" style={{height:"14px",marginBottom:"1.5rem"}}><div className="prog-fill blue" style={{width:`${pct}%`}}/></div>
        <div style={{color:pct>=100?"var(--green)":"var(--text2)",fontWeight:600,marginBottom:"1rem"}}>{pct>=100?"🎉 Meta atingida!":`Faltam ${((meta-ml)/1000).toFixed(1)}L`}</div>
        <div className="quick-btns" style={{justifyContent:"center"}}>
          {[150,200,300,500,750,1000].map(q=><div key={q} className="quick-btn" onClick={()=>add(q)}><div className="quick-btn-icon">💧</div>+{q>=1000?"1L":`${q}ml`}</div>)}
        </div>
        {ml>0&&<button className="btn btn-ghost" style={{marginTop:"1rem"}} onClick={()=>{setMl(0);DB.setData("agua_hoje",user.id,0);}}>Zerar</button>}
      </div>
      <div className="card">
        <div className="card-title">⚙️ META DIÁRIA</div>
        <div style={{display:"flex",gap:"0.75rem"}}>
          <input className="form-input" type="number" value={novaMeta} onChange={e=>setNovaMeta(e.target.value)}/>
          <button className="btn btn-blue" onClick={salvarMeta}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ALUNO — SAÚDE
// ============================================================
function AlunoSaude({user,showToast}){
  const s=DB.getData("saude",user.id)||{};
  const [doente,setDoente]=useState(s.doente||false);
  const [sintomas,setSintomas]=useState(s.sintomas||"");
  const [doenteDe,setDoenteDe]=useState(s.doente_desde||null);
  const [mens,setMens]=useState(s.mens||false);
  const [meds,setMeds]=useState(s.meds||"");
  const [obs,setObs]=useState(s.obs||"");
  const [dores,setDores]=useState(s.dores||[]);
  const [musculoSel,setMusculoSel]=useState([]);
  const [ok,setOk]=useState(false);
  function salvar(ov={}){DB.setData("saude",user.id,{doente,sintomas,doente_desde:doenteDe,mens,meds,obs,dores,...ov});showToast&&showToast("Saúde atualizada!");}
  function marcarDoente(){const agora=new Date().toISOString();setDoente(true);setDoenteDe(agora);salvar({doente:true,doente_desde:agora});}
  function marcarRecuperado(){setDoente(false);setDoenteDe(null);setSintomas("");salvar({doente:false,doente_desde:null,sintomas:""});showToast&&showToast("Ótimo! Recuperação registrada! 💪");}
  function adicionarDor(){if(!musculoSel.length)return;const agora=new Date().toISOString();const novas=[...dores,...musculoSel.filter(m=>!dores.find(d=>d.musculo===m)).map(m=>({musculo:m,desde:agora,intensidade:5}))];setDores(novas);setMusculoSel([]);salvar({dores:novas});}
  function removerDor(idx){const novas=dores.filter((_,i)=>i!==idx);setDores(novas);salvar({dores:novas});}
  return(
    <div className="page">
      <div className="page-title green">SAÚDE</div>
      <div className="page-sub">Treinador e nutricionista verão estas informações</div>
      {ok&&<div className="alert alert-success">✅ Salvo!</div>}
      <div className="card">
        <div className="card-title">📊 STATUS ATUAL</div>
        <SaudeStatusCard status={{doente,doente_desde:doenteDe,sintomas,dores}} onRecuperado={marcarRecuperado} onDorRecuperado={removerDor} soLeitura={false}/>
      </div>
      <div className="card">
        <div className="card-title">🤒 REGISTRAR DOENÇA</div>
        {!doente?(
          <><div className="form-group"><label className="form-label">Sintomas</label><input className="form-input" placeholder="Ex: Gripe, febre..." value={sintomas} onChange={e=>setSintomas(e.target.value)}/></div>
          <button className="btn btn-ghost" onClick={marcarDoente} style={{color:"var(--red)",borderColor:"rgba(231,76,60,0.4)"}}>🤒 Estou doente</button></>
        ):<div style={{color:"var(--text2)",fontSize:"0.85rem"}}>{diffDays(doenteDe)} {pluralDia(diffDays(doenteDe))} de doença. Clique "Estou recuperado!" no status acima.</div>}
      </div>
      <div className="card">
        <div className="card-title">🔴 REGISTRAR DOR MUSCULAR</div>
        {dores.length>0&&<div style={{marginBottom:"1rem"}}>{dores.map((d,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.65rem",background:"var(--red-dim)",borderRadius:"var(--radius)",marginBottom:"0.5rem",border:"1px solid rgba(231,76,60,0.3)"}}>
            <span style={{color:"var(--red)",fontWeight:600,fontSize:"0.9rem",flex:1}}>{d.musculo} — {diffDays(d.desde)} {pluralDia(diffDays(d.desde))}</span>
            <button className="btn btn-sm" style={{background:"var(--green)",color:"#0a0f0d",padding:"0.3rem 0.75rem",fontSize:"0.75rem"}} onClick={()=>removerDor(i)}>✅ Recuperado</button>
          </div>
        ))}</div>}
        <div style={{fontSize:"0.85rem",color:"var(--text2)",marginBottom:"0.75rem"}}>Selecione os músculos com dor:</div>
        <div className="pain-grid" style={{marginBottom:"1rem"}}>
          {MUSCLES.map(m=><div key={m} className={`muscle-btn ${musculoSel.includes(m)?"selected":""}`} onClick={()=>setMusculoSel(p=>p.includes(m)?p.filter(x=>x!==m):[...p,m])}>{m}</div>)}
        </div>
        {musculoSel.length>0&&<button className="btn btn-ghost" style={{color:"var(--red)",borderColor:"rgba(231,76,60,0.4)"}} onClick={adicionarDor}>🔴 Registrar dor em: {musculoSel.join(", ")}</button>}
      </div>
      <div className="card">
        <div className="card-title">🔢 OUTRAS INFORMAÇÕES</div>
        <div className="check-item" onClick={()=>{setMens(!mens);salvar({mens:!mens});}}><div className={`check-box ${mens?"checked":""}`}>{mens&&"✓"}</div><span>Semana menstrual</span></div>
        <div className="form-group" style={{marginTop:"0.75rem"}}><label className="form-label">💊 Medicamentos</label><textarea className="form-textarea" placeholder="Ex: Vitamina D 2000UI, Creatina 5g..." value={meds} onChange={e=>setMeds(e.target.value)}/></div>
        <div className="form-group"><label className="form-label">📝 Observações</label><textarea className="form-textarea" placeholder="Qualquer informação para sua equipe..." value={obs} onChange={e=>setObs(e.target.value)}/></div>
        <button className="btn btn-primary" onClick={()=>salvar()}>💾 Salvar</button>
      </div>
    </div>
  );
}

// ============================================================
// ALUNO — AVALIAÇÃO E COMPETIÇÕES
// ============================================================
function AlunoAvaliacao({user,showToast}){
  const saved=DB.getData("avaliacao",user.id)||{};
  const [f,setF]=useState(saved);
  function set(k,v){setF(p=>({...p,[k]:v}));}
  function salvar(){
    DB.setData("avaliacao",user.id,f);
    const hist=DB.getData("avaliacao_hist",user.id)||[];
    if(f.peso){
      const entry={peso:f.peso,gordura:f.gordura,data:new Date().toISOString()};
      DB.setData("avaliacao_hist",user.id,[...hist.slice(-11),entry]);
    }
    showToast&&showToast("Avaliação física salva! ✅");
  }
  return(
    <div className="page">
      <div className="page-header">
        <div className="page-title green">AVALIAÇÃO FÍSICA</div>
        <div className="page-sub">Visível para treinador e nutricionista</div>
      </div>
      {ok&&<div className="alert alert-success">✅ Avaliação salva!</div>}
      <div className="card">
        <div className="card-title">📏 MEDIDAS CORPORAIS</div>
        <div className="grid-2">
          {[["peso","Peso","kg"],["altura","Altura","cm"],["gordura","% Gordura","%"],["massa","Massa Magra","kg"],["cintura","Cintura","cm"],["quadril","Quadril","cm"],["braco_d","Braço D","cm"],["braco_e","Braço E","cm"],["perna_d","Perna D","cm"],["perna_e","Perna E","cm"]].map(([k,l,u])=>(
            <div key={k} className="form-group"><label className="form-label">{l}</label>
              <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
                <input className="form-input" type="number" placeholder="0" value={f[k]||""} onChange={e=>set(k,e.target.value)}/>
                <span style={{color:"var(--text2)",flexShrink:0}}>{u}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="form-group"><label className="form-label">Observações</label><textarea className="form-textarea" value={f.obs||""} onChange={e=>set("obs",e.target.value)} placeholder="Notas gerais..."/></div>
        <button className="btn btn-primary" onClick={salvar}>💾 Salvar avaliação</button>
      </div>
    </div>
  );
}

function AlunoCompeticoes({user,showToast}){
  const [comps,setComps]=useState(()=>DB.getData("competicoes",user.id)||[]);
  const [f,setF]=useState({nome:"",modalidade:"Corrida",data:"",local:"",objetivo:"Completar"});
  const [ok,setOk]=useState(false);
  function set(k,v){setF(p=>({...p,[k]:v}));}
  function add(){
    if(!f.nome||!f.data){return;}
    const novo=[...comps,{...f,id:Date.now()}];
    setComps(novo);DB.setData("competicoes",user.id,novo);
    setF({nome:"",modalidade:"Corrida",data:"",local:"",objetivo:"Completar"});
    showToast&&showToast("Competição cadastrada! 🏆");
  }
  function remover(id){const n=comps.filter(c=>c.id!==id);setComps(n);DB.setData("competicoes",user.id,n);}
  return(
    <div className="page">
      <div className="page-header">
        <div className="page-title green">COMPETIÇÕES</div>
        <div className="page-sub">Visível para treinador e nutricionista</div>
      </div>
      {comps.length>0&&<div className="card"><div className="card-title">📅 MEUS EVENTOS</div>{comps.map((c,i)=>{const d=new Date(c.data);return(<div key={i} className="comp-card" style={{background:"var(--bg2)"}}><div className="comp-date"><div className="comp-date-day">{d.getDate()}</div><div className="comp-date-month">{d.toLocaleDateString("pt-BR",{month:"short"})}</div></div><div style={{flex:1}}><div style={{fontWeight:600}}>{c.nome}</div><div style={{fontSize:"0.8rem",color:"var(--text2)"}}>{c.modalidade} • {c.local}</div></div><span className="tag tag-orange">{c.objetivo.toUpperCase()}</span></div>);})}</div>}
      <div className="card">
        <div className="card-title">➕ CADASTRAR COMPETIÇÃO</div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Nome do evento</label><input className="form-input" placeholder="Ex: Ironman Florianópolis" value={f.nome} onChange={e=>set("nome",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Modalidade</label><select className="form-select" value={f.modalidade} onChange={e=>set("modalidade",e.target.value)}>{["Corrida","Natação","Triathlon / Ironman","Luta","Fisiculturismo","Ciclismo","Caminhada"].map(m=><option key={m}>{m}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Data</label><input className="form-input" type="date" value={f.data} onChange={e=>set("data",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Local</label><input className="form-input" placeholder="Cidade / Local" value={f.local} onChange={e=>set("local",e.target.value)}/></div>
        </div>
        <div className="form-group"><label className="form-label">Objetivo</label><select className="form-select" value={f.objetivo} onChange={e=>set("objetivo",e.target.value)}>{["Completar","Bater meu recorde","Subir no pódio","Subir no palco","Definição de peso"].map(o=><option key={o}>{o}</option>)}</select></div>
        <button className="btn btn-primary" onClick={add}>+ Cadastrar evento</button>
      </div>
    </div>
  );
}

// ============================================================
// ALUNO — DASHBOARD
// ============================================================
function AlunoDash({user,setPage}){
  const vinculo=DB.getVinculoAluno(user.id)||{};
  const treinador=vinculo.treinadorId?DB.getUserById(vinculo.treinadorId):null;
  const nutri=vinculo.nutriId?DB.getUserById(vinculo.nutriId):null;
  const agua=DB.getData("agua_hoje",user.id)||0;
  const meta=DB.getData("meta_agua",user.id)||3000;
  const saude=DB.getData("saude",user.id)||{};
  const pct=Math.min(Math.round((agua/meta)*100),100);
  const planoTreino=DB.getData("plano_treino_aluno",user.id);
  const hoje=new Date().getDay();const diaHoje=hoje===0?6:hoje-1;
  const treinoHoje=planoTreino?.dias?.[diaHoje];
  return(
    <div className="page">
      <div className="page-title green">{getGreeting()}, {firstName(user.nome)} 👋</div>
      <div className="page-sub">{getDateStr()}</div>
      {!treinador&&!nutri&&<div className="alert alert-warn">⚠️ Sem equipe vinculada. Vá em <b>Minha Equipe</b> e insira o código do seu treinador e nutricionista!</div>}
      <div className="grid-4">
        <div className="stat-tile" style={{cursor:"pointer"}} onClick={()=>setPage&&setPage("vinculo")}>
          <div className="stat-label">Treinador</div>
          <div style={{marginTop:"0.4rem",fontWeight:700,fontSize:"0.92rem",color:"var(--orange)"}}>{treinador?treinador.nome.split(" ")[0]:"Vincular →"}</div>
        </div>
        <div className="stat-tile" style={{cursor:"pointer"}} onClick={()=>setPage&&setPage("vinculo")}>
          <div className="stat-label">Nutricionista</div>
          <div style={{marginTop:"0.4rem",fontWeight:700,fontSize:"0.92rem",color:"var(--blue)"}}>{nutri?nutri.nome.split(" ")[0]:"Vincular →"}</div>
        </div>
        <div className="stat-tile" style={{cursor:"pointer"}} onClick={()=>setPage&&setPage("hidratacao")}>
          <div className="stat-label">Água hoje</div>
          <div className="stat-value blue">{(agua/1000).toFixed(1)}<span className="stat-unit">L</span></div>
          <div className="stat-sub">{Math.min(Math.round((agua/meta)*100),100)}% da meta</div>
        </div>
        <div className="stat-tile" style={{cursor:"pointer"}} onClick={()=>setPage&&setPage("avaliacao")}>
          <div className="stat-label">Peso / IMC</div>
          {(()=>{const aval=DB.getData("avaliacao",user.id)||{};const imc=calcIMC(aval.peso,aval.altura);return(<><div className="stat-value green">{aval.peso||"—"}<span className="stat-unit">{aval.peso?" kg":""}</span></div>{imc&&<div className="stat-sub">IMC {imc.val} — {imc.cat}</div>}</>);})()}
        </div>
      </div>
      <div className="card">
        <div className="card-title">❤️ STATUS DE SAÚDE</div>
        <SaudeStatusCard status={saude} soLeitura={true}/>
      </div>
      {treinoHoje&&(
        <div className="card card-clickable" onClick={()=>setPage&&setPage("treinos")}>
          <div className="card-title">🏋️ Treino de hoje — {DIAS_SEMANA[diaHoje]}</div>
          {treinoHoje.tipo==="descanso"?(
            <div style={{textAlign:"center",padding:"1rem 0"}}>
              <div style={{fontSize:"2.5rem",marginBottom:"0.35rem"}}>😴</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",color:"var(--orange)"}}>DIA DE DESCANSO</div>
              <div style={{fontSize:"0.8rem",color:"var(--text2)",marginTop:"0.25rem"}}>Recuperação é parte do treino!</div>
            </div>
          ):(
            <>
              <div style={{fontWeight:700,fontSize:"0.95rem",marginBottom:"0.65rem"}}>{treinoHoje.nome}</div>
              {treinoHoje.distancia&&<div style={{fontSize:"0.82rem",color:"var(--blue)",marginBottom:"0.5rem",background:"var(--blue-dim)",padding:"0.45rem 0.75rem",borderRadius:"var(--radius)",display:"inline-block"}}>📏 {treinoHoje.distancia}{treinoHoje.ritmo&&` • ${treinoHoje.ritmo}`}{treinoHoje.zona&&` • ${treinoHoje.zona}`}</div>}
              {treinoHoje.rounds&&<div style={{fontSize:"0.82rem",color:"var(--red)",marginBottom:"0.5rem",background:"var(--red-dim)",padding:"0.45rem 0.75rem",borderRadius:"var(--radius)",display:"inline-block"}}>🥊 {treinoHoje.rounds}{treinoHoje.tempoRound&&` • ${treinoHoje.tempoRound}`}</div>}
              {treinoHoje.exercicios?.slice(0,4).map((ex,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"0.45rem 0",borderBottom:"1px solid var(--border)",fontSize:"0.85rem"}}>
                  <span style={{fontWeight:600}}>{ex.nome}</span>
                  <span style={{color:"var(--text2)"}}>{ex.series&&`${ex.series}x`} {ex.reps} {ex.carga&&`• ${ex.carga}`}</span>
                </div>
              ))}
              {treinoHoje.exercicios?.length>4&&<div style={{fontSize:"0.75rem",color:"var(--text3)",marginTop:"0.5rem",textAlign:"center"}}>+{treinoHoje.exercicios.length-4} exercícios — toque para ver →</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TREINADOR — PRESCREVER TREINO
// ============================================================
function TreinadorPrescrever({user,showToast}){
  const alunos=DB.getAlunosDe(user.id);
  const [alunoSel,setAlunoSel]=useState(null);
  const [nomePlano,setNomePlano]=useState("Treino A/B/C");
  const [modalidade,setModalidade]=useState("musculacao");
  const [duracao,setDuracao]=useState(1);
  const [inicio,setInicio]=useState(()=>new Date().toISOString().split("T")[0]);
  const [dias,setDias]=useState(()=>DIAS_SEMANA.map((d,i)=>({nome:`Treino ${String.fromCharCode(65+i)}`,tipo:"treino",obs:"",exercicios:[]})));
  const [diaEdit,setDiaEdit]=useState(0);
  const [novoEx,setNovoEx]=useState({nome:"",series:"",reps:"",carga:"",duracao:""});
  function setDiaTipo(i,tipo){setDias(p=>{const n=[...p];n[i]={...n[i],tipo};return n;});}
  function setDiaNome(i,nome){setDias(p=>{const n=[...p];n[i]={...n[i],nome};return n;});}
  function setDiaObs(i,obs){setDias(p=>{const n=[...p];n[i]={...n[i],obs};return n;});}
  function addEx(diaIdx){
    if(!novoEx.nome.trim())return;
    setDias(p=>{const n=[...p];n[diaIdx]={...n[diaIdx],exercicios:[...(n[diaIdx].exercicios||[]),{...novoEx}]};return n;});
    setNovoEx({nome:"",series:"",reps:"",carga:"",duracao:""});
  }
  function removeEx(diaIdx,exIdx){setDias(p=>{const n=[...p];n[diaIdx]={...n[diaIdx],exercicios:n[diaIdx].exercicios.filter((_,i)=>i!==exIdx)};return n;});}

  function salvar(){
    if(!alunoSel){showToast&&showToast("Selecione um aluno primeiro","warn");return;}
    const fimDate=addMonths(new Date(inicio),duracao);
    const plano={nome:nomePlano,modalidade,duracao,inicio,fim:fimDate.toISOString(),dias,criadoEm:new Date().toISOString()};
    DB.setData("plano_treino_aluno",alunoSel.id,plano);
    showToast&&showToast(`✅ Plano enviado para ${alunoSel.nome.split(" ")[0]}!`);
    
  }

  const diaAtual=dias[diaEdit];

  return(
    <div className="page">
      <div className="page-title orange">PRESCREVER TREINO</div>
      <div className="page-sub">Monte a semana completa de treinos para um aluno</div>
      {ok&&<div className="alert alert-success">✅ Plano enviado para {alunoSel?.nome}!</div>}
      {alunos.length===0&&<div className="alert alert-warn">⚠️ Nenhum aluno vinculado. Código: <b style={{fontFamily:"var(--font-mono)"}}>{gerarCodigo(user.id)}</b></div>}

      {/* SELECIONAR ALUNO */}
      <div className="card">
        <div className="card-title">👤 SELECIONAR ALUNO</div>
        <AlunoSelector alunos={alunos} selecionado={alunoSel} onSelect={setAlunoSel} accentClass="sel-orange"/>
        {!alunoSel&&alunos.length>0&&<div style={{color:"var(--text3)",fontSize:"0.85rem"}}>Selecione um aluno acima para montar o plano.</div>}
      </div>

      {alunoSel&&(
        <>
          {/* CONFIGURAÇÕES DO PLANO */}
          <div className="card">
            <div className="card-title">⚙️ CONFIGURAÇÕES DO PLANO</div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Nome do plano</label><input className="form-input" value={nomePlano} onChange={e=>setNomePlano(e.target.value)} placeholder="Ex: Treino A/B/C, Hipertrofia..."/></div>
              <div className="form-group"><label className="form-label">Modalidade principal</label>
                <select className="form-select" value={modalidade} onChange={e=>setModalidade(e.target.value)}>
                  {MODALIDADES.map(m=><option key={m.v} value={m.v}>{m.l}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Data de início</label><input className="form-input" type="date" value={inicio} onChange={e=>setInicio(e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Duração do plano</label>
                <select className="form-select" value={duracao} onChange={e=>setDuracao(Number(e.target.value))}>
                  <option value={1}>1 mês</option><option value={2}>2 meses</option><option value={3}>3 meses</option>
                </select>
              </div>
            </div>
            <div className="periodo-card">
              <div style={{fontSize:"0.8rem",color:"var(--text3)",marginBottom:"0.25rem"}}>Vigência do plano</div>
              <div style={{fontWeight:600}}>{fmtDate(inicio)} → {fmtDate(addMonths(new Date(inicio),duracao))}</div>
              <div style={{fontSize:"0.8rem",color:"var(--text2)",marginTop:"0.15rem"}}>{duracao} {duracao===1?"mês":"meses"} para {alunoSel.nome.split(" ")[0]}</div>
            </div>
          </div>

          {/* DIAS DA SEMANA */}
          <div className="card">
            <div className="card-title">📅 MONTAR OS DIAS DA SEMANA</div>
            <div className="week-tabs">
              {DIAS_SEMANA.map((d,i)=>(
                <button key={i} className={`week-tab ${diaEdit===i?"active orange":""}`} onClick={()=>setDiaEdit(i)}>
                  {d.slice(0,3)}{dias[i].tipo==="descanso"?" 💤":""}
                </button>
              ))}
            </div>

            {/* EDIT DIA */}
            <div style={{background:"var(--bg2)",borderRadius:"var(--radius-lg)",padding:"1.25rem"}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:"1.3rem",color:"var(--orange)",marginBottom:"1rem"}}>{DIAS_SEMANA[diaEdit]}</div>
              <div className="form-group">
                <label className="form-label">Tipo do dia</label>
                <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                  {[["descanso","😴 Descanso"],["academia","🏋️ Academia"],["corrida","🏃 Corrida"],["natacao","🏊 Natação"],["luta","🥊 Luta"],["ciclismo","🚴 Ciclismo"],["funcional","⚡ Funcional"],["caminhada","🚶 Caminhada"]].map(([v,l])=>(
                    <button key={v} className={`toggle-btn ${diaAtual.tipo===v?"active-orange":""}`} onClick={()=>setDiaTipo(diaEdit,v)}>{l}</button>
                  ))}
                </div>
              </div>
              {diaAtual.tipo!=="descanso"&&(
                <>
                  <div className="form-group"><label className="form-label">Nome do treino</label><input className="form-input" value={diaAtual.nome} onChange={e=>setDiaNome(diaEdit,e.target.value)} placeholder={
                    diaAtual.tipo==="corrida"?"Ex: Corrida leve 5km Z2":
                    diaAtual.tipo==="natacao"?"Ex: Natação técnica 2000m":
                    diaAtual.tipo==="luta"?"Ex: Treino de Jiu-Jitsu":
                    diaAtual.tipo==="ciclismo"?"Ex: Ciclismo Z2 40km":
                    "Ex: Treino A — Peito + Tríceps"
                  }/></div>
                  <div className="form-group"><label className="form-label">Observações do dia</label><input className="form-input" value={diaAtual.obs} onChange={e=>setDiaObs(diaEdit,e.target.value)} placeholder="Instruções específicas..."/></div>

                  {/* CAMPOS ESPECÍFICOS POR MODALIDADE */}
                  {(diaAtual.tipo==="corrida"||diaAtual.tipo==="natacao"||diaAtual.tipo==="ciclismo"||diaAtual.tipo==="caminhada")&&(
                    <div style={{background:"rgba(52,152,219,0.08)",border:"1px solid rgba(52,152,219,0.2)",borderRadius:"var(--radius)",padding:"1rem",marginBottom:"1rem"}}>
                      <div style={{fontSize:"0.8rem",color:"var(--blue)",marginBottom:"0.75rem",textTransform:"uppercase",letterSpacing:"0.1em"}}>
                        {diaAtual.tipo==="corrida"?"🏃 Prescrição de corrida":diaAtual.tipo==="natacao"?"🏊 Prescrição de natação":diaAtual.tipo==="ciclismo"?"🚴 Prescrição de ciclismo":"🚶 Prescrição de caminhada"}
                      </div>
                      <div className="grid-2">
                        <div className="form-group"><label className="form-label">Distância</label><input className="form-input" placeholder={diaAtual.tipo==="natacao"?"Ex: 2000m":"Ex: 5km ou 10km"} value={diaAtual.distancia||""} onChange={e=>setDias(p=>{const n=[...p];n[diaEdit]={...n[diaEdit],distancia:e.target.value};return n;})}/></div>
                        <div className="form-group"><label className="form-label">Tempo / Ritmo</label><input className="form-input" placeholder={diaAtual.tipo==="natacao"?"Ex: 2min/100m":"Ex: 6min/km ou 30min"} value={diaAtual.ritmo||""} onChange={e=>setDias(p=>{const n=[...p];n[diaEdit]={...n[diaEdit],ritmo:e.target.value};return n;})}/></div>
                        <div className="form-group"><label className="form-label">Zona / Intensidade</label><input className="form-input" placeholder="Ex: Z2, leve, moderado..." value={diaAtual.zona||""} onChange={e=>setDias(p=>{const n=[...p];n[diaEdit]={...n[diaEdit],zona:e.target.value};return n;})}/></div>
                        <div className="form-group"><label className="form-label">Duração total</label><input className="form-input" placeholder="Ex: 45min" value={diaAtual.duracaoTotal||""} onChange={e=>setDias(p=>{const n=[...p];n[diaEdit]={...n[diaEdit],duracaoTotal:e.target.value};return n;})}/></div>
                      </div>
                    </div>
                  )}
                  {diaAtual.tipo==="luta"&&(
                    <div style={{background:"rgba(231,76,60,0.08)",border:"1px solid rgba(231,76,60,0.2)",borderRadius:"var(--radius)",padding:"1rem",marginBottom:"1rem"}}>
                      <div style={{fontSize:"0.8rem",color:"var(--red)",marginBottom:"0.75rem",textTransform:"uppercase",letterSpacing:"0.1em"}}>🥊 Prescrição de luta</div>
                      <div className="grid-2">
                        <div className="form-group"><label className="form-label">Rounds</label><input className="form-input" placeholder="Ex: 5 rounds" value={diaAtual.rounds||""} onChange={e=>setDias(p=>{const n=[...p];n[diaEdit]={...n[diaEdit],rounds:e.target.value};return n;})}/></div>
                        <div className="form-group"><label className="form-label">Tempo por round</label><input className="form-input" placeholder="Ex: 5min / 1min descanso" value={diaAtual.tempoRound||""} onChange={e=>setDias(p=>{const n=[...p];n[diaEdit]={...n[diaEdit],tempoRound:e.target.value};return n;})}/></div>
                        <div className="form-group"><label className="form-label">Foco do treino</label><input className="form-input" placeholder="Ex: Sparring, técnica, condicionamento" value={diaAtual.foco||""} onChange={e=>setDias(p=>{const n=[...p];n[diaEdit]={...n[diaEdit],foco:e.target.value};return n;})}/></div>
                        <div className="form-group"><label className="form-label">Modalidade</label><input className="form-input" placeholder="Ex: BJJ, Muay Thai, MMA" value={diaAtual.modalidadeLuta||""} onChange={e=>setDias(p=>{const n=[...p];n[diaEdit]={...n[diaEdit],modalidadeLuta:e.target.value};return n;})}/></div>
                      </div>
                    </div>
                  )}

                  {/* EXERCÍCIOS (academia/funcional) */}
                  {(diaAtual.tipo==="academia"||diaAtual.tipo==="funcional")&&(
                    <>
                  {diaAtual.exercicios&&diaAtual.exercicios.length>0&&(
                    <div style={{marginBottom:"1rem"}}>
                      {diaAtual.exercicios.map((ex,j)=>(
                        <div key={j} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.65rem",background:"var(--card)",borderRadius:"var(--radius)",marginBottom:"0.4rem",fontSize:"0.85rem"}}>
                          <span style={{fontWeight:600,flex:1}}>{ex.nome}</span>
                          <span style={{color:"var(--text2)"}}>{ex.series&&`${ex.series}x`} {ex.reps} {ex.carga&&`• ${ex.carga}`}</span>
                          <button className="btn btn-sm btn-ghost" onClick={()=>removeEx(diaEdit,j)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{background:"var(--card)",borderRadius:"var(--radius)",padding:"1rem"}}>
                    <div style={{fontSize:"0.8rem",color:"var(--text3)",marginBottom:"0.75rem",textTransform:"uppercase",letterSpacing:"0.1em"}}>+ Adicionar exercício</div>
                    <div className="grid-2">
                      <div className="form-group"><label className="form-label">Nome</label><input className="form-input" placeholder="Ex: Supino Reto" value={novoEx.nome} onChange={e=>setNovoEx(p=>({...p,nome:e.target.value}))}/></div>
                      <div className="form-group"><label className="form-label">Séries</label><input className="form-input" placeholder="Ex: 4" value={novoEx.series} onChange={e=>setNovoEx(p=>({...p,series:e.target.value}))}/></div>
                      <div className="form-group"><label className="form-label">Reps / Tempo</label><input className="form-input" placeholder="Ex: 8-10 ou 30s" value={novoEx.reps} onChange={e=>setNovoEx(p=>({...p,reps:e.target.value}))}/></div>
                      <div className="form-group"><label className="form-label">Carga</label><input className="form-input" placeholder="Ex: 80kg ou Corporal" value={novoEx.carga} onChange={e=>setNovoEx(p=>({...p,carga:e.target.value}))}/></div>
                    </div>
                    <button className="btn btn-orange btn-sm" onClick={()=>addEx(diaEdit)}>+ Adicionar</button>
                  </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <button className="btn btn-orange btn-full" onClick={salvar}>📤 Enviar plano para {alunoSel.nome.split(" ")[0]}</button>
        </>
      )}
    </div>
  );
}

// ============================================================
// TREINADOR — DASHBOARD + ACOMPANHAMENTO
// ============================================================

// Resumo semanal (visão de acompanhamento)
function ResumoSemanalAluno({aluno,onVerCompleto}){
  const saude=DB.getData("saude",aluno.id)||{};
  const agua=DB.getData("agua_hoje",aluno.id)||0;
  const meta=DB.getData("meta_agua",aluno.id)||3000;
  const planoTreino=DB.getData("plano_treino_aluno",aluno.id);
  const av=DB.getData("treino_avaliacao",aluno.id)||{};
  const diasDoente=saude.doente_desde?diffDays(saude.doente_desde):0;

  // Contar dias de treino feitos (baseado no check)
  const check=DB.getData("treino_check_hoje",aluno.id)||{};
  // Simular quais dias têm exercícios marcados essa semana
  const diasTreino=planoTreino?.dias||[];
  const diasComTreino=diasTreino.filter(d=>d.tipo!=="descanso").length;

  // Média de água (só temos hoje, mostrar o de hoje)
  const pctAgua=Math.round((agua/meta)*100);

  // Ícone da modalidade principal
  const modIcons={musculacao:"🏋️",corrida:"🏃",natacao:"🏊",luta:"🥊",ciclismo:"🚴",funcional:"⚡",caminhada:"🚶"};
  const modIcon=modIcons[planoTreino?.modalidade]||"🏋️";

  return(
    <div className="card" style={{cursor:"pointer"}} onClick={onVerCompleto}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem"}}>
        <div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"1.3rem",letterSpacing:"0.05em"}}>{aluno.nome}</div>
          {planoTreino&&<div style={{fontSize:"0.78rem",color:"var(--text2)",marginTop:"0.15rem"}}>{modIcon} {planoTreino.nome} • até {fmtDate(planoTreino.fim)}</div>}
        </div>
        <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap",alignItems:"center"}}>
          {saude.doente&&<span className="tag tag-red">🤒 {diasDoente}d</span>}
          {saude.dores&&saude.dores.length>0&&<span className="tag tag-orange">🔴 {saude.dores.length} dor{saude.dores.length>1?"es":""}</span>}
          {saude.mens&&<span className="tag tag-orange">🔴 Ciclo</span>}
        </div>
      </div>

      {/* LINHA DE RESUMO */}
      <div className="grid-3" style={{marginBottom:"1rem"}}>
        <div style={{background:"var(--bg2)",borderRadius:"var(--radius)",padding:"0.85rem",textAlign:"center"}}>
          <div style={{fontSize:"0.65rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.25rem"}}>Água hoje</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",color:"var(--blue)"}}>{pctAgua}%</div>
          <div style={{fontSize:"0.7rem",color:"var(--text3)"}}>{(agua/1000).toFixed(1)}L / {(meta/1000).toFixed(1)}L</div>
        </div>
        <div style={{background:"var(--bg2)",borderRadius:"var(--radius)",padding:"0.85rem",textAlign:"center"}}>
          <div style={{fontSize:"0.65rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.25rem"}}>Dias treino/sem</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",color:"var(--green)"}}>{diasComTreino}</div>
          <div style={{fontSize:"0.7rem",color:"var(--text3)"}}>dias com treino</div>
        </div>
        <div style={{background:"var(--bg2)",borderRadius:"var(--radius)",padding:"0.85rem",textAlign:"center"}}>
          <div style={{fontSize:"0.65rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.25rem"}}>Último treino</div>
          <div style={{fontSize:"1.2rem"}}>{av.rating>0?"★".repeat(av.rating):"—"}</div>
          <div style={{fontSize:"0.7rem",color:"var(--text3)"}}>{av.rating>0?`nota ${av.rating}/5`:"Sem avaliação"}</div>
        </div>
      </div>

      {/* DIAS DA SEMANA RESUMO */}
      {planoTreino?.dias&&(
        <div>
          <div style={{fontSize:"0.7rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.5rem"}}>Semana de treinos</div>
          <div style={{display:"flex",gap:"0.3rem"}}>
            {planoTreino.dias.map((d,i)=>{
              const tipoIcons={descanso:"😴",academia:"🏋️",corrida:"🏃",natacao:"🏊",luta:"🥊",ciclismo:"🚴",funcional:"⚡",caminhada:"🚶",treino:"🏋️"};
              return(
                <div key={i} style={{flex:1,textAlign:"center",padding:"0.4rem 0.2rem",background:"var(--bg2)",borderRadius:"8px",fontSize:"0.65rem"}}>
                  <div style={{fontSize:"1rem",marginBottom:"0.15rem"}}>{tipoIcons[d.tipo]||"🏋️"}</div>
                  <div style={{color:"var(--text3)"}}>{DIAS_SEMANA[i].slice(0,3)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{fontSize:"0.8rem",color:"var(--orange)",marginTop:"1rem"}}>Ver relatório completo do mês →</div>
    </div>
  );
}

// Diário completo — visão mensal
function DiarioAluno({aluno,onBack}){
  const saude=DB.getData("saude",aluno.id)||{};
  const treino=DB.getData("treino_avaliacao",aluno.id)||{};
  const alimCheck=DB.getData("alim_check_hoje",aluno.id)||{};
  const planoAlim=DB.getData("plano_alim_aluno",aluno.id);
  const agua=DB.getData("agua_hoje",aluno.id)||0;
  const metaAgua=DB.getData("meta_agua",aluno.id)||3000;
  const aval=DB.getData("avaliacao",aluno.id)||{};
  const comps=DB.getData("competicoes",aluno.id)||[];
  const planoTreino=DB.getData("plano_treino_aluno",aluno.id);
  const refeicoes=planoAlim?.refeicoes||[];
  const qtdComido=Object.values(alimCheck).filter(Boolean).length;
  const diasDoente=saude.doente_desde?diffDays(saude.doente_desde):0;

  const tipoIcons={descanso:"😴",academia:"🏋️",corrida:"🏃",natacao:"🏊",luta:"🥊",ciclismo:"🚴",funcional:"⚡",caminhada:"🚶",treino:"🏋️"};
  const modIcons={musculacao:"🏋️",corrida:"🏃",natacao:"🏊",luta:"🥊",ciclismo:"🚴",funcional:"⚡",caminhada:"🚶"};

  return(
    <div className="page">
      <div style={{marginBottom:"1rem"}}><button className="btn btn-ghost btn-sm" onClick={onBack}>← Voltar</button></div>
      <div className="page-title" style={{color:"var(--text)"}}>{aluno.nome}</div>
      <div className="page-sub">Relatório completo do mês</div>

      {/* DADOS PESSOAIS */}
      <div className="card">
        <div className="card-title">👤 PERFIL DO ALUNO</div>
        <div className="grid-3">
          <div className="diario-section"><div className="diario-label">Peso</div><div className="diario-val" style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",color:"var(--green)"}}>{aval.peso||"—"}<span style={{fontSize:"0.8rem",color:"var(--text2)"}}>{aval.peso?" kg":""}</span></div></div>
          <div className="diario-section"><div className="diario-label">% Gordura</div><div className="diario-val" style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",color:"var(--orange)"}}>{aval.gordura||"—"}<span style={{fontSize:"0.8rem",color:"var(--text2)"}}>{aval.gordura?"%":""}</span></div></div>
          <div className="diario-section"><div className="diario-label">Email</div><div className="diario-val" style={{fontSize:"0.85rem"}}>{aluno.email}</div></div>
        </div>
        {aval.cintura&&(
          <div className="grid-4" style={{marginTop:"0.75rem",marginBottom:0}}>
            {[["cintura","Cintura","cm"],["quadril","Quadril","cm"],["braco_d","Braço D","cm"],["perna_d","Perna D","cm"]].map(([k,l,u])=>
              aval[k]?<div key={k} className="diario-section"><div className="diario-label">{l}</div><div className="diario-val">{aval[k]}{u}</div></div>:null
            )}
          </div>
        )}
      </div>

      {/* MODALIDADES QUE PRATICA */}
      {planoTreino&&(
        <div className="card">
          <div className="card-title">🏅 MODALIDADES / PLANO ATIVO</div>
          <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1rem",flexWrap:"wrap"}}>
            <div style={{fontSize:"2.5rem"}}>{modIcons[planoTreino.modalidade]||"🏋️"}</div>
            <div>
              <div style={{fontWeight:600,fontSize:"1rem"}}>{planoTreino.nome}</div>
              <div style={{fontSize:"0.8rem",color:"var(--text2)"}}>Modalidade: {MODALIDADES.find(m=>m.v===planoTreino.modalidade)?.l||planoTreino.modalidade}</div>
              <div style={{fontSize:"0.8rem",color:"var(--text2)"}}>{fmtDate(planoTreino.inicio)} → {fmtDate(planoTreino.fim)} • {planoTreino.duracao} {planoTreino.duracao===1?"mês":"meses"}</div>
            </div>
          </div>

          {/* SEMANA DETALHADA */}
          <div style={{fontSize:"0.75rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.75rem"}}>Distribuição semanal</div>
          <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
            {planoTreino.dias.map((d,i)=>(
              <div key={i} style={{flex:"1",minWidth:"80px",background:d.tipo==="descanso"?"var(--bg2)":"var(--card2)",border:d.tipo==="descanso"?"1px solid var(--border)":"1px solid var(--green-dim)",borderRadius:"var(--radius)",padding:"0.65rem",textAlign:"center"}}>
                <div style={{fontSize:"1.2rem",marginBottom:"0.2rem"}}>{tipoIcons[d.tipo]||"🏋️"}</div>
                <div style={{fontSize:"0.7rem",fontWeight:600,color:d.tipo==="descanso"?"var(--text3)":"var(--text)"}}>{DIAS_SEMANA[i].slice(0,3)}</div>
                <div style={{fontSize:"0.65rem",color:"var(--text3)",marginTop:"0.1rem"}}>{d.tipo==="descanso"?"Descanso":d.nome?.split("—")[0]?.trim()||d.tipo}</div>
                {/* Campos específicos */}
                {d.distancia&&<div style={{fontSize:"0.65rem",color:"var(--blue)",marginTop:"0.15rem"}}>{d.distancia}</div>}
                {d.rounds&&<div style={{fontSize:"0.65rem",color:"var(--red)",marginTop:"0.15rem"}}>{d.rounds}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SAÚDE DO MÊS */}
      <div className="card">
        <div className="card-title">❤️ SAÚDE DO MÊS</div>
        <SaudeStatusCard status={saude} soLeitura={true}/>

        {/* HISTÓRICO DE DOENÇAS/DORES */}
        <div style={{marginTop:"1rem",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
          <div className="diario-section">
            <div className="diario-label">🤒 Dias doente no mês</div>
            <div className="diario-val" style={{fontFamily:"var(--font-display)",fontSize:"1.8rem",color:saude.doente?"var(--red)":"var(--green)"}}>{saude.doente?diasDoente:0}<span style={{fontSize:"0.8rem",color:"var(--text2)"}}> dias</span></div>
            {saude.sintomas&&<div style={{fontSize:"0.8rem",color:"var(--text2)",marginTop:"0.25rem"}}>{saude.sintomas}</div>}
          </div>
          <div className="diario-section">
            <div className="diario-label">🔴 Dores musculares ativas</div>
            <div className="diario-val" style={{fontFamily:"var(--font-display)",fontSize:"1.8rem",color:saude.dores?.length?"var(--orange)":"var(--green)"}}>{saude.dores?.length||0}<span style={{fontSize:"0.8rem",color:"var(--text2)"}}> grupos</span></div>
            {saude.dores?.length>0&&<div style={{fontSize:"0.8rem",color:"var(--text2)",marginTop:"0.25rem"}}>{saude.dores.map(d=>`${d.musculo} (${diffDays(d.desde)}d)`).join(", ")}</div>}
          </div>
          <div className="diario-section">
            <div className="diario-label">🔴 Ciclo menstrual</div>
            <div className="diario-val">{saude.mens?<span className="tag tag-orange">Semana menstrual ativa</span>:<span style={{color:"var(--text3)"}}>Não informado</span>}</div>
          </div>
          <div className="diario-section">
            <div className="diario-label">💊 Medicamentos</div>
            <div className="diario-val" style={{fontSize:"0.85rem"}}>{saude.meds||<span style={{color:"var(--text3)"}}>Nenhum</span>}</div>
          </div>
        </div>
        {saude.obs&&<div className="diario-section" style={{marginTop:"0.75rem"}}><div className="diario-label">Observações</div><div className="diario-val">{saude.obs}</div></div>}
      </div>

      {/* HIDRATAÇÃO */}
      <div className="card">
        <div className="card-title">💧 HIDRATAÇÃO</div>
        <div className="grid-2" style={{marginBottom:"1rem"}}>
          <div className="diario-section" style={{textAlign:"center"}}>
            <div className="diario-label">Consumo hoje</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:"2.5rem",color:"var(--blue)"}}>{(agua/1000).toFixed(1)}<span style={{fontSize:"0.9rem",color:"var(--text2)"}}>L</span></div>
          </div>
          <div className="diario-section" style={{textAlign:"center"}}>
            <div className="diario-label">Meta diária</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:"2.5rem",color:"var(--text)"}}>{(metaAgua/1000).toFixed(1)}<span style={{fontSize:"0.9rem",color:"var(--text2)"}}>L</span></div>
          </div>
        </div>
        <div className="prog-wrap">
          <div className="prog-hdr"><span>Atingimento da meta hoje</span><span className="blue">{Math.round((agua/metaAgua)*100)}%</span></div>
          <div className="prog-track"><div className="prog-fill blue" style={{width:`${Math.min((agua/metaAgua)*100,100)}%`}}/></div>
        </div>
      </div>

      {/* TREINO — AVALIAÇÃO */}
      {treino.rating>0&&(
        <div className="card">
          <div className="card-title">🏋️ AVALIAÇÃO DO ÚLTIMO TREINO</div>
          <div className="grid-2">
            <div className="diario-section"><div className="diario-label">Nota</div><div style={{fontSize:"1.8rem"}}>{"★".repeat(treino.rating)}{"☆".repeat(5-treino.rating)}</div></div>
            <div className="diario-section"><div className="diario-label">Data</div><div className="diario-val">{treino.data?fmtDate(treino.data):"—"}</div></div>
          </div>
          {treino.feedback&&<div className="diario-section" style={{marginTop:"0.5rem"}}><div className="diario-label">Feedback do aluno</div><div className="diario-val">"{treino.feedback}"</div></div>}
        </div>
      )}

      {/* ALIMENTAÇÃO */}
      {planoAlim&&(
        <div className="card">
          <div className="card-title">🥗 PLANO ALIMENTAR</div>
          <PeriodoBadge plano={planoAlim}/>
          <div style={{fontSize:"0.9rem",color:"var(--text2)",marginTop:"0.5rem",marginBottom:"1rem"}}>
            Refeições feitas hoje: <span style={{color:"var(--green)",fontWeight:600}}>{qtdComido}/{refeicoes.length}</span>
          </div>
          {refeicoes.map((r,i)=>(
            <div key={i} className="meal-item" style={{background:alimCheck[i]?"var(--green-dim)":"var(--card2)",border:alimCheck[i]?"1px solid rgba(46,204,113,0.3)":"none"}}>
              <div style={{color:"var(--text3)",fontFamily:"var(--font-mono)",fontSize:"0.75rem",minWidth:"45px"}}>{r.h}</div>
              <div style={{flex:1,fontWeight:600,fontSize:"0.88rem"}}>{r.r}</div>
              {alimCheck[i]?<span className="tag tag-green">✓ Comeu</span>:<span style={{fontSize:"0.75rem",color:"var(--text3)"}}>Não marcado</span>}
            </div>
          ))}
        </div>
      )}

      {/* COMPETIÇÕES */}
      {comps.length>0&&(
        <div className="card">
          <div className="card-title">🏆 COMPETIÇÕES</div>
          {comps.map((c,i)=>{const d=new Date(c.data);return(<div key={i} className="comp-card" style={{background:"var(--bg2)"}}><div className="comp-date"><div className="comp-date-day">{d.getDate()}</div><div className="comp-date-month">{d.toLocaleDateString("pt-BR",{month:"short"})}</div></div><div style={{flex:1}}><div style={{fontWeight:600}}>{c.nome}</div><div style={{fontSize:"0.8rem",color:"var(--text2)"}}>{c.modalidade}</div></div><span className="tag tag-orange">{c.objetivo}</span></div>);})}
        </div>
      )}
    </div>
  );
}
function TreinadorDash({user}){
  const alunos=DB.getAlunosDe(user.id);
  const [alunoVer,setAlunoVer]=useState(null);
  if(alunoVer)return<DiarioAluno aluno={alunoVer} onBack={()=>setAlunoVer(null)}/>;
  const comAlerta=alunos.filter(a=>{const s=DB.getData("saude",a.id)||{};return s.doente||(s.dores&&s.dores.length>0);});
  return(
    <div className="page">
      <div className="page-title orange">{getGreeting()}, {firstName(user.nome)} 👋</div>
      <div className="page-sub">{getDateStr()}</div>
      <div className="card" style={{padding:"1rem 1.5rem"}}><CodigoProfissional user={user}/></div>
      <div className="grid-4">
        <div className="stat-tile"><div className="stat-label">Alunos</div><div className="stat-value orange">{alunos.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Alertas</div><div className="stat-value red">{comAlerta.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Código</div><div style={{marginTop:"0.35rem",fontFamily:"var(--font-mono)",fontSize:"1.1rem",color:"var(--green)",letterSpacing:"0.1em"}}>{gerarCodigo(user.id)}</div></div>
        <div className="stat-tile"><div className="stat-label">Planos ativos</div><div className="stat-value green">{alunos.filter(a=>DB.getData("plano_treino_aluno",a.id)).length}</div></div>
      </div>
      {comAlerta.length>0&&<div className="alert alert-danger">🔴 {comAlerta.map(a=>a.nome.split(" ")[0]).join(", ")} — verificar saúde!</div>}
      {alunos.length===0?(
        <div className="card"><div className="card-title">👥 MEUS ALUNOS</div><div style={{color:"var(--text2)",fontSize:"0.9rem",lineHeight:1.7}}>Compartilhe seu código <b style={{color:"var(--green)",fontFamily:"var(--font-mono)"}}>{gerarCodigo(user.id)}</b> para seus alunos se conectarem.</div></div>
      ):(
        <div className="card">
          <div className="card-title">👥 MEUS ALUNOS</div>
          {alunos.map(a=>{
            const s=DB.getData("saude",a.id)||{};
            const plano=DB.getData("plano_treino_aluno",a.id);
            const temAlerta=s.doente||(s.dores&&s.dores.length>0);
            return(
              <div key={a.id} className="aluno-row" onClick={()=>setAlunoVer(a)}>
                <div className="aluno-avatar">{initials(a.nome)}</div>
                <div style={{flex:1}}><div style={{fontWeight:600}}>{a.nome}</div><div style={{fontSize:"0.78rem",color:"var(--text2)"}}>{plano?`Plano: ${plano.nome} — até ${fmtDate(plano.fim)}`:"Sem plano ativo"}</div></div>
                <div style={{display:"flex",gap:"0.4rem"}}>{temAlerta&&<span className="tag tag-red">⚠️</span>}{plano&&<span className="tag tag-green">✓ Plano</span>}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TreinadorAcompanhamento({user}){
  const alunos=DB.getAlunosDe(user.id);
  const [alunoVer,setAlunoVer]=useState(null);
  if(alunoVer)return<DiarioAluno aluno={alunoVer} onBack={()=>setAlunoVer(null)}/>;
  return(
    <div className="page">
      <div className="page-title orange">ACOMPANHAMENTO</div>
      <div className="page-sub">Resumo semanal — clique para ver o relatório completo do mês</div>
      {alunos.length===0?(
        <div className="card"><div style={{color:"var(--text2)"}}>Nenhum aluno vinculado. Código: <b style={{fontFamily:"var(--font-mono)",color:"var(--green)"}}>{gerarCodigo(user.id)}</b></div></div>
      ):alunos.map(a=>(
        <ResumoSemanalAluno key={a.id} aluno={a} onVerCompleto={()=>setAlunoVer(a)}/>
      ))}
    </div>
  );
}

// ============================================================
// NUTRICIONISTA — PRESCREVER PLANO ALIMENTAR
// ============================================================
function NutriPrescrever({user,showToast}){
  const alunos=DB.getAlunosDe(user.id);
  const [alunoSel,setAlunoSel]=useState(null);
  const [nomePlano,setNomePlano]=useState("Plano Alimentar");
  const [protocolo,setProtocolo]=useState("normal");
  const [duracao,setDuracao]=useState(1);
  const [inicio,setInicio]=useState(()=>new Date().toISOString().split("T")[0]);
  const [refeicoes,setRefeicoes]=useState([
    {h:"07:00",r:"Café da manhã",i:"3 ovos + pão integral + banana + café",k:480},
    {h:"10:00",r:"Lanche manhã",i:"Iogurte grego + castanhas",k:280},
    {h:"12:30",r:"Almoço",i:"Frango grelhado + arroz integral + salada",k:580},
    {h:"16:00",r:"Pré-treino",i:"Batata doce + whey",k:320},
    {h:"19:00",r:"Pós-treino",i:"Tilápia + arroz + brócolis",k:450},
    {h:"21:30",r:"Ceia",i:"Cottage + pasta de amendoim",k:220},
  ]);
  const [ok,setOk]=useState(false);
  const fases={normal:2330,carga:3100,cutting:1800,peak:2000};
  const totalKcal=refeicoes.reduce((s,r)=>s+Number(r.k),0);

  function updateRef(i,campo,val){setRefeicoes(p=>{const n=[...p];n[i]={...n[i],[campo]:campo==="k"?Number(val):val};return n;});}
  function removeRef(i){setRefeicoes(p=>p.filter((_,j)=>j!==i));}
  function addRef(){setRefeicoes(p=>[...p,{h:"",r:"Nova refeição",i:"",k:0}]);}

  function salvar(){
    if(!alunoSel)return;
    const fimDate=addMonths(new Date(inicio),duracao);
    const plano={nome:nomePlano,protocolo,duracao,inicio,fim:fimDate.toISOString(),refeicoes,kcalMeta:fases[protocolo],criadoEm:new Date().toISOString()};
    DB.setData("plano_alim_aluno",alunoSel.id,plano);
    showToast&&showToast(`✅ Plano alimentar enviado para ${alunoSel.nome.split(" ")[0]}!`);
  }

  return(
    <div className="page">
      <div className="page-title blue">PLANO ALIMENTAR</div>
      <div className="page-sub">Monte e atribua planos alimentares com período de validade</div>
      {ok&&<div className="alert alert-success">✅ Plano enviado para {alunoSel?.nome}!</div>}
      {alunos.length===0&&<div className="alert alert-warn">⚠️ Sem pacientes vinculados. Código: <b style={{fontFamily:"var(--font-mono)"}}>{gerarCodigo(user.id)}</b></div>}

      {/* SELECIONAR PACIENTE */}
      <div className="card">
        <div className="card-title">👤 SELECIONAR PACIENTE</div>
        <AlunoSelector alunos={alunos} selecionado={alunoSel} onSelect={setAlunoSel} accentClass="sel-blue"/>
        {!alunoSel&&alunos.length>0&&<div style={{color:"var(--text3)",fontSize:"0.85rem"}}>Selecione um paciente para montar o plano.</div>}
      </div>

      {alunoSel&&(
        <>
          {/* CONFIG */}
          <div className="card">
            <div className="card-title">⚙️ CONFIGURAÇÕES</div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Nome do plano</label><input className="form-input" value={nomePlano} onChange={e=>setNomePlano(e.target.value)} placeholder="Ex: Dieta Hipertrofia"/></div>
              <div className="form-group"><label className="form-label">Duração</label>
                <select className="form-select" value={duracao} onChange={e=>setDuracao(Number(e.target.value))}>
                  <option value={1}>1 mês</option><option value={2}>2 meses</option><option value={3}>3 meses</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Data de início</label><input className="form-input" type="date" value={inicio} onChange={e=>setInicio(e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Protocolo</label>
                <select className="form-select" value={protocolo} onChange={e=>setProtocolo(e.target.value)}>
                  <option value="normal">Normal / Manutenção</option>
                  <option value="carga">Semana de Carga (Ironman/Maratona)</option>
                  <option value="cutting">Cutting / Seca (Pesagem)</option>
                  <option value="peak">Peak Week (Palco)</option>
                </select>
              </div>
            </div>
            <div className="periodo-card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"0.5rem"}}>
                <div><div style={{fontWeight:600}}>{fmtDate(inicio)} → {fmtDate(addMonths(new Date(inicio),duracao))}</div><div style={{fontSize:"0.8rem",color:"var(--text2)",marginTop:"0.15rem"}}>{duracao} {duracao===1?"mês":"meses"} para {alunoSel.nome.split(" ")[0]}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontFamily:"var(--font-display)",fontSize:"1.8rem",color:"var(--blue)"}}>{totalKcal}<span style={{fontSize:"0.9rem",color:"var(--text2)"}}> kcal/dia</span></div><div style={{fontSize:"0.75rem",color:"var(--text3)"}}>Meta protocolo: {fases[protocolo]}kcal</div></div>
              </div>
            </div>
          </div>

          {/* REFEIÇÕES */}
          <div className="card">
            <div className="card-title">🥗 REFEIÇÕES DO PLANO</div>
            {refeicoes.map((r,i)=>(
              <div key={i} style={{background:"var(--card2)",borderRadius:"var(--radius)",padding:"0.85rem",marginBottom:"0.75rem",border:"1px solid var(--border)"}}>
                <div className="grid-2" style={{marginBottom:"0.5rem"}}>
                  <div className="form-group" style={{marginBottom:0}}><label className="form-label">Horário</label><input className="form-input" type="time" value={r.h} onChange={e=>updateRef(i,"h",e.target.value)}/></div>
                  <div className="form-group" style={{marginBottom:0}}><label className="form-label">Nome</label><input className="form-input" value={r.r} onChange={e=>updateRef(i,"r",e.target.value)}/></div>
                </div>
                <div className="form-group" style={{marginBottom:"0.5rem"}}><label className="form-label">Itens</label><textarea className="form-textarea" style={{minHeight:"60px"}} value={r.i} onChange={e=>updateRef(i,"i",e.target.value)}/></div>
                <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
                  <div style={{flex:1}}><label className="form-label">Kcal</label><input className="form-input" type="number" value={r.k} onChange={e=>updateRef(i,"k",e.target.value)}/></div>
                  <button className="btn btn-ghost btn-sm" style={{color:"var(--red)",alignSelf:"flex-end"}} onClick={()=>removeRef(i)}>✕ Remover</button>
                </div>
              </div>
            ))}
            <button className="btn btn-ghost" onClick={addRef}>+ Adicionar refeição</button>
          </div>

          <button className="btn btn-blue btn-full" onClick={salvar}>📤 Enviar plano para {alunoSel.nome.split(" ")[0]}</button>
        </>
      )}
    </div>
  );
}

// ============================================================
// NUTRI — DASHBOARD + ACOMPANHAMENTO
// ============================================================
function NutriDash({user}){
  const pacientes=DB.getAlunosDe(user.id);
  const [pacVer,setPacVer]=useState(null);
  if(pacVer)return<DiarioAluno aluno={pacVer} onBack={()=>setPacVer(null)}/>;
  return(
    <div className="page">
      <div className="page-title blue">{getGreeting()}, {firstName(user.nome)} 👋</div>
      <div className="page-sub">{getDateStr()}</div>
      <div className="card" style={{padding:"1rem 1.5rem"}}><CodigoProfissional user={user}/></div>
      <div className="grid-4">
        <div className="stat-tile"><div className="stat-label">Pacientes</div><div className="stat-value blue">{pacientes.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Planos ativos</div><div className="stat-value green">{pacientes.filter(p=>DB.getData("plano_alim_aluno",p.id)).length}</div></div>
        <div className="stat-tile"><div className="stat-label">Código</div><div style={{marginTop:"0.35rem",fontFamily:"var(--font-mono)",fontSize:"1.1rem",color:"var(--green)",letterSpacing:"0.1em"}}>{gerarCodigo(user.id)}</div></div>
        <div className="stat-tile"><div className="stat-label">Alertas</div><div className="stat-value orange">{pacientes.filter(p=>{const s=DB.getData("saude",p.id)||{};return s.doente||s.mens;}).length}</div></div>
      </div>
      {pacientes.length===0?(
        <div className="card"><div className="card-title">👥 MEUS PACIENTES</div><div style={{color:"var(--text2)",lineHeight:1.7}}>Compartilhe o código <b style={{color:"var(--green)",fontFamily:"var(--font-mono)"}}>{gerarCodigo(user.id)}</b> para seus pacientes se conectarem.</div></div>
      ):(
        <div className="card">
          <div className="card-title">👥 MEUS PACIENTES</div>
          {pacientes.map(p=>{
            const s=DB.getData("saude",p.id)||{};
            const plano=DB.getData("plano_alim_aluno",p.id);
            const alimCheck=DB.getData("alim_check_hoje",p.id)||{};
            const qtdComido=Object.values(alimCheck).filter(Boolean).length;
            const totalRef=plano?.refeicoes?.length||0;
            return(
              <div key={p.id} className="aluno-row" onClick={()=>setPacVer(p)}>
                <div className="aluno-avatar" style={{background:"rgba(52,152,219,0.15)",color:"var(--blue)"}}>{initials(p.nome)}</div>
                <div style={{flex:1}}><div style={{fontWeight:600}}>{p.nome}</div><div style={{fontSize:"0.78rem",color:"var(--text2)"}}>{plano?`Plano: ${plano.nome} — até ${fmtDate(plano.fim)}`:"Sem plano ativo"}{totalRef>0?` • ${qtdComido}/${totalRef} refeições`:""}</div></div>
                <div style={{display:"flex",gap:"0.4rem"}}>
                  {s.doente&&<span className="tag tag-red">🤒</span>}
                  {s.mens&&<span className="tag tag-orange">🔴</span>}
                  {plano&&<span className="tag tag-blue">✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NutriAcompanhamento({user}){
  const pacientes=DB.getAlunosDe(user.id);
  const [pacVer,setPacVer]=useState(null);
  if(pacVer)return<DiarioAluno aluno={pacVer} onBack={()=>setPacVer(null)}/>;
  return(
    <div className="page">
      <div className="page-title blue">ACOMPANHAMENTO</div>
      <div className="page-sub">Alimentação e saúde dos pacientes</div>
      {pacientes.length===0?<div className="card"><div style={{color:"var(--text2)"}}>Sem pacientes. Código: <b style={{fontFamily:"var(--font-mono)",color:"var(--green)"}}>{gerarCodigo(user.id)}</b></div></div>:pacientes.map(p=>{
        const s=DB.getData("saude",p.id)||{};
        const alimCheck=DB.getData("alim_check_hoje",p.id)||{};
        const plano=DB.getData("plano_alim_aluno",p.id);
        const totalRef=plano?.refeicoes?.length||0;
        const qtdComido=Object.values(alimCheck).filter(Boolean).length;
        const agua=DB.getData("agua_hoje",p.id)||0;
        const meta=DB.getData("meta_agua",p.id)||3000;
        const diasDoente=s.doente_desde?diffDays(s.doente_desde):0;
        return(
          <div key={p.id} className="card" style={{cursor:"pointer"}} onClick={()=>setPacVer(p)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
              <div className="card-title" style={{marginBottom:0}}>{p.nome}</div>
              <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap"}}>
                {s.mens&&<span className="tag tag-orange">🔴 Ciclo</span>}
                {s.doente&&<span className="tag tag-red">🤒 {diasDoente}d</span>}
                {s.meds&&<span className="tag tag-blue">💊</span>}
                {s.dores&&s.dores.length>0&&<span className="tag tag-orange">🔴 Dor</span>}
              </div>
            </div>
            {totalRef>0&&<div className="prog-wrap"><div className="prog-hdr"><span style={{fontSize:"0.8rem"}}>Refeições hoje</span><span className="green" style={{fontSize:"0.8rem"}}>{qtdComido}/{totalRef}</span></div><div className="prog-track"><div className="prog-fill green" style={{width:`${totalRef>0?(qtdComido/totalRef)*100:0}%`}}/></div></div>}
            <div className="prog-wrap"><div className="prog-hdr"><span style={{fontSize:"0.8rem"}}>Hidratação</span><span className="blue" style={{fontSize:"0.8rem"}}>{agua}ml / {meta}ml</span></div><div className="prog-track"><div className="prog-fill blue" style={{width:`${Math.min((agua/meta)*100,100)}%`}}/></div></div>
            <div style={{fontSize:"0.8rem",color:"var(--blue)",marginTop:"0.5rem"}}>Ver diário completo →</div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// NAV
// ============================================================
const NAV_ALUNO=[
  {section:"VISÃO GERAL",items:[{id:"dashboard",icon:"🏠",label:"Dashboard"}]},
  {section:"DIÁRIO",items:[{id:"treinos",icon:"🏋️",label:"Treinos da Semana"},{id:"alimentacao",icon:"🥗",label:"Alimentação"},{id:"hidratacao",icon:"💧",label:"Hidratação"},{id:"saude",icon:"❤️",label:"Saúde"}]},
  {section:"PROGRESSO",items:[{id:"avaliacao",icon:"📊",label:"Avaliação Física"},{id:"competicoes",icon:"🏆",label:"Competições"}]},
  {section:"EQUIPE",items:[{id:"vinculo",icon:"🔗",label:"Minha Equipe"}]},
];
const NAV_TREINADOR=[
  {section:"VISÃO GERAL",items:[{id:"dashboard",icon:"🏠",label:"Dashboard"}]},
  {section:"ALUNOS",items:[{id:"acompanhamento",icon:"👁️",label:"Acompanhamento"},{id:"prescrever",icon:"📋",label:"Prescrever Treino"}]},
];
const NAV_NUTRI=[
  {section:"VISÃO GERAL",items:[{id:"dashboard",icon:"🏠",label:"Dashboard"}]},
  {section:"PACIENTES",items:[{id:"acompanhamento",icon:"👁️",label:"Acompanhamento"},{id:"prescrever",icon:"🥗",label:"Plano Alimentar"}]},
];

// ============================================================
// ROLE APPS
// ============================================================
function AlunoApp({user,onLogout}){
  const {show,ToastEl}=useToast();
  const [page,setPage]=useState("dashboard");
  const pages={dashboard:<AlunoDash user={user}/>,saude:<AlunoSaude user={user}/>,treinos:<AlunoTreinos user={user}/>,alimentacao:<AlunoAlimentacao user={user}/>,hidratacao:<AlunoHidratacao user={user}/>,competicoes:<AlunoCompeticoes user={user}/>,avaliacao:<AlunoAvaliacao user={user}/>,vinculo:<AlunoVinculo user={user}/>};
  return(<>{ToastEl}<Shell user={user} onLogout={onLogout} nav={NAV_ALUNO} active={page} setActive={setPage} accent="">{pages[page]}</Shell></>);
}
function TreinadorApp({user,onLogout}){
  const {show,ToastEl}=useToast();
  const [page,setPage]=useState("dashboard");
  const alunos=DB.getAlunosDe(user.id);
  const alertCount=alunos.filter(a=>{const s=DB.getData("saude",a.id)||{};return s.doente||(s.dores?.length>0);}).length;
  const pages={dashboard:<TreinadorDash user={user}/>,prescrever:<TreinadorPrescrever user={user}/>,acompanhamento:<TreinadorAcompanhamento user={user}/>};
  return(<>{ToastEl}<Shell user={user} onLogout={onLogout} nav={NAV_TREINADOR} active={page} setActive={setPage} accent="orange" alertCount={alertCount}>{pages[page]}</Shell></>);
}
function NutriApp({user,onLogout}){
  const {show,ToastEl}=useToast();
  const [page,setPage]=useState("dashboard");
  const pages={dashboard:<NutriDash user={user}/>,prescrever:<NutriPrescrever user={user}/>,acompanhamento:<NutriAcompanhamento user={user}/>};
  return(<>{ToastEl}<Shell user={user} onLogout={onLogout} nav={NAV_NUTRI} active={page} setActive={setPage} accent="blue">{pages[page]}</Shell></>);
}

// ============================================================
// ROOT
// ============================================================
export default function TrioFit(){
  const [user,setUser]=useState(()=>DB.getSession());
  useEffect(()=>{
    // Seed demo accounts
    const demos=[
      ["aluno@demo.com","Ana Souza","aluno"],
      ["treinador@demo.com","Carlos Silva","treinador"],
      ["nutri@demo.com","Dra. Mariana Costa","nutri"],
    ];
    demos.forEach(([email,nome,role])=>{
      if(!DB.getUsers().find(u=>u.email===email))DB.register(nome,email,"123456",role);
    });
    // Auto-link demo users
    const users=DB.getUsers();
    const aluno=users.find(u=>u.email==="aluno@demo.com");
    const trein=users.find(u=>u.email==="treinador@demo.com");
    const nutri=users.find(u=>u.email==="nutri@demo.com");
    if(aluno&&trein&&nutri){
      const vinc=DB.getVinculoAluno(aluno.id);
      if(!vinc?.treinadorId)DB.setVinculoAluno(aluno.id,trein.id,nutri.id);
    }
  },[]);
  function handleLogout(){DB.clearSession();setUser(null);}
  return(
    <>
      <style>{styles}</style>
      <div className="app">
        {!user&&<AuthScreen onLogin={u=>{DB.saveSession(u);setUser(u);}}/>}
        {user?.role==="aluno"&&<AlunoApp user={user} onLogout={handleLogout}/>}
        {user?.role==="treinador"&&<TreinadorApp user={user} onLogout={handleLogout}/>}
        {user?.role==="nutri"&&<NutriApp user={user} onLogout={handleLogout}/>}
      </div>
    </>
  );
}
