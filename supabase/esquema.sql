create table public.livros (
  id bigint generated always as identity primary key,
  titulo text not null,
  autor text not null,
  sinopse text,
  exemplares integer not null default 1,
  criado_em timestamptz not null default now()
);

alter table public.livros enable row level security;

create policy "leitura anonima" on public.livros for select to anon using (true);
create policy "inclusao anonima" on public.livros for insert to anon with check (true);

grant usage on schema public to anon;
grant select, insert on public.livros to anon;
grant usage, select on sequence public.livros_id_seq to anon;

insert into public.livros (titulo, autor, sinopse, exemplares) values
('O Alquimista', 'Paulo Coelho', 'Um pastor busca seu tesouro seguindo os sinais do destino.', 3),
('1984', 'George Orwell', null, 1),
('Dom Casmurro', 'Machado de Assis', null, 2);