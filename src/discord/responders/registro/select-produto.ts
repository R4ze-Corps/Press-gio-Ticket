import { MessageFlags, Collection, Message, EmbedBuilder } from "discord.js";
import { configCentral } from "#functions";
import { PRODUTOS, getProduto } from "./produtos.js";
import { getFarmEntry, setFarmEntry } from "./storage.js";

function localCreateResponder(cfg: any) {
  return cfg;
}

export default localCreateResponder({
  customId: "select-produto",
  types: ["StringSelectMenu" as any],
  cache: "cached",
  async run(interaction: any) {
    try {
      await interaction.deferUpdate();

      const produto = getProduto(interaction.values[0]);
      if (!produto) {
        await interaction.followUp({ content: "Produto inválido.", ephemeral: true });
        return;
      }

      const askMsg = await interaction.channel.send(`**${produto.label}**: Por favor, digite a quantidade que deseja registrar.`);

      const filter = (msg: Message) => msg.author.id === interaction.user.id;
      const collectorQtd = interaction.channel.createMessageCollector({
        filter,
        max: 1,
        time: 120_000,
      });

      collectorQtd.on("collect", async (messageQtd: Message) => {
        try {
          const quantidade = parseInt(messageQtd.content);
          if (isNaN(quantidade) || quantidade <= 0) {
            const reply = await messageQtd.reply("Quantidade inválida. Use apenas números.");
            setTimeout(() => reply.delete().catch(() => {}), 5000);
            return;
          }

          await processarLog(interaction, produto, quantidade);
          
          await messageQtd.delete().catch(() => {});
          await askMsg.delete().catch(() => {});

        } catch (err) {
          console.error(`[SelectProduto/collectQtd] erro:`, err);
        }
      });
      
      collectorQtd.on("end", async (collected: Collection<string, Message>, reason: string) => {
        if (reason === "time") {
            await askMsg.edit("⏰ Tempo esgotado para registrar a entrega.").catch(()=>{});
            setTimeout(() => askMsg.delete().catch(() => {}), 10000);
        }
      });

      async function processarLog(interaction: any, produto: any, quantidade: number) {
        const canalLog = interaction.guild.channels.cache.get(configCentral.canallogfarm);
        if (!canalLog?.isTextBased()) return;

        const userId = interaction.user.id;
        const entry = getFarmEntry(userId);
        let mensagemExistente: any = null;

        if (entry && entry.channelId === canalLog.id) {
          try {
            const fetchedMessage = await canalLog.messages.fetch(entry.messageId);
            
            let textoAtual = "";
            if (fetchedMessage.embeds && fetchedMessage.embeds.length > 0) {
                textoAtual = fetchedMessage.embeds[0].description || "";
            } else if (fetchedMessage.components?.length > 0) {
                const row = fetchedMessage.components[0] as any;
                const containerData = row.components[0]?.data || row.components[0];
                textoAtual = containerData.content || "";
            }
            
            if (textoAtual.includes("Status:** ✅ Finalizado")) {
                mensagemExistente = null; 
            } else {
                mensagemExistente = fetchedMessage;
            }
          } catch {
            mensagemExistente = null;
          }
        }

        const meta = produto.meta;
        const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };
        const currentDate = new Date().toLocaleDateString("pt-BR", dateOptions);
        const separator = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

        if (mensagemExistente) {
          let textoAtual = "";
           if (mensagemExistente.embeds && mensagemExistente.embeds.length > 0) {
              textoAtual = mensagemExistente.embeds[0].description || "";
            } else if (mensagemExistente.components?.length > 0) {
              const row = mensagemExistente.components[0] as any;
              const containerData = row.components[0]?.data || row.components[0];
              textoAtual = containerData.content || "";
            }

          const linhas = textoAtual.split("\n").map((l: string) => l.trim()).filter((l: string) => l !== "");
          let produtoAtualizado = false;
          let totalConcluidos = 0;
          let totalProdutos = 0;
          let notaExistente = "(Adicione observações aqui, se necessário)";
          let dateString = `🕒 **Data/Hora:** ${currentDate}`;

          const dateMatchNew = textoAtual.match(/\(Início: (.+?) -/);
          const dateMatchOld = textoAtual.match(/🕒 \*\*Data\/Hora:\*\* (.+)/);

          if (dateMatchNew) {
              dateString = `🕒 **Data/Hora:** (Início: ${dateMatchNew[1]} - Atualizado: ${currentDate})`;
          } else if (dateMatchOld) {
              const startDate = dateMatchOld[1].split(" ")[0];
              dateString = `🕒 **Data/Hora:** (Início: ${startDate} - Atualizado: ${currentDate})`;
          }
          
          const productLines: string[] = [];
          let memberLine = `👤 **Membro:** ${interaction.user}`;
          for (const linha of linhas) {
              if (linha.startsWith("👤 **Membro:**")) memberLine = linha;

              const matchProduto = linha.match(/^> 🔸 (.+?) \| `(.+?)`$/);
              if (matchProduto) {
                  totalProdutos++;
                  const nomeProduto = matchProduto[1];
                  const statusTexto = matchProduto[2];
                  if (nomeProduto === produto.label) {
                      let novaQtd = quantidade;
                      const qtdMatch = statusTexto.match(/^(\d+)\/(\d+)/);
                      if (qtdMatch) novaQtd += parseInt(qtdMatch[1]);
                      if (novaQtd === meta) {
                          productLines.push(`> 🔸 ${produto.label} | \`Concluído ✅\``);
                          totalConcluidos++;
                      } else if (novaQtd > meta) {
                          productLines.push(`> 🔸 ${produto.label} | \`${novaQtd}/${meta}\``);
                      } else {
                          productLines.push(`> 🔸 ${produto.label} | \`${novaQtd}/${meta} ⏳\``);
                      }
                      produtoAtualizado = true;
                  } else {
                      productLines.push(linha);
                      if (statusTexto.includes("Concluído")) totalConcluidos++;
                  }
              }
              const notaMatch = linha.match(/^📝 \*\*Notas:\*\* (.*)$/);
              if (notaMatch) notaExistente = notaMatch[1];
          }

          if (!produtoAtualizado) {
            totalProdutos++;
            if (quantidade === meta) {
              productLines.push(`> 🔸 ${produto.label} | \`Concluído ✅\``);
              totalConcluidos++;
            } else if (quantidade > meta) {
              productLines.push(`> 🔸 ${produto.label} | \`${quantidade}/${meta}\``);
            } else {
              productLines.push(`> 🔸 ${produto.label} | \`${quantidade}/${meta} ⏳\``);
            }
          }

          const todosConcluidos = totalConcluidos === totalProdutos && totalProdutos > 0;
          const statusGeral = todosConcluidos ? "✅ Finalizado" : "⏳ Em andamento";

          if (todosConcluidos) {
            const roleId = "1502116529112748123";
            try {
                const member = await interaction.guild.members.fetch(interaction.user.id);
                if (!member.roles.cache.has(roleId)) {
                    await member.roles.add(roleId);
                    console.log(`[MetaConcluida] Cargo ${roleId} adicionado para ${member.user.tag}`);
                }
            } catch (err) {
                console.error(`[MetaConcluida] Erro ao adicionar cargo ${roleId}:`, err);
            }
          }
          
          const finalContent: string[] = [];
          finalContent.push(`🎯 **REGISTRO DE FARM Diário** 🎯`);
          finalContent.push(separator);
          finalContent.push(memberLine);
          finalContent.push(dateString);
          finalContent.push(`\n📦 **INVENTÁRIO / METAS**`);
          finalContent.push(...productLines);
          finalContent.push(`\n📊 **Status:** ${statusGeral}`);
          finalContent.push(`📝 **Notas:** ${notaExistente}`);
          finalContent.push(separator);

          const embed = new EmbedBuilder().setColor(0x2b2d31).setDescription(finalContent.join("\n"));
          await mensagemExistente.edit({ embeds: [embed], components: [] });

        } else {
          const statusInicial = quantidade === meta ? "Concluído ✅" : quantidade > meta ? `${quantidade}/${meta}` : `${quantidade}/${meta} ⏳`;
          const statusGeral = quantidade >= meta ? "✅ Finalizado" : "⏳ Em andamento";
          const observacaoPadrao = "(Adicione observações aqui, se necessário)";
          const staffContent = `🎯 **REGISTRO DE FARM Diário** 🎯\n${separator}\n👤 **Membro:** ${interaction.user}\n🕒 **Data/Hora:** ${currentDate}\n\n📦 **INVENTÁRIO / METAS**\n> 🔸 ${produto.label} | \`${statusInicial}\`\n\n📊 **Status:** ${statusGeral}\n📝 **Notas:** ${observacaoPadrao}\n${separator}`;
          
          const embed = new EmbedBuilder().setColor(0x2b2d31).setDescription(staffContent);
          const novaMensagem = await canalLog.send({ embeds: [embed] });
          setFarmEntry(userId, { messageId: novaMensagem.id, channelId: canalLog.id });
        }
      }
    } catch (err) {
      console.error(`[SelectProduto] erro:`, err);
    }
  },
});
