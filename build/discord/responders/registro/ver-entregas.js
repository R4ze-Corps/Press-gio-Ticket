import { EmbedBuilder } from "discord.js";
import { configCentral } from "#functions";
import { PRODUTOS } from "./produtos.js";
import { getFarmEntry } from "./storage.js";
function localCreateResponder(cfg) { return cfg; }
export default localCreateResponder({
    customId: /^farm-ver-entregas_/,
    types: ["Button"],
    cache: "cached",
    async run(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const userId = interaction.customId.split("_")[1];
            const entry = getFarmEntry(userId);
            const canalLogId = configCentral.canallogfarm;
            const canalLog = interaction.guild.channels.cache.get(canalLogId);
            let progressoTexto = "Nenhum registro de farm encontrado.";
            let statusTexto = "";
            let notasTexto = "";
            let textoLogCentral = "";
            if (entry && canalLog?.isTextBased()) {
                try {
                    const msgLog = await canalLog.messages.fetch(entry.messageId);
                    // Verifica se a mensagem é um embed (novo formato) ou um container (formato antigo)
                    if (msgLog.embeds && msgLog.embeds.length > 0) {
                        textoLogCentral = msgLog.embeds[0].description || "";
                    }
                    else if (msgLog.components?.length > 0) {
                        const row = msgLog.components[0];
                        const containerData = row.components[0]?.data || row.components[0];
                        textoLogCentral = containerData.content || "";
                    }
                }
                catch {
                    textoLogCentral = "";
                }
            }
            if (textoLogCentral) {
                progressoTexto = "";
                for (const p of PRODUTOS) {
                    let atual = 0;
                    const regex = new RegExp(`> 🔸 ${p.label} \\| \`(\\d+)\/\\d+ ⏳\``);
                    const match = textoLogCentral.match(regex);
                    if (match) {
                        atual = parseInt(match[1]);
                    }
                    else if (textoLogCentral.includes(`> 🔸 ${p.label} | \`Concluído ✅\``)) {
                        atual = p.meta;
                    }
                    progressoTexto += `**📦 ${p.label}:** ${atual}/${p.meta}\n`;
                }
                const statusMatch = textoLogCentral.match(/📊 \*\*Status:\*\* (.+)/);
                if (statusMatch)
                    statusTexto = statusMatch[1];
                const notasMatch = textoLogCentral.match(/📝 \*\*Notas:\*\* (.+)/);
                if (notasMatch)
                    notasTexto = notasMatch[1];
            }
            let finalMessage = `📊 **Progresso do Seu Último Farm**\n\n${progressoTexto}`;
            if (statusTexto) {
                finalMessage += `\n**Status:** ${statusTexto}`;
            }
            if (notasTexto) {
                finalMessage += `\n**Notas:** ${notasTexto}`;
            }
            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setDescription(finalMessage);
            await interaction.editReply({
                embeds: [embed],
            });
        }
        catch (err) {
            console.error(`[VerEntregas] erro:`, err);
            await interaction.editReply({ content: "Ocorreu um erro ao buscar suas entregas." }).catch(() => { });
        }
    }
});
