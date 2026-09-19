export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  sinopse?: string;
  exemplares: number;
}

export interface Leitor {
  id: number;
  nome: string;
  email: string;
}

export type SituacaoEmprestimo = 'aberto' | 'devolvido';

export interface Emprestimo {
  id: number;
  livroId: number;
  leitorId: number;
  dataEmprestimo: string;
  dataDevolucao?: string;
  situacao: SituacaoEmprestimo;
}