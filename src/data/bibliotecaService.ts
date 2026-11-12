import { abrirBancoDados } from './database';
import type { Livro } from '../types/entidades';

export interface LeitorBD {
  id: number;
  nome: string;
  matricula: string;
  telefone?: string;
  email?: string;
}

interface AjusteLivro {
  id_livro: number;
  autor: string | null;
  excluido: number;
}

export async function inicializarTabelasExtras(): Promise<void> {
  const db = await abrirBancoDados();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS leitores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      matricula TEXT NOT NULL UNIQUE,
      telefone TEXT,
      email TEXT
    );
    CREATE TABLE IF NOT EXISTS ajustes_livros (
      id_livro INTEGER PRIMARY KEY NOT NULL,
      autor TEXT,
      excluido INTEGER NOT NULL DEFAULT 0
    );
  `);
}

export async function cadastrarLeitor(novoLeitor: { nome: string; matricula: string; telefone?: string; email?: string }): Promise<void> {
  const db = await abrirBancoDados();
  await db.runAsync(
    'INSERT INTO leitores (nome, matricula, telefone, email) VALUES (?, ?, ?, ?);',
    [novoLeitor.nome, novoLeitor.matricula, novoLeitor.telefone ?? null, novoLeitor.email ?? null]
  );
}

export async function listarLeitores(): Promise<LeitorBD[]> {
  const db = await abrirBancoDados();
  return await db.getAllAsync<LeitorBD>('SELECT * FROM leitores;');
}

async function emprestimosAbertosPorLivro(): Promise<Map<number, number>> {
  const db = await abrirBancoDados();
  const linhas = await db.getAllAsync<{ id_livro: number; total: number }>(
    'SELECT id_livro, COUNT(*) AS total FROM emprestimos WHERE data_devolucao_real IS NULL GROUP BY id_livro;'
  );
  return new Map(linhas.map((linha) => [linha.id_livro, linha.total] as [number, number]));
}

async function ajustesDosLivros(): Promise<Map<number, AjusteLivro>> {
  const db = await abrirBancoDados();
  const linhas = await db.getAllAsync<AjusteLivro>('SELECT id_livro, autor, excluido FROM ajustes_livros;');
  return new Map(linhas.map((linha) => [linha.id_livro, linha] as [number, AjusteLivro]));
}

export async function montarAcervo(base: Livro[]): Promise<Livro[]> {
  const [ajustes, abertos] = await Promise.all([ajustesDosLivros(), emprestimosAbertosPorLivro()]);
  return base
    .filter((livro) => ajustes.get(livro.id)?.excluido !== 1)
    .map((livro) => ({
      ...livro,
      autor: ajustes.get(livro.id)?.autor ?? livro.autor,
      exemplares: Math.max(0, livro.exemplares - (abertos.get(livro.id) ?? 0)),
    }));
}

async function emprestimoAtivo(idLivro: number): Promise<{ id: number } | null> {
  const db = await abrirBancoDados();
  const linha = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM emprestimos WHERE id_livro = ? AND data_devolucao_real IS NULL ORDER BY id ASC LIMIT 1;',
    [idLivro]
  );
  return linha ?? null;
}

export async function registrarEmprestimo(idLivro: number, idLeitor: number): Promise<void> {
  const db = await abrirBancoDados();
  await db.runAsync('INSERT INTO emprestimos (id_livro, id_leitor) VALUES (?, ?);', [idLivro, idLeitor]);
}

export async function registrarDevolucao(idLivro: number): Promise<void> {
  const ativo = await emprestimoAtivo(idLivro);
  if (ativo === null) {
    throw new Error('Não existe nenhum empréstimo ativo pendente de devolução para este livro.');
  }
  const db = await abrirBancoDados();
  await db.runAsync("UPDATE emprestimos SET data_devolucao_real = date('now') WHERE id = ?;", [ativo.id]);
}

export async function atualizarAutorLivro(idLivro: number, novoAutor: string): Promise<void> {
  const db = await abrirBancoDados();
  await db.runAsync(
    'INSERT INTO ajustes_livros (id_livro, autor, excluido) VALUES (?, ?, 0) ON CONFLICT(id_livro) DO UPDATE SET autor = excluded.autor;',
    [idLivro, novoAutor]
  );
}

export async function excluirLivro(idLivro: number): Promise<void> {
  const ativo = await emprestimoAtivo(idLivro);
  if (ativo !== null) {
    throw new Error('Não é possível excluir este livro pois ele possui empréstimos ativos pendentes de devolução.');
  }
  const db = await abrirBancoDados();
  await db.runAsync(
    'INSERT INTO ajustes_livros (id_livro, autor, excluido) VALUES (?, NULL, 1) ON CONFLICT(id_livro) DO UPDATE SET excluido = 1;',
    [idLivro]
  );
}

export async function excluirLeitor(idLeitor: number): Promise<void> {
  const db = await abrirBancoDados();

  const emprestimoAtivoDoLeitor = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM emprestimos WHERE id_leitor = ? AND data_devolucao_real IS NULL;',
    [idLeitor]
  );

  if (emprestimoAtivoDoLeitor) {
    throw new Error('Não é possível excluir este leitor pois ele possui empréstimos ativos pendentes de devolução.');
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE emprestimos SET id_leitor = NULL WHERE id_leitor = ?;', [idLeitor]);
    await db.runAsync('DELETE FROM leitores WHERE id = ?;', [idLeitor]);
  });
}
