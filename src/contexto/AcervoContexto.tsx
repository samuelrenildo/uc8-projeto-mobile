import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { listarLivros as obterLivros, emprestarLivro as servicoEmprestar, devolverEmprestimoPorLivro as servicoDevolver, inserirLivro as servicoInserirLivro, atualizarAutorLivro as servicoAtualizarAutor, excluirLivro as servicoExcluirLivro, inicializarTabelasExtras, type LivroBD } from '../data/bibliotecaService';
import { inicializarBanco } from '../data/database';
import { ErroDeValidacao, registrarErro } from '../erros/erros';

export type Livro = LivroBD;

interface EstadoAcervo {
  tipo: 'carregando' | 'sucesso' | 'erro';
  mensagem?: string;
  livros: LivroBD[];
}

interface AcervoContextData {
  livros: LivroBD[];
  estado: EstadoAcervo;
  recarregarAcervo: () => Promise<void>;
  buscarPorTermo: (termo: string) => Promise<LivroBD[]>;
  emprestarLivro: (idLivro: number, idLeitor: number) => Promise<void>;
  devolverLivro: (idLivro: number) => Promise<void>;
  atualizarAutor: (idLivro: number, novoAutor: string) => Promise<void>;
  excluirLivro: (idLivro: number) => Promise<void>;
  incluir: (
    dados: { titulo: string; autor: string; isbn?: string; exemplares: number } | string, 
    autor?: string, 
    isbn?: string, 
    exemplares?: number
  ) => Promise<void>;
}


const AcervoContexto = createContext<AcervoContextData>({} as AcervoContextData);

interface AcervoProviderProps {
  children: ReactNode;
}

export function AcervoProvider({ children }: AcervoProviderProps) {
  const [livros, setLivros] = useState<LivroBD[]>([]);
  const [estado, setEstado] = useState<EstadoAcervo>({
    tipo: 'carregando',
    livros: [],
  });

  const recarregarAcervo = useCallback(async (): Promise<void> => {
    try {
      setEstado((antigo) => ({ ...antigo, tipo: 'carregando' }));
      const dados = await obterLivros();
      const lista = dados ?? [];
      setLivros(lista);
      setEstado({ tipo: 'sucesso', livros: lista });
    } catch (erro: unknown) {
      const mensagem = registrarErro('carga', erro).mensagem;
      setEstado({ tipo: 'erro', mensagem, livros: [] });
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await inicializarBanco();
        await inicializarTabelasExtras();
      } catch (erro: unknown) {
        const mensagem = registrarErro('inicializacao do banco', erro).mensagem;
        setEstado({ tipo: 'erro', mensagem, livros: [] });
        return;
      }
      await recarregarAcervo();
    })();
  }, [recarregarAcervo]);

  const buscarPorTermo = async (termo: string): Promise<LivroBD[]> => {
    const termoTratado = termo.trim().toLowerCase();
    if (!termoTratado) return livros;

    try {
      const todosLivros = await obterLivros();
      return (todosLivros ?? []).filter(
        (livro: LivroBD) =>
          livro.titulo.toLowerCase().includes(termoTratado) ||
          (livro.autor && livro.autor.toLowerCase().includes(termoTratado))
      );
    } catch (erro: unknown) {
      registrarErro('busca', erro);
      return [];
    }
  };

  const emprestarLivro = async (idLivro: number, idLeitor: number): Promise<void> => {
    await servicoEmprestar(idLivro, idLeitor);
    await recarregarAcervo();
  };

  const devolverLivro = async (idLivro: number): Promise<void> => {
    await servicoDevolver(idLivro);
    await recarregarAcervo();
  };

  const atualizarAutor = async (idLivro: number, novoAutor: string): Promise<void> => {
    const nome = novoAutor.trim();
    if (!nome) {
      throw new ErroDeValidacao('Informe o nome do autor.');
    }
    await servicoAtualizarAutor(idLivro, nome);
    await recarregarAcervo();
  };

  const excluirLivro = async (idLivro: number): Promise<void> => {
    await servicoExcluirLivro(idLivro);
    await recarregarAcervo();
  };

  const incluir = async (
    tituloOuObj: { titulo: string; autor: string; isbn?: string; exemplares: number } | string, 
    autorStr?: string, 
    isbnStr?: string, 
    exemplaresNum?: number
  ): Promise<void> => {
    const dados =
      typeof tituloOuObj === 'object' && tituloOuObj !== null
        ? { titulo: tituloOuObj.titulo, autor: tituloOuObj.autor, isbn: tituloOuObj.isbn ?? '', exemplares: tituloOuObj.exemplares }
        : { titulo: tituloOuObj, autor: autorStr ?? '', isbn: isbnStr ?? '', exemplares: exemplaresNum ?? 1 };

    if (dados.titulo.trim() === '') {
      throw new ErroDeValidacao('Informe o título.');
    }
    if (!Number.isInteger(dados.exemplares) || dados.exemplares < 0) {
      throw new ErroDeValidacao('Exemplares precisa ser um número inteiro, zero ou maior.');
    }

    await servicoInserirLivro({ ...dados, titulo: dados.titulo.trim() });
    await recarregarAcervo();
  };

  return (
    <AcervoContexto.Provider 
      value={{ 
        livros, 
        estado, 
        recarregarAcervo, 
        buscarPorTermo, 
        emprestarLivro, 
        devolverLivro,
        atualizarAutor,
        excluirLivro,
        incluir
      }}
    >
      {children}
    </AcervoContexto.Provider>
  );
}

export function useAcervo(): AcervoContextData {
  const contexto = useContext(AcervoContexto);
  if (!contexto) {
    throw new Error('useAcervo deve ser usado dentro de um AcervoProvider');
  }
  return contexto;
}

export const AcervoProvedor = AcervoProvider;