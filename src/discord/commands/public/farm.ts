import { Command } from "#base";
import { log } from "#functions";
import { ButtonBuilder, ButtonStyle, ApplicationCommandType, MessageFlags } from "discord.js";
import { createContainer } from "@magicyan/discord";

export default new Command({
  name: "farm",
  description: "Painel de Registro de Farm",
  type: ApplicationCommandType.ChatInput,
  async run(interaction: any) {
    try {
      const container = createContainer(
        "#2b2d31",
        "# 🚜 REGISTRAR FARM\n\n*Seja bem-vindo ao sistema de registrar farm, use o botão abaixo para abrir uma sala de farm.*",
        new ButtonBuilder()
          .setCustomId("farm-configurar")
          .setLabel("🚜 Farm")
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({
        components: [container as any],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (err) {
      log.error("FarmCommand", err);
      if (!interaction.replied) {
        await interaction.reply({ content: "Ocorreu um erro ao gerar o painel.", ephemeral: true });
      }
    }
  }
});
