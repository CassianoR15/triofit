// ============================================================
// src/lib/supabase.js
// Cliente Supabase + camada DB que substitui localStorage
// ============================================================
import { createClient } from '@supabase/supabase-js';

// Coloque suas credenciais aqui (ou em .env)
// VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vboknerswhvpheuymakx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Siq1yMjOXBGxy88xPRyE_Q_LuvKd0FE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'triofit_auth',
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
    try {
      // Normaliza email
      const emailNorm = (email||'').trim().toLowerCase();
      const nomeNorm = (nome||'').trim();

      const { data, error } = await supabase.auth.signUp({
        email: emailNorm,
        password: senha,
        options: {
          data: { nome: nomeNorm, role: role||'aluno' },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        const m = error.message || '';
        // Erros conhecidos → mensagem em português
        if (m.includes('User already registered') || m.includes('already been registered') || m.includes('already registered')) {
          return { ok: false, msg: 'Este email já está cadastrado. Clique em "Entrar".' };
        }
        if (m.includes('Password should be') || (m.includes('password') && m.includes('character'))) {
          return { ok: false, msg: 'Senha deve ter pelo menos 6 caracteres.' };
        }
        if (m.includes('signup') && m.includes('disabled') || m.includes('Signup is disabled')) {
          return { ok: false, msg: 'Cadastro desabilitado. Entre em contato com o suporte.' };
        }
        if (m.includes('rate limit') || m.includes('too many requests')) {
          return { ok: false, msg: 'Muitas tentativas. Aguarde alguns minutos.' };
        }
        // Retorna mensagem original do Supabase - não filtramos "invalid" pois captura erros legítimos
        return { ok: false, msg: m };
      }

      // Email confirmação ativa → user é null até confirmar
      // OR email confirmation disabled → user is created immediately
      if (!data?.user?.id) {
        return { ok: true, user: null, needsConfirmation: true };
      }
      // If user exists (no email confirmation), create profile
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          nome: nomeNorm,
          role: role||'aluno',
          criado_em: new Date().toISOString(),
        }, { onConflict: 'id', ignoreDuplicates: false });
      } catch {}

      // Create profile record immediately after signup
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          nome: nomeNorm,
          role: role||'aluno',
          criado_em: new Date().toISOString(),
        }, { onConflict: 'id', ignoreDuplicates: false });
      } catch(profileErr) {
        console.warn('Profile creation warning:', profileErr);
      }
      return { ok: true, user: await this._formatUser(data.user) };
    } catch(e) {
      return { ok: false, msg: 'Erro de conexão. Verifique sua internet e tente novamente.' };
    }
  },

  _loginAttempts: new Map(),
  async _warmup() {
    // Ping Supabase to wake up from cold start (free tier sleeps after inactivity)
    if(this._warmedUp) return;
    if(this._warmingUp) return; // prevent duplicate calls
    this._warmingUp = true;
    try {
      await supabase.auth.getSession(); // lightweight session check
      this._warmedUp = true;
    } catch(e) {
      // ignore warmup errors
    } finally {
      this._warmingUp = false;
    }
  },

  async login(email, senha) {
    // Rate limiting: máx 5 tentativas por 2 minutos
    const key = email.toLowerCase().trim();
    const now = Date.now();
    const attempts = this._loginAttempts.get(key) || [];
    const recent = attempts.filter(t => now - t < 120000); // 2 min window
    if (recent.length >= 5) {
      const wait = Math.ceil((120000 - (now - recent[0])) / 1000);
      return { ok: false, msg: `Muitas tentativas. Aguarde ${wait} segundos.` };
    }
    this._loginAttempts.set(key, [...recent, now]);

    try {
    // Wake up Supabase first (free tier cold start can take 30-60s)
    await this._warmup();
    // Login with 25s timeout
    const signInPromise = supabase.auth.signInWithPassword({
      email: (email||'').trim().toLowerCase(),
      password: senha,
    });
    const timeoutPromise = new Promise((_,rej) =>
      setTimeout(()=>rej(new Error('O servidor demorou para responder. Tente novamente.')), 25000)
    );
    const { data, error } = await Promise.race([signInPromise, timeoutPromise]);
    if (!error) {
      this._loginAttempts.delete(key); // Limpa após sucesso
      return { ok: true, user: await this._formatUser(data.user) };
    }
    const m = error.message || '';
    if (m.includes('Email not confirmed')) return { ok: false, msg: 'Confirme seu email antes de entrar.' };
    if (m.includes('Invalid login credentials') || m.includes('invalid_credentials')) return { ok: false, msg: 'Email ou senha incorretos.' };
    return { ok: false, msg: 'Email ou senha incorretos.' };
    } catch(e) {
      return { ok: false, msg: 'Erro de conexão. Verifique sua internet.' };
    }
  },

  async logout() {
    await supabase.auth.signOut();
    if(this._dc2)this._dc2.clear();
    if(this._ac)this._ac.clear();
    if(this._loginAttempts)this._loginAttempts.clear();
  },

  async getSession() {
    try {
      const timeout = new Promise((_,r) => setTimeout(() => r(new Error('timeout')), 4000));
      const sessionPromise = supabase.auth.getSession();
      const { data } = await Promise.race([sessionPromise, timeout]);
      if (!data?.session?.user) return null;
      return this._formatUser(data.session.user);
    } catch {
      return null;
    }
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
    // Busca perfil com timeout de 2s — se demorar usa user_metadata
    let profile = null;
    for(let attempt=0;attempt<2;attempt++){
      try{
        const {data,error}=await supabase.from('profiles')
          .select('nome, role, codigo, objetivo, criado_em')
          .eq('id',supaUser.id).maybeSingle();
        if(!error&&data){profile=data;break;}
        if(attempt<1)await new Promise(r=>setTimeout(r,200));
      }catch{if(attempt<1)await new Promise(r=>setTimeout(r,200));}
    }
    return {
      id: supaUser.id,
      email: supaUser.email,
      criadoEm: profile?.criado_em || supaUser.created_at || new Date().toISOString(),
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
    // Demo mode
    if(alunoId && alunoId.startsWith('demo-')){
      try{
        const stored=localStorage.getItem('demo_vinculo_'+alunoId);
        if(stored)return JSON.parse(stored);
      }catch{}
      return {
        treinadorId:'912f14e0-b9a2-4302-b44c-ed21e93ccb21',
        nutriId:'66548955-e95c-492c-9b59-931171ff781e',
        treinador:{id:'912f14e0-b9a2-4302-b44c-ed21e93ccb21',nome:'Treinador Demo',email:'treinador@demo.com',role:'treinador'},
        nutri:{id:'66548955-e95c-492c-9b59-931171ff781e',nome:'Nutricionista Demo',email:'nutri@demo.com',role:'nutri'},
      };
    }
    try {
    const { data, error } = await supabase
      .from('vinculos')
      .select('treinador_id, nutri_id')
      .eq('aluno_id', alunoId)
      .maybeSingle();
    if (error) console.warn('getVinculoAluno error:', error.message);
    if (!data){
      // Fallback: try demo accounts by email
      try {
        const { data: sess } = await supabase.auth.getSession();
        if(sess?.session?.user?.email === 'aluno@demo.com'){
          const { data: tr } = await supabase.from('profiles').select('id').eq('codigo','DCD3F5').maybeSingle();
          const { data: nu } = await supabase.from('profiles').select('id').eq('codigo','373CBD').maybeSingle();
          if(tr||nu) return { treinadorId: tr?.id||null, nutriId: nu?.id||null };
        }
      } catch {}
      return null;
    }
    return { treinadorId: data.treinador_id, nutriId: data.nutri_id };
    } catch(e) { return null; }
  },

  async setVinculoAluno(alunoId, treinadorId, nutriId) {
    // Demo mode
    if((alunoId||'').startsWith('demo-')){
      try{
        const vinculo={treinadorId,nutriId};
        if(treinadorId){vinculo.treinador={id:treinadorId,nome:'Treinador Demo',email:'treinador@demo.com',role:'treinador',codigo:'DCD3F5'};}
        if(nutriId){vinculo.nutri={id:nutriId,nome:'Nutricionista Demo',email:'nutri@demo.com',role:'nutri',codigo:'373CBD'};}
        localStorage.setItem('demo_vinculo_'+alunoId,JSON.stringify(vinculo));
      }catch{}
      return Promise.resolve();
    }
    return supabase
      .from('vinculos')
      .upsert(
        { aluno_id: alunoId, treinador_id: treinadorId || null, nutri_id: nutriId || null },
        { onConflict: 'aluno_id' }
      );
  },

  _ac: new Map(),
  async getAlunosDe(profId) {
    // Demo mode — check both 'demo-' prefix AND real demo UUIDs
    const _DEMO_PROF_IDS_GAD=['912f14e0-b9a2-4302-b44c-ed21e93ccb21','66548955-e95c-492c-9b59-931171ff781e'];
    if(profId && (profId.startsWith('demo-')||_DEMO_PROF_IDS_GAD.includes(profId))){
      try{
        const stored=localStorage.getItem('demo_alunos_'+profId)||localStorage.getItem('demo_pacientes_'+profId);
        if(stored)return JSON.parse(stored);
      }catch{}
      return [{id:'f4a2bce7-1706-4af2-8631-22df8e3a0d82',nome:'Aluno Demo',email:'aluno@demo.com',role:'aluno',bloqueado:false,objetivo:'hipertrofia'}];
    }
    // Check if this is a demo prof (by known IDs)
    const DEMO_PROF_IDS = ['912f14e0-b9a2-4302-b44c-ed21e93ccb21','66548955-e95c-492c-9b59-931171ff781e'];
    if(DEMO_PROF_IDS.includes(profId)){
      // Direct query on vinculos for demo prof
      try{
        const { data: vd } = await supabase
          .from('vinculos')
          .select('aluno_id')
          .or(`treinador_id.eq.${profId},nutri_id.eq.${profId}`);
        if(vd && vd.length > 0){
          const alunoIds = vd.map(v=>v.aluno_id);
          const { data: pd } = await supabase
            .from('profiles')
            .select('id,nome,role,codigo')
            .in('id', alunoIds);
          if(pd && pd.length > 0) return pd;
        }
      }catch(e){}
      // Hardcoded fallback
      return [{id:'f4a2bce7-1706-4af2-8631-22df8e3a0d82',nome:'Aluno Demo',email:'aluno@demo.com',role:'aluno',bloqueado:false}];
    }
    const c = this._ac.get(profId);
    if (c && Date.now() - c.ts < 30000) return c.d; // 30s cache
    const { data } = await supabase.rpc('get_alunos_do_prof', { prof_id: profId });
    const r = data || [];
    this._ac.set(profId, { d: r, ts: Date.now() });
        // Deduplicate by id
    const _seen=new Set();
    const _deduped=(data||[]).filter(a=>{if(_seen.has(a.id))return false;_seen.add(a.id);return true;});
    return _deduped;
  },

  // ----------------------------------------------------------
  // DADOS GENÉRICOS (substitui localStorage tf_KEY_UID)
  // ----------------------------------------------------------
  _dc2: new Map(),
  async getData(chave, userId) {
    if (!userId) return null;
    const k = userId + '|' + chave;
    const c = this._dc2.get(k);
    if (c && Date.now() - c.ts < 10000) // 10s return c.v;
    try {
      const { data, error } = await supabase
        .from('dados')
        .select('valor')
        .eq('user_id', userId)
        .eq('chave', chave)
        .maybeSingle();
      if (error) return null;
      const v = data?.valor ?? null;
      this._dc2.set(k, { v, ts: Date.now() });
      return v;
    } catch { return null; }
  },

  async setData(chave, userId, valor) {
    if(!userId)return;
    // Demo mode — save to localStorage
    if(userId.startsWith('demo-')){
      try{localStorage.setItem('demo_data_'+userId+'_'+chave,JSON.stringify(valor));}catch{}
      return;
    }
    const k = userId + '|' + chave;
    this._dc2 = this._dc2 || new Map();
    this._dc2.set(k, { v: valor, ts: Date.now() });
    await supabase.rpc('upsert_dado', {
      p_user_id: userId, p_chave: chave, p_valor: valor,
    });
  },

  // ----------------------------------------------------------
  // CHAT
  // ----------------------------------------------------------
  async getMensagens(meuId, outroId) {
    try {
    const { data } = await supabase
      .from('mensagens')
      .select('*')
      .or(`and(de_id.eq.${meuId},para_id.eq.${outroId}),and(de_id.eq.${outroId},para_id.eq.${meuId})`)
      .order('criado_em', { ascending: true })
      .limit(100);
    return data || [];
    } catch(e) { return []; }
  },

  async enviarMensagem(deId, paraId, texto) {
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .insert({ de_id: deId, para_id: paraId, texto })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch(e) {
      console.error('enviarMensagem error:', e);
      throw e;
    }
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
    try {
    const { data } = await supabase
      .from('mensagens')
      .select('de_id')
      .eq('para_id', meuId)
      .eq('lida', false);
    return data || [];
    } catch(e) { return []; }
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
    try {
      await supabase.from('notificacoes').insert({ user_id: userId, tipo, titulo, corpo });
    } catch(e) { console.error('criarNotificacao:', e); }
  },

  async getNotificacoes(userId) {
    try {
    const { data } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('user_id', userId)
      .order('criado_em', { ascending: false })
      .limit(20);
    return data || [];
    } catch(e) { return []; }
  },

  async marcarNotifLida(id) {
    try { await supabase.from('notificacoes').update({ lida: true }).eq('id', id); }
    catch(e) { console.error('marcarNotifLida:', e); }
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
  async cadastrarAluno({nome, sobrenome, email, telefone, genero, grupo, objetivo, senha, treinadorId, nutriId}) {
    try {
      // Warmup Supabase first (cold start prevention)
      await this._warmup();
      const emailLimpo=(email||'').trim().toLowerCase();
      const nomeFull=[nome,sobrenome].filter(Boolean).join(' ').trim();
      const emailRegex=/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if(!emailLimpo||!emailRegex.test(emailLimpo))return{ok:false,msg:'Email inválido. Ex: nome@gmail.com'};
      if(!nomeFull)return{ok:false,msg:'Nome obrigatório.'};
      if(!senha||senha.length<6)return{ok:false,msg:'Senha deve ter pelo menos 6 caracteres.'};
      // Create auth user
      const{data,error}=await supabase.auth.signUp({
        email:emailLimpo,password:senha,
        options:{data:{nome:nomeFull,role:'aluno'},emailRedirectTo:window.location.origin},
      });
      if(error){
        const m=error.message||'';
        if(m.includes('already registered')||m.includes('User already registered')||
           m.includes('already been registered')||m.includes('already exists'))
          return{ok:false,msg:'Este email já está cadastrado. Use um email diferente.'};
        if(m.includes('invalid email')||m.includes('valid email'))
          return{ok:false,msg:'Email inválido. Verifique o endereço digitado.'};
        if(m.includes('password')||m.includes('senha'))
          return{ok:false,msg:'Senha deve ter pelo menos 6 caracteres.'};
        return{ok:false,msg:m||'Erro ao cadastrar. Tente novamente.'};
      }
      const uid=data?.user?.id;
      const sessionExists=!!data?.session;
      
      // Se não tem uid ou não tem sessão → confirmação de email pendente
      // Retorna IMEDIATAMENTE sem tentar ops no banco que vão travar por RLS
      if(!uid||!sessionExists){
        return{ok:true,user:{email:emailLimpo,nome:nomeFull,id:uid},needsConfirmation:true};
      }
      
      // Só chega aqui se email confirmation está desabilitado no Supabase
      // Nesse caso temos sessão e podemos criar profile + vinculos
      try{
        await supabase.from('profiles').upsert(
          {id:uid,nome:nomeFull,role:'aluno',objetivo:objetivo||''},
          {onConflict:'id'}
        );
      }catch(e){console.warn('Profile upsert:',e?.message);}
      
      if(treinadorId||nutriId){
        const vd={aluno_id:uid};
        if(treinadorId)vd.treinador_id=treinadorId;
        if(nutriId)vd.nutri_id=nutriId;
        try{
          await supabase.from('vinculos').upsert(vd,{onConflict:'aluno_id'});
        }catch(e){console.warn('Vinculos upsert:',e?.message);}
      }
      return{ok:true,user:{id:uid,email:emailLimpo,nome:nomeFull},needsConfirmation:false};
    }catch(e){return{ok:false,msg:e.message||'Erro ao cadastrar aluno.'};}
  },

  async bloquearAluno(alunoId, bloqueado) {
    try{
      await supabase.from('profiles').update({bloqueado:!!bloqueado}).eq('id',alunoId);
      return{ok:true};
    }catch(e){return{ok:false,msg:e.message};}
  },


  async resetPassword(email) {
    try {
      const emailNorm = (email||'').trim().toLowerCase();
      if (!emailNorm || !emailNorm.includes('@')) {
        return { ok: false, msg: 'Digite um email válido.' };
      }
      const { error } = await supabase.auth.resetPasswordForEmail(emailNorm, {
        redirectTo: window.location.origin + '/?reset=true',
      });
      if (error) {
        const m = error.message || '';
        if (m.includes('rate limit') || m.includes('too many')) {
          return { ok: false, msg: 'Muitas tentativas. Aguarde alguns minutos.' };
        }
        return { ok: false, msg: m };
      }
      return { ok: true };
    } catch(e) {
      return { ok: false, msg: 'Erro de conexão. Tente novamente.' };
    }
  },

  async updatePassword(novaSenha) {
    try {
      if (!novaSenha || novaSenha.length < 6) {
        return { ok: false, msg: 'Senha deve ter pelo menos 6 caracteres.' };
      }
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) return { ok: false, msg: error.message };
      return { ok: true };
    } catch(e) {
      return { ok: false, msg: 'Erro ao atualizar senha.' };
    }
  },


};
