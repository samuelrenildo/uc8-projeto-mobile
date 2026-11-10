import * as SQLite from 'expo-sqlite';

export async function abrirBancoDados() {
  const db = await SQLite.openDatabaseAsync('biblioteca.db');
  return db;
}

export async function inicializarBanco() {
  const db = await abrirBancoDados();
  
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    create table if not exists leitores (
      id integer primary key autoincrement,
      nome text not null,
      matricula text unique not null,
      telefone text
    );

    create table if not exists autores (
      id integer primary key autoincrement,
      nome text not null unique
    );

    create table if not exists livros (
      id integer primary key autoincrement,
      titulo text not null,
      autor text not null,
      isbn text unique,
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
  
  console.log('Base de dados e tabelas inicializadas com sucesso.');
}