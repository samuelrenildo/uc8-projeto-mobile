import { ErroDaApi, ErroDeRede } from '../servicos/acervo';

export type TipoDeErro = 'rede' | 'api' | 'banco' | 'validacao' | 'desconhecido';

export interface ErroClassificado {
  tipo: TipoDeErro;
  mensagem: string;
  detalhe: string;
}

export class ErroDeValidacao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroDeValidacao';
    Object.setPrototypeOf(this, ErroDeValidacao.prototype);
  }
}

export class ErroDoBanco extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroDoBanco';
    Object.setPrototypeOf(this, ErroDoBanco.prototype);
  }
}

export function classificarErro(erro: unknown): ErroClassificado {
  if (erro instanceof ErroDeValidacao) {
    return { tipo: 'validacao', mensagem: erro.message, detalhe: `${erro.name}: ${erro.message}` };
  }
  if (erro instanceof ErroDaApi) {
    return {
      tipo: 'api',
      mensagem: `O servidor recusou a operação (${erro.status}).`,
      detalhe: `${erro.name} ${erro.status}: ${erro.message}`,
    };
  }
  if (erro instanceof ErroDoBanco) {
    return {
      tipo: 'banco',
      mensagem: 'Não foi possível ler ou guardar os dados no aparelho.',
      detalhe: `${erro.name}: ${erro.message}`,
    };
  }
  if (erro instanceof ErroDeRede || (erro instanceof TypeError && erro.message === 'Network request failed')) {
    return {
      tipo: 'rede',
      mensagem: 'Sem conexão com o servidor. Verifique a rede e tente de novo.',
      detalhe: `${erro.name}: ${erro.message}`,
    };
  }
  if (erro instanceof Error) {
    return { tipo: 'desconhecido', mensagem: 'Algo deu errado. Tente de novo.', detalhe: `${erro.name}: ${erro.message}` };
  }
  return { tipo: 'desconhecido', mensagem: 'Algo deu errado. Tente de novo.', detalhe: String(erro) };
}

export function registrarErro(origem: string, erro: unknown): ErroClassificado {
  const classificado = classificarErro(erro);
  console.error(`[${origem}] ${classificado.tipo}: ${classificado.detalhe}`);
  return classificado;
}