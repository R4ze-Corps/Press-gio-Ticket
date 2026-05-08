# CONTEXTO DO PROJETO - TICKET V3

## Objetivo
Bot Discord para registro de farms com sistema de canais privados, select menu de produtos, soma de quantidades e logs em container (v2 components).

## Fluxo Atual Funcionando
1. **`/farm`** → Envia container com botão azul "🚜 Farm"
2. **Botão "🚜 Farm"** → Cria canal privado na categoria `1501726104572919930` com nome `⭐ Nome | ID`
3. **Dentro do canal** → Container de boas-vindas com:
   - Botão "🚜 Registrar Farm" → Abre menu de produtos
   - Botão "🔒 Fechar Canal" → Deleta o canal
4. **Seleciona produto** → Bot pede quantidade no chat via collector
5. **Digita quantidade** → Envia log pro canal `canallogfarm` (ID: `1501726104719851566`)
6. **Log de farm** → Edita mensagem existente somando quantidades, ou cria nova

## Formato do Log (Staff Channel)
```
🎯 REGISTRO DE FARM
👤 MEMBRO: @user
📮 PRODUTOS:
Produto A | 3/10
Produto B | 1/10
```
- Se registrar mesmo produto → soma quantidade: `3/10` vira `4/10`
- Se registrar outro produto → adiciona nova linha
- Meta (X) configurável por produto

## Estrutura de Arquivos
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

## Configurações (ConfigCentral.json)
```json
{
  "canallogfarm": "1501726104719851566",    // Canal onde logs de farm são enviados
  "categoriaFarm": "1501726104572919930",   // Categoria onde canais privados são criados
  "cargos": {
    "aprovado": "ID_CARGO_APROVADO",
    "membroFarm": "ID_CARGO_MEMBRO_FARM",
    "temporario": "ID_CARGO_TEMPORARIO"
  }
}
```

## Produtos Configuráveis (produtos.ts)
```typescript
export const PRODUTOS = [
  { value: "produto_a", label: "Produto A", meta: 10 },
  { value: "produto_b", label: "Produto B", meta: 10 },
  { value: "produto_c", label: "Produto C", meta: 10 },
];
```
- **value**: identificador interno
- **label**: nome exibido no select menu e no log
- **meta**: meta/teto para a quantidade (ex: 10)

## Responsáveis por Interações
| CustomId | Arquivo | Tipo | Ação |
|---|---|---|---|
| `farm-configurar` | botoes.ts | Button | Cria canal privado |
| `farm-registrar` | modal-button.ts | Button | Exibe menu de produtos |
| `select-produto` | select-produto.ts | StringSelectMenu | Coleta qty, envia/edita log |
| `farm-fechar_*` | fechar.ts | Button | Deleta canal |

## Bootstrap (src/discord/base/index.ts)
- Gerencia login do Client via discord.js
- Registra slash commands via REST API no startup
- Roteia interações: `isChatInputCommand()`, `isButton()`, `isModalSubmit()`, `isStringSelectMenu()`
- Map de comandos (`commandMap`) e array de responders para matching de customId

## Formatação de Containers (Padrão do Projeto)
Todos os containers seguem:
```typescript
const container = createContainer(
  "#2b2d31",                // cor hex
  "texto markdown",          // conteúdo
  ...components              // botões, select menus, etc.
);
await channel.send({
  components: [container as any],
  flags: MessageFlags.IsComponentsV2,
});
```
- Import: `import { createContainer } from "@magicyan/discord"`
- Flags obrigatórias: `MessageFlags.IsComponentsV2`

## Storage (storage.ts)
- Arquivo: `data/farms.json`
- Estrutura: `{ "userId": { "messageId": "...", "channelId": "..." } }`
- Funções: `getFarmEntry(userId)`, `setFarmEntry(userId, entry)`
- Usado para encontrar a última mensagem de log de um usuário e editá-la

## Ambiente
- **Node.js**: v24.15.0
- **Discord.js**: v14.x
- **TypeScript**: ESNext modules
- **Import map**: `#base` → `src/discord/base`, `#functions` → `src/functions`
- **JSON imports**: `with { type: "json" }` (não `assert`)

## Pendências / TODO
- [ ] Configurar IDs reais de cargos no ConfigCentral.json
- [ ] Trocar `"ID_DO_TEU_SERVIDOR"` em `src/index.ts` pelo ID real do servidor
- [ ] Testar fluxo completo (criar canal → registrar → somar quantidades)
- [ ] Implementar aprovação/negação de registros (se necessário)
- [ ] Adicionar upload de imagem se o Discord suportar nativamente
