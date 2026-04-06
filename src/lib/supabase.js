import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

function gerarCodigoLocal(id) {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = 0;
  for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) % 999999;
  let r = "";
  for (let i = 0; i < 6; i++) { r += c[s % 32]; s = Math.floor(s / 32) + 7; }
  return r.toUpperCase();
}

async function criarPerfil(user, nome, role) {
  const codigo = gerarCodigoLocal(user.id);
  const nomeFinal = nome || user.email.split('@')[0];
  const roleFinal = role || 'aluno';
  await supabase.from('profiles').upsert(
    { id: user.id, nome: nomeFinal, role: roleFinal, codigo },
    { onConflict: 'id', ignoreDuplicates: true }
  );
  return { id: user.id, email: user.email, nome: nomeFinal, role: roleFinal, codigo };
}

// Helper: busca 1 linha sem .single() para evitar 406
async function fetchOne(query) {
  const { data, error } = await query.limit(1);
  if (error || !data || data.length === 0) return null;
  return data[0];
}

export const DB = {

  async register(nome, email, senha, role) {
    await supabase.auth.signOut();
    const { data, error } = await supabase.auth.signUp({
      email, password: senha,
      options: { data: { nome, role } },
    });
    if (error) {
      const msg = error.message?.includes('already registered')
        ? 'Este email já está cadastrado. Use "Entrar" para fazer login.'
        : error.message;
      return { ok: false, msg };
    }
    if (!data.user) return { ok: false, msg: 'Erro ao criar conta.' };
    const user = await criarPerfil(data.user, nome, role);
    return { ok: true, user };
  },

  async login(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) return { ok: false, msg: 'Email ou senha incorretos.' };
    const user = await this._formatUser(data.user);
    return { ok: true, user };
  },

  async logout() {
    try { await supabase.auth.signOut({ scope: 'local' }); } catch {}
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('sb-'))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
    setTimeout(() => { window.location.href = '/'; }, 100);
  },

  async getSession() {
    try {
      const result = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 5000))
      ]);
      if (!result.data?.session?.user) return null;
      return this._formatUser(result.data.session.user);
    } catch { return null; }
  },

  async _formatUser(supaUser) {
    if (!supaUser) return null;
    try {
      const profile = await fetchOne(
        supabase.from('profiles').select('nome,role,codigo').eq('id', supaUser.id)
      );
      if (!profile) {
        const nome = supaUser.user_metadata?.nome || supaUser.email.split('@')[0];
        const role = supaUser.user_metadata?.role || 'aluno';
        return criarPerfil(supaUser, nome, role);
      }
      return { id: supaUser.id, email: supaUser.email, nome: profile.nome, role: profile.role, codigo: profile.codigo };
    } catch {
      return {
        id: supaUser.id, email: supaUser.email,
        nome: supaUser.user_metadata?.nome || supaUser.email.split('@')[0],
        role: supaUser.user_metadata?.role || 'aluno',
        codigo: gerarCodigoLocal(supaUser.id),
      };
    }
  },

  async getUserByCodigo(codigo) {
    try {
      const profile = await fetchOne(
        supabase.from('profiles').select('id,nome,role,codigo').eq('codigo', codigo.toUpperCase())
      );
      if (!profile) return null;
      return { ...profile, role: profile.role || 'aluno' };
    } catch { return null; }
  },

  async getUserById(id) {
    if (!id) return null;
    try {
      return await fetchOne(
        supabase.from('profiles').select('id,nome,role,codigo').eq('id', id)
      );
    } catch { return null; }
  },

  async getVinculoAluno(alunoId) {
    try {
      const v = await fetchOne(
        supabase.from('vinculos').select('treinador_id,nutri_id').eq('aluno_id', alunoId)
      );
      if (!v) return null;
      return { treinadorId: v.treinador_id, nutriId: v.nutri_id };
    } catch { return null; }
  },

  async setVinculoAluno(alunoId, treinadorId, nutriId) {
    try {
      await supabase.from('vinculos').upsert(
        { aluno_id: alunoId, treinador_id: treinadorId || null, nutri_id: nutriId || null },
        { onConflict: 'aluno_id' }
      );
    } catch {}
  },

  async getAlunosDe(profId) {
    try {
      const { data } = await supabase.from('vinculos').select('aluno_id')
        .or(`treinador_id.eq.${profId},nutri_id.eq.${profId}`);
      if (!data?.length) return [];
      const ids = data.map(v => v.aluno_id);
      const { data: profiles } = await supabase.from('profiles').select('id,nome,role,codigo').in('id', ids);
      return profiles || [];
    } catch { return []; }
  },

  async getData(chave, userId) {
    if (!userId) return null;
    try {
      const row = await fetchOne(
        supabase.from('dados').select('valor').eq('user_id', userId).eq('chave', chave)
      );
      return row?.valor ?? null;
    } catch { return null; }
  },

  async setData(chave, userId, valor) {
    if (!userId) return;
    try {
      await supabase.from('dados').upsert(
        { user_id: userId, chave, valor, atualizado_em: new Date().toISOString() },
        { onConflict: 'user_id,chave' }
      );
    } catch {}
  },

  async getMultiData(userId, chaves) {
    if (!userId) return {};
    try {
      const { data } = await supabase.from('dados').select('chave,valor')
        .eq('user_id', userId).in('chave', chaves);
      const result = {};
      (data || []).forEach(d => { result[d.chave] = d.valor; });
      return result;
    } catch { return {}; }
  },
};
