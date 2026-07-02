-- ============================================================
-- ADICIONAR: "último acesso" na listagem de usuários (admin)
-- Substitui listar_todos_usuarios() para trazer também
-- last_sign_in_at de auth.users, junto com cada perfil.
-- Cole no SQL Editor do Supabase e clique em "Run"
-- ============================================================

-- Precisa apagar a função antiga antes, pois o tipo de retorno muda
-- (de "setof public.perfis" para uma tabela com coluna extra)
drop function if exists public.listar_todos_usuarios();

create or replace function public.listar_todos_usuarios()
returns table (
  id uuid,
  nome_completo text,
  email text,
  papel text,
  curso_responsavel text,
  criado_em timestamptz,
  ultimo_acesso timestamptz
)
language sql
security definer
as $$
  select
    p.id,
    p.nome_completo,
    p.email,
    p.papel,
    p.curso_responsavel,
    p.criado_em,
    u.last_sign_in_at as ultimo_acesso
  from public.perfis p
  left join auth.users u on u.id = p.id
  where public.eh_admin()
  order by p.criado_em asc;
$$;

grant execute on function public.listar_todos_usuarios() to authenticated;
