import { useState } from "react";

// ============================================================
// DESIGN SYSTEM
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0f0d;
    --bg2: #111810;
    --card: #151e17;
    --card2: #1a241c;
    --border: #243028;
    --green: #2ecc71;
    --green2: #27ae60;
    --green-dim: #1a4a2a;
    --orange: #f39c12;
    --orange2: #e67e22;
    --orange-dim: #4a2e0a;
    --red: #e74c3c;
    --red-dim: #4a1a1a;
    --blue: #3498db;
    --text: #e8f5e9;
    --text2: #8fa894;
    --text3: #5a7060;
    --font-display: 'Bebas Neue', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --radius: 12px;
    --radius-lg: 20px;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* LANDING */
  .landing {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }
  .landing::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(46,204,113,0.08) 0%, transparent 70%);
    top: -100px; left: -100px;
    pointer-events: none;
  }
  .landing::after {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(243,156,18,0.06) 0%, transparent 70%);
    bottom: -50px; right: -50px;
    pointer-events: none;
  }
  .landing-logo {
    font-family: var(--font-display);
    font-size: clamp(4rem, 12vw, 8rem);
    letter-spacing: 0.05em;
    background: linear-gradient(135deg, var(--green) 0%, var(--orange) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
    margin-bottom: 0.25rem;
  }
  .landing-tagline {
    font-size: 1rem;
    color: var(--text2);
    letter-spacing: 0.3em;
    text-transform: uppercase;
    margin-bottom: 3rem;
    font-weight: 500;
  }
  .landing-cards {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    max-width: 900px;
    margin-bottom: 3rem;
  }
  .role-card {
    flex: 1; min-width: 220px; max-width: 280px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 2rem 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .role-card::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .role-card.aluno::before { background: linear-gradient(135deg, rgba(46,204,113,0.08), transparent); }
  .role-card.treinador::before { background: linear-gradient(135deg, rgba(243,156,18,0.08), transparent); }
  .role-card.nutri::before { background: linear-gradient(135deg, rgba(52,152,219,0.08), transparent); }
  .role-card:hover { transform: translateY(-4px); border-color: var(--green); }
  .role-card:hover::before { opacity: 1; }
  .role-card.aluno:hover { border-color: var(--green); }
  .role-card.treinador:hover { border-color: var(--orange); }
  .role-card.nutri:hover { border-color: var(--blue); }
  .role-icon { font-size: 3rem; margin-bottom: 1rem; }
  .role-title { font-family: var(--font-display); font-size: 1.8rem; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
  .role-card.aluno .role-title { color: var(--green); }
  .role-card.treinador .role-title { color: var(--orange); }
  .role-card.nutri .role-title { color: var(--blue); }
  .role-desc { font-size: 0.85rem; color: var(--text2); line-height: 1.5; }

  /* SHELL */
  .shell { display: flex; min-height: 100vh; }
  .sidebar {
    width: 240px; min-height: 100vh;
    background: var(--card);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    padding: 1.5rem 1rem;
    position: sticky; top: 0; height: 100vh;
    overflow-y: auto;
  }
  .sidebar-logo {
    font-family: var(--font-display);
    font-size: 2rem;
    letter-spacing: 0.05em;
    background: linear-gradient(135deg, var(--green) 0%, var(--orange) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.25rem;
    padding: 0 0.5rem;
  }
  .sidebar-role {
    font-size: 0.7rem;
    color: var(--text3);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 0 0.5rem;
    margin-bottom: 2rem;
  }
  .nav-section { margin-bottom: 1.5rem; }
  .nav-label {
    font-size: 0.65rem;
    color: var(--text3);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 0 0.5rem;
    margin-bottom: 0.5rem;
  }
  .nav-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.65rem 0.75rem;
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    color: var(--text2);
    border: 1px solid transparent;
    margin-bottom: 2px;
  }
  .nav-item:hover { background: var(--bg2); color: var(--text); }
  .nav-item.active { background: var(--green-dim); color: var(--green); border-color: rgba(46,204,113,0.2); }
  .nav-item.active.orange { background: var(--orange-dim); color: var(--orange); border-color: rgba(243,156,18,0.2); }
  .nav-item.active.blue { background: rgba(52,152,219,0.1); color: var(--blue); border-color: rgba(52,152,219,0.2); }
  .nav-icon { font-size: 1.1rem; width: 20px; text-align: center; }
  .sidebar-footer { margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border); }
  .back-btn {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.8rem; color: var(--text3);
    cursor: pointer; padding: 0.5rem;
    border-radius: var(--radius);
    transition: color 0.2s;
  }
  .back-btn:hover { color: var(--text); }

  /* MAIN */
  .main { flex: 1; overflow-y: auto; background: var(--bg); }
  .page { padding: 2rem; max-width: 1000px; }
  .page-header { margin-bottom: 2rem; }
  .page-title { font-family: var(--font-display); font-size: 2.5rem; letter-spacing: 0.05em; line-height: 1; }
  .page-sub { color: var(--text2); font-size: 0.9rem; margin-top: 0.25rem; }

  /* CARDS */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .card-title {
    font-family: var(--font-display);
    font-size: 1.3rem;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
    color: var(--text);
  }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }

  /* STAT TILES */
  .stat-tile {
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.25rem;
    display: flex; flex-direction: column; gap: 0.25rem;
  }
  .stat-label { font-size: 0.75rem; color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase; }
  .stat-value { font-family: var(--font-display); font-size: 2.2rem; letter-spacing: 0.05em; line-height: 1; }
  .stat-unit { font-size: 0.8rem; color: var(--text2); }
  .green { color: var(--green); }
  .orange { color: var(--orange); }
  .blue { color: var(--blue); }
  .red { color: var(--red); }

  /* PROGRESS BAR */
  .progress-wrap { margin-bottom: 1rem; }
  .progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-size: 0.85rem; }
  .progress-track { height: 8px; background: var(--border); border-radius: 999px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }
  .progress-fill.green { background: linear-gradient(90deg, var(--green2), var(--green)); }
  .progress-fill.orange { background: linear-gradient(90deg, var(--orange2), var(--orange)); }
  .progress-fill.blue { background: linear-gradient(90deg, #2980b9, var(--blue)); }

  /* FORM */
  .form-group { margin-bottom: 1rem; }
  .form-label { display: block; font-size: 0.8rem; color: var(--text2); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.4rem; }
  .form-input, .form-select, .form-textarea {
    width: 100%;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.95rem;
    padding: 0.75rem 1rem;
    outline: none;
    transition: border-color 0.2s;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--green); }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-select option { background: var(--card); }

  /* BUTTONS */
  .btn {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius);
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    letter-spacing: 0.02em;
  }
  .btn-primary { background: var(--green); color: #0a0f0d; }
  .btn-primary:hover { background: var(--green2); transform: translateY(-1px); }
  .btn-orange { background: var(--orange); color: #0a0f0d; }
  .btn-orange:hover { background: var(--orange2); }
  .btn-blue { background: var(--blue); color: #fff; }
  .btn-blue:hover { background: #2980b9; }
  .btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--text2); color: var(--text); }
  .btn-sm { padding: 0.5rem 1rem; font-size: 0.8rem; }
  .btn-full { width: 100%; justify-content: center; }

  /* QUICK ACTIONS */
  .quick-btns { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; }
  .quick-btn {
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.75rem 1rem;
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--text2);
    transition: all 0.2s;
    display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
    min-width: 80px;
  }
  .quick-btn:hover { border-color: var(--green); color: var(--green); }
  .quick-btn-icon { font-size: 1.5rem; }

  /* TAGS */
  .tag {
    display: inline-flex; align-items: center; gap: 0.3rem;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }
  .tag-green { background: var(--green-dim); color: var(--green); }
  .tag-orange { background: var(--orange-dim); color: var(--orange); }
  .tag-red { background: var(--red-dim); color: var(--red); }
  .tag-blue { background: rgba(52,152,219,0.15); color: var(--blue); }

  /* LIST */
  .list-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.85rem 0;
    border-bottom: 1px solid var(--border);
    font-size: 0.9rem;
  }
  .list-item:last-child { border-bottom: none; }
  .list-left { display: flex; align-items: center; gap: 0.75rem; }
  .list-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); flex-shrink: 0; }
  .list-dot.orange { background: var(--orange); }
  .list-dot.blue { background: var(--blue); }
  .list-dot.red { background: var(--red); }

  /* CHECKBOX */
  .check-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem;
    border-radius: var(--radius);
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.9rem;
  }
  .check-item:hover { background: var(--card2); }
  .check-box {
    width: 20px; height: 20px;
    border: 2px solid var(--border);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s;
  }
  .check-box.checked { background: var(--green); border-color: var(--green); }

  /* ALERT */
  .alert {
    padding: 0.85rem 1rem;
    border-radius: var(--radius);
    font-size: 0.85rem;
    margin-bottom: 1rem;
    display: flex; align-items: flex-start; gap: 0.5rem;
  }
  .alert-warn { background: var(--orange-dim); color: var(--orange); border: 1px solid rgba(243,156,18,0.3); }
  .alert-info { background: rgba(52,152,219,0.1); color: var(--blue); border: 1px solid rgba(52,152,219,0.3); }
  .alert-danger { background: var(--red-dim); color: var(--red); border: 1px solid rgba(231,76,60,0.3); }
  .alert-success { background: var(--green-dim); color: var(--green); border: 1px solid rgba(46,204,113,0.3); }

  /* BADGE */
  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 20px; height: 20px;
    background: var(--red);
    color: #fff;
    border-radius: 50%;
    font-size: 0.65rem;
    font-weight: 700;
  }

  /* COMPETITION CARD */
  .comp-card {
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
    margin-bottom: 0.75rem;
    display: flex; align-items: center; gap: 1rem;
  }
  .comp-date {
    text-align: center;
    min-width: 50px;
    font-family: var(--font-display);
    line-height: 1.1;
  }
  .comp-date-day { font-size: 1.8rem; color: var(--orange); }
  .comp-date-month { font-size: 0.7rem; color: var(--text3); text-transform: uppercase; }
  .comp-info { flex: 1; }
  .comp-name { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.2rem; }
  .comp-meta { font-size: 0.8rem; color: var(--text2); }

  /* ALUNO TABLE */
  .aluno-row {
    display: flex; align-items: center; gap: 1rem;
    padding: 0.85rem;
    border-radius: var(--radius);
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid var(--border);
  }
  .aluno-row:hover { background: var(--card2); }
  .aluno-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .aluno-info { flex: 1; }
  .aluno-name { font-weight: 600; font-size: 0.95rem; }
  .aluno-meta { font-size: 0.78rem; color: var(--text2); margin-top: 0.1rem; }

  /* WEEK GRID */
  .week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; }
  .week-day {
    text-align: center;
    padding: 0.75rem 0.25rem;
    border-radius: var(--radius);
    background: var(--card2);
    border: 1px solid var(--border);
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  .week-day.done { background: var(--green-dim); border-color: var(--green); color: var(--green); }
  .week-day.today { border-color: var(--orange); color: var(--orange); }
  .week-day-name { font-size: 0.65rem; color: var(--text3); text-transform: uppercase; margin-bottom: 0.25rem; }
  .week-day-num { font-family: var(--font-display); font-size: 1.2rem; }

  /* CHARTS (CSS only) */
  .bar-chart { display: flex; align-items: flex-end; gap: 0.5rem; height: 120px; padding: 0 0 0.5rem; }
  .bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; height: 100%; justify-content: flex-end; }
  .bar { width: 100%; border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.5s; }
  .bar-label { font-size: 0.65rem; color: var(--text3); }

  /* RATING STARS */
  .stars { display: flex; gap: 0.25rem; }
  .star { font-size: 1.1rem; cursor: pointer; transition: transform 0.1s; }
  .star:hover { transform: scale(1.2); }

  /* TOGGLE */
  .toggle-wrap { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .toggle-btn {
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text2);
    transition: all 0.2s;
  }
  .toggle-btn.active-green { background: var(--green-dim); border-color: var(--green); color: var(--green); }
  .toggle-btn.active-orange { background: var(--orange-dim); border-color: var(--orange); color: var(--orange); }
  .toggle-btn.active-blue { background: rgba(52,152,219,0.15); border-color: var(--blue); color: var(--blue); }

  /* MEAL ITEM */
  .meal-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem;
    background: var(--card2);
    border-radius: var(--radius);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  .meal-time { font-family: var(--font-mono); font-size: 0.75rem; color: var(--text3); }

  /* EXERCISE ROW */
  .ex-row {
    display: grid; grid-template-columns: 1fr auto auto auto auto;
    align-items: center; gap: 1rem;
    padding: 0.75rem;
    background: var(--card2);
    border-radius: var(--radius);
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
  }
  .ex-name { font-weight: 600; }
  .ex-detail { color: var(--text2); text-align: center; }
  .ex-detail span { display: block; font-size: 0.65rem; color: var(--text3); }

  /* PAIN MAP */
  .pain-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
  .muscle-btn {
    padding: 0.5rem;
    border-radius: var(--radius);
    background: var(--card2);
    border: 1px solid var(--border);
    font-size: 0.75rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text2);
  }
  .muscle-btn.selected { background: var(--red-dim); border-color: var(--red); color: var(--red); }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr 1fr; }
    .ex-row { grid-template-columns: 1fr 1fr; }
    .pain-grid { grid-template-columns: repeat(3, 1fr); }
  }
`;

// ============================================================
// DATA
// ============================================================
const SPORTS = ["🏊 Natação", "🏃 Corrida", "🚶 Caminhada", "🏋️ Academia", "🥊 Luta/Artes Marciais", "🚴 Ciclismo", "⛹️ Basquete", "⚽ Futebol"];
const MUSCLES = ["Ombro D", "Ombro E", "Bíceps D", "Bíceps E", "Tríceps D", "Tríceps E", "Peitoral", "Costas", "Lombar", "Abdômen", "Glúteo", "Quadríceps D", "Quadríceps E", "Panturrilha D", "Panturrilha E", "Isquio D"];
const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const WEEK_DATES = [28, 29, 30, 1, 2, 3, 4];
const DONE_DAYS = [0, 1, 3];

const ALUNOS = [
  { id: 1, nome: "Ana Souza", esportes: "Corrida • Natação", peso: "62kg", avatar: "🟢", bg: "#1a4a2a", comp: "Ironman — 15 Jul", alertas: 1, objetivo: "Ironman 2025" },
  { id: 2, nome: "Carlos Mendes", esportes: "Academia • Luta", peso: "88kg", avatar: "🟠", bg: "#4a2e0a", comp: "BJJ — 3 Jun", alertas: 0, objetivo: "Campeonato BJJ" },
  { id: 3, nome: "Júlia Lima", esportes: "Academia", peso: "57kg", avatar: "🔵", bg: "#0a2a4a", comp: "Fisiculturismo — 20 Jun", alertas: 2, objetivo: "Subir no Palco" },
  { id: 4, nome: "Roberto Nunes", esportes: "Corrida", peso: "75kg", avatar: "🟣", bg: "#2a0a4a", comp: "Maratona — 10 Ago", alertas: 0, objetivo: "Sub 4h Maratona" },
];

const TREINOS_PRESCRITOS = [
  { grupo: "Peito + Tríceps", exercicios: [
    { nome: "Supino Reto", series: 4, reps: "8-10", carga: "80kg", desc: "Controle a descida em 3s" },
    { nome: "Crucifixo", series: 3, reps: "12", carga: "14kg", desc: "Amplitude máxima" },
    { nome: "Tríceps Pulley", series: 3, reps: "12-15", carga: "25kg", desc: "Cotovelo fixo" },
    { nome: "Mergulho", series: 3, reps: "Falha", carga: "Corporal", desc: "" },
  ]},
];

const PLANO_NUTRI = [
  { horario: "07:00", refeicao: "Café da manhã", itens: "3 ovos mexidos + 2 fatias pão integral + 1 banana + café sem açúcar", kcal: 480 },
  { horario: "10:00", refeicao: "Lanche manhã", itens: "Iogurte grego 170g + mix de castanhas 30g + mel", kcal: 280 },
  { horario: "12:30", refeicao: "Almoço", itens: "180g frango grelhado + 3 col arroz integral + salada verde à vontade + azeite", kcal: 580 },
  { horario: "16:00", refeicao: "Pré-treino", itens: "Batata doce 150g + 1 scoop whey + água", kcal: 320 },
  { horario: "19:00", refeicao: "Pós-treino", itens: "200g tilápia + 2 col arroz + brócolis no vapor", kcal: 450 },
  { horario: "21:30", refeicao: "Ceia", itens: "200g queijo cottage + 1 col pasta de amendoim", kcal: 220 },
];

const COMPETICOES = [
  { dia: "15", mes: "Jul", nome: "Ironman 70.3 Florianópolis", tipo: "🏊 Triathlon", aluno: "Ana Souza", status: "Preparação" },
  { dia: "03", mes: "Jun", nome: "Campeonato Brasileiro BJJ", tipo: "🥊 Luta", aluno: "Carlos Mendes", status: "Definição de peso" },
  { dia: "20", mes: "Jun", nome: "Arnold Classic Brasil", tipo: "🏆 Fisiculturismo", aluno: "Júlia Lima", status: "Peak Week" },
  { dia: "10", mes: "Ago", nome: "Maratona de Porto Alegre", tipo: "🏃 Corrida", aluno: "Roberto Nunes", status: "Volume" },
];

// ============================================================
// COMPONENTS
// ============================================================
function WaterProgress({ atual, meta }) {
  const pct = Math.min((atual / meta) * 100, 100);
  return (
    <div>
      <div className="progress-header">
        <span>💧 Água</span>
        <span className="green" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>{atual}ml / {meta}ml</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill blue" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function BarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-wrap">
          <div className="bar" style={{ height: `${(d.v / max) * 90}px`, background: color === "green" ? "var(--green)" : color === "orange" ? "var(--orange)" : "var(--blue)" }} />
          <div className="bar-label">{d.l}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// ALUNO PAGES
// ============================================================
function AlunoDashboard() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title green">BOM DIA, ANA 👋</div>
        <div className="page-sub">Terça-feira, 01 de Abril — Semana 14 de treino</div>
      </div>

      <div className="alert alert-warn">⚠️ Seu treinador prescreveu um novo treino para hoje — <strong>Peito + Tríceps</strong></div>

      <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-tile">
          <div className="stat-label">Peso atual</div>
          <div className="stat-value green">62<span className="stat-unit">kg</span></div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Água hoje</div>
          <div className="stat-value blue">1.8<span className="stat-unit">L</span></div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Treinos/sem</div>
          <div className="stat-value orange">4<span className="stat-unit">/5</span></div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Próx. prova</div>
          <div className="stat-value" style={{ fontSize: "1.4rem", color: "var(--text)" }}>105<span className="stat-unit"> dias</span></div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">📅 SEMANA ATUAL</div>
          <div className="week-grid">
            {DAYS.map((d, i) => (
              <div key={i} className={`week-day ${DONE_DAYS.includes(i) ? "done" : ""} ${i === 1 ? "today" : ""}`}>
                <div className="week-day-name">{d}</div>
                <div className="week-day-num">{WEEK_DATES[i]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">💧 HIDRATAÇÃO</div>
          <WaterProgress atual={1800} meta={3000} />
          <div className="quick-btns" style={{ marginTop: "1rem" }}>
            <div className="quick-btn"><div className="quick-btn-icon">🥤</div>200ml</div>
            <div className="quick-btn"><div className="quick-btn-icon">🍼</div>500ml</div>
            <div className="quick-btn"><div className="quick-btn-icon">🧴</div>1L</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📊 PESO — ÚLTIMAS 8 SEMANAS</div>
        <BarChart color="green" data={[
          { l: "S7", v: 64.2 }, { l: "S8", v: 63.8 }, { l: "S9", v: 63.5 },
          { l: "S10", v: 63.1 }, { l: "S11", v: 62.8 }, { l: "S12", v: 63.0 },
          { l: "S13", v: 62.4 }, { l: "S14", v: 62.0 },
        ]} />
      </div>

      <div className="card">
        <div className="card-title">🏆 PRÓXIMA COMPETIÇÃO</div>
        <div className="comp-card" style={{ background: "var(--bg2)" }}>
          <div className="comp-date">
            <div className="comp-date-day">15</div>
            <div className="comp-date-month">Jul</div>
          </div>
          <div className="comp-info">
            <div className="comp-name">Ironman 70.3 Florianópolis</div>
            <div className="comp-meta">🏊 Triathlon • 105 dias restantes</div>
          </div>
          <span className="tag tag-orange">PREPARAÇÃO</span>
        </div>
      </div>
    </div>
  );
}

function AlunoSaude() {
  const [doente, setDoente] = useState(false);
  const [menstruacao, setMenstruacao] = useState(false);
  const [dores, setDores] = useState([]);
  const [saved, setSaved] = useState(false);

  const toggleDor = (m) => setDores(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title green">SAÚDE</div>
        <div className="page-sub">Registro semanal de saúde e bem-estar</div>
      </div>

      {saved && <div className="alert alert-success">✅ Informações salvas com sucesso!</div>}

      <div className="card">
        <div className="card-title">🤒 STATUS DA SEMANA</div>
        <div className="check-item" onClick={() => setDoente(!doente)}>
          <div className={`check-box ${doente ? "checked" : ""}`}>{doente && "✓"}</div>
          <span>Estou doente esta semana</span>
        </div>
        {doente && (
          <div className="form-group" style={{ marginTop: "0.75rem", paddingLeft: "2rem" }}>
            <label className="form-label">Sintomas</label>
            <input className="form-input" placeholder="Ex: Gripe, febre, dor de cabeça..." />
          </div>
        )}
        <div className="check-item" onClick={() => setMenstruacao(!menstruacao)}>
          <div className={`check-box ${menstruacao ? "checked" : ""}`}>{menstruacao && "✓"}</div>
          <span>Semana menstrual</span>
        </div>
      </div>

      <div className="card">
        <div className="card-title">💊 MEDICAMENTOS</div>
        <div className="form-group">
          <label className="form-label">Medicamentos em uso</label>
          <textarea className="form-textarea" placeholder="Ex: Creatina 5g/dia, Vitamina D 2000UI, Ibuprofeno 400mg..." />
        </div>
      </div>

      <div className="card">
        <div className="card-title">🔴 DORES MUSCULARES</div>
        <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "1rem" }}>Selecione as regiões com dor:</p>
        <div className="pain-grid">
          {MUSCLES.map(m => (
            <div key={m} className={`muscle-btn ${dores.includes(m) ? "selected" : ""}`} onClick={() => toggleDor(m)}>{m}</div>
          ))}
        </div>
        {dores.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <label className="form-label">Intensidade da dor (1-10)</label>
            <input type="range" min="1" max="10" defaultValue="5" style={{ width: "100%", accentColor: "var(--red)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text3)" }}>
              <span>Leve</span><span>Moderada</span><span>Intensa</span>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">📝 OBSERVAÇÕES</div>
        <textarea className="form-textarea" placeholder="Qualquer informação adicional para seu treinador e nutricionista..." style={{ minHeight: "100px" }} />
      </div>

      <button className="btn btn-primary btn-full" onClick={() => setSaved(true)}>💾 Salvar Registro</button>
    </div>
  );
}

function AlunoTreinos() {
  const [checked, setChecked] = useState({});
  const [rating, setRating] = useState(0);
  const [saved, setSaved] = useState(false);

  const toggle = (k) => setChecked(prev => ({ ...prev, [k]: !prev[k] }));
  const done = Object.values(checked).filter(Boolean).length;
  const total = TREINOS_PRESCRITOS[0].exercicios.length;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title green">TREINOS</div>
        <div className="page-sub">Registre e avalie seus treinos</div>
      </div>

      {saved && <div className="alert alert-success">✅ Treino registrado! Seu treinador foi notificado.</div>}

      <div className="card">
        <div className="card-title">🏋️ TREINO DE HOJE — PEITO + TRÍCEPS</div>
        <div className="progress-wrap">
          <div className="progress-header">
            <span>Progresso</span>
            <span className="green">{done}/{total} exercícios</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill green" style={{ width: `${(done / total) * 100}%` }} />
          </div>
        </div>

        {TREINOS_PRESCRITOS[0].exercicios.map((ex, i) => (
          <div key={i}>
            <div className="check-item" onClick={() => toggle(i)}>
              <div className={`check-box ${checked[i] ? "checked" : ""}`}>{checked[i] && "✓"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: "0.15rem" }}>{ex.nome}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text2)" }}>{ex.series} séries × {ex.reps} reps • {ex.carga}</div>
                {ex.desc && <div style={{ fontSize: "0.75rem", color: "var(--text3)", fontStyle: "italic" }}>{ex.desc}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">⭐ AVALIAR TREINO</div>
        <div className="form-group">
          <label className="form-label">Nota geral</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="star" onClick={() => setRating(s)} style={{ color: s <= rating ? "var(--orange)" : "var(--border)", fontSize: "2rem" }}>★</div>
            ))}
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Duração</label>
            <input className="form-input" placeholder="Ex: 1h 20min" />
          </div>
          <div className="form-group">
            <label className="form-label">Intensidade percebida</label>
            <select className="form-select">
              <option>🟢 Leve</option>
              <option>🟡 Moderada</option>
              <option selected>🟠 Intensa</option>
              <option>🔴 Muito intensa</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Feedback para o treinador</label>
          <textarea className="form-textarea" placeholder="Como você se sentiu? O que foi difícil? Alguma dor durante o treino?" />
        </div>
        <button className="btn btn-primary btn-full" onClick={() => setSaved(true)}>✅ Registrar Treino</button>
      </div>

      <div className="card">
        <div className="card-title">📅 HISTÓRICO DA SEMANA</div>
        <div className="week-grid">
          {DAYS.map((d, i) => (
            <div key={i} className={`week-day ${DONE_DAYS.includes(i) ? "done" : ""} ${i === 1 ? "today" : ""}`}>
              <div className="week-day-name">{d}</div>
              <div className="week-day-num">{DONE_DAYS.includes(i) ? "✓" : WEEK_DATES[i]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlunoAlimentacao() {
  const [registros, setRegistros] = useState([
    { hora: "07:00", desc: "3 ovos mexidos + café preto", kcal: 230 },
    { hora: "10:00", desc: "Iogurte grego + banana", kcal: 210 },
  ]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title green">ALIMENTAÇÃO</div>
        <div className="page-sub">Registre o que você comeu hoje</div>
      </div>

      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-tile">
          <div className="stat-label">Kcal registradas</div>
          <div className="stat-value green">440<span className="stat-unit">kcal</span></div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Meta do dia</div>
          <div className="stat-value orange">2330<span className="stat-unit">kcal</span></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🥗 PLANO DA NUTRICIONISTA</div>
        {PLANO_NUTRI.map((r, i) => (
          <div key={i} className="meal-item">
            <div>
              <div style={{ fontWeight: 600, marginBottom: "0.15rem" }}>{r.refeicao}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text2)" }}>{r.itens}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div className="meal-time">{r.horario}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--green)" }}>{r.kcal}kcal</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">✏️ O QUE EU COMI</div>
        {registros.map((r, i) => (
          <div key={i} className="meal-item">
            <div>
              <div style={{ fontWeight: 600, marginBottom: "0.1rem" }}>{r.desc}</div>
              <div className="meal-time">{r.hora}</div>
            </div>
            <div style={{ color: "var(--green)", fontWeight: 600 }}>~{r.kcal}kcal</div>
          </div>
        ))}
        <div style={{ marginTop: "1rem" }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Horário</label>
              <input className="form-input" type="time" defaultValue="13:00" />
            </div>
            <div className="form-group">
              <label className="form-label">Calorias estimadas</label>
              <input className="form-input" type="number" placeholder="kcal" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">O que você comeu</label>
            <textarea className="form-textarea" placeholder="Descreva a refeição..." />
          </div>
          <button className="btn btn-primary" onClick={() => setRegistros(prev => [...prev, { hora: "13:00", desc: "Nova refeição", kcal: 350 }])}>+ Adicionar refeição</button>
        </div>
      </div>
    </div>
  );
}

function AlunoHidratacao() {
  const [ml, setMl] = useState(1800);
  const meta = 3000;
  const pct = Math.min((ml / meta) * 100, 100);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title green">HIDRATAÇÃO</div>
        <div className="page-sub">Acompanhe sua ingestão de água</div>
      </div>

      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "5rem", fontFamily: "var(--font-display)", letterSpacing: "0.05em", color: "var(--blue)", lineHeight: 1 }}>{(ml / 1000).toFixed(1)}</div>
        <div style={{ fontSize: "1.2rem", color: "var(--text2)", marginBottom: "1.5rem" }}>litros de {(meta / 1000).toFixed(1)}L</div>
        <div className="progress-track" style={{ height: "14px", marginBottom: "1.5rem" }}>
          <div className="progress-fill blue" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ color: pct >= 100 ? "var(--green)" : "var(--text2)", fontWeight: 600, marginBottom: "1.5rem" }}>
          {pct >= 100 ? "🎉 Meta atingida!" : `Faltam ${((meta - ml) / 1000).toFixed(1)}L`}
        </div>
        <div className="quick-btns" style={{ justifyContent: "center" }}>
          {[150, 200, 300, 500, 750, 1000].map(q => (
            <div key={q} className="quick-btn" onClick={() => setMl(prev => Math.min(prev + q, meta + 500))}>
              <div className="quick-btn-icon">💧</div>+{q >= 1000 ? "1L" : `${q}ml`}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">📊 HISTÓRICO SEMANAL</div>
        <BarChart color="blue" data={DAYS.map((d, i) => ({ l: d, v: [2100, 1800, 2500, 3000, 2800, 1500, 1800][i] }))} />
      </div>

      <div className="card">
        <div className="card-title">⚙️ CONFIGURAR META</div>
        <div className="form-group">
          <label className="form-label">Meta diária (ml)</label>
          <input className="form-input" type="number" defaultValue="3000" />
        </div>
        <button className="btn btn-blue">Salvar meta</button>
      </div>
    </div>
  );
}

function AlunoCompeticoes() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title green">COMPETIÇÕES</div>
        <div className="page-sub">Seus eventos e provas cadastrados</div>
      </div>

      <div className="card">
        <div className="card-title">📅 PRÓXIMOS EVENTOS</div>
        {COMPETICOES.filter(c => c.aluno === "Ana Souza").map((c, i) => (
          <div key={i} className="comp-card" style={{ background: "var(--bg2)" }}>
            <div className="comp-date">
              <div className="comp-date-day">{c.dia}</div>
              <div className="comp-date-month">{c.mes}</div>
            </div>
            <div className="comp-info">
              <div className="comp-name">{c.nome}</div>
              <div className="comp-meta">{c.tipo}</div>
            </div>
            <span className="tag tag-orange">{c.status.toUpperCase()}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">➕ CADASTRAR COMPETIÇÃO</div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Nome do evento</label>
            <input className="form-input" placeholder="Ex: Ironman Florianópolis" />
          </div>
          <div className="form-group">
            <label className="form-label">Modalidade</label>
            <select className="form-select">
              <option>🏊 Natação</option>
              <option>🏃 Corrida</option>
              <option>🏆 Triathlon / Ironman</option>
              <option>🥊 Luta</option>
              <option>🏋️ Fisiculturismo</option>
              <option>🚴 Ciclismo</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Data</label>
            <input className="form-input" type="date" />
          </div>
          <div className="form-group">
            <label className="form-label">Local</label>
            <input className="form-input" placeholder="Cidade / Local" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Objetivo</label>
          <select className="form-select">
            <option>Terminar / Completar</option>
            <option>Bater meu recorde pessoal</option>
            <option>Subir no pódio</option>
            <option>Subir no palco</option>
            <option>Definição de peso (lutas)</option>
          </select>
        </div>
        <button className="btn btn-primary">+ Cadastrar evento</button>
      </div>
    </div>
  );
}

function AlunoAvaliacao() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title green">AVALIAÇÃO FÍSICA</div>
        <div className="page-sub">Fotos e medidas para acompanhar sua evolução</div>
      </div>

      <div className="card">
        <div className="card-title">📸 FOTOS DE EVOLUÇÃO</div>
        <div className="grid-3" style={{ marginBottom: "1rem" }}>
          {["Frente", "Costas", "Lateral"].map(v => (
            <div key={v} style={{ background: "var(--bg2)", border: "2px dashed var(--border)", borderRadius: "var(--radius)", padding: "2rem 1rem", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📷</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text2)" }}>{v}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-full">+ Adicionar fotos</button>
      </div>

      <div className="card">
        <div className="card-title">📏 MEDIDAS CORPORAIS</div>
        <div className="grid-2">
          {[["Peso", "kg"], ["% Gordura", "%"], ["Cintura", "cm"], ["Quadril", "cm"], ["Braço D", "cm"], ["Braço E", "cm"], ["Perna D", "cm"], ["Perna E", "cm"]].map(([l, u]) => (
            <div key={l} className="form-group">
              <label className="form-label">{l}</label>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input className="form-input" type="number" placeholder="0" />
                <span style={{ color: "var(--text2)", fontSize: "0.85rem", flexShrink: 0 }}>{u}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary">💾 Salvar avaliação</button>
      </div>

      <div className="card">
        <div className="card-title">📊 EVOLUÇÃO DE PESO</div>
        <BarChart color="green" data={[
          { l: "Jan", v: 66 }, { l: "Fev", v: 65 }, { l: "Mar", v: 63.5 }, { l: "Abr", v: 62 }
        ]} />
      </div>
    </div>
  );
}

// ============================================================
// TREINADOR PAGES
// ============================================================
function TreinadorDashboard({ onAluno }) {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title orange">PAINEL DO TREINADOR</div>
        <div className="page-sub">Visão geral dos seus alunos</div>
      </div>

      <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-tile">
          <div className="stat-label">Total alunos</div>
          <div className="stat-value orange">4</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Treinos hoje</div>
          <div className="stat-value green">3</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Alertas</div>
          <div className="stat-value red">3</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Provas próx.</div>
          <div className="stat-value" style={{ color: "var(--text)" }}>2</div>
        </div>
      </div>

      <div className="alert alert-danger">🔴 Júlia Lima relatou dor intensa no ombro direito (intensidade 8/10)</div>
      <div className="alert alert-warn">⚠️ Carlos Mendes: pesagem para competição em 48 horas</div>

      <div className="card">
        <div className="card-title">👥 MEUS ALUNOS</div>
        {ALUNOS.map(a => (
          <div key={a.id} className="aluno-row" onClick={() => onAluno && onAluno(a)}>
            <div className="aluno-avatar" style={{ background: a.bg, fontSize: "1.2rem" }}>{a.avatar[0]}</div>
            <div className="aluno-info">
              <div className="aluno-name">{a.nome}</div>
              <div className="aluno-meta">{a.esportes} • {a.objetivo}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "0.25rem" }}>{a.peso}</div>
              {a.alertas > 0 && <span className="badge">{a.alertas}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TreinadorPrescrever() {
  const [aluno, setAluno] = useState(ALUNOS[0]);
  const [saved, setSaved] = useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title orange">PRESCREVER TREINO</div>
        <div className="page-sub">Monte o plano semanal do aluno</div>
      </div>

      {saved && <div className="alert alert-success">✅ Treino enviado! {aluno.nome} foi notificada.</div>}

      <div className="card">
        <div className="card-title">👤 SELECIONAR ALUNO</div>
        <div className="toggle-wrap">
          {ALUNOS.map(a => (
            <button key={a.id} className={`toggle-btn ${aluno.id === a.id ? "active-orange" : ""}`} onClick={() => setAluno(a)}>{a.nome}</button>
          ))}
        </div>
        <div className="alert alert-info">📋 Objetivo: <strong>{aluno.objetivo}</strong> • Próx. competição: <strong>{aluno.comp}</strong></div>
      </div>

      <div className="card">
        <div className="card-title">🏋️ EXERCÍCIOS DO TREINO</div>
        <div className="form-group">
          <label className="form-label">Nome do treino</label>
          <input className="form-input" placeholder="Ex: Peito + Tríceps" defaultValue="Peito + Tríceps" />
        </div>
        {TREINOS_PRESCRITOS[0].exercicios.map((ex, i) => (
          <div key={i} className="ex-row">
            <div>
              <div className="ex-name">{ex.nome}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text3)" }}>{ex.desc}</div>
            </div>
            <div className="ex-detail">{ex.series}<span>séries</span></div>
            <div className="ex-detail">{ex.reps}<span>reps</span></div>
            <div className="ex-detail">{ex.carga}<span>carga</span></div>
            <button className="btn btn-ghost btn-sm">✏️</button>
          </div>
        ))}
        <button className="btn btn-ghost" style={{ marginTop: "0.5rem" }}>+ Adicionar exercício</button>
      </div>

      <div className="card">
        <div className="card-title">📅 DIAS DA SEMANA</div>
        <div className="week-grid">
          {DAYS.map((d, i) => (
            <div key={i} className={`week-day ${[0, 2, 4].includes(i) ? "done" : ""}`} style={{ cursor: "pointer" }}>
              <div className="week-day-name">{d}</div>
              <div className="week-day-num">{[0, 2, 4].includes(i) ? "✓" : "—"}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">📝 OBSERVAÇÕES</div>
        <textarea className="form-textarea" placeholder="Instruções adicionais, ajustes de carga, foco da semana..." />
      </div>

      <button className="btn btn-orange btn-full" onClick={() => setSaved(true)}>📤 Enviar treino para {aluno.nome}</button>
    </div>
  );
}

function TreinadorAcompanhamento() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title orange">ACOMPANHAMENTO</div>
        <div className="page-sub">Diário dos alunos — treinos e saúde</div>
      </div>

      {ALUNOS.map(a => (
        <div key={a.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <div className="card-title" style={{ marginBottom: "0.1rem" }}>{a.nome}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text2)" }}>{a.esportes} • {a.peso}</div>
            </div>
            {a.alertas > 0 && <span className="tag tag-red">🔴 {a.alertas} alerta{a.alertas > 1 ? "s" : ""}</span>}
          </div>
          <div className="grid-3">
            <div style={{ fontSize: "0.85rem" }}>
              <div style={{ color: "var(--text3)", marginBottom: "0.2rem", fontSize: "0.75rem" }}>TREINOS/SEM</div>
              <div className="green" style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>4/5</div>
            </div>
            <div style={{ fontSize: "0.85rem" }}>
              <div style={{ color: "var(--text3)", marginBottom: "0.2rem", fontSize: "0.75rem" }}>ÚLTIMA NOTA</div>
              <div className="orange" style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>⭐ 4/5</div>
            </div>
            <div style={{ fontSize: "0.85rem" }}>
              <div style={{ color: "var(--text3)", marginBottom: "0.2rem", fontSize: "0.75rem" }}>PRÓX. PROVA</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--text)" }}>{a.comp}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TreinadorCompeticoes() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title orange">COMPETIÇÕES</div>
        <div className="page-sub">Eventos dos seus alunos</div>
      </div>

      <div className="card">
        <div className="card-title">📅 CALENDÁRIO DE EVENTOS</div>
        {COMPETICOES.map((c, i) => (
          <div key={i} className="comp-card" style={{ background: "var(--bg2)" }}>
            <div className="comp-date">
              <div className="comp-date-day">{c.dia}</div>
              <div className="comp-date-month">{c.mes}</div>
            </div>
            <div className="comp-info">
              <div className="comp-name">{c.nome}</div>
              <div className="comp-meta">{c.tipo} • {c.aluno}</div>
            </div>
            <span className="tag tag-orange">{c.status.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// NUTRICIONISTA PAGES
// ============================================================
function NutriDashboard() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title blue">PAINEL DA NUTRICIONISTA</div>
        <div className="page-sub">Acompanhe a nutrição dos seus pacientes</div>
      </div>

      <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-tile">
          <div className="stat-label">Pacientes</div>
          <div className="stat-value blue">4</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Planos ativos</div>
          <div className="stat-value green">4</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Ajustes urgentes</div>
          <div className="stat-value orange">2</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Provas &lt; 30 dias</div>
          <div className="stat-value red">2</div>
        </div>
      </div>

      <div className="alert alert-danger">🏆 Júlia Lima — Arnold Classic em 50 dias. Iniciar Peak Week em 43 dias. Ajuste calórico necessário!</div>
      <div className="alert alert-warn">⚖️ Carlos Mendes — Pesagem BJJ em 48h. Protocolo de cutting de água ativo.</div>

      <div className="card">
        <div className="card-title">👥 MEUS PACIENTES</div>
        {ALUNOS.map(a => (
          <div key={a.id} className="aluno-row">
            <div className="aluno-avatar" style={{ background: a.bg }}>{a.avatar[0]}</div>
            <div className="aluno-info">
              <div className="aluno-name">{a.nome}</div>
              <div className="aluno-meta">Objetivo: {a.objetivo} • {a.peso}</div>
            </div>
            <span className="tag tag-blue">VER PLANO</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NutriPlano() {
  const [aluno, setAluno] = useState(ALUNOS[0]);
  const [fase, setFase] = useState("normal");
  const [saved, setSaved] = useState(false);

  const fases = { normal: 2330, carga: 3100, cutting: 1800, peak: 2000 };
  const kcal = fases[fase];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title blue">PLANO ALIMENTAR</div>
        <div className="page-sub">Prescreva e ajuste a dieta do paciente</div>
      </div>

      {saved && <div className="alert alert-success">✅ Plano atualizado e enviado para {aluno.nome}!</div>}

      <div className="card">
        <div className="card-title">👤 PACIENTE</div>
        <div className="toggle-wrap">
          {ALUNOS.map(a => (
            <button key={a.id} className={`toggle-btn ${aluno.id === a.id ? "active-blue" : ""}`} onClick={() => setAluno(a)}>{a.nome}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">🎯 FASE / PROTOCOLO</div>
        <div className="toggle-wrap">
          {[["normal", "Normal"], ["carga", "Semana de Carga"], ["cutting", "Cutting / Seca"], ["peak", "Peak Week"]].map(([v, l]) => (
            <button key={v} className={`toggle-btn ${fase === v ? "active-blue" : ""}`} onClick={() => setFase(v)}>{l}</button>
          ))}
        </div>
        <div className="alert alert-info">
          {fase === "normal" && "📋 Dieta padrão — manutenção com déficit leve"}
          {fase === "carga" && "⚡ Semana de carga — alto carboidrato para prova longa (Ironman / Maratona)"}
          {fase === "cutting" && "⚖️ Corte de peso — déficit calórico controlado para pesagem"}
          {fase === "peak" && "🏆 Peak Week — ajuste para subir no palco (fisiculturismo)"}
        </div>
        <div className="stat-tile" style={{ marginBottom: 0 }}>
          <div className="stat-label">Meta calórica do protocolo</div>
          <div className="stat-value blue">{kcal.toLocaleString()}<span className="stat-unit">kcal/dia</span></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🥗 REFEIÇÕES PRESCRITAS</div>
        {PLANO_NUTRI.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.85rem 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text3)", flexShrink: 0, paddingTop: "0.15rem", minWidth: "45px" }}>{r.horario}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: "0.15rem", fontSize: "0.9rem" }}>{r.refeicao}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text2)" }}>{r.itens}</div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <div style={{ color: "var(--green)", fontSize: "0.85rem", fontWeight: 600 }}>{r.kcal}kcal</div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: "0.25rem", padding: "0.2rem 0.5rem" }}>✏️</button>
            </div>
          </div>
        ))}
        <button className="btn btn-ghost" style={{ marginTop: "0.75rem" }}>+ Adicionar refeição</button>
      </div>

      <button className="btn btn-blue btn-full" onClick={() => setSaved(true)}>📤 Enviar plano para {aluno.nome}</button>
    </div>
  );
}

function NutriAcompanhamento() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title blue">ACOMPANHAMENTO</div>
        <div className="page-sub">O que os pacientes estão comendo</div>
      </div>

      {ALUNOS.map(a => (
        <div key={a.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <div className="card-title" style={{ marginBottom: "0.1rem" }}>{a.nome}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text2)" }}>Objetivo: {a.objetivo}</div>
            </div>
          </div>
          <div className="progress-wrap">
            <div className="progress-header">
              <span style={{ fontSize: "0.8rem" }}>Aderência ao plano</span>
              <span className="green" style={{ fontSize: "0.8rem" }}>78%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill green" style={{ width: "78%" }} />
            </div>
          </div>
          <div className="progress-wrap">
            <div className="progress-header">
              <span style={{ fontSize: "0.8rem" }}>Hidratação</span>
              <span className="blue" style={{ fontSize: "0.8rem" }}>60%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill blue" style={{ width: "60%" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// NAVIGATION CONFIG
// ============================================================
const NAV_ALUNO = [
  { section: "VISÃO GERAL", items: [{ id: "dashboard", icon: "🏠", label: "Dashboard" }] },
  { section: "DIÁRIO", items: [
    { id: "treinos", icon: "🏋️", label: "Treinos" },
    { id: "alimentacao", icon: "🥗", label: "Alimentação" },
    { id: "hidratacao", icon: "💧", label: "Hidratação" },
    { id: "saude", icon: "❤️", label: "Saúde" },
  ]},
  { section: "PROGRESSO", items: [
    { id: "avaliacao", icon: "📊", label: "Avaliação Física" },
    { id: "competicoes", icon: "🏆", label: "Competições" },
  ]},
];

const NAV_TREINADOR = [
  { section: "VISÃO GERAL", items: [{ id: "dashboard", icon: "🏠", label: "Dashboard" }] },
  { section: "GESTÃO", items: [
    { id: "prescrever", icon: "📋", label: "Prescrever Treino" },
    { id: "acompanhamento", icon: "👁️", label: "Acompanhamento" },
    { id: "competicoes", icon: "🏆", label: "Competições" },
  ]},
];

const NAV_NUTRI = [
  { section: "VISÃO GERAL", items: [{ id: "dashboard", icon: "🏠", label: "Dashboard" }] },
  { section: "NUTRIÇÃO", items: [
    { id: "plano", icon: "🥗", label: "Plano Alimentar" },
    { id: "acompanhamento", icon: "👁️", label: "Acompanhamento" },
  ]},
];

// ============================================================
// SHELL
// ============================================================
function AppShell({ role, onBack, children, nav, activeNav, setNav, accentClass }) {
  const roleLabel = { aluno: "ALUNO", treinador: "TREINADOR", nutri: "NUTRICIONISTA" }[role];

  return (
    <div className="shell">
      <div className="sidebar">
        <div className="sidebar-logo">TrioFit</div>
        <div className="sidebar-role">{roleLabel}</div>
        {nav.map(section => (
          <div key={section.section} className="nav-section">
            <div className="nav-label">{section.section}</div>
            {section.items.map(item => (
              <div key={item.id} className={`nav-item ${activeNav === item.id ? `active ${accentClass}` : ""}`} onClick={() => setNav(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        ))}
        <div className="sidebar-footer">
          <div className="back-btn" onClick={onBack}>← Trocar perfil</div>
        </div>
      </div>
      <div className="main">{children}</div>
    </div>
  );
}

// ============================================================
// ROLE ROUTERS
// ============================================================
function AlunoApp({ onBack }) {
  const [page, setPage] = useState("dashboard");
  const pages = { dashboard: <AlunoDashboard />, saude: <AlunoSaude />, treinos: <AlunoTreinos />, alimentacao: <AlunoAlimentacao />, hidratacao: <AlunoHidratacao />, competicoes: <AlunoCompeticoes />, avaliacao: <AlunoAvaliacao /> };
  return (
    <AppShell role="aluno" onBack={onBack} nav={NAV_ALUNO} activeNav={page} setNav={setPage} accentClass="">
      {pages[page]}
    </AppShell>
  );
}

function TreinadorApp({ onBack }) {
  const [page, setPage] = useState("dashboard");
  const pages = { dashboard: <TreinadorDashboard />, prescrever: <TreinadorPrescrever />, acompanhamento: <TreinadorAcompanhamento />, competicoes: <TreinadorCompeticoes /> };
  return (
    <AppShell role="treinador" onBack={onBack} nav={NAV_TREINADOR} activeNav={page} setNav={setPage} accentClass="orange">
      {pages[page]}
    </AppShell>
  );
}

function NutriApp({ onBack }) {
  const [page, setPage] = useState("dashboard");
  const pages = { dashboard: <NutriDashboard />, plano: <NutriPlano />, acompanhamento: <NutriAcompanhamento /> };
  return (
    <AppShell role="nutri" onBack={onBack} nav={NAV_NUTRI} activeNav={page} setNav={setPage} accentClass="blue">
      {pages[page]}
    </AppShell>
  );
}

// ============================================================
// LANDING
// ============================================================
function Landing({ onSelect }) {
  return (
    <div className="landing">
      <div className="landing-logo">TrioFit</div>
      <div className="landing-tagline">Aluno • Treinador • Nutricionista — Tudo em um só lugar</div>
      <div className="landing-cards">
        <div className="role-card aluno" onClick={() => onSelect("aluno")}>
          <div className="role-icon">🏃</div>
          <div className="role-title">Aluno</div>
          <div className="role-desc">Registre treinos, alimentação, hidratação, saúde e acompanhe sua evolução física</div>
        </div>
        <div className="role-card treinador" onClick={() => onSelect("treinador")}>
          <div className="role-icon">🏋️</div>
          <div className="role-title">Treinador</div>
          <div className="role-desc">Prescreva treinos, acompanhe o progresso dos alunos e gerencie competições</div>
        </div>
        <div className="role-card nutri" onClick={() => onSelect("nutri")}>
          <div className="role-icon">🥗</div>
          <div className="role-title">Nutricionista</div>
          <div className="role-desc">Monte planos alimentares, ajuste protocolos por competição e monitore a aderência</div>
        </div>
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--text3)" }}>Clique no seu perfil para entrar</div>
    </div>
  );
}

// ============================================================
// ROOT
// ============================================================
export default function TrioFit() {
  const [role, setRole] = useState(null);

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {!role && <Landing onSelect={setRole} />}
        {role === "aluno" && <AlunoApp onBack={() => setRole(null)} />}
        {role === "treinador" && <TreinadorApp onBack={() => setRole(null)} />}
        {role === "nutri" && <NutriApp onBack={() => setRole(null)} />}
      </div>
    </>
  );
}
