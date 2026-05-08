import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { createContainer } from "@magicyan/discord";
import { configCentral } from "#functions";
import { getFarmEntry } from "./storage.js";

function localCreateResponder(cfg: any) { return cfg; }

export default localCreateResponder({
  customId: /^farm-finalizar_/,
  types: ["Button" as any],
  cache: "cached",
  async run(interaction: any) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.customId.split("_")[1];
        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        if (!member) {
            return await interaction.editReply({ content: "❌ Membro não encontrado." });
        }

        const entry = getFarmEntry(userId);
        const canalLogId = configCentral.canallogfarm;
        const canalLog = interaction.guild.channels.cache.get(canalLogId);

        if (entry && canalLog?.isTextBased()) {
            try {
                const logMessage = await canalLog.messages.fetch(entry.messageId);

                let textoAtual = "";
                if (logMessage.components?.length > 0) {
                    const row = logMessage.components[0] as any;
                    const containerData = row.components[0]?.data || row.components[0];
                    textoAtual = containerData.content || "";
                }

                const linhas = textoAtual.split("\n").map((l: string) => l.trim()).filter((l: string) => l !== "");
                const novasLinhas: string[] = [];
                const separator = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
                const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };
                const currentDate = new Date().toLocaleDateString("pt-BR", dateOptions);
                let startDate = currentDate;
                let finalDateString = "";

                for (const linha of linhas) {
                    if (linha.startsWith("📊 **Status:**") || linha.startsWith("📝 **Notas:**") || linha.startsWith("🕒 **Data/Hora:**")) {
                        continue;
                    }
                    novasLinhas.push(linha);
                }
                
                const dateMatchNew = textoAtual.match(/\(Início: (.+?) -/);
                const dateMatchOld = textoAtual.match(/🕒 \*\*Data\/Hora:\*\* (.+)/);

                if (dateMatchNew) {
                    startDate = dateMatchNew[1];
                } else if (dateMatchOld) {
                    startDate = dateMatchOld[1].split(" ")[0]; // Pega só a data se tiver mais texto
                }
                finalDateString = `(Início: ${startDate} - Finalizado: ${currentDate})`;
                
                // Recria as linhas na ordem correta
                const finalContent = [];
                finalContent.push(`🎯 **REGISTRO DE FARM Diário** 🎯`);
                finalContent.push(separator);
                finalContent.push(`👤 **Membro:** ${member.user}`);
                finalContent.push(`🕒 **Data/Hora:** ${finalDateString}`);

                const inventarioLines = novasLinhas.filter(l => !l.includes("REGISTRO") && !l.includes("Membro") && !l.includes(separator));
                finalContent.push(...inventarioLines);
                
                finalContent.push(`\n📊 **Status:** ✅ Finalizado`);
                finalContent.push(`📝 **Notas:** Farm finalizado pelo ${member.user}.`);
                finalContent.push(separator);

                const newLogContent = finalContent.join("\n");
                const logContainer = createContainer("#2b2d31", newLogContent);

                await logMessage.edit({
                    content: "",
                    components: [logContainer as any],
                });

                await interaction.editReply({ content: "✅ Farm marcado como finalizado com sucesso!"});

            } catch (err) {
                console.error("[FarmFinalizar] Erro ao finalizar farm:", err);
                await interaction.editReply({ content: "❌ Erro ao finalizar o farm. A mensagem de log original não foi encontrada." });
            }
        } else {
             await interaction.editReply({ content: "ℹ️ Nenhum registro de farm encontrado para ser finalizado." });
        }

    } catch (err) {
      console.error(`[FarmFinalizar] erro geral:`, err);
      await interaction.editReply({ content: "❌ Ocorreu um erro inesperado ao finalizar o farm." }).catch(()=>{});
    }
  }
});
