## Sistema de origem
Sistema de Empréstimo de Livros (UC5), desenvolvido em Electron + TypeScript + PostgreSQL.

## Entidades
- **Livro**: id, titulo, autor, sinopse, exemplares
- **Leitor**: id, nome, email
- **Emprestimo**: id, livroId, leitorId, dataEmprestimo, dataDevolucao, situacao

## Telas 
1. Lista de livros — mostra todos os livros e disponibilidade.
2. Detalhes do livro — informações completas e botão de emprestar.
3. Lista de leitores — leitores cadastrados.
4. Novo empréstimo — formulário para registrar um empréstimo.
5. Histórico de empréstimos — empréstimos ativos e devolvidos.

## O que fica de fora
Relatórios administrativos e o cadastro de novos livros ficam fora do aplicativo mobile.

## Navegação

| Tela | Onde fica | Aberta por | Parâmetro |
|---|---|---|---|
| Acervo | Pilha do acervo, na aba Acervo | Aba Acervo | Nenhum |
| Detalhe do livro | Pilha do acervo | Toque num livro do acervo | id do livro |
| Novo livro | Pilha do acervo | Botão "Novo livro" na tela do acervo | Nenhum |
| Busca | Aba Busca | Aba Busca | Nenhum |
| Sobre | Aba Sobre | Aba Sobre | Nenhum |

Acervo, Busca e Sobre são abas porque são seções do aplicativo, acessíveis de qualquer ponto; Detalhe do livro e Novo livro são rotas de pilha porque se abrem a partir do Acervo e voltam para ele.