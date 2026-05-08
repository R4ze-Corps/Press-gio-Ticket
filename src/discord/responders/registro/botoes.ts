import { ActionRowBuilder, ChannelType, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import { createContainer } from "@magicyan/discord";
import { configCentral, log } from "#functions";
import { PRODUTOS } from "./produtos.js";

function localCreateResponder(cfg: any) { return cfg; }

export default localCreateResponder({
  customId: "farm-configurar",
  types: ["Button" as any],
  cache: "cached",
  async run(interaction: any) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const member = interaction.member;
      const displayName = member.displayName || member.user.username;
      const userId = member.id;

      const sanitized = displayName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      const categoryId = configCentral.categoriaFarm || "1501726104572919930";
      const category = interaction.guild.channels.cache.get(categoryId);
      if (!category || category.type !== ChannelType.GuildCategory) {
        throw new Error("Categoria de farm não encontrada ou inválida.");
      }

      const channelName = `⭐${sanitized}`;
      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        topic: `⭐ ${displayName} | ${userId}`,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: ["ViewChannel"] },
          { id: member.id, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] },
        ],
      });

      let metasTexto = "**🎯 Metas de Farm:**\n";
      for (const p of PRODUTOS) {
        metasTexto += `**📦 ${p.label}:** Meta ${p.meta}\n`;
      }

      const welcomeContent = `🚜 **Painel de Registro de Farm**\nOlá ${interaction.user}, bem-vindo(a) à sua sala de farm!\n\n**Como registrar seu farm:**\n1️⃣ Clique em Registrar Farm.\n2️⃣ Selecione o produto que você irá entregar.\n3️⃣ Digite a quantidade que deseja entregar.\n\n**Seu progresso pode ser visto em "Ver Entregas".**\n\n${metasTexto}`;

      const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId("farm-registrar").setLabel("🚜 Registrar Farm").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`farm-ver-entregas_${userId}`).setLabel("📊 Ver Entregas").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`farm-finalizar_${userId}`).setLabel("💽 Finalizar").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`farm-fechar_${userId}`).setLabel("🔒 Fechar Canal").setStyle(ButtonStyle.Danger)
      );

      const container = createContainer("#2b2d31", welcomeContent, buttonsRow as any);
      await channel.send({ components: [container as any], flags: MessageFlags.IsComponentsV2, });
      await interaction.editReply({ content: `Canal criado: ${channel}` });
      log.info("FarmConfig", `Canal criado para ${displayName} (${userId}): #${channel.name}`);

    } catch (err) {
      log.error("FarmConfig", err);
      if ((interaction as any).deferred) {
        await interaction.editReply({ content: "Erro ao criar canal de farm." });
      } else {
        await interaction.reply({ content: "Erro ao criar canal de farm.", ephemeral: true });
      }
    }
  }
});
