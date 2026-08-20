create or replace function public.move_project_section(
  p_project_id uuid,
  p_section_id uuid,
  p_direction text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_current_order integer;
  v_target_id uuid;
  v_target_order integer;
begin
  if p_direction not in ('up', 'down') then
    raise exception
      using
        errcode = '22023',
        message = 'Invalid section move direction.';
  end if;

  /*
   * Lock section yang sedang
   * dipindahkan sampai transaksi
   * selesai.
   */
  select
    sort_order
  into
    v_current_order
  from
    public.project_sections
  where
    id = p_section_id
    and project_id = p_project_id
  for update;

  if not found then
    raise exception
      using
        errcode = 'P0002',
        message = 'Section not found.';
  end if;

  /*
   * Cari section tepat sebelum /
   * sesudah current section lalu
   * lock row tersebut juga.
   */
  if p_direction = 'up' then
    select
      id,
      sort_order
    into
      v_target_id,
      v_target_order
    from
      public.project_sections
    where
      project_id = p_project_id
      and sort_order < v_current_order
    order by
      sort_order desc,
      created_at desc,
      id desc
    limit 1
    for update;
  else
    select
      id,
      sort_order
    into
      v_target_id,
      v_target_order
    from
      public.project_sections
    where
      project_id = p_project_id
      and sort_order > v_current_order
    order by
      sort_order asc,
      created_at asc,
      id asc
    limit 1
    for update;
  end if;

  /*
   * Sudah berada di paling atas /
   * bawah. Tidak perlu melakukan
   * apa pun.
   */
  if v_target_id is null then
    return;
  end if;

  /*
   * Swap dua sort_order dalam satu
   * SQL statement.
   *
   * Seluruh function dijalankan
   * sebagai satu transaksi:
   * sukses semua atau rollback semua.
   */
  update
    public.project_sections
  set
    sort_order =
      case
        when id = p_section_id then
          v_target_order
        when id = v_target_id then
          v_current_order
        else
          sort_order
      end,
    updated_at = now()
  where
    project_id = p_project_id
    and id in (
      p_section_id,
      v_target_id
    );
end;
$$;

revoke all
on function public.move_project_section(
  uuid,
  uuid,
  text
)
from public;

revoke all
on function public.move_project_section(
  uuid,
  uuid,
  text
)
from anon;

grant execute
on function public.move_project_section(
  uuid,
  uuid,
  text
)
to authenticated;