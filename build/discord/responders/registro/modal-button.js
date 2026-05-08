import { StringSelectMenuBuilder, MessageFlags } from "discord.js";
import { createContainer } from "@magicyan/discord";
import { PRODUTOS } from "./produtos.js";
function localCreateResponder(cfg) { return cfg; }
export default localCreateResponder({
    customId: "farm-registrar",
    types: ["Button"],
    cache: "cached",
    async run(interaction) {
        try {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("select-produto")
                .setPlaceholder("Selecione um produto")
                .addOptions(PRODUTOS.map((p) => ({ label: p.label, value: p.value })));
            const container = createContainer("#2b2d31", "## Selecione o Produto", selectMenu);
            // Tornando a resposta efêmera para não poluir o canal
            await interaction.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true
            });
        }
        catch (err) {
            console.error(`[FarmRegistrar] erro:`, err);
        }
    }
});
