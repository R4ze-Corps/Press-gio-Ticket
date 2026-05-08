import { Command } from "#base";
import { ButtonBuilder, ButtonStyle, ApplicationCommandType, MessageFlags } from "discord.js";
import { createContainer } from "@magicyan/discord";

export default new Command({
  name: "setup-farm",
  description: "Cria o painel de registro de farm",
  type: ApplicationCommandType.ChatInput,
  async run(interaction: any) {
    try {
      const text = "## :tractor: Painel de Registro de Farm\nOlá, bem-vindo(a) à sua sala de farm!\n\n**Como registrar seu farm:**\n:one: Selecione o produto que você farmou.\n:two: Preencha a quantidade na janela que vai abrir.\n:three: Envie o print da entrega no chat e finalize.\n\n:abacus: Acompanhe seu progresso em tempo real.\n\n:dart: **Metas de Farm:**\n:package: Madeira | 0/1000"; 

      const container = createContainer(
        "#2b2d31",
        text,
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
      console.error(`[PainelFarm] erro:`, err);
      if (!interaction.replied) {
        await interaction.reply({ content: "Ocorreu um erro ao gerar o painel.", ephemeral: true });
      }
    }
  }
});
