// ============================================================
// src/lib/supabase.js
// Cliente Supabase + camada DB que substitui localStorage
// ============================================================
import { createClient } from '@supabase/supabase-js';

// Coloque suas credenciais aqui (ou em .env)
// VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ============================================================
// DB — API idêntica ao localStorage anterior
// Troca localStorage por Supabase sem mudar o resto do app
// ============================================================
export const DB = {

  // ----------------------------------------------------------
  // AUTH
  // ----------------------------------------------------------
  async register(nome, email, senha, role) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, role }, // salvo em raw_user_meta_data → trigger cria perfil
      },
    });
    if (error) return { ok: false, msg: error.message };
    return { ok: true, user: await this._formatUser(data.user) };
  },

  async login(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) return { ok: false, msg: 'Email ou senha incorretos.' };
    return { ok: true, user: await this._formatUser(data.user) };
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;
    return this._formatUser(data.session.user);
  },

  async onAuthChange(callback) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this._formatUser(session.user);
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  // Formata o user do Supabase para o formato do app
  async _formatUser(supaUser) {
    if (!supaUser) return null;
    // Busca perfil (nome, role, codigo)
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome, role, codigo')
      .eq('id', supaUser.id)
      .maybeSingle();

    return {
      id: supaUser.id,
      email: supaUser.email,
      nome: profile?.nome || supaUser.user_metadata?.nome || supaUser.email,
      role: profile?.role || supaUser.user_metadata?.role || 'aluno',
      codigo: profile?.codigo || '',
    };
  },

  // ----------------------------------------------------------
  // BUSCA POR CÓDIGO (vínculo)
  // ----------------------------------------------------------
  async getUserByCodigo(codigo) {
    const { data, error } = await supabase.rpc('get_profile_by_codigo', { c: codigo.toUpperCase() });
    if (error || !data?.length) return null;
    return data[0];
  },

  async getUserById(id) {
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, role, codigo')
      .eq('id', id)
      .maybeSingle();
    if (!data) return null;
    const { data: u } = await supabase.auth.admin?.getUserById?.(id) || {};
    return { ...data, email: u?.email || '' };
  },

  // ----------------------------------------------------------
  // VÍNCULOS
  // ----------------------------------------------------------
  async getVinculoAluno(alunoId) {
    const { data } = await supabase
      .from('vinculos')
      .select('treinador_id, nutri_id')
      .eq('aluno_id', alunoId)
      .maybeSingle();
    if (!data) return null;
    return { treinadorId: data.treinador_id, nutriId: data.nutri_id };
  },

  async setVinculoAluno(alunoId, treinadorId, nutriId) {
    await supabase
      .from('vinculos')
      .upsert(
        { aluno_id: alunoId, treinador_id: treinadorId || null, nutri_id: nutriId || null },
        { onConflict: 'aluno_id' }
      );
  },

  async getAlunosDe(profId) {
    const { data } = await supabase.rpc('get_alunos_do_prof', { prof_id: profId });
    return data || [];
  },

  // ----------------------------------------------------------
  // DADOS GENÉRICOS (substitui localStorage tf_KEY_UID)
  // ----------------------------------------------------------
  async getData(chave, userId) {
    const { data } = await supabase
      .from('dados')
      .select('valor')
      .eq('user_id', userId)
      .eq('chave', chave)
      .maybeSingle();
    return data?.valor ?? null;
  },

  async setData(chave, userId, valor) {
    await supabase.rpc('upsert_dado', {
      p_user_id: userId,
      p_chave: chave,
      p_valor: valor,
    });
  },

  // ----------------------------------------------------------
  // HELPER: buscar vários dados de um aluno de uma vez
  // (para dashboards do profissional — evita N+1 queries)
  // ----------------------------------------------------------
  async getMultiData(userId, chaves) {
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
