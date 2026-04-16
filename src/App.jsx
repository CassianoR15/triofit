import { useState, useEffect, useCallback, useRef } from "react";

// Data formatada para horário de Brasília
function fmtDate(iso){
  if(!iso)return"";
  try{
    return new Date(iso).toLocaleDateString("pt-BR",{timeZone:"America/Sao_Paulo",day:"2-digit",month:"2-digit",year:"numeric"});
  }catch{return iso.slice(0,10);}
}
function fmtTime(iso){
  if(!iso)return"";
  try{
    return new Date(iso).toLocaleTimeString("pt-BR",{timeZone:"America/Sao_Paulo",hour:"2-digit",minute:"2-digit"});
  }catch{return"";}
}

// Sanitização de input — previne XSS
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>'"&]/g, c => ({'<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;','&':'&amp;'}[c]));
}

// Validação de email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validação de senha forte
function validateSenha(senha) {
  if (senha.length < 8) return 'Senha: mínimo 8 caracteres.';
  if (!/\d/.test(senha)) return 'Senha: precisa ter pelo menos 1 número.';
  return null;
}
import { supabase, DB } from "./lib/supabase.js";

const _v='TRIOFIT_BUILD_1776373258';
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


  .skeleton { background: linear-gradient(90deg, var(--card2) 25%, var(--border) 50%, var(--card2) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: var(--radius); }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .loading-dots { display:flex; gap:4px; justify-content:center; padding:2rem; }
  .loading-dots span { width:8px; height:8px; border-radius:50%; background:var(--green); animation:dotPulse 1.2s ease-in-out infinite; }
  .loading-dots span:nth-child(2){animation-delay:.2s} .loading-dots span:nth-child(3){animation-delay:.4s}
  @keyframes dotPulse{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
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
function gerarCodigo(seed){
  if(!seed)return"------";
  // Handle UUID string (from Supabase) or number
  if(typeof seed==="string"){
    let s=0;
    for(let i=0;i<seed.length;i++)s=(s*31+seed.charCodeAt(i))%999999;
    seed=s;
  }
  const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let r="",s=seed%999999;
  for(let i=0;i<6;i++){r+=c[s%c.length];s=Math.floor(s/c.length)+7;}
  return r.slice(0,6).toUpperCase();
}
function addMonths(date,n){const d=new Date(date);d.setMonth(d.getMonth()+n);return d;}

const TIPO_ICONS={descanso:"😴",academia:"🏋️",corrida:"🏃",natacao:"🏊",luta:"🥊",ciclismo:"🚴",funcional:"⚡",caminhada:"🚶",yoga:"🧘",treino:"🏋️"};
const DIAS_SEMANA=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
const MODALIDADES=[{v:"musculacao",l:"💪 Musculação"},{v:"corrida",l:"🏃 Corrida"},{v:"natacao",l:"🏊 Natação"},{v:"luta",l:"🥊 Luta / Artes Marciais"},{v:"ciclismo",l:"🚴 Ciclismo"},{v:"caminhada",l:"🚶 Caminhada"},{v:"funcional",l:"⚡ Funcional"}];
const MUSCLES=["Ombro D","Ombro E","Bíceps D","Bíceps E","Tríceps D","Tríceps E","Peitoral","Costas","Lombar","Abdômen","Glúteo","Quadríceps D","Quadríceps E","Panturrilha D","Panturrilha E","Isquio"];

// ============================================================
// LOCAL DB
// ============================================================

// Hook para carregar dados async com estado de loading
function useAsyncData(fetcher, deps=[], defaultVal=null) {
  const [data, setData] = useState(defaultVal);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcher()
      .then(result => {
        if (!cancelled) { setData(result ?? defaultVal); setLoading(false); }
      })
      .catch(() => {
        if (!cancelled) { setData(defaultVal); setLoading(false); }
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line
  }, deps);

  return [data, loading, setData];
}

// Hook para dados do aluno com refresh trigger
function useAlunoData(userId, chave, defaultVal=null) {
  const [val, setVal] = useState(defaultVal);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    DB.getData(chave, userId).then(d => {
      if (!cancelled) { setVal(d ?? defaultVal); setReady(true); }
    }).catch(() => {
      if (!cancelled) { setVal(defaultVal); setReady(true); }
    });
    return () => { cancelled = true; };
  }, [userId, chave]);
  async function save(newVal) {
    setVal(newVal);
    await DB.setData(chave, userId, newVal);
  }
  return [val, ready, save];
}


// ============================================================
// AUTH
// ============================================================
function AuthScreen({onLogin}){
  const [tab,setTab]=useState("login");
  useEffect(()=>{
    // Limpar token JWT da URL se presente
    if(window.location.hash.includes('access_token')||window.location.search.includes('access_token')){
      window.history.replaceState(null,'',window.location.pathname);
    }
  },[]);
  const [role,setRole]=useState("aluno");
  const [nome,setNome]=useState("");
  const [email,setEmail]=useState("");
  const [senha,setSenha]=useState("");
  const [confirma,setConfirma]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const [showSenha,setShowSenha]=useState(false);
  async function handleLogin(e){
  e.preventDefault();setError("");
  if(!isValidEmail(email)){setError("Email inválido.");return;}
  setLoading(true);
  const res=await DB.login(email,senha);
  setLoading(false);
  if(!res.ok){setError(res.msg);return;}
  onLogin(res.user);
}
  async function handleRegister(e){e.preventDefault();setError("");setSuccess("");if(!nome.trim()){setError("Informe seu nome.");return;}const senhaErr=validateSenha(senha);if(senhaErr){setError(senhaErr);return;}if(!isValidEmail(email)){setError("Email inválido.");return;}if(senha!==confirma){setError("Senhas não conferem.");return;}setLoading(true);const res=await DB.register(sanitize(nome.trim()),email,senha,role);setLoading(false);if(!res.ok){setError(res.msg);return;}setSuccess("Conta criada! Faça login.");setTab("login");setNome("");setSenha("");setConfirma("");}
  return(
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">TrioFit</div>
        <div className="auth-subtitle">Aluno • Treinador • Nutricionista</div>
        <div className="auth-tabs">
          <div className={`auth-tab ${tab==="login"?"active":""}`} onClick={()=>{setTab("login");setError("");setSuccess("");}}>Entrar</div>
          <div className={`auth-tab ${tab==="register"?"active":""}`} onClick={async()=>{setTab("register");setError("");setSuccess("");await supabase.auth.signOut();}}>Criar conta</div>
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
            <div style={{textAlign:"center",marginTop:"0.75rem"}}>
              <button type="button" className="btn btn-ghost btn-sm" style={{fontSize:"0.8rem",color:"var(--text2)"}}
                onClick={async()=>{
                  if(!email.trim()){setError("Digite seu email primeiro.");return;}
                  if(!isValidEmail(email)){setError("Email inválido.");return;}
                  setLoading(true);
                  const {error:e}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
                  setLoading(false);
                  if(e){setError("Erro: "+e.message);}
                  else{setSuccess("Email de recuperação enviado! Verifique sua caixa de entrada.");}
                }}>
                Esqueci minha senha
              </button>
            </div>
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
            <div className="form-group"><label className="form-label">Senha</label><input className="form-input" type="password" placeholder="Mínimo 8 caracteres" value={senha} onChange={e=>setSenha(e.target.value)} required/>
              {senha.length>0&&(
                <div style={{marginTop:"4px",display:"flex",gap:"4px",alignItems:"center"}}>
                  {[1,2,3].map(n=>(
                    <div key={n} style={{height:"3px",flex:1,borderRadius:"2px",background:
                      senha.length>=8&&/\d/.test(senha)?n<=3?"var(--green)":"var(--border)":
                      senha.length>=6?n<=2?"var(--orange)":"var(--border)":
                      n<=1?"var(--red)":"var(--border)"
                    }}/>
                  ))}
                  <span style={{fontSize:"10px",color:"var(--text3)",marginLeft:"4px",whiteSpace:"nowrap"}}>
                    {senha.length>=8&&/\d/.test(senha)?"Forte":senha.length>=6?"Média":"Fraca"}
                  </span>
                </div>
              )}
            </div>
            <div className="form-group"><label className="form-label">Confirmar senha</label><input className="form-input" type="password" placeholder="Repita a senha" value={confirma} onChange={e=>setConfirma(e.target.value)} required/></div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>{loading?<><span className="spinner"/> Criando...</>:"Criar conta grátis"}</button>
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
        <div className="sidebar-footer"><button className="logout-btn" onClick={onLogout} type="button">🚪 Sair da conta</button></div>
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
  const [profile,,]=useAsyncData(()=>DB.getProfile(user.id),[user.id],null);
  const codigo=profile?.codigo||user.codigo||gerarCodigo(user.id)||"------";
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
  const [buscando,setBuscando]=useState(false);
  async function buscar(){
    setErro("");setEncontrado(null);
    if(codigo.trim().length<6){setErro("Digite os 6 caracteres do código.");return;}
    setBuscando(true);
    try{
      const u=await DB.getUserByCodigo(codigo.trim().toUpperCase());
      setBuscando(false);
      if(!u){setErro("Código não encontrado. Verifique com seu profissional.");return;}
      const rl={treinador:"treinador",nutri:"nutricionista",aluno:"aluno"}[u.role]||u.role||"outro";
      if(u.role!==tipo){setErro(`Este código pertence a um ${rl}, não a um ${label.toLowerCase()}.`);return;}
      setEncontrado(u);
    }catch(e){setBuscando(false);setErro("Erro ao buscar. Tente novamente.");}
  }
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
          <button className="btn btn-ghost" onClick={buscar} disabled={buscando}>{buscando?<span className="spinner"/>:"Buscar"}</button>
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
      {(status?.dores||[]).map((d,i)=>(
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
        {(alunos||[]).map(a=>(
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
function AlunoVinculo({user,showToast,onVinculoChange}){
  const [vinculo,setVinculo]=useState({});
  const [treinador,setTreinador]=useState(null);
  const [nutri,setNutri]=useState(null);
  useEffect(()=>{
    let cancelled=false;
    DB.getVinculoAluno(user.id).then(async v=>{
      if(cancelled)return;
      const vc=v||{};
      setVinculo(vc);
      if(vc.treinadorId){const t=await DB.getUserById(vc.treinadorId);if(!cancelled)setTreinador(t);}
      if(vc.nutriId){const n=await DB.getUserById(vc.nutriId);if(!cancelled)setNutri(n);}
    }).catch(()=>{});
    return()=>{cancelled=true;};
  },[user.id]);
  async function vincT(u){const n={...vinculo,treinadorId:u.id};await DB.setVinculoAluno(user.id,n.treinadorId,n.nutriId);setVinculo(n);setTreinador(u);onVinculoChange&&onVinculoChange();showToast&&showToast(`✅ Treinador ${u.nome.split(" ")[0]} vinculado!`);}
  async function vincN(u){const n={...vinculo,nutriId:u.id};await DB.setVinculoAluno(user.id,n.treinadorId,n.nutriId);setVinculo(n);setNutri(u);onVinculoChange&&onVinculoChange();showToast&&showToast(`✅ Nutricionista ${u.nome.split(" ")[0]} vinculada!`);}
  async function desT(){const n={...vinculo,treinadorId:null};await DB.setVinculoAluno(user.id,null,n.nutriId);setVinculo(n);setTreinador(null);onVinculoChange&&onVinculoChange();showToast&&showToast("Treinador desvinculado.","warn");}
  async function desN(){const n={...vinculo,nutriId:null};await DB.setVinculoAluno(user.id,n.treinadorId,null);setVinculo(n);setNutri(null);onVinculoChange&&onVinculoChange();showToast&&showToast("Nutricionista desvinculada.","warn");}
  return(
    <div className="page">
      <div className="page-title green">MINHA EQUIPE</div>
      <div className="page-sub">Use o código de 6 letras do seu profissional para se conectar</div>
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
  const [planoTreino,setPlanoTreino]=useState(undefined);
  const [planoReady,setPlanoReady]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    setPlanoReady(false);
    setPlanoTreino(undefined);
    DB.getData("plano_treino_aluno",user.id).then(d=>{
      if(!cancelled){setPlanoTreino(d);setPlanoReady(true);}
    }).catch(()=>{
      if(!cancelled){setPlanoTreino(null);setPlanoReady(true);}
    });
    const timeout=setTimeout(()=>{if(!cancelled){setPlanoReady(true);}},8000);
    return()=>{cancelled=true;clearTimeout(timeout);};
  },[user.id]);
  const [diaAtivo,setDiaAtivo]=useState(0);
  const [checked, ,saveChecked]=useAlunoData(user.id,"treino_check_hoje",{});
  const [rating,setRating]=useState(0);
  const [feedback,setFeedback]=useState("");
  const [mostrarTroca,setMostrarTroca]=useState(false);
  const [diaOriginal,setDiaOriginal]=useState(null); // null = sem troca ativa
  const [treinosFinalizados,,saveTreinosFinalizados]=useAlunoData(user.id,"treinos_finalizados",{});
  const [confirmandoFinalizar,setConfirmandoFinalizar]=useState(false);
  // Load saved avaliacao
  useEffect(()=>{
    let cancelled=false;
    DB.getData("treino_avaliacao",user.id).then(d=>{
      if(!cancelled&&d){setRating(d.rating||0);setFeedback(d.feedback||"");}
    }).catch(()=>{});
    return()=>{cancelled=true;};
  },[user.id]);

  // Determina o dia atual da semana (0=seg)
  const hoje=new Date().getDay();
  const diaHoje=hoje===0?6:hoje-1;

  const diaHojeRef=useRef(diaHoje);
  useEffect(()=>{setDiaAtivo(diaHojeRef.current);},[]);

  async function toggleEx(diaIdx,exIdx){
    const chaveDia=dataHojeStr+"_dia"+diaIdx;
    if((treinosFinalizados||{})[chaveDia]){
      showToast&&showToast("Treino já finalizado. Clique em '+ Novo treino' para treinar novamente.","warn");
      return;
    }
    try{
      const key=`${diaIdx}_${exIdx}`;
      const novo={...(checked||{}),[key]:!(checked||{})[key]};
      await saveChecked(novo);
    }catch(e){showToast&&showToast("Erro ao salvar. Tente novamente.","warn");}
  }

  async function salvarAvaliacao(){
    if(!rating){showToast&&showToast("Selecione uma nota de 1-5 estrelas","warn");return;}
    try{
      await DB.setData("treino_avaliacao",user.id,{rating,feedback,data:new Date().toISOString()});
      showToast&&showToast("Avaliação salva! Treinador notificado ✅");
    }catch(e){showToast&&showToast("Erro ao salvar avaliação.","warn");}
  }

  // Chave do dia atual para verificar se já foi finalizado
  const dataHojeStr=new Date().toISOString().split("T")[0];
  const chaveHoje=dataHojeStr+"_dia"+diaHoje;
  const treinoDeHojeFinalizado=!!(treinosFinalizados||{})[chaveHoje];

  async function finalizarTreino(diaIdx,diaInfo2,checked2){
    try{
      const chave=dataHojeStr+"_dia"+diaIdx;
      const novo={...(treinosFinalizados||{}),[chave]:{
        dia:diaIdx,nome:diaInfo2?.nome,
        data:new Date().toISOString(),
        exercicios:(diaInfo2?.exercicios||[]).length,
        rating
      }};
      await saveTreinosFinalizados(novo);
      if(rating>0){
        await DB.setData("treino_avaliacao",user.id,{rating,feedback,data:new Date().toISOString()});
      }
      setConfirmandoFinalizar(false);
      showToast&&showToast("🏆 Treino finalizado! Ótimo trabalho!");
    }catch(e){showToast&&showToast("Erro ao finalizar. Tente novamente.","warn");}
  }

  if(!planoReady){
    return(<div className="page"><div className="page-header"><div className="page-title green">TREINOS</div></div><div style={{color:"var(--text2)",padding:"2rem",textAlign:"center"}}><span className="spinner"/> Carregando treinos...</div></div>);
  }
  if(!planoTreino||!planoTreino.dias){
    return(
      <div className="page">
        <div className="page-header"><div className="page-title green">TREINOS</div><div className="page-sub">Semana completa de treinos</div></div>
        <div className="empty-state">
          <div className="empty-icon">🏋️</div>
          <div className="empty-title">Aguardando plano</div>
          <div className="empty-desc">Seu treinador ainda não enviou um plano de treino.<br/>Assim que ele enviar, aparecerá aqui.</div>
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

      <PeriodoBadge plano={planoTreino}/>

      {/* ABAS DOS DIAS */}
      <div className="week-tabs" style={{overflowX:"auto",display:"flex",gap:"4px",paddingBottom:"4px"}}>
        {(dias||[]).map((d,i)=>{
          const temEx=d.exercicios&&d.exercicios.length>0;
          const feitos=d.exercicios?d.exercicios.filter((_,j)=>checked[`${i}_${j}`]).length:0;
          const todos=d.exercicios?d.exercicios.length:0;
          const completo=temEx&&feitos===todos;
          // Data correta: segunda-feira desta semana + i dias
          // diaHoje: 0=seg,1=ter,...,6=dom. Hoje = segunda + diaHoje
          const hojeMs=new Date();hojeMs.setHours(0,0,0,0);
          const dataSeg=new Date(hojeMs);dataSeg.setDate(hojeMs.getDate()-diaHoje);
          const dataDia=new Date(dataSeg);dataDia.setDate(dataSeg.getDate()+i);
          const ehHoje=i===diaHoje;
          const passado=i<diaHoje;
          const futuro=i>diaHoje;
          const diaStr=dataDia.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
          const nomeDia=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][i];
          return(
            <button key={i}
              onClick={()=>setDiaAtivo(i)}
              style={{
                display:"flex",flexDirection:"column",alignItems:"center",
                padding:"6px 10px",borderRadius:"8px",border:"none",cursor:"pointer",
                minWidth:"52px",flexShrink:0,
                background:diaAtivo===i?"var(--green)":ehHoje?"rgba(46,213,115,0.15)":passado?"var(--card2)":"rgba(255,193,7,0.10)",
                color:diaAtivo===i?"#fff":passado?"var(--text3)":futuro?"#c9a227":"var(--green)",
                opacity:passado&&diaAtivo!==i?0.5:1,
                fontWeight:ehHoje?700:500,
                outline:ehHoje&&diaAtivo!==i?"2px solid var(--green)":"none",
              }}>
              <span style={{fontSize:"11px",fontWeight:600}}>{nomeDia}</span>
              <span style={{fontSize:"10px",opacity:0.8}}>{diaStr}</span>
              {completo&&<span style={{fontSize:"9px"}}>✓</span>}
              {ehHoje&&diaAtivo!==i&&<span style={{fontSize:"9px",color:"var(--green)"}}>hoje</span>}
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
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"0.5rem"}}>
              <div>
                <div className="treino-nome">{diaInfo.nome||`Treino ${diaAtivo+1}`}</div>
                <div className="treino-periodo">{DIAS_SEMANA[diaAtivo]} • {modLabel}</div>
              </div>
              {diaAtivo===diaHoje&&(
                <div style={{position:"relative"}}>
                  {diaOriginal!==null
                    ?<button className="btn btn-ghost btn-sm" style={{fontSize:"0.75rem",color:"var(--text2)"}} onClick={()=>{setDiaAtivo(diaHoje);setDiaOriginal(null);showToast&&showToast("Voltou ao treino de hoje");}}>↩ Voltar ao hoje</button>
                    :<button className="btn btn-ghost btn-sm" style={{fontSize:"0.75rem"}} onClick={()=>setMostrarTroca(p=>!p)}>🔄 Trocar treino</button>
                  }
                  {mostrarTroca&&(
                    <div style={{position:"absolute",right:0,top:"100%",zIndex:10,background:"var(--card)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"0.5rem",minWidth:"170px",boxShadow:"0 4px 12px rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:"0.75rem",color:"var(--text2)",marginBottom:"0.4rem",fontWeight:600}}>Fazer treino de outro dia hoje:</div>
                      {(dias||[]).map((d2,i2)=>i2!==diaHoje&&d2.tipo!=="descanso"?(
                        <button key={i2} className="btn btn-ghost btn-sm" style={{display:"block",width:"100%",textAlign:"left",fontSize:"0.8rem",padding:"0.3rem 0.5rem"}}
                          onClick={()=>{setDiaOriginal(diaHoje);setDiaAtivo(i2);setMostrarTroca(false);showToast&&showToast(`Fazendo ${d2.nome} hoje 💪`);}}>
                          {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][i2]} — {d2.nome}
                        </button>
                      ):null)}
                    </div>
                  )}
                </div>
              )}
            </div>
            {diaInfo.exercicios&&(
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:"1.8rem",color:"var(--green)"}}>
                  {(diaInfo.exercicios||[]).filter((_,j)=>checked[`${diaAtivo}_${j}`]).length}/{(diaInfo.exercicios||[]).length}
                </div>
                <div style={{fontSize:"0.7rem",color:"var(--text3)"}}>exercícios</div>
              </div>
            )}
          </div>

          {diaInfo.obs&&<div style={{background:"rgba(52,152,219,0.1)",border:"1px solid rgba(52,152,219,0.2)",borderRadius:"var(--radius)",padding:"0.75rem",fontSize:"0.85rem",color:"var(--blue)",marginBottom:"1rem"}}>📌 {diaInfo.obs}</div>}

          {diaInfo.exercicios&&(diaInfo.exercicios||[]).length>0?(
            <>
              <div className="prog-wrap">
                <div className="prog-hdr"><span>Progresso</span><span className="green">{(diaInfo.exercicios||[]).filter((_,j)=>checked[`${diaAtivo}_${j}`]).length}/{(diaInfo.exercicios||[]).length}</span></div>
                <div className="prog-track"><div className="prog-fill green" style={{width:`${((diaInfo.exercicios||[]).filter((_,j)=>checked[`${diaAtivo}_${j}`]).length/(diaInfo.exercicios||[]).length)*100}%`}}/></div>
              </div>
              {(diaInfo.exercicios||[]).map((ex,j)=>(
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

      {/* FINALIZAR TREINO */}
      {diaInfo.tipo!=="descanso"&&diaAtivo===diaHoje&&(
        treinoDeHojeFinalizado?(
          <div className="card" style={{textAlign:"center",padding:"1.5rem"}}>
            <div style={{fontSize:"3rem",marginBottom:"0.5rem"}}>🏆</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:"1.2rem",color:"var(--green)",marginBottom:"0.3rem"}}>Treino finalizado!</div>
            <div style={{fontSize:"0.85rem",color:"var(--text2)",marginBottom:"1rem"}}>Ótimo trabalho! O treinador já pode acompanhar sua evolução.</div>
            <button className="btn btn-ghost btn-sm" onClick={async()=>{
              const chaveExtra=dataHojeStr+"_dia"+diaHoje+"_extra"+Date.now();
              const novo={...(treinosFinalizados||{}),[chaveExtra]:{dia:diaHoje,extra:true,data:new Date().toISOString()}};
              await saveChecked({});
              await saveTreinosFinalizados(novo);
              showToast&&showToast("Iniciando novo treino 💪");
            }}>+ Novo treino agora</button>
          </div>
        ):(
          <div className="card">
            <div className="card-title">⭐ FINALIZAR TREINO</div>
            <div className="form-group">
              <label className="form-label">Avalie o treino (opcional)</label>
              <div className="stars">{[1,2,3,4,5].map(s=><div key={s} style={{fontSize:"2rem",cursor:"pointer",color:s<=rating?"var(--orange)":"var(--border)"}} onClick={()=>setRating(s)}>★</div>)}</div>
            </div>
            <div className="form-group"><label className="form-label">Feedback para o treinador (opcional)</label><textarea className="form-textarea" rows={2} placeholder="Como foi? Alguma dificuldade?" value={feedback} onChange={e=>setFeedback(e.target.value)}/></div>
            {!confirmandoFinalizar?(
              <button className="btn btn-primary btn-full" onClick={()=>{
                const feitos=(diaInfo?.exercicios||[]).filter((_,j)=>checked[`${diaAtivo}_${j}`]).length;
                const total=(diaInfo?.exercicios||[]).length;
                if(total>0&&feitos<total){setConfirmandoFinalizar(true);}
                else{finalizarTreino(diaAtivo,diaInfo,checked);}
              }}>🏁 Finalizar treino</button>
            ):(
              <div style={{background:"var(--card2)",borderRadius:"var(--radius)",padding:"1rem",marginTop:"0.5rem"}}>
                <div style={{fontWeight:600,marginBottom:"0.3rem"}}>⚠️ {(diaInfo?.exercicios||[]).filter((_,j)=>checked[`${diaAtivo}_${j}`]).length} de {(diaInfo?.exercicios||[]).length} exercícios concluídos</div>
                <div style={{fontSize:"0.85rem",color:"var(--text2)",marginBottom:"0.75rem"}}>Deseja finalizar mesmo assim?</div>
                <div style={{display:"flex",gap:"0.5rem"}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setConfirmandoFinalizar(false)}>Continuar</button>
                  <button className="btn btn-primary btn-sm" onClick={()=>finalizarTreino(diaAtivo,diaInfo,checked)}>Finalizar assim mesmo</button>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

// ============================================================
// ALUNO — ALIMENTAÇÃO (checkbox)
// ============================================================
function AlunoAlimentacao({user,showToast}){
  const [planoAlim,setPlanoAlim]=useState(undefined);
  const [planoAlimReady,setPlanoAlimReady]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    DB.getData("plano_alim_aluno",user.id).then(d=>{
      if(!cancelled){setPlanoAlim(d);setPlanoAlimReady(true);}
    }).catch(()=>{
      if(!cancelled){setPlanoAlim(null);setPlanoAlimReady(true);}
    });
    const timeout=setTimeout(()=>{if(!cancelled){setPlanoAlimReady(true);}},5000);
    return()=>{cancelled=true;clearTimeout(timeout);};
  },[user.id]);
  const [comido,,saveComido]=useAlunoData(user.id,"alim_check_hoje",{});
  const [obs,setObs]=useState("");
  useEffect(()=>{let c=false;DB.getData("alim_obs_hoje",user.id).then(d=>{if(!c&&d)setObs(d);}).catch(()=>{});return()=>{c=true;};},[user.id]);


  async function toggleRefeicao(i){
    try{
      const novo={...(comido||{}),[i]:!(comido||{})[i]};
      await saveComido(novo);
    }catch(e){showToast&&showToast("Erro ao salvar.","warn");}
  }
  async function salvarObs(){
    await DB.setData("alim_obs_hoje",user.id,obs);
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
        {(refeicoes||[]).map((r,i)=>(
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
  const [ml, , saveMl] = useAlunoData(user.id, "agua_hoje", 0);
  const [meta, , saveMeta] = useAlunoData(user.id, "meta_agua", 3000);
  const [novaMeta,setNovaMeta]=useState(meta||3000);
  const pct=Math.min(((ml||0)/(meta||3000))*100,100);
  async function add(q){
    const n=Math.min((ml||0)+q,9999);
    await saveMl(n);
    if(n>=(meta||3000)&&(ml||0)<(meta||3000))showToast&&showToast("🎉 Meta de hidratação atingida!");
  }
  async function salvarMeta(){
    const n=Math.max(Number(novaMeta)||3000,500);
    setNovaMeta(n);
    await saveMeta(n);
    showToast&&showToast(`Meta atualizada: ${(n/1000).toFixed(1)}L por dia`);
  }
  const hist=DB.getData&&[]; // hist via Supabase (future)
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
  const [sData,sReady]=useAsyncData(()=>DB.getData("saude",user.id),[user.id]);
  const s=sData||{};
  const [doente,setDoente]=useState(false);
  useEffect(()=>{ if(sReady&&sData){setDoente(sData.doente||false);setSintomas(sData.sintomas||"");setDoenteDe(sData.doente_desde||null);setMens(sData.mens||false);setMeds(sData.meds||"");setObs(sData.obs||"");setDores(sData.dores||[]);}},[sReady]);
  const [sintomas,setSintomas]=useState("");
  const [doenteDe,setDoenteDe]=useState(null);
  const [mens,setMens]=useState(false);
  const [meds,setMeds]=useState("");
  const [obs,setObs]=useState("");
  const [dores,setDores]=useState([]);
  const [musculoSel,setMusculoSel]=useState([]);
  async function salvar(ov={}){await DB.setData("saude",user.id,{doente,sintomas,doente_desde:doenteDe,mens,meds,obs,dores,...ov});showToast&&showToast("✅ Saúde atualizada!");}
  function marcarDoente(){const agora=new Date().toISOString();setDoente(true);setDoenteDe(agora);salvar({doente:true,doente_desde:agora});}
  function marcarRecuperado(){setDoente(false);setDoenteDe(null);setSintomas("");salvar({doente:false,doente_desde:null,sintomas:""});showToast&&showToast("Ótimo! Recuperação registrada! 💪");}
  function adicionarDor(){if(!musculoSel.length)return;const agora=new Date().toISOString();const novas=[...dores,...musculoSel.filter(m=>!dores.find(d=>d.musculo===m)).map(m=>({musculo:m,desde:agora,intensidade:5}))];setDores(novas);setMusculoSel([]);salvar({dores:novas});}
  function removerDor(idx){const novas=dores.filter((_,i)=>i!==idx);setDores(novas);salvar({dores:novas});}
  return(
    <div className="page">
      <div className="page-title green">SAÚDE</div>
      <div className="page-sub">Treinador e nutricionista verão estas informações</div>
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
        {(dores||[]).length>0&&<div style={{marginBottom:"1rem"}}>{(dores||[]).map((d,i)=>(
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
  const [f,setF]=useState({});
  const [hist,setHist]=useState([]);
  useEffect(()=>{
    let c=false;
    DB.getData("avaliacao",user.id).then(d=>{if(!c&&d)setF(d);}).catch(()=>{});
    DB.getData("avaliacao_hist",user.id).then(d=>{if(!c&&d)setHist(d);}).catch(()=>{});
    return()=>{c=true;};
  },[user.id]);
  async function set(k,v){setF(p=>({...p,[k]:v}));}
  async function salvar(){
    await DB.setData("avaliacao",user.id,f);
    const hist=(await DB.getData("avaliacao_hist",user.id))||[];
    if(f.peso){
      const entry={peso:f.peso,gordura:f.gordura,data:new Date().toISOString()};
      await DB.setData("avaliacao_hist",user.id,[...hist.slice(-11),entry]);
    }
    showToast&&showToast("Avaliação física salva! ✅");
  }
  const imc=calcIMC(f.peso,f.altura);
  return(
    <div className="page">
      <div className="page-header">
        <div className="page-title green">AVALIAÇÃO FÍSICA</div>
        <div className="page-sub">Visível para treinador e nutricionista</div>
      </div>
      {imc&&(
        <div className="card">
          <div className="card-title">📊 IMC Calculado</div>
          <div className="grid-2" style={{marginBottom:0}}>
            <div className="stat-tile"><div className="stat-label">IMC</div><div className="stat-value green">{imc.val}</div><div className="stat-sub">{imc.cat}</div></div>
            <div className="stat-tile"><div className="stat-label">Peso / Altura</div><div style={{marginTop:"0.4rem",fontWeight:700}}>{f.peso||"—"}kg / {f.altura||"—"}cm</div></div>
          </div>
        </div>
      )}
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
      {hist.length>1&&(
        <div className="card">
          <div className="card-title">📈 EVOLUÇÃO</div>
          {hist.some(h=>h.peso)&&(()=>{
            const pts=hist.filter(h=>h.peso);
            const pesos=pts.map(h=>parseFloat(h.peso));
            const minP=Math.min(...pesos)-2;
            const maxP=Math.max(...pesos)+2;
            const w=300,hh=80;
            const xp=(i)=>20+(i/(pts.length-1||1))*(w-40);
            const yp=(v)=>hh-10-((v-minP)/(maxP-minP||1))*(hh-20);
            const pathP=pts.map((p,i)=>`${i===0?"M":"L"}${xp(i).toFixed(1)},${yp(parseFloat(p.peso)).toFixed(1)}`).join(" ");
            const last=pesos[pesos.length-1];const first=pesos[0];
            const diff=(last-first).toFixed(1);
            return(
              <div>
                <div style={{display:"flex",gap:"0.75rem",marginBottom:"0.75rem",flexWrap:"wrap"}}>
                  <div className="stat-tile" style={{flex:1}}><div className="stat-label">Peso atual</div><div className="stat-val" style={{color:"var(--green)"}}>{last}kg</div></div>
                  <div className="stat-tile" style={{flex:1}}><div className="stat-label">Variação</div><div className="stat-val" style={{color:parseFloat(diff)<0?"var(--green)":parseFloat(diff)>0?"var(--orange)":"var(--text)"}}>{parseFloat(diff)>0?"+":""}{diff}kg</div></div>
                  <div className="stat-tile" style={{flex:1}}><div className="stat-label">Registros</div><div className="stat-val">{pts.length}</div></div>
                </div>
                <svg viewBox={`0 0 ${w} ${hh}`} style={{width:"100%",height:"80px"}}>
                  <defs><linearGradient id="pesoGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--green)" stopOpacity="0.3"/><stop offset="100%" stopColor="var(--green)" stopOpacity="0"/></linearGradient></defs>
                  <path d={`${pathP} L${xp(pts.length-1).toFixed(1)},${hh} L20,${hh} Z`} fill="url(#pesoGrad)"/>
                  <path d={pathP} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  {pts.map((p,i)=>(<g key={i}><circle cx={xp(i)} cy={yp(parseFloat(p.peso))} r="3" fill="var(--green)"/>{(i===0||i===pts.length-1)&&<text x={xp(i)} y={yp(parseFloat(p.peso))-7} textAnchor="middle" fontSize="9" fill="var(--text2)">{p.peso}kg</text>}</g>))}
                </svg>
                <div style={{fontSize:"0.72rem",color:"var(--text2)",textAlign:"center",marginTop:"2px"}}>{new Date(pts[0].data).toLocaleDateString("pt-BR")} → {new Date(pts[pts.length-1].data).toLocaleDateString("pt-BR")}</div>
              </div>
            );
          })()}
          {hist.some(h=>h.gordura)&&(()=>{
            const pts2=hist.filter(h=>h.gordura);
            const vals=pts2.map(h=>parseFloat(h.gordura));
            const minG=Math.min(...vals)-2;const maxG=Math.max(...vals)+2;
            const w=300,hh2=60;
            const xg=(i)=>20+(i/(pts2.length-1||1))*(w-40);
            const yg=(v)=>hh2-8-((v-minG)/(maxG-minG||1))*(hh2-16);
            const pathG=pts2.map((p,i)=>`${i===0?"M":"L"}${xg(i).toFixed(1)},${yg(parseFloat(p.gordura)).toFixed(1)}`).join(" ");
            return(
              <div style={{marginTop:"1rem"}}>
                <div style={{fontSize:"0.8rem",color:"var(--text2)",marginBottom:"4px",fontWeight:500}}>% Gordura corporal</div>
                <svg viewBox={`0 0 ${w} ${hh2}`} style={{width:"100%",height:"60px"}}>
                  <path d={pathG} fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  {pts2.map((p,i)=>(<g key={i}><circle cx={xg(i)} cy={yg(parseFloat(p.gordura))} r="3" fill="var(--orange)"/>{(i===0||i===pts2.length-1)&&<text x={xg(i)} y={yg(parseFloat(p.gordura))-7} textAnchor="middle" fontSize="9" fill="var(--text2)">{p.gordura}%</text>}</g>))}
                </svg>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function AlunoCompeticoes({user,showToast}){
  const [comps,setComps]=useState([]);
  useEffect(()=>{let c=false;DB.getData("competicoes",user.id).then(d=>{if(!c&&d)setComps(d);}).catch(()=>{});return()=>{c=true;};},[user.id]);
  const [f,setF]=useState({nome:"",modalidade:"Corrida",data:"",local:"",objetivo:"Completar"});
  async function set(k,v){setF(p=>({...p,[k]:v}));}
  async function add(){
    if(!f.nome||!f.data){return;}
    const novo=[...comps,{...f,id:Date.now()}];
    setComps(novo);await DB.setData("competicoes",user.id,novo);
    setF({nome:"",modalidade:"Corrida",data:"",local:"",objetivo:"Completar"});
    showToast&&showToast("Competição cadastrada! 🏆");
  }
  async function remover(id){const n=comps.filter(c=>c.id!==id);setComps(n);await DB.setData("competicoes",user.id,n);}
  return(
    <div className="page">
      <div className="page-header">
        <div className="page-title green">COMPETIÇÕES</div>
        <div className="page-sub">Visível para treinador e nutricionista</div>
      </div>
      {(comps||[]).length>0&&<div className="card"><div className="card-title">📅 MEUS EVENTOS</div>{(comps||[]).map((c,i)=>{const d=new Date(c.data);return(<div key={i} className="comp-card" style={{background:"var(--bg2)"}}><div className="comp-date"><div className="comp-date-day">{d.getDate()}</div><div className="comp-date-month">{d.toLocaleDateString("pt-BR",{month:"short"})}</div></div><div style={{flex:1}}><div style={{fontWeight:600}}>{c.nome}</div><div style={{fontSize:"0.8rem",color:"var(--text2)"}}>{c.modalidade} • {c.local}</div></div><span className="tag tag-orange">{c.objetivo.toUpperCase()}</span></div>);})}</div>}
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
function AlunoDash({user,setPage,vinculo:vinculoProp,treinador:treinadorProp,nutri:nutriProp}){
  const [vinculo,,]=useAsyncData(()=>DB.getVinculoAluno(user.id),[user.id],{});
  const [treinador,,]=useAsyncData(()=>vinculo?.treinadorId?DB.getUserById(vinculo.treinadorId):Promise.resolve(null),[vinculo?.treinadorId],null);
  const [nutri,,]=useAsyncData(()=>vinculo?.nutriId?DB.getUserById(vinculo.nutriId):Promise.resolve(null),[vinculo?.nutriId],null);
  const [agua,,]=useAlunoData(user.id,"agua_hoje",0);
  const [meta,,]=useAlunoData(user.id,"meta_agua",3000);
  const [saude,,]=useAlunoData(user.id,"saude",{});
  const [planoTreino,,]=useAlunoData(user.id,"plano_treino_aluno",null);
  const [avalDash,,]=useAlunoData(user.id,"avaliacao",{});
  const pct=Math.min(Math.round(((agua||0)/Math.max(meta||3000,1))*100),100);
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
          {(()=>{const imc=calcIMC(avalDash.peso,avalDash.altura);return(<><div className="stat-value green">{avalDash.peso||"—"}<span className="stat-unit">{avalDash.peso?" kg":""}</span></div>{imc&&<div className="stat-sub">IMC {imc.val} — {imc.cat}</div>}</>);})()}
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
  const {confirm,Modal:ConfirmModalEl}=useConfirm();
  const [alunos,]=useAsyncData(()=>DB.getAlunosDe(user.id),[user.id],[]);
  const [alunoSel,setAlunoSel]=useState(null);
  const [nomePlano,setNomePlano]=useState("Treino A/B/C");
  const [modalidade,setModalidade]=useState("musculacao");
  const [duracao,setDuracao]=useState(1);
  const [inicio,setInicio]=useState(()=>new Date().toISOString().split("T")[0]);
  const [dias,setDias]=useState(()=>DIAS_SEMANA.map((_,i)=>({nome:`Treino ${String.fromCharCode(65+i)}`,tipo:i<5?"academia":"descanso",obs:"",exercicios:[],distancia:"",ritmo:"",zona:"",duracaoTotal:"",rounds:"",tempoRound:"",foco:"",modalidadeLuta:""})));
  const [diaEdit,setDiaEdit]=useState(0);
  const [novoEx,setNovoEx]=useState({nome:"",series:"",reps:"",carga:"",duracao:""});
  const [salvandoRascunho,setSalvandoRascunho]=useState(false);
  // Auto-save rascunho a cada 30s quando tem aluno selecionado
  useEffect(()=>{
    if(!alunoSel)return;
    const t=setTimeout(async()=>{
      setSalvandoRascunho(true);
      await DB.setData("rascunho_treino",user.id,{alunoId:alunoSel.id,nomePlano,modalidade,duracao,inicio,dias,savedAt:new Date().toISOString()});
      setSalvandoRascunho(false);
    },30000);
    return()=>clearTimeout(t);
  },[dias,nomePlano,modalidade,alunoSel]);
  function setDiaTipo(i,tipo){setDias(p=>{const n=[...p];n[i]={...n[i],tipo};return n;});}
  function setDiaNome(i,nome){setDias(p=>{const n=[...p];n[i]={...n[i],nome};return n;});}
  function setDiaObs(i,obs){setDias(p=>{const n=[...p];n[i]={...n[i],obs};return n;});}
  function addEx(diaIdx){
    if(!novoEx.nome.trim())return;
    setDias(p=>{const n=[...p];n[diaIdx]={...n[diaIdx],exercicios:[...(n[diaIdx].exercicios||[]),{...novoEx}]};return n;});
    setNovoEx({nome:"",series:"",reps:"",carga:"",duracao:""});
  }
  async function removeEx(diaIdx,exIdx){setDias(p=>{const n=[...p];n[diaIdx]={...n[diaIdx],exercicios:n[diaIdx].exercicios.filter((_,i)=>i!==exIdx)};return n;});}

  async function salvar(){
    if(!alunoSel){showToast&&showToast("Selecione um aluno primeiro","warn");return;}
    const planoExistente=await DB.getData("plano_treino_aluno",alunoSel.id);
    if(planoExistente){const ok=await confirm(`Substituir o treino de ${alunoSel.nome.split(" ")[0]}? O plano atual será perdido.`);if(!ok)return;}
    const fimDate=addMonths(new Date(inicio),duracao);
    const plano={nome:nomePlano,modalidade,duracao,inicio,fim:fimDate.toISOString(),dias,criadoEm:new Date().toISOString()};
    await DB.setData("plano_treino_aluno",alunoSel.id,plano);
    showToast&&showToast(`✅ Treino prescrito para ${alunoSel.nome.split(" ")[0]}! O aluno já pode ver no app.`);
    
  }

  const diaAtual=dias[diaEdit]||{exercicios:[]};

  return(
    <>{ConfirmModalEl}
    <div className="page">
      <div className="page-title orange">PRESCREVER TREINO</div>
      <div className="page-sub">Monte a semana completa de treinos para um aluno</div>
      {alunos.length===0&&<div className="alert alert-warn">⚠️ Nenhum aluno vinculado. Código: <b style={{fontFamily:"var(--font-mono)"}}>{user.codigo||"------"}</b></div>}

      {/* SELECIONAR ALUNO */}
      <div className="card">
        <div className="card-title">👤 SELECIONAR ALUNO</div>
        <AlunoSelector alunos={alunos||[]} selecionado={alunoSel} onSelect={setAlunoSel} accentClass="sel-orange"/>
        {(alunos||[]).length===0&&<div style={{color:"var(--text3)",fontSize:"0.85rem",padding:"0.5rem 0"}}>⏳ Nenhum aluno vinculado ainda. Compartilhe seu código com seus alunos para que eles se conectem.</div>}
        {!alunoSel&&(alunos||[]).length>0&&<div style={{color:"var(--text3)",fontSize:"0.85rem"}}>Selecione um aluno acima para montar o plano.</div>}
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
                      {(diaAtual?.exercicios||[]).map((ex,j)=>(
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
    </>
  );
}

// ============================================================
// TREINADOR — DASHBOARD + ACOMPANHAMENTO
// ============================================================

// Resumo semanal (visão de acompanhamento)
function ResumoSemanalAluno({aluno,onVerCompleto}){
  const [saude]=useAlunoData(aluno.id,"saude",{});
  const [agua]=useAlunoData(aluno.id,"agua_hoje",0);
  const [meta]=useAlunoData(aluno.id,"meta_agua",3000);
  const [planoTreino]=useAlunoData(aluno.id,"plano_treino_aluno",null);
  const [av]=useAlunoData(aluno.id,"treino_avaliacao",{});
  const diasDoente=saude.doente_desde?diffDays(saude.doente_desde):0;

  // Contar dias de treino feitos (baseado no check)
  const [check]=useAlunoData(aluno.id,"treino_check_hoje",{});
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
            {(planoTreino?.dias||[]).map((d,i)=>{
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
  const [saude]=useAlunoData(aluno.id,"saude",{});
  const [treino]=useAlunoData(aluno.id,"treino_avaliacao",{});
  const [alimCheck]=useAlunoData(aluno.id,"alim_check_hoje",{});
  const [planoAlim]=useAlunoData(aluno.id,"plano_alim_aluno",null);
  const [agua]=useAlunoData(aluno.id,"agua_hoje",0);
  const [metaAgua]=useAlunoData(aluno.id,"meta_agua",3000);
  const [aval]=useAlunoData(aluno.id,"avaliacao",{});
  const [comps]=useAlunoData(aluno.id,"competicoes",[]);
  const [planoTreino]=useAlunoData(aluno.id,"plano_treino_aluno",null);
  const refeicoes=(planoAlim?.refeicoes)||[];
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
            {(planoTreino?.dias||[]).map((d,i)=>(
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
            {(saude?.dores||[]).length>0&&<div style={{fontSize:"0.8rem",color:"var(--text2)",marginTop:"0.25rem"}}>{saude.dores.map(d=>`${d.musculo} (${diffDays(d.desde)}d)`).join(", ")}</div>}
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
          {(refeicoes||[]).map((r,i)=>(
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
          {(comps||[]).map((c,i)=>{const d=new Date(c.data);return(<div key={i} className="comp-card" style={{background:"var(--bg2)"}}><div className="comp-date"><div className="comp-date-day">{d.getDate()}</div><div className="comp-date-month">{d.toLocaleDateString("pt-BR",{month:"short"})}</div></div><div style={{flex:1}}><div style={{fontWeight:600}}>{c.nome}</div><div style={{fontSize:"0.8rem",color:"var(--text2)"}}>{c.modalidade}</div></div><span className="tag tag-orange">{c.objetivo}</span></div>);})}
        </div>
      )}
    </div>
  );
}
function TreinadorDash({user}){
  const [alunos,alunosReady]=useAsyncData(()=>DB.getAlunosDe(user.id),[user.id],[]);
  const [alunoVer,setAlunoVer]=useState(null);
  const [saudeMap,setSaudeMap]=useState({});
  const [planoMap,setPlanoMap]=useState({});
  const alunosList=Array.isArray(alunos)?alunos:[];
  useEffect(()=>{
    if(!alunosList.length)return;
    let c2=false;
    Promise.all(alunosList.map(a=>
      Promise.all([DB.getData("saude",a.id),DB.getData("plano_treino_aluno",a.id)])
        .then(([s,pl])=>({id:a.id,s:s||{},pl}))
    )).then(results=>{
      const sm={},pm={};
      results.forEach(({id,s,pl})=>{sm[id]=s;pm[id]=pl;});
      setSaudeMap(sm);setPlanoMap(pm);
    });
  },[alunos?.length]);
  const comAlerta=alunosList.filter(a=>{const s=saudeMap[a.id]||{};return s.doente||(s.dores&&s.dores.length>0);});
  if(alunoVer)return<DiarioAluno aluno={alunoVer} onBack={()=>setAlunoVer(null)}/>;
  return(
    <div className="page">
      <div className="page-title orange">{getGreeting()}, {firstName(user.nome)} 👋</div>
      <div className="page-sub">{getDateStr()}</div>
      <div className="card" style={{padding:"1rem 1.5rem"}}><CodigoProfissional user={user}/></div>
      <div className="grid-4">
        <div className="stat-tile"><div className="stat-label">Alunos</div><div className="stat-value orange">{alunos.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Alertas</div><div className="stat-value red">{comAlerta.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Código</div><div style={{marginTop:"0.35rem",fontFamily:"var(--font-mono)",fontSize:"1.1rem",color:"var(--green)",letterSpacing:"0.1em"}}>{user.codigo||"------"}</div></div>
        <div className="stat-tile"><div className="stat-label">Planos ativos</div><div className="stat-value green">{Object.values(planoMap||{}).filter(Boolean).length}</div></div>
      </div>
      {comAlerta.length>0&&<div className="alert alert-danger">🔴 {comAlerta.map(a=>a.nome.split(" ")[0]).join(", ")} — verificar saúde!</div>}
      {alunosList.length===0?(
        <div className="card"><div className="card-title">👥 MEUS ALUNOS</div><div style={{color:"var(--text2)",fontSize:"0.9rem",lineHeight:1.7}}>Compartilhe seu código <b style={{color:"var(--green)",fontFamily:"var(--font-mono)"}}>{user.codigo||"------"}</b> para seus alunos se conectarem.</div></div>
      ):(
        <div className="card">
          <div className="card-title">👥 MEUS ALUNOS</div>
          {(alunosList||[]).map(a=>{
            const s=saudeMap[a.id]||{};
            const plano=planoMap?.[a.id];
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
  const [alunos,]=useAsyncData(()=>DB.getAlunosDe(user.id),[user.id],[]);
  const [alunoVer,setAlunoVer]=useState(null);
  const alunosList=Array.isArray(alunos)?alunos:[];
  if(alunoVer)return<DiarioAluno aluno={alunoVer} onBack={()=>setAlunoVer(null)}/>;
  if(!alunos&&alunosList.length===0)return<div className="page"><div className="page-title orange">ACOMPANHAMENTO</div><div style={{display:"flex",justifyContent:"center",padding:"3rem"}}><span className="spinner"/></div></div>;
  return(
    <div className="page">
      <div className="page-title orange">ACOMPANHAMENTO</div>
      <div className="page-sub">Resumo semanal — clique para ver o relatório completo do mês</div>
      {alunos.length===0?(
        <div className="card"><div style={{color:"var(--text2)"}}>Nenhum aluno vinculado. Código: <b style={{fontFamily:"var(--font-mono)",color:"var(--green)"}}>{user.codigo||"------"}</b></div></div>
      ):(alunosList||[]).map(a=>(
        <ResumoSemanalAluno key={a.id} aluno={a} onVerCompleto={()=>setAlunoVer(a)}/>
      ))}
    </div>
  );
}

// ============================================================
// NUTRICIONISTA — PRESCREVER PLANO ALIMENTAR
// ============================================================
function NutriPrescrever({user,showToast}){
  const {confirm,Modal:ConfirmModalNutri}=useConfirm();
  const [alunos,]=useAsyncData(()=>DB.getAlunosDe(user.id),[user.id],[]);
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
  const fases={normal:2330,carga:3100,cutting:1800,peak:2000};
  const totalKcal=refeicoes.reduce((s,r)=>s+Number(r.k),0);

  function updateRef(i,campo,val){setRefeicoes(p=>{const n=[...p];n[i]={...n[i],[campo]:campo==="k"?Number(val):val};return n;});}
  function removeRef(i){setRefeicoes(p=>p.filter((_,j)=>j!==i));}
  async function addRef(){setRefeicoes(p=>[...p,{h:"",r:"Nova refeição",i:"",k:0}]);}

  async function salvar(){
    if(!alunoSel)return;
    const planoExistente=await DB.getData("plano_alim_aluno",alunoSel.id);
    if(planoExistente){const ok=await confirm(`Substituir a dieta de ${alunoSel.nome.split(" ")[0]}? O plano atual será perdido.`);if(!ok)return;}
    const fimDate=addMonths(new Date(inicio),duracao);
    const plano={nome:nomePlano,protocolo,duracao,inicio,fim:fimDate.toISOString(),refeicoes,kcalMeta:fases[protocolo],criadoEm:new Date().toISOString()};
    await DB.setData("plano_alim_aluno",alunoSel.id,plano);
    showToast&&showToast(`✅ Plano alimentar enviado para ${alunoSel.nome.split(" ")[0]}!`);
  }

  return(
    <div className="page">
      <div className="page-title blue">PLANO ALIMENTAR</div>
      <div className="page-sub">Monte e atribua planos alimentares com período de validade</div>
      {alunos.length===0&&<div className="alert alert-warn">⚠️ Sem pacientes vinculados. Código: <b style={{fontFamily:"var(--font-mono)"}}>{user.codigo||"------"}</b></div>}

      {/* SELECIONAR PACIENTE */}
      <div className="card">
        <div className="card-title">👤 SELECIONAR PACIENTE</div>
        <AlunoSelector alunos={alunos||[]} selecionado={alunoSel} onSelect={setAlunoSel} accentClass="sel-blue"/>
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
            {(refeicoes||[]).map((r,i)=>(
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
  const [pacientes,]=useAsyncData(()=>DB.getAlunosDe(user.id),[user.id],[]);
  const [pacVer,setPacVer]=useState(null);
  const [saudeMapN,setSaudeMapN]=useState({});
  const [planoMapN,setPlanoMapN]=useState({});
  const [checkMapN,setCheckMapN]=useState({});
  const pacientesList=Array.isArray(pacientes)?pacientes:[];
  useEffect(()=>{
    if(!pacientesList.length)return;
    Promise.all(pacientesList.map(p=>
      Promise.all([
        DB.getData("saude",p.id),
        DB.getData("plano_alim_aluno",p.id),
        DB.getData("alim_check_hoje",p.id)
      ]).then(([s,pl,ch])=>({id:p.id,s:s||{},pl,ch:ch||{}}))
    )).then(results=>{
      const sm={},pm={},cm={};
      results.forEach(({id,s,pl,ch})=>{sm[id]=s;pm[id]=pl;cm[id]=ch;});
      setSaudeMapN(sm);setPlanoMapN(pm);setCheckMapN(cm);
    });
  },[pacientes?.length]);
  if(pacVer)return<DiarioAluno aluno={pacVer} onBack={()=>setPacVer(null)}/>;
  if(pacientes===null)return<div className="page"><div className="page-title blue">{getGreeting()}, {firstName(user.nome)} 👋</div><div style={{display:"flex",justifyContent:"center",padding:"3rem"}}><span className="spinner"/></div></div>;
  return(
    <div className="page">
      <div className="page-title blue">{getGreeting()}, {firstName(user.nome)} 👋</div>
      <div className="page-sub">{getDateStr()}</div>
      <div className="card" style={{padding:"1rem 1.5rem"}}><CodigoProfissional user={user}/></div>
      <div className="grid-4">
        <div className="stat-tile"><div className="stat-label">Pacientes</div><div className="stat-value blue">{pacientesList.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Planos ativos</div><div className="stat-value green">{Object.values(planoMapN||{}).filter(Boolean).length}</div></div>
        <div className="stat-tile"><div className="stat-label">Sem plano</div><div className="stat-value orange">{pacientesList.length-Object.values(planoMapN||{}).filter(Boolean).length}</div></div>
        <div className="stat-tile"><div className="stat-label">Código</div><div style={{marginTop:"0.35rem",fontFamily:"var(--font-mono)",fontSize:"1.1rem",color:"var(--green)",letterSpacing:"0.1em"}}>{user.codigo||"------"}</div></div>
        <div className="stat-tile"><div className="stat-label">Alertas</div><div className="stat-value orange">{Object.values(saudeMapN).filter(s=>s.doente||s.mens).length}</div></div>
      </div>
      {pacientesList.length===0?(
        <div className="card"><div className="card-title">👥 MEUS PACIENTES</div><div style={{color:"var(--text2)",lineHeight:1.7}}>Compartilhe o código <b style={{color:"var(--green)",fontFamily:"var(--font-mono)"}}>{user.codigo||"------"}</b> para seus pacientes se conectarem.</div></div>
      ):(
        <div className="card">
          <div className="card-title">👥 MEUS PACIENTES</div>
          {(pacientesList||[]).map(p=>{
            const s=saudeMapN[p.id]||{};
            const plano=planoMapN[p.id];
            const alimCheck=checkMapN[p.id]||{};
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
  const [pacientes,]=useAsyncData(()=>DB.getAlunosDe(user.id),[user.id],[]);
  const [pacVer,setPacVer]=useState(null);
  const [saudeMapNA,setSaudeMapNA]=useState({});
  const [planoMapNA,setPlanoMapNA]=useState({});
  const [checkMapNA,setCheckMapNA]=useState({});
  const [aguaMapNA,setAguaMapNA]=useState({});
  const [metaMapNA,setMetaMapNA]=useState({});
  const pacientesList=Array.isArray(pacientes)?pacientes:[];
  useEffect(()=>{
    if(!pacientesList.length)return;
    Promise.all(pacientesList.map(p=>
      Promise.all([
        DB.getData("saude",p.id),
        DB.getData("plano_alim_aluno",p.id),
        DB.getData("alim_check_hoje",p.id),
        DB.getData("agua_hoje",p.id),
        DB.getData("meta_agua",p.id),
        DB.getData("avaliacao",p.id),
        DB.getData("avaliacao_hist",p.id)
      ]).then(([s,pl,ch,ag,mt,av,avh])=>({id:p.id,s:s||{},pl,ch:ch||{},ag:ag||0,mt:mt||3000,av:av||{},avh:avh||[]}))
    )).then(results=>{
      const sm={},pm={},cm={},am={},mm={},avm={},avhm={};
      results.forEach(({id,s,pl,ch,ag,mt})=>{sm[id]=s;pm[id]=pl;cm[id]=ch;am[id]=ag;mm[id]=mt;avm[id]=av;avhm[id]=avh;});
      setSaudeMapNA(sm);setPlanoMapNA(pm);setCheckMapNA(cm);setAguaMapNA(am);setMetaMapNA(mm);
    });
  },[pacientes?.length]);
  if(pacVer)return<DiarioAluno aluno={pacVer} onBack={()=>setPacVer(null)}/>;
  if(!pacientes&&pacientesList.length===0)return<div className="page"><div className="page-title blue">ACOMPANHAMENTO</div><div style={{display:"flex",justifyContent:"center",padding:"3rem"}}><span className="spinner"/></div></div>;
  return(
    <div className="page">
      <div className="page-title blue">ACOMPANHAMENTO</div>
      <div className="page-sub">Alimentação e saúde dos pacientes</div>
      {pacientes.length===0?<div className="card"><div style={{color:"var(--text2)"}}>Sem pacientes. Código: <b style={{fontFamily:"var(--font-mono)",color:"var(--green)"}}>{user.codigo||"------"}</b></div></div>:(pacientesList||[]).map(p=>{
        const s=saudeMapNA[p.id]||{};
        const alimCheck=checkMapNA[p.id]||{};
        const plano=planoMapNA[p.id];
        const totalRef=plano?.refeicoes?.length||0;
        const qtdComido=Object.values(alimCheck).filter(Boolean).length;
        const agua=aguaMapNA[p.id]||0;
        const meta=metaMapNA[p.id]||3000;
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
  {section:"VISÃO GERAL",items:[{id:"dashboard",icon:"🏠",label:"Dashboard"},{id:"perfil",icon:"👤",label:"Meu Perfil"},{id:"chat",icon:"💬",label:"Chat"}]},
  {section:"DIÁRIO",items:[{id:"treinos",icon:"🏋️",label:"Treinos da Semana"},{id:"alimentacao",icon:"🥗",label:"Alimentação"},{id:"hidratacao",icon:"💧",label:"Hidratação"},{id:"saude",icon:"❤️",label:"Saúde"}]},
  {section:"PROGRESSO",items:[{id:"avaliacao",icon:"📊",label:"Avaliação Física"},{id:"competicoes",icon:"🏆",label:"Competições"}]},
  {section:"EQUIPE",items:[{id:"vinculo",icon:"🔗",label:"Minha Equipe"}]},
];
const NAV_TREINADOR=[
  {section:"VISÃO GERAL",items:[{id:"dashboard",icon:"🏠",label:"Dashboard"}]},
  {section:"ALUNOS",items:[{id:"cadastrar",icon:"➕",label:"Cadastrar Aluno"},{id:"acompanhamento",icon:"👁️",label:"Acompanhamento"},{id:"prescrever",icon:"📋",label:"Prescrever Treino"},{id:"chat",icon:"💬",label:"Chat"}]},
];
const NAV_NUTRI=[
  {section:"VISÃO GERAL",items:[{id:"dashboard",icon:"🏠",label:"Dashboard"}]},
  {section:"PACIENTES",items:[{id:"acompanhamento",icon:"👁️",label:"Acompanhamento"},{id:"prescrever",icon:"🥗",label:"Plano Alimentar"},{id:"chat",icon:"💬",label:"Chat"}]},
];

// ============================================================
// ROLE APPS
// ============================================================
// ============================================================
// ALUNO — MEU PERFIL
// ============================================================
function MeuPerfil({user,treinador,nutri,vinculo,onVinculoChange,showToast}){
  const {confirm,Modal:ConfirmModalPerfil}=useConfirm();
  const [editando,setEditando]=useState(false);
  const [form,setForm]=useState({nome:"",sobrenome:"",nascimento:"",telefone:"",email:"",localTreino:"",obs:""});
  const [salvando,setSalvando]=useState(false);
  const [emailEnviado,setEmailEnviado]=useState(false);

  useEffect(()=>{
    let c=false;
    // Carrega dados do próprio aluno
    DB.getData("perfil_aluno",user.id).then(d=>{
      if(c)return;
      if(d) setForm(p=>({...p,...d}));
      else setForm(p=>({...p,nome:user.nome||"",email:user.email||""}));
    });
    // Complementa com dados do cadastro do treinador se existir
    if(treinador?.id){
      DB.getData("alunos_cadastrados",treinador.id).then(lista=>{
        const enc=(lista||[]).find(a=>a.email?.toLowerCase()===user.email?.toLowerCase());
        if(enc) setForm(p=>({...p,...enc,nome:p.nome||enc.nome,email:p.email||enc.email}));
      });
    }
  },[user?.id,treinador?.id]);

  function set(k,v){setForm(p=>({...p,[k]:v}));}

  async function salvar(){
    setSalvando(true);
    await DB.setData("perfil_aluno",user.id,form);
    setSalvando(false);
    setEditando(false);
    showToast&&showToast("✅ Perfil atualizado!");
  }

  async function desvincularTreinador(){
    const okT=await confirm("Remover vínculo com "+treinador?.nome+"?");if(!okT)return;
    await DB.setVinculoAluno(user.id,null,vinculo?.nutriId||null);
    onVinculoChange&&await onVinculoChange();
    showToast&&showToast("Treinador desvinculado.","warn");
  }

  async function desvincularNutri(){
    const okN=await confirm("Remover vínculo com "+nutri?.nome+"?");if(!okN)return;
    await DB.setVinculoAluno(user.id,vinculo?.treinadorId||null,null);
    onVinculoChange&&await onVinculoChange();
    showToast&&showToast("Nutricionista desvinculada.","warn");
  }

  const idade=form.nascimento?Math.floor((new Date()-new Date(form.nascimento))/31557600000):null;

  return(
    <div className="page">
      <div className="page-title green">MEU PERFIL</div>
      <div className="page-sub">Seus dados pessoais e informações de treino</div>

      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <div className="card-title" style={{marginBottom:0}}>👤 DADOS PESSOAIS</div>
          {!editando&&<button className="btn btn-ghost btn-sm" onClick={()=>setEditando(true)}>✏️ Editar</button>}
        </div>

        {!editando?(
          <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
            {[
              ["Nome completo",`${form.nome} ${form.sobrenome}`.trim()||"—"],
              ["E-mail",form.email||user.email||"—"],
              ["Telefone",form.telefone||"—"],
              ["Data de nascimento",form.nascimento?`${new Date(form.nascimento+'T12:00').toLocaleDateString('pt-BR')} (${idade} anos)`:"—"],
              ["Local de treino",form.localTreino||"—"],
            ].map(([label,val])=>(
              <div key={label} style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                <span style={{fontSize:"0.8rem",color:"var(--text2)",minWidth:"140px"}}>{label}:</span>
                <span style={{fontSize:"0.85rem",fontWeight:500}}>{val}</span>
              </div>
            ))}
            {form.obs&&<div style={{marginTop:"0.5rem",padding:"0.6rem",background:"var(--card2)",borderRadius:"var(--radius)",fontSize:"0.82rem",color:"var(--text2)"}}>📝 {form.obs}</div>}
            {treinador&&(
              <div style={{marginTop:"0.75rem",padding:"0.6rem 0.75rem",background:"rgba(46,213,115,0.08)",borderRadius:"var(--radius)",fontSize:"0.82rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>🏋️ Treinador: <b>{treinador.nome}</b></span>
                <button className="btn btn-ghost btn-sm" style={{fontSize:"0.7rem",color:"var(--red)",padding:"2px 8px"}} onClick={desvincularTreinador}>Remover</button>
              </div>
            )}
            {nutri&&(
              <div style={{marginTop:"0.4rem",padding:"0.6rem 0.75rem",background:"rgba(52,152,219,0.08)",borderRadius:"var(--radius)",fontSize:"0.82rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>🥗 Nutricionista: <b>{nutri.nome}</b></span>
                <button className="btn btn-ghost btn-sm" style={{fontSize:"0.7rem",color:"var(--red)",padding:"2px 8px"}} onClick={desvincularNutri}>Remover</button>
              </div>
            )}
            {!treinador&&!nutri&&(
              <div style={{marginTop:"0.75rem",padding:"0.6rem",background:"var(--card2)",borderRadius:"var(--radius)",fontSize:"0.82rem",color:"var(--text2)"}}>
                Sem profissionais vinculados. Vá em <b>Minha Equipe</b> para vincular.
              </div>
            )}
          </div>
        ):(
          <>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Nome</label><input className="form-input" value={form.nome} onChange={e=>set("nome",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Sobrenome</label><input className="form-input" value={form.sobrenome} onChange={e=>set("sobrenome",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Data de Nascimento</label><input className="form-input" type="date" value={form.nascimento} onChange={e=>set("nascimento",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Telefone</label><input className="form-input" placeholder="(51) 99999-9999" value={form.telefone} onChange={e=>set("telefone",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">E-mail</label><input className="form-input" type="email" value={form.email} onChange={e=>set("email",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Local de treino</label><input className="form-input" value={form.localTreino} onChange={e=>set("localTreino",e.target.value)}/></div>
            </div>
            <div className="form-group"><label className="form-label">Observações</label><textarea className="form-textarea" rows={3} value={form.obs} onChange={e=>set("obs",e.target.value)}/></div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              <button className="btn btn-ghost btn-sm" onClick={()=>setEditando(false)}>Cancelar</button>
              <button className="btn btn-primary btn-sm" onClick={salvar} disabled={salvando}>{salvando?"Salvando...":"✅ Salvar"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CHAT — Treinador / Aluno / Nutri
// ============================================================
function ChatComponent({user,contato,showToast}){
  const [msgs,setMsgs]=useState([]);
  const [texto,setTexto]=useState("");
  const [enviando,setEnviando]=useState(false);
  const [lastSend,setLastSend]=useState(0);
  const endRef=useRef(null);

  useEffect(()=>{
    if(!contato?.id)return;
    let cancelled=false;
    // Carregar mensagens
    DB.getMensagens(user.id,contato.id).then(d=>{if(!cancelled)setMsgs(d||[]);});
    // Marcar como lidas
    DB.marcarLidas(user.id,contato.id).catch(()=>{});
    // Subscribe realtime
    const sub=DB.subscribeMensagens(user.id,(payload)=>{
      if(!cancelled)setMsgs(p=>[...p,payload.new]);
      DB.marcarLidas(user.id,contato.id).catch(()=>{});
    });
    return()=>{cancelled=true;sub?.unsubscribe?.();};
  },[user.id,contato?.id]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  async function enviar(){
    const now=Date.now();
    if(!texto.trim()||enviando)return;
    if(now-lastSend<2000){showToast&&showToast("Aguarde 2 segundos entre mensagens","warn");return;}
    setEnviando(true);
    try{
      const msg=await DB.enviarMensagem(user.id,contato.id,sanitize(texto.trim()));
      setMsgs(p=>[...p,msg]);
      setTexto("");
      setLastSend(Date.now());
    }catch(e){showToast&&showToast("Erro ao enviar mensagem","warn");}
    setEnviando(false);
  }

  if(!contato){
    return(
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",color:"var(--text2)",flexDirection:"column",gap:"0.5rem"}}>
        <div style={{fontSize:"2rem"}}>💬</div>
        <div>Sem contato vinculado para conversar</div>
      </div>
    );
  }

  return(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
      {/* Header */}
      <div style={{padding:"0.75rem 1rem",background:"var(--card)",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:"0.75rem",flexShrink:0}}>
        <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"var(--green)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:"0.9rem"}}>
          {contato.nome?.[0]?.toUpperCase()||"?"}
        </div>
        <div>
          <div style={{fontWeight:600,fontSize:"0.95rem"}}>{contato.nome}</div>
          <div style={{fontSize:"0.75rem",color:"var(--text2)"}}>{contato.role==="treinador"?"Personal Trainer":contato.role==="nutri"?"Nutricionista":"Aluno"}</div>
        </div>
      </div>
      {/* Mensagens */}
      <div style={{flex:1,overflowY:"auto",padding:"1rem",display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {msgs.length===0&&(
          <div style={{textAlign:"center",color:"var(--text2)",fontSize:"0.85rem",marginTop:"2rem"}}>
            Nenhuma mensagem ainda. Diga olá! 👋
          </div>
        )}
        {msgs.map((m,i)=>{
          const minha=m.de_id===user.id;
          return(
            <div key={m.id||i} style={{display:"flex",justifyContent:minha?"flex-end":"flex-start"}}>
              <div style={{
                maxWidth:"75%",padding:"0.5rem 0.75rem",borderRadius:minha?"12px 12px 2px 12px":"12px 12px 12px 2px",
                background:minha?"var(--green)":"var(--card2)",
                color:minha?"#fff":"var(--text)",
                fontSize:"0.9rem",lineHeight:1.4,
              }}>
                <div>{m.texto}</div>
                <div style={{fontSize:"0.68rem",opacity:0.7,marginTop:"2px",textAlign:"right"}}>
                  {fmtTime(m.criado_em)}
                  {minha&&<span style={{marginLeft:"4px"}}>{m.lida?"✓✓":"✓"}</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef}/>
      </div>
      {/* Input */}
      <div style={{padding:"0.75rem",background:"var(--card)",borderTop:"1px solid var(--border)",display:"flex",gap:"0.5rem",flexShrink:0}}>
        <input
          className="form-input"
          style={{flex:1}}
          placeholder="Digite uma mensagem..."
          value={texto}
          onChange={e=>setTexto(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&enviar()}
        />
        <button className="btn btn-primary btn-sm" onClick={enviar} disabled={enviando||!texto.trim()}>
          {enviando?"...":"Enviar"}
        </button>
      </div>
    </div>
  );
}

// Wrapper para aluno — usa treinador ou nutri como contato
function AlunoChat({user,treinador,nutri,showToast}){
  const [aba,setAba]=useState("treinador");
  const contato=aba==="treinador"?treinador:nutri;
  return(
    <div className="page" style={{padding:0}}>
      {(treinador||nutri)&&(
        <div style={{display:"flex",gap:"8px",padding:"0.75rem",background:"var(--bg)"}}>
          {treinador&&<button className={`btn btn-sm ${aba==="treinador"?"btn-primary":"btn-ghost"}`} onClick={()=>setAba("treinador")}>🏋️ Treinador</button>}
          {nutri&&<button className={`btn btn-sm ${aba==="nutri"?"btn-primary":"btn-ghost"}`} onClick={()=>setAba("nutri")}>🥗 Nutricionista</button>}
        </div>
      )}
      <ChatComponent user={user} contato={contato} showToast={showToast}/>
    </div>
  );
}

// Wrapper para treinador/nutri — escolhe aluno da lista
function ProfChat({user,showToast}){
  const [alunos,setAlunos]=useState([]);
  const [alunoSel,setAlunoSel]=useState(null);
  useEffect(()=>{
    let c=false;
    DB.getAlunosDe(user.id).then(d=>{if(!c)setAlunos(d||[]);}).catch(()=>{});
    return()=>{c=true;};
  },[user.id]);
  return(
    <div className="page" style={{padding:0}}>
      {!alunoSel?(
        <div style={{padding:"1rem"}}>
          <div className="page-title orange" style={{marginBottom:"1rem"}}>💬 CHAT</div>
          {alunos.length===0?(
            <div style={{color:"var(--text2)",textAlign:"center",padding:"2rem"}}>Nenhum aluno vinculado ainda.</div>
          ):(alunos.map(a=>(
            <div key={a.id} className="card" style={{cursor:"pointer",display:"flex",alignItems:"center",gap:"0.75rem"}} onClick={()=>setAlunoSel(a)}>
              <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"var(--orange)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,flexShrink:0}}>
                {a.nome?.[0]?.toUpperCase()||"?"}
              </div>
              <div>
                <div style={{fontWeight:600}}>{a.nome}</div>
                <div style={{fontSize:"0.8rem",color:"var(--text2)"}}>Toque para conversar</div>
              </div>
              <div style={{marginLeft:"auto",color:"var(--text3)"}}>›</div>
            </div>
          )))}
        </div>
      ):(
        <div>
          <button className="btn btn-ghost btn-sm" style={{margin:"0.5rem"}} onClick={()=>setAlunoSel(null)}>← Voltar</button>
          <ChatComponent user={user} contato={alunoSel} showToast={showToast}/>
        </div>
      )}
    </div>
  );
}

function AlunoApp({user,onLogout}){
  const {show,ToastEl}=useToast();
  const [page,setPage]=useState("dashboard");
  // Vínculo persistente — carrega do banco e mantém em estado
  // Carrega do sessionStorage imediatamente (persiste na aba, mesmo ao minimizar)
  const [vinculoApp,setVinculoApp]=useState(()=>{
    try{const c=localStorage.getItem("tfv_"+user.id);return c?JSON.parse(c):null;}catch{return null;}
  });
  const [treinadorApp,setTreinadorApp]=useState(()=>{
    try{const c=localStorage.getItem("tft_"+user.id);return c?JSON.parse(c):null;}catch{return null;}
  });
  const [nutriApp,setNutriApp]=useState(()=>{
    try{const c=localStorage.getItem("tfn_"+user.id);return c?JSON.parse(c):null;}catch{return null;}
  });
  const [msgsBadge,setMsgsBadge]=useState(0);
  useEffect(()=>{
    if(!user?.id)return;
    let cancelled=false;
    DB.getVinculoAluno(user.id).then(async v=>{
      if(cancelled)return;
      const vc=v||null;
      setVinculoApp(vc);
      try{localStorage.setItem("tfv_"+user.id,JSON.stringify(vc));}catch{}
      if(vc?.treinadorId){
        DB.getUserById(vc.treinadorId).then(t=>{
          if(cancelled)return;
          setTreinadorApp(t);
          try{localStorage.setItem("tft_"+user.id,JSON.stringify(t));}catch{}
        });
      } else {setTreinadorApp(null);try{localStorage.removeItem("tft_"+user.id);}catch{}}
      if(vc?.nutriId){
        DB.getUserById(vc.nutriId).then(n=>{
          if(cancelled)return;
          setNutriApp(n);
          try{localStorage.setItem("tfn_"+user.id,JSON.stringify(n));}catch{}
        });
      } else {setNutriApp(null);try{localStorage.removeItem("tfn_"+user.id);}catch{}}
    }).catch(()=>{});
    return()=>{cancelled=true;};
  },[user?.id]);
  // Badge de mensagens não lidas
  useEffect(()=>{
    if(!user?.id)return;
    const check=()=>DB.getMensagensNaoLidas(user.id).then(d=>setMsgsBadge(d.length)).catch(()=>{});
    check();
    const iv=setInterval(check,30000);
    return()=>clearInterval(iv);
  },[user?.id]);
  // Função para atualizar vínculo após vincular/desvincular
  const refreshVinculo=useCallback(async()=>{
    const v=await DB.getVinculoAluno(user.id).catch(()=>null);
    setVinculoApp(v);
    try{localStorage.setItem("tfv_"+user.id,JSON.stringify(v));}catch{}
    if(v?.treinadorId){
      const t=await DB.getUserById(v.treinadorId).catch(()=>null);
      setTreinadorApp(t);
      try{localStorage.setItem("tft_"+user.id,JSON.stringify(t));}catch{}
    } else {setTreinadorApp(null);try{localStorage.removeItem("tft_"+user.id);}catch{}}
    if(v?.nutriId){
      const n=await DB.getUserById(v.nutriId).catch(()=>null);
      setNutriApp(n);
      try{localStorage.setItem("tfn_"+user.id,JSON.stringify(n));}catch{}
    } else {setNutriApp(null);try{localStorage.removeItem("tfn_"+user.id);}catch{}}
  },[user?.id]);
  const pages={dashboard:<AlunoDash user={user} setPage={setPage} vinculo={vinculoApp} treinador={treinadorApp} nutri={nutriApp}/>,perfil:<MeuPerfil user={user} treinador={treinadorApp} nutri={nutriApp} vinculo={vinculoApp} onVinculoChange={refreshVinculo} showToast={show}/>,chat:<AlunoChat user={user} treinador={treinadorApp} nutri={nutriApp} showToast={show}/>,saude:<AlunoSaude user={user} showToast={show}/>,treinos:<AlunoTreinos user={user} showToast={show}/>,alimentacao:<AlunoAlimentacao user={user} showToast={show}/>,hidratacao:<AlunoHidratacao user={user} showToast={show}/>,competicoes:<AlunoCompeticoes user={user} showToast={show}/>,avaliacao:<AlunoAvaliacao user={user} showToast={show}/>,vinculo:<AlunoVinculo user={user} showToast={show} onVinculoChange={refreshVinculo}/>};
  return(<>{ToastEl}<Shell user={user} onLogout={onLogout} nav={NAV_ALUNO} active={page} setActive={setPage} accent="" alertCount={msgsBadge}>{pages[page]}</Shell></>);
}
// ============================================================
// TREINADOR — CADASTRAR ALUNO
// ============================================================
function CadastrarAluno({user,showToast}){
  const {confirm,Modal:ConfirmModalCad}=useConfirm();
  const [form,setForm]=useState({nome:"",sobrenome:"",nascimento:"",telefone:"",email:"",localTreino:"",obs:""});
  const [salvando,setSalvando]=useState(false);
  const [alunos,setAlunos]=useState([]);
  const [aba,setAba]=useState("form"); // "form" | "lista"

  useEffect(()=>{
    let c=false;
    DB.getData("alunos_cadastrados",user.id).then(d=>{if(!c)setAlunos(d||[]);}).catch(()=>{});
    return()=>{c=true;};
  },[user.id]);

  function set(k,v){setForm(p=>({...p,[k]:v}));}

  async function salvar(){
    if(!form.nome.trim()){showToast&&showToast("Informe o nome do aluno","warn");return;}
    if(form.email&&!isValidEmail(form.email.trim())){showToast&&showToast("Email inválido","warn");return;}
    setSalvando(true);
    try{
      const novo={
        id:Date.now().toString(),
        nome:sanitize(form.nome.trim()),sobrenome:sanitize(form.sobrenome.trim()),
        email:form.email.trim().toLowerCase(),telefone:form.telefone.trim(),
        nascimento:form.nascimento,localTreino:sanitize(form.localTreino.trim()),
        obs:sanitize(form.obs.trim()),criadoEm:new Date().toISOString(),
        treinadorId:user.id,contaCriada:false,
      };
      const novos=[...(alunos||[]),novo];
      await DB.setData("alunos_cadastrados",user.id,novos);
      setAlunos(novos);
      setForm({nome:"",sobrenome:"",nascimento:"",telefone:"",email:"",localTreino:"",obs:""});
      const msg=`Olá ${novo.nome}! Seu treinador ${user.nome} te cadastrou no TrioFit. Acesse triofit.vercel.app, crie sua conta${novo.email?" com o email "+novo.email:""} e vincule com o código ${user.codigo||"------"} 💪`;
      showToast&&showToast(`✅ ${novo.nome} cadastrado!`);
      setAba("lista");
    }catch(e){showToast&&showToast("Erro ao cadastrar","warn");}
    setSalvando(false);
  }

  async function remover(id){
    const okA=await confirm("Remover este aluno do cadastro?");if(!okA)return;
    const novos=(alunos||[]).filter(a=>a.id!==id);
    await DB.setData("alunos_cadastrados",user.id,novos);
    setAlunos(novos);
    showToast&&showToast("Aluno removido.");
  }

  function abrirWhatsApp(aluno){
    const msg=aluno.contaCriada
      ?encodeURIComponent(`Olá ${aluno.nome}! 🎉 Sua conta no TrioFit foi criada!

📱 Acesse: https://triofit.vercel.app
✉️ E-mail: ${aluno.email}
🔑 Senha temporária: ${aluno.senhaTemp}

Ao entrar, vá em Meu Perfil para alterar a senha. Seu treinador ${user.nome} já está vinculado! 💪`)
      :encodeURIComponent(`Olá ${aluno.nome}! Você foi cadastrado no TrioFit.

📱 Acesse: https://triofit.vercel.app
✉️ Crie sua conta com: ${aluno.email||"seu e-mail"}
🔑 Código do treinador: ${user.codigo||"------"} 💪`);
    window.open(`https://wa.me/55${aluno.telefone.replace(/[^0-9]/g,"")}?text=${msg}`,"_blank");
  }

  return(
    <div className="page">
      <div className="page-title orange">CADASTRAR ALUNO</div>
      <div className="page-sub">Cadastre seus alunos e compartilhe o link do app</div>

      {/* ABAS */}
      <div style={{display:"flex",gap:"8px",marginBottom:"1rem"}}>
        <button className={`btn ${aba==="form"?"btn-primary":"btn-ghost"} btn-sm`} onClick={()=>setAba("form")}>➕ Novo aluno</button>
        <button className={`btn ${aba==="lista"?"btn-primary":"btn-ghost"} btn-sm`} onClick={()=>setAba("lista")}>👥 Lista ({(alunos||[]).length})</button>
      </div>

      {aba==="form"&&(
        <div className="card">
          <div className="card-title">📋 DADOS DO ALUNO</div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Nome *</label><input className="form-input" placeholder="João" value={form.nome} onChange={e=>set("nome",e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Sobrenome</label><input className="form-input" placeholder="Silva" value={form.sobrenome} onChange={e=>set("sobrenome",e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Data de Nascimento</label><input className="form-input" type="date" value={form.nascimento} onChange={e=>set("nascimento",e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Telefone / WhatsApp</label><input className="form-input" placeholder="(51) 99999-9999" value={form.telefone} onChange={e=>set("telefone",e.target.value)}/></div>
            <div className="form-group"><label className="form-label">E-mail</label><input className="form-input" type="email" placeholder="joao@email.com" value={form.email} onChange={e=>set("email",e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Local de treino</label><input className="form-input" placeholder="Academia X / Residência / Parque" value={form.localTreino} onChange={e=>set("localTreino",e.target.value)}/></div>
          </div>
          <div className="form-group"><label className="form-label">Observações</label><textarea className="form-textarea" rows={3} placeholder="Limitações, objetivos, histórico de saúde..." value={form.obs} onChange={e=>set("obs",e.target.value)}/></div>
          <div className="card" style={{background:"var(--card2)",marginTop:"0.5rem"}}>
            <div style={{fontSize:"0.82rem",color:"var(--text2)",lineHeight:1.6}}>
              🤖 <b>Automático:</b> ao cadastrar com e-mail, a conta do aluno é criada automaticamente e ele já fica vinculado a você. Basta enviar as credenciais por WhatsApp! O aluno entra com a senha temporária e pode alterar depois.
            </div>
          </div>
          <button className="btn btn-primary btn-full" style={{marginTop:"1rem"}} onClick={salvar} disabled={salvando}>{salvando?"Salvando...":"✅ Cadastrar aluno"}</button>
        </div>
      )}

      {aba==="lista"&&(
        <div className="card">
          <div className="card-title">👥 ALUNOS CADASTRADOS</div>
          {(alunos||[]).length===0?(
            <div style={{color:"var(--text2)",fontSize:"0.9rem",padding:"1rem 0"}}>Nenhum aluno cadastrado ainda.</div>
          ):(alunos||[]).map(a=>(
            <div key={a.id} style={{background:"var(--card2)",borderRadius:"var(--radius)",padding:"0.75rem 1rem",marginBottom:"0.5rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"0.5rem"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap"}}>
                      <span style={{fontWeight:600,fontSize:"1rem"}}>{a.nome} {a.sobrenome}</span>
                      {a.contaCriada&&<span style={{fontSize:"10px",background:"rgba(46,213,115,0.2)",color:"var(--green)",padding:"2px 6px",borderRadius:"4px"}}>✓ conta criada</span>}
                    </div>
                    {a.senhaTemp&&<div style={{fontSize:"0.75rem",marginTop:"3px",color:"var(--text2)"}}>🔑 Senha temp: <b style={{fontFamily:"var(--font-mono)"}}>{a.senhaTemp}</b></div>}
                    {a.contaCriada&&<span style={{fontSize:"10px",background:"rgba(46,213,115,0.15)",color:"var(--green)",padding:"1px 6px",borderRadius:"4px"}}>✓ conta criada</span>}
                  </div>
                  <div style={{fontSize:"0.8rem",color:"var(--text2)",marginTop:"2px"}}>
                    {a.email&&<span>✉️ {a.email} </span>}
                    {a.telefone&&<span>📱 {a.telefone} </span>}
                    {a.localTreino&&<span>📍 {a.localTreino}</span>}
                  </div>
                  {a.senhaTemp&&<div style={{fontSize:"0.78rem",color:"var(--orange)",marginTop:"4px",background:"rgba(255,140,0,0.08)",padding:"3px 8px",borderRadius:"4px",display:"inline-block"}}>🔑 Senha temp: <b>{a.senhaTemp}</b></div>}
                  {a.obs&&<div style={{fontSize:"0.78rem",color:"var(--text3)",marginTop:"4px"}}>📝 {a.obs}</div>}
                </div>
                <div style={{display:"flex",gap:"6px",flexShrink:0}}>
                  {a.telefone&&<button className="btn btn-ghost btn-sm" style={{fontSize:"0.75rem",color:"#25D366"}} onClick={()=>abrirWhatsApp(a)}>WhatsApp</button>}
                  <button className="btn btn-ghost btn-sm" style={{fontSize:"0.75rem",color:"var(--red)"}} onClick={()=>remover(a.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TreinadorApp({user,onLogout}){
  const {show,ToastEl}=useToast();
  const [page,setPage]=useState("dashboard");
  const [alertCount,setAlertCount]=useState(0);
  useEffect(()=>{
    let c=false;
    DB.getAlunosDe(user.id).then(as=>{
      if(!c){
        setAlunos(as||[]);
        setAlertCount(0);
        if((as||[]).length===0&&!localStorage.getItem('tfOnboard_'+user.id)){
          setShowOnboard(true);
        }
      }
    }).catch(()=>{});
    return()=>{c=true;};
    // Checar mensagens não lidas
    const checkMsgs=()=>DB.getMensagensNaoLidas(user.id).then(d=>setAlertCount(d.length)).catch(()=>{});
    checkMsgs();
    const interval=setInterval(checkMsgs,30000);
    return()=>clearInterval(interval);
  },[user.id]);
  const pages={dashboard:<TreinadorDash user={user}/>,cadastrar:<CadastrarAluno user={user} showToast={show}/>,prescrever:<TreinadorPrescrever user={user} showToast={show}/>,acompanhamento:<TreinadorAcompanhamento user={user}/>,chat:<ProfChat user={user} showToast={show}/>};
  return(<>{ToastEl}<Shell user={user} onLogout={onLogout} nav={NAV_TREINADOR} active={page} setActive={setPage} accent="orange" alertCount={alertCount}>{pages[page]}</Shell></>);
}
function NutriApp({user,onLogout}){
  const {show,ToastEl}=useToast();
  const [page,setPage]=useState("dashboard");
  const [msgsBadgeN,setMsgsBadgeN]=useState(0);
  useEffect(()=>{
    if(!user?.id)return;
    const check=()=>DB.getMensagensNaoLidas(user.id).then(d=>setMsgsBadgeN(d.length)).catch(()=>{});
    check();
    const iv=setInterval(check,30000);
    return()=>clearInterval(iv);
  },[user?.id]);
  const pages={dashboard:<NutriDash user={user}/>,prescrever:<NutriPrescrever user={user} showToast={show}/>,acompanhamento:<NutriAcompanhamento user={user}/>,chat:<ProfChat user={user} showToast={show}/>};
  return(<>{ToastEl}<Shell user={user} onLogout={onLogout} nav={NAV_NUTRI} active={page} setActive={setPage} accent="blue" alertCount={msgsBadgeN}>{pages[page]||pages.dashboard}</Shell></>);
}

// ============================================================
// ROOT
// ============================================================
function ConfirmModal({msg,onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"var(--card)",borderRadius:"var(--radius)",padding:"1.5rem",maxWidth:"320px",width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
        <div style={{fontSize:"0.95rem",marginBottom:"1.25rem",lineHeight:1.5}}>{msg}</div>
        <div style={{display:"flex",gap:"0.75rem",justifyContent:"flex-end"}}>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-primary btn-sm" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

function useConfirm(){
  const [state,setState]=useState(null);
  const confirm=(msg)=>new Promise(resolve=>{
    setState({msg,resolve});
  });
  const Modal=state?(
    <ConfirmModal msg={state.msg}
      onConfirm={()=>{state.resolve(true);setState(null);}}
      onCancel={()=>{state.resolve(false);setState(null);}}/>
  ):null;
  return{confirm,Modal};
}

export default function TrioFit(){
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let c=false;
    // Verifica sessão existente
    DB.getSession().then(u=>{if(!c){setUser(u);setLoading(false);}}).catch(()=>{});
    // Escuta mudanças de auth
    const {data:{subscription}}=supabase.auth.onAuthStateChange(async(event,session)=>{
      // Ignora SIGNED_OUT causado por token_refresh_failed (browser voltou do background)
      if(event==='TOKEN_REFRESHED'||event==='SIGNED_IN'){
        if(session?.user){
          const u=await DB._formatUser(session.user);
          setUser(u);
        }
        setLoading(false);
      } else if(event==='SIGNED_OUT'){
        // Só desloga se for logout explícito, não por timeout de background
        setUser(null);
        setLoading(false);
      } else if(session?.user){
        const u=await DB._formatUser(session.user);
        setUser(u);
        setLoading(false);
      }
    });
    // Quando o app volta ao foco, verifica a sessão ativamente
    const handleVisibility=()=>{
      if(document.visibilityState==='visible'){
        supabase.auth.getSession().then(({data:{session}})=>{
          if(session?.user){
            DB._formatUser(session.user).then(u=>setUser(u));
          } else {
            // Tenta refresh antes de deslogar
            supabase.auth.refreshSession().then(({data:{session:s}})=>{
              if(s?.user){DB._formatUser(s.user).then(u=>setUser(u));}
              else{setUser(null);}
            }).catch(()=>{});
          }
        });
      }
    };
    document.addEventListener('visibilitychange',handleVisibility);
    return()=>{subscription.unsubscribe();document.removeEventListener('visibilitychange',handleVisibility);};
  },[]);

  async function handleLogout(){
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch{}
    try {
      Object.keys(localStorage)
        .filter(k=>k.startsWith('sb-')||k.startsWith('tfv_')||k.startsWith('tft_')||k.startsWith('tfn_'))
        .forEach(k=>localStorage.removeItem(k));
      sessionStorage.clear();
    } catch{}
    setUser(null);
    setTimeout(()=>{ window.location.reload(); }, 100);
  }

  if(loading){
    return(
      <>
        <style>{styles}</style>
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",flexDirection:"column",gap:"1rem"}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:"3rem",background:"linear-gradient(135deg,var(--green),var(--orange))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>TrioFit</div>
          <div style={{display:"flex",gap:"0.4rem"}}>
            {[0,1,2].map(i=><div key={i} style={{width:"8px",height:"8px",borderRadius:"50%",background:"var(--green)",animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,opacity:0.7}}/>)}
          </div>
        </div>
        <style>{`@keyframes pulse{0%,100%{transform:scale(0.8);opacity:0.4;}50%{transform:scale(1.2);opacity:1;}}`}</style>
      </>
    );
  }

  return(
    <>
      <style>{styles}</style>
      <div className="app">
        {!user&&<AuthScreen onLogin={setUser}/>}
        {user?.role==="aluno"&&<AlunoApp user={user} onLogout={handleLogout}/>}
        {user?.role==="treinador"&&<TreinadorApp user={user} onLogout={handleLogout}/>}
        {user?.role==="nutri"&&<NutriApp user={user} onLogout={handleLogout}/>}
      </div>
    </>
  );
}
