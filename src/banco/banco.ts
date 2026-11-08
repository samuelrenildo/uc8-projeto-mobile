import * as SQLite from 'expo-sqlite';
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

export async function listarLocal(): Promise<Livro[]> {
  const db = await banco();
  const linhas = await db.getAllAsync<LinhaLivro>(
    'SELECT id, titulo, autor, sinopse, exemplares FROM livros ORDER BY id',
  );
  return linhas.map(paraLivro);
}

export async function guardarLocal(livros: Livro[]): Promise<void> {
  const db = await banco();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM livros');
    for (const livro of livros) {
      await db.runAsync(
        'INSERT INTO livros (id, titulo, autor, sinopse, exemplares) VALUES (?, ?, ?, ?, ?)',
        [livro.id, livro.titulo, livro.autor, livro.sinopse ?? null, livro.exemplares],
      );
    }
  });
}

export async function contarLocal(): Promise<number> {
  const db = await banco();
  const linha = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM livros');
  return linha?.total ?? 0;
}

export async function listarPendentes(): Promise<Pendente[]> {
  const db = await banco();
  return db.getAllAsync<Pendente>('SELECT id, titulo, autor, exemplares FROM pendentes ORDER BY id');
}

export async function guardarPendente(dados: DadosNovoLivro): Promise<Pendente> {
  const db = await banco();
  const resultado = await db.runAsync(
    'INSERT INTO pendentes (titulo, autor, exemplares) VALUES (?, ?, ?)',
    [dados.titulo, dados.autor, dados.exemplares],
  );
  return { id: resultado.lastInsertRowId, ...dados };
}

export async function removerPendente(id: number): Promise<void> {
  const db = await banco();
  await db.runAsync('DELETE FROM pendentes WHERE id = ?', [id]);
}