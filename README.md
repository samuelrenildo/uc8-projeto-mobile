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