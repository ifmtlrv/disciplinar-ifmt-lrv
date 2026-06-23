// ============================================================
// DADOS — leitura e gravação de ocorrências no Supabase
// ============================================================

async function registrarOcorrencia({ nomeDiscente, matricula, curso, dataFalta, inciso, descricao, menorIdade }) {
  const info = incisoInfo(inciso);
  const nivel = info[2];

  const { data, error } = await supabaseClient.from("ocorrencias").insert([
    {
      nome_discente: nomeDiscente,
      matricula,
      curso,
      data_falta: dataFalta,
      inciso,
      nivel,
      descricao,
      registrado_por: usuarioAtual ? usuarioAtual.id : null,
      registrado_por_nome: usuarioAtual ? usuarioAtual.nome_completo : null,
      menor_idade: menorIdade
    }
  ]);

  return { data, error, nivel };
}

async function listarTodasOcorrencias() {
  const { data, error } = await supabaseClient
    .from("ocorrencias")
    .select("*")
    .order("data_falta", { ascending: true });
  return { data: data || [], error };
}

async function listarOcorrenciasPorMatricula(matricula) {
  const { data, error } = await supabaseClient
    .from("ocorrencias")
    .select("*")
    .eq("matricula", matricula)
    .order("data_falta", { ascending: true });
  return { data: data || [], error };
}

function filtrarOcorrenciasPorTexto(ocorrencias, termo) {
  if (!termo || !termo.trim()) return ocorrencias;
  const alvo = termo.trim().toLowerCase();
  return ocorrencias.filter((o) =>
    [o.nome_discente, o.matricula, o.curso, o.inciso, o.descricao, o.registrado_por_nome]
      .filter(Boolean)
      .some((campo) => String(campo).toLowerCase().includes(alvo))
  );
}

async function editarOcorrencia(id, { nomeDiscente, matricula, curso, dataFalta, inciso, descricao, menorIdade }) {
  const info = incisoInfo(inciso);
  const { data, error } = await supabaseClient.rpc("editar_ocorrencia", {
    p_id: id,
    p_nome_discente: nomeDiscente,
    p_matricula: matricula,
    p_curso: curso,
    p_data_falta: dataFalta,
    p_inciso: inciso,
    p_nivel: info[2],
    p_descricao: descricao,
    p_menor_idade: menorIdade
  });
  return { data, error };
}

async function excluirOcorrencia(id) {
  const { data, error } = await supabaseClient.rpc("excluir_ocorrencia", { p_id: id });
  return { data, error };
}

function agruparPorDiscente(ocorrencias) {
  const mapa = new Map();
  ocorrencias.forEach((o) => {
    if (!mapa.has(o.matricula)) {
      mapa.set(o.matricula, { matricula: o.matricula, nome: o.nome_discente, curso: o.curso, ocorrencias: [] });
    }
    mapa.get(o.matricula).ocorrencias.push(o);
  });
  return [...mapa.values()];
}
