// ============================================================
// ADMINISTRAÇÃO — gestão de usuários (aprovar, alterar papel)
// ============================================================

async function listarUsuariosPendentes() {
  const { data, error } = await supabaseClient.rpc("listar_usuarios_pendentes");
  return { data: data || [], error };
}

async function listarTodosUsuarios() {
  const { data, error } = await supabaseClient.rpc("listar_todos_usuarios");
  return { data: data || [], error };
}

async function alterarPapelUsuario(userId, novoPapel) {
  const { data, error } = await supabaseClient.rpc("alterar_papel_usuario", {
    p_user_id: userId,
    p_novo_papel: novoPapel
  });
  return { data, error };
}

const PAPEL_LABEL = {
  pendente: "Pendente",
  coordenacao: "Coordenação de Curso",
  chefia: "Chefia do Departamento de Ensino",
  admin: "Administrador"
};
