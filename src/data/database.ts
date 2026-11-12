import * as SQLite from 'expo-sqlite';

let bancoAberto: Promise<SQLite.SQLiteDatabase> | undefined;

export function abrirBancoDados(): Promise<SQLite.SQLiteDatabase> {
  if (bancoAberto === undefined) {
    bancoAberto = SQLite.openDatabaseAsync('biblioteca.db').catch((erro: unknown) => {
      bancoAberto = undefined;
      throw erro;
    });
  }
  return bancoAberto;
}

async function garantirColuna(db: SQLite.SQLiteDatabase, tabela: string, coluna: string, definicao: string): Promise<void> {
  const colunas = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tabela});`);
  if (!colunas.some((c) => c.name === coluna)) {
    await db.execAsync(`ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao};`);
  }
}

export async function inicializarBanco(): Promise<void> {
  const db = await abrirBancoDados();

  await db.execAsync(`
    PRAGMA foreign_keys = OFF;

    create table if not exists leitores (
      id integer primary key autoincrement,
      nome text not null,
      matricula text unique not null,
      telefone text,
      email text
    );

    create table if not exists autores (
      id integer primary key autoincrement,
      nome text not null unique
    );

    create table if not exists livros (
      id integer primary key autoincrement,
      titulo text not null,
      autor text,
      isbn text,
      exemplares integer default 1,
      id_autor integer,
      foreign key (id_autor) references autores(id)
    );

    create table if not exists emprestimos (
      id integer primary key autoincrement,
      id_livro integer,
      id_leitor integer,
      data_emprestimo text not null default (date('now')),
      data_devolucao_real text,
      foreign key (id_livro) references livros(id),
      foreign key (id_leitor) references leitores(id)
    );
  `);

  await garantirColuna(db, 'leitores', 'matricula', 'text');
  await garantirColuna(db, 'leitores', 'telefone', 'text');
  await garantirColuna(db, 'leitores', 'email', 'text');
  await garantirColuna(db, 'livros', 'isbn', 'text');
  await garantirColuna(db, 'livros', 'exemplares', 'integer default 1');
}
