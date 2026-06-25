-- ============================================================
-- CORREÇÃO: função alterar_papel_usuario não reconhecia 'apoio'
-- (a constraint da tabela já foi corrigida antes; esta função
-- precisa da mesma correção, separadamente)
-- Cole no SQL Editor do Supabase e clique em "Run"
-- ============================================================

create or replace function public.alterar_papel_usuario(p_user_id uuid, p_novo_papel text)
returns jsonb
language plpgsql
security definer
as $$
begin
  if not public.eh_admin() then
    raise exception 'Apenas administradores podem alterar papéis de usuários.';
  end if;

  if p_novo_papel not in ('pendente', 'coordenacao', 'chefia', 'apoio', 'admin') then
    raise exception 'Papel inválido: %', p_novo_papel;
  end if;

  update public.perfis set papel = p_novo_papel where id = p_user_id;

  return jsonb_build_object('sucesso', true);
end;
$$;
