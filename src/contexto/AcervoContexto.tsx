import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { guardarLocal, guardarPendente, listarLocal, listarPendentes, removerPendente, type Pendente } from '../banco/banco';
import { ErroDeValidacao, registrarErro } from '../erros/erros';
import { ErroDaApi, carregarLivros, incluirLivro, type DadosNovoLivro } from '../servicos/acervo';
import type { Livro } from '../types/entidades';

export type EstadoAcervo =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; livros: Livro[]; pendentes: Pendente[]; origem: 'nuvem' }
  | { tipo: 'pronto'; livros: Livro[]; pendentes: Pendente[]; origem: 'aparelho'; motivo: string };

interface ValorDoAcervo {
  estado: EstadoAcervo;
  recarregar: () => void;
  incluir: (dados: DadosNovoLivro) => Promise<void>;
  buscar: (id: number) => Livro | undefined;
}

const AcervoContexto = createContext<ValorDoAcervo | undefined>(undefined);

export function AcervoProvedor({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoAcervo>({ tipo: 'carregando' });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setEstado({ tipo: 'carregando' });
    sincronizar()
      .catch((erro: unknown) => {
        registrarErro('sincronizar', erro);
      })
      .then(() => carregarLivros())
      .then(async (livros) => {
        const pendentes = await listarPendentes().catch((erro: unknown) => {
          registrarErro('pendentes', erro);
          return [];
        });
        if (!cancelado) {
          setEstado({ tipo: 'pronto', livros, pendentes, origem: 'nuvem' });
        }
        guardarLocal(livros).catch((erro: unknown) => {
          registrarErro('guardar no aparelho', erro);
        });
      })
      .catch((erro: unknown) => {
        const motivo = registrarErro('carga', erro).mensagem;
        Promise.all([listarLocal(), listarPendentes()])
          .then(([guardados, pendentes]) => {
            if (cancelado) {
              return;
            }
            if (guardados.length > 0 || pendentes.length > 0) {
              setEstado({ tipo: 'pronto', livros: guardados, pendentes, origem: 'aparelho', motivo });
            } else {
              setEstado({ tipo: 'erro', mensagem: motivo });
            }
          })
          .catch((erroLocal: unknown) => {
            if (!cancelado) {
              setEstado({ tipo: 'erro', mensagem: registrarErro('leitura do aparelho', erroLocal).mensagem });
            }
          });
      });
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  function recarregar() {
    setTentativa(tentativa + 1);
  }

  async function sincronizar(): Promise<void> {
    for (const pendente of await listarPendentes()) {
      try {
        await incluirLivro({ titulo: pendente.titulo, autor: pendente.autor, exemplares: pendente.exemplares });
      } catch (erro: unknown) {
        if (erro instanceof ErroDaApi) {
          registrarErro('pendente descartado', erro);
        } else {
          return;
        }
      }
      await removerPendente(pendente.id);
    }
  }

  async function incluir(dados: DadosNovoLivro): Promise<void> {
    if (dados.titulo.trim() === '') {
      throw new ErroDeValidacao('Informe o título.');
    }
    if (!Number.isInteger(dados.exemplares) || dados.exemplares < 0) {
      throw new ErroDeValidacao('Exemplares precisa ser um número inteiro, zero ou maior.');
    }
    try {
      const novo = await incluirLivro(dados);
      setEstado((atual) => (atual.tipo === 'pronto' ? { ...atual, livros: [...atual.livros, novo] } : atual));
    } catch (erro: unknown) {
      if (erro instanceof ErroDaApi) {
        throw erro;
      }
      const pendente = await guardarPendente(dados);
      setEstado((atual) => (atual.tipo === 'pronto' ? { ...atual, pendentes: [...atual.pendentes, pendente] } : atual));
    }
  }

  function buscar(id: number): Livro | undefined {
    return estado.tipo === 'pronto' ? estado.livros.find((livro) => livro.id === id) : undefined;
  }

  return <AcervoContexto.Provider value={{ estado, recarregar, incluir, buscar }}>{children}</AcervoContexto.Provider>;
}

export function useAcervo(): ValorDoAcervo {
  const valor = useContext(AcervoContexto);
  if (valor === undefined) {
    throw new Error('useAcervo só funciona dentro de AcervoProvedor');
  }
  return valor;
}