function localCreateResponder(cfg: any) { return cfg; }

export default localCreateResponder({
  customId: /^farm-fechar_/,
  types: ["Button" as any],
  cache: "cached",
  async run(interaction: any) {
    try {
      const allowedRoles = ["1500609714214670387", "1500609737732133055"];
      const memberRoles = interaction.member.roles.cache;
      const hasPermission = allowedRoles.some((id: string) => memberRoles.has(id));
      if (!hasPermission) {
        return await interaction.reply({ content: "❌ Você não tem permissão para usar este botão.", ephemeral: true });
      }

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
