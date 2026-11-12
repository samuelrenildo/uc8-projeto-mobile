import { abrirBancoDados } from './database';

export interface LeitorBD {
  id: number;
  nome: string;
  matricula: string;
  telefone?: string;
  email?: string;
}

export interface LivroBD {
  id: number;
  titulo: string;
  autor?: string;
  nome_autor?: string;
  isbn?: string;
  exemplares: number;
}

export interface EmprestimoBD {
  id: number;
  id_livro: number;
  id_leitor: number;
  data_emprestimo: string;
  data_devolucao_real?: string;
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
  `);

  
  try {
    await db.execAsync(`ALTER TABLE leitores ADD COLUMN telefone TEXT;`);
  } catch {
  }

  try {
    await db.execAsync(`ALTER TABLE leitores ADD COLUMN email TEXT;`);
  } catch {
  }

  
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


export async function listarLivros(): Promise<LivroBD[]> {
  const db = await abrirBancoDados();
  return await db.getAllAsync<LivroBD>('SELECT * FROM livros;');
}

export async function inserirLivro(novoLivro: { titulo: string; autor?: string; isbn?: string; exemplares: number }): Promise<void> {
  const db = await abrirBancoDados();
  await db.runAsync(
    'INSERT INTO livros (titulo, autor, isbn, exemplares) VALUES (?, ?, ?, ?);',
    [novoLivro.titulo, novoLivro.autor?.trim() || null, novoLivro.isbn ?? null, novoLivro.exemplares]
  );
}

export async function obterLivroPorId(idLivro: number): Promise<LivroBD | null> {
  const db = await abrirBancoDados();
  const livro = await db.getFirstAsync<LivroBD>(
    'SELECT id, titulo, autor, isbn, exemplares FROM livros WHERE id = ?;',
    [idLivro]
  );
  return livro ?? null;
}

export async function atualizarAutorLivro(idLivro: number, novoAutor: string): Promise<void> {
  const db = await abrirBancoDados();
  await db.runAsync(
    'UPDATE livros SET autor = ? WHERE id = ?;',
    [novoAutor, idLivro]
  );
}

export async function buscarLivrosPorTermo(termo: string): Promise<LivroBD[]> {
  const db = await abrirBancoDados();
  const consulta = `%${termo}%`;
  return await db.getAllAsync<LivroBD>(
    'SELECT * FROM livros WHERE titulo LIKE ? OR autor LIKE ?;',
    [consulta, consulta]
  );
}


export async function emprestarLivro(idLivro: number, idLeitor: number): Promise<void> {
  const db = await abrirBancoDados();

  const livro = await db.getFirstAsync<LivroBD>('SELECT * FROM livros WHERE id = ?;', [idLivro]);

  if (!livro) {
    throw new Error('Livro não encontrado.');
  }

  if (livro.exemplares <= 0) {
    throw new Error('Sem exemplares disponíveis para empréstimo.');
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO emprestimos (id_livro, id_leitor) VALUES (?, ?);',
      [idLivro, idLeitor]
    );

    await db.runAsync(
      'UPDATE livros SET exemplares = exemplares - 1 WHERE id = ?;',
      [idLivro]
    );
  });
}

export async function devolverEmprestimoPorLivro(idLivro: number): Promise<void> {
  const db = await abrirBancoDados();

  const emprestimoAtivo = await db.getFirstAsync<EmprestimoBD>(
    'SELECT * FROM emprestimos WHERE id_livro = ? AND data_devolucao_real IS NULL ORDER BY id ASC LIMIT 1;',
    [idLivro]
  );

  if (!emprestimoAtivo) {
    throw new Error('Não existe nenhum empréstimo ativo pendente de devolução para este livro.');
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "UPDATE emprestimos SET data_devolucao_real = date('now') WHERE id = ?;",
      [emprestimoAtivo.id]
    );

    await db.runAsync(
      'UPDATE livros SET exemplares = exemplares + 1 WHERE id = ?;',
      [idLivro]
    );
  });
}

export async function excluirLivro(idLivro: number): Promise<void> {
  const db = await abrirBancoDados();

  const emprestimoAtivo = await db.getFirstAsync<EmprestimoBD>(
    'SELECT * FROM emprestimos WHERE id_livro = ? AND data_devolucao_real IS NULL;',
    [idLivro]
  );

  if (emprestimoAtivo) {
    throw new Error('Não é possível excluir este livro pois ele possui empréstimos ativos pendentes de devolução.');
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM emprestimos WHERE id_livro = ?;', [idLivro]);
    await db.runAsync('DELETE FROM livros WHERE id = ?;', [idLivro]);
  });
}

export async function excluirLeitor(idLeitor: number): Promise<void> {
  const db = await abrirBancoDados();

  const emprestimoAtivo = await db.getFirstAsync<EmprestimoBD>(
    'SELECT * FROM emprestimos WHERE id_leitor = ? AND data_devolucao_real IS NULL;',
    [idLeitor]
  );

  if (emprestimoAtivo) {
    throw new Error('Não é possível excluir este leitor pois ele possui empréstimos ativos pendentes de devolução.');
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE emprestimos SET id_leitor = NULL WHERE id_leitor = ?;', [idLeitor]);
    await db.runAsync('DELETE FROM leitores WHERE id = ?;', [idLeitor]);
  });
}