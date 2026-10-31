import type { Livro, SituacaoEmprestimo } from '../types/entidades';

export interface DadosNovoLivro {
  titulo: string;
  autor: string;
  exemplares: number;
}

interface LivroRemoto {
  id: number;
  titulo: string;
  autor: string;
  sinopse: string | null;
  exemplares: number;
}

export class ErroDaApi extends Error {
  readonly status: number;
  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ErroDaApi';
    this.status = status;
  }
}

export function descreverErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Erro desconhecido';
}

function ehMensagemDeErro(valor: unknown): valor is { message: string } {
  return typeof valor === 'object' && valor != null && typeof (valor as Record<string, unknown>).message === 'string';
}

async function lerMensagemDeErro(resposta: Response): Promise<string> {
  const corpo: unknown = await resposta.json().catch(() => undefined);
  return ehMensagemDeErro(corpo) ? corpo.message : 'sem detalhe no corpo da resposta';
}

function configuracao(): { url: string; chave: string } {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const chave = process.env.EXPO_PUBLIC_SUPABASE_KEY;
  if (url === undefined || chave === undefined) {
    throw new Error('Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_KEY em .env.local');
  }
  return { url, chave };
}

function ehLivroRemoto(valor: unknown): valor is LivroRemoto {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const campos = valor as Record<string, unknown>;
  return (
    typeof campos.id === 'number' &&
    typeof campos.titulo === 'string' &&
    typeof campos.autor === 'string' &&
    typeof campos.exemplares === 'number' &&
    (campos.sinopse === null || typeof campos.sinopse === 'string')
  );
}

function ehListaDeLivros(valor: unknown): valor is LivroRemoto[] {
  return Array.isArray(valor) && valor.every(ehLivroRemoto);
}

function paraLivro(remoto: LivroRemoto): Livro {
  return {
    id: remoto.id,
    titulo: remoto.titulo,
    autor: remoto.autor,
    exemplares: remoto.exemplares,
    sinopse: remoto.sinopse ?? undefined,
  };
}

export class ErroDeRede extends Error {
  constructor() {
    super('Sem conexão com a rede');
    this.name = 'ErroDeRede';
    Object.setPrototypeOf(this, ErroDeRede.prototype);
  }
}

async function requisitar(caminho: string, metodo: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', corpo?: DadosNovoLivro): Promise<unknown> {
  const { url, chave } = configuracao();
  const controle = new AbortController();
  const prazo = setTimeout(() => controle.abort(), 6000);
  let resposta: Response;
  try {
    resposta = await fetch(`${url}/rest/v1/${caminho}`, {
      method: metodo,
      headers: { apikey: chave, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: controle.signal,
    });
  } catch {
    throw new ErroDeRede();
  } finally {
    clearTimeout(prazo);
  }

  if (!resposta.ok) {
    const mensagem = await lerMensagemDeErro(resposta);
    throw new ErroDaApi(resposta.status, mensagem);
  }

  if (resposta.status === 204) {
    return undefined;
  }

  return await resposta.json();
}

export async function carregarLivros(): Promise<Livro[]> {
  const corpo = await requisitar('livros?select=*&order=id', 'GET');
  if (!ehListaDeLivros(corpo)) {
    throw new Error('Resposta inesperada da API');
  }
  return corpo.map(paraLivro);
}

export async function buscarLivro(id: number): Promise<Livro | undefined> {
  const corpo = await requisitar(`livros?select=*&id=eq.${id}`, 'GET');
  if (!ehListaDeLivros(corpo)) {
    throw new Error('Resposta inesperada da API');
  }
  return corpo.map(paraLivro)[0];
}

export async function incluirLivro(dados: DadosNovoLivro): Promise<Livro> {
  const corpo = await requisitar('livros?select=*', 'POST', dados);
  if (!ehListaDeLivros(corpo) || corpo.length !== 1) {
    throw new Error('Resposta inesperada da API');
  }
  return paraLivro(corpo[0]);
}