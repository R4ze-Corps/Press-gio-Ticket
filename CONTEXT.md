# 🌐 ECOSSISTEMA FARM — REGISTRO E LOG

**📋 Visão Geral**

Sistema inteligente para registro de farms com canais privados por membro, select menu de produtos, soma automática de quantidades em log central, finalização de ciclo e atribuição de cargo por meta concluída.

**⚙️ Comandos & Funcionamento**

`/farm` — Envia o painel interativo com o botão 🚜 Farm.

**🚜 Farm (Botão):** Abre um canal privado na categoria de farm com nome `⭐usuário` com acesso exclusivo do membro.

**Automação:** Se o membro receber o cargo <@&1501190054377295984>, um canal privado é criado automaticamente na categoria.

**📦 Dentro do Canal:**

- **🚜 Registrar Farm** → Abre um menu de seleção de produtos.
- **📊 Ver Entregas** → Mostra o progresso atual de cada produto do último farm.
- **💽 Finalizar** → Marca o farm como finalizado no log e registra data de término.
- **🔒 Fechar Canal** → Deleta o canal permanentemente.

**📮 Menu de Produtos**

Selecione o produto desejado e digite a quantidade no chat. O sistema acumula as quantidades no log central:

- Se o mesmo produto for registrado novamente → as quantidades são **somadas**.
- Se a meta for atingida → o produto é marcado como **Concluído ✅**.
- Se **todos** os produtos forem concluídos → o cargo <@&1502116529112748123> é atribuído automaticamente.

**📊 Log Central**

Cada membro possui **uma única mensagem de log** no canal de logs. O bot edita a mesma mensagem somando os registros:

```
🎯 REGISTRO DE FARM Diário 🎯
👤 MEMBRO: @user
🕒 Data/Hora: (Início: dd/mm - Atualizado: dd/mm)

📦 INVENTÁRIO / METAS
> 🔸 Ferro | 150/250 ⏳
> 🔸 Plástico | 250/250 ✅
> 🔸 Níquel | 0/250 ⏳

📊 Status: ⏳ Em andamento
📝 Notas: (Adicione observações aqui, se necessário)
```

**🎖️ Cargos de <@&1501190054377295984>**

Membros que obtêm este cargo ativam a criação automática de canal privado de farm.

**🚀 Como Usar**

No canal do painel, utilize o comando `/farm` e clique em **🚜 Farm**:

- Dentro do canal privado, clique em **🚜 Registrar Farm**
- Selecione o **produto** desejado no menu
- Digite a **quantidade** no chat
- Acompanhe seu progresso com **📊 Ver Entregas**
- Quando terminar, clique em **💽 Finalizar**
- Para fechar, clique em **🔒 Fechar Canal**

---

## Configurações (ConfigCentral.json)

```json
{
  "canallogfarm": "1501245398881275914",
  "categoriaFarm": "1501061030481231973",
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
  { value: "ferro", label: "Ferro", meta: 250 },
  { value: "plastico", label: "Polímero", meta: 250 },
  { value: "niquel", label: "Níquel", meta: 250 },
  { value: "carca_bateria", label: "Carça de Bateria", meta: 250 },
  { value: "tecido", label: "Tecido", meta: 250 },
];
```

## Responsáveis por Interações

| CustomId | Arquivo | Tipo | Ação |
|---|---|---|---|
| `farm-configurar` | botoes.ts | Button | Cria canal privado |
| `farm-registrar` | modal-button.ts | Button | Exibe menu de produtos |
| `select-produto` | select-produto.ts | StringSelectMenu | Coleta qty, envia/edita log |
| `farm-fechar_*` | fechar.ts | Button | Deleta canal |
| `farm-finalizar_*` | finalizar.ts | Button | Marca farm como finalizado |
| `farm-ver-entregas_*` | ver-entregas.ts | Button | Mostra progresso do farm |

## Estrutura de Arquivos

```
src/
  index.ts                              # Entry point, imports + eventos (auto-channel)
  discord/
    base/index.ts                       # Bootstrap: login, REST, interaction routing
    commands/public/
      farm.ts                           # /farm → container + botão 🚜 Farm
    responders/registro/
      botoes.ts                         # farm-configurar → cria canal privado
      modal-button.ts                   # farm-registrar → exibe select de produtos
      select-produto.ts                 # select-produto → coleta qty, envia/edita log
      fechar.ts                         # farm-fechar → deleta canal
      finalizar.ts                      # farm-finalizar → finaliza farm no log
      ver-entregas.ts                   # farm-ver-entregas → exibe progresso
      produtos.ts                       # Array de produtos (value, label, meta)
      storage.ts                        # Persistência farms.json
      modal.ts                          # Legacy (unused)
  functions/
    index.ts                            # Re-exports configCentral + logger
    logger.ts                           # Logger colorido no terminal
ConfigCentral.json                      # canallogfarm, categoriaFarm, cargos
data/farms.json                         # userId → {messageId, channelId}
Rules.One.md                            # Padrões do projeto
```

## Ambiente

- **Node.js**: v24.15.0
- **Discord.js**: v14.x
- **TypeScript**: ESNext modules
- **Import map**: `#base` → `src/discord/base`, `#functions` → `src/functions`
