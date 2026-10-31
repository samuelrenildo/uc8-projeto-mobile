import * as SQLite from 'expo-sqlite';
import type { Livro } from '../types/entidades';
import type { DadosNovoLivro } from './acervo';

interface LinhaLivro {
  id: number;
  titulo: string;
  autor: string;
  sinopse: string | null;
  exemplares: number;
}

interface LinhaFila {
  id_fila: number;
  titulo: string;
  autor: string;
  exemplares: number;
}

export interface ItemDaFila extends DadosNovoLivro {
  idFila: number;
}

let conexao: Promise<SQLite.SQLiteDatabase> | undefined;

function abrir(): Promise<SQLite.SQLiteDatabase> {
  if (conexao === undefined) {
    conexao = (async () => {
      const banco = await SQLite.openDatabaseAsync('acervo.db');
      await banco.execAsync(`
        create table if not exists livros_guardados (
          id integer primary key,
          titulo text not null,
          autor text not null,
          sinopse text,
          exemplares integer not null
        );
        create table if not exists fila_de_envio (
          id_fila integer primary key autoincrement,
          titulo text not null,
          autor text not null,
          exemplares integer not null
        );
      `);
      return banco;
    })();
  }
  return conexao;
}

function paraLivro(linha: LinhaLivro): Livro {
  return {
    id: linha.id,
    titulo: linha.titulo,
    autor: linha.autor,
    exemplares: linha.exemplares,
    sinopse: linha.sinopse ?? undefined,
  };
}

export async function guardarLivros(livros: Livro[]): Promise<void> {
  const banco = await abrir();
  await banco.withTransactionAsync(async () => {
    await banco.runAsync('delete from livros_guardados');
    for (const livro of livros) {
      await banco.runAsync(
        'insert into livros_guardados (id, titulo, autor, sinopse, exemplares) values (?, ?, ?, ?, ?)',
        livro.id,
        livro.titulo,
        livro.autor,
        livro.sinopse ?? null,
        livro.exemplares,
      );
    }
  });
}

export async function guardarLivro(livro: Livro): Promise<void> {
  const banco = await abrir();
  await banco.runAsync(
    'insert or replace into livros_guardados (id, titulo, autor, sinopse, exemplares) values (?, ?, ?, ?, ?)',
    livro.id,
    livro.titulo,
    livro.autor,
    livro.sinopse ?? null,
    livro.exemplares,
  );
}

export async function lerLivrosGuardados(): Promise<Livro[]> {
  const banco = await abrir();
  const linhas = await banco.getAllAsync<LinhaLivro>(
    'select id, titulo, autor, sinopse, exemplares from livros_guardados order by id',
  );
  return linhas.map(paraLivro);
}

export async function enfileirar(dados: DadosNovoLivro): Promise<ItemDaFila> {
  const banco = await abrir();
  const resultado = await banco.runAsync(
    'insert into fila_de_envio (titulo, autor, exemplares) values (?, ?, ?)',
    dados.titulo,
    dados.autor,
    dados.exemplares,
  );
  return { idFila: resultado.lastInsertRowId, ...dados };
}

export async function lerFila(): Promise<ItemDaFila[]> {
  const banco = await abrir();
  const linhas = await banco.getAllAsync<LinhaFila>(
    'select id_fila, titulo, autor, exemplares from fila_de_envio order by id_fila',
  );
  return linhas.map((linha) => ({
    idFila: linha.id_fila,
    titulo: linha.titulo,
    autor: linha.autor,
    exemplares: linha.exemplares,
  }));
}

export async function removerDaFila(idFila: number): Promise<void> {
  const banco = await abrir();
  await banco.runAsync('delete from fila_de_envio where id_fila = ?', idFila);
}