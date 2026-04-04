import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

function gerarCodigoLocal(id) {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let r = "", s = 0;
  for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) % 999999;
  for (let i = 0; i < 6; i++) { r += c[s % 32]; s = Math.floor(s / 32) + 7; }
  return r.slice(0, 6);
}

async function criarPerfil(user, nome, role) {
  const codigo = gerarCodigoLocal(user.id);
  const nomeFinal = nome || user.email.split('@')[0];
  const roleFinal = role || 'aluno';
  // Usa upsert para não falhar se já existe
  await supabase.from('profiles').upsert(
    { id: user.id, nome: nomeFinal, role: roleFinal, codigo },
    { onConflict: 'id', ignoreDuplicates: false }
  );
  return { id: user.id, email: user.email, nome: nomeFinal, role: roleFinal, codigo };
}

export const DB = {

  async register(nome, email, senha, role) {
    // Faz logout de qualquer sessão existente antes de criar conta nova
    await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome, role } },
    });

    if (error) {
      if (error.message?.includes('already registered') || error.code === 'user_already_exists') {
        return { ok: false, msg: 'Este email já está cadastrado. Use a aba "Entrar" para fazer login.' };
      }
      return { ok: false, msg: error.message };
    }

    if (!data.user) return { ok: false, msg: 'Erro ao criar conta. Tente novamente.' };

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
    await supabase.auth.signOut();
  },

  async getSession() {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      );
      const { data } = await Promise.race([supabase.auth.getSession(), timeout]);
      if (!data?.session?.user) return null;
      return this._formatUser(data.session.user);
    } catch {
      return null;
    }
  },

  async _formatUser(supaUser) {
    if (!supaUser) return null;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome, role, codigo')
        .eq('id', supaUser.id)
        .single();

      if (!profile) {
        const nome = supaUser.user_metadata?.nome || supaUser.email.split('@')[0];
        const role = supaUser.user_metadata?.role || 'aluno';
        return criarPerfil(supaUser, nome, role);
      }

      return { id: supaUser.id, email: supaUser.email, nome: profile.nome, role: profile.role, codigo: profile.codigo };
    } catch {
      return {
        id: supaUser.id,
        email: supaUser.email,
        nome: supaUser.user_metadata?.nome || supaUser.email.split('@')[0],
        role: supaUser.user_metadata?.role || 'aluno',
        codigo: gerarCodigoLocal(supaUser.id),
      };
    }
  },

  async getUserByCodigo(codigo) {
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, role, codigo')
      .eq('codigo', codigo.toUpperCase())
      .single();
    return data || null;
  },

  async getUserById(id) {
    if (!id) return null;
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, role, codigo')
      .eq('id', id)
      .single();
    return data || null;
  },

  async getVinculoAluno(alunoId) {
    const { data } = await supabase
      .from('vinculos')
      .select('treinador_id, nutri_id')
      .eq('aluno_id', alunoId)
      .single();
    if (!data) return null;
    return { treinadorId: data.treinador_id, nutriId: data.nutri_id };
  },

  async setVinculoAluno(alunoId, treinadorId, nutriId) {
    await supabase.from('vinculos').upsert(
      { aluno_id: alunoId, treinador_id: treinadorId || null, nutri_id: nutriId || null },
      { onConflict: 'aluno_id' }
    );
  },

  async getAlunosDe(profId) {
    const { data } = await supabase
      .from('vinculos')
      .select('aluno_id')
      .or(`treinador_id.eq.${profId},nutri_id.eq.${profId}`);
    if (!data?.length) return [];
    const ids = data.map(v => v.aluno_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nome, role, codigo')
      .in('id', ids);
    return profiles || [];
  },

  async getData(chave, userId) {
    if (!userId) return null;
    const { data } = await supabase
      .from('dados')
      .select('valor')
      .eq('user_id', userId)
      .eq('chave', chave)
      .single();
    return data?.valor ?? null;
  },

  async setData(chave, userId, valor) {
    if (!userId) return;
    await supabase.from('dados').upsert(
      { user_id: userId, chave, valor, atualizado_em: new Date().toISOString() },
      { onConflict: 'user_id,chave' }
    );
  },

  async getMultiData(userId, chaves) {
    if (!userId) return {};
    const { data } = await supabase
      .from('dados')
      .select('chave, valor')
      .eq('user_id', userId)
      .in('chave', chaves);
    const result = {};
    (data || []).forEach(d => { result[d.chave] = d.valor; });
    return result;
  },
};
