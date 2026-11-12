import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { guardarLocal, guardarPendente, listarLocal, listarPendentes, removerPendente, type Pendente } from '../banco/banco';
import { ErroDeValidacao, registrarErro } from '../erros/erros';
import { ErroDaApi, ErroDeRede, carregarLivros, incluirLivro, type DadosNovoLivro } from '../servicos/acervo';
import {
  atualizarAutorLivro,
  excluirLivro as servicoExcluirLivro,
  inicializarTabelasExtras,
  montarAcervo,
  registrarDevolucao,
  registrarEmprestimo,
} from '../data/bibliotecaService';
import { inicializarBanco } from '../data/database';
import type { Livro as LivroDoAcervo } from '../types/entidades';

export type Livro = LivroDoAcervo;

export interface NovoLivro {
  titulo: string;
  autor: string;
  isbn?: string;
  exemplares: number;
}

export type EstadoAcervo =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; livros: Livro[]; pendentes: Pendente[]; origem: 'nuvem' }
  | { tipo: 'pronto'; livros: Livro[]; pendentes: Pendente[]; origem: 'aparelho'; motivo: string };

interface ValorDoAcervo {
  estado: EstadoAcervo;
  livros: Livro[];
  recarregarAcervo: () => Promise<void>;
  buscarPorTermo: (termo: string) => Promise<Livro[]>;
  emprestarLivro: (idLivro: number, idLeitor: number) => Promise<void>;
  devolverLivro: (idLivro: number) => Promise<void>;
  atualizarAutor: (idLivro: number, novoAutor: string) => Promise<void>;
  excluirLivro: (idLivro: number) => Promise<void>;
  incluir: (dados: NovoLivro) => Promise<'nuvem' | 'pendente'>;
}

const AcervoContexto = createContext<ValorDoAcervo | undefined>(undefined);

async function prepararBanco(): Promise<void> {
  try {
    await inicializarBanco();
    await inicializarTabelasExtras();
  } catch (erro: unknown) {
    registrarErro('banco', erro);
  }
}

async function exibir(base: Livro[]): Promise<Livro[]> {
  try {
    return await montarAcervo(base);
  } catch (erro: unknown) {
    registrarErro('banco', erro);
    return base;
  }
}

async function pendentesAtuais(): Promise<Pendente[]> {
  return listarPendentes().catch((erro: unknown) => {
    registrarErro('pendentes', erro);
    return [];
  });
}

async function enviarPendentes(): Promise<void> {
  const pendentes = await pendentesAtuais();
  for (const pendente of pendentes) {
    try {
      await incluirLivro({ titulo: pendente.titulo, autor: pendente.autor, exemplares: pendente.exemplares });
    } catch (erro: unknown) {
      if (!(erro instanceof ErroDaApi)) {
        return;
      }
      registrarErro('pendente descartado', erro);
    }
    await removerPendente(pendente.id);
  }
}

export function AcervoProvedor({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoAcervo>({ tipo: 'carregando' });

  const recarregarLocal = async (): Promise<void> => {
    const base = await listarLocal();
    const pendentes = await pendentesAtuais();
    const livros = await exibir(base);
    setEstado((atual) => (atual.tipo === 'pronto' ? { ...atual, livros, pendentes } : atual));
  };

  const carregarAcervo = useCallback(async (): Promise<void> => {
    setEstado({ tipo: 'carregando' });
    await prepararBanco();

    try {
      await enviarPendentes();
    } catch (erro: unknown) {
      registrarErro('sincronizar', erro);
    }

    try {
      const base = await carregarLivros();
      await guardarLocal(base).catch((erro: unknown) => registrarErro('guardar no aparelho', erro));
      const livros = await exibir(base);
      const pendentes = await pendentesAtuais();
      setEstado({ tipo: 'pronto', livros, pendentes, origem: 'nuvem' });
    } catch (erro: unknown) {
      const { mensagem } = registrarErro('carga', erro);
      try {
        const base = await listarLocal();
        const pendentes = await pendentesAtuais();
        if (base.length === 0 && pendentes.length === 0) {
          setEstado({ tipo: 'erro', mensagem });
          return;
        }
        const livros = await exibir(base);
        setEstado({ tipo: 'pronto', livros, pendentes, origem: 'aparelho', motivo: mensagem });
      } catch (erroLocal: unknown) {
        setEstado({ tipo: 'erro', mensagem: registrarErro('leitura do aparelho', erroLocal).mensagem });
      }
    }
  }, []);

  useEffect(() => {
    carregarAcervo();
  }, [carregarAcervo]);

  const incluir = async (dados: NovoLivro): Promise<'nuvem' | 'pendente'> => {
    if (dados.titulo.trim() === '') {
      throw new ErroDeValidacao('Informe o título.');
    }
    if (!Number.isInteger(dados.exemplares) || dados.exemplares < 0) {
      throw new ErroDeValidacao('Exemplares precisa ser um número inteiro, zero ou maior.');
    }

    const novo: DadosNovoLivro = {
      titulo: dados.titulo.trim(),
      autor: dados.autor.trim(),
      exemplares: dados.exemplares,
    };

    let criado: Livro;
    try {
      criado = await incluirLivro(novo);
    } catch (erro: unknown) {
      if (!(erro instanceof ErroDeRede)) {
        throw erro;
      }
      await guardarPendente(novo);
      await recarregarLocal();
      return 'pendente';
    }

    try {
      const base = await listarLocal();
      await guardarLocal([...base, criado]);
    } catch (erro: unknown) {
      registrarErro('guardar no aparelho', erro);
    }
    await recarregarLocal();
    return 'nuvem';
  };

  const emprestarLivro = async (idLivro: number, idLeitor: number): Promise<void> => {
    const livro = estado.tipo === 'pronto' ? estado.livros.find((item) => item.id === idLivro) : undefined;
    if (livro === undefined) {
      throw new Error('Livro não encontrado.');
    }
    if (livro.exemplares <= 0) {
      throw new Error('Sem exemplares disponíveis para empréstimo.');
    }
    await registrarEmprestimo(idLivro, idLeitor);
    await recarregarLocal();
  };

  const devolverLivro = async (idLivro: number): Promise<void> => {
    await registrarDevolucao(idLivro);
    await recarregarLocal();
  };

  const atualizarAutor = async (idLivro: number, novoAutor: string): Promise<void> => {
    const nome = novoAutor.trim();
    if (!nome) {
      throw new ErroDeValidacao('Informe o nome do autor.');
    }
    await atualizarAutorLivro(idLivro, nome);
    await recarregarLocal();
  };

  const excluirLivro = async (idLivro: number): Promise<void> => {
    await servicoExcluirLivro(idLivro);
    await recarregarLocal();
  };

  const buscarPorTermo = async (termo: string): Promise<Livro[]> => {
    const lista = estado.tipo === 'pronto' ? estado.livros : [];
    const termoTratado = termo.trim().toLowerCase();
    if (!termoTratado) {
      return lista;
    }
    return lista.filter(
      (livro) => livro.titulo.toLowerCase().includes(termoTratado) || livro.autor.toLowerCase().includes(termoTratado)
    );
  };

  const livros = estado.tipo === 'pronto' ? estado.livros : [];

  const valor: ValorDoAcervo = {
    estado,
    livros,
    recarregarAcervo: carregarAcervo,
    buscarPorTermo,
    emprestarLivro,
    devolverLivro,
    atualizarAutor,
    excluirLivro,
    incluir,
  };

  return <AcervoContexto.Provider value={valor}>{children}</AcervoContexto.Provider>;
}

export const AcervoProvider = AcervoProvedor;

export function useAcervo(): ValorDoAcervo {
  const valor = useContext(AcervoContexto);
  if (valor === undefined) {
    throw new Error('useAcervo só funciona dentro de AcervoProvedor');
  }
  return valor;
}
