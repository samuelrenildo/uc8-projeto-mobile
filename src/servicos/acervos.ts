import type { Livro } from '../types/entidades';


const acervo: Livro[] = [
    { id: 1, titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', sinopse: 'Uma épica aventura de fantasia que segue a jornada de Frodo Bolseiro para destruir o Um Anel.', exemplares: 5 },
    { id: 2, titulo: '1984', autor: 'George Orwell', exemplares: 1 },
];


export function carregarLivros(): Promise<Livro[]> {
    return new Promise((resolver) => {
        setTimeout(() => resolver(acervo), 800);
    });
}