import { StringSelectMenuBuilder, MessageFlags } from "discord.js";
import { createContainer } from "@magicyan/discord";
import { PRODUTOS } from "./produtos.js";

function localCreateResponder(cfg: any) { return cfg; }

export default localCreateResponder({
  customId: "farm-registrar",
  types: ["Button" as any],
  cache: "cached",
  async run(interaction: any) {
    try {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("select-produto")
        .setPlaceholder("Selecione um produto")
        .addOptions(
          PRODUTOS.map((p) => ({ label: p.label, value: p.value }))
        );

      const container = createContainer(
        "#2b2d31",
        "## Selecione o Produto",
        selectMenu
      );

      // Tornando a resposta efêmera para não poluir o canal
      await interaction.reply({
        components: [container as any],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true
      });
    } catch (err) {
      console.error(`[FarmRegistrar] erro:`, err);
    }
  }
});
