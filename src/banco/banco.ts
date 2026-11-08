import * as SQLite from 'expo-sqlite';
import { ErroDoBanco } from '../erros/erros';
import type { DadosNovoLivro } from '../servicos/acervo';
import type { Livro } from '../types/entidades';

export interface Pendente extends DadosNovoLivro {
  id: number;
}

interface LinhaLivro {
  id: number;
  titulo: string;
  autor: string;
  sinopse: string | null;
  exemplares: number;
}

let bancoAberto: Promise<SQLite.SQLiteDatabase> | undefined;

function banco(): Promise<SQLite.SQLiteDatabase> {
  if (bancoAberto === undefined) {
    bancoAberto = SQLite.openDatabaseAsync('acervo.db').then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS livros (
          id INTEGER PRIMARY KEY NOT NULL,
          titulo TEXT NOT NULL,
          autor TEXT NOT NULL,
          sinopse TEXT,
          exemplares INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS pendentes (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          titulo TEXT NOT NULL,
          autor TEXT NOT NULL,
          exemplares INTEGER NOT NULL
        );
      `);
      return db;
    });
  }
  return bancoAberto;
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

async function noBanco<T>(operacao: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
  try {
    const db = await banco();
    return await operacao(db);
  } catch (erro: unknown) {
    throw new ErroDoBanco(erro instanceof Error ? erro.message : String(erro));
  }
}

export function listarLocal(): Promise<Livro[]> {
  return noBanco(async (db) => {
    const linhas = await db.getAllAsync<LinhaLivro>('SELECT id, titulo, autor, sinopse, exemplares FROM livros ORDER BY id');
    return linhas.map(paraLivro);
  });
}

export function guardarLocal(livros: Livro[]): Promise<void> {
  return noBanco((db) =>
    db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM livros');
      for (const livro of livros) {
        await db.runAsync('INSERT INTO livros (id, titulo, autor, sinopse, exemplares) VALUES (?, ?, ?, ?, ?)', [
          livro.id,
          livro.titulo,
          livro.autor,
          livro.sinopse ?? null,
          livro.exemplares,
        ]);
      }
    }),
  );
}

export function contarLocal(): Promise<number> {
  return noBanco(async (db) => {
    const linha = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM livros');
    return linha?.total ?? 0;
  });
}

export function listarPendentes(): Promise<Pendente[]> {
  return noBanco((db) => db.getAllAsync<Pendente>('SELECT id, titulo, autor, exemplares FROM pendentes ORDER BY id'));
}

export function guardarPendente(dados: DadosNovoLivro): Promise<Pendente> {
  return noBanco(async (db) => {
    const resultado = await db.runAsync('INSERT INTO pendentes (titulo, autor, exemplares) VALUES (?, ?, ?)', [
      dados.titulo,
      dados.autor,
      dados.exemplares,
    ]);
    return { id: resultado.lastInsertRowId, ...dados };
  });
}

export function removerPendente(id: number): Promise<void> {
  return noBanco(async (db) => {
    await db.runAsync('DELETE FROM pendentes WHERE id = ?', [id]);
  });
}
