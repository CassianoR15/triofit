import { useState, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#0a0f0d; --bg2:#111810; --card:#151e17; --card2:#1a241c; --border:#243028;
    --green:#2ecc71; --green2:#27ae60; --green-dim:#1a4a2a;
    --orange:#f39c12; --orange2:#e67e22; --orange-dim:#4a2e0a;
    --red:#e74c3c; --red-dim:#4a1a1a; --blue:#3498db;
    --text:#e8f5e9; --text2:#8fa894; --text3:#5a7060;
    --font-display:'Bebas Neue',sans-serif; --font-body:'DM Sans',sans-serif;
    --font-mono:'JetBrains Mono',monospace; --radius:12px; --radius-lg:20px;
  }
  body { background:var(--bg); color:var(--text); font-family:var(--font-body); }
  .app { min-height:100vh; }
  .auth-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:2rem; background:var(--bg); position:relative; overflow:hidden; }
  .auth-wrap::before { content:''; position:absolute; width:500px; height:500px; background:radial-gradient(circle,rgba(46,204,113,0.07) 0%,transparent 70%); top:-100px; left:-100px; pointer-events:none; }
  .auth-wrap::after { content:''; position:absolute; width:400px; height:400px; background:radial-gradient(circle,rgba(243,156,18,0.05) 0%,transparent 70%); bottom:-50px; right:-50px; pointer-events:none; }
  .auth-box { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:2.5rem; width:100%; max-width:440px; position:relative; z-index:1; }
  .auth-logo { font-family:var(--font-display); font-size:3rem; letter-spacing:0.05em; background:linear-gradient(135deg,var(--green) 0%,var(--orange) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; text-align:center; margin-bottom:0.25rem; }
  .auth-subtitle { text-align:center; font-size:0.8rem; color:var(--text3); letter-spacing:0.2em; text-transform:uppercase; margin-bottom:2rem; }
  .auth-tabs { display:flex; background:var(--bg2); border-radius:var(--radius); padding:4px; margin-bottom:1.75rem; gap:4px; }
  .auth-tab { flex:1; padding:0.6rem; border-radius:8px; text-align:center; font-size:0.85rem; font-weight:600; cursor:pointer; transition:all 0.2s; color:var(--text2); }
  .auth-tab.active { background:var(--card2); color:var(--text); }
  .auth-error { background:var(--red-dim); border:1px solid rgba(231,76,60,0.3); color:var(--red); padding:0.75rem 1rem; border-radius:var(--radius); font-size:0.85rem; margin-bottom:1rem; }
  .auth-success { background:var(--green-dim); border:1px solid rgba(46,204,113,0.3); color:var(--green); padding:0.75rem 1rem; border-radius:var(--radius); font-size:0.85rem; margin-bottom:1rem; }
  .auth-switch { text-align:center; font-size:0.85rem; color:var(--text2); margin-top:1.25rem; }
  .auth-switch span { color:var(--green); cursor:pointer; font-weight:600; }
  .role-selector { display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem; margin-bottom:1rem; }
  .role-opt { padding:0.75rem 0.5rem; border-radius:var(--radius); border:1px solid var(--border); text-align:center; cursor:pointer; transition:all 0.2s; font-size:0.8rem; color:var(--text2); }
  .role-opt.sel-aluno { border-color:var(--green); background:var(--green-dim); color:var(--green); }
  .role-opt.sel-treinador { border-color:var(--orange); background:var(--orange-dim); color:var(--orange); }
  .role-opt.sel-nutri { border-color:var(--blue); background:rgba(52,152,219,0.1); color:var(--blue); }
  .role-opt-icon { font-size:1.5rem; margin-bottom:0.25rem; }
  .demo-box { margin-top:1.5rem; padding:1rem; background:var(--bg2); border-radius:var(--radius); font-size:0.78rem; color:var(--text3); line-height:1.9; }
  .demo-box b { color:var(--text2); }
  .shell { display:flex; min-height:100vh; }
  .sidebar { width:240px; min-height:100vh; background:var(--card); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:1.5rem 1rem; position:sticky; top:0; height:100vh; overflow-y:auto; }
  .sidebar-logo { font-family:var(--font-display); font-size:2rem; letter-spacing:0.05em; background:linear-gradient(135deg,var(--green),var(--orange)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; padding:0 0.5rem; margin-bottom:0.1rem; }
  .sidebar-name { padding:0 0.5rem; font-size:0.9rem; font-weight:600; color:var(--text); }
  .sidebar-role { padding:0 0.5rem; font-size:0.7rem; color:var(--text3); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:1.5rem; }
  .nav-section { margin-bottom:1.5rem; }
  .nav-label { font-size:0.65rem; color:var(--text3); letter-spacing:0.2em; text-transform:uppercase; padding:0 0.5rem; margin-bottom:0.5rem; }
  .nav-item { display:flex; align-items:center; gap:0.75rem; padding:0.65rem 0.75rem; border-radius:var(--radius); cursor:pointer; transition:all 0.2s; font-size:0.9rem; color:var(--text2); border:1px solid transparent; margin-bottom:2px; }
  .nav-item:hover { background:var(--bg2); color:var(--text); }
  .nav-item.active { background:var(--green-dim); color:var(--green); border-color:rgba(46,204,113,0.2); }
  .nav-item.active.orange { background:var(--orange-dim); color:var(--orange); border-color:rgba(243,156,18,0.2); }
  .nav-item.active.blue { background:rgba(52,152,219,0.1); color:var(--blue); border-color:rgba(52,152,219,0.2); }
  .nav-icon { font-size:1.1rem; width:20px; text-align:center; }
  .sidebar-footer { margin-top:auto; padding-top:1rem; border-top:1px solid var(--border); }
  .logout-btn { display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:var(--text3); cursor:pointer; padding:0.6rem 0.5rem; border-radius:var(--radius); transition:all 0.2s; width:100%; }
  .logout-btn:hover { color:var(--red); background:var(--red-dim); }
  .main { flex:1; overflow-y:auto; background:var(--bg); }
  .page { padding:2rem; max-width:1000px; }
  .page-title { font-family:var(--font-display); font-size:2.5rem; letter-spacing:0.05em; line-height:1; }
  .page-sub { color:var(--text2); font-size:0.9rem; margin-top:0.25rem; margin-bottom:2rem; }
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
  .prog-wrap { margin-bottom:1rem; }
  .prog-hdr { display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.85rem; }
  .prog-track { height:8px; background:var(--border); border-radius:999px; overflow:hidden; }
  .prog-fill { height:100%; border-radius:999px; transition:width 0.5s; }
  .prog-fill.green { background:linear-gradient(90deg,var(--green2),var(--green)); }
  .prog-fill.blue { background:linear-gradient(90deg,#2980b9,var(--blue)); }
  .form-group { margin-bottom:1rem; }
  .form-label { display:block; font-size:0.8rem; color:var(--text2); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:0.4rem; }
  .form-input,.form-select,.form-textarea { width:100%; background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); color:var(--text); font-family:var(--font-body); font-size:0.95rem; padding:0.75rem 1rem; outline:none; transition:border-color 0.2s; }
  .form-input:focus,.form-select:focus,.form-textarea:focus { border-color:var(--green); }
  .form-textarea { resize:vertical; min-height:80px; }
  .form-select option { background:var(--card); }
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
  .alert { padding:0.85rem 1rem; border-radius:var(--radius); font-size:0.85rem; margin-bottom:1rem; }
  .alert-success { background:var(--green-dim); color:var(--green); border:1px solid rgba(46,204,113,0.3); }
  .alert-warn { background:var(--orange-dim); color:var(--orange); border:1px solid rgba(243,156,18,0.3); }
  .alert-info { background:rgba(52,152,219,0.1); color:var(--blue); border:1px solid rgba(52,152,219,0.3); }
  .alert-danger { background:var(--red-dim); color:var(--red); border:1px solid rgba(231,76,60,0.3); }
  .check-item { display:flex; align-items:center; gap:0.75rem; padding:0.75rem; border-radius:var(--radius); cursor:pointer; transition:background 0.2s; font-size:0.9rem; }
  .check-item:hover { background:var(--card2); }
  .check-box { width:20px; height:20px; border:2px solid var(--border); border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; font-size:0.75rem; }
  .check-box.checked { background:var(--green); border-color:var(--green); color:#0a0f0d; }
  .quick-btns { display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:1rem; }
  .quick-btn { background:var(--card2); border:1px solid var(--border); border-radius:var(--radius); padding:0.75rem 1rem; cursor:pointer; font-size:0.85rem; color:var(--text2); transition:all 0.2s; display:flex; flex-direction:column; align-items:center; gap:0.25rem; min-width:80px; }
  .quick-btn:hover { border-color:var(--green); color:var(--green); }
  .quick-btn-icon { font-size:1.5rem; }
  .pain-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.5rem; }
  .muscle-btn { padding:0.5rem; border-radius:var(--radius); background:var(--card2); border:1px solid var(--border); font-size:0.75rem; text-align:center; cursor:pointer; transition:all 0.2s; color:var(--text2); }
  .muscle-btn.selected { background:var(--red-dim); border-color:var(--red); color:var(--red); }
  .meal-item { display:flex; align-items:center; justify-content:space-between; padding:0.75rem; background:var(--card2); border-radius:var(--radius); margin-bottom:0.5rem; }
  .meal-time { font-family:var(--font-mono); font-size:0.75rem; color:var(--text3); }
  .comp-card { background:var(--card2); border:1px solid var(--border); border-radius:var(--radius); padding:1rem; margin-bottom:0.75rem; display:flex; align-items:center; gap:1rem; }
  .comp-date { text-align:center; min-width:50px; font-family:var(--font-display); line-height:1.1; }
  .comp-date-day { font-size:1.8rem; color:var(--orange); }
  .comp-date-month { font-size:0.7rem; color:var(--text3); text-transform:uppercase; }
  .tag { display:inline-flex; align-items:center; padding:0.3rem 0.75rem; border-radius:999px; font-size:0.75rem; font-weight:600; }
  .tag-green { background:var(--green-dim); color:var(--green); }
  .tag-orange { background:var(--orange-dim); color:var(--orange); }
  .tag-red { background:var(--red-dim); color:var(--red); }
  .tag-blue { background:rgba(52,152,219,0.15); color:var(--blue); }
  .toggle-wrap { display:flex; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap; }
  .toggle-btn { padding:0.5rem 1rem; border-radius:999px; font-size:0.85rem; font-weight:600; cursor:pointer; border:1px solid var(--border); background:transparent; color:var(--text2); transition:all 0.2s; }
  .toggle-btn.active-blue { background:rgba(52,152,219,0.15); border-color:var(--blue); color:var(--blue); }
  .aluno-row { display:flex; align-items:center; gap:1rem; padding:0.85rem; border-radius:var(--radius); border-bottom:1px solid var(--border); transition:background 0.2s; cursor:pointer; }
  .aluno-row:hover { background:var(--card2); }
  .aluno-avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.95rem; font-weight:700; flex-shrink:0; background:var(--green-dim); color:var(--green); font-family:var(--font-display); }
  .stars { display:flex; gap:0.25rem; }
  .spinner { width:20px; height:20px; border:2px solid var(--border); border-top-color:var(--green); border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to { transform:rotate(360deg); } }
  /* CÓDIGO DO PROFISSIONAL */
  .codigo-box { background:var(--bg2); border:2px dashed var(--border); border-radius:var(--radius-lg); padding:1.5rem; text-align:center; margin-bottom:1rem; }
  .codigo-val { font-family:var(--font-mono); font-size:2.2rem; letter-spacing:0.3em; color:var(--green); font-weight:700; margin:0.5rem 0; }
  .codigo-label { font-size:0.75rem; color:var(--text3); letter-spacing:0.15em; text-transform:uppercase; }
  /* SAÚDE STATUS */
  .saude-status-box { border-radius:var(--radius-lg); padding:1.25rem; margin-bottom:1rem; display:flex; align-items:center; gap:1rem; }
  .saude-status-box.doente { background:var(--red-dim); border:1px solid rgba(231,76,60,0.4); }
  .saude-status-box.dor { background:var(--orange-dim); border:1px solid rgba(243,156,18,0.4); }
  .saude-status-box.bem { background:var(--green-dim); border:1px solid rgba(46,204,113,0.4); }
  .saude-status-icon { font-size:2.5rem; flex-shrink:0; }
  .saude-status-info { flex:1; }
  .saude-status-titulo { font-family:var(--font-display); font-size:1.4rem; letter-spacing:0.05em; }
  .saude-status-dias { font-size:0.85rem; margin-top:0.15rem; }
  .diario-section { background:var(--bg2); border-radius:var(--radius); padding:1rem; margin-bottom:0.75rem; }
  .diario-label { font-size:0.7rem; color:var(--text3); text-transform:uppercase; letter-spacing:0.15em; margin-bottom:0.5rem; }
  .diario-val { font-size:0.9rem; color:var(--text); }
  /* VINCULO INPUT */
  .vinc-input-wrap { display:flex; gap:0.75rem; align-items:flex-end; }
  .vinc-resultado { background:var(--green-dim); border:1px solid rgba(46,204,113,0.3); border-radius:var(--radius); padding:0.85rem 1rem; display:flex; align-items:center; gap:0.75rem; margin-top:0.75rem; }
  .vinc-avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:700; flex-shrink:0; font-family:var(--font-display); background:var(--border); }
  @media(max-width:768px){ .sidebar{display:none;} .grid-2,.grid-4{grid-template-columns:1fr 1fr;} .pain-grid{grid-template-columns:repeat(3,1fr);} }
`;

// ============================================================
// HELPERS
// ============================================================
function getGreeting(){const h=new Date().getHours();if(h<12)return"BOM DIA";if(h<18)return"BOA TARDE";return"BOA NOITE";}
function getDateStr(){return new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).replace(/^\w/,c=>c.toUpperCase());}
function firstName(n){return n?n.trim().split(" ")[0].toUpperCase():"";}
function initials(n){if(!n)return"?";const p=n.trim().split(" ");return p.length>=2?(p[0][0]+p[p.length-1][0]).toUpperCase():p[0][0].toUpperCase();}
function diffDays(dateStr){if(!dateStr)return 0;const d=Math.floor((Date.now()-new Date(dateStr).getTime())/(1000*60*60*24));return Math.max(d,0);}
function pluralDia(n){return n===1?"dia":"dias";}

// Gera código único de 6 chars alfanumérico
function gerarCodigo(seed){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result="";
  let s=seed%999999;
  for(let i=0;i<6;i++){result+=chars[s%chars.length];s=Math.floor(s/chars.length)+7;}
  return result.slice(0,6);
}

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
    users.push(user);this.saveUsers(users);
    return{ok:true,user};
  },
  login(email,senha){
    const user=this.getUsers().find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.senha===senha);
    if(!user)return{ok:false,msg:"Email ou senha incorretos."};
    return{ok:true,user};
  },

  // Pega usuário pelo código
  getUserByCodigo(codigo){
    return this.getUsers().find(u=>gerarCodigo(u.id)===codigo.toUpperCase())||null;
  },

  // Vínculos: { alunoId, treinadorId, nutriId }
  getVinculos:()=>JSON.parse(localStorage.getItem("tf_vinculos")||"[]"),
  saveVinculos:v=>localStorage.setItem("tf_vinculos",JSON.stringify(v)),

  getVinculoAluno(alunoId){return this.getVinculos().find(v=>v.alunoId===alunoId)||null;},
  setVinculoAluno(alunoId,treinadorId,nutriId){
    const vs=this.getVinculos().filter(v=>v.alunoId!==alunoId);
    vs.push({alunoId,treinadorId:treinadorId||null,nutriId:nutriId||null});
    this.saveVinculos(vs);
  },
  getAlunosDe(profId){
    const ids=this.getVinculos().filter(v=>v.treinadorId===profId||v.nutriId===profId).map(v=>v.alunoId);
    return this.getUsers().filter(u=>ids.includes(u.id));
  },
  getUserById(id){return this.getUsers().find(u=>u.id===id)||null;},

  getData:(key,uid)=>JSON.parse(localStorage.getItem(`tf_${key}_${uid}`)||"null"),
  setData:(key,uid,val)=>localStorage.setItem(`tf_${key}_${uid}`,JSON.stringify(val)),
};

const MUSCLES=["Ombro D","Ombro E","Bíceps D","Bíceps E","Tríceps D","Tríceps E","Peitoral","Costas","Lombar","Abdômen","Glúteo","Quadríceps D","Quadríceps E","Panturrilha D","Panturrilha E","Isquio"];
const TREINO_BASE=[{nome:"Supino Reto",series:4,reps:"8-10",carga:"80kg"},{nome:"Crucifixo",series:3,reps:"12",carga:"14kg"},{nome:"Tríceps Pulley",series:3,reps:"12-15",carga:"25kg"},{nome:"Mergulho",series:3,reps:"Falha",carga:"Corporal"}];
const NUTRI_PLANO=[{h:"07:00",r:"Café da manhã",i:"3 ovos + pão integral + banana + café",k:480},{h:"10:00",r:"Lanche manhã",i:"Iogurte grego + castanhas",k:280},{h:"12:30",r:"Almoço",i:"Frango grelhado + arroz integral + salada",k:580},{h:"16:00",r:"Pré-treino",i:"Batata doce + whey",k:320},{h:"19:00",r:"Pós-treino",i:"Tilápia + arroz + brócolis",k:450},{h:"21:30",r:"Ceia",i:"Cottage + pasta de amendoim",k:220}];

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

  function handleLogin(e){
    e.preventDefault();setError("");setLoading(true);
    setTimeout(()=>{
      const res=DB.login(email,senha);setLoading(false);
      if(!res.ok){setError(res.msg);return;}
      DB.saveSession(res.user);onLogin(res.user);
    },500);
  }
  function handleRegister(e){
    e.preventDefault();setError("");setSuccess("");
    if(!nome.trim()){setError("Informe seu nome completo.");return;}
    if(senha.length<6){setError("Senha: mínimo 6 caracteres.");return;}
    if(senha!==confirma){setError("Senhas não conferem.");return;}
    setLoading(true);
    setTimeout(()=>{
      const res=DB.register(nome.trim(),email,senha,role);setLoading(false);
      if(!res.ok){setError(res.msg);return;}
      setSuccess("Conta criada! Faça login.");setTab("login");
      setNome("");setSenha("");setConfirma("");
    },500);
  }

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
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <div className="form-group"><label className="form-label">Senha</label><input className="form-input" type="password" placeholder="••••••••" value={senha} onChange={e=>setSenha(e.target.value)} required/></div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>{loading?<span className="spinner"/>:"Entrar"}</button>
          </form>
        ):(
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Você é...</label>
              <div className="role-selector">
                {[["aluno","🏃","Aluno"],["treinador","🏋️","Treinador"],["nutri","🥗","Nutricionista"]].map(([v,icon,lbl])=>(
                  <div key={v} className={`role-opt ${role===v?`sel-${v}`:""}`} onClick={()=>setRole(v)}>
                    <div className="role-opt-icon">{icon}</div><div>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group"><label className="form-label">Nome completo</label><input className="form-input" type="text" placeholder="Seu nome" value={nome} onChange={e=>setNome(e.target.value)} required/></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <div className="form-group"><label className="form-label">Senha</label><input className="form-input" type="password" placeholder="Mínimo 6 caracteres" value={senha} onChange={e=>setSenha(e.target.value)} required/></div>
            <div className="form-group"><label className="form-label">Confirmar senha</label><input className="form-input" type="password" placeholder="Repita a senha" value={confirma} onChange={e=>setConfirma(e.target.value)} required/></div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>{loading?<span className="spinner"/>:"Criar conta grátis"}</button>
          </form>
        )}
        <div className="auth-switch">
          {tab==="login"?<>Não tem conta? <span onClick={()=>{setTab("register");setError("");}}>Cadastre-se grátis</span></>:<>Já tem conta? <span onClick={()=>{setTab("login");setError("");}}>Entrar</span></>}
        </div>
        <div className="demo-box">
          <b>🔑 Contas demo:</b><br/>
          aluno@demo.com • 123456<br/>
          treinador@demo.com • 123456<br/>
          nutri@demo.com • 123456
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SHELL
// ============================================================
function Shell({user,onLogout,nav,active,setActive,accent,children}){
  const roleLabel={aluno:"Aluno",treinador:"Treinador",nutri:"Nutricionista"}[user.role];
  return(
    <div className="shell">
      <div className="sidebar">
        <div className="sidebar-logo">TrioFit</div>
        <div className="sidebar-name">{user.nome}</div>
        <div className="sidebar-role">{roleLabel}</div>
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
        <div className="sidebar-footer">
          <div className="logout-btn" onClick={onLogout}>🚪 Sair da conta</div>
        </div>
      </div>
      <div className="main">{children}</div>
    </div>
  );
}

// ============================================================
// COMPONENTE: CÓDIGO DO PROFISSIONAL
// ============================================================
function CodigoProfissional({user}){
  const codigo=gerarCodigo(user.id);
  const [copiado,setCopiado]=useState(false);
  function copiar(){navigator.clipboard&&navigator.clipboard.writeText(codigo);setCopiado(true);setTimeout(()=>setCopiado(false),2000);}
  return(
    <div className="codigo-box">
      <div className="codigo-label">Seu código de acesso</div>
      <div className="codigo-val">{codigo}</div>
      <div style={{fontSize:"0.8rem",color:"var(--text3)",marginBottom:"0.75rem"}}>Passe este código para seus {user.role==="treinador"?"alunos":"pacientes"} se vincularem a você</div>
      <button className="btn btn-green-out btn-sm" onClick={copiar}>{copiado?"✅ Copiado!":"📋 Copiar código"}</button>
    </div>
  );
}

// ============================================================
// COMPONENTE: VÍNCULO POR CÓDIGO (Aluno)
// ============================================================
function VinculoPorCodigo({label,tipo,atual,onVincular}){
  const [codigo,setCodigo]=useState("");
  const [encontrado,setEncontrado]=useState(null);
  const [erro,setErro]=useState("");

  function buscar(){
    setErro("");setEncontrado(null);
    if(codigo.trim().length<6){setErro("Digite os 6 caracteres do código.");return;}
    const u=DB.getUserByCodigo(codigo.trim());
    if(!u){setErro("Código não encontrado. Verifique com seu "+label.toLowerCase()+".");return;}
    if(u.role!==tipo){setErro(`Este código pertence a um ${u.role}, não a um ${label.toLowerCase()}.`);return;}
    setEncontrado(u);
  }

  function confirmar(){
    if(encontrado) onVincular(encontrado);
    setCodigo("");setEncontrado(null);
  }

  const corTipo=tipo==="treinador"?"var(--orange)":tipo==="nutri"?"var(--blue)":"var(--green)";

  return(
    <div>
      {atual&&(
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.85rem",background:"var(--card2)",borderRadius:"var(--radius)",marginBottom:"1rem",border:"1px solid var(--border)"}}>
          <div className="vinc-avatar" style={{background:tipo==="treinador"?"var(--orange-dim)":"rgba(52,152,219,0.15)",color:corTipo}}>{initials(atual.nome)}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:"0.95rem"}}>{atual.nome}</div>
            <div style={{fontSize:"0.78rem",color:"var(--text2)"}}>{label} atual • Código: {gerarCodigo(atual.id)}</div>
          </div>
          <span className="tag" style={{background:tipo==="treinador"?"var(--orange-dim)":"rgba(52,152,219,0.1)",color:corTipo}}>✓ Vinculado</span>
        </div>
      )}
      <div className="form-group">
        <label className="form-label">Código do {label}</label>
        <div className="vinc-input-wrap">
          <input
            className="form-input"
            placeholder="Ex: AB3X7K"
            value={codigo}
            onChange={e=>setCodigo(e.target.value.toUpperCase())}
            maxLength={6}
            style={{fontFamily:"var(--font-mono)",fontSize:"1.1rem",letterSpacing:"0.2em",textTransform:"uppercase"}}
          />
          <button className="btn btn-ghost" onClick={buscar}>Buscar</button>
        </div>
        {erro&&<div style={{color:"var(--red)",fontSize:"0.82rem",marginTop:"0.4rem"}}>⚠️ {erro}</div>}
      </div>
      {encontrado&&(
        <div className="vinc-resultado">
          <div className="vinc-avatar" style={{background:tipo==="treinador"?"var(--orange-dim)":"rgba(52,152,219,0.15)",color:corTipo}}>{initials(encontrado.nome)}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:600}}>{encontrado.nome}</div>
            <div style={{fontSize:"0.8rem",color:"var(--text2)"}}>{label} encontrado!</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={confirmar}>Vincular ✓</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PÁGINA: MINHA EQUIPE (Aluno)
// ============================================================
function AlunoVinculo({user}){
  const [vinculo,setVinculo]=useState(()=>DB.getVinculoAluno(user.id)||{});
  const [ok,setOk]=useState("");

  const treinador=vinculo.treinadorId?DB.getUserById(vinculo.treinadorId):null;
  const nutri=vinculo.nutriId?DB.getUserById(vinculo.nutriId):null;

  function vincularTreinador(u){
    const novo={...vinculo,treinadorId:u.id};
    DB.setVinculoAluno(user.id,novo.treinadorId,novo.nutriId);
    setVinculo(novo);setOk("Treinador vinculado com sucesso!");setTimeout(()=>setOk(""),3000);
  }
  function vincularNutri(u){
    const novo={...vinculo,nutriId:u.id};
    DB.setVinculoAluno(user.id,novo.treinadorId,novo.nutriId);
    setVinculo(novo);setOk("Nutricionista vinculada com sucesso!");setTimeout(()=>setOk(""),3000);
  }
  function desvincularTreinador(){
    const novo={...vinculo,treinadorId:null};
    DB.setVinculoAluno(user.id,null,novo.nutriId);
    setVinculo(novo);setOk("Treinador desvinculado.");setTimeout(()=>setOk(""),3000);
  }
  function desvincularNutri(){
    const novo={...vinculo,nutriId:null};
    DB.setVinculoAluno(user.id,novo.treinadorId,null);
    setVinculo(novo);setOk("Nutricionista desvinculada.");setTimeout(()=>setOk(""),3000);
  }

  return(
    <div className="page">
      <div className="page-title green">MINHA EQUIPE</div>
      <div className="page-sub">Conecte-se ao seu treinador e nutricionista usando o código deles</div>
      {ok&&<div className="alert alert-success">✅ {ok}</div>}

      <div className="alert alert-info">
        🔐 <b>Como funciona:</b> Peça o código de 6 letras para seu treinador e sua nutricionista. Digite abaixo para se conectar com segurança — apenas quem tem o código pode se vincular.
      </div>

      <div className="card">
        <div className="card-title">🏋️ TREINADOR</div>
        <VinculoPorCodigo label="Treinador" tipo="treinador" atual={treinador} onVincular={vincularTreinador}/>
        {treinador&&<button className="btn btn-ghost btn-sm" style={{marginTop:"0.5rem",color:"var(--red)",borderColor:"var(--red-dim)"}} onClick={desvincularTreinador}>Desvincular treinador</button>}
      </div>

      <div className="card">
        <div className="card-title">🥗 NUTRICIONISTA</div>
        <VinculoPorCodigo label="Nutricionista" tipo="nutri" atual={nutri} onVincular={vincularNutri}/>
        {nutri&&<button className="btn btn-ghost btn-sm" style={{marginTop:"0.5rem",color:"var(--red)",borderColor:"var(--red-dim)"}} onClick={desvincularNutri}>Desvincular nutricionista</button>}
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE: STATUS DE SAÚDE (com contador de dias)
// ============================================================
function SaudeStatusCard({status,onRecuperado,onDorRecuperado,soLeitura}){
  // status.doente, status.doente_desde, status.sintomas
  // status.dores = [{musculo, desde}]
  const diasDoente=status.doente_desde?diffDays(status.doente_desde):0;

  return(
    <div>
      {status.doente&&(
        <div className="saude-status-box doente">
          <div className="saude-status-icon">🤒</div>
          <div className="saude-status-info">
            <div className="saude-status-titulo" style={{color:"var(--red)"}}>
              {diasDoente} {pluralDia(diasDoente)} {diasDoente===1?"gripado/doente":"gripado/doente"}
            </div>
            {status.sintomas&&<div className="saude-status-dias" style={{color:"var(--red)"}}>{status.sintomas}</div>}
            {!soLeitura&&<button className="btn btn-sm" style={{marginTop:"0.75rem",background:"var(--red)",color:"#fff"}} onClick={onRecuperado}>✅ Estou recuperado!</button>}
          </div>
        </div>
      )}
      {status.dores&&status.dores.length>0&&status.dores.map((d,i)=>{
        const dias=d.desde?diffDays(d.desde):0;
        return(
          <div key={i} className="saude-status-box dor">
            <div className="saude-status-icon">🔴</div>
            <div className="saude-status-info">
              <div className="saude-status-titulo" style={{color:"var(--orange)"}}>
                Dor — {d.musculo}
              </div>
              <div className="saude-status-dias" style={{color:"var(--orange)"}}>
                {dias} {pluralDia(dias)} com dor{d.intensidade?` • Intensidade: ${d.intensidade}/10`:""}
              </div>
              {!soLeitura&&<button className="btn btn-sm" style={{marginTop:"0.75rem",background:"var(--orange)",color:"#0a0f0d"}} onClick={()=>onDorRecuperado(i)}>✅ Recuperado desta dor</button>}
            </div>
          </div>
        );
      })}
      {!status.doente&&(!status.dores||status.dores.length===0)&&(
        <div className="saude-status-box bem">
          <div className="saude-status-icon">💪</div>
          <div className="saude-status-info">
            <div className="saude-status-titulo" style={{color:"var(--green)"}}>Saudável</div>
            <div className="saude-status-dias" style={{color:"var(--green)"}}>Nenhuma ocorrência registrada</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ALUNO PAGES
// ============================================================
function AlunoDash({user}){
  const vinculo=DB.getVinculoAluno(user.id)||{};
  const treinador=vinculo.treinadorId?DB.getUserById(vinculo.treinadorId):null;
  const nutri=vinculo.nutriId?DB.getUserById(vinculo.nutriId):null;
  const agua=DB.getData("agua_hoje",user.id)||0;
  const meta=DB.getData("meta_agua",user.id)||3000;
  const pct=Math.min((agua/meta)*100,100);
  const saude=DB.getData("saude",user.id)||{};

  return(
    <div className="page">
      <div className="page-title green">{getGreeting()}, {firstName(user.nome)} 👋</div>
      <div className="page-sub">{getDateStr()}</div>
      {!treinador&&!nutri&&<div className="alert alert-warn">⚠️ Sem equipe vinculada. Vá em <b>Minha Equipe</b> e insira o código do seu treinador e nutricionista!</div>}
      <div className="grid-4">
        <div className="stat-tile"><div className="stat-label">Treinador</div><div style={{marginTop:"0.5rem",fontWeight:600,fontSize:"0.9rem",color:"var(--orange)"}}>{treinador?treinador.nome.split(" ")[0]:"—"}</div></div>
        <div className="stat-tile"><div className="stat-label">Nutricionista</div><div style={{marginTop:"0.5rem",fontWeight:600,fontSize:"0.9rem",color:"var(--blue)"}}>{nutri?nutri.nome.split(" ")[0]:"—"}</div></div>
        <div className="stat-tile"><div className="stat-label">Água hoje</div><div className="stat-value blue">{(agua/1000).toFixed(1)}<span className="stat-unit">L</span></div></div>
        <div className="stat-tile"><div className="stat-label">Meta água</div><div className="stat-value orange">{(meta/1000).toFixed(1)}<span className="stat-unit">L</span></div></div>
      </div>
      <div className="card">
        <div className="card-title">❤️ STATUS DE SAÚDE</div>
        <SaudeStatusCard status={saude} soLeitura={true}/>
      </div>
      <div className="card">
        <div className="card-title">💧 HIDRATAÇÃO DE HOJE</div>
        <div className="prog-wrap">
          <div className="prog-hdr"><span>Progresso</span><span className="blue">{agua}ml / {meta}ml</span></div>
          <div className="prog-track"><div className="prog-fill blue" style={{width:`${pct}%`}}/></div>
        </div>
        <div style={{fontSize:"0.85rem",color:pct>=100?"var(--green)":"var(--text2)"}}>{pct>=100?"🎉 Meta atingida!":`Faltam ${((meta-agua)/1000).toFixed(1)}L`}</div>
      </div>
      <div className="card">
        <div className="card-title">📋 TREINO DE HOJE</div>
        {TREINO_BASE.map((ex,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"0.65rem 0",borderBottom:i<TREINO_BASE.length-1?"1px solid var(--border)":"none",fontSize:"0.9rem"}}>
            <span style={{fontWeight:600}}>{ex.nome}</span>
            <span style={{color:"var(--text2)"}}>{ex.series}x {ex.reps} • {ex.carga}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlunoSaude({user}){
  const s=DB.getData("saude",user.id)||{};
  const [doente,setDoente]=useState(s.doente||false);
  const [sintomas,setSintomas]=useState(s.sintomas||"");
  const [doenteDe,setDoenteDe]=useState(s.doente_desde||null);
  const [mens,setMens]=useState(s.mens||false);
  const [meds,setMeds]=useState(s.meds||"");
  const [obs,setObs]=useState(s.obs||"");
  // dores: [{musculo, desde, intensidade}]
  const [dores,setDores]=useState(s.dores||[]);
  const [musculoSel,setMusculoSel]=useState([]);
  const [ok,setOk]=useState(false);

  function salvar(overrides={}){
    const data={doente,sintomas,doente_desde:doenteDe,mens,meds,obs,dores,...overrides};
    DB.setData("saude",user.id,data);setOk(true);setTimeout(()=>setOk(false),3000);
  }

  function marcarDoente(){
    const agora=new Date().toISOString();
    setDoente(true);setDoenteDe(agora);
    salvar({doente:true,doente_desde:agora});
  }
  function marcarRecuperado(){
    setDoente(false);setDoenteDe(null);setSintomas("");
    salvar({doente:false,doente_desde:null,sintomas:""});
  }
  function adicionarDor(){
    if(musculoSel.length===0)return;
    const agora=new Date().toISOString();
    const novasDores=[...dores,...musculoSel.filter(m=>!dores.find(d=>d.musculo===m)).map(m=>({musculo:m,desde:agora,intensidade:5}))];
    setDores(novasDores);setMusculoSel([]);
    salvar({dores:novasDores});
  }
  function removerDor(idx){
    const novas=dores.filter((_,i)=>i!==idx);
    setDores(novas);salvar({dores:novas});
  }
  function toggleMusculo(m){setMusculoSel(p=>p.includes(m)?p.filter(x=>x!==m):[...p,m]);}

  return(
    <div className="page">
      <div className="page-title green">SAÚDE</div>
      <div className="page-sub">Treinador e nutricionista verão estas informações</div>
      {ok&&<div className="alert alert-success">✅ Salvo com sucesso!</div>}

      {/* STATUS ATUAL */}
      <div className="card">
        <div className="card-title">📊 STATUS ATUAL</div>
        <SaudeStatusCard
          status={{doente,doente_desde:doenteDe,sintomas,dores}}
          onRecuperado={marcarRecuperado}
          onDorRecuperado={removerDor}
          soLeitura={false}
        />
      </div>

      {/* MARCAR DOENÇA */}
      <div className="card">
        <div className="card-title">🤒 REGISTRAR DOENÇA</div>
        {!doente?(
          <>
            <div className="form-group"><label className="form-label">Sintomas</label><input className="form-input" placeholder="Ex: Gripe, febre, dor de garganta..." value={sintomas} onChange={e=>setSintomas(e.target.value)}/></div>
            <button className="btn btn-ghost" onClick={marcarDoente} style={{color:"var(--red)",borderColor:"rgba(231,76,60,0.4)"}}>🤒 Estou doente / me machuquei</button>
          </>
        ):(
          <div style={{color:"var(--text2)",fontSize:"0.85rem"}}>Você está com {diffDays(doenteDe)} {pluralDia(diffDays(doenteDe))} de doença. Clique em "Estou recuperado!" no status acima quando melhorar.</div>
        )}
      </div>

      {/* DORES MUSCULARES */}
      <div className="card">
        <div className="card-title">🔴 REGISTRAR DOR MUSCULAR</div>
        {dores.length>0&&(
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"0.8rem",color:"var(--text3)",marginBottom:"0.5rem",textTransform:"uppercase",letterSpacing:"0.1em"}}>Dores ativas</div>
            {dores.map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.65rem",background:"var(--red-dim)",borderRadius:"var(--radius)",marginBottom:"0.5rem",border:"1px solid rgba(231,76,60,0.3)"}}>
                <span style={{color:"var(--red)",fontWeight:600,fontSize:"0.9rem"}}>{d.musculo}</span>
                <span style={{flex:1,fontSize:"0.8rem",color:"var(--text2)"}}>{diffDays(d.desde)} {pluralDia(diffDays(d.desde))}</span>
                <button className="btn btn-sm" style={{background:"var(--green)",color:"#0a0f0d",padding:"0.3rem 0.75rem",fontSize:"0.75rem"}} onClick={()=>removerDor(i)}>✅ Recuperado</button>
              </div>
            ))}
          </div>
        )}
        <div style={{fontSize:"0.85rem",color:"var(--text2)",marginBottom:"0.75rem"}}>Selecione os músculos com dor:</div>
        <div className="pain-grid" style={{marginBottom:"1rem"}}>
          {MUSCLES.map(m=><div key={m} className={`muscle-btn ${musculoSel.includes(m)?"selected":""}`} onClick={()=>toggleMusculo(m)}>{m}</div>)}
        </div>
        {musculoSel.length>0&&<button className="btn btn-ghost" style={{color:"var(--red)",borderColor:"rgba(231,76,60,0.4)"}} onClick={adicionarDor}>🔴 Registrar dor em: {musculoSel.join(", ")}</button>}
      </div>

      {/* OUTROS */}
      <div className="card">
        <div className="card-title">🔢 OUTRAS INFORMAÇÕES</div>
        <div className="check-item" onClick={()=>{setMens(!mens);salvar({mens:!mens});}}>
          <div className={`check-box ${mens?"checked":""}`}>{mens&&"✓"}</div>
          <span>Semana menstrual</span>
        </div>
        <div className="form-group" style={{marginTop:"0.75rem"}}>
          <label className="form-label">💊 Medicamentos em uso</label>
          <textarea className="form-textarea" placeholder="Ex: Vitamina D 2000UI, Creatina 5g..." value={meds} onChange={e=>setMeds(e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">📝 Observações</label>
          <textarea className="form-textarea" placeholder="Qualquer informação para treinador e nutricionista..." value={obs} onChange={e=>setObs(e.target.value)}/>
        </div>
        <button className="btn btn-primary" onClick={()=>salvar()}>💾 Salvar</button>
      </div>
    </div>
  );
}

function AlunoTreinos({user}){
  const [checked,setChecked]=useState({});
  const [rating,setRating]=useState(0);
  const [feedback,setFeedback]=useState("");
  const [ok,setOk]=useState(false);
  const done=Object.values(checked).filter(Boolean).length;
  function salvar(){DB.setData("treino_hoje",user.id,{checked,rating,feedback,data:new Date().toISOString()});setOk(true);setTimeout(()=>setOk(false),3000);}
  return(
    <div className="page">
      <div className="page-title green">TREINOS</div>
      <div className="page-sub">Registre e avalie seus treinos</div>
      {ok&&<div className="alert alert-success">✅ Treino registrado!</div>}
      <div className="card">
        <div className="card-title">🏋️ TREINO DE HOJE</div>
        <div className="prog-wrap">
          <div className="prog-hdr"><span>Progresso</span><span className="green">{done}/{TREINO_BASE.length}</span></div>
          <div className="prog-track"><div className="prog-fill green" style={{width:`${(done/TREINO_BASE.length)*100}%`}}/></div>
        </div>
        {TREINO_BASE.map((ex,i)=>(
          <div key={i} className="check-item" onClick={()=>setChecked(p=>({...p,[i]:!p[i]}))}>
            <div className={`check-box ${checked[i]?"checked":""}`}>{checked[i]&&"✓"}</div>
            <div style={{flex:1}}><div style={{fontWeight:600}}>{ex.nome}</div><div style={{fontSize:"0.78rem",color:"var(--text2)"}}>{ex.series} séries × {ex.reps} • {ex.carga}</div></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">⭐ AVALIAR TREINO</div>
        <div className="form-group">
          <label className="form-label">Nota geral</label>
          <div className="stars">{[1,2,3,4,5].map(s=><div key={s} style={{fontSize:"2rem",cursor:"pointer",color:s<=rating?"var(--orange)":"var(--border)"}} onClick={()=>setRating(s)}>★</div>)}</div>
        </div>
        <div className="form-group"><label className="form-label">Feedback para o treinador</label><textarea className="form-textarea" placeholder="Como foi o treino?" value={feedback} onChange={e=>setFeedback(e.target.value)}/></div>
        <button className="btn btn-primary btn-full" onClick={salvar}>✅ Registrar Treino</button>
      </div>
    </div>
  );
}

function AlunoHidratacao({user}){
  const [ml,setMl]=useState(()=>DB.getData("agua_hoje",user.id)||0);
  const [meta,setMeta]=useState(()=>DB.getData("meta_agua",user.id)||3000);
  const [novaMeta,setNovaMeta]=useState(meta);
  const pct=Math.min((ml/meta)*100,100);
  function add(q){const n=Math.min(ml+q,9999);setMl(n);DB.setData("agua_hoje",user.id,n);}
  function salvarMeta(){const n=Number(novaMeta);setMeta(n);DB.setData("meta_agua",user.id,n);}
  return(
    <div className="page">
      <div className="page-title green">HIDRATAÇÃO</div>
      <div className="page-sub">{getDateStr()}</div>
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

function AlunoAlimentacao({user}){
  const [regs,setRegs]=useState(()=>DB.getData("alimentacao",user.id)||[]);
  const [hora,setHora]=useState("12:00");
  const [desc,setDesc]=useState("");
  const [kcal,setKcal]=useState("");
  const total=regs.reduce((s,r)=>s+r.kcal,0);
  function add(){
    if(!desc.trim())return;
    const novo=[...regs,{hora,desc,kcal:Number(kcal)||0}];
    setRegs(novo);DB.setData("alimentacao",user.id,novo);setDesc("");setKcal("");
  }
  return(
    <div className="page">
      <div className="page-title green">ALIMENTAÇÃO</div>
      <div className="page-sub">Registre o que você comeu hoje</div>
      <div className="grid-2" style={{marginBottom:"1.5rem"}}>
        <div className="stat-tile"><div className="stat-label">Kcal registradas</div><div className="stat-value green">{total}<span className="stat-unit">kcal</span></div></div>
        <div className="stat-tile"><div className="stat-label">Refeições hoje</div><div className="stat-value orange">{regs.length}</div></div>
      </div>
      <div className="card">
        <div className="card-title">🥗 PLANO DA NUTRICIONISTA</div>
        {NUTRI_PLANO.map((r,i)=>(
          <div key={i} className="meal-item">
            <div><div style={{fontWeight:600,fontSize:"0.9rem"}}>{r.r}</div><div style={{fontSize:"0.78rem",color:"var(--text2)"}}>{r.i}</div></div>
            <div style={{textAlign:"right",flexShrink:0}}><div className="meal-time">{r.h}</div><div style={{fontSize:"0.75rem",color:"var(--green)"}}>{r.k}kcal</div></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">✏️ O QUE EU COMI</div>
        {regs.length===0&&<div style={{color:"var(--text3)",fontSize:"0.85rem",marginBottom:"1rem"}}>Nenhuma refeição registrada ainda.</div>}
        {regs.map((r,i)=>(
          <div key={i} className="meal-item">
            <div><div style={{fontWeight:600}}>{r.desc}</div><div className="meal-time">{r.hora}</div></div>
            <div style={{color:"var(--green)",fontWeight:600}}>~{r.kcal}kcal</div>
          </div>
        ))}
        <div style={{marginTop:"1rem"}}>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Horário</label><input className="form-input" type="time" value={hora} onChange={e=>setHora(e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Calorias (kcal)</label><input className="form-input" type="number" placeholder="0" value={kcal} onChange={e=>setKcal(e.target.value)}/></div>
          </div>
          <div className="form-group"><label className="form-label">O que você comeu</label><textarea className="form-textarea" placeholder="Descreva a refeição..." value={desc} onChange={e=>setDesc(e.target.value)}/></div>
          <button className="btn btn-primary" onClick={add}>+ Adicionar refeição</button>
        </div>
      </div>
    </div>
  );
}

function AlunoAvaliacao({user}){
  const saved=DB.getData("avaliacao",user.id)||{};
  const [f,setF]=useState(saved);
  const [ok,setOk]=useState(false);
  function set(k,v){setF(p=>({...p,[k]:v}));}
  function salvar(){DB.setData("avaliacao",user.id,f);setOk(true);setTimeout(()=>setOk(false),3000);}
  return(
    <div className="page">
      <div className="page-title green">AVALIAÇÃO FÍSICA</div>
      <div className="page-sub">Seus dados ficam visíveis para treinador e nutricionista</div>
      {ok&&<div className="alert alert-success">✅ Avaliação salva!</div>}
      <div className="card">
        <div className="card-title">📏 MEDIDAS CORPORAIS</div>
        <div className="grid-2">
          {[["peso","Peso","kg"],["gordura","% Gordura","%"],["cintura","Cintura","cm"],["quadril","Quadril","cm"],["braco_d","Braço D","cm"],["braco_e","Braço E","cm"],["perna_d","Perna D","cm"],["perna_e","Perna E","cm"]].map(([k,l,u])=>(
            <div key={k} className="form-group">
              <label className="form-label">{l}</label>
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

function AlunoCompeticoes({user}){
  const [comps,setComps]=useState(()=>DB.getData("competicoes",user.id)||[]);
  const [f,setF]=useState({nome:"",modalidade:"Corrida",data:"",local:"",objetivo:"Completar"});
  const [ok,setOk]=useState(false);
  function set(k,v){setF(p=>({...p,[k]:v}));}
  function add(){
    if(!f.nome||!f.data)return;
    const novo=[...comps,{...f,id:Date.now()}];
    setComps(novo);DB.setData("competicoes",user.id,novo);
    setF({nome:"",modalidade:"Corrida",data:"",local:"",objetivo:"Completar"});
    setOk(true);setTimeout(()=>setOk(false),3000);
  }
  return(
    <div className="page">
      <div className="page-title green">COMPETIÇÕES</div>
      <div className="page-sub">Treinador e nutricionista também verão seus eventos</div>
      {ok&&<div className="alert alert-success">✅ Competição cadastrada!</div>}
      {comps.length>0&&(
        <div className="card">
          <div className="card-title">📅 MEUS EVENTOS</div>
          {comps.map((c,i)=>{
            const d=new Date(c.data);
            return(
              <div key={i} className="comp-card" style={{background:"var(--bg2)"}}>
                <div className="comp-date"><div className="comp-date-day">{d.getDate()}</div><div className="comp-date-month">{d.toLocaleDateString("pt-BR",{month:"short"})}</div></div>
                <div style={{flex:1}}><div style={{fontWeight:600}}>{c.nome}</div><div style={{fontSize:"0.8rem",color:"var(--text2)"}}>{c.modalidade} • {c.local}</div></div>
                <span className="tag tag-orange">{c.objetivo.toUpperCase()}</span>
              </div>
            );
          })}
        </div>
      )}
      <div className="card">
        <div className="card-title">➕ CADASTRAR COMPETIÇÃO</div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Nome do evento</label><input className="form-input" placeholder="Ex: Ironman Florianópolis" value={f.nome} onChange={e=>set("nome",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Modalidade</label>
            <select className="form-select" value={f.modalidade} onChange={e=>set("modalidade",e.target.value)}>
              {["Corrida","Natação","Triathlon / Ironman","Luta","Fisiculturismo","Ciclismo","Caminhada"].map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Data</label><input className="form-input" type="date" value={f.data} onChange={e=>set("data",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Local</label><input className="form-input" placeholder="Cidade / Local" value={f.local} onChange={e=>set("local",e.target.value)}/></div>
        </div>
        <div className="form-group"><label className="form-label">Objetivo</label>
          <select className="form-select" value={f.objetivo} onChange={e=>set("objetivo",e.target.value)}>
            {["Completar","Bater meu recorde","Subir no pódio","Subir no palco","Definição de peso"].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={add}>+ Cadastrar evento</button>
      </div>
    </div>
  );
}

// ============================================================
// DIÁRIO COMPLETO (visto pelo prof)
// ============================================================
function DiarioAluno({aluno,onBack}){
  const saude=DB.getData("saude",aluno.id)||{};
  const treino=DB.getData("treino_hoje",aluno.id)||{};
  const alim=DB.getData("alimentacao",aluno.id)||[];
  const agua=DB.getData("agua_hoje",aluno.id)||0;
  const metaAgua=DB.getData("meta_agua",aluno.id)||3000;
  const aval=DB.getData("avaliacao",aluno.id)||{};
  const comps=DB.getData("competicoes",aluno.id)||[];

  return(
    <div className="page">
      <div style={{marginBottom:"1rem"}}><button className="btn btn-ghost btn-sm" onClick={onBack}>← Voltar</button></div>
      <div className="page-title" style={{color:"var(--text)"}}>{aluno.nome}</div>
      <div className="page-sub">Diário completo</div>

      <div className="card">
        <div className="card-title">❤️ SAÚDE DA SEMANA</div>
        <SaudeStatusCard status={saude} soLeitura={true}/>
        <div style={{marginTop:"1rem",display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
          {saude.mens&&<span className="tag tag-orange">🔴 Ciclo menstrual</span>}
          {saude.meds&&<span className="tag tag-blue">💊 Medicamentos</span>}
        </div>
        {saude.meds&&<div className="diario-section" style={{marginTop:"0.75rem"}}><div className="diario-label">Medicamentos</div><div className="diario-val">{saude.meds}</div></div>}
        {saude.obs&&<div className="diario-section" style={{marginTop:"0.5rem"}}><div className="diario-label">Observações</div><div className="diario-val">{saude.obs}</div></div>}
      </div>

      <div className="card">
        <div className="card-title">🏋️ TREINO DE HOJE</div>
        {treino.checked?(
          <>
            <div className="grid-2" style={{marginBottom:"1rem"}}>
              <div className="diario-section"><div className="diario-label">Nota</div><div style={{fontSize:"1.5rem"}}>{"★".repeat(treino.rating||0)}{"☆".repeat(5-(treino.rating||0))}</div></div>
              <div className="diario-section"><div className="diario-label">Exercícios feitos</div><div className="diario-val">{Object.values(treino.checked).filter(Boolean).length} / {TREINO_BASE.length}</div></div>
            </div>
            {treino.feedback&&<div className="diario-section"><div className="diario-label">Feedback do aluno</div><div className="diario-val">"{treino.feedback}"</div></div>}
          </>
        ):<div style={{color:"var(--text3)",fontSize:"0.85rem"}}>Nenhum treino registrado hoje.</div>}
      </div>

      <div className="card">
        <div className="card-title">💧 HIDRATAÇÃO</div>
        <div className="prog-wrap">
          <div className="prog-hdr"><span>Ingestão de água</span><span className="blue">{agua}ml / {metaAgua}ml</span></div>
          <div className="prog-track"><div className="prog-fill blue" style={{width:`${Math.min((agua/metaAgua)*100,100)}%`}}/></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🥗 ALIMENTAÇÃO</div>
        {alim.length===0?<div style={{color:"var(--text3)",fontSize:"0.85rem"}}>Nenhuma refeição registrada.</div>:
          alim.map((r,i)=>(
            <div key={i} className="meal-item">
              <div><div style={{fontWeight:600}}>{r.desc}</div><div className="meal-time">{r.hora}</div></div>
              <div style={{color:"var(--green)",fontWeight:600}}>~{r.kcal}kcal</div>
            </div>
          ))
        }
      </div>

      {Object.keys(aval).length>0&&(
        <div className="card">
          <div className="card-title">📊 AVALIAÇÃO FÍSICA</div>
          <div className="grid-2">
            {[["peso","Peso","kg"],["gordura","% Gordura","%"],["cintura","Cintura","cm"],["quadril","Quadril","cm"]].map(([k,l,u])=>
              aval[k]?<div key={k} className="diario-section"><div className="diario-label">{l}</div><div className="diario-val">{aval[k]}{u}</div></div>:null
            )}
          </div>
        </div>
      )}

      {comps.length>0&&(
        <div className="card">
          <div className="card-title">🏆 COMPETIÇÕES</div>
          {comps.map((c,i)=>{
            const d=new Date(c.data);
            return(
              <div key={i} className="comp-card" style={{background:"var(--bg2)"}}>
                <div className="comp-date"><div className="comp-date-day">{d.getDate()}</div><div className="comp-date-month">{d.toLocaleDateString("pt-BR",{month:"short"})}</div></div>
                <div style={{flex:1}}><div style={{fontWeight:600}}>{c.nome}</div><div style={{fontSize:"0.8rem",color:"var(--text2)"}}>{c.modalidade}</div></div>
                <span className="tag tag-orange">{c.objetivo}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TREINADOR PAGES
// ============================================================
function TreinadorDash({user}){
  const alunos=DB.getAlunosDe(user.id);
  const [alunoVer,setAlunoVer]=useState(null);
  if(alunoVer)return<DiarioAluno aluno={alunoVer} onBack={()=>setAlunoVer(null)}/>;
  const comAlerta=alunos.filter(a=>{const s=DB.getData("saude",a.id)||{};return s.doente||(s.dores&&s.dores.length>0);});
  return(
    <div className="page">
      <div className="page-title orange">{getGreeting()}, {firstName(user.nome)} 👋</div>
      <div className="page-sub">{getDateStr()}</div>
      <div className="card" style={{marginBottom:"1.5rem",padding:"1rem 1.5rem"}}>
        <CodigoProfissional user={user}/>
      </div>
      <div className="grid-4">
        <div className="stat-tile"><div className="stat-label">Meus alunos</div><div className="stat-value orange">{alunos.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Alertas saúde</div><div className="stat-value red">{comAlerta.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Perfil</div><div style={{marginTop:"0.5rem",color:"var(--orange)",fontWeight:600,fontSize:"0.9rem"}}>Treinador</div></div>
        <div className="stat-tile"><div className="stat-label">Código</div><div style={{marginTop:"0.35rem",fontFamily:"var(--font-mono)",fontSize:"1.1rem",color:"var(--green)",letterSpacing:"0.1em"}}>{gerarCodigo(user.id)}</div></div>
      </div>
      {comAlerta.length>0&&<div className="alert alert-danger">🔴 Alertas: {comAlerta.map(a=>a.nome.split(" ")[0]).join(", ")} — verificar saúde desta semana!</div>}
      {alunos.length===0?(
        <div className="card">
          <div className="card-title">👥 MEUS ALUNOS</div>
          <div style={{color:"var(--text2)",fontSize:"0.9rem",lineHeight:1.7}}>Nenhum aluno vinculado ainda.<br/>Compartilhe seu código <b style={{color:"var(--green)",fontFamily:"var(--font-mono)"}}>{gerarCodigo(user.id)}</b> para seus alunos se conectarem em "Minha Equipe".</div>
        </div>
      ):(
        <div className="card">
          <div className="card-title">👥 MEUS ALUNOS — clique para ver o diário</div>
          {alunos.map(a=>{
            const s=DB.getData("saude",a.id)||{};
            const temAlerta=s.doente||(s.dores&&s.dores.length>0);
            return(
              <div key={a.id} className="aluno-row" onClick={()=>setAlunoVer(a)}>
                <div className="aluno-avatar">{initials(a.nome)}</div>
                <div style={{flex:1}}><div style={{fontWeight:600,fontSize:"0.95rem"}}>{a.nome}</div><div style={{fontSize:"0.78rem",color:"var(--text2)"}}>{a.email}</div></div>
                {temAlerta&&<span className="tag tag-red">⚠️ Alerta</span>}
                <span style={{color:"var(--text3)",fontSize:"0.8rem"}}>Ver →</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TreinadorPrescrever({user}){
  const alunos=DB.getAlunosDe(user.id);
  const [ok,setOk]=useState(false);
  const [nomeT,setNomeT]=useState("Peito + Tríceps");
  function salvar(){DB.setData("treino_prescrito",user.id,{nome:nomeT,exercicios:TREINO_BASE,data:new Date().toISOString()});setOk(true);setTimeout(()=>setOk(false),3000);}
  return(
    <div className="page">
      <div className="page-title orange">PRESCREVER TREINO</div>
      <div className="page-sub">Monte planos para seus alunos</div>
      {ok&&<div className="alert alert-success">✅ Treino salvo!</div>}
      {alunos.length===0&&<div className="alert alert-warn">⚠️ Nenhum aluno vinculado. Compartilhe seu código: <b style={{fontFamily:"var(--font-mono)"}}>{gerarCodigo(user.id)}</b></div>}
      <div className="card">
        <div className="card-title">🏋️ MONTAR TREINO</div>
        <div className="form-group"><label className="form-label">Nome do treino</label><input className="form-input" value={nomeT} onChange={e=>setNomeT(e.target.value)}/></div>
        {TREINO_BASE.map((ex,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"0.65rem",background:"var(--card2)",borderRadius:"var(--radius)",marginBottom:"0.5rem",fontSize:"0.85rem"}}>
            <span style={{fontWeight:600}}>{ex.nome}</span>
            <span style={{color:"var(--text2)"}}>{ex.series}x {ex.reps} • {ex.carga}</span>
          </div>
        ))}
        <button className="btn btn-ghost" style={{marginTop:"0.5rem"}}>+ Adicionar exercício</button>
      </div>
      <button className="btn btn-orange btn-full" onClick={salvar}>💾 Salvar treino</button>
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
      <div className="page-sub">Saúde e treinos dos alunos</div>
      {alunos.length===0?(
        <div className="card"><div style={{color:"var(--text2)",fontSize:"0.9rem"}}>Nenhum aluno vinculado ainda. Seu código: <b style={{fontFamily:"var(--font-mono)",color:"var(--green)"}}>{gerarCodigo(user.id)}</b></div></div>
      ):alunos.map(a=>{
        const s=DB.getData("saude",a.id)||{};
        const t=DB.getData("treino_hoje",a.id)||{};
        const agua=DB.getData("agua_hoje",a.id)||0;
        const meta=DB.getData("meta_agua",a.id)||3000;
        const diasDoente=s.doente_desde?diffDays(s.doente_desde):0;
        return(
          <div key={a.id} className="card" style={{cursor:"pointer"}} onClick={()=>setAlunoVer(a)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
              <div><div className="card-title" style={{marginBottom:"0.1rem"}}>{a.nome}</div></div>
              <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                {s.doente&&<span className="tag tag-red">🤒 {diasDoente}d doente</span>}
                {s.dores&&s.dores.length>0&&<span className="tag tag-orange">🔴 {s.dores.length} dor{s.dores.length>1?"es":""}</span>}
              </div>
            </div>
            <div className="prog-wrap">
              <div className="prog-hdr"><span style={{fontSize:"0.8rem"}}>Hidratação</span><span className="blue" style={{fontSize:"0.8rem"}}>{Math.round((agua/meta)*100)}%</span></div>
              <div className="prog-track"><div className="prog-fill blue" style={{width:`${Math.min((agua/meta)*100,100)}%`}}/></div>
            </div>
            {t.rating>0&&<div style={{fontSize:"0.85rem",color:"var(--text2)"}}>Último treino: {"★".repeat(t.rating)}{"☆".repeat(5-t.rating)}</div>}
            <div style={{fontSize:"0.8rem",color:"var(--green)",marginTop:"0.5rem"}}>Ver diário completo →</div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// NUTRI PAGES
// ============================================================
function NutriDash({user}){
  const pacientes=DB.getAlunosDe(user.id);
  const [pacVer,setPacVer]=useState(null);
  if(pacVer)return<DiarioAluno aluno={pacVer} onBack={()=>setPacVer(null)}/>;
  return(
    <div className="page">
      <div className="page-title blue">{getGreeting()}, {firstName(user.nome)} 👋</div>
      <div className="page-sub">{getDateStr()}</div>
      <div className="card" style={{marginBottom:"1.5rem",padding:"1rem 1.5rem"}}>
        <CodigoProfissional user={user}/>
      </div>
      <div className="grid-4">
        <div className="stat-tile"><div className="stat-label">Meus pacientes</div><div className="stat-value blue">{pacientes.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Planos ativos</div><div className="stat-value green">{pacientes.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Perfil</div><div style={{marginTop:"0.5rem",color:"var(--blue)",fontWeight:600,fontSize:"0.9rem"}}>Nutricionista</div></div>
        <div className="stat-tile"><div className="stat-label">Código</div><div style={{marginTop:"0.35rem",fontFamily:"var(--font-mono)",fontSize:"1.1rem",color:"var(--green)",letterSpacing:"0.1em"}}>{gerarCodigo(user.id)}</div></div>
      </div>
      {pacientes.length===0?(
        <div className="card">
          <div className="card-title">👥 MEUS PACIENTES</div>
          <div style={{color:"var(--text2)",fontSize:"0.9rem",lineHeight:1.7}}>Nenhum paciente vinculado ainda.<br/>Compartilhe seu código <b style={{color:"var(--green)",fontFamily:"var(--font-mono)"}}>{gerarCodigo(user.id)}</b> para seus pacientes se conectarem.</div>
        </div>
      ):(
        <div className="card">
          <div className="card-title">👥 MEUS PACIENTES — clique para ver o diário</div>
          {pacientes.map(p=>{
            const s=DB.getData("saude",p.id)||{};
            const agua=DB.getData("agua_hoje",p.id)||0;
            const meta=DB.getData("meta_agua",p.id)||3000;
            const diasDoente=s.doente_desde?diffDays(s.doente_desde):0;
            return(
              <div key={p.id} className="aluno-row" onClick={()=>setPacVer(p)}>
                <div className="aluno-avatar" style={{background:"rgba(52,152,219,0.15)",color:"var(--blue)"}}>{initials(p.nome)}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600}}>{p.nome}</div>
                  <div style={{fontSize:"0.78rem",color:"var(--text2)"}}>Hidratação: {Math.round((agua/meta)*100)}%{s.mens?" • 🔴 Ciclo":""}</div>
                </div>
                <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap"}}>
                  {s.doente&&<span className="tag tag-red">🤒 {diasDoente}d</span>}
                  {s.dores&&s.dores.length>0&&<span className="tag tag-orange">🔴 Dor</span>}
                </div>
                <span style={{color:"var(--text3)",fontSize:"0.8rem"}}>Ver →</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NutriPlano({user}){
  const pacientes=DB.getAlunosDe(user.id);
  const [fase,setFase]=useState("normal");
  const [ok,setOk]=useState(false);
  const fases={normal:2330,carga:3100,cutting:1800,peak:2000};
  function salvar(){DB.setData("plano_nutri",user.id,{fase,kcal:fases[fase]});setOk(true);setTimeout(()=>setOk(false),3000);}
  return(
    <div className="page">
      <div className="page-title blue">PLANO ALIMENTAR</div>
      <div className="page-sub">Configure o protocolo nutricional</div>
      {ok&&<div className="alert alert-success">✅ Plano salvo!</div>}
      {pacientes.length===0&&<div className="alert alert-warn">⚠️ Sem pacientes vinculados. Código: <b style={{fontFamily:"var(--font-mono)"}}>{gerarCodigo(user.id)}</b></div>}
      <div className="card">
        <div className="card-title">🎯 PROTOCOLO / FASE</div>
        <div className="toggle-wrap">
          {[["normal","Normal"],["carga","Semana de Carga"],["cutting","Cutting"],["peak","Peak Week"]].map(([v,l])=>(
            <button key={v} className={`toggle-btn ${fase===v?"active-blue":""}`} onClick={()=>setFase(v)}>{l}</button>
          ))}
        </div>
        <div style={{background:"rgba(52,152,219,0.1)",border:"1px solid rgba(52,152,219,0.3)",color:"var(--blue)",padding:"0.85rem 1rem",borderRadius:"var(--radius)",fontSize:"0.85rem",marginBottom:"1rem"}}>
          {fase==="normal"&&"📋 Dieta padrão — manutenção com déficit leve"}
          {fase==="carga"&&"⚡ Alto carboidrato para prova longa (Ironman, maratona)"}
          {fase==="cutting"&&"⚖️ Déficit calórico controlado para pesagem"}
          {fase==="peak"&&"🏆 Ajuste fino para subir no palco"}
        </div>
        <div className="stat-tile"><div className="stat-label">Meta calórica</div><div className="stat-value blue">{fases[fase].toLocaleString()}<span className="stat-unit">kcal/dia</span></div></div>
      </div>
      <div className="card">
        <div className="card-title">🥗 REFEIÇÕES PRESCRITAS</div>
        {NUTRI_PLANO.map((r,i)=>(
          <div key={i} style={{display:"flex",gap:"0.75rem",padding:"0.75rem 0",borderBottom:i<NUTRI_PLANO.length-1?"1px solid var(--border)":"none"}}>
            <div style={{fontFamily:"var(--font-mono)",fontSize:"0.75rem",color:"var(--text3)",flexShrink:0,paddingTop:"0.15rem",minWidth:"45px"}}>{r.h}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:"0.9rem"}}>{r.r}</div><div style={{fontSize:"0.78rem",color:"var(--text2)"}}>{r.i}</div></div>
            <div style={{color:"var(--green)",fontSize:"0.85rem",fontWeight:600,flexShrink:0}}>{r.k}kcal</div>
          </div>
        ))}
      </div>
      <button className="btn btn-blue btn-full" onClick={salvar}>💾 Salvar plano</button>
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
      <div className="page-sub">Saúde e alimentação dos pacientes</div>
      {pacientes.length===0?(
        <div className="card"><div style={{color:"var(--text2)",fontSize:"0.9rem"}}>Sem pacientes vinculados. Código: <b style={{fontFamily:"var(--font-mono)",color:"var(--green)"}}>{gerarCodigo(user.id)}</b></div></div>
      ):pacientes.map(p=>{
        const s=DB.getData("saude",p.id)||{};
        const alim=DB.getData("alimentacao",p.id)||[];
        const agua=DB.getData("agua_hoje",p.id)||0;
        const meta=DB.getData("meta_agua",p.id)||3000;
        const totalKcal=alim.reduce((acc,r)=>acc+r.kcal,0);
        const diasDoente=s.doente_desde?diffDays(s.doente_desde):0;
        return(
          <div key={p.id} className="card" style={{cursor:"pointer"}} onClick={()=>setPacVer(p)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
              <div><div className="card-title" style={{marginBottom:"0.1rem"}}>{p.nome}</div></div>
              <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                {s.mens&&<span className="tag tag-orange">🔴 Ciclo</span>}
                {s.doente&&<span className="tag tag-red">🤒 {diasDoente}d doente</span>}
                {s.meds&&<span className="tag tag-blue">💊 Meds</span>}
                {s.dores&&s.dores.length>0&&<span className="tag tag-orange">🔴 Dor muscular</span>}
              </div>
            </div>
            <div className="prog-wrap">
              <div className="prog-hdr"><span style={{fontSize:"0.8rem"}}>Hidratação</span><span className="blue" style={{fontSize:"0.8rem"}}>{agua}ml / {meta}ml</span></div>
              <div className="prog-track"><div className="prog-fill blue" style={{width:`${Math.min((agua/meta)*100,100)}%`}}/></div>
            </div>
            <div style={{fontSize:"0.85rem",color:"var(--text2)"}}>Kcal hoje: <span style={{color:"var(--green)",fontWeight:600}}>{totalKcal}kcal</span> • {alim.length} refeições</div>
            <div style={{fontSize:"0.8rem",color:"var(--blue)",marginTop:"0.5rem"}}>Ver diário completo →</div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// NAV CONFIGS
// ============================================================
const NAV_ALUNO=[
  {section:"VISÃO GERAL",items:[{id:"dashboard",icon:"🏠",label:"Dashboard"}]},
  {section:"DIÁRIO",items:[{id:"treinos",icon:"🏋️",label:"Treinos"},{id:"alimentacao",icon:"🥗",label:"Alimentação"},{id:"hidratacao",icon:"💧",label:"Hidratação"},{id:"saude",icon:"❤️",label:"Saúde"}]},
  {section:"PROGRESSO",items:[{id:"avaliacao",icon:"📊",label:"Avaliação Física"},{id:"competicoes",icon:"🏆",label:"Competições"}]},
  {section:"EQUIPE",items:[{id:"vinculo",icon:"🔗",label:"Minha Equipe"}]},
];
const NAV_TREINADOR=[
  {section:"VISÃO GERAL",items:[{id:"dashboard",icon:"🏠",label:"Dashboard"}]},
  {section:"ALUNOS",items:[{id:"acompanhamento",icon:"👁️",label:"Acompanhamento"},{id:"prescrever",icon:"📋",label:"Prescrever Treino"}]},
];
const NAV_NUTRI=[
  {section:"VISÃO GERAL",items:[{id:"dashboard",icon:"🏠",label:"Dashboard"}]},
  {section:"PACIENTES",items:[{id:"acompanhamento",icon:"👁️",label:"Acompanhamento"},{id:"plano",icon:"🥗",label:"Plano Alimentar"}]},
];

// ============================================================
// ROLE APPS
// ============================================================
function AlunoApp({user,onLogout}){
  const [page,setPage]=useState("dashboard");
  const pages={
    dashboard:<AlunoDash user={user}/>,saude:<AlunoSaude user={user}/>,
    treinos:<AlunoTreinos user={user}/>,alimentacao:<AlunoAlimentacao user={user}/>,
    hidratacao:<AlunoHidratacao user={user}/>,competicoes:<AlunoCompeticoes user={user}/>,
    avaliacao:<AlunoAvaliacao user={user}/>,vinculo:<AlunoVinculo user={user}/>,
  };
  return<Shell user={user} onLogout={onLogout} nav={NAV_ALUNO} active={page} setActive={setPage} accent="">{pages[page]}</Shell>;
}
function TreinadorApp({user,onLogout}){
  const [page,setPage]=useState("dashboard");
  const pages={dashboard:<TreinadorDash user={user}/>,prescrever:<TreinadorPrescrever user={user}/>,acompanhamento:<TreinadorAcompanhamento user={user}/>};
  return<Shell user={user} onLogout={onLogout} nav={NAV_TREINADOR} active={page} setActive={setPage} accent="orange">{pages[page]}</Shell>;
}
function NutriApp({user,onLogout}){
  const [page,setPage]=useState("dashboard");
  const pages={dashboard:<NutriDash user={user}/>,plano:<NutriPlano user={user}/>,acompanhamento:<NutriAcompanhamento user={user}/>};
  return<Shell user={user} onLogout={onLogout} nav={NAV_NUTRI} active={page} setActive={setPage} accent="blue">{pages[page]}</Shell>;
}

// ============================================================
// ROOT
// ============================================================
export default function TrioFit(){
  const [user,setUser]=useState(()=>DB.getSession());
  useEffect(()=>{
    [["aluno@demo.com","Ana Souza","aluno"],["treinador@demo.com","Carlos Silva","treinador"],["nutri@demo.com","Dra. Mariana Costa","nutri"]].forEach(([email,nome,role])=>{
      if(!DB.getUsers().find(u=>u.email===email))DB.register(nome,email,"123456",role);
    });
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
