# Roteiro de teste - Biblioteca

Cada caso tem os passos, o resultado esperado e o resultado observado. A coluna "Onde" diz se o caso foi executado no aparelho ou no renderizador de teste (um programa que monta as telas sem celular). Um caso com falha ganha a correção e é executado de novo; a linha registra as duas execuções.

Legenda do resultado: **aprovado** (o observado é o esperado), **falha** (não é), **corrigido** (falhou, foi corrigido e aprovado na repetição), **não executado**.

| # | Caso | Passos | Esperado | Resultado | Onde e quando | Correção |
|---|---|---|---|---|---|---|
| C01 | Carga com rede | Abrir o aplicativo com rede | Lista com os livros da nuvem, sem aviso acima dela | aprovado | aparelho, 11/11/2026 | - |
| C02 | Cadastro válido | Novo livro; título e autor preenchidos; Adicionar | Volta à lista com o livro novo, sem nova leitura da nuvem | aprovado | aparelho, 11/11/2026 | - |
| C03 | Cadastro recusado pela nuvem | Trocar uma letra da chave publicável no `.env.local`; recarga completa; Novo livro; título e autor; Adicionar | `O servidor recusou a operação (401).` na tela de cadastro; linha `[cadastro] api: ErroDaApi 401: Invalid API key` no console | não executado | - | exige build com chave de API errada; não realizado por falta de tempo |
| C04 | Exemplares inválido | Novo livro; exemplares `abc` | `Informe um número inteiro, zero ou maior` no campo; Adicionar desabilitado | aprovado | aparelho, 08/11/2026 | - |
| C05 | Carga sem rede, com cache | Carregar uma vez com rede; desligar a rede; fechar e abrir | Lista do aparelho com o aviso de origem acima dela | aprovado | aparelho, 11/11/2026 | - |
| C06 | Carga sem rede, sem cache | Instalação nova; sem rede; abrir | Tela de erro com `Sem conexão com o servidor. Verifique a rede e tente de novo.` | aprovado | aparelho, 11/11/2026 | - |
| C07 | Cadastro sem rede | Sem rede; Novo livro; Adicionar | Linha `A enviar (1): ...` acima da lista; pendente guardado no aparelho | aprovado | aparelho, 11/11/2026 | - |
| C08 | Sincronização | Ligar a rede; Recarregar | A linha `A enviar` some; o livro está na lista; nenhum pendente no aparelho | aprovado | aparelho, 11/11/2026 | - |
| C09 | Detalhe | Tocar em "Ver detalhes" | Tela com os dados do livro, sem nova leitura da nuvem | aprovado | aparelho, 11/11/2026 | - |
| C10 | Contagem na tela Sobre | Aba Sobre depois de uma carga com rede | `Guardados no aparelho: N`, com N igual ao tamanho da lista | aprovado | aparelho, 11/11/2026 | - |
| C11 | Banco indisponível | Banco que não abre (simulado com o SQL de criação quebrado) | Lista da nuvem continua; Sobre mostra `indisponível`; registros `[...] banco:` no console | não executado | - | exige build com banco local quebrado; não realizado por falta de tempo |
| C12 | Voltar da pilha | Detalhe; botão de voltar do aparelho | Lista no mesmo estado, sem recarga | aprovado | aparelho, 08/11/2026 | - |
| C13 | Rotação da tela | Lista em pé e deitada | Uma coluna em pé, duas deitada (tela larga) | corrigido | aparelho, 08/11/2026 (falha); aparelho, 11/11/2026 (aprovado) | `orientation` de `portrait` para `default` no `app.json` |
| C14 | Cadastro de leitor | Aba Novo Leitor; nome e matrícula preenchidos; Cadastrar Leitor | `Leitor cadastrado com sucesso!`; o leitor aparece em "Leitores Cadastrados" | aprovado | aparelho, 11/11/2026 | - |
| C15 | Leitor sem dados obrigatórios | Aba Novo Leitor; nome vazio; Cadastrar Leitor | Aviso `Preencha pelo menos o Nome e a Matrícula do leitor.`; nada é gravado | aprovado | aparelho, 11/11/2026 | - |
| C16 | Empréstimo | Acervo; Emprestar em um livro com exemplares; escolher leitor | `Empréstimo realizado com sucesso!`; exemplares diminuem em 1 | não executado | - | - |
| C17 | Empréstimo sem exemplares | Acervo; Emprestar em um livro com 0 exemplares | Aviso `Sem exemplares disponíveis para empréstimo.` | não executado | - | - |
| C18 | Devolução | Acervo; Devolver em um livro emprestado | `Livro devolvido com sucesso!`; exemplares aumentam em 1 | não executado | - | - |
| C19 | Busca | Aba Pesquisar Livros; digitar parte do título ou do autor | Só os livros que contêm o termo aparecem | não executado | - | - |
| C20 | Atualizar autor | Detalhe; Editar nome do autor; novo nome; Salvar | `Autor atualizado com sucesso!`; o novo nome aparece no detalhe e na lista | não executado | - | - |
| C21 | Autor vazio | Detalhe; Editar nome do autor; apagar o nome; Salvar | Aviso `Informe o nome do autor.`; o autor não muda | aprovado | aparelho, 11/11/2026 | - |
| C22 | Excluir livro | Detalhe; Excluir livro; confirmar | `Livro excluído com sucesso!`; volta à lista sem o livro | não executado | - | - |
| C23 | Excluir livro emprestado | Emprestar um livro; Detalhe; Excluir livro; confirmar | Aviso de empréstimo ativo; o livro continua na lista | não executado | - | - |
| C24 | Excluir leitor com empréstimo | Leitor com empréstimo ativo; lixeira; Excluir | Aviso de empréstimos ativos; o leitor continua na lista | aprovado | aparelho, 11/11/2026 | - |