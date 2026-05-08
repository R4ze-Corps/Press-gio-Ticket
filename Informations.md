# INFORMAÇÕES DO SISTEMA - TICKET V3

## 1. Visão Geral

O **Ticket V3** é um sistema avançado desenvolvido para Discord, projetado para gerenciar o registro de farms com uma interface moderna baseada em Components V2. O bot oferece um fluxo completo de criação de canais privados, seleção de produtos, registro de quantidades e geração de logs automatizados com soma inteligente de dados.

## 2. Funcionalidades Principais

### 2.1. Comandos Slash (/)

#### `/farm`
- **Descrição**: Comando principal de acesso ao sistema de farms.
- **Funcionamento**: Envia um container interativo contendo um botão azul intitulado "🚜 Farm".
- **Permissões**: Disponível para membros com os cargos configurados no sistema.

#### `/setup-farm`
- **Descrição**: Comando administrativo para configuração do painel de farms.
- **Funcionamento**: Disponibiliza o mesmo container do comando `/farm`, permitindo a configuração inicial do sistema.
- **Uso**: Restrito a administradores ou cargos autorizados.

#### `/registrar`
- **Descrição**: Comando direto para registro de farm via modal.
- **Funcionamento**: Abre um modal de registro imediato, sem necessidade de passar pelo fluxo de criação de canal privado.

### 2.2. Sistema de Canais Privados

O bot automatiza a criação e gerenciamento de canais privados para registro de farms:

- **Acionamento**: Por meio do botão "🚜 Farm" no container inicial.
- **Localização**: Canais são criados na categoria definida em `categoriaFarm` (ID: `1501726104572919930`).
- **Nomenclatura**: Seguem o padrão `⭐ Nome do Usuário | ID do Usuário`.
- **Permissões**: Acesso exclusivo do membro que acionou o botão e cargos administrativos.
- **Gerenciamento**: O canal permanece ativo até que o membro opte por fechá-lo manualmente.

### 2.3. Interface de Registro no Canal Privado

Após a criação do canal privado, o sistema envia um container de boas-vindas contendo:

- **Botão "🚜 Registrar Farm"**: Aciona a exibição do menu de seleção de produtos.
- **Botão "🔒 Fechar Canal"**: Permite ao membro encerrar e deletar o canal privado permanentemente.

### 2.4. Seleção de Produtos e Registro de Quantidade

O sistema utiliza um menu de seleção (StringSelectMenu) para registrar farmes:

1. **Seleção de Produto**: O membro escolhe um produto dentre os disponíveis no menu.
2. **Solicitação de Quantidade**: O bot solicita, via coletor de mensagens (collector), que o membro informe a quantidade colhida.
3. **Validação**: O sistema aceita apenas valores numéricos válidos dentro do limite estabelecido.

### 2.5. Sistema de Logs de Farm

O registro é enviado automaticamente para o canal de logs (`canallogfarm`, ID: `1501726104719851566`):

#### Formato do Log
```
🎯 REGISTRO DE FARM
👤 MEMBRO: @user
📮 PRODUTOS:
Produto A | 3/10
Produto B | 1/10
```

#### Funcionalidades do Log
- **Edição Inteligente**: Se o membro já possui um log aberto, o bot edita a mensagem existente somando as quantidades.
- **Adição de Produtos**: Novos produtos são adicionados como novas linhas no log.
- **Soma de Quantidades**: Registros do mesmo produto são somados automaticamente (ex: `3/10` evolui para `4/10`).
- **Metas Configuráveis**: Cada produto possui uma meta (teto) individual configurável no arquivo `produtos.ts`.

### 2.6. Armazenamento de Dados

O sistema mantém persistência através do arquivo `data/farms.json`:

- **Estrutura**: Mapeia `userId` para `{ messageId, channelId }`.
- **Finalidade**: Permite localizar a última mensagem de log de um usuário para edição de quantidades.
- **Funções Disponíveis**:
  - `getFarmEntry(userId)`: Recupera a entrada de farm de um usuário.
  - `setFarmEntry(userId, entry)`: Define ou atualiza a entrada de farm de um usuário.

### 2.7. Configurações Centrais (ConfigCentral.json)

O arquivo `ConfigCentral.json` centraliza todas as configurações do bot:

- **canallogfarm**: Canal onde os logs de farm são enviados.
- **categoriaFarm**: Categoria onde os canais privados são criados.
- **cargos**: Definição dos IDs dos cargos de:
  - `aprovado`: Cargo de membros aprovados.
  - `membroFarm`: Cargo de membros que realizam farms.
  - `temporario`: Cargo temporário (uso específico).

### 2.8. Gerenciamento de Interações

O sistema roteia interações via `src/discord/base/index.ts`:

| CustomId | Arquivo | Tipo | Ação |
|---|---|---|---|
| `farm-configurar` | botoes.ts | Button | Cria canal privado para o membro |
| `farm-registrar` | modal-button.ts | Button | Exibe o menu de seleção de produtos |
| `select-produto` | select-produto.ts | StringSelectMenu | Coleta quantidade e envia/edita log |
| `farm-fechar_*` | fechar.ts | Button | Deleta o canal privado permanentemente |

## 3. Produtos Configuráveis

Os produtos são definidos no arquivo `src/discord/responders/registro/produtos.ts`:

```typescript
export const PRODUTOS = [
  { value: "produto_a", label: "Produto A", meta: 10 },
  { value: "produto_b", label: "Produto B", meta: 10 },
  { value: "produto_c", label: "Produto C", meta: 10 },
];
```

- **value**: Identificador interno único do produto.
- **label**: Nome exibido no menu de seleção e no log.
- **meta**: Meta/teto máximo para a quantidade (ex: 10 unidades).

## 4. Padrão de Interface (Components V2)

Todos os containers seguem o padrão estabelecido pelo projeto:

```typescript
const container = createContainer(
  "#2b2d31",                // Cor hexadecimal do container
  "texto markdown",          // Conteúdo formatado
  ...components              // Botões, select menus, etc.
);
await channel.send({
  components: [container as any],
  flags: MessageFlags.IsComponentsV2,
});
```

- **Import**: `import { createContainer } from "@magicyan/discord"`
- **Flags Obrigatórias**: `MessageFlags.IsComponentsV2`

## 5. Estrutura de Arquivos

```
src/
  index.ts                              # Entry point, imports commands + responders
  discord/
    base/index.ts                       # Bootstrap: login, REST register, interaction routing
    commands/public/
      farm.ts                           # /farm slash command → container + button
      painel-farm.ts                    # /setup-farm command (same container)
      registrar.ts                      # /registrar command (direct modal)
    responders/registro/
      botoes.ts                         # farm-configurar → creates private channel
      modal-button.ts                   # farm-registrar → shows product select menu
      select-produto.ts                 # select-produto → asks qty, sends log (edit/sum)
      fechar.ts                         # farm-fechar → deletes channel
      produtos.ts                       # Shared: PRODUTOS array (value, label, meta)
      storage.ts                        # Farm message tracking (JSON file)
      modal.ts                          # Legacy modal handler (unused, kept for reference)
  functions/index.ts                    # Re-exports configCentral from ConfigCentral.json
ConfigCentral.json                      # Central config (canallogfarm, categoriaFarm, cargos)
data/farms.json                         # Persistent storage: userId → {messageId, channelId}
package.json                            # Scripts, deps, import maps for #base/#functions
tsconfig.json                           # Paths, outDir, resolveJsonModule
Rules.One.md                            # Project standards documentation
```

## 6. Ambiente de Execução

- **Node.js**: v24.15.0
- **Discord.js**: v14.x
- **TypeScript**: ESNext modules
- **Import Map**: 
  - `#base` → `src/discord/base`
  - `#functions` → `src/functions`
- **JSON Imports**: `with { type: "json" }`

## 7. Pendências e Melhorias Futuras

- [ ] Configurar IDs reais de cargos no ConfigCentral.json
- [ ] Trocar `"ID_DO_TEU_SERVIDOR"` em `src/index.ts` pelo ID real do servidor
- [ ] Testar fluxo completo (criar canal → registrar → somar quantidades)
- [ ] Implementar sistema de aprovação/negação de registros (se necessário)
- [ ] Adicionar suporte para upload de imagens (quando suportado nativamente pelo Discord)
