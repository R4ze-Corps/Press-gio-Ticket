function localCreateResponder(cfg: any) { return cfg; }

export default localCreateResponder({
  customId: /^farm-fechar_/,
  types: ["Button" as any],
  cache: "cached",
  async run(interaction: any) {
    try {
      const channel = interaction.channel;
      if (!channel?.isTextBased()) return;

      await interaction.reply({ content: "🔒 Fechando canal...", ephemeral: true });
      await channel.delete();
      console.debug(`[FarmFechar] canal deletado por ${interaction.user.id}`);
    } catch (err) {
      console.error(`[FarmFechar] erro:`, err);
      if (!interaction.replied) {
        await interaction.reply({ content: "Erro ao fechar canal.", ephemeral: true });
      }
    }
  }
});
