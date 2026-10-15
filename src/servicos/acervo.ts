import type { Livro } from '../types/entidades';
import type { DadosLivro } from '../componentes/FormularioLivro';

let acervo: Livro[] = [
  { id: 1, titulo: 'O Alquimista', autor: 'Paulo Coelho', sinopse: 'Um pastor busca seu tesouro seguindo os sinais do destino.', exemplares: 3 },
  { id: 2, titulo: '1984', autor: 'George Orwell', exemplares: 1 },
];

export function carregarLivros(): Promise<Livro[]> {
  return new Promise((resolver) => {
    setTimeout(() => resolver(acervo), 800);
  });
}

export function buscarLivro(id: number): Promise<Livro | undefined> {
  return new Promise((resolver) => {
    setTimeout(() => resolver(acervo.find((livro) => livro.id === id)), 400);
  });
}

export function adicionarLivro(dados: DadosLivro): Livro {
  const proximoId = acervo.reduce((maior, atual) => Math.max(maior, atual.id), 0) + 1;
  const novo: Livro = { id: proximoId, ...dados };
  acervo = [novo, ...acervo];
  return novo;
}