// v2.3 - Fix: validacao email login + user null guard + saving state + modal aria + 375px breakpoint
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { IDIOMAS, t as _t } from "./i18n.js";

// ============================================================
// DEMO ACCOUNTS — IDs reais do Supabase
// ============================================================
const DEMO_ALUNO_ID='f4a2bce7-1706-4af2-8631-22df8e3a0d82';
const DEMO_TREINADOR_ID='912f14e0-b9a2-4302-b44c-ed21e93ccb21';
const DEMO_NUTRI_ID='66548955-e95c-492c-9b59-931171ff781e';
const DEMO_IDS=[DEMO_TREINADOR_ID,DEMO_NUTRI_ID];
const DEMO_PLAN_ALUNO={nome:"Plano Demo",modalidade:"musculacao",inicio:new Date().toISOString().slice(0,10),fim:new Date(Date.now()+90*24*60*60*1000).toISOString(),duracao:3,dias:[{tipo:"treino",nome:"Treino A — Peito e Tríceps",exercicios:[{nome:"Supino Reto",series:"4",reps:"12",carga:"60kg",obs:"Controle a descida"},{nome:"Crucifixo",series:"3",reps:"15",carga:"14kg",obs:""},{nome:"Tríceps Pulley",series:"4",reps:"12",carga:"30kg",obs:"Cotovelos fixos"},{nome:"Mergulho",series:"3",reps:"12",carga:"",obs:""}]},{tipo:"treino",nome:"Treino B — Costas e Bíceps",exercicios:[{nome:"Puxada Frontal",series:"4",reps:"12",carga:"70kg",obs:""},{nome:"Remada Curvada",series:"4",reps:"12",carga:"60kg",obs:""},{nome:"Rosca Direta",series:"3",reps:"12",carga:"20kg",obs:""},{nome:"Rosca Martelo",series:"3",reps:"12",carga:"14kg",obs:""}]},{tipo:"descanso",nome:"Descanso"},{tipo:"treino",nome:"Treino C — Pernas",exercicios:[{nome:"Agachamento",series:"4",reps:"10",carga:"80kg",obs:"Joelhos alinhados"},{nome:"Leg Press",series:"4",reps:"12",carga:"120kg",obs:""},{nome:"Extensora",series:"3",reps:"15",carga:"60kg",obs:""},{nome:"Flexora",series:"3",reps:"15",carga:"50kg",obs:""}]},{tipo:"treino",nome:"Treino D — Ombros",exercicios:[{nome:"Desenvolvimento",series:"4",reps:"12",carga:"40kg",obs:""},{nome:"Elevação Lateral",series:"3",reps:"15",carga:"8kg",obs:""},{nome:"Prancha",series:"3",reps:"60s",carga:"",obs:""},{nome:"Abdominal",series:"3",reps:"20",carga:"",obs:""}]},{tipo:"descanso",nome:"Descanso"},{tipo:"descanso",nome:"Descanso"}]};
const DEMO_ALUNO={id:DEMO_ALUNO_ID,nome:'Aluno Demo',email:'aluno@demo.com',role:'aluno',bloqueado:false};


const _lang={current:(()=>{try{return localStorage.getItem("triofit_lang")||"pt";}catch{return "pt";}})(),listeners:new Set()};
function getLang(){return _lang.current;}
function setLang(l){_lang.current=l;try{localStorage.setItem("triofit_lang",l);}catch{}; _lang.listeners.forEach(fn=>fn(l));}
function useLang(){
  const [lang,setLangState]=useState(_lang.current);
  useEffect(()=>{const fn=l=>setLangState(l);_lang.listeners.add(fn);return()=>_lang.listeners.delete(fn);},[]);
  return lang;
}
function T(path){try{return _t(path,_lang.current);}catch{return path;}}

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
  if (!email) return false;
  const e = email.trim().toLowerCase();
  // Validação simples e permissiva — só verifica formato básico
  return e.length > 3 && e.includes('@') && e.includes('.') && e.indexOf('@') > 0 && e.lastIndexOf('.') > e.indexOf('@');
}

// Validação de senha forte
function validateSenha(senha) {
  if (senha.length < 8) return 'Senha: mínimo 8 caracteres.';
  if (!/\d/.test(senha)) return 'Senha: precisa ter pelo menos 1 número.';
  return null;
}
import { supabase, DB } from "./lib/supabase.js";

const _v='TRIOFIT_BUILD_1779826403';
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#09090b;
    --bg2:#111113;
    --card:#141416;
    --card2:#1a1a1d;
    --card3:#1e1e22;
    --border:#222226;
    --border2:#2a2a30;
    --green:#4ade80;
    --green2:#22c55e;
    --green3:#16a34a;
    --green-dim:rgba(74,222,128,0.06);
    --green-dim2:rgba(74,222,128,0.12);
    --green-glow:rgba(74,222,128,0.08);
    --orange:#fb923c;
    --orange2:#f97316;
    --orange3:#ea580c;
    --orange-dim:rgba(251,146,60,0.06);
    --orange-dim2:rgba(251,146,60,0.12);
    --red:#f87171;
    --red2:#ef4444;
    --red-dim:rgba(248,113,113,0.08);
    --blue:#60a5fa;
    --blue-dim:rgba(96,165,250,0.08);
    --text:#fafafa;
    --text2:#a1a1aa;
    --text3:#52525b;
    --text4:#3f3f46;
    --font:'Inter',sans-serif;
    --font-mono:'JetBrains Mono','Courier New',monospace;
    --r:10px;--r-lg:14px;--r-xl:20px;--r-full:999px;
    --radius:10px;--radius-lg:14px;--font-display:'Inter',sans-serif;
  }
  html{scroll-behavior:smooth;}
  body{
    background:var(--bg);color:var(--text);
    font-family:var(--font);
    -webkit-tap-highlight-color:transparent;
    overscroll-behavior:none;
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
  }
  input,select,textarea,button{font-family:var(--font);}
  ::selection{background:rgba(74,222,128,0.2);color:var(--text);}

  /* ════════════════════════════
     LAYOUT SHELL
  ════════════════════════════ */
  .shell{display:flex;min-height:100vh;}

  /* SIDEBAR — desktop only */
  .sidebar{
    width:230px;
    background:var(--card);
    border-right:1px solid var(--border);
    position:fixed;top:0;left:0;height:100vh;
    overflow-y:auto;z-index:100;
    display:flex;flex-direction:column;
  }
  .sidebar-logo{
    padding:20px;border-bottom:1px solid var(--border);
    display:flex;align-items:center;gap:10px;
  }
  .logo-dot{
    width:10px;height:10px;border-radius:50%;
    background:var(--green);
    box-shadow:0 0 12px var(--green),0 0 24px rgba(74,222,128,0.3);
    flex-shrink:0;
  }
  .logo-text{font-size:18px;font-weight:800;color:var(--text);letter-spacing:-0.5px;}
  .sidebar-user{
    padding:14px 16px;border-bottom:1px solid var(--border);
    display:flex;align-items:center;gap:10px;
  }
  .sidebar-avatar{
    width:36px;height:36px;border-radius:50%;
    background:var(--green-dim2);
    border:1.5px solid rgba(74,222,128,0.25);
    display:flex;align-items:center;justify-content:center;
    font-weight:700;color:var(--green);font-size:12px;flex-shrink:0;
    letter-spacing:0.5px;
  }
  .sidebar-name{font-size:13px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px;line-height:1.3;}
  .sidebar-role{font-size:11px;color:var(--text3);margin-top:2px;}
  .sidebar-nav{flex:1;overflow-y:auto;padding:6px 0;}
  .nav-section{
    padding:14px 16px 5px;
    font-size:10px;font-weight:600;
    text-transform:uppercase;letter-spacing:0.1em;
    color:var(--text4);
  }
  .nav-item{
    display:flex;align-items:center;gap:10px;
    padding:9px 12px;margin:1px 8px;
    border-radius:var(--r);
    font-size:13px;font-weight:500;color:var(--text2);
    border:none;background:none;cursor:pointer;
    width:calc(100% - 16px);text-align:left;
    transition:background .12s,color .12s;
    position:relative;
  }
  .nav-item:hover{background:var(--bg2);color:var(--text);}
  .nav-item.active{background:linear-gradient(135deg,rgba(74,222,128,0.14),rgba(74,222,128,0.05));color:var(--green);font-weight:600;border-left:2px solid var(--green);}
  .nav-item.active.orange{background:var(--orange-dim2);color:var(--orange);}
  .nav-badge{
    background:var(--red2);color:#fff;
    border-radius:var(--r-full);padding:1px 7px;
    font-size:10px;font-weight:700;margin-left:auto;
  }
  .sidebar-bottom{padding:10px;border-top:1px solid var(--border);}
  .logout-btn{
    display:flex;align-items:center;gap:8px;
    padding:9px 12px;border-radius:var(--r);
    border:none;background:none;cursor:pointer;
    color:var(--text3);font-size:13px;font-weight:500;
    width:100%;text-align:left;transition:all .12s;
  }
  .logout-btn:hover{background:var(--red-dim);color:var(--red);}

  /* MOBILE NAV */
  .mobile-nav{display:none;}
  @media(max-width:768px){
    .sidebar{display:none!important;}
    .main{margin-left:0!important;padding-bottom:70px;}
    .page{padding:14px!important;}
    .card{padding:14px!important;}
    .grid-2{gap:8px!important;}
    .form-input,.form-select,.form-textarea{min-height:48px;font-size:16px!important;}
    .btn{min-height:46px;}

    .mobile-nav{
      display:block!important;
      position:fixed;bottom:0;left:0;right:0;
      background:var(--card);
      border-top:1px solid var(--border);
      z-index:200;height:62px;
      padding-bottom:env(safe-area-inset-bottom,0px);
    }
    .mob-nav-inner{
      display:flex;width:100%;
      justify-content:space-around;align-items:center;
      height:62px;
    }
    .mob-btn{
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:3px;flex:1;height:100%;
      border:none;background:none;cursor:pointer;
      color:var(--text3);transition:color .12s;
      padding:0;min-width:0;position:relative;
    }
    .mob-btn::after{
      content:"";position:absolute;top:0;left:50%;
      transform:translateX(-50%) scaleX(0);
      width:28px;height:2.5px;
      background:var(--green);border-radius:0 0 3px 3px;
      transition:transform .2s cubic-bezier(.34,1.56,.64,1);
    }
    .mob-btn.active{color:var(--green);} .mob-btn.active .mob-icon{filter:drop-shadow(0 0 6px rgba(74,222,128,0.5));}
    .mob-btn.active.orange{color:var(--orange);}
    .mob-btn.active::after{transform:translateX(-50%) scaleX(1);}
    .mob-btn.active.orange::after{background:var(--orange);}
    .mob-icon{font-size:20px;line-height:1.1;}
    .mob-label{font-size:9px;font-weight:500;letter-spacing:0.02em;}
    .mob-more-menu{
      position:absolute;bottom:calc(100% + 8px);right:4px;
      background:var(--card2);border:1px solid var(--border2);
      border-radius:var(--r-lg);padding:6px;min-width:180px;
      box-shadow:0 -8px 32px rgba(0,0,0,0.5);
    }
    .mob-more-item{
      display:flex;align-items:center;gap:10px;
      padding:11px 14px;border-radius:var(--r);
      font-size:13px;color:var(--text);
      border:none;background:none;width:100%;cursor:pointer;text-align:left;
      transition:background .1s;
    }
    .mob-more-item:active{background:var(--bg2);}
  }
  @media(min-width:769px){
    .mobile-nav{display:none!important;}
    .main{margin-left:230px;}
  }

  /* ════════════════════════════
     MAIN + PAGE
  ════════════════════════════ */
  .main{min-height:100vh;background:var(--bg);flex:1;}
  .page{padding:28px;width:100%;}
  .page-header{margin-bottom:22px;}
  .page-title{
    font-size:21px;font-weight:700;color:var(--text);
    letter-spacing:-0.4px;line-height:1.2;
  }
  .page-title.green{color:var(--green);}
  .page-title.orange{color:var(--orange);}
  .page-sub{font-size:13px;color:var(--text2);margin-top:4px;font-weight:400;}

  /* ════════════════════════════
     CARDS
  ════════════════════════════ */
  .card{
    background:var(--card);
    border-radius:var(--r-lg);
    padding:18px;margin-bottom:14px;
    border:1px solid var(--border);
  }
  .card-title{
    font-size:10px;font-weight:700;
    text-transform:uppercase;letter-spacing:0.1em;
    color:var(--text3);margin-bottom:16px;
  }

  /* STAT CARDS */
  .stat-card{
    background:var(--card);border-radius:var(--r-lg);
    padding:16px 18px;border:1px solid var(--border);
    transition:border-color .15s;
  }
  .stat-card:hover{border-color:var(--border2);}
  .stat-label{
    font-size:11px;font-weight:500;
    color:var(--text3);margin-bottom:8px;
    text-transform:uppercase;letter-spacing:0.06em;
  }
  .stat-value{
    font-size:26px;font-weight:700;color:var(--text);
    line-height:1;letter-spacing:-0.5px;
  }
  .stat-value.green{color:var(--green);}
  .stat-value.orange{color:var(--orange);}
  .stat-unit{font-size:13px;font-weight:500;color:var(--text2);}
  .stat-sub{font-size:11px;color:var(--text3);margin-top:6px;}

  /* ════════════════════════════
     FORMS — PREMIUM
  ════════════════════════════ */
  .form-group{margin-bottom:16px;}
  .form-label{
    display:block;font-size:13px;font-weight:500;
    color:var(--text2);margin-bottom:7px;letter-spacing:0.01em;
  }
  .form-input{
    width:100%;
    padding:11px 14px;
    border:1.5px solid var(--border2);
    border-radius:var(--r);
    font-size:14px;font-weight:400;
    color:var(--text);
    background:var(--card2);
    outline:none;
    transition:border-color .15s,box-shadow .15s,background .15s;
    line-height:1.5;
  }
  .form-input:hover{border-color:var(--text4);background:var(--card3);}
  .form-input:focus{
    border-color:var(--green);
    background:var(--card2);
    box-shadow:0 0 0 3px rgba(74,222,128,0.1);
  }
  .form-input::placeholder{color:var(--text4);font-weight:400;}
  .form-select{
    width:100%;
    padding:11px 14px;
    border:1.5px solid var(--border2);
    border-radius:var(--r);
    font-size:14px;font-weight:400;
    color:var(--text);
    background:var(--card2);
    outline:none;cursor:pointer;
    transition:border-color .15s,box-shadow .15s;
    appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2371717a' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat:no-repeat;
    background-position:right 14px center;
    padding-right:36px;
  }
  .form-select:hover{border-color:var(--text4);}
  .form-select:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(74,222,128,0.1);}
  .form-textarea{
    width:100%;
    padding:11px 14px;
    border:1.5px solid var(--border2);
    border-radius:var(--r);
    font-size:14px;color:var(--text);
    background:var(--card2);outline:none;resize:vertical;
    transition:border-color .15s,box-shadow .15s;
    line-height:1.6;min-height:90px;
  }
  .form-textarea:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(74,222,128,0.1);}
  .form-textarea::placeholder{color:var(--text4);}
  .form-hint{font-size:11px;color:var(--text3);margin-top:5px;}

  /* ════════════════════════════
     BUTTONS — PREMIUM
  ════════════════════════════ */
  .btn{
    display:inline-flex;align-items:center;justify-content:center;gap:7px;
    padding:10px 20px;border-radius:var(--r);
    font-size:14px;font-weight:600;cursor:pointer;border:none;
    transition:transform .1s,opacity .15s,box-shadow .15s;
    white-space:nowrap;letter-spacing:0.01em;
  }
  .btn:hover{opacity:.92;}
  .btn:active{transform:scale(0.975);}
  .btn:disabled{opacity:.35;cursor:not-allowed;transform:none;}
  .btn-primary,.btn-green{
    background:var(--green);color:#000;font-weight:700;
    box-shadow:0 0 0 0 rgba(74,222,128,0);
  }
  .btn-primary:hover,.btn-green:hover{
    box-shadow:0 4px 16px rgba(74,222,128,0.25);
  }
  .btn-orange{
    background:var(--orange);color:#fff;font-weight:700;
  }
  .btn-orange:hover{box-shadow:0 4px 16px rgba(251,146,60,0.25);}
  .btn-ghost{
    background:transparent;color:var(--text2);
    border:1.5px solid var(--border2);
  }
  .btn-ghost:hover{background:var(--card2);color:var(--text);border-color:var(--text4);}
  .btn-sm{padding:7px 14px;font-size:13px;}
  .btn-full{width:100%;}

  /* ════════════════════════════
     GRID
  ════════════════════════════ */
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
  @media(max-width:480px){.grid-3{grid-template-columns:1fr 1fr;}}
@media(max-width:375px){.card{padding:0.75rem;}.page-title{font-size:1.3rem;}.week-tabs{gap:2px;}}

  /* ════════════════════════════
     MISC COMPONENTS
  ════════════════════════════ */
  .alert{padding:12px 16px;border-radius:var(--r);font-size:13px;margin-bottom:14px;border:1px solid;display:flex;align-items:flex-start;gap:8px;}
  .alert-warn{background:var(--orange-dim);border-color:rgba(251,146,60,0.2);color:var(--orange);}
  .alert-success{background:var(--green-dim);border-color:rgba(74,222,128,0.15);color:var(--green);}

  .aluno-sel-wrap{display:flex;gap:8px;flex-wrap:wrap;}
  .aluno-sel-btn{
    display:flex;align-items:center;gap:8px;
    padding:9px 14px;border-radius:var(--r);
    border:1.5px solid var(--border2);background:var(--card2);
    cursor:pointer;font-size:13px;color:var(--text);
    transition:all .12s;
  }
  .aluno-sel-btn:hover{border-color:var(--green2);background:var(--card3);}
  .aluno-sel-btn.active{border-color:var(--orange2);background:var(--orange-dim2);color:var(--orange);font-weight:600;}
  .aluno-sel-avatar{width:28px;height:28px;border-radius:50%;background:var(--green-dim2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--green);}

  .week-tabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;margin-bottom:14px;scrollbar-width:none;}
  .week-tabs::-webkit-scrollbar{display:none;}
  .week-tab{
    flex:0 0 auto;padding:8px 16px;border-radius:var(--r);
    border:1.5px solid var(--border2);background:var(--card2);
    cursor:pointer;font-size:13px;font-weight:500;color:var(--text2);
    white-space:nowrap;transition:all .12s;
  }
  .week-tab:hover{border-color:var(--green2);color:var(--text);}
  .week-tab.active,.week-tab.active.orange{border-color:var(--orange2);background:var(--orange-dim2);color:var(--orange);font-weight:600;}

  .ex-nome{font-weight:600;font-size:14px;color:var(--text);line-height:1.3;}
  .ex-info{font-size:12px;color:var(--text2);margin-top:3px;}
  .check-box{
    width:24px;height:24px;border-radius:6px;
    border:2px solid var(--border2);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;transition:all .15s;flex-shrink:0;
  }
  .check-box:hover{border-color:var(--green2);}
  .check-box.checked{background:var(--green);border-color:var(--green);color:#000;}

  .progress-bar{height:5px;background:var(--border2);border-radius:var(--r-full);overflow:hidden;}
  .progress-fill{height:100%;border-radius:var(--r-full);background:var(--green);transition:width .4s cubic-bezier(.4,0,.2,1);}
  .progress-fill.orange{background:var(--orange);}

  .periodo-card{background:var(--green-dim);border:1px solid rgba(74,222,128,0.15);border-radius:var(--r);padding:12px 16px;margin-top:12px;}

  .obj-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:var(--r-full);font-size:11px;font-weight:600;}

  /* ════════════════════════════
     TOAST
  ════════════════════════════ */
  .toast-wrap{position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:320px;}
  .toast{
    padding:13px 16px;border-radius:var(--r-lg);
    font-size:13px;font-weight:500;
    display:flex;align-items:center;gap:10px;
    background:var(--card2);border:1px solid var(--border2);color:var(--text);
    box-shadow:0 8px 32px rgba(0,0,0,0.5),0 2px 8px rgba(0,0,0,0.3);
    animation:toastIn .2s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes toastIn{from{opacity:0;transform:translateX(16px) scale(0.95);}to{opacity:1;transform:translateX(0) scale(1);}}
  .toast.warn{background:rgba(251,146,60,0.1);border-color:rgba(251,146,60,0.25);color:var(--orange);}

  /* ════════════════════════════
     MODAL
  ════════════════════════════ */
  .modal-overlay{
    position:fixed;inset:0;background:rgba(0,0,0,0.7);
    z-index:1000;display:flex;align-items:flex-end;justify-content:center;
    backdrop-filter:blur(4px);animation:fadeIn .15s ease;
  }
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @media(min-width:480px){.modal-overlay{align-items:center;padding:16px;}}
  .modal-box{
    background:var(--card);border:1px solid var(--border2);
    border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:440px;
    box-shadow:0 -8px 48px rgba(0,0,0,0.5);
    animation:modalUp .2s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes modalUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
  @media(min-width:480px){.modal-box{border-radius:var(--r-xl);}}
  .modal-title{font-size:16px;font-weight:700;margin-bottom:16px;color:var(--text);letter-spacing:-0.2px;}
  .modal-actions{display:flex;gap:8px;margin-top:20px;justify-content:flex-end;}

  /* ════════════════════════════
     AUTH
  ════════════════════════════ */
  .auth-wrap{
    min-height:100vh;display:flex;align-items:center;justify-content:center;
    padding:16px;background:var(--bg);
    background-image:radial-gradient(ellipse 80% 50% at 50% -20%,rgba(74,222,128,0.06),transparent);
  }
  .auth-card{
    background:var(--card);border:1px solid var(--border);
    border-radius:var(--r-xl);padding:28px;width:100%;max-width:380px;
    box-shadow:0 24px 64px rgba(0,0,0,0.4);
  }
  .auth-logo{text-align:center;margin-bottom:26px;}
  .auth-logo-icon{
    width:52px;height:52px;border-radius:16px;
    background:var(--green-dim2);border:1px solid rgba(74,222,128,0.2);
    display:flex;align-items:center;justify-content:center;
    margin:0 auto 12px;font-size:24px;
  }
  .auth-title{font-size:22px;font-weight:800;color:var(--text);letter-spacing:-0.5px;}
  .auth-subtitle{font-size:13px;color:var(--text3);margin-top:4px;}
  .auth-tabs{
    display:flex;gap:4px;background:var(--bg2);
    border:1px solid var(--border);border-radius:var(--r);
    padding:4px;margin-bottom:22px;
  }
  .auth-tab{
    flex:1;padding:9px;border:none;border-radius:8px;
    font-size:13px;font-weight:500;cursor:pointer;
    background:transparent;color:var(--text3);transition:all .15s;
  }
  .auth-tab.active{
    background:var(--card2);color:var(--text);font-weight:600;
    box-shadow:0 1px 4px rgba(0,0,0,0.3);
  }
  .auth-demo{
    background:var(--green-dim);border:1px solid rgba(74,222,128,0.12);
    border-radius:var(--r);padding:14px;margin-top:16px;
  }
  .auth-demo-title{
    font-size:10px;font-weight:700;color:var(--green);
    margin-bottom:10px;text-transform:uppercase;letter-spacing:0.08em;
  }
  .auth-demo-btn{
    display:flex;align-items:center;gap:10px;
    padding:9px 10px;border-radius:8px;
    border:none;background:transparent;cursor:pointer;
    width:100%;text-align:left;font-size:13px;color:var(--text);
    transition:background .1s;
  }
  .auth-demo-btn:hover,.auth-demo-btn:active{background:rgba(74,222,128,0.08);}

  /* ════════════════════════════
     SPLASH
  ════════════════════════════ */
  @media(display-mode:standalone){.main{padding-top:env(safe-area-inset-top,0px);}}
  .splash{
    min-height:100vh;display:flex;align-items:center;justify-content:center;
    flex-direction:column;gap:12px;background:var(--bg);
  }
  .splash-logo{font-size:28px;font-weight:800;color:var(--green);letter-spacing:-1px;}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.2)}}
  .spinner{
    width:22px;height:22px;
    border:2px solid var(--border2);border-top-color:var(--green);
    border-radius:50%;animation:spin .65s linear infinite;
  }
`;


// ============================================================
// TOAST SYSTEM
// ============================================================
function Toast({msg,type,onClose}){
  useEffect(()=>{const t=setTimeout(onClose,2500);return()=>clearTimeout(t);},[]);
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
function getGreeting(){const h=new Date().getHours();if(h<12)returnT("saudacao.bomDiaMaius");if(h<18)returnT("saudacao.boaTardeMaius");returnT("saudacao.boaNoiteMaius");}
function getDateStr(){return new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).replace(/^\w/,c=>c.toUpperCase());}
function firstName(n){return n?n.trim().split(" ")[0].toUpperCase():"";}
function initials(n){if(!n)return"?";const p=n.trim().split(" ");return p.length>=2?(p[0][0]+p[p.length-1][0]).toUpperCase():p[0][0].toUpperCase();}
function diffDays(d){if(!d)return 0;return Math.max(Math.floor((Date.now()-new Date(d).getTime())/(864e5)),0);}
function pluralDia(n){return n===1?"dia":"dias";}
function calcIMC(peso,altura){if(!peso||!altura)return null;const imc=Number(peso)/((Number(altura)/100)**2);return{val:imc.toFixed(1),cat:imc<18.5?T("imc.abaixoPeso"):imc<25?"Normal":imc<30?"Sobrepeso":"Obesidade"};}
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
const OBJETIVOS=[
  {id:"emagrecimento",label:"Emagrecimento",icon:"🔥",color:"var(--orange)"},
  {id:"ganho_massa",label:"Ganho de Massa",icon:"💪",color:"var(--green)"},
  {id:"preparacao",label:"Preparação",icon:"⚡",color:"#60a5fa"},
  {id:"competicao",label:"Competição",icon:"🏆",color:"#ef4444"},
  {id:"manutencao",label:"Manutenção",icon:"⚖️",color:"#a78bfa"},
  {id:"saude",label:"Saúde Geral",icon:"❤️",color:"#22d3ee"},
  {id:"reabilitacao",label:"Reabilitação",icon:"🪺",color:"#facc15"},
];
const BANCO_EXERCICIOS=[
  // PEITO
  {nome:"Supino Reto",grupo:"Peito",video:"https://www.youtube.com/watch?v=rT7DgCr-3pg"},
  {nome:"Supino Inclinado",grupo:"Peito",video:"https://www.youtube.com/watch?v=DbFgADa2PL8"},
  {nome:"Supino Declinado",grupo:"Peito",video:"https://www.youtube.com/watch?v=LfyQTpJgKXY"},
  {nome:"Crucifixo",grupo:"Peito",video:"https://www.youtube.com/watch?v=eozdVDA78K0"},
  {nome:"Crossover",grupo:"Peito",video:"https://www.youtube.com/watch?v=taI4XduLpTk"},
  {nome:"Flexão de Braços",grupo:"Peito",video:"https://www.youtube.com/watch?v=IODxDxX7oi4"},
  {nome:"Peck Deck",grupo:"Peito",video:"https://www.youtube.com/watch?v=Z57CtFmRMxA"},
  // COSTAS
  {nome:"Puxada Frontal",grupo:"Costas",video:"https://www.youtube.com/watch?v=CAwf7n6Luuc"},
  {nome:"Remada Curvada",grupo:"Costas",video:"https://www.youtube.com/watch?v=kBWAon7ItDw"},
  {nome:"Remada Unilateral",grupo:"Costas",video:"https://www.youtube.com/watch?v=pYcpY20QaE8"},
  {nome:"Levantamento Terra",grupo:"Costas",video:"https://www.youtube.com/watch?v=op9kVnSso6Q"},
  {nome:"Pull Up / Barra Fixa",grupo:"Costas",video:"https://www.youtube.com/watch?v=eGo4IYlbE5g"},
  {nome:"Serrote",grupo:"Costas",video:"https://www.youtube.com/watch?v=pYcpY20QaE8"},
  // OMBRO
  {nome:"Desenvolvimento com Halter",grupo:"Ombro",video:"https://www.youtube.com/watch?v=HzIiNhHhhtA"},
  {nome:"Desenvolvimento Arnold",grupo:"Ombro",video:"https://www.youtube.com/watch?v=6Z15_WdXmVw"},
  {nome:"Elevação Lateral",grupo:"Ombro",video:"https://www.youtube.com/watch?v=3VcKaXpzqRo"},
  {nome:"Elevação Frontal",grupo:"Ombro",video:"https://www.youtube.com/watch?v=hRJ6tR5-if0"},
  {nome:"Encolhimento de Ombros",grupo:"Ombro",video:"https://www.youtube.com/watch?v=cJRVVxmytaM"},
  // BÍCEPS
  {nome:"Rosca Direta",grupo:"Bíceps",video:"https://www.youtube.com/watch?v=ykJmrZ5v0Oo"},
  {nome:"Rosca Alternada",grupo:"Bíceps",video:"https://www.youtube.com/watch?v=sAq_ocpRh_I"},
  {nome:"Rosca Martelo",grupo:"Bíceps",video:"https://www.youtube.com/watch?v=zC3nLlEvin4"},
  {nome:"Rosca Scott",grupo:"Bíceps",video:"https://www.youtube.com/watch?v=fIWP-FRFNU0"},
  {nome:"Rosca Concentrada",grupo:"Bíceps",video:"https://www.youtube.com/watch?v=Jvj2wV0vOYU"},
  // TRÍCEPS
  {nome:"Tríceps Pulley",grupo:"Tríceps",video:"https://www.youtube.com/watch?v=2-LAMcpzODU"},
  {nome:"Tríceps Testa",grupo:"Tríceps",video:"https://www.youtube.com/watch?v=d_KZxkY_0cM"},
  {nome:"Tríceps Coice",grupo:"Tríceps",video:"https://www.youtube.com/watch?v=YbX7Wd8jQ-Q"},
  {nome:"Mergulho",grupo:"Tríceps",video:"https://www.youtube.com/watch?v=0326dy_-CzM"},
  // PERNAS
  {nome:"Agachamento",grupo:"Pernas",video:"https://www.youtube.com/watch?v=aclHkVaku9U"},
  {nome:"Leg Press",grupo:"Pernas",video:"https://www.youtube.com/watch?v=IZxyjW7MPJQ"},
  {nome:"Extensora",grupo:"Pernas",video:"https://www.youtube.com/watch?v=YyvSfVjQeL0"},
  {nome:"Flexora",grupo:"Pernas",video:"https://www.youtube.com/watch?v=1Tq3QdYUuHs"},
  {nome:"Stiff",grupo:"Pernas",video:"https://www.youtube.com/watch?v=1uDiW5--rAE"},
  {nome:"Afundo / Lunges",grupo:"Pernas",video:"https://www.youtube.com/watch?v=QOVaHwm-Q6U"},
  {nome:"Cadeira Adutora",grupo:"Pernas",video:"https://www.youtube.com/watch?v=KAoJsGFiSZQ"},
  {nome:"Elevação Pélvica",grupo:"Pernas",video:"https://www.youtube.com/watch?v=8bbE64NuDTU"},
  {nome:"Panturrilha em Pé",grupo:"Pernas",video:"https://www.youtube.com/watch?v=-M4-G8p1fCI"},
  // ABDÔMEN
  {nome:"Abdominal Crunch",grupo:"Abdômen",video:"https://www.youtube.com/watch?v=Xyd_fa5zoEU"},
  {nome:"Prancha",grupo:"Abdômen",video:"https://www.youtube.com/watch?v=pSHjTRCQxIw"},
  {nome:"Abdominal Infra",grupo:"Abdômen",video:"https://www.youtube.com/watch?v=l4kQd9eWclE"},
  {nome:"Oblíquo",grupo:"Abdômen",video:"https://www.youtube.com/watch?v=pSHjTRCQxIw"},
  // CARDIO / FUNCIONAL
  {nome:"Burpee",grupo:"Funcional",video:"https://www.youtube.com/watch?v=dZgVxmf6jkA"},
  {nome:"Jumping Jack",grupo:"Funcional",video:"https://www.youtube.com/watch?v=iSSAk4XCsRA"},
  {nome:"Mountain Climber",grupo:"Funcional",video:"https://www.youtube.com/watch?v=nmwgirgXLYM"},
  {nome:"Polichinelo",grupo:"Funcional",video:"https://www.youtube.com/watch?v=iSSAk4XCsRA"},
];
function getObjetivo(id){return OBJETIVOS.find(o=>o.id===id)||{id:"",label:"",icon:"💪",color:"var(--green)"};}
const DIAS_SEMANA=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
const MODALIDADES=[{v:"musculacao",l:"💪 Musculação"},{v:"corrida",l:"🏃 Corrida"},{v:"natacao",l:"🏊 Natação"},{v:"luta",l:"🥊 Luta / Artes Marciais"},{v:"ciclismo",l:"🚴 Ciclismo"},{v:"caminhada",l:"🚶 Caminhada"},{v:"funcional",l:"⚡ Funcional"}];
const MUSCLES=["Ombro D","Ombro E","Bíceps D","Bíceps E","Tríceps D","Tríceps E","Peitoral","Costas","Lombar","Abdômen","Glúteo","Quadríceps D","Quadríceps E","Panturrilha D","Panturrilha E","Isquio"];

// ============================================================
// LOCAL DB
// ============================================================

// Hook para carregar dados async com estado de loading
const _dc=new Map();
const _ck=(u,k)=>u+":"+k;
const _cg=(u,k)=>{const c=_dc.get(_ck(u,k));return(c&&Date.now()-c.ts<120000)?c.v:undefined;};
const _cs=(u,k,v)=>_dc.set(_ck(u,k),{v,ts:Date.now()});
function useDebounce(value, delay=300){
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(()=>{
    const timer = setTimeout(()=>setDebouncedValue(value), delay);
    return ()=>clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

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
  const [val, setVal] = useState(()=>{const c=_cg(userId,chave);return c!==undefined?c:defaultVal;});
  const [ready, setReady] = useState(()=>_cg(userId,chave)!==undefined);
  useEffect(() => {
    if (!userId) return;
    if(_cg(userId,chave)!==undefined){setReady(true);return;}
    let cancelled = false;
    DB.getData(chave, userId).then(d => {
      if (!cancelled){const v=d??defaultVal;_cs(userId,chave,v);setVal(v);setReady(true);}
    }).catch(() => {if(!cancelled){setVal(defaultVal);setReady(true);}});
    return () => { cancelled = true; };
  }, [userId, chave]);
  async function save(newVal){setVal(newVal);_cs(userId,chave,newVal);await DB.setData(chave,userId,newVal);}
  return [val, ready, save];
}


// ============================================================
// AUTH
// ============================================================
function AuthScreen({onLogin}){
  useLang();
  const [tab,setTab]=useState("login");
  const [langAtual,setLangAtual]=useState(()=>localStorage.getItem("triofit_lang")||"pt");
  const [email,setEmail]=useState("");
  const [senha,setSenha]=useState("");
  const [nome,setNome]=useState("");
  const [role,setRole]=useState("aluno");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const [resetSent,setResetSent]=useState(false);

  async function handleRecoverPassword(){
    const e=email.trim().toLowerCase();
    if(!e){setError("Digite seu email para recuperar a senha.");return;}
    if(!isValidEmail(e)){setError("Email inválido.");return;}
    setLoading(true);setError("");
    try{
      const {error:err}=await supabase.auth.resetPasswordForEmail(e,{
        redirectTo:"https://triofit.vercel.app"
      });
      if(err){
        const em=(err.message||"").toLowerCase();
        if(em.includes("disabled"))setError("Login por email desabilitado. Contate o suporte.");
        else if(em.includes("not found")||em.includes("user"))setError("Email não encontrado.");
        else setError("Erro ao enviar email. Tente novamente.");
      }
      else setResetSent(true);
    }catch{setError("Erro de conexão.");}
    setLoading(false);
  }

  // Limpa erro ao trocar de aba
  function goTab(t){setTab(t);setError("");setSuccess("");if(t!=="recover")setEmail("");if(t!=="recover")setSenha("");}

  // Limpa erro ao digitar qualquer campo
  function changeEmail(v){setEmail(v);if(error)setError("");}
  function changeSenha(v){setSenha(v);if(error)setError("");}
  function changeNome(v){setNome(v);if(error)setError("");}

  async function handleLogin(){
    setError("");setSuccess("");
    const e=email.trim().toLowerCase();
    if(!e||!senha){setError(T("erros.preenchaEmail"));return;}
    if(senha.length<6){setError("Senha deve ter pelo menos 6 caracteres.");return;}
    if(!isValidEmail(e)){setError("Email inválido. Exemplo: nome@gmail.com");return;}
    const loginSafety=setTimeout(()=>setLoading(false),12000);
    setLoading(true);
    let res;
    try{
      const timeout=new Promise((_,rej)=>setTimeout(()=>rej(new Error("Sem resposta do servidor. Verifique sua conexão.")),10000));
      res=await Promise.race([DB.login(e,senha),timeout]);
      clearTimeout(loginSafety);
    }catch(err){
      setLoading(false);
      setError(err.message||T("erros.erroEntrar"));
      return;
    }
    setLoading(false);
    if(!res||!res.ok){setError(res?.msg||T("erros.erroEntrar"));return;}
    onLogin(res.user);
  }

  async function handleRegister(){
    setError("");setSuccess("");
    const e=email.trim().toLowerCase();
    const n=nome.trim();
    if(!n){setError("Digite seu nome completo.");return;}
    if(!e){setError("Digite seu email.");return;}
    if(!isValidEmail(e)){setError("Email inválido. Exemplo: nome@gmail.com");return;}
    if(senha.length<6){setError("Senha: mínimo 6 caracteres.");return;}
    setLoading(true);
    const res=await DB.register(n,e,senha,role);
    setLoading(false);
    if(!res.ok){setError(res.msg||T("erros.erroCriar"));return;}
    if(res.needsConfirmation||!res.user){
      setSuccess("✅ Conta criada com sucesso! Verifique seu email para ativar a conta.");
      setEmail(""); setSenha(""); setNome("");
      return;
    }
    onLogin(res.user);
  }

  async function fillDemo(email,senha){
    // Reset state first — ensures button is never stuck disabled
    setError("");setSuccess("");setTab("login");
    setLoading(false);
    setEmail(email);setSenha(senha);
    // Safety: reset loading after 15s regardless of outcome
    const safetyTimer=setTimeout(()=>setLoading(false),15000);
    setLoading(true);
    await new Promise(r=>setTimeout(r,50));
    try{
      const res=await DB.login(email,senha);
      clearTimeout(safetyTimer);
      if(res&&res.ok&&res.user){
        setLoading(false);
        // Marca usuário demo para que o logout funcione sem sessão Supabase
        res.user.isDemoUser=true;
        onLogin(res.user);return;
      }
      setError(res?.msg||"Erro ao entrar com conta demo");
    }catch(e){
      setError("Erro de conexão. Tente novamente.");
    }
    setLoading(false);
    const DEMO_IDS={aluno:DEMO_ALUNO_ID,treinador:DEMO_TREINADOR_ID,nutri:DEMO_NUTRI_ID};
    const role=email.includes("treinador")?"treinador":email.includes("nutri")?"nutri":"aluno";
    const nomes={aluno:"Aluno Demo",treinador:"Treinador Demo",nutri:"Nutricionista Demo"};
    try{
      if(role==="treinador"||role==="nutri"){
        localStorage.setItem("demo_alunos_"+DEMO_IDS[role],JSON.stringify([{id:DEMO_IDS.aluno,nome:"Aluno Demo",email:"aluno@demo.com",role:"aluno",bloqueado:false}]));
        localStorage.setItem("demo_pacientes_"+DEMO_IDS[role],JSON.stringify([{id:DEMO_IDS.aluno,nome:"Aluno Demo",email:"aluno@demo.com",role:"aluno"}]));
      }
      if(role==="aluno"){
        localStorage.setItem("demo_vinculo_"+DEMO_IDS.aluno,JSON.stringify({
          treinadorId:DEMO_IDS.treinador,nutriId:DEMO_IDS.nutri,
          treinador:{id:DEMO_IDS.treinador,nome:"Treinador Demo",email:"treinador@demo.com",role:"treinador"},
          nutri:{id:DEMO_IDS.nutri,nome:"Nutricionista Demo",email:"nutri@demo.com",role:"nutri"},
        }));
      }
    }catch(e){}
    const codigos={aluno:"034082",treinador:"DCD3F5",nutri:"373CBD"};
    onLogin({id:DEMO_IDS[role],email,nome:nomes[role],role,isDemoUser:true,
      codigo:codigos[role],
      treinadorId:role==="aluno"?DEMO_IDS.treinador:undefined,
      nutriId:role==="aluno"?DEMO_IDS.nutri:undefined});
  }

  return(
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{width:"52px",height:"52px",borderRadius:"16px",background:"var(--green-dim2)",border:"1px solid rgba(74,222,128,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:"24px"}}>💪</div>
          <div className="auth-title">TrioFit</div>
          <div className="auth-subtitle">{T("auth.subtitulo")}</div>
        </div>

        <div className="auth-tabs" style={{marginBottom:"16px"}}>
          <button className={"auth-tab"+(tab==="login"?" active":"")}
            style={{borderBottom:tab==="login"?"3px solid var(--green)":"3px solid transparent"}}
            onClick={()=>goTab("login")}>{T("auth.entrarTab")}</button>
          <button className={"auth-tab"+(tab==="register"?" active":"")}
            style={{borderBottom:tab==="register"?"3px solid var(--green)":"3px solid transparent"}}
            onClick={()=>goTab("register")}>{T("auth.criarTab")}</button>
        </div>

        {success&&<div style={{background:"rgba(74,222,128,0.1)",border:"1px solid var(--green)",borderRadius:"var(--r)",padding:"12px 16px",marginBottom:"16px",color:"var(--green)",fontSize:"13px",fontWeight:600}}>{success}</div>}
        {error&&<div className="alert alert-warn" style={{marginBottom:"16px",padding:"12px 16px",borderRadius:"var(--r)",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"var(--red)",fontSize:"13px",fontWeight:600}}>{error}</div>}
        {success&&<div className="alert alert-success" style={{marginBottom:"16px"}}>{success}</div>}

        {tab==="login"&&(
          <>
            <div className="form-group">
              <label className="form-label">{T("auth.email")}</label>
              <input className="form-input" type="email" autoComplete="email"
                placeholder={T("auth.email").toLowerCase()+"@exemplo.com"} value={email}
                onChange={e=>changeEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()} autoFocus/>
            </div>
            <div className="form-group">
              <label className="form-label">{T("auth.senha")}</label>
              <input className="form-input" type="password" autoComplete="current-password"
                placeholder={T("auth.senhaEx")||"sua senha"} value={senha}
                onChange={e=>changeSenha(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
            <button className="btn btn-green btn-full" style={{marginTop:"8px",padding:"13px",fontSize:"15px"}}
              onClick={handleLogin} disabled={loading}>
              {loading?"⏳ Aguarde...":T("auth.btnEntrar")}
            </button>
            <button type="button" onClick={()=>{goTab("recover");setResetSent(false);}}
              style={{background:"none",border:"none",color:"var(--text3)",
                fontSize:"12px",cursor:"pointer",padding:"8px 0",
                width:"100%",textDecoration:"underline"}}>
              🔑 {T("auth.esqueceu")}
            </button>
          </>
        )}
        {tab==="recover"&&(
          <>{resetSent?(
            <div style={{background:"rgba(74,222,128,0.08)",border:"1px solid var(--green)",
              borderRadius:"var(--r)",padding:"20px",textAlign:"center",marginBottom:"12px"}}>
              <div style={{fontSize:"28px",marginBottom:"8px"}}>📧</div>
              <div style={{fontWeight:700,color:"var(--green)",marginBottom:"4px"}}>Email enviado!</div>
              <div style={{fontSize:"13px",color:"var(--text2)"}}>Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</div>
            </div>
          ):(
            <>
              <div className="form-group">
                <label className="form-label">Email cadastrado</label>
                <input className="form-input" type="email"
                  placeholder="email@exemplo.com"
                  value={email} onChange={e=>changeEmail(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleRecoverPassword()} autoFocus/>
              </div>
              <button className="btn btn-green btn-full"
                style={{marginTop:"8px",padding:"13px",fontSize:"15px"}}
                onClick={handleRecoverPassword} disabled={loading}>
                {loading?"Enviando...":"📧 Enviar link de recuperação"}
              </button>
            </>
          )}
          <button type="button" onClick={()=>goTab("login")}
            style={{background:"none",border:"none",color:"var(--text3)",
              fontSize:"12px",cursor:"pointer",padding:"8px 0",
              width:"100%",textDecoration:"underline",marginTop:"4px"}}>
            ← Voltar ao login
          </button>
          </>
        )}
        {tab==="register"&&(
          <>
            <div className="form-group">
              <label className="form-label">{T("auth.nome")}</label>
              <input className="form-input" autoComplete="name"
                placeholder={T("auth.nomeEx")} value={nome}
                onChange={e=>changeNome(e.target.value)} autoFocus/>
            </div>
            <div className="form-group">
              <label className="form-label">{T("auth.email")}</label>
              <input className="form-input" type="text" inputMode="email" autoComplete="email"
                placeholder="Ex: joao@gmail.com" value={email}
                onChange={e=>changeEmail(e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">{T("auth.senha")}</label>
              <input className="form-input" type="password" autoComplete="new-password"
                placeholder={T("auth.senha")} value={senha}
                onChange={e=>changeSenha(e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">{T("auth.role")}</label>
              <div style={{display:"flex",gap:"8px"}}>
                {[["aluno","👤 Aluno"],["treinador","🏋️ Personal"],["nutri","🥗 Nutricionista"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setRole(v)}
                    style={{flex:1,padding:"10px 4px",borderRadius:"var(--r)",border:"1.5px solid",fontSize:"12px",fontWeight:500,cursor:"pointer",
                      borderColor:role===v?"var(--green)":"var(--border2)",
                      background:role===v?"var(--green-dim2)":"var(--card2)",
                      color:role===v?"var(--green)":"var(--text2)"}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-green btn-full" style={{marginTop:"8px",padding:"13px",fontSize:"15px"}}
              onClick={handleRegister} disabled={loading}>
              {loading?"Criando conta...":T("auth.btnCriar")}
            </button>
          </>
        )}

        <div style={{display:"flex",gap:"6px",justifyContent:"center",marginBottom:"14px"}}>
          {Object.entries(IDIOMAS).map(([code,{short,color}])=>(
            <button key={code} onClick={()=>{setLang(code);setLangAtual(code);}}
              style={{padding:"6px 14px",borderRadius:"var(--r)",border:"2px solid",fontSize:"13px",
                cursor:"pointer",transition:"all .15s",fontWeight:700,letterSpacing:"0.05em",
                borderColor:langAtual===code?color:"var(--border2)",
                background:langAtual===code?color+"22":"var(--card2)",
                color:langAtual===code?color:"var(--text3)"}}>
              {short}
            </button>
          ))}
        </div>
        <div className="auth-demo">
          <div className="auth-demo-title">{T("auth.demo")}</div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {[["👤 Aluno","aluno@demo.com"],["🏋️ Personal","treinador@demo.com"],["🥗 Nutri","nutri@demo.com"]].map(([label,e])=>(
              <button key={e} onClick={()=>{setLoading(false);fillDemo(e,"123456");}}
                title="Clique para entrar automaticamente"
                style={{flex:"1 1 auto",padding:"9px 8px",borderRadius:"var(--r)",border:"1px solid rgba(74,222,128,0.2)",background:"rgba(74,222,128,0.05)",cursor:"pointer",fontSize:"12px",fontWeight:500,color:"var(--text)",transition:"background .1s"}}
                onMouseEnter={ev=>ev.currentTarget.style.background="rgba(74,222,128,0.12)"}
                onMouseLeave={ev=>ev.currentTarget.style.background="rgba(74,222,128,0.05)"}>
                {label}
              </button>
            ))}
          </div>
          <div style={{fontSize:"11px",color:"var(--text3)",marginTop:"8px",textAlign:"center"}}>{T("geral.cliqueOpcao")}</div>
        </div>
      </div>
    </div>
  );
}

function Shell({user,onLogout,nav,active,setActive,accent,alertCount,children}){
  useLang();
  const trial = useTrialInfo(user);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const allItems=nav.flatMap(s=>s.items);
  const [more,setMore]=useState(false);
  const primary=allItems.slice(0,4);
  const extra=allItems.slice(4);
  const rl={aluno:"Aluno",treinador:"Treinador",nutri:"Nutricionista"}[user.role];
  return(
    <div className="shell" style={{display:"flex",minHeight:"100vh"}}>

      {/* ── SIDEBAR: visível apenas no PC ── */}
      <aside className="sidebar">
        <div className="sidebar-logo"><span style={{width:"8px",height:"8px",borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 8px var(--green)",display:"inline-block",marginRight:"8px"}}></span>TrioFit</div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials(user?.nome||user?.email||"?")}</div>
          <div style={{flex:1,minWidth:0}}>
            <div className="sidebar-name">{user?.nome||user?.email}</div>
            <div className="sidebar-role">{rl}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {nav.map(s=>(
            <div key={s.section}>
              <div className="nav-section">{s.section}</div>
              {s.items.map(it=>(
                <button key={it.id}
                  className={"nav-item "+(active===it.id?"active "+accent:"")}
                  onClick={()=>setActive(it.id)}>
                  <span className="nav-icon">{it.icon}</span>
                  <span>{it.label}</span>
                  {it.id==="chat"&&alertCount>0&&<span className="nav-badge">{alertCount}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={onLogout}>🚪 Sair da conta</button>
        </div>
      </aside>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <main className="main" style={{flex:1,minWidth:0}}>{children}</main>

      {/* ── BOTTOM NAV: visível apenas no MOBILE ── */}
      <nav className="mobile-nav">
        <div className="mob-nav-inner" style={{display:"flex",width:"100%",justifyContent:"space-around",alignItems:"center",height:"100%"}}>
          {primary.map(it=>(
            <button key={it.id}
              className={"mob-btn "+(active===it.id?"active "+accent:"")}
              onClick={()=>{setActive(it.id);setMore(false);}}>
              <span className="mob-icon">{it.icon}</span>
              <span className="mob-label">{it.label.split(" ")[0]}</span>
            </button>
          ))}
          {(extra.length>0)&&(
            <div style={{position:"relative",flex:1,display:"flex",justifyContent:"center"}}>
              {more&&(
                <div className="mob-more-menu">
                  {extra.map(it=>(
                    <button key={it.id} className="mob-more-item"
                      onClick={()=>{setActive(it.id);setMore(false);}}>
                      <span>{it.icon}</span><span>{it.label}</span>
                    </button>
                  ))}
                  <button className="mob-more-item" style={{color:"var(--red)"}}
                    onClick={()=>{setMore(false);onLogout();}}>
                    🚪 Sair
                  </button>
                </div>
              )}
              <button className={"mob-btn "+(more?"active":"")}
                onClick={()=>setMore(p=>!p)}>
                <span className="mob-icon">☰</span>
                <span className="mob-label">{T("shell.mais")}</span>
              </button>
            </div>
          )}
        </div>
      </nav>

    </div>
  );
}
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
    if(codigo.trim().length<6){setErro(T("vinculo.digiteCodigo"));return;}
    setBuscando(true);
    try{
      const u=await DB.getUserByCodigo(codigo.trim().toUpperCase());
      setBuscando(false);
      if(!u){setErro(T("vinculo.codigoNaoEncontrado"));return;}
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
        <label className="form-label">{T("auth.codigo").replace("(treinador ou nutri)","").trim()} ({label})</label>
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
          <button className="btn btn-primary btn-sm" onClick={confirmar}>{T("vinculo.vincular")}</button>
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
          <div className="saude-status-icon">🩒</div>
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
          <div style={{flex:1}}><div className="saude-status-titulo" style={{color:"var(--green)"}}>{T("saude.saudavel")}</div><div className="saude-status-dias" style={{color:"var(--green)"}}>{T("saude.semRegistros")}</div></div>
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
      <div style={{fontSize:"0.8rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.75rem"}}>{T("geral.selecionarAluno")}</div>
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
          <div style={{fontSize:"0.75rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.3rem"}}>{T("prescr.vigencia")}</div>
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
  const DEMO_T={id:DEMO_TREINADOR_ID,nome:'Treinador Demo',email:'treinador@demo.com',role:'treinador',codigo:'DCD3F5'};
  const DEMO_N={id:DEMO_NUTRI_ID,nome:'Nutricionista Demo',email:'nutri@demo.com',role:'nutri',codigo:'373CBD'};
  const isDemo=(user.id||'').startsWith('demo-')||user.email==='aluno@demo.com';
  const [vinculo,setVinculo]=useState(isDemo?{treinadorId:DEMO_TREINADOR_ID,nutriId:DEMO_NUTRI_ID}:{});
  const [treinador,setTreinador]=useState(isDemo?DEMO_T:null);
  const [nutri,setNutri]=useState(isDemo?DEMO_N:null);
  useEffect(()=>{
    let cancelled=false;
    // For demo users, auto-connect to demo team
    if((user.id||'').startsWith('demo-')){
      const demoVinculo={
        treinadorId:DEMO_TREINADOR_ID,
        nutriId:DEMO_NUTRI_ID,
        treinador:{id:DEMO_TREINADOR_ID,nome:'Treinador Demo',email:'treinador@demo.com',role:'treinador',codigo:'DCD3F5'},
        nutri:{id:DEMO_NUTRI_ID,nome:'Nutricionista Demo',email:'nutri@demo.com',role:'nutri',codigo:'373CBD'},
      };
      setVinculo(demoVinculo);
      setTreinador(demoVinculo.treinador);
      setNutri(demoVinculo.nutri);
      return;
    }
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
      <div className="page-title green">{T("paginas.equipe")}</div>
      <div className="page-sub">{T("vinculo.instrucao")}</div>
      <div className="alert alert-info">🔐 Peça o código para seu treinador e nutricionista. Só quem tem o código pode se vincular — suas informações ficam protegidas.</div>
      <div className="card"><div className="card-title">🏋️ TREINADOR</div><VinculoPorCodigo label="Treinador" tipo="treinador" atual={treinador} onVincular={vincT}/>{treinador&&<button className="btn btn-ghost btn-sm" style={{marginTop:"0.5rem",color:"var(--red)"}} onClick={desT}>{T("vinculo.desvincular")}</button>}</div>
      <div className="card"><div className="card-title">🥗 NUTRICIONISTA</div><VinculoPorCodigo label="Nutricionista" tipo="nutri" atual={nutri} onVincular={vincN}/>{nutri&&<button className="btn btn-ghost btn-sm" style={{marginTop:"0.5rem",color:"var(--red)"}} onClick={desN}>{T("vinculo.desvincular")}</button>}</div>
    </div>
  );
}

// ============================================================
// ALUNO — SEMANA DE TREINOS
// ============================================================
function AlunoTreinos({
  user,showToast}){
  useLang();
  const [planoTreino,setPlanoTreino]=useState(undefined);
  const [planoReady,setPlanoReady]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    setPlanoReady(false);
    setPlanoTreino(undefined);
    const fetchPlano = () => {
      DB.getData("plano_treino_aluno",user.id).then(d=>{
        if(!cancelled){const _demo=user.id===DEMO_ALUNO_ID||user.email==="aluno@demo.com";setPlanoTreino(d||(_demo?DEMO_PLAN_ALUNO:null));setPlanoReady(true);}
      }).catch(()=>{
        if(!cancelled){const _demo=user.id===DEMO_ALUNO_ID||user.email==="aluno@demo.com";setPlanoTreino(_demo?DEMO_PLAN_ALUNO:null);setPlanoReady(true);}
      });
    };
    fetchPlano();
    // Re-fetch when tab becomes visible (trainer may have updated)
    const onVisible = () => { if(document.visibilityState==='visible') fetchPlano(); };
    document.addEventListener('visibilitychange', onVisible);
    // Also refresh every 60s
    const interval = setInterval(fetchPlano, 60000);
    const timeout=setTimeout(()=>{if(!cancelled){setPlanoReady(true);}},8000);
    return()=>{
      cancelled=true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange',onVisible);
      clearTimeout(timeout);};
  },[user.id]);
  const [diaAtivo,setDiaAtivo]=useState(0);
  const [checked, ,saveChecked]=useAlunoData(user.id,"treino_check_hoje",{});
  const [rating,setRating]=useState(0);
  const [feedback,setFeedback]=useState("");
  const [mostrarTroca,setMostrarTroca]=useState(false);
  const [diaOriginal,setDiaOriginal]=useState(null); // null = sem troca ativa
  const [treinosFinalizados,,saveTreinosFinalizados]=useAlunoData(user.id,"treinos_finalizados",{});
  const [confirmandoFinalizar,setConfirmandoFinalizar]=useState(false);
  const [treinoAtivo,setTreinoAtivo]=useState(false);
  const [treinoInicio,setTreinoInicio]=useState(null);
  const [treinoDuracao,setTreinoDuracao]=useState(0); // segundos
  const [treinoCronRef]=useState({interval:null});
  // Load saved avaliacao
  useEffect(()=>{
    let cancelled=false;
    DB.getData("treino_avaliacao",user.id).then(d=>{
      if(!cancelled&&d){setRating(d.rating||0);setFeedback(d.feedback||"");}
    }).catch(()=>{});
    return()=>{cancelled=true;};
  },[user.id]);

  // Cronômetro do treino
  useEffect(()=>{
    if(treinoAtivo){
      treinoCronRef.interval=setInterval(()=>{
        setTreinoDuracao(d=>d+1);
      },1000);
    } else {
      if(treinoCronRef.interval) clearInterval(treinoCronRef.interval);
    }
    return()=>{ if(treinoCronRef.interval) clearInterval(treinoCronRef.interval); };
  },[treinoAtivo]);

  function formatarTempo(seg){
    const h=Math.floor(seg/3600);
    const m=Math.floor((seg%3600)/60);
    const s=seg%60;
    if(h>0) return `${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  // Determina o dia atual da semana (0=seg)
  const hoje=new Date().getDay();
  const diaHoje=hoje===0?6:hoje-1;

  const diaHojeRef=useRef(diaHoje);
  useEffect(()=>{setDiaAtivo(diaHojeRef.current);},[]);

  const [timerSecs,setTimerSecs]=React.useState(0);
  const _timerRef=React.useRef(null);
  function _startTimer(s=60){
    if(_timerRef.current)clearInterval(_timerRef.current);
    setTimerSecs(s);
    _timerRef.current=setInterval(()=>setTimerSecs(p=>{if(p<=1){clearInterval(_timerRef.current);return 0;}return p-1;}),1000);
  }
  React.useEffect(()=>{return()=>{if(_timerRef.current)clearInterval(_timerRef.current);};},[]);

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
    return(<div className="page"><div className="page-header"><div className="page-title green">{T("paginas.treinos")}</div></div><div style={{color:"var(--text2)",padding:"2rem",textAlign:"center"}}><span className="spinner"/> Carregando treinos...</div></div>);
  }
  if(!planoTreino||!planoTreino.dias){
    return(
      <div className="page">
        <div className="page-header"><div className="page-title green">{T("paginas.treinos")}</div><div className="page-sub">{T("treino.semanaCompleta")}</div></div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          minHeight:"60vh",padding:"2rem",textAlign:"center",position:"relative"}}>
          {/* Glow background */}
          <div style={{position:"absolute",width:"300px",height:"300px",borderRadius:"50%",
            background:"radial-gradient(circle,rgba(74,222,128,0.06) 0%,transparent 70%)",
            pointerEvents:"none"}}/>
          {/* Icon circle */}
          <div style={{width:"90px",height:"90px",borderRadius:"50%",
            background:"linear-gradient(135deg,rgba(74,222,128,0.12),rgba(74,222,128,0.04))",
            border:"1.5px solid rgba(74,222,128,0.2)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:"36px",marginBottom:"24px",
            boxShadow:"0 0 32px rgba(74,222,128,0.1)"}}>
            🏋️
          </div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"1.4rem",fontWeight:700,
            marginBottom:"10px",color:"var(--text)"}}>
            Aguardando seu plano
          </div>
          <div style={{fontSize:"14px",color:"var(--text2)",lineHeight:1.7,maxWidth:"280px",marginBottom:"28px"}}>
            Seu personal trainer ainda não enviou um plano de treino.<br/>
            Assim que ele enviar, aparecerá aqui.
          </div>
          {/* Steps */}
          <div style={{display:"flex",flexDirection:"column",gap:"10px",width:"100%",maxWidth:"280px"}}>
            {[
              {n:"1",t:T("treino.conectePersonal"),d:T("treino.useCodigo")},
              {n:"2",t:T("treino.aguardePlano"),d:T("treino.elePrescreve")},
              {n:"3",t:T("treino.comeceTreinar"),d:T("treino.veraAqui")}
            ].map(({n,t,d})=>(
              <div key={n} style={{display:"flex",alignItems:"center",gap:"12px",
                background:"var(--card2)",borderRadius:"var(--r)",padding:"12px",
                border:"1px solid var(--border)"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"50%",flexShrink:0,
                  background:"var(--green-dim2)",border:"1px solid rgba(74,222,128,0.3)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"11px",fontWeight:700,color:"var(--green)"}}>
                  {n}
                </div>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:"13px",fontWeight:600,color:"var(--text)"}}>{t}</div>
                  <div style={{fontSize:"11px",color:"var(--text3)",marginTop:"1px"}}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const {dias,nome,modalidade,inicio,fim,duracao}=planoTreino;
  const diaInfo=dias[diaAtivo];
  const modLabel=MODALIDADES.find(m=>m.v===modalidade)?.l||modalidade;

  return(
    <div className="page">
      <div className="page-title green">{T("paginas.treinos")}</div>
      <div className="page-sub">{T("treino.semanaClique")}</div>

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
              onClick={()=>{setDiaAtivo(i);if(typeof setTreinoAtivo==="function")setTreinoAtivo(false);if(typeof setTreinoDuracao==="function")setTreinoDuracao(0);}}
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
              {ehHoje&&diaAtivo!==i&&<span style={{fontSize:"9px",color:"var(--green)"}}>{T("geral.hoje")}</span>}
            </button>
          );
        })}
      </div>

      {/* TREINO DO DIA */}
      {diaInfo.tipo==="descanso"?(
        <div className="treino-card" style={{textAlign:"center",padding:"2.5rem"}}>
          <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>😴</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"1.8rem",color:"var(--orange)",letterSpacing:"0.05em"}}>{T("geral.descanso")}</div>
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
                      <div style={{fontSize:"0.75rem",color:"var(--text2)",marginBottom:"0.4rem",fontWeight:600}}>{T("treino.fazerOutroDia")}</div>
                      {(dias||[]).map((d2,i2)=>i2!==diaHoje&&d2.tipo!=="descanso"?(
                        <button key={i2} className="btn btn-ghost btn-sm" style={{display:"block",width:"100%",textAlign:"left",fontSize:"0.8rem",padding:"0.3rem 0.5rem"}}
                          onClick={()=>{setDiaOriginal(diaHoje);setDiaAtivo(i2);setMostrarTroca(false);setTreinoAtivo(false);setTreinoDuracao(0);showToast&&showToast(`Fazendo ${d2.nome} hoje 💪`);}}>
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
                <div style={{fontFamily:"var(--font-display)",fontSize:"2rem",fontWeight:800,color:"var(--green)",lineHeight:1}}>
                  {(diaInfo.exercicios||[]).filter((_,j)=>checked[`${diaAtivo}_${j}`]).length}/{(diaInfo.exercicios||[]).length}
                </div>
                <div style={{fontSize:"0.7rem",color:"var(--text3)"}}>{T("treino.exercicios")}</div>
                <div style={{marginTop:"8px",height:"4px",background:"var(--border2)",borderRadius:"99px",width:"70px",overflow:"hidden"}}>
                  <div style={{height:"100%",background:"linear-gradient(90deg,var(--green),var(--green2))",borderRadius:"99px",transition:"width .4s ease",width:((diaInfo.exercicios||[]).length>0?Math.round((diaInfo.exercicios||[]).filter((_,j)=>checked[`${diaAtivo}_${j}`]).length/(diaInfo.exercicios||[]).length*100):0)+"%"}}/>
                </div>
              </div>
            )}
          </div>

          {diaInfo.obs&&<div style={{background:"rgba(52,152,219,0.1)",border:"1px solid rgba(52,152,219,0.2)",borderRadius:"var(--radius)",padding:"0.75rem",fontSize:"0.85rem",color:"var(--blue)",marginBottom:"1rem"}}>📌 {diaInfo.obs}</div>}

          {diaInfo.exercicios&&(diaInfo.exercicios||[]).length>0?(
            <>
              {/* ▶ Iniciar / Pausar cronômetro */}
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
                {!treinoAtivo?(
                  <button className="btn btn-primary btn-sm" onClick={()=>{setTreinoAtivo(true);if(!treinoInicio)setTreinoInicio(Date.now());}}>
                    ▶ {T("treino.iniciar")||"Iniciar treino"}
                  </button>
                ):(
                  <button className="btn btn-ghost btn-sm" onClick={()=>setTreinoAtivo(false)}>
                    ⏸ {T("treino.pausar")||"Pausar"}
                  </button>
                )}
                {treinoDuracao>0&&(
                  <span style={{fontFamily:"monospace",fontSize:"1.1rem",fontWeight:700,color:"var(--green)"}}>
                    {String(Math.floor(treinoDuracao/3600)).padStart(2,"0")}:{String(Math.floor((treinoDuracao%3600)/60)).padStart(2,"0")}:{String(treinoDuracao%60).padStart(2,"0")}
                  </span>
                )}
                <div style={{marginLeft:"auto",display:"flex",gap:"6px"}}>
                  {[30,60,90,120].map(s=>(
                    <button key={s} className="btn btn-ghost btn-sm" style={{fontSize:"11px",padding:"3px 8px"}}
                      onClick={()=>_startTimer(s)}>
                      {s<60?s+"s":s/60+"min"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="prog-wrap">
                <div className="prog-hdr"><span>{T("treino.progresso")}: </span><span className="green">{(diaInfo.exercicios||[]).filter((_,j)=>checked[`${diaAtivo}_${j}`]).length}/{(diaInfo.exercicios||[]).length}</span></div>
                <div className="prog-track"><div className="prog-fill green" style={{width:`${((diaInfo.exercicios||[]).filter((_,j)=>checked[`${diaAtivo}_${j}`]).length/(diaInfo.exercicios||[]).length)*100}%`}}/></div>
              </div>
              {timerSecs>0&&(
                <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 14px",background:"var(--orange-dim2)",border:"1px solid rgba(251,146,60,0.25)",borderRadius:"var(--r)",marginBottom:"10px"}}>
                  <div style={{fontSize:"22px",fontWeight:700,color:"var(--orange)",minWidth:"52px"}}>{String(Math.floor(timerSecs/60)).padStart(2,'0')}:{String(timerSecs%60).padStart(2,'0')}</div>
                  <div style={{flex:1}}><div style={{fontWeight:600,fontSize:"13px",color:"var(--orange)"}}>⏱️ Descanso</div><div style={{fontSize:"11px",color:"var(--text2)"}}>{T("treino.proximaSerie")}</div></div>
                  <button className="btn btn-ghost btn-sm" onClick={()=>{clearInterval(_timerRef.current);setTimerSecs(0);}} style={{fontSize:"12px"}}>{T("treino.pular")}</button>
                </div>
              )}
              {(diaInfo.exercicios||[]).map((ex,j)=>(
                <div key={j} className={`ex-item ${checked[`${diaAtivo}_${j}`]?"done-ex":""}`} onClick={()=>toggleEx(diaAtivo,j)}>
                  <div className={`check-box ${checked[`${diaAtivo}_${j}`]?"checked":""}`}
                    style={{transition:"all .2s",transform:checked[`${diaAtivo}_${j}`]?"scale(1.1)":"scale(1)"}}>
                    {checked[`${diaAtivo}_${j}`]&&"✓"}
                  </div>
                  <div style={{flex:1}}>
                    <div className="ex-nome" style={{textDecoration:checked[`${diaAtivo}_${j}`]?"line-through":"none"}}>{ex.nome}</div>
                    {ex.obs&&<div style={{fontSize:"12px",color:"var(--orange)",fontStyle:"italic",marginTop:"2px",fontWeight:400}}>💡 {ex.obs}</div>}
                    {ex.video&&<a href={ex.video} target="_blank" rel="noreferrer"
                      style={{display:"inline-flex",alignItems:"center",gap:"4px",fontSize:"0.75rem",
                        padding:"3px 10px",borderRadius:"6px",background:"#ef444422",color:"#ef4444",
                        border:"1.5px solid #ef4444",textDecoration:"none",fontWeight:700,
                        marginBottom:"4px",marginTop:"2px"}}>
                      ▶ Ver execução
                    </a>}
                    <div className="ex-info">{ex.series&&`${ex.series} séries`}{ex.reps&&` × ${ex.reps}`}{ex.carga&&` • ${ex.carga}`}{ex.duracao&&` • ${ex.duracao}`}</div>
                  </div>
                </div>
              ))}
            </>
          ):<div style={{color:"var(--text3)",fontSize:"0.85rem",padding:"1rem 0"}}>{T("treino.semExercicio")}</div>}
        </div>
      )}

      {/* FINALIZAR TREINO */}
      {diaInfo.tipo!=="descanso"&&diaAtivo===diaHoje&&(
        treinoDeHojeFinalizado?(
          <div className="card" style={{textAlign:"center",padding:"1.5rem"}}>
            <div style={{fontSize:"3rem",marginBottom:"0.5rem"}}>🏆</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:"1.2rem",color:"var(--green)",marginBottom:"0.3rem"}}>{T("treino.finalizado")}</div>
            <div style={{fontSize:"0.85rem",color:"var(--text2)",marginBottom:"0.5rem"}}>{T("treino.otimoTrabalho")}</div>
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
              <label className="form-label">{T("treino.avaliar")}</label>
              <div className="stars">{[1,2,3,4,5].map(s=><div key={s} style={{fontSize:"2rem",cursor:"pointer",color:s<=rating?"var(--orange)":"var(--text3)"}} onClick={()=>setRating(s)}>★</div>)}</div>
            </div>
            <div className="form-group"><label className="form-label">{T("treino.feedback")}</label><textarea className="form-textarea" rows={2} placeholder="Como foi? Alguma dificuldade?" value={feedback} onChange={e=>setFeedback(e.target.value)}/></div>
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
                <div style={{fontSize:"0.85rem",color:"var(--text2)",marginBottom:"0.75rem"}}>{T("treino.finalizar")}</div>
                <div style={{display:"flex",gap:"0.5rem"}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setConfirmandoFinalizar(false)}>{T("geral.continuar")}</button>
                  <button className="btn btn-primary btn-sm" onClick={()=>finalizarTreino(diaAtivo,diaInfo,checked)}>{T("treino.finalizarAssim")}</button>
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
function AlunoAlimentacao({
  user,showToast}){
  useLang();
  const [planoAlim,setPlanoAlim]=useState(undefined);
  const [planoAlimReady,setPlanoAlimReady]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    const fetchAlim=()=>{
      DB.getData("plano_alim_aluno",user.id).then(d=>{
        if(!cancelled){setPlanoAlim(d);setPlanoAlimReady(true);}
      }).catch(()=>{
        if(!cancelled){setPlanoAlim(null);setPlanoAlimReady(true);}
      });
    };
    fetchAlim();
    const onVisAlim=()=>{if(document.visibilityState==='visible')fetchAlim();};
    document.addEventListener('visibilitychange',onVisAlim);
    const timeout=setTimeout(()=>{if(!cancelled){setPlanoAlimReady(true);}},5000);
    return()=>{document.removeEventListener('visibilitychange',onVisAlim);cancelled=true;clearTimeout(timeout);};
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
    showToast&&showToast(T("alim.obsSalva"));
  }

  const refeicoes=planoAlim?.refeicoes||[
    {h:"07:00",r:T("geral.cafe"),i:"3 ovos + pão integral + banana + café",k:480},
    {h:"10:00",r:T("geral.lancheManha"),i:"Iogurte grego + castanhas",k:280},
    {h:"12:30",r:T("geral.almoco"),i:"Frango grelhado + arroz integral + salada",k:580},
    {h:"16:00",r:T("geral.preTreino"),i:"Batata doce + whey",k:320},
    {h:"19:00",r:T("geral.posTreino"),i:"Tilápia + arroz + brócolis",k:450},
    {h:"21:30",r:T("geral.ceia"),i:"Cottage + pasta de amendoim",k:220},
  ];

  const totalPrescrito=refeicoes.reduce((s,r)=>s+r.k,0);
  const totalComido=refeicoes.filter((_,i)=>comido[i]).reduce((s,r)=>s+r.k,0);
  const qtdComido=Object.values(comido).filter(Boolean).length;

  return(
    <div className="page">
      <div className="page-header">
        <div className="page-title green">{T("paginas.alimentacao")}</div>
        <div className="page-sub">{T("alim.marcarComida")}</div>
      </div>

      {planoAlim&&<PeriodoBadge plano={planoAlim}/>}

      <div className="grid-2" style={{marginBottom:"1.5rem"}}>
        <div className="stat-tile">
          <div className="stat-label">{T("alim.refeicoesFeiras")}</div>
          <div className="stat-value green">{qtdComido}<span className="stat-unit">/{refeicoes.length}</span></div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">{T("alim.kcalConsumidas")}</div>
          <div className="stat-value orange">{totalComido}<span className="stat-unit">/{totalPrescrito}</span></div>
        </div>
      </div>

      <div className="prog-wrap" style={{marginBottom:"1.5rem"}}>
        <div className="prog-hdr"><span>{T("alim.progressoDia")}</span> <span className="green">{Math.round((qtdComido/refeicoes.length)*100)}%</span></div>
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
        <textarea className="form-textarea" placeholder={T("alim.feedbackPh")} value={obs} onChange={e=>setObs(e.target.value)}/>
        <button className="btn btn-primary" style={{marginTop:"0.75rem"}} onClick={salvarObs}>💾 Salvar observação</button>
      </div>
    </div>
  );
}

// ============================================================
// ALUNO — HIDRATAÇÃO
// ============================================================
function AlunoHidratacao({
  user,showToast}){
  useLang();
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
        <div className="page-title green">{T("paginas.hidratacao")}</div>
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
        {ml>0&&<button className="btn btn-ghost" style={{marginTop:"1rem"}} onClick={()=>{setMl(0);DB.setData("agua_hoje",user.id,0);}}>{T("hidra.zerar")}</button>}
      </div>
      <div className="card">
        <div className="card-title">⚙️ META DIÁRIA</div>
        <div style={{display:"flex",gap:"0.75rem"}}>
          <input className="form-input" type="number" value={novaMeta} onChange={e=>setNovaMeta(e.target.value)}/>
          <button className="btn btn-blue" onClick={salvarMeta}>{T("geral.salvar")}</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ALUNO — SAÚDE
// ============================================================
function AlunoSaude({
  user,showToast}){
  useLang();
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
  function marcarRecuperado(){setDoente(false);setDoenteDe(null);setSintomas("");salvar({doente:false,doente_desde:null,sintomas:""});showToast&&showToast(T("saude.recuperacao"));}
  function adicionarDor(){if(!musculoSel.length)return;const agora=new Date().toISOString();const novas=[...dores,...musculoSel.filter(m=>!dores.find(d=>d.musculo===m)).map(m=>({musculo:m,desde:agora,intensidade:5}))];setDores(novas);setMusculoSel([]);salvar({dores:novas});}
  function removerDor(idx){const novas=dores.filter((_,i)=>i!==idx);setDores(novas);salvar({dores:novas});}
  return(
    <div className="page">
      <div className="page-header">
        <div className="page-title green">{T("paginas.saude")}</div>
        <div className="page-sub">{T("saude.avisoEquipe")}</div>
      </div>
      <div className="card">
        <div className="card-title">📊 STATUS ATUAL</div>
        <SaudeStatusCard status={{doente,doente_desde:doenteDe,sintomas,dores}} onRecuperado={marcarRecuperado} onDorRecuperado={removerDor} soLeitura={false}/>
      </div>
      <div style={{background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.15)",
        borderRadius:"var(--r)",padding:"16px",marginBottom:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
          <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"var(--red)",
            boxShadow:"0 0 8px rgba(239,68,68,0.5)"}}/>
          <span style={{fontSize:"10px",fontWeight:700,textTransform:"uppercase",
            letterSpacing:"0.1em",color:"rgba(239,68,68,0.8)"}}>{T("saude.registrarDoenca")}</span>
        </div>
        {!doente?(
          <>
            <div className="form-group" style={{marginBottom:"10px"}}>
              <label className="form-label">{T("saude.sintomas")}</label>
              <input className="form-input" placeholder={T("saude.doencaEx")} 
                value={sintomas} onChange={e=>setSintomas(e.target.value)}/>
            </div>
            <button onClick={marcarDoente}
              style={{width:"100%",padding:"11px",borderRadius:"var(--r)",border:"1px solid rgba(239,68,68,0.3)",
                background:"rgba(239,68,68,0.08)",color:"var(--red)",fontWeight:600,fontSize:"14px",
                cursor:"pointer",transition:"all .15s"}}>
              🤒 Estou doente
            </button>
          </>
        ):(
          <div style={{fontSize:"13px",color:"var(--text2)",textAlign:"center",padding:"8px 0"}}>
            {diffDays(doenteDe)} {pluralDia(diffDays(doenteDe))} de doença — clique em "Recuperado" acima
          </div>
        )}
      </div>
      <div style={{background:"var(--card)",border:"1px solid var(--border)",
        borderRadius:"var(--r)",padding:"16px",marginBottom:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
          <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"var(--orange)",
            boxShadow:"0 0 8px rgba(251,146,60,0.5)"}}/>
          <span style={{fontSize:"10px",fontWeight:700,textTransform:"uppercase",
            letterSpacing:"0.1em",color:"var(--text3)"}}>{T("saude.dores")}</span>
        </div>
        {/* Dores ativas */}
        {(dores||[]).length>0&&(
          <div style={{marginBottom:"12px",display:"flex",flexDirection:"column",gap:"6px"}}>
            {(dores||[]).map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",
                padding:"10px 12px",background:"rgba(251,146,60,0.06)",
                borderRadius:"var(--r)",border:"1px solid rgba(251,146,60,0.2)"}}>
                <span style={{fontSize:"16px"}}>🟠</span>
                <span style={{flex:1,fontSize:"13px",fontWeight:500,color:"var(--text)"}}>
                  {d.musculo} <span style={{color:"var(--text3)",fontWeight:400}}>— {diffDays(d.desde)} {pluralDia(diffDays(d.desde))}</span>
                </span>
                <button onClick={()=>removerDor(i)}
                  style={{padding:"4px 10px",borderRadius:"6px",border:"none",
                    background:"rgba(74,222,128,0.1)",color:"var(--green)",
                    fontSize:"11px",fontWeight:600,cursor:"pointer"}}>✓ OK</button>
              </div>
            ))}
          </div>
        )}
        {/* Muscle grid */}
        <div style={{fontSize:"12px",color:"var(--text3)",marginBottom:"10px",fontWeight:500}}>
          Selecione os músculos com dor:
        </div>
        <div className="pain-grid" style={{marginBottom:"12px"}}>
          {MUSCLES.map(m=>(
            <div key={m} className={`muscle-btn ${musculoSel.includes(m)?"selected":""}`}
              onClick={()=>setMusculoSel(p=>p.includes(m)?p.filter(x=>x!==m):[...p,m])}>
              {m}
            </div>
          ))}
        </div>
        {musculoSel.length>0&&(
          <button onClick={adicionarDor}
            style={{width:"100%",padding:"11px",borderRadius:"var(--r)",
              border:"1px solid rgba(251,146,60,0.3)",
              background:"rgba(251,146,60,0.08)",color:"var(--orange)",
              fontWeight:600,fontSize:"14px",cursor:"pointer"}}>
            🔴 Registrar dor: {musculoSel.join(", ")}
          </button>
        )}
      </div>
      <div className="card">
        <div className="card-title">🔢 OUTRAS INFORMAÇÕES</div>
        <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 0",
          borderBottom:"1px solid var(--border)",cursor:"pointer"}}
          onClick={()=>{setMens(!mens);salvar({mens:!mens});}}>
          <div style={{width:"24px",height:"24px",borderRadius:"8px",flexShrink:0,
            border:mens?"none":"1.5px solid var(--border2)",
            background:mens?"linear-gradient(135deg,var(--green),var(--green2))":"transparent",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:"13px",color:"#000",fontWeight:700,transition:"all .15s"}}>
            {mens&&"✓"}
          </div>
          <span style={{fontSize:"14px",fontWeight:500}}>{T("saude.menstrual")}</span>
        </div>
        <div className="form-group" style={{marginTop:"0.75rem"}}><label className="form-label">💊 Medicamentos</label><textarea className="form-textarea" placeholder="Ex: Vitamina D 2000UI, Creatina 5g..." value={meds} onChange={e=>setMeds(e.target.value)}/></div>
        <div className="form-group"><label className="form-label">📝 Observações</label><textarea className="form-textarea" placeholder={T("saude.infoEquipe")} value={obs} onChange={e=>setObs(e.target.value)}/></div>
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
    showToast&&showToast(T("aval.salva"));
    try{
      const vinculo=await DB.getVinculoAluno(user.id);
      const msg=`📊 ${user.nome} atualizou a avaliação física${f.peso?" — Peso: "+f.peso+"kg":""}`;
      if(vinculo?.treinadorId)await DB.criarNotificacao(vinculo.treinadorId,"avaliacao",T("aval.nova"),msg);
      if(vinculo?.nutriId)await DB.criarNotificacao(vinculo.nutriId,"avaliacao",T("aval.nova"),msg);
    }catch{}
  }
  const imc=calcIMC(f.peso,f.altura);
  return(
    <div className="page">
      <div className="page-header">
        <div className="page-title green">{T("paginas.avaliacao")}</div>
        <div className="page-sub">{T("aval.visivel")}</div>
      </div>
      {imc&&(
        <div className="card">
          <div className="card-title">📊 IMC Calculado</div>
          <div className="grid-2" style={{marginBottom:0}}>
            <div className="stat-tile"><div className="stat-label">{T("aval.imc")}</div><div className="stat-value green">{imc.val}</div><div className="stat-sub">{imc.cat}</div></div>
            <div className="stat-tile"><div className="stat-label">{T("aval.pesoAltura")}</div><div style={{marginTop:"0.4rem",fontWeight:700}}>{f.peso||"—"}kg / {f.altura||"—"}cm</div></div>
          </div>
        </div>
      )}
      <div className="card">
        <div className="card-title">📏 MEDIDAS CORPORAIS</div>
        <div className="grid-2">
          {[["peso",T("diario.peso"),"kg"],["altura","Altura","cm"],["gordura","% Gordura","%"],["massa","Massa Magra","kg"],["cintura","Cintura","cm"],["quadril","Quadril","cm"],["braco_d","Braço D","cm"],["braco_e","Braço E","cm"],["perna_d","Perna D","cm"],["perna_e","Perna E","cm"]].map(([k,l,u])=>(
            <div key={k} className="form-group"><label className="form-label">{l}</label>
              <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
                <input className="form-input" type="number" placeholder="0" value={f[k]||""} onChange={e=>set(k,e.target.value)}/>
                <span style={{color:"var(--text2)",flexShrink:0}}>{u}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="form-group"><label className="form-label">{T("geral.observacoes")}</label><textarea className="form-textarea" value={f.obs||""} onChange={e=>set("obs",e.target.value)} placeholder={T("aval.notasGerais")}/></div>
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
                  <div className="stat-tile" style={{flex:1}}><div className="stat-label">{T("aval.pesoAtual")}</div><div className="stat-val" style={{color:"var(--green)"}}>{last}kg</div></div>
                  <div className="stat-tile" style={{flex:1}}><div className="stat-label">{T("aval.variacao")}</div><div className="stat-val" style={{color:parseFloat(diff)<0?"var(--green)":parseFloat(diff)>0?"var(--orange)":"var(--text)"}}>{parseFloat(diff)>0?"+":""}{diff}kg</div></div>
                  <div className="stat-tile" style={{flex:1}}><div className="stat-label">{T("aval.registros")}</div><div className="stat-val">{pts.length}</div></div>
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
  const {confirm,Modal:ConfirmCompModal}=useConfirm();
  const [editComp,setEditComp]=useState(null);
  const [comps,setComps]=useState([]);
  const [aba,setAba]=useState("lista");
  useEffect(()=>{let c=false;DB.getData("competicoes",user.id).then(d=>{if(!c&&d)setComps(d);}).catch(()=>{});return()=>{c=true;};},[user.id]);
  const [f,setF]=useState({nome:"",modalidade:"Corrida",data:"",local:"",objetivo:"Completar"});
  async function set(k,v){setF(p=>({...p,[k]:v}));}
  useEffect(()=>{
    if(editComp){setF(p=>({...p,...editComp}));}
    else{setF({nome:"",modalidade:"Corrida",data:"",local:"",objetivo:"Completar",obs:""});}
  },[editComp]);
  async function add(){
    if(!f.nome){showToast&&showToast("Informe o nome do evento","warn");return;}
    if(!f.data){showToast&&showToast("Informe a data do evento","warn");return;}
    let novo;
    if(editComp!==null&&editComp.idx!==undefined){
      // Editar existente
      novo=comps.map((c,i)=>i===editComp.idx?{...c,...f}:c);
      showToast&&showToast("Competição atualizada! ✅");
    } else {
      // Adicionar nova
      novo=[...comps,{...f,id:Date.now()}];
      showToast&&showToast("Competição cadastrada! 🏆");
    }
    setComps(novo);
    await DB.setData("competicoes",user.id,novo);
    setF({nome:"",modalidade:"Corrida",data:"",local:"",objetivo:"Completar"});
    setEditComp(null);
    setAba("lista");
  }
  async function remover(id){const n=comps.filter(c=>c.id!==id);setComps(n);await DB.setData("competicoes",user.id,n);}
  return(
    <>{ConfirmCompModal}
    <div className="page">
      <div className="page-header">
        <div className="page-title green">{T("paginas.competicoes")}</div>
        <div className="page-sub">{T("aval.visivel")}</div>
      </div>
      {aba==="lista"&&(comps||[]).length>0&&<div className="card"><div className="card-title">📅 MEUS EVENTOS</div>
          {(comps||[]).map((c,i)=>{
            const d=new Date(c.data);
            const diff=Math.ceil((d-new Date())/(1000*60*60*24));
            const passou=diff<0;
            const faltaLabel=passou?`Passou há ${Math.abs(diff)}d`:diff===0?"HOJE!":diff===1?"Amanhã!":`${diff} dias`;
            const faltaColor=passou?"var(--text3)":diff<=7?"var(--red)":diff<=30?"var(--orange)":"var(--green)";
            return(
              <div key={i} className="comp-card" style={{background:"var(--bg2)"}}>
                <div className="comp-date">
                  <div className="comp-date-day">{d.getDate()}</div>
                  <div className="comp-date-month">{d.toLocaleDateString("pt-BR",{month:"short"})}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600}}>{c.nome}</div>
                  <div style={{fontSize:"0.8rem",color:"var(--text2)"}}>{c.modalidade} • {c.local}</div>
                  <div style={{marginTop:"4px",display:"flex",alignItems:"center",gap:"6px"}}>
                    <span style={{fontSize:"0.75rem",fontWeight:600,color:faltaColor}}>⏱️ {faltaLabel}</span>
                    {!passou&&<div style={{flex:1,height:"4px",borderRadius:"2px",background:"var(--border)"}}>
                      <div style={{height:"100%",borderRadius:"2px",background:faltaColor,width:Math.max(2,Math.min(100,(1-diff/90)*100))+"%"}}/>
                    </div>}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"4px",alignItems:"flex-end"}}>
                  <span className="tag tag-orange">{c.objetivo.toUpperCase()}</span>
                  <div style={{display:"flex",gap:"4px"}}>
                    <button className="btn btn-ghost btn-sm" style={{fontSize:"0.7rem",padding:"2px 6px"}}
                      onClick={e=>{e.stopPropagation();setEditComp({...c,idx:i});setAba("form");}}>✏️</button>
                    <button className="btn btn-ghost btn-sm" style={{fontSize:"0.7rem",padding:"2px 6px",color:"var(--red)"}}
                      onClick={async e=>{
                        e.stopPropagation();
                        
                        const novo=(comps||[]).filter((_,j)=>j!==i);
                        await DB.setData("competicoes",user.id,novo);
                        setComps(novo);
                        showToast&&showToast("Competição removida","warn");
                      }}>🗑️️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>}
      <div style={{display:"flex",gap:"8px",marginBottom:"0.5rem"}}>
        <button className={`btn btn-sm ${aba==="lista"?"btn-primary":"btn-ghost"}`} onClick={()=>{setEditComp(null);setAba("lista");}}>📅 Lista</button>
        <button className={`btn btn-sm ${aba==="form"?"btn-primary":"btn-ghost"}`} onClick={()=>{setEditComp(null);setAba("form");}}>➕ Nova competição</button>
      </div>
      {aba==="form"&&<div className="card">
        <div className="card-title">{editComp?"✏️ EDITAR COMPETIÇÃO":"➕ NOVA COMPETIÇÃO"}</div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">{T("comp.nomeEvento")}</label><input className="form-input" placeholder={T("comp.eventoEx")} value={f.nome} onChange={e=>set("nome",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">{T("comp.modalidade")}</label><select className="form-select" value={f.modalidade} onChange={e=>set("modalidade",e.target.value)}>{["Corrida","Natação","Triathlon / Ironman","Luta","Fisiculturismo","Ciclismo","Caminhada"].map(m=><option key={m}>{m}</option>)}</select></div>
          <div className="form-group"><label className="form-label">{T("diario.data")}</label><input className="form-input" type="date" value={f.data} onChange={e=>set("data",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">{T("comp.local")}</label><input className="form-input" placeholder="Cidade / Local" value={f.local} onChange={e=>set("local",e.target.value)}/></div>
        </div>
        <div className="form-group"><label className="form-label">{T("geral.objetivo")}</label><select className="form-select" value={f.objetivo} onChange={e=>set("objetivo",e.target.value)}>{["Completar","Bater meu recorde","Subir no pódio","Subir no palco","Definição de peso"].map(o=><option key={o}>{o}</option>)}</select></div>
        <button className="btn btn-primary" onClick={add}>{editComp?"💾 Salvar alterações":"+ Cadastrar evento"}</button>
        {editComp&&<button className="btn btn-ghost btn-sm" style={{marginTop:"0.5rem"}} onClick={()=>{setEditComp(null);setAba("lista");}}>{T("comp.cancelarEdicao")}</button>}
      </div>}
    </div>
    </>
  );
}

// ============================================================
// ALUNO — DASHBOARD
// ============================================================
function AlunoDash({
  user,setPage,vinculo,treinador,nutri}){
  const trialInfo=useTrialInfo(user);
  useLang();
  const [_planoDB]=useAlunoData(user.id,"plano_treino_aluno",null);
  const plano=_planoDB||(user.id===DEMO_ALUNO_ID||user.email==="aluno@demo.com"?DEMO_PLAN_ALUNO:null);
  const [checked]=useAlunoData(user.id,"treino_checked",{});
  const [msgs,setMsgs]=useState(0);
  useEffect(()=>{DB.getMensagensNaoLidas(user.id).then(d=>setMsgs(d.length)).catch(()=>{});},[user.id]);

  const hoje=new Date();
  const hora=hoje.getHours();
  const saudacao=hora<12?T("saudacao.bomDia"):hora<18?T("saudacao.boaTarde"):T("saudacao.boaNoite");
  // Calcular streak de dias treinados
  const streak=useMemo(()=>{
    if(!checked)return 0;
    let s=0;
    const d=new Date();
    for(let i=0;i<30;i++){
      const dateStr=new Date(d.getTime()-i*86400000).toISOString().slice(0,10);
      const dayIdx=[6,0,1,2,3,4,5][new Date(d.getTime()-i*86400000).getDay()];
      const had=Object.keys(checked||{}).some(k=>k.startsWith(dayIdx+"_")&&checked[k]&&k.includes(dateStr.replace(/-/g,"")));
      if(i===0&&!had)continue;
      if(had)s++;
      else break;
    }
    return s;
  },[checked]);
  const diaIdx=[6,0,1,2,3,4,5][hoje.getDay()];
  const diaHoje=plano?.dias?.[diaIdx];
  const isDescanso=diaHoje?.tipo==="descanso"||!diaHoje;
  const totalEx=diaHoje?.exercicios?.length||0;
  const nomeHoje=diaHoje?.nome||T("dash.treinoHoje");
  const dataHojeStr=hoje.toISOString().slice(0,10);
  function exportarTreinoPDF(){
    if(!diaInfo||!diaInfo.exercicios||diaInfo.exercicios.length===0) return;
    const diasNome=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
    const dataHoje=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
    const linhas=diaInfo.exercicios.map((ex,i)=>{
      const totalS=Number(ex.series)||0;
      const doneS=totalS>0?Array.from({length:totalS}).filter((_,si)=>checked[`series_${diaAtivo}_${i}_${si}`]).length:0;
      const done=checked[`${diaAtivo}_${i}`];
      return `<tr style="border-bottom:1px solid #eee;background:${done?'#f0fdf4':'white'}">
        <td style="padding:10px;font-weight:600">${done?'✓ ':''}${i+1}. ${ex.nome||'-'}</td>
        <td style="padding:10px;text-align:center">${totalS>0?`${doneS}/${totalS}`:ex.series||'-'}</td>
        <td style="padding:10px;text-align:center">${ex.reps||'-'}</td>
        <td style="padding:10px;text-align:center">${ex.carga||'-'}</td>
        <td style="padding:10px;color:#666;font-size:12px">${ex.obs||''}</td>
      </tr>`;}).join('');
    const durStr=treinoDuracao>0?`<p style="color:#16a34a;font-weight:700">⏱ Duração do treino: ${formatarTempo(treinoDuracao)}</p>`:'';
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Treino — TrioFit</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#111;padding:0 20px}
        h1{color:#16a34a;font-size:28px;margin-bottom:4px}
        h2{font-size:18px;color:#333;margin-bottom:20px;font-weight:400}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        th{background:#f0fdf4;padding:10px;text-align:left;font-size:13px;color:#166534;border-bottom:2px solid #16a34a}
        tr:nth-child(even){background:#f9fafb}
        .footer{margin-top:30px;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:12px}
      </style></head><body>
      <h1>🏋️ ${diaInfo.nome||'Treino'}</h1>
      <h2>${dataHoje}</h2>
      ${durStr}
      <table>
        <thead><tr>
          <th>Exercício</th><th>Séries</th><th>Reps</th><th>Carga</th><th>Observação</th>
        </tr></thead>
        <tbody>${linhas}</tbody>
      </table>
      <div class="footer">Gerado pelo TrioFit · triofit.vercel.app</div>
      </body></html>`;
    const blob=new Blob([html],{type:'text/html'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=`treino-${(diaInfo.nome||'treino').replace(/\s+/g,'-').toLowerCase()}.html`;
    a.click(); URL.revokeObjectURL(url);
    showToast&&showToast('✅ Treino exportado!','success');
  }

  const feitosHoje=Object.keys(checked||{}).filter(k=>k.startsWith(diaIdx+"_")).filter(k=>(checked||{})[k]).length;

  return(
    <div className="page">
      {/* HERO — TREINO DE HOJE */}
      <div style={{background:isDescanso?"var(--card2)":"linear-gradient(135deg,rgba(74,222,128,0.15),rgba(74,222,128,0.05))",border:"1px solid",borderColor:isDescanso?"var(--border)":"rgba(74,222,128,0.25)",borderRadius:"var(--r-xl)",padding:"20px",marginBottom:"16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
          <div style={{fontSize:"12px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text3)"}}>
            {hoje.toLocaleDateString("pt-BR",{weekday:"long"}).replace(/^\w/,c=>c.toUpperCase())}
          </div>
          <div style={{fontSize:"13px",fontWeight:600,color:isDescanso?"var(--text2)":"var(--green)"}}>
            {saudacao}, {user.nome?.split(" ")[0]}! {hora<12?"☀️":hora<18?"🌤️":"🌙"}
          </div>
        </div>
        {isDescanso?(
          <>
            <div style={{fontSize:"32px",marginBottom:"6px"}}>😴</div>
            <div style={{fontSize:"20px",fontWeight:700,color:"var(--text)"}}>{T("geral.diaDescanso")}</div>
            <div style={{fontSize:"13px",color:"var(--text2)",marginTop:"4px"}}>{T("geral.descanseMensagem")}</div>
          </>
        ):(
          <>
            <div style={{fontSize:"13px",color:"var(--green)",fontWeight:600,marginBottom:"6px"}}>🏋️ TREINO DE HOJE</div>
            <div style={{fontSize:"20px",fontWeight:700,color:"var(--text)",marginBottom:"4px"}}>{nomeHoje.split("—")[0].trim()}</div>
            <div style={{fontSize:"13px",color:"var(--text2)",marginBottom:"16px"}}>{totalEx} exercício{totalEx!==1?"s":""}</div>
            <div style={{marginBottom:"12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"var(--text2)",marginBottom:"5px"}}>
                <span>{totalEx} exercícios</span>
                <span style={{color:"var(--green)",fontWeight:600}}>{feitosHoje}/{totalEx}</span>
              </div>
              <div style={{height:"4px",background:"var(--border2)",borderRadius:"99px",overflow:"hidden"}}>
                <div style={{height:"100%",width:(totalEx>0?Math.round(feitosHoje/totalEx*100):0)+"%",background:"var(--green)",borderRadius:"99px",transition:"width .4s"}}/>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px",padding:"8px 0"}}>
              <div>
                <div style={{fontSize:"13px",fontWeight:700,color:"var(--text)"}}>{nomeHoje}</div>
                <div style={{fontSize:"11px",color:"var(--text3)"}}>{totalEx} {T("treino.exercicios")} • {feitosHoje}/{totalEx} {T("treino.progresso").toLowerCase()}</div>
              </div>
              {feitosHoje===totalEx&&totalEx>0&&<span style={{fontSize:"20px"}}>🏆</span>}
            </div>
            <button className="btn btn-green btn-full" style={{fontSize:"15px",padding:"13px"}} onClick={()=>setPage&&setPage("treinos")}>
              {feitosHoje===totalEx&&totalEx>0?"✅ Treino concluído!":"▶ "+T("dash.treinoHoje")}
            </button>
          </>
        )}
      </div>

      {/* ATALHOS RÁPIDOS */}
      <div className="grid-2" style={{marginBottom:"16px",gap:"8px"}}>
        <button className="card" style={{border:"1px solid var(--border)",cursor:"pointer",textAlign:"left",padding:"14px",transition:"all .15s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(74,222,128,0.3)"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}
          onClick={()=>setPage&&setPage("alimentacao")}>
          <div style={{fontSize:"20px",marginBottom:"6px"}}>🥗</div>
          <div style={{fontWeight:600,fontSize:"13px"}}>{T("dash.alimentacao")}</div>
          <div style={{fontSize:"11px",color:"var(--text2)",marginTop:"2px"}}>{T("dash.verRefeicoes")}</div>
        </button>
        <button className="card" style={{border:"none",cursor:"pointer",textAlign:"left",padding:"14px",position:"relative"}} onClick={()=>setPage&&setPage("chat")}>
          <div style={{fontSize:"20px",marginBottom:"6px"}}>💬</div>
          <div style={{fontWeight:600,fontSize:"13px"}}>{T("dash.chat")}</div>
          <div style={{fontSize:"11px",color:"var(--text2)",marginTop:"2px"}}>{msgs>0?`${msgs} mensagem${msgs>1?"s":""} nova${msgs>1?"s":""}!`:T("dash.falarEquipe")}</div>
          {msgs>0&&<div style={{position:"absolute",top:"10px",right:"10px",width:"8px",height:"8px",borderRadius:"50%",background:"var(--orange)"}}/>}
        </button>
        <button className="card" style={{border:"none",cursor:"pointer",textAlign:"left",padding:"14px"}} onClick={()=>setPage&&setPage("hidratacao")}>
          <div style={{fontSize:"20px",marginBottom:"6px"}}>💧</div>
          <div style={{fontWeight:600,fontSize:"13px"}}>{T("acomp.hidratacao")}</div>
          <div style={{fontSize:"11px",color:"var(--text2)",marginTop:"2px"}}>{T("dash.registrarAgua")}</div>
        </button>
        <button className="card" style={{border:"none",cursor:"pointer",textAlign:"left",padding:"14px"}} onClick={()=>setPage&&setPage("saude")}>
          <div style={{fontSize:"20px",marginBottom:"6px"}}>❤️</div>
          <div style={{fontWeight:600,fontSize:"13px"}}>{T("dash.saude")}</div>
          <div style={{fontSize:"11px",color:"var(--text2)",marginTop:"2px"}}>{T("dash.registrarSintomas")}</div>
        </button>
      </div>

      {/* EQUIPE */}
      {(treinador||nutri)&&(
        <div className="card">
          <div className="card-title">{T("dash.minhaEquipe")}</div>
          {treinador&&(
            <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"8px 0",borderBottom:nutri?"1px solid var(--border)":"none",cursor:"pointer"}} onClick={()=>setPage&&setPage("chat")}>
              <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"var(--orange-dim2)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"var(--orange)",fontSize:"14px",flexShrink:0}}>{(treinador.nome||"T").charAt(0).toUpperCase()}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:"13px"}}>{treinador.nome}</div>
                <div style={{fontSize:"11px",color:"var(--text2)"}}>{T("dash.personal")}</div>
              </div>
              <span style={{color:"var(--text3)",fontSize:"16px"}}>💬</span>
            </div>
          )}
          {nutri&&(
            <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"8px 0",cursor:"pointer"}} onClick={()=>setPage&&setPage("chat")}>
              <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"var(--green-dim2)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"var(--green)",fontSize:"14px",flexShrink:0}}>{(nutri.nome||"N").charAt(0).toUpperCase()}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:"13px"}}>{nutri.nome}</div>
                <div style={{fontSize:"11px",color:"var(--text2)"}}>{T("auth.nutri")}</div>
              </div>
              <span style={{color:"var(--text3)",fontSize:"16px"}}>💬</span>
            </div>
          )}
        </div>
      )}

      {!treinador&&!nutri&&(
        <div className="card" style={{textAlign:"center",padding:"24px"}}>
          <div style={{fontSize:"32px",marginBottom:"8px"}}>🔗</div>
          <div style={{fontWeight:600,marginBottom:"4px"}}>{T("dash.conectePersonal")}</div>
          <div style={{fontSize:"13px",color:"var(--text2)",marginBottom:"16px"}}>{T("dash.pedirCodigo")}</div>
          <button className="btn btn-green btn-sm" onClick={()=>setPage&&setPage("vinculo")}>{T("dash.inserirCodigo")}</button>
        </div>
      )}
    </div>
  );
}

function TreinadorPrescrever({
  user,showToast,setPage}){
  useLang();
const [saving,setSaving]=useState(false);
  const [alunos,setAlunos]=useState([]);
  useEffect(()=>{
    DB.getAlunosDe(user.id).then(d=>{
      const base=d||[];
      if(DEMO_IDS.includes(user.id)){
        const demo=DEMO_ALUNO;
        setAlunos(base.some(a=>a.id===demo.id)?base:[demo,...base]);
      } else setAlunos(base);
    }).catch(()=>setAlunos([]));
  },[user.id]);
  const [alunoSel,setAlunoSel]=useState(null);
  const [planoDeletado,setPlanoDeletado]=useState(false);
  const [confirmandoDeletar,setConfirmandoDeletar]=useState(false);
  const [formKey,setFormKey]=useState(0);
  const [nomePlano,setNomePlano]=useState("Treino A/B/C");
  const [modalidade,setModalidade]=useState("musculacao");
  const [duracao,setDuracao]=useState(1);
  const [periodizacao,setPeriodizacao]=useState("linear");
  const [inicio,setInicio]=useState(()=>new Date().toISOString().split("T")[0]);
  const [dias,setDias]=useState(()=>DIAS_SEMANA.map((_,i)=>({nome:`Treino ${String.fromCharCode(65+i)}`,tipo:i<5?"academia":"descanso",obs:"",exercicios:[]})));
  const [diaEdit,setDiaEdit]=useState(0);
  const [novoEx,setNovoEx]=useState({nome:"",series:"",reps:"",carga:"",video:"",obs:""});

  function resetForm(){
    setAlunoSel(null);
    setNomePlano("Treino A/B/C");
    setModalidade("musculacao");
    setDuracao(1);
    setPeriodizacao("linear");
    setInicio(new Date().toISOString().split("T")[0]);
    setDias(DIAS_SEMANA.map((_,i)=>({nome:`Treino ${String.fromCharCode(65+i)}`,tipo:i<5?"academia":"descanso",obs:"",exercicios:[]})));
    setDiaEdit(0);
    setNovoEx({nome:"",series:"",reps:"",carga:"",video:"",obs:""});
    setFormKey(k=>k+1);
  }

  function setDiaTipo(i,tipo){setDias(p=>{const n=[...p];n[i]={...n[i],tipo};return n;});}
  function setDiaNome(i,nome){setDias(p=>{const n=[...p];n[i]={...n[i],nome};return n;});}
  function setDiaObs(i,obs){setDias(p=>{const n=[...p];n[i]={...n[i],obs};return n;});}
  function addEx(i){
    if(!novoEx.nome)return;
    setDias(p=>{const n=[...p];n[i]={...n[i],exercicios:[...(n[i].exercicios||[]),{...novoEx}]};return n;});
    setNovoEx({nome:"",series:"",reps:"",carga:"",video:"",obs:""});
  }
  function removeEx(di,ei){setDias(p=>{const n=[...p];n[di]={...n[di],exercicios:n[di].exercicios.filter((_,j)=>j!==ei)};return n;});}

  async function salvar(){
    if(!alunoSel){showToast&&showToast("Selecione um aluno primeiro","warn");return;}
    const diasSemEx=dias.filter(d=>d.tipo!=="descanso"&&(!d.exercicios||d.exercicios.length===0));
    if(diasSemEx.length>0){showToast&&showToast(`⚠️ ${diasSemEx.map(d=>d.nome).join(", ")} sem exercícios. Verifique o plano.`,"warn");}
    const fimDate=addMonths(new Date(inicio),duracao);
    // Enrich exercises with videos from bank
    const diasEnriquecidos=dias.map(d=>({...d,exercicios:(d.exercicios||[]).map(ex=>{
      if(ex.video)return ex;
      const found=BANCO_EXERCICIOS.find(b=>b.nome.toLowerCase()===ex.nome.toLowerCase());
      return found?{...ex,video:found.video}:ex;
    })}));
    const plano={nome:nomePlano,modalidade,duracao,inicio,fim:fimDate.toISOString(),dias:diasEnriquecidos,periodizacao,criadoEm:new Date().toISOString()};
    try{
      const nomeAluno=alunoSel.nome;
      const idAluno=alunoSel.id;
      await DB.setData("plano_treino_aluno",idAluno,plano);
      try{await DB.criarNotificacao(idAluno,"treino","Novo treino disponivel",`${user.nome} prescreveu um novo plano para voce!`);}catch{}
      resetForm();
      showToast&&showToast(`✅ Plano enviado para ${nomeAluno.split(" ")[0]}! O aluno já pode ver no app.`);
    }catch(e){
      showToast&&showToast("Erro ao salvar: "+e.message,"warn");
    }
  }

  const diaAtual=dias[diaEdit]||{exercicios:[]};
  const fimDate=addMonths(new Date(inicio),duracao);

  return(
    <div className="page">
      <div className="page-header">
        <div className="page-title orange">{T("paginas.prescrever")}</div>
        <div className="page-sub">{T("prescr.instrucao")}</div>
      </div>
      {(alunos||[]).length===0&&<div className="alert alert-warn">⚠️ Nenhum aluno vinculado. Cadastre um aluno primeiro.</div>}
      <div className="card">
        <div className="card-title">👤 SELECIONAR ALUNO</div>
        {planoDeletado&&<div style={{padding:"0.75rem",background:"#22c55e18",border:"2px solid var(--green)",borderRadius:"8px",marginBottom:"0.75rem",textAlign:"center"}}>
          <div style={{fontWeight:700,color:"var(--green)"}}>✅ Plano deletado! Selecione o aluno para criar novo plano.</div>
        </div>}
        <AlunoSelector alunos={alunos||[]} selecionado={alunoSel} onSelect={a=>{setAlunoSel(a);if(a)setPlanoDeletado(false);}} accentClass="active orange"/>
        {!alunoSel&&(alunos||[]).length>0&&<div style={{color:"var(--text3)",fontSize:"0.85rem",padding:"0.5rem 0"}}>{T("prescr.selecioneAluno")}</div>}
      </div>

      {alunoSel&&(
        <>
          <div className="card">
            <div className="card-title">⚙️ CONFIGURAÇÕES DO PLANO</div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">{T("prescr.nomePlano")}</label><input className="form-input" value={nomePlano} onChange={e=>setNomePlano(e.target.value)} placeholder="Ex: Treino A/B/C"/></div>
              <div className="form-group"><label className="form-label">{T("prescr.modalidade")}</label>
                <select className="form-select" value={modalidade} onChange={e=>setModalidade(e.target.value)}>
                  <option value="musculacao">💪 Musculação</option>
                  <option value="corrida">🏃 Corrida</option>
                  <option value="natacao">🏊 Natação</option>
                  <option value="luta">🥊 Luta / Artes Marciais</option>
                  <option value="ciclismo">🚴 Ciclismo</option>
                  <option value="caminhada">🚶 Caminhada</option>
                  <option value="funcional">⚡ Funcional</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">{T("prescr.dataInicio")}</label><input type="date" className="form-input" value={inicio} onChange={e=>setInicio(e.target.value)}/></div>
              <div className="form-group"><label className="form-label">{T("prescr.duracao")}</label>
                <select className="form-select" value={duracao} onChange={e=>setDuracao(Number(e.target.value))}>
                  <option value={1}>1 mês</option><option value={2}>2 meses</option><option value={3}>3 meses</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">{T("prescr.periodizacao")}</label>
              <select className="form-select" value={periodizacao} onChange={e=>setPeriodizacao(e.target.value)}>
                <option value="linear">📈 Linear</option>
                <option value="ondulada">〰️ Ondulada</option>
                <option value="bloco">🧱 Por Blocos</option>
                <option value="conjugada">🔀 Conjugada</option>
                <option value="livre">✏️ Livre</option>
              </select>
            </div>
            <div className="periodo-card">
              <div style={{fontSize:"0.75rem",color:"var(--text3)",marginBottom:"0.25rem"}}>{T("prescr.vigencia")}</div>
              <div style={{fontWeight:600}}>{fmtDate(inicio)} → {fmtDate(fimDate.toISOString())}</div>
              <div style={{fontSize:"0.8rem",color:"var(--text2)"}}>{duracao} {duracao===1?"mês":"meses"} • {nomePlano} para {alunoSel.nome}</div>
            </div>
          </div>

          <div className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
              <div className="card-title" style={{marginBottom:0}}>📅 MONTAR OS DIAS DA SEMANA</div>
              <div style={{fontSize:"0.78rem",color:"var(--text2)"}}>
                💪 {dias.filter(d=>d.tipo!=="descanso").length} treinos/sem &nbsp;•&nbsp;
                📦 {dias.reduce((acc,d)=>acc+(d.exercicios?.length||0),0)} exercícios
              </div>
            </div>
            <div className="week-tabs">
              {DIAS_SEMANA.map((d,i)=>(
                <button key={i} className={`btn btn-sm ${diaEdit===i?"btn-primary":""}`} onClick={()=>setDiaEdit(i)} style={{position:"relative"}}>
                  {d.slice(0,3)}{dias[i]?.tipo==="descanso"?" 😴":""}
                  {dias[i]?.tipo!=="descanso"&&dias[i]?.exercicios?.length>0&&
                    <span style={{fontSize:"0.6rem",color:"var(--green)",display:"block"}}>✓{dias[i].exercicios.length}ex</span>}
                </button>
              ))}
            </div>

            <div style={{marginTop:"1rem"}}>
              <div className="form-group"><label className="form-label">{T("prescr.tipoDia")}</label>
                <select className="form-select" value={diaAtual.tipo||"academia"} onChange={e=>setDiaTipo(diaEdit,e.target.value)}>
                  <option value="descanso">😴 Descanso</option>
                  <option value="academia">🏋️ Academia</option>
                  <option value="corrida">🏃 Corrida</option>
                  <option value="natacao">🏊 Natação</option>
                  <option value="luta">🥊 Luta</option>
                  <option value="ciclismo">🚴 Ciclismo</option>
                  <option value="funcional">⚡ Funcional</option>
                  <option value="caminhada">🚶 Caminhada</option>
                </select>
              </div>
              {diaAtual.tipo!=="descanso"&&(
                <>
                  <div className="form-group"><label className="form-label">{T("prescr.nomeTreino")}</label>
                    <input className="form-input" value={diaAtual.nome||""} onChange={e=>setDiaNome(diaEdit,e.target.value)} placeholder={T("prescr.treinoEx")}/>
                  </div>
                  <div className="form-group"><label className="form-label">{T("prescr.obsDia")}</label>
                    <input className="form-input" value={diaAtual.obs||""} onChange={e=>setDiaObs(diaEdit,e.target.value)} placeholder={T("prescr.obsEx")}/>
                  </div>
                  <div style={{marginBottom:"0.75rem"}}>
                    {(diaAtual.exercicios||[]).map((ex,ei)=>(
                      <div key={ei} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.4rem 0",borderBottom:"1px solid var(--border)"}}>
                        <div>
                          <div style={{fontWeight:500}}>{ex.nome}</div>
                          {ex.obs&&<div style={{fontSize:"11px",color:"var(--orange)",fontStyle:"italic",marginTop:"2px"}}>💡 {ex.obs}</div>}
                          <div style={{fontSize:"0.78rem",color:"var(--text2)"}}>{ex.series&&`${ex.series}x`} {ex.reps} {ex.carga&&`• ${ex.carga}`}</div>
                          {ex.video&&<a href={ex.video} target="_blank" rel="noreferrer" style={{fontSize:"0.7rem",color:"var(--green)"}}>▶ Ver vídeo</a>}
                        </div>
                        <button className="btn btn-ghost btn-sm" style={{color:"var(--red)"}} onClick={()=>removeEx(diaEdit,ei)}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div style={{background:"var(--bg)",borderRadius:"8px",padding:"0.75rem",border:"1px solid var(--border)"}}>
                    <div style={{fontSize:"0.8rem",color:"var(--text3)",marginBottom:"0.75rem",textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>+ Adicionar exercício</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                      <div className="form-group">
                        <label className="form-label">{T("geral.nome")}</label>
                        <input className="form-input" placeholder="Ex: Supino Reto" list="banco-ex-list" value={novoEx.nome}
                          onInput={e=>{const match=BANCO_EXERCICIOS.find(b=>b.nome.toLowerCase()===e.target.value.toLowerCase());if(match)setNovoEx(p=>({...p,nome:match.nome,video:match.video}));}}
                          onChange={e=>{setNovoEx(p=>({...p,nome:e.target.value}));}}
                          onBlur={e=>{const match=BANCO_EXERCICIOS.find(b=>b.nome.toLowerCase()===e.target.value.toLowerCase());if(match)setNovoEx(p=>({...p,video:p.video||match.video}));}}/>
                        <datalist id="banco-ex-list">{React.useMemo(()=>BANCO_EXERCICIOS.map(b=><option key={b.nome} value={b.nome}/>),[])}</datalist>
                      </div>
                      <div className="form-group">
                        <label className="form-label">{T("prescr.series")}</label>
                        <input className="form-input" placeholder="Ex: 4" value={novoEx.series} onChange={e=>setNovoEx(p=>({...p,series:e.target.value}))}/>
                      </div>
                      <div className="form-group">
                        <label className="form-label">{T("treinador.reps")}</label>
                        <input className="form-input" placeholder="Ex: 8-10 ou 30s" value={novoEx.reps} onChange={e=>setNovoEx(p=>({...p,reps:e.target.value}))}/>
                      </div>
                      <div className="form-group">
                        <label className="form-label">{T("treinador.carga")}</label>
                        <input className="form-input" placeholder="Ex: 80kg" value={novoEx.carga} onChange={e=>setNovoEx(p=>({...p,carga:e.target.value}))}/>
                      </div>
                      <div className="form-group" style={{gridColumn:"1 / -1"}}>
                        <label className="form-label">Observação do exercício <span style={{color:"var(--text3)",fontWeight:400,fontSize:"11px"}}>(opcional — ex: lento e foco na coxa)</span></label>
                        <input className="form-input" placeholder={T("prescr.dicaEx")} value={novoEx.obs||""} onChange={e=>setNovoEx(p=>({...p,obs:e.target.value}))}/>
                      </div>
                      <div className="form-group" style={{gridColumn:"1 / -1"}}>
                        <input className="form-input" placeholder="🎬 Link YouTube (preenchido automaticamente)" value={novoEx.video||""}
                          onChange={e=>setNovoEx(p=>({...p,video:e.target.value}))}
                          style={{borderColor:novoEx.video?"var(--green)":"var(--border2)"}}/>
                        {novoEx.video&&<div style={{fontSize:"11px",color:"var(--green2)",marginTop:"4px",fontWeight:500}}>✅ Vídeo vinculado — aluno verá ▶ Ver execução</div>}
                      </div>
                    </div>
                    <button className="btn btn-orange btn-sm" style={{marginTop:"10px",width:"100%"}} onClick={()=>addEx(diaEdit)}>+ Adicionar exercício</button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.5rem",flexWrap:"wrap"}}>
            {!confirmandoDeletar?(
              <button className="btn btn-sm btn-ghost" style={{color:"var(--red)"}} onClick={()=>setConfirmandoDeletar(true)}>
                🗑️ Deletar plano atual
              </button>
            ):(
              <>
                <span style={{fontSize:"0.82rem",color:"var(--red)",alignSelf:"center"}}>{T("geral.confirmarExclusao")}</span>
                <button className="btn btn-sm btn-ghost" style={{color:"var(--red)",fontWeight:700}} onClick={async()=>{
                  setConfirmandoDeletar(false);
                  await DB.setData("plano_treino_aluno",alunoSel.id,null);
                  sessionStorage.setItem("tf_goto","prescrever");
                  sessionStorage.setItem("tf_toast","Plano deletado! Monte um novo plano.");
                  window.location.reload();
                }}>✅ Sim, deletar</button>
                <button className="btn btn-sm btn-ghost" onClick={()=>setConfirmandoDeletar(false)}>{T("geral.cancelar")}</button>
              </>
            )}
          </div>
          <button className="btn btn-orange btn-full" onClick={salvar} disabled={saving}>📤 Enviar plano para {alunoSel?.nome||"aluno"}</button>
        </>
      )}
    </div>
  );
}
function ResumoSemanalAluno({aluno,onVerCompleto}){
  const [saude]=useAlunoData(aluno.id,"saude",{});
  const [agua]=useAlunoData(aluno.id,"agua_hoje",0);
  const [meta]=useAlunoData(aluno.id,"meta_agua",3000);
  const [planoTreino]=useAlunoData(aluno.id,"plano_treino_aluno",null);
  const [av]=useAlunoData(aluno.id,"treino_avaliacao",{});
  const [avalFisica]=useAlunoData(aluno.id,"avaliacao",{});
  const [avalHist]=useAlunoData(aluno.id,"avaliacao_hist",[]);
  const [compsData]=useAlunoData(aluno.id,"competicoes",[]);
  const proximaComp=Array.isArray(compsData)?compsData.filter(c=>new Date(c.data)>new Date()).sort((a,b)=>new Date(a.data)-new Date(b.data))[0]:null;
  const [objAluno,setObjAluno]=useState(aluno.objetivo||null);
  useEffect(()=>{
    if(!aluno.id)return;
    let c=false;
    supabase.from("profiles").select("objetivo").eq("id",aluno.id).maybeSingle()
      .then(({data})=>{if(!c&&data?.objetivo)setObjAluno(data.objetivo);}).catch(()=>{});
    return()=>{c=true;};
  },[aluno.id]);
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
          {saude.doente&&<span className="tag tag-red">🩒 {diasDoente}d</span>}
          {objAluno&&(()=>{const obj=getObjetivo(objAluno);return(
            <span style={{fontSize:"0.7rem",padding:"2px 8px",borderRadius:"20px",
              border:"1.5px solid "+obj.color,color:obj.color,background:obj.color+"18",fontWeight:500,whiteSpace:"nowrap"}}>
              {obj.icon} {obj.label}
            </span>
          );})()}
          {saude.dores&&saude.dores.length>0&&<span className="tag tag-orange">🔴 {saude.dores.length} dor{saude.dores.length>1?"es":""}</span>}
          {saude.mens&&<span className="tag tag-orange">🔴 Ciclo</span>}
        </div>
      </div>

      {/* LINHA DE RESUMO */}
      <div className="grid-3" style={{marginBottom:"1rem"}}>
        <div style={{background:"var(--bg2)",borderRadius:"var(--radius)",padding:"0.85rem",textAlign:"center"}}>
          <div style={{fontSize:"0.65rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.25rem"}}>{T("resumo.aguaHoje")}</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",color:"var(--blue)"}}>{pctAgua}%</div>
          <div style={{fontSize:"0.7rem",color:"var(--text3)"}}>{(agua/1000).toFixed(1)}L / {(meta/1000).toFixed(1)}L</div>
        </div>
        <div style={{background:"var(--bg2)",borderRadius:"var(--radius)",padding:"0.85rem",textAlign:"center"}}>
          <div style={{fontSize:"0.65rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.25rem"}}>{T("resumo.diasTreino")}</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",color:"var(--green)"}}>{diasComTreino}</div>
          <div style={{fontSize:"0.7rem",color:"var(--text3)"}}>{T("resumo.diasComTreino")}</div>
        </div>
        <div style={{background:"var(--bg2)",borderRadius:"var(--radius)",padding:"0.85rem",textAlign:"center"}}>
          <div style={{fontSize:"0.65rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.25rem"}}>{T("resumo.ultimoTreino")}</div>
          <div style={{fontSize:"1.2rem"}}>{av.rating>0?"★".repeat(av.rating):"—"}</div>
          <div style={{fontSize:"0.7rem",color:"var(--text3)"}}>{av.rating>0?`nota ${av.rating}/5`:T("resumo.semAval")}</div>
        </div>
      </div>

      {/* DIAS DA SEMANA RESUMO */}
      {planoTreino?.dias&&(
        <div>
          <div style={{fontSize:"0.7rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.5rem"}}>{T("resumo.semanaTreinos")}</div>
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

      <div style={{fontSize:"0.8rem",color:"var(--orange)",marginTop:"1rem"}}>{T("resumo.verRelatorio")}</div>
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
  const [avalHist]=useAlunoData(aluno.id,"avaliacao_hist",[]);
  const [objAluno,setObjAluno]=useState(aluno.objetivo||null);
  useEffect(()=>{
    if(!aluno.id)return;
    let c=false;
    supabase.from("profiles").select("objetivo").eq("id",aluno.id).maybeSingle()
      .then(({data})=>{if(!c&&data?.objetivo)setObjAluno(data.objetivo);}).catch(()=>{});
    return()=>{c=true;};
  },[aluno.id]);
  const [comps]=useAlunoData(aluno.id,"competicoes",[]);
  const [planoTreino]=useAlunoData(aluno.id,"plano_treino_aluno",null);
  const proximaComp=Array.isArray(comps)?comps.filter(c=>{try{return new Date(c.data)>new Date();}catch{return false;}}).sort((a,b)=>new Date(a.data)-new Date(b.data))[0]||null:null;
  const refeicoes=(planoAlim?.refeicoes)||[];
  const qtdComido=Object.values(alimCheck).filter(Boolean).length;
  const diasDoente=saude.doente_desde?diffDays(saude.doente_desde):0;

  const tipoIcons={descanso:"😴",academia:"🏋️",corrida:"🏃",natacao:"🏊",luta:"🥊",ciclismo:"🚴",funcional:"⚡",caminhada:"🚶",treino:"🏋️"};
  const modIcons={musculacao:"🏋️",corrida:"🏃",natacao:"🏊",luta:"🥊",ciclismo:"🚴",funcional:"⚡",caminhada:"🚶"};

  return(
    <div className="page">
      {/* HEADER PREMIUM */}
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px",
        background:"linear-gradient(135deg,rgba(96,165,250,0.08),rgba(96,165,250,0.02))",
        border:"1px solid rgba(96,165,250,0.15)",borderRadius:"var(--r)",padding:"16px"}}>
        <button onClick={onBack}
          style={{width:"36px",height:"36px",borderRadius:"50%",border:"1px solid var(--border)",
            background:"var(--card2)",cursor:"pointer",display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:"16px",flexShrink:0}}>←</button>
        <div style={{width:"46px",height:"46px",borderRadius:"50%",flexShrink:0,
          background:"linear-gradient(135deg,rgba(96,165,250,0.15),rgba(96,165,250,0.05))",
          border:"1.5px solid rgba(96,165,250,0.3)",display:"flex",alignItems:"center",
          justifyContent:"center",fontWeight:700,color:"#60a5fa",fontSize:"16px"}}>
          {initials(aluno.nome)}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:"1.2rem",fontWeight:700,
            marginBottom:"2px",letterSpacing:"-0.3px"}}>{aluno.nome}</div>
          <div style={{fontSize:"12px",color:"var(--text3)"}}>{T("diario.relatorio")}</div>
        </div>
        {objAluno&&(()=>{const obj=getObjetivo(objAluno);return(
          <span style={{fontSize:"11px",padding:"4px 10px",borderRadius:"20px",
            border:"1.5px solid "+obj.color,color:obj.color,background:obj.color+"18",fontWeight:700,flexShrink:0}}>
            {obj.icon} {obj.label}
          </span>
        );})()}
      </div>

      {/* DADOS PESSOAIS */}
      <div className="card">
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
          <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#60a5fa",
            boxShadow:"0 0 8px rgba(96,165,250,0.5)"}}/>
          <span style={{fontSize:"10px",fontWeight:700,textTransform:"uppercase",
            letterSpacing:"0.1em",color:"var(--text3)"}}>{T("diario.perfilPaciente")}</span>
        </div>
        {Array.isArray(avalHist)&&avalHist.length>1&&(()=>{
          const pts=avalHist.filter(h=>h.peso);
          if(pts.length<2)return null;
          const pesos=pts.map(h=>parseFloat(h.peso));
          const diff=(pesos[pesos.length-1]-pesos[0]).toFixed(1);
          const w=280,hh=60;
          const xp=(i)=>10+(i/(pts.length-1||1))*(w-20);
          const yp=(v)=>hh-6-((v-Math.min(...pesos)+2)/(Math.max(...pesos)-Math.min(...pesos)+4||1))*(hh-12);
          const path=pts.map((p,i)=>`${i===0?"M":"L"}${xp(i).toFixed(1)},${yp(parseFloat(p.peso)).toFixed(1)}`).join(" ");
          return(
            <div style={{marginBottom:"0.75rem",padding:"0.75rem",background:"var(--bg)",borderRadius:"8px"}}>
              <div style={{display:"flex",gap:"0.75rem",marginBottom:"0.5rem",flexWrap:"wrap"}}>
                <div style={{flex:1}}><div style={{fontSize:"0.75rem",color:"var(--text2)"}}>{T("diario.variacaoTotal")}</div>
                  <div style={{fontWeight:600,color:parseFloat(diff)<0?"var(--green)":"var(--orange)"}}>{parseFloat(diff)>0?"+":""}{diff}kg</div></div>
                <div style={{flex:1}}><div style={{fontSize:"0.75rem",color:"var(--text2)"}}>{T("aval.registros")}</div>
                  <div style={{fontWeight:600}}>{pts.length}</div></div>
              </div>
              <svg viewBox={`0 0 ${w} ${hh}`} style={{width:"100%",height:"60px"}}>
                <path d={path} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                {pts.map((p,i)=>(<g key={i}><circle cx={xp(i)} cy={yp(parseFloat(p.peso))} r="2.5" fill="var(--green)"/>{(i===0||i===pts.length-1)&&<text x={xp(i)} y={yp(parseFloat(p.peso))-5} textAnchor="middle" fontSize="8" fill="var(--text2)">{p.peso}kg</text>}</g>))}
              </svg>
            </div>
          );
        })()}
        <div className="grid-3">
          <div className="diario-section"><div className="diario-label">{T("diario.peso")}</div><div className="diario-val" style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",color:"var(--green)"}}>{aval.peso||"—"}<span style={{fontSize:"0.8rem",color:"var(--text2)"}}>{aval.peso?" kg":""}</span></div></div>
          <div className="diario-section"><div className="diario-label">% Gordura</div><div className="diario-val" style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",color:"var(--orange)"}}>{aval.gordura||"—"}<span style={{fontSize:"0.8rem",color:"var(--text2)"}}>{aval.gordura?"%":""}</span></div></div>
          <div className="diario-section"><div className="diario-label">{T("auth.email")}</div><div className="diario-val" style={{fontSize:"0.85rem"}}>{aluno.email}</div></div>
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
          <div style={{fontSize:"0.75rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.75rem"}}>{T("diario.distribuicao")}</div>
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
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
          <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"var(--red)",
            boxShadow:"0 0 8px rgba(239,68,68,0.5)"}}/>
          <span style={{fontSize:"10px",fontWeight:700,textTransform:"uppercase",
            letterSpacing:"0.1em",color:"var(--text3)"}}>{T("diario.saudeMes")}</span>
        </div>
        <SaudeStatusCard status={saude} soLeitura={true}/>

        {/* HISTÓRICO DE DOENÇAS/DORES */}
        <div style={{marginTop:"1rem",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
          <div className="diario-section">
            <div className="diario-label">🩒 Dias doente no mês</div>
            <div className="diario-val" style={{fontFamily:"var(--font-display)",fontSize:"1.8rem",color:saude.doente?"var(--red)":"var(--green)"}}>{saude.doente?diasDoente:0}<span style={{fontSize:"0.8rem",color:"var(--text2)"}}> dias</span></div>
            {saude.sintomas&&<div style={{fontSize:"0.8rem",color:"var(--text2)",marginTop:"0.25rem"}}>{saude.sintomas}</div>}
          </div>
          <div className="diario-section">
            <div className="diario-label">🔴 Dores musculares ativas</div>
            <div className="diario-val" style={{fontFamily:"var(--font-display)",fontSize:"1.8rem",color:saude.dores?.length?"var(--orange)":"var(--green)"}}>{saude.dores?.length||0}<span style={{fontSize:"0.8rem",color:"var(--text2)"}}> grupos</span></div>
            {(saude?.dores||[]).length>0&&<div style={{fontSize:"0.8rem",color:"var(--text2)",marginTop:"0.25rem"}}>{(saude?.dores||[]).map(d=>`${d.musculo||""} (${diffDays(d.desde)}d)`).join(", ")}</div>}
          </div>
          <div className="diario-section">
            <div className="diario-label">🔴 Ciclo menstrual</div>
            <div className="diario-val">{saude.mens?<span className="tag tag-orange">{T("diario.menstrualAtiva")}</span>:<span style={{color:"var(--text3)"}}>{T("geral.naoInformado")}</span>}</div>
          </div>
          <div className="diario-section">
            <div className="diario-label">💊 Medicamentos</div>
            <div className="diario-val" style={{fontSize:"0.85rem"}}>{saude.meds||<span style={{color:"var(--text3)"}}>{T("geral.nenhum")}</span>}</div>
          </div>
        </div>
        {saude.obs&&<div className="diario-section" style={{marginTop:"0.75rem"}}><div className="diario-label">{T("geral.observacoes")}</div><div className="diario-val">{saude.obs}</div></div>}
      </div>

      {/* HIDRATAÇÃO */}
      {proximaComp&&(()=>{
        const diff=Math.ceil((new Date(proximaComp.data)-new Date())/(1000*60*60*24));
        const color=diff<=7?"var(--red)":diff<=30?"var(--orange)":"var(--green)";
        return(
          <div className="card" style={{borderLeft:"3px solid "+color}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:600,fontSize:"0.9rem"}}>🏆 {proximaComp.nome}</div>
                <div style={{fontSize:"0.78rem",color:"var(--text2)"}}>{proximaComp.modalidade} • {proximaComp.local}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:700,color,fontSize:"1rem"}}>{diff===0?"HOJE!":diff===1?"Amanhã":diff+"d"}</div>
                <div style={{fontSize:"0.7rem",color:"var(--text3)"}}>{T("diario.paraProva")}</div>
              </div>
            </div>
          </div>
        );
      })()}
      <div className="card">
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
          <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#60a5fa",
            boxShadow:"0 0 8px rgba(96,165,250,0.5)"}}/>
          <span style={{fontSize:"10px",fontWeight:700,textTransform:"uppercase",
            letterSpacing:"0.1em",color:"var(--text3)"}}>{T("acomp.hidratacao")}</span>
        </div>
        <div className="grid-2" style={{marginBottom:"1rem"}}>
          <div className="diario-section" style={{textAlign:"center"}}>
            <div className="diario-label">{T("diario.consumoHoje")}</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:"2.5rem",color:"var(--blue)"}}>{(agua/1000).toFixed(1)}<span style={{fontSize:"0.9rem",color:"var(--text2)"}}>L</span></div>
          </div>
          <div className="diario-section" style={{textAlign:"center"}}>
            <div className="diario-label">{T("diario.metaDiaria")}</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:"2.5rem",color:"var(--text)"}}>{(metaAgua/1000).toFixed(1)}<span style={{fontSize:"0.9rem",color:"var(--text2)"}}>L</span></div>
          </div>
        </div>
        <div className="prog-wrap">
          <div className="prog-hdr"><span>{T("diario.atingimento")}: </span><span className="blue">{Math.round((agua/metaAgua)*100)}%</span></div>
          <div className="prog-track"><div className="prog-fill blue" style={{width:`${Math.min((agua/metaAgua)*100,100)}%`}}/></div>
        </div>
      </div>

      {/* TREINO — AVALIAÇÃO */}
      {treino.rating>0&&(
        <div className="card">
          <div className="card-title">🏋️ AVALIAÇÃO DO ÚLTIMO TREINO</div>
          <div className="grid-2">
            <div className="diario-section"><div className="diario-label">{T("diario.nota")}</div><div style={{fontSize:"1.8rem"}}>{"★".repeat(treino.rating)}{"☆".repeat(5-treino.rating)}</div></div>
            <div className="diario-section"><div className="diario-label">{T("diario.data")}</div><div className="diario-val">{treino.data?fmtDate(treino.data):"—"}</div></div>
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
function TreinadorDash({
  user,setPage}){
  useLang();
  const [alunos,setAlunos]=useState([]);
  useEffect(()=>{
    DB.getAlunosDe(user.id).then(d=>{
      const base=d||[];
      if(DEMO_IDS.includes(user.id)){
        const demo=DEMO_ALUNO;
        setAlunos(base.some(a=>a.id===demo.id)?base:[demo,...base]);
      } else setAlunos(base);
    }).catch(()=>setAlunos([]));
  },[user.id]);
  const [msgs,setMsgs]=useState(0);
  const [atualizacoes,setAtualizacoes]=useState([]);
  useEffect(()=>{
    DB.getMensagensNaoLidas(user.id).then(d=>setMsgs(d.length)).catch(()=>{});
    // Busca atualizações recentes dos alunos
    DB.getAlunosDe(user.id).then(async lista=>{
      const items=[];
      for(const a of (lista||[]).slice(0,5)){
        try{
          const diario=await DB.getData("diario_saude",a.id);
          if(diario?.atualizadoEm){
            items.push({nome:a.nome,tipo:"saude",data:diario.atualizadoEm,msg:T("dash.atuSaude")});
          }
          const treino=await DB.getData("treino_avaliacao",a.id);
          if(treino?.data){
            items.push({nome:a.nome,tipo:"treino",data:treino.data,msg:`Finalizou treino ⭐${treino.rating||""}`});
          }
        }catch{}
      }
      items.sort((a,b)=>new Date(b.data)-new Date(a.data));
      setAtualizacoes(items.slice(0,6));
    }).catch(e=>console.warn("TrioFit data error:",e));
  },[user.id]);

  const total=(alunos||[]).length;
  const hoje=new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"});

  return(
    <div className="page">
      <div className="page-header">
        <div className="page-title">Olá, {user.nome?.split(" ")[0]}! 👋</div>
        <div className="page-sub" style={{textTransform:"capitalize"}}>{hoje}</div>
      </div>

      {/* STATS */}
      <div className="grid-3" style={{marginBottom:"20px"}}>
        <div className="stat-card">
          <div className="stat-label">{T("dash.alunos")}</div>
          <div className="stat-value orange">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{T("dash.mensagens")}</div>
          <div className={"stat-value "+(msgs>0?"orange":"green")}>{msgs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{T("dash.seuCodigo")}</div>
          <div style={{letterSpacing:"4px",fontSize:"1.6rem",fontFamily:"var(--font-mono)",
                  color:"var(--green)",textShadow:"0 0 20px rgba(74,222,128,0.3)"}}>
                  {user.codigo||"——"}</div>
          <div className="stat-sub">{T("dash.compartilhe")}</div>
        </div>
      </div>

      {/* AÇÕES RÁPIDAS */}
      <div className="grid-2" style={{marginBottom:"20px"}}>
        <button className="btn btn-orange btn-full" style={{padding:"14px"}} onClick={()=>setPage("prescrever")}>
          📋 Prescrever Treino
        </button>
        <button className="btn btn-ghost btn-full" style={{padding:"14px"}} onClick={()=>setPage("cadastrar")}>
          ➕ Novo Aluno
        </button>
      </div>

      {/* ATUALIZAÇÕES RECENTES */}
      {atualizacoes.length>0&&(
        <div className="card">
          <div className="card-title">{T("dash.atualizacoes")}</div>
          {atualizacoes.map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 0",borderBottom:i<atualizacoes.length-1?"1px solid var(--border)":"none"}}>
              <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"var(--green-dim2)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"var(--green)",fontSize:"12px",flexShrink:0}}>{initials(a.nome)}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:"13px"}}>{a.nome.split(" ")[0]}</div>
                <div style={{fontSize:"12px",color:"var(--text2)"}}>{a.msg}</div>
              </div>
              <div style={{fontSize:"11px",color:"var(--text3)"}}>{new Date(a.data).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</div>
            </div>
          ))}
        </div>
      )}

      {/* LISTA DE ALUNOS */}
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <div className="card-title" style={{marginBottom:0}}>{T("dash.meusAlunos")}</div>
          {total>3&&<button className="btn btn-ghost btn-sm" onClick={()=>setPage("cadastrar")}>{T("dash.verTodos")}</button>}
        </div>
        {total===0?(
          <div style={{textAlign:"center",padding:"2rem",color:"var(--text3)"}}>
            <div style={{fontSize:"2.5rem",marginBottom:"8px"}}>👥</div>
            <div style={{fontWeight:600,color:"var(--text2)",marginBottom:"4px"}}>{T("dash.semAluno")}</div>
            <button className="btn btn-orange btn-sm" style={{marginTop:"8px"}} onClick={()=>setPage("cadastrar")}>{T("dash.cadastrarAluno")}</button>
          </div>
        ):(alunos||[]).slice(0,5).map(a=>(
          <div key={a.id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
            <div style={{width:"38px",height:"38px",borderRadius:"50%",background:a.bloqueado?"var(--red-dim)":"var(--orange-dim)",border:"1.5px solid",borderColor:a.bloqueado?"rgba(248,113,113,0.3)":"rgba(251,146,60,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:a.bloqueado?"var(--red)":"var(--orange)",fontSize:"13px",flexShrink:0}}>{initials(a.nome)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:"13px",display:"flex",alignItems:"center",gap:"6px"}}>
                {a.nome.split(" ").slice(0,2).join(" ")}
                {a.bloqueado&&<span style={{fontSize:"10px",padding:"1px 6px",borderRadius:"20px",background:"var(--red-dim)",color:"var(--red)"}}>{T("geral.bloqueado")}</span>}
              </div>
              <div style={{fontSize:"11px",color:"var(--text2)"}}>{a.grupo||a.objetivo||a.email}</div>
            </div>
            {getObjetivo(a.objetivo)&&<span className="obj-badge" style={{background:getObjetivo(a.objetivo).bg,color:getObjetivo(a.objetivo).color,fontSize:"10px"}}>{getObjetivo(a.objetivo).badge}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TreinadorNotificacoes({
  user,showToast}){
  useLang();
  const [alunos,setAlunos]=useState([]);
  useEffect(()=>{
    DB.getAlunosDe(user.id).then(d=>{
      const base=d||[];
      if(DEMO_IDS.includes(user.id)){
        const demo=DEMO_ALUNO;
        setAlunos(base.some(a=>a.id===demo.id)?base:[demo,...base]);
      } else setAlunos(base);
    }).catch(()=>setAlunos([]));
  },[user.id]);
  const [msg,setMsg]=useState("");
  const [selecionados,setSelecionados]=useState([]);
  const [enviando,setEnviando]=useState(false);
  const [historico,setHistorico]=useState([]);

  const TEMPLATES=[
    {label:T("notif.treinoDisp"),texto:"🏋️ Seu novo treino está disponível! Acesse o TrioFit e confira."},
    {label:T("notif.pagamento"),texto:"⚠️ Seu plano vence em breve. Renove para continuar treinando!"},
    {label:T("notif.parabens"),texto:"🎉 Parabéns pela evolução! Continue focado nos seus objetivos."},
    {label:T("notif.falta"),texto:"👀 Sumiu? Volte aos treinos, você está quase lá!"},
    {label:T("notif.dieta"),texto:"🥗 Seu plano alimentar foi atualizado. Confira as novidades!"},
  ];

  function toggleAluno(id){
    setSelecionados(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  }

  function selecionarTodos(){
    if(selecionados.length===(alunos||[]).length) setSelecionados([]);
    else setSelecionados((alunos||[]).map(a=>a.id));
  }

  async function enviar(){
    if(!msg.trim()){showToast&&showToast(T("notif.digiteMsgLabel"),"warn");return;}
    if(selecionados.length===0){showToast&&showToast(T("notif.selecioneAluno"),"warn");return;}
    setEnviando(true);
    let ok=0;
    for(const id of selecionados){
      try{
        await DB.criarNotificacao(id,"geral",T("notif.msgPersonal"),msg);
        ok++;
      }catch{}
    }
    setHistorico(p=>[{msg,qtd:ok,data:new Date().toISOString()},...p.slice(0,4)]);
    setMsg("");setSelecionados([]);setEnviando(false);
    showToast&&showToast(`✅ Notificação enviada para ${ok} aluno${ok>1?"s":""}!`);
  }

  return(
    <div className="page">
      <div className="page-header">
        <div className="page-title orange">{T("paginas.notificacoes")}</div>
        <div className="page-sub">{T("notif.subtitulo")}</div>
      </div>

      {/* MENSAGEM */}
      <div className="card">
        <div className="card-title">{T("notif.mensagem")}</div>
        <div className="form-group">
          <textarea className="form-input" rows={3} placeholder={T("notif.digiteMsgPh")}
            value={msg} onChange={e=>setMsg(e.target.value)}
            style={{resize:"vertical",minHeight:"90px"}}/>
        </div>
        {/* Templates rápidos */}
        <div style={{marginBottom:"14px"}}>
          <div style={{fontSize:"11px",color:"var(--text3)",marginBottom:"8px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{T("notif.templates")}</div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {TEMPLATES.map((t,i)=>(
              <button key={i} className="btn btn-ghost btn-sm" onClick={()=>setMsg(t.texto)}
                style={{fontSize:"11px"}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SELECIONAR ALUNOS */}
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <div className="card-title" style={{marginBottom:0}}>{T("notif.selecionar")}</div>
          <button className="btn btn-ghost btn-sm" onClick={selecionarTodos}>
            {selecionados.length===(alunos||[]).length?T("notif.desmarcarTodos"):"Selecionar todos"}
          </button>
        </div>
        {(alunos||[]).length===0&&<div style={{color:"var(--text3)",fontSize:"13px",textAlign:"center",padding:"1rem"}}>{T("notif.semAluno")}</div>}
        {(alunos||[]).map(a=>(
          <div key={a.id} onClick={()=>toggleAluno(a.id)}
            style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 0",borderBottom:"1px solid var(--border)",cursor:"pointer"}}>
            <div style={{width:"20px",height:"20px",borderRadius:"5px",border:"2px solid",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
              borderColor:selecionados.includes(a.id)?"var(--orange)":"var(--border)",
              background:selecionados.includes(a.id)?"var(--orange)":"transparent",
              transition:"all .15s"}}>
              {selecionados.includes(a.id)&&<span style={{color:"#fff",fontSize:"12px",fontWeight:700}}>✓</span>}
            </div>
            <div style={{width:"34px",height:"34px",borderRadius:"50%",background:"var(--orange-dim)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"var(--orange)",fontSize:"12px",flexShrink:0}}>{initials(a.nome)}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:"13px"}}>{a.nome}</div>
              <div style={{fontSize:"11px",color:"var(--text2)"}}>{a.grupo||a.email}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-orange btn-full" style={{fontSize:"15px",padding:"14px"}} onClick={enviar} disabled={enviando||selecionados.length===0||!msg.trim()}>
        {enviando?`Enviando...`:`🔔 Enviar para ${selecionados.length} aluno${selecionados.length!==1?"s":""}`}
      </button>

      {/* HISTÓRICO */}
      {historico.length>0&&(
        <div className="card" style={{marginTop:"20px"}}>
          <div className="card-title">{T("notif.enviadas")}</div>
          {(historico||[]).map((h,i)=>(
            <div key={i} style={{padding:"10px 0",borderBottom:i<historico.length-1?"1px solid var(--border)":"none"}}>
              <div style={{fontSize:"13px",color:"var(--text)",marginBottom:"4px"}}>"{h.msg.slice(0,60)}{h.msg.length>60?"...":""}"</div>
              <div style={{fontSize:"11px",color:"var(--text3)"}}>{h.qtd} aluno{h.qtd!==1?"s":""} • {new Date(h.data).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function TreinadorAcompanhamento({user}){
  const [alunos,setAlunos]=useState([]);
  useEffect(()=>{
    DB.getAlunosDe(user.id).then(d=>{
      const base=d||[];
      if(DEMO_IDS.includes(user.id)){
        const demo=DEMO_ALUNO;
        setAlunos(base.some(a=>a.id===demo.id)?base:[demo,...base]);
      } else setAlunos(base);
    }).catch(()=>setAlunos([]));
  },[user.id]);
  const [alunoVer,setAlunoVer]=useState(null);
  const alunosList=Array.isArray(alunos)?alunos:[];
  if(alunoVer)return<DiarioAluno aluno={alunoVer} onBack={()=>setAlunoVer(null)}/>;
  if(!alunos&&alunosList.length===0)return<div className="page"><div className="page-title orange">{T("paginas.acompanhamento")}</div><div style={{display:"flex",justifyContent:"center",padding:"3rem"}}><span className="spinner"/></div></div>;
  return(
    <div className="page">
      <div className="page-title orange">{T("paginas.acompanhamento")}</div>
      <div className="page-sub">{T("acomp.resumoClique")}</div>
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
function NutriPrescrever({
  user,showToast}){
  useLang();
  const {confirm,Modal:ConfirmModalNutri}=useConfirm();
  const [alunos,setAlunos]=useState([]);
  useEffect(()=>{
    DB.getAlunosDe(user.id).then(d=>{
      const base=d||[];
      if(DEMO_IDS.includes(user.id)){
        const demo=DEMO_ALUNO;
        setAlunos(base.some(a=>a.id===demo.id)?base:[demo,...base]);
      } else setAlunos(base);
    }).catch(()=>setAlunos([]));
  },[user.id]);
  const [alunoSel,setAlunoSel]=useState(null);
  const [planoDeletado,setPlanoDeletado]=useState(false);
  const [nomePlano,setNomePlano]=useState("Plano Alimentar");
  const [protocolo,setProtocolo]=useState("normal");
  const [duracao,setDuracao]=useState(1);
  const [inicio,setInicio]=useState(()=>new Date().toISOString().split("T")[0]);
  const [refeicoes,setRefeicoes]=useState([
    {h:"07:00",r:T("geral.cafe"),i:"3 ovos + pão integral + banana + café",k:480},
    {h:"10:00",r:T("geral.lancheManha"),i:"Iogurte grego + castanhas",k:280},
    {h:"12:30",r:T("geral.almoco"),i:"Frango grelhado + arroz integral + salada",k:580},
    {h:"16:00",r:T("geral.preTreino"),i:"Batata doce + whey",k:320},
    {h:"19:00",r:T("geral.posTreino"),i:"Tilápia + arroz + brócolis",k:450},
    {h:"21:30",r:T("geral.ceia"),i:"Cottage + pasta de amendoim",k:220},
  ]);
  const fases={normal:2330,carga:3100,cutting:1800,peak:2000};
  const totalKcal=refeicoes.reduce((s,r)=>s+Number(r.k),0);

  function updateRef(i,campo,val){setRefeicoes(p=>{const n=[...p];n[i]={...n[i],[campo]:campo==="k"?Number(val):val};return n;});}
  function removeRef(i){setRefeicoes(p=>p.filter((_,j)=>j!==i));}
  async function addRef(){setRefeicoes(p=>[...p,{h:"",r:T("prescr.novaRefeicao"),i:"",k:0}]);}

  async function salvar(){
    if(!alunoSel)return;
    // Substituir plano sem confirmação — toast informa o usuário
    const fimDate=addMonths(new Date(inicio),duracao);
    const plano={nome:nomePlano,protocolo,duracao,inicio,fim:fimDate.toISOString(),refeicoes,kcalMeta:fases[protocolo],criadoEm:new Date().toISOString()};
    await DB.setData("plano_alim_aluno",alunoSel.id,plano);
      _cs(alunoSel.id,"plano_alim_aluno",plano);
    showToast&&showToast(`✅ Plano alimentar salvo com sucesso para ${alunoSel.nome}! 🥗`,"success");
    showToast&&showToast(`✅ Plano alimentar enviado para ${alunoSel.nome}!`);
  }

  return(
    <>{ConfirmModalNutri}
    <div className="page">
      <div className="page-title blue">{T("paginas.planoAlimentar")}</div>
      <div className="page-sub">{T("nutri.instrucao")}</div>
      {alunos.length===0&&<div className="alert alert-warn">⚠️ Sem pacientes vinculados. Código: <b style={{fontFamily:"var(--font-mono)"}}>{user.codigo||"------"}</b></div>}

      {/* SELECIONAR PACIENTE */}
      <div className="card">
        <div className="card-title">👤 SELECIONAR PACIENTE</div>
        <AlunoSelector alunos={alunos||[]} selecionado={alunoSel} onSelect={(a)=>{
          if(a){
            setPlanoDeletado(false);
            // Ensure all fields have defaults to prevent undefined crashes
            const safe={id:a.id,nome:a.nome||"",email:a.email||"",
              objetivo:a.objetivo||"",role:a.role||"aluno",...a};
            setTimeout(()=>setAlunoSel(safe),50);
          } else {
            setAlunoSel(null);
          }
        }} accentClass="sel-blue"/>
        {!alunoSel&&alunos.length>0&&<div style={{color:"var(--text3)",fontSize:"0.85rem"}}>{T("prescr.selecionePaciente")}</div>}
      </div>

      {alunoSel&&(
        <>
          {/* CONFIG */}
          <div className="card">
            <div className="card-title">⚙️ CONFIGURAÇÕES</div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">{T("prescr.nomePlano")}</label><input className="form-input" value={nomePlano} onChange={e=>setNomePlano(e.target.value)} placeholder="Ex: Dieta Hipertrofia"/></div>
              <div className="form-group"><label className="form-label">{T("prescr.duracaoSimples")}</label>
                <select className="form-select" value={duracao} onChange={e=>setDuracao(Number(e.target.value))}>
                  <option value={1}>1 mês</option><option value={2}>2 meses</option><option value={3}>3 meses</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">{T("prescr.dataInicio")}</label><input className="form-input" type="date" value={inicio} onChange={e=>setInicio(e.target.value)}/></div>
              <div className="form-group"><label className="form-label">{T("prescr.protocolo")}</label>
                <select className="form-select" value={protocolo} onChange={e=>setProtocolo(e.target.value)}>
                  <option value="normal">{T("nutri.normal")}</option>
                  <option value="carga">{T("nutri.carga")}</option>
                  <option value="cutting">{T("nutri.cutting")}</option>
                  <option value="peak">{T("nutri.peakWeek")}</option>
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
                  <div className="form-group" style={{marginBottom:0}}><label className="form-label">{T("prescr.horario")}</label><input className="form-input" type="time" value={r.h} onChange={e=>updateRef(i,"h",e.target.value)}/></div>
                  <div className="form-group" style={{marginBottom:0}}><label className="form-label">{T("geral.nome")}</label><input className="form-input" value={r.r} onChange={e=>updateRef(i,"r",e.target.value)}/></div>
                </div>
                <div className="form-group" style={{marginBottom:"0.5rem"}}><label className="form-label">{T("prescr.itens")}</label><textarea className="form-textarea" style={{minHeight:"60px"}} value={r.i} onChange={e=>updateRef(i,"i",e.target.value)}/></div>
                <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
                  <div style={{flex:1}}><label className="form-label">{T("geral.kcal")}</label><input className="form-input" type="number" value={r.k} onChange={e=>updateRef(i,"k",e.target.value)}/></div>
                  <button className="btn btn-ghost btn-sm" style={{color:"var(--red)",alignSelf:"flex-end"}} onClick={()=>removeRef(i)}>✕ Remover</button>
                </div>
              </div>
            ))}
            <button className="btn btn-ghost" onClick={addRef}>+ Adicionar refeição</button>
          </div>

          <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.5rem",flexWrap:"wrap"}}>
            <button className="btn btn-sm btn-ghost" onClick={async()=>{
              await DB.setData("plano_alim_aluno",alunoSel.id,null);
              showToast&&showToast("Dieta deletada!","warn");
            }}>🗑️️ Deletar dieta</button>
            <button className="btn btn-sm btn-ghost" onClick={()=>{
              setRefeicoes([{h:"07:00",r:T("geral.cafe"),i:"",k:""},{h:"12:00",r:T("geral.almoco"),i:"",k:""},{h:"19:00",r:"Jantar",i:"",k:""}]);
              showToast&&showToast("Novo plano em branco criado");
            }}>📄 Novo plano</button>
          </div>
          <button className="btn btn-blue btn-full" onClick={salvar}>📤 Enviar plano para {alunoSel.nome.split(" ")[0]}</button>
        </>
      )}
    </div>
    </>
  );
}

// ============================================================
// NUTRI — DASHBOARD + ACOMPANHAMENTO
// ============================================================
function NutriDash({
  user,setPage}){
  useLang();
  const [pacientes,setPacientes]=useState([]);
  useEffect(()=>{
    DB.getAlunosDe(user.id).then(d=>{
      const base=d||[];
      if(DEMO_IDS.includes(user.id)){
        const demo=DEMO_ALUNO;
        setPacientes(base.some(a=>a.id===demo.id)?base:[demo,...base]);
      } else setPacientes(base);
    }).catch(()=>setPacientes([]));
  },[user.id]);
  const [msgs,setMsgs]=useState(0);
  useEffect(()=>{DB.getMensagensNaoLidas(user.id).then(d=>setMsgs(d.length)).catch(()=>{});},[user.id]);
  const total=(pacientes||[]).length;
  const hoje=new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"});

  return(
    <div className="page">
      <div className="page-header">
        <div className="page-title">Olá, {user.nome?.split(" ")[0]}! 👋</div>
        <div className="page-sub" style={{textTransform:"capitalize"}}>{hoje}</div>
      </div>

      <div className="grid-3" style={{marginBottom:"20px"}}>
        <div className="stat-card">
          <div className="stat-label">{T("dash.pacientes")}</div>
          <div className="stat-value green">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{T("dash.mensagens")}</div>
          <div className={"stat-value "+(msgs>0?"orange":"green")}>{msgs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{T("dash.seuCodigo")}</div>
          <div style={{fontWeight:700,fontSize:"17px",color:"var(--green)",letterSpacing:"3px",marginTop:"4px"}}>{user.codigo||"——"}</div>
        </div>
      </div>

      <div className="grid-2" style={{marginBottom:"20px"}}>
        <button className="btn btn-green btn-full" style={{padding:"14px"}} onClick={()=>setPage&&setPage("prescrever")}>🥗 Prescrever Dieta</button>
        <button className="btn btn-ghost btn-full" style={{padding:"14px"}} onClick={()=>setPage&&setPage("cadastrar")}>➕ Novo Paciente</button>
      </div>

      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <div className="card-title" style={{marginBottom:0}}>{T("dash.meusPacientes")}</div>
        </div>
        {total===0?(
          <div style={{textAlign:"center",padding:"2rem",color:"var(--text3)"}}>
            <div style={{fontSize:"2.5rem",marginBottom:"8px"}}>🥗</div>
            <div style={{fontWeight:600,color:"var(--text2)",marginBottom:"12px"}}>{T("dash.semPaciente")}</div>
            <button className="btn btn-green btn-sm" onClick={()=>setPage&&setPage("cadastrar")}>{T("dash.cadastrarPaciente")}</button>
          </div>
        ):(pacientes||[]).slice(0,5).map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
            <div style={{width:"38px",height:"38px",borderRadius:"50%",background:"var(--green-dim2)",border:"1.5px solid rgba(74,222,128,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"var(--green)",fontSize:"13px",flexShrink:0}}>{initials(p.nome)}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:"13px"}}>{p.nome.split(" ").slice(0,2).join(" ")}</div>
              <div style={{fontSize:"11px",color:"var(--text2)"}}>{p.objetivo||p.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NutriAcompanhamento({
  user}){
  useLang();
  const [pacientes,setPacientes]=useState([]);
  useEffect(()=>{
    DB.getAlunosDe(user.id).then(d=>{
      const base=d||[];
      if(DEMO_IDS.includes(user.id)){
        const demo=DEMO_ALUNO;
        setPacientes(base.some(a=>a.id===demo.id)?base:[demo,...base]);
      } else setPacientes(base);
    }).catch(()=>setPacientes([]));
  },[user.id]);
  const [pacVer,setPacVer]=useState(null);
  const [saudeMapNA,setSaudeMapNA]=useState({});
  const [planoMapNA,setPlanoMapNA]=useState({});
  const [checkMapNA,setCheckMapNA]=useState({});
  const [aguaMapNA,setAguaMapNA]=useState({});
  const [metaMapNA,setMetaMapNA]=useState({});
  const pacientesList=Array.isArray(pacientes)?pacientes:[];
  useEffect(()=>{
    if(!pacientesList.length)return;
    // Load patients data sequentially (not all at once) to avoid freezing
    const loadAll=async()=>{
      const sm={},pm={},cm={},am={},mm={};
      for(const p of pacientesList){
        try{
          const [s,pl,ch,ag,mt]=await Promise.all([
            DB.getData("saude",p.id),
            DB.getData("plano_alim_aluno",p.id),
            DB.getData("alim_check_hoje",p.id),
            DB.getData("agua_hoje",p.id),
            DB.getData("meta_agua",p.id)
          ]);
          sm[p.id]=s||{};pm[p.id]=pl;cm[p.id]=ch||{};am[p.id]=ag||0;mm[p.id]=mt||3000;
          // Update state incrementally — shows data as it loads
          setSaudeMapNA({...sm});setPlanoMapNA({...pm});setCheckMapNA({...cm});
          setAguaMapNA({...am});setMetaMapNA({...mm});
        }catch{}
      }
    };
    loadAll();
  },[pacientes?.length]);
  if(pacVer)return<DiarioAluno aluno={pacVer} onBack={()=>setPacVer(null)}/>;
  if(!pacientes&&pacientesList.length===0)return<div className="page"><div className="page-title blue">{T("paginas.acompanhamento")}</div><div style={{display:"flex",justifyContent:"center",padding:"3rem"}}><span className="spinner"/></div></div>;
  return(
    <div className="page">
      <div className="page-title blue">{T("paginas.acompanhamento")}</div>
      <div className="page-sub">{T("acomp.subtitulo")}</div>
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
          <div key={p.id} onClick={()=>setPacVer(p)}
            style={{background:"var(--card)",border:"1px solid var(--border)",
              borderRadius:"var(--r)",padding:"16px",marginBottom:"10px",
              cursor:"pointer",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(96,165,250,0.3)";e.currentTarget.style.transform="translateY(-1px)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none";}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
              <div style={{width:"42px",height:"42px",borderRadius:"50%",flexShrink:0,
                background:"linear-gradient(135deg,rgba(96,165,250,0.15),rgba(96,165,250,0.05))",
                border:"1.5px solid rgba(96,165,250,0.25)",display:"flex",alignItems:"center",
                justifyContent:"center",fontWeight:700,color:"#60a5fa",fontSize:"14px"}}>
                {initials(p.nome)}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:"15px",marginBottom:"2px"}}>{p.nome}</div>
                <div style={{fontSize:"12px",color:"var(--text3)"}}>{p.email}</div>
              </div>
              <div style={{display:"flex",gap:"4px",flexWrap:"wrap",justifyContent:"flex-end"}}>
              <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap"}}>
                {s.mens&&<span className="tag tag-orange">🔴 Ciclo</span>}
                {s.doente&&<span className="tag tag-red">🩒 {diasDoente}d</span>}
                {s.meds&&<span className="tag tag-blue">💊</span>}
                {s.dores&&s.dores.length>0&&<span className="tag tag-orange">🔴 Dor</span>}
              </div>
              </div>
            </div>
            {totalRef>0&&<div className="prog-wrap"><div className="prog-hdr"><span style={{fontSize:"0.8rem"}}>{T("acomp.refHoje")}</span><span className="green" style={{fontSize:"0.8rem"}}>{qtdComido}/{totalRef}</span></div><div className="prog-track"><div className="prog-fill green" style={{width:`${totalRef>0?(qtdComido/totalRef)*100:0}%`}}/></div></div>}
            <div className="prog-wrap"><div className="prog-hdr"><span style={{fontSize:"0.8rem"}}>{T("acomp.hidratacao")}: </span><span className="blue" style={{fontSize:"0.8rem"}}>{agua}ml / {meta}ml</span></div><div className="prog-track"><div className="prog-fill blue" style={{width:`${Math.min((agua/meta)*100,100)}%`}}/></div></div>
            <div style={{fontSize:"0.8rem",color:"var(--blue)",marginTop:"0.5rem"}}>{T("acomp.verDiario")}</div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// NAV
// ============================================================
function getNavAluno(){return[
  {section:T("nav.secInicio"),items:[{id:"dashboard",icon:"🏠",label:T("aluno.inicio")},{id:"treinos",icon:"🏋️",label:T("aluno.treinos")},{id:"alimentacao",icon:"🥗",label:T("aluno.alimentacao")}]},
  {section:T("nav.secSaude"),items:[{id:"hidratacao",icon:"💧",label:T("aluno.hidratacao")},{id:"saude",icon:"❤️",label:T("aluno.saude")}]},
  {section:T("nav.secMais"),items:[{id:"avaliacao",icon:"📊",label:T("aluno.avaliacao")},{id:"competicoes",icon:"🏆",label:T("aluno.competicoes")},{id:"chat",icon:"💬",label:T("nav.chat")},{id:"perfil",icon:"👤",label:T("nav.perfil")},{id:"vinculo",icon:"🔗",label:T("aluno.equipe")}]},
];}
function getNavTreinador(){return[
  {section:T("nav.secGeral"),items:[{id:"dashboard",icon:"🏠",label:T("nav.dashboard")}]},
  {section:T("treinador.alunos"),items:[{id:"cadastrar",icon:"👥",label:T("treinador.alunos")},{id:"notificacoes",icon:"🔔",label:T("treinador.notificacoes")},{id:"acompanhamento",icon:"👁️",label:T("treinador.acompanhamento")},{id:"prescrever",icon:"📋",label:T("treinador.prescrever")},{id:"chat",icon:"💬",label:T("nav.chat")}]},
];}
function getNavNutri(){return[
  {section:T("nav.secGeral"),items:[{id:"dashboard",icon:"🏠",label:T("nav.dashboard")}]},
  {section:T("nutri.pacientes"),items:[{id:"cadastrar",icon:"➕",label:T("nutri.cadastrar")},{id:"acompanhamento",icon:"👁️",label:T("nutri.acompanhamento")},{id:"prescrever",icon:"🥗",label:T("nutri.planoAlimentar")},{id:"chat",icon:"💬",label:T("nav.chat")}]},
];}

// ============================================================
// ROLE APPS
// ============================================================
// ============================================================
// ALUNO — MEU PERFIL
// ============================================================
function MeuPerfil({
  user,treinador,nutri,vinculo,onVinculoChange,showToast}){
  useLang();
  const {confirm,Modal:ConfirmModalPerfil}=useConfirm();
  const [editando,setEditando]=useState(false);
  const [form,setForm]=useState({nome:"",sobrenome:"",nascimento:"",telefone:"",email:"",localTreino:"",obs:""});
  const [salvando,setSalvando]=useState(false);
  const [emailEnviado,setEmailEnviado]=useState(false);

  useEffect(()=>{
    let c=false;
    // Carrega dados do próprio aluno
    DB.getData("perfil_aluno",user.id).then(async d=>{
      if(c)return;
      if(d) setForm(p=>({...p,...d}));
      else setForm(p=>({...p,nome:user.nome||"",email:user.email||""}));
      // Profiles objetivo sempre tem prioridade
      const {data:pd}=await supabase.from("profiles").select("objetivo").eq("id",user.id).maybeSingle().catch(()=>({data:null}));
      if(!c&&pd?.objetivo)setForm(p=>({...p,objetivo:pd.objetivo}));
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
    // Atualiza objetivo no profiles para treinador/nutri verem
    try{await supabase.from("profiles").update({objetivo:form.objetivo||null}).eq("id",user.id);}catch{}
    setSalvando(false);
    setEditando(false);
    if(form.objetivo!==undefined)user.objetivo=form.objetivo;
    showToast&&showToast("✅ Perfil atualizado!");
  }

  async function desvincularTreinador(){
    
    await DB.setVinculoAluno(user.id,null,vinculo?.nutriId||null);
    onVinculoChange&&await onVinculoChange();
    showToast&&showToast("Treinador desvinculado.","warn");
  }

  async function desvincularNutri(){
    
    await DB.setVinculoAluno(user.id,vinculo?.treinadorId||null,null);
    onVinculoChange&&await onVinculoChange();
    showToast&&showToast("Nutricionista desvinculada.","warn");
  }

  const idade=form.nascimento?Math.floor((new Date()-new Date(form.nascimento))/31557600000):null;

  return(
    <div className="page">
      <div className="page-title green">{T("paginas.perfil")}</div>
      <div className="page-sub">{T("perfil.subtitulo")}</div>

      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <div className="card-title" style={{marginBottom:0}}>👤 DADOS PESSOAIS</div>
          {!editando&&<button className="btn btn-ghost btn-sm" onClick={()=>setEditando(true)}>✏️ Editar</button>}
        </div>

        {!editando?(
          <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
            {[
              [T("perfil.nomeCompleto"),`${form.nome} ${form.sobrenome}`.trim()||"—"],
              [T("geral.email"),form.email||user.email||"—"],
              [T("geral.telefone"),form.telefone||"—"],
              [T("perfil.dataNasc"),form.nascimento?`${new Date(form.nascimento+'T12:00').toLocaleDateString('pt-BR')} (${idade} anos)`:"—"],
              [T("perfil.localTreino"),form.localTreino||"—"],
            ].map(([label,val])=>(
              <div key={label} style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                <span style={{fontSize:"0.8rem",color:"var(--text2)",minWidth:"140px"}}>{label}:</span>
                <span style={{fontSize:"0.85rem",fontWeight:500}}>{val}</span>
              </div>
            ))}
            {form.obs&&<div style={{marginTop:"0.5rem",padding:"0.6rem",background:"var(--card2)",borderRadius:"var(--radius)",fontSize:"0.82rem",color:"var(--text2)"}}>📝 {form.obs}</div>}
            {form.objetivo&&(()=>{const obj=getObjetivo(form.objetivo);return(
              <div style={{marginTop:"0.5rem",display:"inline-flex",alignItems:"center",gap:"0.5rem",
                padding:"0.35rem 0.8rem",borderRadius:"20px",border:"2px solid "+obj.color,
                background:obj.color+"18",color:obj.color,fontSize:"0.82rem",fontWeight:500}}>
                {obj.icon} {obj.label}
              </div>
            );})()}
            {treinador&&(
              <div style={{marginTop:"0.75rem",padding:"0.6rem 0.75rem",background:"rgba(46,213,115,0.08)",borderRadius:"var(--radius)",fontSize:"0.82rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>🏋️ Treinador: <b>{treinador.nome}</b></span>
                <button className="btn btn-ghost btn-sm" style={{fontSize:"0.7rem",color:"var(--red)",padding:"2px 8px"}} onClick={desvincularTreinador}>{T("geral.remover")}</button>
              </div>
            )}
            {nutri&&(
              <div style={{marginTop:"0.4rem",padding:"0.6rem 0.75rem",background:"rgba(52,152,219,0.08)",borderRadius:"var(--radius)",fontSize:"0.82rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>🥗 Nutricionista: <b>{nutri.nome}</b></span>
                <button className="btn btn-ghost btn-sm" style={{fontSize:"0.7rem",color:"var(--red)",padding:"2px 8px"}} onClick={desvincularNutri}>{T("geral.remover")}</button>
              </div>
            )}
            {!treinador&&!nutri&&(
              <div style={{marginTop:"0.75rem",padding:"0.6rem",background:"var(--card2)",borderRadius:"var(--radius)",fontSize:"0.82rem",color:"var(--text2)"}}>
                Sem profissionais vinculados. Vá em <b>{T("perfil.minhaEquipe")}</b> para vincular.
              </div>
            )}
          </div>
        ):(
          <>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">{T("geral.nome")}</label><input className="form-input" value={form.nome} onChange={e=>set("nome",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">{T("geral.sobrenome")}</label><input className="form-input" value={form.sobrenome} onChange={e=>set("sobrenome",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">{T("perfil.dataNasc")}</label><input className="form-input" type="date" value={form.nascimento} onChange={e=>set("nascimento",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">{T("geral.telefone")}</label><input className="form-input" placeholder="(51) 99999-9999" value={form.telefone} onChange={e=>set("telefone",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">{T("geral.email")}</label><input className="form-input" type="email" value={form.email} onChange={e=>set("email",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">{T("perfil.localTreino")}</label><input className="form-input" value={form.localTreino} onChange={e=>set("localTreino",e.target.value)}/></div>
            </div>
            <div className="form-group"><label className="form-label">{T("geral.observacoes")}</label><textarea className="form-textarea" rows={3} value={form.obs} onChange={e=>set("obs",e.target.value)}/></div>
            <div className="form-group">
              <label className="form-label">🎯 Objetivo</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem",marginTop:"0.25rem"}}>
                {OBJETIVOS.map(o=>(
                  <button key={o.id} type="button" onClick={()=>set("objetivo",o.id)}
                    style={{padding:"0.3rem 0.6rem",borderRadius:"20px",border:"2px solid",
                      borderColor:form.objetivo===o.id?o.color:"var(--border)",
                      background:form.objetivo===o.id?o.color+"22":"transparent",
                      color:form.objetivo===o.id?o.color:"var(--text2)",
                      fontSize:"0.75rem",cursor:"pointer"}}>
                    {o.icon} {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              <button className="btn btn-ghost btn-sm" onClick={()=>setEditando(false)}>{T("geral.cancelar")}</button>
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
function ChatComponent({
  user,contato,showToast}){
  useLang();
  const [msgs,setMsgs]=useState([]);
  const inputRef=useRef(null);
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
    const el=inputRef.current;
    const t=(el?._val||el?.value||"").trim();
    if(!t||enviando)return;
    if(now-lastSend<2000){showToast&&showToast(T("chat.aguarde"),"warn");return;}
    if(el){el.value="";el._val="";}
    setEnviando(true);
    try{
      const msg=await DB.enviarMensagem(user.id,contato.id,sanitize(t));
      setMsgs(p=>[...p,msg]);
      setLastSend(Date.now());
    }catch(e){
      if(el){el.value=t;el._val=t;}
      showToast&&showToast("❌ Erro ao enviar. Tente novamente.","warn");
      if(el){el.value=t;el._val=t;}
    }
    setEnviando(false);
  }

  if(!contato){
    return(
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",color:"var(--text2)",flexDirection:"column",gap:"0.5rem"}}>
        <div style={{fontSize:"2rem"}}>💬</div>
        <div>{T("chat.semContato")}</div>
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
          <div style={{fontSize:"0.75rem",color:"var(--text2)"}}>{contato.role==="treinador"?T("dash.personal"):contato.role==="nutri"?"Nutricionista":"Aluno"}</div>
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
                background:minha?"linear-gradient(135deg,var(--green),var(--green2))":"var(--card2)",
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
          ref={inputRef}
          className="form-input"
          style={{flex:1}}
          placeholder={T("chat.digitePh")}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();enviar();}}}
          onInput={e=>{if(inputRef.current)inputRef.current._val=e.target.value;}}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        <button className="btn btn-primary btn-sm"
          onClick={e=>{e.preventDefault();e.stopPropagation();enviar();}}
          disabled={enviando} type="button">
          {enviando?"⏳":"Enviar"}
        </button>
      </div>
    </div>
  );
}

// Wrapper para aluno — usa treinador ou nutri como contato
function AlunoChat({user,treinador:treinadorProp,nutri:nutriProp,showToast}){
  const [aba,setAba]=useState("treinador");
  const [treinador,setTreinador]=useState(treinadorProp);
  const [nutri,setNutri]=useState(nutriProp);
  const [carregando,setCarregando]=useState(!treinadorProp&&!nutriProp);

  // Sync with props when they update
  useEffect(()=>{if(treinadorProp)setTreinador(treinadorProp);},[treinadorProp]);
  useEffect(()=>{if(nutriProp)setNutri(nutriProp);},[nutriProp]);

  // Always load vinculo from DB to ensure contacts are set
  useEffect(()=>{
    let cancelled=false;
    const load=async()=>{
      try{
        const v=await DB.getVinculoAluno(user.id);
        if(cancelled)return;
        if(v?.treinadorId){
          const t=await DB.getUserById(v.treinadorId);
          if(!cancelled&&t){setTreinador(t);}
        }
        if(v?.nutriId){
          const n=await DB.getUserById(v.nutriId);
          if(!cancelled&&n){setNutri(n);}
        }
      }catch(e){}
      if(!cancelled)setCarregando(false);
    };
    load();
    return()=>{cancelled=true;};
  },[user.id]);

  const contato=aba==="treinador"?treinador:nutri;

  if(carregando){
    return(
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",flexDirection:"column",gap:"12px"}}>
        <div className="spinner"/>
        <div style={{color:"var(--text2)",fontSize:"13px"}}>{T("chat.carregando")}</div>
      </div>
    );
  }

  return(
    <div className="page" style={{padding:0}}>
      {(treinador||nutri)&&(
        <div style={{display:"flex",gap:"8px",padding:"0.75rem",background:"var(--bg)"}}>
          {treinador&&<button className={`btn btn-sm ${aba==="treinador"?"btn-primary":"btn-ghost"}`} onClick={()=>setAba("treinador")}>🏋️ Treinador</button>}
          {nutri&&<button className={`btn btn-sm ${aba==="nutri"?"btn-primary":"btn-ghost"}`} onClick={()=>setAba("nutri")}>🥗 Nutricionista</button>}
        </div>
      )}
      <ChatComponent key={contato?.id||'nochat'} user={user} contato={contato?.id?contato:null} showToast={showToast}/>
    </div>
  );
}

// Wrapper para treinador/nutri — escolhe aluno da lista
function ProfChat({
  user,showToast}){
  useLang();
  const [alunos,setAlunos]=useState([]);
  const [alunoSel,setAlunoSel]=useState(null);
  const [carregando,setCarregando]=useState(true);
  useEffect(()=>{
    let c=false;
    setCarregando(true);
    DB.getAlunosDe(user.id).then(d=>{
      if(!c){setAlunos(d||[]);setCarregando(false);}
    }).catch(()=>{if(!c)setCarregando(false);});
    return()=>{c=true;};
  },[user.id]);
  return(
    <div className="page" style={{padding:0}}>
      {!alunoSel?(
        <div style={{padding:"1rem"}}>
          <div className="page-title orange" style={{marginBottom:"1rem"}}>💬 CHAT</div>
          {carregando?(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"40px",gap:"12px"}}>
              <div className="spinner"/>
              <div style={{color:"var(--text2)",fontSize:"13px"}}>{T("chat.carregandoAlunos")}</div>
            </div>
          ):alunos.length===0?(
            <div style={{color:"var(--text2)",textAlign:"center",padding:"2rem"}}>{T("chat.semAluno")}</div>
          ):(alunos.map(a=>(
            <div key={a.id} className="card" style={{cursor:"pointer",display:"flex",alignItems:"center",gap:"0.75rem"}} onClick={()=>setAlunoSel(a)}>
              <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"var(--orange)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,flexShrink:0}}>
                {a.nome?.[0]?.toUpperCase()||"?"}
              </div>
              <div>
                <div style={{fontWeight:600}}>{a.nome}</div>
                <div style={{fontSize:"0.8rem",color:"var(--text2)"}}>{T("chat.toqueConversar")}</div>
              </div>
              <div style={{marginLeft:"auto",color:"var(--text3)"}}>›</div>
            </div>
          )))}
        </div>
      ):(
        <div>
          <button className="btn btn-ghost btn-sm" style={{margin:"0.5rem"}} onClick={()=>setAlunoSel(null)}>{T("geral.voltar")}</button>
          <ChatComponent key={alunoSel?.id||'noprof'} user={user} contato={alunoSel} showToast={showToast}/>
        </div>
      )}
    </div>
  );
}

function AlunoApp({user,onLogout}){
  useLang();
  const {show,ToastEl}=useToast();
  const [page,setPage]=useState("dashboard");
  // Vínculo persistente — carrega do banco e mantém em estado
  // Carrega do sessionStorage imediatamente (persiste na aba, mesmo ao minimizar)
  const [vinculoApp,setVinculoApp]=useState(()=>{
    // Demo mode
    if((user.id||'').startsWith('demo-')||user.email==='aluno@demo.com'){
      return {treinadorId:DEMO_TREINADOR_ID,nutriId:DEMO_NUTRI_ID};
    }
    try{
      const s=sessionStorage.getItem("tfv_"+user.id);
      if(s)return JSON.parse(s);
      const c=localStorage.getItem("tfv_"+user.id);
      return c?JSON.parse(c):null;
    }catch{return null;}
  });
  const [treinadorApp,setTreinadorApp]=useState(()=>{
    // Demo mode
    if((user.id||'').startsWith('demo-')||user.email==='aluno@demo.com'){
      return {id:DEMO_TREINADOR_ID,nome:'Treinador Demo',email:'treinador@demo.com',role:'treinador',codigo:'DCD3F5'};
    }
    try{
      const s=sessionStorage.getItem("tft_"+user.id);
      if(s)return JSON.parse(s);
      const c=localStorage.getItem("tft_"+user.id);
      return c?JSON.parse(c):null;
    }catch{return null;}
  });
  const [nutriApp,setNutriApp]=useState(()=>{
    // Demo mode
    if((user.id||'').startsWith('demo-')||user.email==='aluno@demo.com'){
      return {id:DEMO_NUTRI_ID,nome:'Nutricionista Demo',email:'nutri@demo.com',role:'nutri',codigo:'373CBD'};
    }
    try{
      const s=sessionStorage.getItem("tfn_"+user.id);
      if(s)return JSON.parse(s);
      const c=localStorage.getItem("tfn_"+user.id);
      return c?JSON.parse(c):null;
    }catch{return null;}
  });
  const [msgsBadge,setMsgsBadge]=useState(0);
  useEffect(()=>{
    if(!user?.id)return;
    let cancelled=false;
    DB.getVinculoAluno(user.id).then(async v=>{
      if(cancelled)return;
      // CRITICAL: só limpa se v for um objeto válido (resposta real do banco)
      // Se v for null (erro de rede), mantém o estado atual do localStorage
      if(v===null)return; // Não limpa estado se houve erro de rede
      const vc=v||{};
      setVinculoApp(vc);
      try{localStorage.setItem("tfv_"+user.id,JSON.stringify(vc));sessionStorage.setItem("tfv_"+user.id,JSON.stringify(vc));}catch{}
      if(vc?.treinadorId){
        DB.getUserById(vc.treinadorId).then(t=>{
          if(cancelled)return;
          setTreinadorApp(t);
          try{localStorage.setItem("tft_"+user.id,JSON.stringify(t));sessionStorage.setItem("tft_"+user.id,JSON.stringify(t));}catch{}
        }).catch(()=>{});
      } else if(v&&Object.keys(v).length>0){
        // Só limpa se o vínculo foi explicitamente removido (não por erro)
        setTreinadorApp(null);
        try{localStorage.removeItem("tft_"+user.id);}catch{}
      }
      if(vc?.nutriId){
        DB.getUserById(vc.nutriId).then(n=>{
          if(cancelled)return;
          setNutriApp(n);
          try{localStorage.setItem("tfn_"+user.id,JSON.stringify(n));sessionStorage.setItem("tfn_"+user.id,JSON.stringify(n));}catch{}
        }).catch(()=>{});
      } else if(v&&Object.keys(v).length>0){
        // Só limpa se o vínculo foi explicitamente removido (não por erro)
        setNutriApp(null);
        try{localStorage.removeItem("tfn_"+user.id);}catch{}
      }
    }).catch(()=>{});
    return()=>{cancelled=true;};
  },[user?.id]);
  // Badge de mensagens não lidas
  useEffect(()=>{
    if(!user?.id)return;
    const check=()=>DB.getMensagensNaoLidas(user.id).then(d=>setMsgsBadge(d.length)).catch(()=>{});
    check();
    const iv=setInterval(check,60000);
    let visTimer=null;
    let hiddenAt=0;
    const onHidden=()=>{if(document.visibilityState==="hidden")hiddenAt=Date.now();};
    const onVisible=()=>{
      if(document.visibilityState==="visible"){
        clearTimeout(visTimer);
        // Só recarrega se ficou oculto por mais de 10 segundos
        const hiddenFor=Date.now()-hiddenAt;
        visTimer=setTimeout(()=>{
          check();
          // Não chama refreshVinculo ao voltar — localStorage já tem os dados
        // refreshVinculo só é chamado manualmente quando necessário
        },500);
      }
    };
    document.addEventListener("visibilitychange",onHidden);
    const onFocus=()=>{check();refreshVinculo&&refreshVinculo();};
    const onOnline=()=>{check();refreshVinculo&&refreshVinculo();};
    document.addEventListener("visibilitychange",onVisible);
    window.addEventListener("focus",onFocus);
    window.addEventListener("online",onOnline);
    return()=>{
      clearInterval(iv);
      clearTimeout(visTimer);
      document.removeEventListener("visibilitychange",onHidden);
      document.removeEventListener("visibilitychange",onVisible);
      window.removeEventListener("focus",onFocus);
      window.removeEventListener("online",onOnline);
    };
  },[user?.id]);
  // Função para atualizar vínculo após vincular/desvincular
  const refreshVinculo=useCallback(async()=>{
    // Always load from cache immediately first
    try{
      const cached=localStorage.getItem("tfv_"+user.id);
      if(cached){const cv=JSON.parse(cached);setVinculoApp(cv);}
    }catch{}
    // Fetch fresh with timeout to avoid infinite hang
    try{
      const timeout=new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),4000));
      const v=await Promise.race([DB.getVinculoAluno(user.id),timeout]);
      // Só atualiza se receber resposta válida — nunca limpa por erro
      if(v!==null&&v!==undefined){
        setVinculoApp(v);
        try{localStorage.setItem("tfv_"+user.id,JSON.stringify(v));}catch{}
        // Atualiza treinador/nutri se mudou
        if(v?.treinadorId){
          DB.getUserById(v.treinadorId).then(t=>{if(t){setTreinadorApp(t);try{localStorage.setItem("tft_"+user.id,JSON.stringify(t));}catch{}}}).catch(()=>{});
        }
        if(v?.nutriId){
          DB.getUserById(v.nutriId).then(n=>{if(n){setNutriApp(n);try{localStorage.setItem("tfn_"+user.id,JSON.stringify(n));}catch{}}}).catch(()=>{});
        }
      }
    }catch{}
    // v is only defined inside the try block above
    // DO NOT access v here — it will clear state
  },[user?.id]);

  function renderPage(p){
    if(p==="dashboard")return <AlunoDash user={user} setPage={setPage} vinculo={vinculoApp} treinador={treinadorApp} nutri={nutriApp}/>;
    if(p==="treinos")return <AlunoTreinos user={user} showToast={show}/>;
    if(p==="alimentacao")return <AlunoAlimentacao user={user} showToast={show}/>;
    if(p==="hidratacao")return <AlunoHidratacao user={user} showToast={show}/>;
    if(p==="saude")return <AlunoSaude user={user} showToast={show}/>;
    if(p==="avaliacao")return <AlunoAvaliacao user={user} showToast={show} vinculo={vinculoApp}/>;
    if(p==="competicoes")return <AlunoCompeticoes user={user} showToast={show}/>;
    if(p==="perfil")return <MeuPerfil user={user} treinador={treinadorApp} nutri={nutriApp} vinculo={vinculoApp} onVinculoChange={refreshVinculo} showToast={show}/>;
    if(p==="chat")return <AlunoChat user={user} treinador={treinadorApp} nutri={nutriApp} showToast={show}/>;
    if(p==="vinculo")return <AlunoVinculo user={user} onVinculoChange={refreshVinculo} showToast={show}/>;
    return <AlunoDash user={user} setPage={setPage} vinculo={vinculoApp} treinador={treinadorApp} nutri={nutriApp}/>;
  }
  return(<>{ToastEl}<Shell user={user} onLogout={onLogout} nav={getNavAluno()} active={page} setActive={setPage} accent="" alertCount={msgsBadge}>{renderPage(page)}</Shell></>);
}
// ============================================================
// TREINADOR — CADASTRAR ALUNO
// ============================================================
function CadastrarAluno({
  user,showToast}){
  useLang();
  // Role-based config — same component, different colors/labels
  const cfg=user.role==="nutri"
    ?{
        cor:"#60a5fa", corDim:"rgba(96,165,250,0.12)", corBorder:"rgba(96,165,250,0.25)",
        corGrad:"linear-gradient(135deg,rgba(96,165,250,0.15),rgba(96,165,250,0.05))",
        corBorderGrad:"1.5px solid rgba(96,165,250,0.3)",
        corGlow:"rgba(96,165,250,0.1)", corRadial:"rgba(96,165,250,0.06)",
        icon:"🥗", tituloForm:T("cadastrar.novoPaciente"), tituloPag:T("dash.pacientes"),
        subtitulo:T("cadastrar.gerenciePacientes"), labelNovo:"➕ "+T("cadastrar.novoPaciente"),
        labelLista:"👥 "+T("dash.pacientes"), labelBtn:T("dash.cadastrarPaciente"),
        labelBusca:T("cadastrar.buscarPaciente"),
        labelVazio:T("dash.semPaciente"),
        labelCadBtn:T("dash.cadastrarPaciente"), notifMsg:T("cadastrar.msgNutri"),
        boxShadowTab:"inset 0 -2px 0 #60a5fa",
      }
    :{
        cor:"var(--orange)", corDim:"var(--orange-dim)", corBorder:"rgba(251,146,60,0.25)",
        corGrad:"linear-gradient(135deg,rgba(251,146,60,0.15),rgba(251,146,60,0.05))",
        corBorderGrad:"1.5px solid rgba(251,146,60,0.3)",
        corGlow:"rgba(251,146,60,0.1)", corRadial:"rgba(251,146,60,0.06)",
        icon:"👤", tituloForm:T("cadastrar.novoAluno"), tituloPag:T("dash.alunos"),
        subtitulo:T("cadastrar.gerencie"), labelNovo:"➕ "+T("cadastrar.novoAluno"),
        labelLista:"👥 "+T("dash.alunos"), labelBtn:T("cadastrar.btnAluno"),
        labelBusca:T("cadastrar.buscarAluno"),
        labelVazio:T("dash.semAluno"),
        labelCadBtn:T("cadastrar.btnAluno"), notifMsg:cfg.notifMsg,
        boxShadowTab:"inset 0 -2px 0 var(--orange)",
      };
  const {confirm,Modal:ConfirmModal}=useConfirm();
  const NUTRI_ID_DEMO=DEMO_NUTRI_ID;
  const TREN_ID_DEMO=DEMO_TREINADOR_ID;
  const [aba,setAba]=useState([NUTRI_ID_DEMO,TREN_ID_DEMO].includes(user.id)?"lista":"cadastrar");
  const [form,setForm]=useState({nome:"",sobrenome:"",email:"",telefone:"",genero:"",grupo:"",objetivo:"",senha:""});
  const [salvando,setSalvando]=useState(false);
  const [sucesso,setSucesso]=useState(null);
  const [erroMsg,setErroMsg]=useState("");
  const [notifTarget,setNotifTarget]=useState(null);
  const [notifMsg,setNotifMsg]=useState("");
  const [busca,setBusca]=useState("");
  const [alunos,setAlunos]=useState([]);
  const reloadAlunos=useCallback(()=>{
    DB.getAlunosDe(user.id).then(d=>{
      const base=d||[];
      const demoIds=DEMO_IDS;
      if(demoIds.includes(user.id)){
        const demo=DEMO_ALUNO;
        setAlunos(base.some(a=>a.id===demo.id)?base:[demo,...base]);
      } else {
        setAlunos(base);
      }
    }).catch(()=>setAlunos([]));
  },[user.id]);
  useEffect(()=>{reloadAlunos();},[reloadAlunos]);

  function gerarSenha(){
    const chars="abcdefghjkmnpqrstuvwxyz23456789";
    return Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join("")+Math.floor(10+Math.random()*90);
  }
  function setF(k,v){setForm(p=>({...p,[k]:v}));}

  async function cadastrar(){
    if(!form.nome.trim()){showToast&&showToast("Nome é obrigatório","warn");return;}
    if(!form.email.trim()){showToast&&showToast("Email é obrigatório","warn");return;}
    if(!isValidEmail(form.email)){showToast&&showToast("Email inválido. Ex: nome@gmail.com","warn");return;}
    const safetyCad=setTimeout(()=>{setSalvando(false);setErroMsg("Tempo esgotado. Tente novamente.");},28000);
    setSalvando(true);
    const senhaFinal=form.senha||gerarSenha();
    let res;
    try{
      const profField=user.role==="nutri"?{nutriId:user.id}:{treinadorId:user.id};
      const timeout=new Promise((_,rej)=>setTimeout(()=>rej(new Error("Tempo esgotado. Tente novamente.")),25000));
      res=await Promise.race([DB.cadastrarAluno({...form,senha:senhaFinal,...profField}),timeout]);
      setSalvando(false);
      if(!res||!res.ok){
        const msg=(res&&res.msg)||"Erro ao cadastrar. Verifique os dados e tente novamente.";
        setErroMsg(msg);
        showToast&&showToast(msg,"warn");
        clearTimeout(safetyCad);setSalvando(false);
        return;
      }
      if(res.needsConfirmation){
        setErroMsg("");
        showToast&&showToast("✅ Aluno cadastrado! Ele receberá um email para ativar a conta.","success",5000);
        setSucesso({nome:(form.nome+" "+form.sobrenome).trim(),email:form.email,senha:senhaFinal,tel:form.telefone,pendingConfirmation:true});
        setForm({nome:"",sobrenome:"",email:"",telefone:"",genero:"",grupo:"",objetivo:"",senha:""});
        setSalvando(false);
        return;
      }
      setSucesso({nome:(form.nome+" "+form.sobrenome).trim(),email:form.email,senha:senhaFinal,tel:form.telefone});
      setForm({nome:"",sobrenome:"",email:"",telefone:"",genero:"",grupo:"",objetivo:"",senha:""});
      reloadAlunos();
      setAba("lista");
    }catch(e){
      setSalvando(false);
      setErroMsg(e.message||"Erro ao cadastrar");
      showToast&&showToast(e.message||"Erro ao cadastrar","warn");
    }
  }

  function copiar(){
    const txt="Ol\u00e1 "+sucesso.nome.split(" ")[0]+"! Seu acesso ao TrioFit:\nEmail: "+sucesso.email+"\nSenha: "+sucesso.senha+"\nAcesse: triofit.vercel.app";
    navigator.clipboard?.writeText(txt).then(()=>showToast&&showToast("\u2705 Copiado!"));
  }

  function whatsapp(){
    const msg="Ol\u00e1 "+sucesso.nome.split(" ")[0]+"! \u{1F389} Acesso ao TrioFit:\nEmail: "+sucesso.email+"\nSenha: "+sucesso.senha+"\nAcesse: triofit.vercel.app\nPersonal: "+user.nome;
    const num=(sucesso.tel||"").replace(/\D/g,"");
    window.open("https://wa.me/"+(num?"55"+num:"")+"?text="+encodeURIComponent(msg),"_blank");
  }

  async function toggleBloquear(aluno){
    const bloqueado=!aluno.bloqueado;
    const blockResult = await DB.bloquearAluno(aluno.id,bloqueado).catch(e=>e);
    reloadAlunos();
    if(blockResult instanceof Error){
      showToast&&showToast("Sem permissão para bloquear (configure RLS no Supabase)","warn");
    } else {
      showToast&&showToast(aluno.nome.split(" ")[0]+(bloqueado?" bloqueado":" desbloqueado"),"warn");
    }
  }
  const alunosFiltrados=(alunos||[]).filter(a=>!busca||a.nome?.toLowerCase().includes(busca.toLowerCase())||a.email?.toLowerCase().includes(busca.toLowerCase()));

  return(
    <div className="page">
      {ConfirmModal}
      <div className="page-header">
        <div className="page-title" style={{color:cfg.cor}}>{cfg.tituloPag}</div>
        <div className="page-sub">{cfg.subtitulo}</div>
      </div>

      {/* ABAS */}
      <div style={{display:"flex",gap:"4px",marginBottom:"20px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:"4px"}}>
        {[["cadastrar","➕ Cadastrar"],["lista",cfg.labelLista+((alunos||[]).length>0?" ("+((alunos||[]).length)+")":"")]].map(([id,label])=>(
          <button key={id} onClick={()=>setAba(id)}
            style={{flex:1,padding:"9px",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"13px",fontWeight:aba===id?600:500,
              background:aba===id?"var(--card2)":"transparent",
              color:aba===id?"var(--text)":"var(--text2)",transition:"all .15s",
              boxShadow:aba===id?cfg.boxShadowTab:"none"}}>
            {label}
          </button>
        ))}
      </div>

      {/* CADASTRAR */}
      {aba==="cadastrar"&&(
        <div className="card">
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"50%",
              background:cfg.corGrad,
              border:cfg.corBorderGrad,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>
              {cfg.icon}
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:"15px"}}>{cfg.tituloForm}</div>
              <div style={{fontSize:"11px",color:"var(--text3)"}}>{T("cadastrar.instrucao")}</div>
            </div>
          </div>

          {/* MODAL SUCESSO */}
          {sucesso&&(
            <div style={{background:"linear-gradient(135deg,rgba(74,222,128,0.1),rgba(74,222,128,0.04))",
              border:"1px solid rgba(74,222,128,0.25)",borderRadius:"var(--r)",
              padding:"16px",marginBottom:"20px",boxShadow:"0 0 20px rgba(74,222,128,0.08)"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"var(--green)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",flexShrink:0}}>✓</div>
                <div style={{fontWeight:700,color:"var(--green)",fontSize:"15px"}}>{sucesso.nome} cadastrado!</div>
              </div>
              <div style={{fontSize:"12px",color:"var(--text2)",marginBottom:"10px"}}>{T("cadastrar.enviarCred")}</div>
              <div style={{background:"var(--bg2)",borderRadius:"var(--r)",padding:"12px",fontFamily:"monospace",fontSize:"13px",marginBottom:"12px",lineHeight:2,borderLeft:"3px solid var(--green)"}}>
                <div>📧 {sucesso.email}</div>
                <div>🔑 {sucesso.senha}</div>
                <div>🔗 triofit.vercel.app</div>
              </div>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                <button className="btn btn-green btn-sm" onClick={copiar}>📋 Copiar</button>
                <button className="btn btn-ghost btn-sm" onClick={whatsapp}>💬 WhatsApp</button>
                <button className="btn btn-ghost btn-sm" style={{marginLeft:"auto"}} onClick={()=>setSucesso(null)}>✕</button>
              </div>
            </div>
          )}

          <div style={{fontSize:"10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--text3)",marginBottom:"10px"}}>{T("cadastrar.dadosPessoais")}</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{T("cadastrar.nomeObrig")}</label>
              <input className="form-input" placeholder={T("cadastrar.nomeEx")} value={form.nome} onChange={e=>setF("nome",e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">{T("geral.sobrenome")}</label>
              <input className="form-input" placeholder="Silva" value={form.sobrenome} onChange={e=>setF("sobrenome",e.target.value)}/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{T("cadastrar.emailObrig")}</label>
            <input className="form-input" type="email" placeholder="joao@email.com" value={form.email} onChange={e=>setF("email",e.target.value)}/>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{T("geral.whatsapp")}</label>
              <input className="form-input" placeholder="(51) 99999-9999" value={form.telefone} onChange={e=>setF("telefone",e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">{T("geral.genero")}</label>
              <select className="form-select" value={form.genero} onChange={e=>setF("genero",e.target.value)}>
                <option value="">{T("geral.selecionar")}</option>
                <option value="masculino">{T("geral.masculino")}</option>
                <option value="feminino">{T("geral.feminino")}</option>
                <option value="outro">{T("geral.prefiroNaoDizer")}</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{T("geral.grupo")}</label>
              <select className="form-select" value={form.grupo} onChange={e=>setF("grupo",e.target.value)}>
                <option value="">{T("geral.selecionar")}</option>
                <option value="presencial">🏋️ Presencial</option>
                <option value="online">💻 Online</option>
                <option value="hibrido">🔄 Híbrido</option>
                <option value="musculacao">💪 Musculação</option>
                <option value="funcional">⚡ Funcional</option>
                <option value="corrida">🏃 Corrida</option>
                <option value="emagrecimento">🔥 Emagrecimento</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{T("geral.objetivo")}</label>
              <select className="form-select" value={form.objetivo} onChange={e=>setF("objetivo",e.target.value)}>
                <option value="">{T("geral.selecionar")}</option>
                <option value="emagrecimento">🔥 Emagrecimento</option>
                <option value="hipertrofia">💪 Hipertrofia</option>
                <option value="definicao">⚡ Definição</option>
                <option value="saude">❤️ Saúde</option>
                <option value="performance">🏆 Performance</option>
                <option value="reabilitacao">🩺 Reabilitação</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{T("cadastrar.senha")}</label>
            <div style={{display:"flex",gap:"8px"}}>
              <input className="form-input" placeholder="Gerada automaticamente se vazio" value={form.senha} onChange={e=>setF("senha",e.target.value)} style={{flex:1}}/>
              <button className="btn btn-ghost btn-sm" style={{flexShrink:0}} onClick={()=>setF("senha",gerarSenha())}>🎲</button>
            </div>
          </div>
          <div style={{marginTop:"20px",paddingTop:"16px",borderTop:"1px solid var(--border)"}}>
            <button className="btn btn-full" style={{marginTop:"0",fontSize:"15px",padding:"14px",
              background:cfg.corGrad,color:cfg.cor,border:"1px solid "+cfg.corBorder,fontWeight:700,
              borderRadius:"var(--r)",cursor:"pointer",width:"100%",transition:"all .15s"}}
              onClick={()=>{setErroMsg("");setSalvando(false);setTimeout(cadastrar,10);}} disabled={salvando}>
              {salvando?"⏳ Cadastrando...":"✅ "+cfg.labelBtn}
            </button>
          </div>
        </div>
      )}

      {/* LISTA */}
      {aba==="lista"&&(
        <div>
          <input className="form-input" placeholder={"🔍 "+cfg.labelBusca} value={busca} onChange={e=>setBusca(e.target.value)} style={{marginBottom:"16px"}}/>
          {alunosFiltrados.length===0&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",
              padding:"48px 24px",textAlign:"center",position:"relative"}}>
              <div style={{position:"absolute",width:"200px",height:"200px",borderRadius:"50%",
                background:"radial-gradient(circle,"+cfg.corRadial+" 0%,transparent 70%)",pointerEvents:"none"}}/>
              <div style={{width:"80px",height:"80px",borderRadius:"50%",
                background:cfg.corGrad,
                border:"1.5px solid "+cfg.corBorder,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"32px",marginBottom:"18px",
                boxShadow:"0 0 24px "+cfg.corGlow}}>
                👥
              </div>
              <div style={{fontFamily:"var(--font-display)",fontSize:"1.2rem",fontWeight:700,marginBottom:"8px"}}>
                {busca?"Nenhum resultado":cfg.labelVazio}
              </div>
              <div style={{fontSize:"13px",color:"var(--text2)",lineHeight:1.7,marginBottom:"20px"}}>
                {busca?"Tente outro nome ou email":"Cadastre seu primeiro "+cfg.labelBtn.split(" ").slice(1).join(" ")+" na aba acima"}
              </div>
              {!busca&&<button className="btn btn-orange btn-sm" style={{color:cfg.cor,borderColor:cfg.corBorder,background:cfg.corDim}}
                onClick={()=>setAba("cadastrar")}>+ Cadastrar {cfg.labelCadBtn.split(" ")[1]}</button>}
            </div>
          )}
          {alunosFiltrados.map(a=>(
            <div key={a.id} className="card" style={{marginBottom:"10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <div style={{width:"44px",height:"44px",borderRadius:"50%",flexShrink:0,
                  background:a.bloqueado?"var(--red-dim)":cfg.corDim,
                  border:"1.5px solid",
                  borderColor:a.bloqueado?"rgba(248,113,113,0.3)":cfg.corBorder,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontWeight:700,color:a.bloqueado?"var(--red)":cfg.cor,fontSize:"14px"}}>
                  {initials(a.nome)}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap",marginBottom:"2px"}}>
                    <span style={{fontWeight:600,fontSize:"14px"}}>{a.nome}</span>
                    {a.bloqueado&&<span style={{fontSize:"10px",padding:"2px 7px",borderRadius:"20px",background:"var(--red-dim)",color:"var(--red)",fontWeight:600}}>🔒 Bloqueado</span>}
                    {a.grupo&&<span style={{fontSize:"10px",padding:"2px 7px",borderRadius:"20px",background:cfg.corDim,color:cfg.cor,fontWeight:600}}>{a.grupo}</span>}
                  </div>
                  <div style={{fontSize:"12px",color:"var(--text2)"}}>{a.email}{a.telefone&&" • "+a.telefone}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:"6px",marginTop:"12px",paddingTop:"12px",borderTop:"1px solid var(--border)",flexWrap:"wrap"}}>
                {a.telefone&&(
                  <button className="btn btn-ghost btn-sm" onClick={()=>{
                    const msg="Olá "+a.nome.split(" ")[0]+"! Acesse o TrioFit: triofit.vercel.app";
                    window.open("https://wa.me/55"+a.telefone.replace(/\D/g,"")+"?text="+encodeURIComponent(msg),"_blank");
                  }}>💬 WhatsApp</button>
                )}
                {notifTarget===a.id?(
                  <div style={{display:"flex",gap:"4px",alignItems:"center"}}>
                    <input autoFocus className="form-input"
                      style={{flex:1,padding:"5px 8px",fontSize:"12px",height:"30px"}}
                      placeholder={"Msg para "+a.nome.split(" ")[0]+"..."}
                      value={notifMsg} onChange={e=>setNotifMsg(e.target.value)}
                      onKeyDown={async e=>{
                        if(e.key==="Enter"&&!e.shiftKey&&notifMsg.trim()){e.preventDefault();
                          await DB.criarNotificacao(a.id,"geral",T("notif.msgPersonal"),notifMsg.trim()).catch(()=>{});
                          showToast&&showToast("✅ Notificação enviada!");
                          setNotifTarget(null);setNotifMsg("");
                        }
                        if(e.key==="Escape"){setNotifTarget(null);setNotifMsg("");}
                      }}/>
                    <button className="btn btn-ghost btn-sm"
                      onClick={()=>{setNotifTarget(null);setNotifMsg("");}}>✕</button>
                  </div>
                ):(
                  <button className="btn btn-ghost btn-sm"
                    onClick={()=>setNotifTarget(a.id)}>🔔 {T("notif.notificar")}
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" style={{marginLeft:"auto",
                  color:a.bloqueado?"var(--green)":"var(--red)",
                  borderColor:a.bloqueado?"rgba(74,222,128,0.3)":"rgba(248,113,113,0.3)"}}
                  onClick={()=>toggleBloquear(a)}>
                  {a.bloqueado?"🔓 Desbloquear":"🔒 Bloquear"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function TreinadorApp({user,onLogout}){
  useLang();
  const {show,ToastEl}=useToast();
  const [page,setPage]=useState(()=>{
    const goto=sessionStorage.getItem("tf_goto");
    if(goto){sessionStorage.removeItem("tf_goto");return goto;}
    return "dashboard";
  });
  useEffect(()=>{
    const msg=sessionStorage.getItem("tf_toast");
    if(msg){sessionStorage.removeItem("tf_toast");setTimeout(()=>show&&show(msg),500);}
  },[]);
  const [alertCount,setAlertCount]=useState(0);
  const [alunos,setAlunos]=useState([]);
  const [showOnboard,setShowOnboard]=useState(false);
  useEffect(()=>{
    let c=false;
    DB.getAlunosDe(user.id).then(as=>{
      if(!c){
        setAlunos(as||[]);
        setAlertCount(0);
      }
    }).catch(()=>{});
    const checkMsgs=()=>DB.getMensagensNaoLidas(user.id).then(d=>setAlertCount(d.length)).catch(()=>{});
    checkMsgs();
    const interval=setInterval(checkMsgs,30000);
    return()=>{c=true;clearInterval(interval);};
  },[user.id]);
  function renderPage(p){
    if(p==="dashboard")return <TreinadorDash user={user} setPage={setPage}/>;
    if(p==="cadastrar")return <CadastrarAluno user={user} showToast={show}/>;
    if(p==="notificacoes")return <TreinadorNotificacoes user={user} showToast={show}/>;
    if(p==="prescrever")return <TreinadorPrescrever user={user} showToast={show} setPage={setPage}/>;
    if(p==="acompanhamento")return <TreinadorAcompanhamento user={user}/>;
    if(p==="chat")return <ProfChat user={user} showToast={show}/>;
    return <TreinadorDash user={user} setPage={setPage}/>;
  }
  return(<>{ToastEl}<Shell user={user} onLogout={onLogout} nav={getNavTreinador()} active={page} setActive={setPage} accent="orange" alertCount={alertCount}>{renderPage(page)}</Shell></>);
}

// ============================================================
// NUTRI — CADASTRAR PACIENTE (componente dedicado)
// ============================================================

function NutriApp({user,onLogout}){
  useLang();
  const {show,ToastEl}=useToast();
  const [page,setPage]=useState("dashboard");
  const [msgsBadgeN,setMsgsBadgeN]=useState(0);
  useEffect(()=>{
    if(!user?.id)return;
    const check=()=>DB.getMensagensNaoLidas(user.id).then(d=>setMsgsBadgeN(d.length)).catch(()=>{});
    check();
    const iv=setInterval(check,60000);
    const onVisible=()=>{if(document.visibilityState==="visible")check();};
    const onFocus=()=>check();
    document.addEventListener("visibilitychange",onVisible);
    window.addEventListener("focus",onFocus);
    return()=>{clearInterval(iv);document.removeEventListener("visibilitychange",onVisible);window.removeEventListener("focus",onFocus);};
  },[user?.id]);
  function renderPage(p){
    if(p==="dashboard")return <NutriDash user={user} setPage={setPage}/>;
    if(p==="cadastrar")return <CadastrarAluno user={user} showToast={show}/>;
    if(p==="notificacoes")return <TreinadorNotificacoes user={user} showToast={show}/>;
    if(p==="acompanhamento")return <NutriAcompanhamento user={user}/>;
    if(p==="prescrever")return <NutriPrescrever user={user} showToast={show}/>;
    if(p==="chat")return <ProfChat user={user} showToast={show}/>;
    return <NutriDash user={user} setPage={setPage}/>;
  }
  return(<>{ToastEl}<Shell user={user} onLogout={onLogout} nav={getNavNutri()} active={page} setActive={setPage} accent="blue" alertCount={msgsBadgeN}>{renderPage(page)}</Shell></>);
}

// ============================================================
// ROOT
// ============================================================
function ConfirmModal({msg,onConfirm,onCancel}){
  return(
    <div role="dialog" aria-modal="true" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"var(--card)",borderRadius:"var(--radius)",padding:"1.5rem",maxWidth:"320px",width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
        <div style={{fontSize:"0.95rem",marginBottom:"1.25rem",lineHeight:1.5}}>{msg}</div>
        <div style={{display:"flex",gap:"0.75rem",justifyContent:"flex-end"}}>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>{T("geral.cancelar")}</button>
          <button className="btn btn-primary btn-sm" onClick={onConfirm}>{T("geral.confirmar")}</button>
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

class ErrorBoundary extends React.Component{
  constructor(props){super(props);this.state={hasError:false,error:null};}
  static getDerivedStateFromError(error){return{hasError:true,error};}
  componentDidCatch(error,info){console.error('TrioFit Error:',error,info);}
  render(){
    if(this.state.hasError){
      return(
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"1rem",background:"#09090b",color:"#fafafa",fontFamily:"Inter,sans-serif",padding:"2rem",textAlign:"center"}}>
          <div style={{fontSize:"3rem"}}>??</div>
          <div style={{fontSize:"1.2rem",fontWeight:700}}>{T("erro.titulo")}</div>
          <div style={{fontSize:"0.9rem",color:"#71717a",maxWidth:"400px"}}>Ocorreu um erro inesperado. Tente recarregar a página.</div>
          <button onClick={()=>window.location.reload()} style={{background:"#4ade80",color:"#000",border:"none",padding:"0.75rem 1.5rem",borderRadius:"8px",fontWeight:700,cursor:"pointer",fontSize:"1rem",marginTop:"0.5rem"}}>Recarregar página</button>
          <details style={{fontSize:"0.75rem",color:"#52525b",maxWidth:"500px",wordBreak:"break-all"}}>
            <summary style={{cursor:"pointer",marginBottom:"0.5rem"}}>{T("erro.detalhes")}</summary>
            {this.state.error?.toString()}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================
// TRIAL SYSTEM — versão de teste gratuita
// ============================================================
const TRIAL_DAYS = 14;

function useTrialInfo(user) {
  return useMemo(() => {
    if (!user?.criadoEm) return { ativo: false, diasRestantes: 0, diasUsados: 0, expirado: false };
    // Demo users never expire
    if ([DEMO_ALUNO_ID, DEMO_TREINADOR_ID, DEMO_NUTRI_ID].includes(user.id)) {
      return { ativo: false, diasRestantes: TRIAL_DAYS, diasUsados: 0, expirado: false, isDemo: true };
    }
    const inicio = new Date(user.criadoEm);
    const agora  = new Date();
    const diasUsados = Math.floor((agora - inicio) / (1000 * 60 * 60 * 24));
    const diasRestantes = Math.max(0, TRIAL_DAYS - diasUsados);
    const expirado = diasUsados >= TRIAL_DAYS;
    return { ativo: true, diasRestantes, diasUsados, expirado, inicio };
  }, [user?.criadoEm, user?.id]);
}

function TrialBanner({ trial, onUpgrade }) {
  if (!trial.ativo || trial.isDemo) return null;
  const urgente = trial.diasRestantes <= 3;
  const aviso   = trial.diasRestantes <= 7;
  if (trial.expirado) return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9998,
      background: '#ef4444', color: '#fff',
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
      fontSize: '13px', fontWeight: 600,
    }}>
      <span>🔒 Período de teste encerrado. Assine para continuar.</span>
      <button onClick={onUpgrade}
        style={{ background: '#fff', color: '#ef4444', border: 'none', borderRadius: '8px',
          padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>
        Assinar agora
      </button>
    </div>
  );
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9998,
      background: urgente ? '#ef4444' : aviso ? '#f59e0b' : '#4ade80',
      color: urgente || aviso ? '#fff' : '#000',
      padding: '8px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
      fontSize: '13px', fontWeight: 600,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{urgente ? '⚠️' : aviso ? '🕐' : '🎉'}</span>
        <span>
          {urgente
            ? `Apenas ${trial.diasRestantes} dia{trial.diasRestantes===1?'':'s'} restante{trial.diasRestantes===1?'':'s'} no teste gratuito!`
            : aviso
            ? `${trial.diasRestantes} dias restantes no teste gratuito`
            : `Teste gratuito · ${trial.diasRestantes} dias restantes`
          }
        </span>
      </div>
      <button onClick={onUpgrade}
        style={{ background: urgente || aviso ? '#fff' : '#000', color: urgente ? '#ef4444' : aviso ? '#f59e0b' : '#4ade80',
          border: 'none', borderRadius: '8px', padding: '5px 12px',
          fontWeight: 700, cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>
        Ver planos
      </button>
    </div>
  );
}

function UpgradeModal({ onClose }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:10000,
      display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' }}>
      <div style={{ background:'var(--card)',borderRadius:'var(--r-lg)',padding:'32px',
        maxWidth:'400px',width:'100%',border:'1px solid var(--border)' }}>
        <div style={{ textAlign:'center',marginBottom:'24px' }}>
          <div style={{ fontSize:'32px',marginBottom:'8px' }}>🚀</div>
          <div style={{ fontFamily:'var(--font-display)',fontSize:'1.4rem',fontWeight:800,
            marginBottom:'8px' }}>Continue usando o TrioFit</div>
          <div style={{ fontSize:'14px',color:'var(--text2)',lineHeight:1.6 }}>
            Seu período de teste encerrou. Assine para continuar acessando todos os recursos.
          </div>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:'12px',marginBottom:'24px' }}>
          <div style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r)',
            padding:'16px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <div>
              <div style={{ fontWeight:700 }}>Plano Profissional</div>
              <div style={{ fontSize:'12px',color:'var(--text3)' }}>Até 30 alunos · Todos os recursos</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:'var(--font-display)',fontWeight:800,color:'var(--green)',fontSize:'1.3rem' }}>R$ 49<span style={{ fontSize:'12px',fontWeight:400,color:'var(--text3)' }}>  /mês</span></div>
            </div>
          </div>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
          <a href="https://wa.me/5551999999999?text=Quero+assinar+o+TrioFit" target="_blank" rel="noreferrer"
            style={{ display:'block',textAlign:'center',background:'var(--green)',color:'#000',
              borderRadius:'var(--r)',padding:'14px',fontWeight:700,fontSize:'15px',textDecoration:'none' }}>
            💬 Falar no WhatsApp
          </a>
          <button onClick={onClose}
            style={{ background:'transparent',border:'1px solid var(--border)',borderRadius:'var(--r)',
              padding:'12px',color:'var(--text2)',cursor:'pointer',fontSize:'14px' }}>
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}


function TrioFitInner(){
  // Flag para bloquear restauração de sessão durante/após logout
  const _loggingOut=React.useRef(false);
  // Inject styles once into <head> (avoids 19KB CSS re-parse on every render)
  React.useEffect(()=>{
    if(document.getElementById('triofit-styles'))return;
    const el=document.createElement('style');
    el.id='triofit-styles';
    el.textContent=styles;
    document.head.appendChild(el);
    return()=>{};
  },[]);
  // Offline indicator
  const [isOnline,setIsOnline]=React.useState(navigator.onLine);
  React.useEffect(()=>{
    const on=()=>setIsOnline(true);
    const off=()=>setIsOnline(false);
    window.addEventListener('online',on);
    window.addEventListener('offline',off);
    return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);};
  },[]);
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let c=false;
    // Check if we just logged out — skip session restore
    const justLoggedOut = localStorage.getItem('tf_logged_out') ||
      sessionStorage.getItem('tf_logged_out') ||
      new URLSearchParams(window.location.search).get('logout');
    if(justLoggedOut){
      try{
        localStorage.removeItem('tf_logged_out');
        sessionStorage.removeItem('tf_logged_out');
      }catch{}
      if(window.history?.replaceState) window.history.replaceState({},'',window.location.pathname);
      setUser(null); setLoading(false);
      return;
    }
    // Show cached user IMMEDIATELY to avoid blank screen (instant restore)
    try{
      const cached=sessionStorage.getItem('tf_user_backup');
      if(cached){
        const cu=JSON.parse(cached);
        // Não restaura usuário demo — força nova autenticação
        if(cu?.id&&cu?.role&&!cu?.isDemoUser){setUser(cu);setLoading(false);}
      }
    }catch{}
    const tout=setTimeout(()=>{if(!c){c=true;setUser(null);setLoading(false);}},1500);
    DB.getSession().then(u=>{
      if(!c){
        c=true;clearTimeout(tout);
        if(u){
          try{
            sessionStorage.setItem('tf_user_backup',JSON.stringify(u));
            if((u.id||'').startsWith('demo-'))localStorage.setItem('tf_demo_user',JSON.stringify(u));
          }catch{}
          setUser(u);
        } else {
          // Try backup from sessionStorage
          try{
            const backup=sessionStorage.getItem('tf_user_backup');
            if(backup){const bu=JSON.parse(backup);setUser(bu);setLoading(false);return;}
            // Try localStorage for demo users (persists between tabs)
            const demoUser=localStorage.getItem('tf_demo_user');
            if(demoUser){const du=JSON.parse(demoUser);setUser(du);setLoading(false);return;}
          }catch{}
          setUser(null);
        }
        setLoading(false);
      }
    }).catch(async()=>{
      if(!c){
        c=true;clearTimeout(tout);
        // Retry with native Supabase session as fallback
        try{
          const {data:{session}}=await supabase.auth.getSession();
          if(session?.user){
            const u=await DB._formatUser(session.user);
            setUser(u);setLoading(false);return;
          }
        }catch{}
        setUser(null);setLoading(false);
      }
    });
    // Escuta mudanças de auth
    const {data:{subscription}}=supabase.auth.onAuthStateChange(async(event,session)=>{
      // Bloqueia restauração durante logout
      if(_loggingOut.current) return;
      // Ignora SIGNED_OUT causado por token_refresh_failed (browser voltou do background)
      if(event==='TOKEN_REFRESHED'||event==='SIGNED_IN'){
        if(session?.user){
          // Small delay to avoid race with onLogin direct call
          await new Promise(r=>setTimeout(r,100));
          if(_loggingOut.current) return;
          const u=await DB._formatUser(session.user);
          if(_loggingOut.current) return;
          try{sessionStorage.setItem('tf_user_backup',JSON.stringify(u));}catch{}
          setUser(u);
        }
        setLoading(false);
      } else if(event==='SIGNED_OUT'){
        // Verifica se tem sessão antes de deslogar (evita logout por refresh de token)
        supabase.auth.getSession().then(({data:{session}})=>{
          if(!session?.user){setUser(null);}
        }).catch(()=>{});
        setLoading(false);
      } else if(session?.user){
        const u=await DB._formatUser(session.user);
        setUser(u);
        setLoading(false);
      }
    });
    // Quando o app volta ao foco, verifica a sessão ativamente
    const handleVisibility=()=>{
      if(_loggingOut.current) return;
      if(document.visibilityState==='visible'){
        supabase.auth.getSession().then(({data:{session}})=>{
          if(session?.user){
            DB._formatUser(session.user).then(u=>setUser(u));
          } else {
            // Tenta refresh — NÃO desloga se falhar (pode ser apenas lentidão)
            supabase.auth.refreshSession().then(({data:{session:s}})=>{
              if(s?.user){DB._formatUser(s.user).then(u=>setUser(u));}
              // Se refresh falhar, NÃO desloga — mantém usuário atual
            }).catch(()=>{});
          }
        }).catch(()=>{});
      }
    };
    document.addEventListener('visibilitychange',handleVisibility);
    return()=>{subscription.unsubscribe();document.removeEventListener('visibilitychange',handleVisibility);};
  },[]);

  async function handleLogout(){
    // STEP 1: Bloquear TODOS os listeners imediatamente
    _loggingOut.current = true;
    
    // STEP 2: Mostrar tela de login imediatamente (sem esperar nada)
    setUser(null);
    setLoading(false);
    
    // STEP 3: Limpar toda a storage (síncrono, imediato)
    try { sessionStorage.clear(); } catch{}
    try { localStorage.clear(); } catch{}
    
    // STEP 4: signOut no servidor (em background — UI já mostrou login)
    try { await supabase.auth.signOut({ scope: 'global' }); } catch{}
    
    // STEP 5: Limpar novamente após signOut (garante chaves criadas pelo SDK)
    try { localStorage.clear(); sessionStorage.clear(); } catch{}
  }

    if(loading){
    return(<><div className="splash"><div className="splash-logo">TrioFit</div><div className="spinner"/></div></>);
  }

  return(
    <>
      {!isOnline&&(
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,
          background:"rgba(239,68,68,0.95)",color:"#fff",textAlign:"center",
          padding:"8px",fontSize:"13px",fontWeight:600}}>
          📶 Sem conexão — algumas funções podem não funcionar
        </div>
      )}
      <div className="app" style={{paddingTop:isOnline?0:"36px"}}>
        {!user&&<AuthScreen onLogin={setUser}/>}
        {user?.role==="aluno"&&<AlunoApp user={user} onLogout={handleLogout}/>}
        {user?.role==="treinador"&&<TreinadorApp user={user} onLogout={handleLogout}/>}
        {user?.role==="nutri"&&<NutriApp user={user} onLogout={handleLogout}/>}
      </div>
    </>
  );
}

export default function TrioFit(){
  return(
    <ErrorBoundary>
      <TrioFitInner/>
    </ErrorBoundary>
  );
}
