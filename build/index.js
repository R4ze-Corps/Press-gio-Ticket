import "dotenv/config";
import { bootstrap } from "#base";
import { log } from "#functions";
import { Options, ChannelType } from "discord.js";
import farmCmd from "./discord/commands/public/farm.js";
import botoesFarm from "./discord/responders/registro/botoes.js";
import modalButton from "./discord/responders/registro/modal-button.js";
import fecharCanal from "./discord/responders/registro/fechar.js";
import finalizarCanal from "./discord/responders/registro/finalizar.js";
import verEntregas from "./discord/responders/registro/ver-entregas.js";
import selectProduto from "./discord/responders/registro/select-produto.js";
await bootstrap({
    clientOptions: {
        intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
        partials: ["Message", "Channel", "GuildMember"],
        makeCache: Options.cacheWithLimits({ MessageManager: 200 }),
    },
    commands: {
        guilds: ["1501726101783707792"],
    },
    slashCommands: [farmCmd],
    responders: [botoesFarm, modalButton, fecharCanal, finalizarCanal, verEntregas, selectProduto],
    async whenReady(client) {
        log.success("Bootstrap", `Online como ${client.user?.tag ?? "unknown"}`);
        client.on("guildMemberUpdate", async (oldMember, newMember) => {
            const roleId = "1501190054377295984";
            const categoryId = "1501061030481231973";
            const hadRole = oldMember.roles.cache.has(roleId);
            const hasRole = newMember.roles.cache.has(roleId);
            if (!hadRole && hasRole) {
                try {
                    const guild = newMember.guild;
                    const category = guild.channels.cache.get(categoryId);
                    if (!category || category.type !== ChannelType.GuildCategory) {
                        log.error("AutoChannel", `Categoria ${categoryId} não encontrada ou inválida.`);
                        return;
                    }
                    const sanitizedName = newMember.user.username.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
                    const channelName = `⭐${sanitizedName}`;
                    const existing = guild.channels.cache.find((c) => c.name === channelName && c.parentId === categoryId);
                    if (existing) {
                        log.info("AutoChannel", `Canal ${channelName} já existe.`);
                        return;
                    }
                    await guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: categoryId,
                        permissionOverwrites: [
                            { id: guild.id, deny: ["ViewChannel"] },
                            { id: newMember.id, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] },
                        ],
                    });
                    log.info("AutoChannel", `Canal criado para ${newMember.user.tag}: ${channelName}`);
                }
                catch (err) {
                    log.error("AutoChannel", "Erro ao criar canal:", err);
                }
            }
        });
        log.info("Bootstrap", `Ouvintes de eventos registrados. Bot pronto para operar.`);
    },
});
