import { Client, GatewayIntentBits, Partials, REST, Routes } from "discord.js";
import { log } from "#functions";
export async function bootstrap(opts) {
    const clientOptions = opts.clientOptions || {};
    const rawIntents = clientOptions.intents || [];
    const rawPartials = clientOptions.partials || [];
    const makeCache = clientOptions.makeCache;
    const intents = rawIntents.map((i) => {
        if (typeof i === "number")
            return i;
        if (typeof i === "string") {
            switch (i) {
                case "Guilds": return GatewayIntentBits.Guilds;
                case "GuildMembers": return GatewayIntentBits.GuildMembers;
                case "GuildMessages": return GatewayIntentBits.GuildMessages;
                case "MessageContent": return GatewayIntentBits.MessageContent;
                default: return i;
            }
        }
        return i;
    });
    const partials = rawPartials.map((p) => {
        if (typeof p === "string") {
            switch (p) {
                case "Message": return Partials.Message;
                case "Channel": return Partials.Channel;
                case "GuildMember": return Partials.GuildMember;
                default: return p;
            }
        }
        return p;
    });
    const client = new Client({ intents, partials, makeCache });
    const commandMap = new Map();
    if (opts.slashCommands) {
        for (const cmd of opts.slashCommands) {
            commandMap.set(cmd.name, cmd);
        }
    }
    client.on("interactionCreate", async (interaction) => {
        if (interaction.isChatInputCommand()) {
            log.system("Handler", `Comando /${interaction.commandName} recebido por ${interaction.user.username}`);
            const cmd = commandMap.get(interaction.commandName);
            if (cmd?.run) {
                try {
                    await cmd.run(interaction);
                }
                catch (err) {
                    log.error(`Command /${interaction.commandName}`, err);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: "Erro interno ao executar o comando.", ephemeral: true });
                    }
                }
            }
            else {
                log.warn("Handler", `Comando /${interaction.commandName} não encontrado.`);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: "Comando não encontrado.", ephemeral: true });
                }
            }
            return;
        }
        if (interaction.isButton() || interaction.isModalSubmit() || interaction.isStringSelectMenu()) {
            const customId = interaction.customId;
            log.system("Handler", `Interação ${interaction.type} [${customId}] recebida por ${interaction.user.username}`);
            for (const responder of opts.responders ?? []) {
                const match = typeof responder.customId === "string"
                    ? responder.customId === customId
                    : responder.customId.test(customId);
                if (match) {
                    try {
                        await responder.run(interaction);
                    }
                    catch (err) {
                        log.error(`Responder [${customId}]`, err);
                    }
                    return;
                }
            }
            log.warn("Handler", `Nenhum responder encontrado para: ${customId}`);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: "Ação não reconhecida.", ephemeral: true });
            }
        }
    });
    const token = process.env.DISCORD_TOKEN ?? "";
    log.info("Bootstrap", `DISCORD_TOKEN fornecido: ${token.length > 0}`);
    client.on("error", (err) => log.error("ClientError", err));
    client.on("warn", (w) => log.warn("ClientWarn", w));
    if (token) {
        try {
            log.info("Bootstrap", "Tentando login no Discord...");
            await client.login(token);
            if (opts.slashCommands && opts.slashCommands.length > 0) {
                const rest = new REST({ version: "10" }).setToken(token);
                const payload = opts.slashCommands.map((cmd) => ({
                    name: cmd.name,
                    description: cmd.description ?? "",
                    type: cmd.type ?? 1,
                }));
                const guildId = opts.commands?.guilds?.[0];
                if (guildId) {
                    await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: payload });
                    log.info("Commands", `${payload.length} slash commands registrados no servidor ${guildId}`);
                }
                else {
                    await rest.put(Routes.applicationCommands(client.user.id), { body: payload });
                    log.info("Commands", `${payload.length} global slash commands registrados`);
                }
            }
        }
        catch (err) {
            log.error("Bootstrap", "Falha no login:", err);
        }
    }
    else {
        log.warn("Bootstrap", "DISCORD_TOKEN não está definido. O bot não fará login.");
    }
    client.once("ready", async () => {
        if (typeof opts.whenReady === "function") {
            await opts.whenReady(client);
        }
    });
    return client;
}
export class Command {
    name = "";
    description;
    type;
    run;
    constructor(opts) {
        Object.assign(this, opts);
    }
}
export { bootstrap as default };
