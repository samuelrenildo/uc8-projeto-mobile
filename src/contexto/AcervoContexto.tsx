import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { carregarLivros, descreverErro, ErroDeRede, incluirLivro, type DadosNovoLivro } from '../servicos/acervo';
import {enfileirar, guardarLivro, guardarLivros, lerFila, lerLivrosGuardados, removerDaFila,type ItemDaFila } from '../servicos/banco';
import type { Livro } from '../types/entidades';

export type EstadoAcervo =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; livros: Livro[]; origem: 'nuvem' | 'aparelho' };

interface ValorDoAcervo {
  estado: EstadoAcervo;
  pendentes: number;
  recarregar: () => void;
  incluir: (dados: DadosNovoLivro) => Promise<void>;
  buscar: (id: number) => Livro | undefined;
}

const AcervoContexto = createContext<ValorDoAcervo | undefined>(undefined);

let enviando = false;

async function enviarFila(): Promise<void> {
  if (enviando) {
    return;
  }
  enviando = true;
  try {
    const itens = await lerFila();
    for (const item of itens) {
      await incluirLivro({ titulo: item.titulo, autor: item.autor, exemplares: item.exemplares });
      await removerDaFila(item.idFila);
    }
  } finally {
    enviando = false;
  }
}

function paraLivroPendente(item: ItemDaFila): Livro {
  return { id: -item.idFila, titulo: item.titulo, autor: item.autor, exemplares: item.exemplares };
}

export function AcervoProvedor({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoAcervo>({ tipo: 'carregando' });
  const [fila, setFila] = useState<ItemDaFila[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const execucao = useRef(0);

  const sincronizar = useCallback(async (silencioso: boolean) => {
    execucao.current += 1;
    const minha = execucao.current;
    if (!silencioso) {
      setEstado({ tipo: 'carregando' });
    }
    try {
      await enviarFila();
      const livros = await carregarLivros();
      await guardarLivros(livros);
      if (minha === execucao.current) {
        setEstado({ tipo: 'pronto', livros, origem: 'nuvem' });
      }
    } catch (erro) {
      if (!silencioso && minha === execucao.current) {
        const guardados = await lerLivrosGuardados();
        if (guardados.length > 0) {
          setEstado({ tipo: 'pronto', livros: guardados, origem: 'aparelho' });
        } else {
          setEstado({ tipo: 'erro', mensagem: descreverErro(erro) });
        }
      }
    }
    setFila(await lerFila());
  }, []);

  useEffect(() => {
    void sincronizar(false);
  }, [tentativa, sincronizar]);

  useEffect(() => {
    if (fila.length === 0) {
      return;
    }
    const intervalo = setInterval(() => {
      void sincronizar(true);
    }, 15000);
    return () => clearInterval(intervalo);
  }, [fila.length, sincronizar]);

  function recarregar() {
    setTentativa(tentativa + 1);
  }

  async function incluir(dados: DadosNovoLivro): Promise<void> {
    try {
      const novo = await incluirLivro(dados);
      await guardarLivro(novo);
      setEstado((atual) =>
        atual.tipo === 'pronto' ? { tipo: 'pronto', livros: [...atual.livros, novo], origem: 'nuvem' } : atual,
      );
    } catch (erro) {
      if (!(erro instanceof ErroDeRede)) {
        throw erro;
      }
      const item = await enfileirar(dados);
      setFila((atual) => [...atual, item]);
    }
  }

  const visivel: EstadoAcervo =
    estado.tipo === 'pronto' ? { ...estado, livros: [...estado.livros, ...fila.map(paraLivroPendente)] } : estado;

  function buscar(id: number): Livro | undefined {
    return visivel.tipo === 'pronto' ? visivel.livros.find((livro) => livro.id === id) : undefined;
  }

  return (
    <AcervoContexto.Provider value={{ estado: visivel, pendentes: fila.length, recarregar, incluir, buscar }}>
      {children}
    </AcervoContexto.Provider>
  );
}

export function useAcervo(): ValorDoAcervo {
  const valor = useContext(AcervoContexto);
  if (valor === undefined) {
    throw new Error('useAcervo deve ser usado dentro de um AcervoProvedor');
  }
  return valor;
}