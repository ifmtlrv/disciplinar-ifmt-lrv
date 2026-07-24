// ============================================================
// AUTENTICAÇÃO — login, cadastro, sessão e papel do usuário
// ============================================================

let usuarioAtual = null; // { id, email, nome_completo, papel, curso_responsavel }

// ------------------------------------------------------------
// Controle de sessão por inatividade
// (o plano Free do Supabase não permite configurar isso pelo
// painel, então fazemos o controle aqui no próprio app)
// ------------------------------------------------------------
const INATIVIDADE_LIMITE_MS = 24 * 60 * 60 * 1000; // 24 horas
const CHAVE_ULTIMA_ATIVIDADE = "scdd_ultima_atividade";
let timerInatividade = null;

function registrarAtividade() {
  localStorage.setItem(CHAVE_ULTIMA_ATIVIDADE, String(Date.now()));
}

function tempoDesdeUltimaAtividade() {
  const registrado = Number(localStorage.getItem(CHAVE_ULTIMA_ATIVIDADE));
  if (!registrado) return 0;
  return Date.now() - registrado;
}

async function encerrarPorInatividade() {
  pararMonitorInatividade();
  localStorage.removeItem(CHAVE_ULTIMA_ATIVIDADE);
  await supabaseClient.auth.signOut();
  usuarioAtual = null;
  alert("Sua sessão expirou por inatividade. Faça login novamente.");
  location.reload();
}

function iniciarMonitorInatividade() {
  registrarAtividade();

  ["click", "keydown", "mousemove", "scroll", "touchstart"].forEach((evento) => {
    document.addEventListener(evento, registrarAtividade, { passive: true });
  });

  if (timerInatividade) clearInterval(timerInatividade);
  timerInatividade = setInterval(() => {
    if (tempoDesdeUltimaAtividade() >= INATIVIDADE_LIMITE_MS) {
      encerrarPorInatividade();
    }
  }, 60 * 1000); // verifica a cada 1 minuto
}

function pararMonitorInatividade() {
  if (timerInatividade) {
    clearInterval(timerInatividade);
    timerInatividade = null;
  }
}

async function cadastrar(email, senha, nomeCompleto) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome_completo: nomeCompleto },
      emailRedirectTo: window.location.origin + window.location.pathname
    }
  });
  return { data, error };
}

async function entrar(email, senha) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });
  return { data, error };
}

async function sair() {
  pararMonitorInatividade();
  localStorage.removeItem(CHAVE_ULTIMA_ATIVIDADE);
  await supabaseClient.auth.signOut();
  usuarioAtual = null;
  location.reload();
}

async function carregarPerfilAtual() {
  const { data: sessao } = await supabaseClient.auth.getSession();
  if (!sessao.session) return null;

  // Se já passou do limite de inatividade desde a última vez que o
  // sistema foi usado neste navegador, encerra a sessão antes de
  // carregar qualquer dado.
  if (tempoDesdeUltimaAtividade() >= INATIVIDADE_LIMITE_MS && localStorage.getItem(CHAVE_ULTIMA_ATIVIDADE)) {
    await encerrarPorInatividade();
    return null;
  }

  const userId = sessao.session.user.id;
  const { data: perfil, error } = await supabaseClient
    .from("perfis")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Erro ao carregar perfil:", error);
    return null;
  }

  usuarioAtual = perfil;
  iniciarMonitorInatividade();
  return perfil;
}

function detectarFluxoDefinirSenha() {
  // O Supabase pode entregar essa informação de duas formas, dependendo
  // do fluxo configurado no projeto:
  // 1) Fluxo implícito (mais antigo): parâmetros depois de # na URL
  //    ex: #access_token=...&type=recovery
  // 2) Fluxo PKCE (mais novo/padrão): query string com "type" e "code"
  //    ex: ?type=recovery&code=...
  const hash = window.location.hash || "";
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
  const tipoHash = hashParams.get("type");

  const queryParams = new URLSearchParams(window.location.search || "");
  const tipoQuery = queryParams.get("type");

  return tipoHash === "recovery" || tipoHash === "invite" || tipoQuery === "recovery" || tipoQuery === "invite";
}

async function definirNovaSenha(novaSenha) {
  const { data, error } = await supabaseClient.auth.updateUser({ password: novaSenha });
  return { data, error };
}

async function enviarRecuperacaoSenha(email) {
  const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });
  return { data, error };
}
