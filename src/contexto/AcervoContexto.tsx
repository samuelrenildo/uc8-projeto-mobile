import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { carregarLivros, descreverErro, incluirLivro, type DadosNovoLivro } from '../servicos/acervo';
import type { Livro } from '../types/entidades';


export type EstadoAcervo =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; livros: Livro[] };

interface ValorDoAcervo {
    estado: EstadoAcervo;
    recarregar: () => void;
    incluir: (dados: DadosNovoLivro) => Promise<Livro>;
    buscar: (id: number) => Promise<Livro | undefined>;
}

const AcervoContexto = createContext<ValorDoAcervo | undefined>(undefined);

export function AcervoProvedor({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoAcervo>({ tipo: 'carregando' });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setEstado({ tipo: 'carregando' });
    carregarLivros()
      .then((livros) => {
        if (!cancelado) {
          setEstado({ tipo: 'pronto', livros });
        }
      })
      .catch((erro: unknown) => {
        if (!cancelado) {
          setEstado({ tipo: 'erro', mensagem: descreverErro(erro) });
        }
      });
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  function recarregar() {
    setTentativa(tentativa + 1);
  }

  async function incluir(dados: DadosNovoLivro): Promise<Livro> {
    const novo = await incluirLivro(dados);
    setEstado((atual) => (atual.tipo === 'pronto' ? { tipo: 'pronto', livros: [...atual.livros, novo] } : atual));
    return novo;
  }

  function buscar(id: number): Promise<Livro | undefined> {
    return Promise.resolve(estado.tipo === 'pronto' ? estado.livros.find((livro) => livro.id === id) : undefined);
  }

  return <AcervoContexto.Provider value={{ estado, recarregar, incluir, buscar }}>{children}</AcervoContexto.Provider>;
}


export function useAcervo(): ValorDoAcervo {
    const valor = useContext(AcervoContexto);
    if (valor === undefined) {
        throw new Error('useAcervo deve ser usado dentro de um AcervoProvedor');
    }
    return valor;
}
