import { Command } from "#base";
import { ApplicationCommandType, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
export default new Command({
    name: "registrar",
    description: "Abre o formulário de registro de Farm (via modal)",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        try {
            const modal = new ModalBuilder({
                customId: "modal-registro",
                title: "Registro de Farm"
            });
            const inputNome = new ActionRowBuilder().addComponents(new TextInputBuilder({
                customId: "input-nome",
                label: "NOME DO PRODUTO",
                style: TextInputStyle.Short,
                required: true
            }));
            const inputQuantidade = new ActionRowBuilder().addComponents(new TextInputBuilder({
                customId: "input-quantidade",
                label: "QUANTIDADE",
                style: TextInputStyle.Short,
                required: true
            }));
            modal.addComponents(inputNome, inputQuantidade);
            await interaction.showModal(modal);
            console.debug(`[FarmRegistrar] modal aberto por: ${interaction.user.id}`);
        }
        catch (err) {
            console.error(`[FarmRegistrar] erro:`, err);
            await interaction.reply({ content: "Erro ao abrir o formulário.", ephemeral: true });
        }
    }
});
