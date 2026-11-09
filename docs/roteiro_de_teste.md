# Roteiro de teste - Biblioteca

Cada caso tem os passos, o resultado esperado e o resultado observado. A coluna "Onde" diz se o caso foi executado no aparelho ou no renderizador de teste (um programa que monta as telas sem celular). Um caso com falha ganha a correção e é executado de novo; a linha registra as duas execuções.

Legenda do resultado: **aprovado** (o observado é o esperado), **falha** (não é), **corrigido** (falhou, foi corrigido e aprovado na repetição), **não executado**.

| # | Caso | Passos | Esperado | Resultado | Onde e quando | Correção |
|---|---|---|---|---|---|---|
| C01 | Carga com rede | Abrir o aplicativo com rede | Lista com os livros da nuvem, sem aviso acima dela | aprovado | aparelho, 08/11/2026 | - |
| C02 | Cadastro válido | Novo livro; título e autor preenchidos; Adicionar | Volta à lista com o livro novo, sem nova leitura da nuvem | aprovado | aparelho, 08/11/2026 | - |
| C03 | Cadastro recusado pela nuvem | Trocar uma letra da chave publicável no `.env.local`; recarga completa; Novo livro; título e autor; Adicionar | `O servidor recusou a operação (401).` na tela de cadastro; linha `[cadastro] api: ErroDaApi 401: Invalid API key` no console | não executado | - | - |
| C04 | Exemplares inválido | Novo livro; exemplares `abc` | `Informe um número inteiro, zero ou maior` no campo; Adicionar desabilitado | aprovado | aparelho, 08/11/2026 | - |
| C05 | Carga sem rede, com cache | Carregar uma vez com rede; desligar a rede; fechar e abrir | Lista do aparelho com o aviso de origem acima dela | aprovado | aparelho, 08/11/2026 | - |
| C06 | Carga sem rede, sem cache | Instalação nova; sem rede; abrir | Tela de erro com `Sem conexão com o servidor. Verifique a rede e tente de novo.` | não executado | - | - |
| C07 | Cadastro sem rede | Sem rede; Novo livro; Adicionar | Linha `A enviar (1): ...` acima da lista; pendente guardado no aparelho | aprovado | aparelho, 08/11/2026 | - |
| C08 | Sincronização | Ligar a rede; Recarregar | A linha `A enviar` some; o livro está na lista; nenhum pendente no aparelho | aprovado | aparelho, 08/11/2026 | - |
| C09 | Detalhe | Tocar em "Ver detalhes" | Tela com os dados do livro, sem nova leitura da nuvem | aprovado | aparelho, 08/11/2026 | - |
| C10 | Contagem na tela Sobre | Aba Sobre depois de uma carga com rede | `Guardados no aparelho: N`, com N igual ao tamanho da lista | aprovado | aparelho, 08/11/2026 | - |
| C11 | Banco indisponível | Banco que não abre (simulado com o SQL de criação quebrado) | Lista da nuvem continua; Sobre mostra `indisponível`; registros `[...] banco:` no console | não executado | - | - |
| C12 | Voltar da pilha | Detalhe; botão de voltar do aparelho | Lista no mesmo estado, sem recarga | aprovado | aparelho, 08/11/2026 | - |
| C13 | Rotação da tela | Lista em pé e deitada | Uma coluna em pé, duas deitada (tela larga) | falha | aparelho, 08/11/2026 | O aplicativo não gira para a horizontal no aparelho (orientação travada em retrato) |