import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  listarLivros, 
  emprestarLivro as apiEmprestar, 
  devolverEmprestimoPorLivro as apiDevolver,
  inserirLivro as apiInserirLivro,
  cadastrarLeitor as apiCadastrarLeitor,
  listarLeitores as apiListarLeitores,
  atualizarAutorLivro as apiAtualizarAutor,
  buscarLivrosPorTermo as apiBuscarLivros,
  inicializarTabelasExtras,
  LeitorBD,
  LivroBD
} from '../data/bibliotecaService';
import { inicializarBanco } from '../data/database';

export type Livro = LivroBD;
export type Leitor = LeitorBD;

type EstadoAcervo = 
  | { tipo: 'carregando' }
  | { tipo: 'pronto'; livros: Livro[]; leitores: Leitor[] }
  | { tipo: 'erro'; mensagem: string };

interface AcervoContextoData {
  estado: EstadoAcervo;
  recarregarAcervo: () => Promise<void>;
  emprestarLivro: (idLivro: number, idLeitor: number) => Promise<void>;
  devolverLivro: (idLivro: number) => Promise<void>;
  buscar: (id: number) => Promise<Livro | null>;
  incluir: (novoLivro: Omit<Livro, 'id'>) => Promise<void>;
  cadastrarLeitor: (novoLeitor: { nome: string; matricula: string; telefone?: string; email?: string }) => Promise<void>;
  atualizarAutor: (idLivro: number, novoAutor: string) => Promise<void>;
  buscarPorTermo: (termo: string) => Promise<Livro[]>;
}

const AcervoContexto = createContext<AcervoContextoData>({} as AcervoContextoData);

export function AcervoProvedor({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoAcervo>({ tipo: 'carregando' });

  async function recarregarAcervo(): Promise<void> {
    try {
      await inicializarBanco();
      await inicializarTabelasExtras();
      const livros = await listarLivros();
      const leitores = await apiListarLeitores();
      setEstado({ tipo: 'pronto', livros, leitores });
    } catch (erro: unknown) {
      console.error(erro);
      setEstado({ tipo: 'erro', mensagem: 'Erro ao carregar os dados do sistema.' });
    }
  }

  useEffect(() => {
    recarregarAcervo();
  }, []);

  async function emprestarLivro(idLivro: number, idLeitor: number): Promise<void> {
    try {
      await apiEmprestar(idLivro, idLeitor);
      await recarregarAcervo();
    } catch (erro: unknown) {
      if (erro instanceof Error) throw new Error(erro.message);
      throw new Error('Erro ao realizar empréstimo.');
    }
  }

  async function devolverLivro(idLivro: number): Promise<void> {
    try {
      await apiDevolver(idLivro);
      await recarregarAcervo();
    } catch (erro: unknown) {
      if (erro instanceof Error) throw new Error(erro.message);
      throw new Error('Erro ao realizar devolução.');
    }
  }

  async function buscar(id: number): Promise<Livro | null> {
    if (estado.tipo === 'pronto') {
      const encontrado = estado.livros.find((l: Livro) => l.id === id);
      if (encontrado) return encontrado;
    }
    return null;
  }

  async function incluir(novoLivro: Omit<Livro, 'id'>): Promise<void> {
    try {
      await apiInserirLivro(novoLivro);
      await recarregarAcervo();
    } catch (erro: unknown) {
      if (erro instanceof Error) throw new Error(erro.message);
      throw new Error('Erro ao incluir livro.');
    }
  }

  async function cadastrarLeitor(novoLeitor: { nome: string; matricula: string; telefone?: string; email?: string }): Promise<void> {
    try {
      await apiCadastrarLeitor(novoLeitor);
      await recarregarAcervo();
    } catch (erro: unknown) {
      if (erro instanceof Error) throw new Error(erro.message);
      throw new Error('Erro ao cadastrar leitor (verifique se a matrícula já existe).');
    }
  }

  async function atualizarAutor(idLivro: number, novoAutor: string): Promise<void> {
    try {
      await apiAtualizarAutor(idLivro, novoAutor);
      await recarregarAcervo();
    } catch (erro: unknown) {
      if (erro instanceof Error) throw new Error(erro.message);
      throw new Error('Erro ao atualizar autor do livro.');
    }
  }

  async function buscarPorTermo(termo: string): Promise<Livro[]> {
    try {
      return await apiBuscarLivros(termo);
    } catch (erro: unknown) {
      console.error(erro);
      return [];
    }
  }

  return (
    <AcervoContexto.Provider 
      value={{ 
        estado, 
        recarregarAcervo, 
        emprestarLivro, 
        devolverLivro, 
        buscar, 
        incluir,
        cadastrarLeitor,
        atualizarAutor,
        buscarPorTermo
      }}
    >
      {children}
    </AcervoContexto.Provider>
  );
}

export function useAcervo(): AcervoContextoData {
  return useContext(AcervoContexto);
}