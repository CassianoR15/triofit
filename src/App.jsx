import { useState, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0f0d; --bg2: #111810; --card: #151e17; --card2: #1a241c; --border: #243028;
    --green: #2ecc71; --green2: #27ae60; --green-dim: #1a4a2a;
    --orange: #f39c12; --orange2: #e67e22; --orange-dim: #4a2e0a;
    --red: #e74c3c; --red-dim: #4a1a1a; --blue: #3498db;
    --text: #e8f5e9; --text2: #8fa894; --text3: #5a7060;
    --font-display: 'Bebas Neue', sans-serif; --font-body: 'DM Sans', sans-serif;
    --font-mono: 'JetBrains Mono', monospace; --radius: 12px; --radius-lg: 20px;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }
  .app { min-height: 100vh; }
  .auth-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:2rem; background:var(--bg); position:relative; overflow:hidden; }
  .auth-wrap::before { content:''; position:absolute; width:500px; height:500px; background:radial-gradient(circle, rgba(46,204,113,0.07) 0%, transparent 70%); top:-100px; left:-100px; pointer-events:none; }
  .auth-wrap::after { content:''; position:absolute; width:400px; height:400px; background:radial-gradient(circle, rgba(243,156,18,0.05) 0%, transparent 70%); bottom:-50px; right:-50px; pointer-events:none; }
  .auth-box { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:2.5rem; width:100%; max-width:440px; position:relative; z-index:1; }
  .auth-logo { font-family:var(--font-display); font-size:3rem; letter-spacing:0.05em; background:linear-gradient(135deg, var(--green) 0%, var(--orange) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; text-align:center; margin-bottom:0.25rem; }
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
  .demo-box { margin-top:1.5rem; padding:1rem; background:var(--bg2); border-radius:var(--radius); font-size:0.78rem; color:var(--text3); }
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
  .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
  .stat-tile { background:var(--card2); border:1px solid var(--border); border-radius:var(--radius); padding:1.25rem; }
  .stat-label { font-size:0.75rem; color:var(--text3); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:0.25rem; }
  .stat-value { font-family:var(--font-display); font-size:2.2rem; letter-spacing:0.05em; line-height:1; }
  .stat-unit { font-size:0.8rem; color:var(--text2); }
  .green { color:var(--green); } .orange { color:var(--orange); } .blue { color:var(--blue); } .red { color:var(--red); }
  .prog-wrap { margin-bottom:1rem; }
  .prog-hdr { display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.85rem; }
  .prog-track { height:8px; background:var(--border); border-radius:999px; overflow:hidden; }
  .prog-fill { height:100%; border-radius:999px; transition:width 0.5s; }
  .prog-fill.green { background:linear-gradient(90deg,var(--green2),var(--green)); }
  .prog-fill.blue { background:linear-gradient(90deg,#2980b9,var(--blue)); }
  .form-group { margin-bottom:1rem; }
  .form-label { display:block; font-size:0.8rem; color:var(--text2); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:0.4rem; }
  .form-input, .form-select, .form-textarea { width:100%; background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); color:var(--text); font-family:var(--font-body); font-size:0.95rem; padding:0.75rem 1rem; outline:none; transition:border-color 0.2s; }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color:var(--green); }
  .form-textarea { resize:vertical; min-height:80px; }
  .form-select option { background:var(--card); }
  .btn { display:inline-flex; align-items:center; gap:0.5rem; padding:0.75rem 1.5rem; border-radius:var(--radius); font-family:var(--font-body); font-size:0.9rem; font-weight:600; cursor:pointer; border:none; transition:all 0.2s; }
  .btn-primary { background:var(--green); color:#0a0f0d; }
  .btn-primary:hover { background:var(--green2); transform:translateY(-1px); }
  .btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
  .btn-orange { background:var(--orange); color:#0a0f0d; }
  .btn-blue { background:var(--blue); color:#fff; }
  .btn-ghost { background:transparent; color:var(--text2); border:1px solid var(--border); }
  .btn-ghost:hover { border-color:var(--text2); color:var(--text); }
  .btn-sm { padding:0.5rem 1rem; font-size:0.8rem; }
  .btn-full { width:100%; justify-content:center; }
  .alert { padding:0.85rem 1rem; border-radius:var(--radius); font-size:0.85rem; margin-bottom:1rem; }
  .alert-success { background:var(--green-dim); color:var(--green); border:1px solid rgba(46,204,113,0.3); }
  .alert-warn { background:var(--orange-dim); color:var(--orange); border:1px solid rgba(243,156,18,0.3); }
  .alert-info { background:rgba(52,152,219,0.1); color:var(--blue); border:1px solid rgba(52,152,219,0.3); }
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
  .tag-orange { background:var(--orange-dim); color:var(--orange); }
  .stars { display:flex; gap:0.25rem; }
  .toggle-wrap { display:flex; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap; }
  .toggle-btn { padding:0.5rem 1rem; border-radius:999px; font-size:0.85rem; font-weight:600; cursor:pointer; border:1px solid var(--border); background:transparent; color:var(--text2); transition:all 0.2s; }
  .toggle-btn.active-blue { background:rgba(52,152,219,0.15); border-color:var(--blue); color:var(--blue); }
  .spinner { width:20px; height:20px; border:2px solid var(--border); border-top-color:var(--green); border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @media(max-width:768px) { .sidebar{display:none;} .grid-2,.grid-4{grid-template-columns:1fr 1fr;} .pain-grid{grid-template-columns:repeat(3,1fr);} }
`;

// HELPERS
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "BOM DIA";
  if (h < 18) return "BOA TARDE";
  return "BOA NOITE";
}
function getDateStr() {
  return new Date().toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long", year:"numeric" }).replace(/^\w/, c => c.toUpperCase());
}
function firstName(name) { return name ? name.trim().split(" ")[0].toUpperCase() : ""; }

// LOCAL DB
const DB = {
  getUsers: () => JSON.parse(localStorage.getItem("tf_users") || "[]"),
  saveUsers: (u) => localStorage.setItem("tf_users", JSON.stringify(u)),
  getSession: () => JSON.parse(localStorage.getItem("tf_session") || "null"),
  saveSession: (u) => localStorage.setItem("tf_session", JSON.stringify(u)),
  clearSession: () => localStorage.removeItem("tf_session"),
  register(nome, email, senha, role) {
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return { ok:false, msg:"Email já cadastrado." };
    const user = { id:Date.now(), nome, email:email.toLowerCase(), senha, role };
    users.push(user); this.saveUsers(users);
    return { ok:true, user };
  },
  login(email, senha) {
    const user = this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha);
    if (!user) return { ok:false, msg:"Email ou senha incorretos." };
    return { ok:true, user };
  },
  getData: (key, uid) => JSON.parse(localStorage.getItem(`tf_${key}_${uid}`) || "null"),
  setData: (key, uid, val) => localStorage.setItem(`tf_${key}_${uid}`, JSON.stringify(val)),
};

const MUSCLES = ["Ombro D","Ombro E","Bíceps D","Bíceps E","Tríceps D","Tríceps E","Peitoral","Costas","Lombar","Abdômen","Glúteo","Quadríceps D","Quadríceps E","Panturrilha D","Panturrilha E","Isquio"];
const TREINO = [
  { nome:"Supino Reto", series:4, reps:"8-10", carga:"80kg" },
  { nome:"Crucifixo", series:3, reps:"12", carga:"14kg" },
  { nome:"Tríceps Pulley", series:3, reps:"12-15", carga:"25kg" },
  { nome:"Mergulho", series:3, reps:"Falha", carga:"Corporal" },
];
const NUTRI_PLANO = [
  { h:"07:00", r:"Café da manhã", i:"3 ovos + pão integral + banana + café", k:480 },
  { h:"10:00", r:"Lanche manhã", i:"Iogurte grego + castanhas", k:280 },
  { h:"12:30", r:"Almoço", i:"Frango grelhado + arroz integral + salada", k:580 },
  { h:"16:00", r:"Pré-treino", i:"Batata doce + whey", k:320 },
  { h:"19:00", r:"Pós-treino", i:"Tilápia + arroz + brócolis", k:450 },
  { h:"21:30", r:"Ceia", i:"Cottage + pasta de amendoim", k:220 },
];

// AUTH
function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("aluno");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleLogin(e) {
    e.preventDefault(); setError(""); setLoading(true);
    setTimeout(() => {
      const res = DB.login(email, senha);
      setLoading(false);
      if (!res.ok) { setError(res.msg); return; }
      DB.saveSession(res.user); onLogin(res.user);
    }, 600);
  }

  function handleRegister(e) {
    e.preventDefault(); setError(""); setSuccess("");
    if (!nome.trim()) { setError("Informe seu nome completo."); return; }
    if (senha.length < 6) { setError("Senha deve ter ao menos 6 caracteres."); return; }
    if (senha !== confirma) { setError("Senhas não conferem."); return; }
    setLoading(true);
    setTimeout(() => {
      const res = DB.register(nome.trim(), email, senha, role);
      setLoading(false);
      if (!res.ok) { setError(res.msg); return; }
      setSuccess("Conta criada! Faça login agora."); setTab("login");
      setNome(""); setSenha(""); setConfirma("");
    }, 600);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">TrioFit</div>
        <div className="auth-subtitle">Aluno • Treinador • Nutricionista</div>
        <div className="auth-tabs">
          <div className={`auth-tab ${tab==="login"?"active":""}`} onClick={()=>{setTab("login");setError("");setSuccess("");}}>Entrar</div>
          <div className={`auth-tab ${tab==="register"?"active":""}`} onClick={()=>{setTab("register");setError("");setSuccess("");}}>Criar conta</div>
        </div>
        {error && <div className="auth-error">⚠️ {error}</div>}
        {success && <div className="auth-success">✅ {success}</div>}
        {tab === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Senha</label><input className="form-input" type="password" placeholder="••••••••" value={senha} onChange={e=>setSenha(e.target.value)} required /></div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>{loading ? <span className="spinner"/> : "Entrar"}</button>
          </form>
        ) : (
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
            <div className="form-group"><label className="form-label">Nome completo</label><input className="form-input" type="text" placeholder="Seu nome" value={nome} onChange={e=>setNome(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Senha</label><input className="form-input" type="password" placeholder="Mínimo 6 caracteres" value={senha} onChange={e=>setSenha(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Confirmar senha</label><input className="form-input" type="password" placeholder="Repita a senha" value={confirma} onChange={e=>setConfirma(e.target.value)} required /></div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>{loading ? <span className="spinner"/> : "Criar conta grátis"}</button>
          </form>
        )}
        <div className="auth-switch">
          {tab==="login" ? <>Não tem conta? <span onClick={()=>{setTab("register");setError("");}}>Cadastre-se grátis</span></> : <>Já tem conta? <span onClick={()=>{setTab("login");setError("");}}>Entrar</span></>}
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

// SHELL
function Shell({ user, onLogout, nav, active, setActive, accent, children }) {
  return (
    <div className="shell">
      <div className="sidebar">
        <div className="sidebar-logo">TrioFit</div>
        <div className="sidebar-name">{user.nome}</div>
        <div className="sidebar-role">{user.role==="nutri"?"Nutricionista":user.role.charAt(0).toUpperCase()+user.role.slice(1)}</div>
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

// ALUNO PAGES
function AlunoDash({ user }) {
  const peso = DB.getData("peso", user.id) || 0;
  const agua = DB.getData("agua_hoje", user.id) || 0;
  const meta = DB.getData("meta_agua", user.id) || 3000;
  const pct = Math.min((agua/meta)*100,100);
  return (
    <div className="page">
      <div className="page-title green">{getGreeting()}, {firstName(user.nome)} 👋</div>
      <div className="page-sub">{getDateStr()}</div>
      <div className="grid-4">
        <div className="stat-tile"><div className="stat-label">Peso atual</div><div className="stat-value green">{peso||"—"}<span className="stat-unit">{peso?"kg":""}</span></div></div>
        <div className="stat-tile"><div className="stat-label">Água hoje</div><div className="stat-value blue">{(agua/1000).toFixed(1)}<span className="stat-unit">L</span></div></div>
        <div className="stat-tile"><div className="stat-label">Meta água</div><div className="stat-value orange">{(meta/1000).toFixed(1)}<span className="stat-unit">L</span></div></div>
        <div className="stat-tile"><div className="stat-label">Perfil</div><div className="stat-value" style={{fontSize:"1rem",color:"var(--green)",paddingTop:"0.5rem"}}>✅ Ativo</div></div>
      </div>
      <div className="card">
        <div className="card-title">💧 HIDRATAÇÃO DE HOJE</div>
        <div className="prog-wrap">
          <div className="prog-hdr"><span>Progresso</span><span className="blue">{agua}ml / {meta}ml</span></div>
          <div className="prog-track"><div className="prog-fill blue" style={{width:`${pct}%`}}/></div>
        </div>
        <div style={{fontSize:"0.85rem",color:pct>=100?"var(--green)":"var(--text2)"}}>
          {pct>=100?"🎉 Meta atingida!": `Faltam ${((meta-agua)/1000).toFixed(1)}L para a meta`}
        </div>
      </div>
      <div className="card">
        <div className="card-title">📋 TREINO PRESCRITO HOJE</div>
        {TREINO.map((ex,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"0.65rem 0",borderBottom:i<TREINO.length-1?"1px solid var(--border)":"none",fontSize:"0.9rem"}}>
            <span style={{fontWeight:600}}>{ex.nome}</span>
            <span style={{color:"var(--text2)"}}>{ex.series}x {ex.reps} • {ex.carga}</span>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">🥗 PLANO ALIMENTAR — HOJE</div>
        {NUTRI_PLANO.slice(0,3).map((r,i)=>(
          <div key={i} className="meal-item">
            <div><div style={{fontWeight:600,fontSize:"0.9rem"}}>{r.r}</div><div style={{fontSize:"0.78rem",color:"var(--text2)"}}>{r.i}</div></div>
            <div style={{textAlign:"right",flexShrink:0}}><div className="meal-time">{r.h}</div><div style={{fontSize:"0.75rem",color:"var(--green)"}}>{r.k}kcal</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlunoSaude({ user }) {
  const saved = DB.getData("saude", user.id) || {};
  const [doente, setDoente] = useState(saved.doente||false);
  const [sintomas, setSintomas] = useState(saved.sintomas||"");
  const [mens, setMens] = useState(saved.mens||false);
  const [meds, setMeds] = useState(saved.meds||"");
  const [dores, setDores] = useState(saved.dores||[]);
  const [obs, setObs] = useState(saved.obs||"");
  const [ok, setOk] = useState(false);
  function toggleDor(m) { setDores(prev=>prev.includes(m)?prev.filter(x=>x!==m):[...prev,m]); }
  function salvar() { DB.setData("saude",user.id,{doente,sintomas,mens,meds,dores,obs}); setOk(true); setTimeout(()=>setOk(false),3000); }
  return (
    <div className="page">
      <div className="page-title green">SAÚDE</div>
      <div className="page-sub">Registro semanal de saúde e bem-estar</div>
      {ok && <div className="alert alert-success">✅ Salvo com sucesso!</div>}
      <div className="card">
        <div className="card-title">🤒 STATUS DA SEMANA</div>
        <div className="check-item" onClick={()=>setDoente(!doente)}><div className={`check-box ${doente?"checked":""}`}>{doente&&"✓"}</div><span>Estou doente esta semana</span></div>
        {doente && <div className="form-group" style={{paddingLeft:"2rem",marginTop:"0.5rem"}}><label className="form-label">Sintomas</label><input className="form-input" placeholder="Ex: Gripe, febre..." value={sintomas} onChange={e=>setSintomas(e.target.value)}/></div>}
        <div className="check-item" onClick={()=>setMens(!mens)}><div className={`check-box ${mens?"checked":""}`}>{mens&&"✓"}</div><span>Semana menstrual</span></div>
      </div>
      <div className="card">
        <div className="card-title">💊 MEDICAMENTOS</div>
        <textarea className="form-textarea" placeholder="Ex: Vitamina D 2000UI, Creatina 5g..." value={meds} onChange={e=>setMeds(e.target.value)}/>
      </div>
      <div className="card">
        <div className="card-title">🔴 DORES MUSCULARES</div>
        <p style={{fontSize:"0.85rem",color:"var(--text2)",marginBottom:"1rem"}}>Selecione as regiões com dor:</p>
        <div className="pain-grid">
          {MUSCLES.map(m=><div key={m} className={`muscle-btn ${dores.includes(m)?"selected":""}`} onClick={()=>toggleDor(m)}>{m}</div>)}
        </div>
      </div>
      <div className="card">
        <div className="card-title">📝 OBSERVAÇÕES</div>
        <textarea className="form-textarea" placeholder="Observações para treinador e nutricionista..." value={obs} onChange={e=>setObs(e.target.value)}/>
      </div>
      <button className="btn btn-primary btn-full" onClick={salvar}>💾 Salvar Registro</button>
    </div>
  );
}

function AlunoTreinos({ user }) {
  const [checked, setChecked] = useState({});
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [ok, setOk] = useState(false);
  const done = Object.values(checked).filter(Boolean).length;
  function salvar() { DB.setData("treino_hoje",user.id,{checked,rating,feedback,data:new Date().toISOString()}); setOk(true); setTimeout(()=>setOk(false),3000); }
  return (
    <div className="page">
      <div className="page-title green">TREINOS</div>
      <div className="page-sub">Registre e avalie seus treinos</div>
      {ok && <div className="alert alert-success">✅ Treino registrado!</div>}
      <div className="card">
        <div className="card-title">🏋️ TREINO DE HOJE — PEITO + TRÍCEPS</div>
        <div className="prog-wrap">
          <div className="prog-hdr"><span>Progresso</span><span className="green">{done}/{TREINO.length}</span></div>
          <div className="prog-track"><div className="prog-fill green" style={{width:`${(done/TREINO.length)*100}%`}}/></div>
        </div>
        {TREINO.map((ex,i)=>(
          <div key={i} className="check-item" onClick={()=>setChecked(prev=>({...prev,[i]:!prev[i]}))}>
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

function AlunoHidratacao({ user }) {
  const [ml, setMl] = useState(()=>DB.getData("agua_hoje",user.id)||0);
  const [meta, setMeta] = useState(()=>DB.getData("meta_agua",user.id)||3000);
  const [novaMeta, setNovaMeta] = useState(meta);
  const pct = Math.min((ml/meta)*100,100);
  function add(q) { const n=Math.min(ml+q,9999); setMl(n); DB.setData("agua_hoje",user.id,n); }
  function salvarMeta() { const n=Number(novaMeta); setMeta(n); DB.setData("meta_agua",user.id,n); }
  return (
    <div className="page">
      <div className="page-title green">HIDRATAÇÃO</div>
      <div className="page-sub">{getDateStr()}</div>
      <div className="card" style={{textAlign:"center"}}>
        <div style={{fontSize:"5rem",fontFamily:"var(--font-display)",color:"var(--blue)",lineHeight:1}}>{(ml/1000).toFixed(1)}</div>
        <div style={{fontSize:"1.2rem",color:"var(--text2)",marginBottom:"1.5rem"}}>litros de {(meta/1000).toFixed(1)}L</div>
        <div className="prog-track" style={{height:"14px",marginBottom:"1.5rem"}}>
          <div className="prog-fill blue" style={{width:`${pct}%`}}/>
        </div>
        <div style={{color:pct>=100?"var(--green)":"var(--text2)",fontWeight:600,marginBottom:"1rem"}}>
          {pct>=100?"🎉 Meta atingida!":`Faltam ${((meta-ml)/1000).toFixed(1)}L`}
        </div>
        <div className="quick-btns" style={{justifyContent:"center"}}>
          {[150,200,300,500,750,1000].map(q=>(
            <div key={q} className="quick-btn" onClick={()=>add(q)}>
              <div className="quick-btn-icon">💧</div>+{q>=1000?"1L":`${q}ml`}
            </div>
          ))}
        </div>
        {ml>0 && <button className="btn btn-ghost" style={{marginTop:"1rem"}} onClick={()=>{setMl(0);DB.setData("agua_hoje",user.id,0);}}>Zerar</button>}
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

function AlunoAlimentacao({ user }) {
  const [regs, setRegs] = useState(()=>DB.getData("alimentacao",user.id)||[]);
  const [hora, setHora] = useState("12:00");
  const [desc, setDesc] = useState("");
  const [kcal, setKcal] = useState("");
  const total = regs.reduce((s,r)=>s+r.kcal,0);
  function add() {
    if (!desc.trim()) return;
    const novo = [...regs,{hora,desc,kcal:Number(kcal)||0}];
    setRegs(novo); DB.setData("alimentacao",user.id,novo);
    setDesc(""); setKcal("");
  }
  return (
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
        {regs.length===0 && <div style={{color:"var(--text3)",fontSize:"0.85rem",marginBottom:"1rem"}}>Nenhuma refeição registrada ainda.</div>}
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

function AlunoAvaliacao({ user }) {
  const saved = DB.getData("avaliacao",user.id)||{};
  const [f, setF] = useState(saved);
  const [ok, setOk] = useState(false);
  function set(k,v) { setF(prev=>({...prev,[k]:v})); }
  function salvar() { DB.setData("avaliacao",user.id,f); setOk(true); setTimeout(()=>setOk(false),3000); }
  return (
    <div className="page">
      <div className="page-title green">AVALIAÇÃO FÍSICA</div>
      <div className="page-sub">Registre suas medidas e evolução</div>
      {ok && <div className="alert alert-success">✅ Avaliação salva!</div>}
      <div className="card">
        <div className="card-title">📏 MEDIDAS CORPORAIS</div>
        <div className="grid-2">
          {[["peso","Peso","kg"],["gordura","% Gordura","%"],["cintura","Cintura","cm"],["quadril","Quadril","cm"],["braco_d","Braço D","cm"],["braco_e","Braço E","cm"],["perna_d","Perna D","cm"],["perna_e","Perna E","cm"]].map(([k,l,u])=>(
            <div key={k} className="form-group">
              <label className="form-label">{l}</label>
              <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
                <input className="form-input" type="number" placeholder="0" value={f[k]||""} onChange={e=>set(k,e.target.value)}/>
                <span style={{color:"var(--text2)",fontSize:"0.85rem",flexShrink:0}}>{u}</span>
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

function AlunoCompeticoes({ user }) {
  const [comps, setComps] = useState(()=>DB.getData("competicoes",user.id)||[]);
  const [f, setF] = useState({nome:"",modalidade:"Corrida",data:"",local:"",objetivo:"Completar"});
  const [ok, setOk] = useState(false);
  function set(k,v) { setF(prev=>({...prev,[k]:v})); }
  function add() {
    if (!f.nome||!f.data) return;
    const novo=[...comps,{...f,id:Date.now()}];
    setComps(novo); DB.setData("competicoes",user.id,novo);
    setF({nome:"",modalidade:"Corrida",data:"",local:"",objetivo:"Completar"});
    setOk(true); setTimeout(()=>setOk(false),3000);
  }
  return (
    <div className="page">
      <div className="page-title green">COMPETIÇÕES</div>
      <div className="page-sub">Seus eventos e provas</div>
      {ok && <div className="alert alert-success">✅ Competição cadastrada!</div>}
      {comps.length>0 && (
        <div className="card">
          <div className="card-title">📅 MEUS EVENTOS</div>
          {comps.map((c,i)=>{
            const d=new Date(c.data);
            return (
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

// TREINADOR
function TreinadorDash({ user }) {
  return (
    <div className="page">
      <div className="page-title orange">{getGreeting()}, {firstName(user.nome)} 👋</div>
      <div className="page-sub">{getDateStr()}</div>
      <div className="card">
        <div className="card-title">👥 SEUS ALUNOS</div>
        <div style={{color:"var(--text2)",fontSize:"0.9rem",padding:"1rem 0"}}>Em breve: vincule alunos, veja diários, prescreva treinos e acompanhe o progresso em tempo real.</div>
        <button className="btn btn-orange">+ Convidar aluno</button>
      </div>
    </div>
  );
}

function TreinadorPrescrever({ user }) {
  const [nomeT, setNomeT] = useState("Peito + Tríceps");
  const [ok, setOk] = useState(false);
  function salvar() { DB.setData("treino_prescrito",user.id,{nome:nomeT,exercicios:TREINO,data:new Date().toISOString()}); setOk(true); setTimeout(()=>setOk(false),3000); }
  return (
    <div className="page">
      <div className="page-title orange">PRESCREVER TREINO</div>
      <div className="page-sub">Monte o plano de treino</div>
      {ok && <div className="alert alert-success">✅ Treino salvo!</div>}
      <div className="card">
        <div className="card-title">🏋️ EXERCÍCIOS</div>
        <div className="form-group"><label className="form-label">Nome do treino</label><input className="form-input" value={nomeT} onChange={e=>setNomeT(e.target.value)}/></div>
        {TREINO.map((ex,i)=>(
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

// NUTRI
function NutriDash({ user }) {
  return (
    <div className="page">
      <div className="page-title blue">{getGreeting()}, {firstName(user.nome)} 👋</div>
      <div className="page-sub">{getDateStr()}</div>
      <div className="card">
        <div className="card-title">👥 SEUS PACIENTES</div>
        <div style={{color:"var(--text2)",fontSize:"0.9rem",padding:"1rem 0"}}>Em breve: vincule pacientes, monte planos alimentares, ajuste protocolos por competição e acompanhe a aderência.</div>
        <button className="btn btn-blue">+ Convidar paciente</button>
      </div>
    </div>
  );
}

function NutriPlano({ user }) {
  const [fase, setFase] = useState("normal");
  const [ok, setOk] = useState(false);
  const fases = { normal:2330, carga:3100, cutting:1800, peak:2000 };
  function salvar() { DB.setData("plano_nutri",user.id,{fase,kcal:fases[fase]}); setOk(true); setTimeout(()=>setOk(false),3000); }
  return (
    <div className="page">
      <div className="page-title blue">PLANO ALIMENTAR</div>
      <div className="page-sub">Configure o protocolo nutricional</div>
      {ok && <div className="alert alert-success">✅ Plano salvo!</div>}
      <div className="card">
        <div className="card-title">🎯 PROTOCOLO</div>
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
        <div className="card-title">🥗 REFEIÇÕES</div>
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

// NAV CONFIGS
const NAV_ALUNO = [
  {section:"VISÃO GERAL",items:[{id:"dashboard",icon:"🏠",label:"Dashboard"}]},
  {section:"DIÁRIO",items:[{id:"treinos",icon:"🏋️",label:"Treinos"},{id:"alimentacao",icon:"🥗",label:"Alimentação"},{id:"hidratacao",icon:"💧",label:"Hidratação"},{id:"saude",icon:"❤️",label:"Saúde"}]},
  {section:"PROGRESSO",items:[{id:"avaliacao",icon:"📊",label:"Avaliação Física"},{id:"competicoes",icon:"🏆",label:"Competições"}]},
];
const NAV_TREINADOR = [
  {section:"VISÃO GERAL",items:[{id:"dashboard",icon:"🏠",label:"Dashboard"}]},
  {section:"GESTÃO",items:[{id:"prescrever",icon:"📋",label:"Prescrever Treino"}]},
];
const NAV_NUTRI = [
  {section:"VISÃO GERAL",items:[{id:"dashboard",icon:"🏠",label:"Dashboard"}]},
  {section:"NUTRIÇÃO",items:[{id:"plano",icon:"🥗",label:"Plano Alimentar"}]},
];

function AlunoApp({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const pages = { dashboard:<AlunoDash user={user}/>, saude:<AlunoSaude user={user}/>, treinos:<AlunoTreinos user={user}/>, alimentacao:<AlunoAlimentacao user={user}/>, hidratacao:<AlunoHidratacao user={user}/>, competicoes:<AlunoCompeticoes user={user}/>, avaliacao:<AlunoAvaliacao user={user}/> };
  return <Shell user={user} onLogout={onLogout} nav={NAV_ALUNO} active={page} setActive={setPage} accent="">{pages[page]}</Shell>;
}
function TreinadorApp({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const pages = { dashboard:<TreinadorDash user={user}/>, prescrever:<TreinadorPrescrever user={user}/> };
  return <Shell user={user} onLogout={onLogout} nav={NAV_TREINADOR} active={page} setActive={setPage} accent="orange">{pages[page]}</Shell>;
}
function NutriApp({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const pages = { dashboard:<NutriDash user={user}/>, plano:<NutriPlano user={user}/> };
  return <Shell user={user} onLogout={onLogout} nav={NAV_NUTRI} active={page} setActive={setPage} accent="blue">{pages[page]}</Shell>;
}

export default function TrioFit() {
  const [user, setUser] = useState(()=>DB.getSession());

  useEffect(()=>{
    const users = DB.getUsers();
    [["aluno@demo.com","Ana Souza","aluno"],["treinador@demo.com","Carlos Silva","treinador"],["nutri@demo.com","Dra. Mariana Costa","nutri"]].forEach(([email,nome,role])=>{
      if (!users.find(u=>u.email===email)) DB.register(nome,email,"123456",role);
    });
  },[]);

  function handleLogin(u) { setUser(u); }
  function handleLogout() { DB.clearSession(); setUser(null); }

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {!user && <AuthScreen onLogin={handleLogin}/>}
        {user?.role==="aluno" && <AlunoApp user={user} onLogout={handleLogout}/>}
        {user?.role==="treinador" && <TreinadorApp user={user} onLogout={handleLogout}/>}
        {user?.role==="nutri" && <NutriApp user={user} onLogout={handleLogout}/>}
      </div>
    </>
  );
}
