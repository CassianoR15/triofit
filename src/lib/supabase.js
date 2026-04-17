// ============================================================
// src/lib/supabase.js
// Cliente Supabase + camada DB que substitui localStorage
// ============================================================
import { createClient } from '@supabase/supabase-js';

// Coloque suas credenciais aqui (ou em .env)
// VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vboknerswhvpheuymakx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2tuZXJzd2h2cGhldXltYWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDc1NTksImV4cCI6MjA5MDcyMzU1OX0.-Y7NzFkA2Qyd8N1yqT77Iied7rdR5CkSlCNjqCMLlaM';

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
      .select('nome, role, codigo, objetivo')
      .eq('id', supaUser.id)
      .maybeSingle();

    return {
      id: supaUser.id,
      email: supaUser.email,
      nome: profile?.nome || supaUser.user_metadata?.nome || supaUser.email,
      role: profile?.role || supaUser.user_metadata?.role || 'aluno',
      codigo: profile?.codigo || '',
      objetivo: profile?.objetivo || null,
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

  async getProfile(id) {
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, role, codigo')
      .eq('id', id)
      .maybeSingle();
    return data || null;
  },

  async getUserById(id) {
    if (!id) return null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, nome, role, codigo')
        .eq('id', id)
        .maybeSingle();
      return data || null;
    } catch(e) { return null; }
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
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('dados')
        .select('valor')
        .eq('user_id', userId)
        .eq('chave', chave)
        .maybeSingle();
      if (error) { console.warn('getData error:', chave, error.message); return null; }
      return data?.valor ?? null;
    } catch(e) {
      console.warn('getData exception:', chave, e);
      return null;
    }
  },

  async setData(chave, userId, valor) {
    await supabase.rpc('upsert_dado', {
      p_user_id: userId,
      p_chave: chave,
      p_valor: valor,
    });
  },

  // ----------------------------------------------------------
  // CHAT
  // ----------------------------------------------------------
  async getMensagens(meuId, outroId) {
    const { data } = await supabase
      .from('mensagens')
      .select('*')
      .or(`and(de_id.eq.${meuId},para_id.eq.${outroId}),and(de_id.eq.${outroId},para_id.eq.${meuId})`)
      .order('criado_em', { ascending: true })
      .limit(100);
    return data || [];
  },

  async enviarMensagem(deId, paraId, texto) {
    const { data, error } = await supabase
      .from('mensagens')
      .insert({ de_id: deId, para_id: paraId, texto })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async marcarLidas(meuId, deId) {
    await supabase
      .from('mensagens')
      .update({ lida: true })
      .eq('para_id', meuId)
      .eq('de_id', deId)
      .eq('lida', false);
  },

  async getMensagensNaoLidas(meuId) {
    const { data } = await supabase
      .from('mensagens')
      .select('de_id')
      .eq('para_id', meuId)
      .eq('lida', false);
    return data || [];
  },

  subscribeMensagens(meuId, callback) {
    return supabase
      .channel('mensagens_' + meuId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens',
        filter: `para_id=eq.${meuId}`
      }, callback)
      .subscribe();
  },

  // ----------------------------------------------------------
  // NOTIFICAÇÕES
  // ----------------------------------------------------------
  async criarNotificacao(userId, tipo, titulo, corpo) {
    await supabase.from('notificacoes').insert({ user_id: userId, tipo, titulo, corpo });
  },

  async getNotificacoes(userId) {
    const { data } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('user_id', userId)
      .order('criado_em', { ascending: false })
      .limit(20);
    return data || [];
  },

  async marcarNotifLida(id) {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
  },

  async getNaoLidasCount(userId) {
    const { count } = await supabase
      .from('notificacoes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('lida', false);
    return count || 0;
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
