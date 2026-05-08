import { ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import { createContainer } from "@magicyan/discord";
import { configCentral } from "#functions";

function localCreateResponder(cfg: any) { return cfg; }

export default localCreateResponder({
  customId: "modal-registro",
  types: ["ModalSubmit" as any],
  cache: "cached",
  async run(interaction: any) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const nomeProduto = interaction.fields.getTextInputValue("input-nome");
      const quantidade = interaction.fields.getTextInputValue("input-quantidade");
      const imagemUrl = interaction.fields.getTextInputValue("input-imagem");

      const canalRegistro = interaction.guild.channels.cache.get(configCentral.canallogfarm);
      
      if (!canalRegistro?.isTextBased()) {
        throw new Error("Canal de registro não configurado ou inválido.");
      }

      const textoStaff = `## Novo Registro Pendente\n**Usuário:** ${interaction.user}\n**Produto:** ${nomeProduto}\n**Quantidade:** ${quantidade}${imagemUrl ? `\n**Imagem:** ${imagemUrl}` : ""}`;

      const container = createContainer(
        "#2b2d31",
        textoStaff,
        new ButtonBuilder()
          .setCustomId(`approve-registro_${interaction.user.id}`)
          .setLabel("Aprovar")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`deny-registro_${interaction.user.id}`)
          .setLabel("Negar")
          .setStyle(ButtonStyle.Danger)
      );

      await canalRegistro.send({
        components: [container as any],
        flags: MessageFlags.IsComponentsV2,
      });

      await interaction.editReply({ content: "Seu registro foi enviado para análise!" });
      console.debug(`[ModalRegistro] registro enviado por: ${interaction.user.id}`);

    } catch (err) {
      console.error(`[ModalRegistro] erro:`, err);
      if ((interaction as any).deferred) {
        await interaction.editReply({ content: "Erro interno ao processar seu registro." });
      } else {
        await interaction.reply({ content: "Erro interno ao processar seu registro.", ephemeral: true });
      }
    }
  }
});
